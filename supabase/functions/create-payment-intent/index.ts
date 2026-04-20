import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BookingPayload {
  listing_id: string;
  slots_count: number;
  buyer_name: string;
  buyer_email: string;
  buyer_company: string;
  buyer_website?: string;
  buyer_phone?: string;
  buyer_country: string;
  buyer_country_code: string;
  buyer_vat_number?: string;
  purchase_type: "business" | "individual";
  vat_rate: number;
  vat_reverse_charge: boolean;
  vat_applies: boolean;
  campaign_note?: string;
  brand_name?: string;
}

function generateReference(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).toUpperCase().slice(2, 7);
  return `ETW-${year}-${rand}`;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: "Server not configured" }, 500);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const jwtToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    const payload = (await req.json()) as BookingPayload;

    const required = ["listing_id", "buyer_email", "buyer_country", "buyer_country_code"] as const;
    for (const k of required) {
      if (!payload[k] || String(payload[k]).trim() === "") {
        return json({ error: `Missing field: ${k}` }, 400);
      }
    }

    const slotsCount = Math.max(1, Math.floor(Number(payload.slots_count) || 1));
    const vatRate = Math.max(0, Math.min(0.5, Number(payload.vat_rate) || 0));
    const vatApplies = Boolean(payload.vat_applies);
    const reverseCharge = Boolean(payload.vat_reverse_charge);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    let buyerUserId: string | null = null;
    if (jwtToken) {
      const { data: { user } } = await supabase.auth.getUser(jwtToken);
      if (user) buyerUserId = user.id;
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, discounted_price, property_name, media_owner_name, slots_remaining, status, seller_email, seller_phone, seller_website")
      .eq("id", payload.listing_id)
      .maybeSingle();

    if (listingError || !listing) {
      return json({ error: "Listing not found" }, 404);
    }

    if (!["live", "securing"].includes(listing.status)) {
      return json({ error: "Listing is not available for booking" }, 409);
    }

    if (listing.slots_remaining < slotsCount) {
      return json({ error: "Not enough slots remaining" }, 409);
    }

    const totalPrice = listing.discounted_price * slotsCount;
    const depositSubtotal = Math.round(totalPrice * 0.05);
    const vatAmount = vatApplies && !reverseCharge ? Math.round(depositSubtotal * vatRate) : 0;
    const depositTotal = depositSubtotal + vatAmount;
    const balanceAmount = totalPrice - depositSubtotal;
    const amountInCents = depositTotal * 100;

    if (amountInCents < 50) {
      return json({ error: "Deposit too small" }, 400);
    }

    const referenceNumber = generateReference();

    const effectiveBuyerName =
      (payload.buyer_name && payload.buyer_name.trim()) ||
      (payload.buyer_company && payload.buyer_company.trim()) ||
      payload.buyer_email;
    const effectiveBuyerCompany =
      payload.purchase_type === "business"
        ? (payload.buyer_company?.trim() || effectiveBuyerName)
        : effectiveBuyerName;

    const params = new URLSearchParams({
      amount: String(amountInCents),
      currency: "usd",
      "automatic_payment_methods[enabled]": "true",
    });
    params.append("metadata[reference_number]", referenceNumber);
    params.append("metadata[listing_id]", listing.id);
    params.append("metadata[property_name]", listing.property_name);
    params.append("metadata[buyer_email]", payload.buyer_email);
    params.append("metadata[slots_count]", String(slotsCount));

    const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const pi = await stripeRes.json();
    if (!stripeRes.ok) {
      return json({ error: pi.error?.message ?? "Stripe error" }, 400);
    }

    const bookingRow = {
      reference_number: referenceNumber,
      listing_id: listing.id,
      buyer_name: effectiveBuyerName,
      buyer_email: payload.buyer_email,
      buyer_company: effectiveBuyerCompany,
      buyer_website: payload.buyer_website ?? "",
      buyer_phone: payload.buyer_phone ?? "",
      buyer_country: payload.buyer_country,
      buyer_user_id: buyerUserId,
      message_to_creator: payload.campaign_note ?? "",
      booking_notes: `Brand: ${payload.brand_name || effectiveBuyerName}. VAT: ${payload.buyer_vat_number || "N/A"}`,
      slots_count: slotsCount,
      price_per_slot: listing.discounted_price,
      total_price: totalPrice,
      deposit_amount: depositTotal,
      balance_amount: balanceAmount,
      stripe_payment_intent_id: pi.id,
      stripe_charge_id: "",
      payment_status: "pending",
      status: "pending_payment",
      seller_name: listing.media_owner_name,
      seller_email: listing.seller_email ?? "",
      seller_phone: listing.seller_phone ?? "",
      seller_website: listing.seller_website ?? "",
    };

    const { data: booking, error: insertError } = await supabase
      .from("deposit_bookings")
      .insert(bookingRow)
      .select()
      .maybeSingle();

    if (insertError || !booking) {
      return json({ error: insertError?.message ?? "Failed to create booking" }, 500);
    }

    return json({
      client_secret: pi.client_secret,
      payment_intent_id: pi.id,
      reference_number: referenceNumber,
      booking_id: booking.id,
      deposit_total_cents: amountInCents,
    });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
