import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature",
};

async function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
  toleranceSeconds = 300,
): Promise<boolean> {
  try {
    const parts = Object.fromEntries(
      header.split(",").map((p) => {
        const [k, v] = p.split("=");
        return [k.trim(), v];
      }),
    ) as Record<string, string>;
    const timestamp = parts["t"];
    const signature = parts["v1"];
    if (!timestamp || !signature) return false;

    const nowSec = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSec - Number(timestamp)) > toleranceSeconds) return false;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(`${timestamp}.${payload}`));
    const computed = Array.from(new Uint8Array(sigBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    if (computed.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < computed.length; i++) {
      diff |= computed.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

async function sendBookingEmails(
  supabaseUrl: string,
  serviceRoleKey: string,
  bookingId: string,
) {
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const { data: booking } = await supabase
    .from("deposit_bookings")
    .select(`
      *,
      listing:listings(
        property_name, media_owner_name, date_label, slot_type,
        seller_email, seller_phone, seller_website, media_type
      )
    `)
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) return;

  const listing = booking.listing as Record<string, unknown> | null;
  const emailUrl = `${supabaseUrl}/functions/v1/send-email`;
  const headers = {
    "Authorization": `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };

  const sharedData = {
    reference_number: booking.reference_number,
    property_name: listing?.property_name ?? "—",
    media_owner_name: listing?.media_owner_name ?? "—",
    date_label: listing?.date_label ?? "—",
    slot_type: listing?.slot_type ?? "—",
    deposit_amount: booking.deposit_amount,
    balance_amount: booking.balance_amount,
    total_price: booking.total_price,
    seller_name: listing?.media_owner_name ?? "—",
    seller_email: listing?.seller_email ?? "",
    seller_phone: listing?.seller_phone ?? "",
    seller_website: listing?.seller_website ?? "",
    buyer_name: booking.buyer_name,
    buyer_email: booking.buyer_email,
    buyer_company: booking.buyer_company,
    buyer_phone: booking.buyer_phone ?? "",
    buyer_website: booking.buyer_website ?? "",
    buyer_country: booking.buyer_country,
    message_to_creator: booking.message_to_creator ?? "",
  };

  await Promise.allSettled([
    fetch(emailUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        type: "booking_confirmation_buyer",
        to: booking.buyer_email,
        data: sharedData,
      }),
    }),
    listing?.seller_email
      ? fetch(emailUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            type: "booking_confirmation_seller",
            to: String(listing.seller_email),
            data: sharedData,
          }),
        })
      : Promise.resolve(),
  ]);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature") ?? "";

    if (!STRIPE_WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ok = await verifyStripeSignature(rawBody, signature, STRIPE_WEBHOOK_SECRET);
    if (!ok) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(rawBody);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const type = event.type as string;
    const obj = event.data?.object ?? {};
    const paymentIntentId: string | undefined = obj.id ?? obj.payment_intent;

    if (!paymentIntentId) {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: booking } = await supabase
      .from("deposit_bookings")
      .select("id, listing_id, slots_count, payment_status, status")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();

    if (!booking) {
      return new Response(JSON.stringify({ received: true, ignored: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "payment_intent.succeeded") {
      const chargeId: string = obj.latest_charge ?? "";

      if (booking.payment_status !== "paid") {
        await supabase
          .from("deposit_bookings")
          .update({
            payment_status: "paid",
            status: "secured",
            stripe_charge_id: chargeId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", booking.id);

        const { data: listing } = await supabase
          .from("listings")
          .select("slots_remaining")
          .eq("id", booking.listing_id)
          .maybeSingle();

        if (listing) {
          const remaining = Math.max(0, (listing.slots_remaining ?? 0) - booking.slots_count);
          await supabase
            .from("listings")
            .update({
              slots_remaining: remaining,
              status: remaining === 0 ? "secured" : "securing",
            })
            .eq("id", booking.listing_id);
        }

        EdgeRuntime.waitUntil(
          sendBookingEmails(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, booking.id)
        );
      }
    } else if (type === "payment_intent.payment_failed") {
      await supabase
        .from("deposit_bookings")
        .update({
          payment_status: "failed",
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);
    } else if (type === "charge.refunded") {
      await supabase
        .from("deposit_bookings")
        .update({
          payment_status: "refunded",
          status: "refunded",
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
