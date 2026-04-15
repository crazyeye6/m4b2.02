import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing required environment variables" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const targetEmail: string | undefined = body.email;

    const { data: listings, error: listingsError } = await supabase
      .from("listings")
      .select("id,media_type,property_name,media_owner_name,location,original_price,discounted_price,date_label,audience,slots_remaining,deadline_at")
      .eq("status", "live")
      .gt("deadline_at", new Date().toISOString())
      .order("deadline_at", { ascending: true })
      .limit(12);

    if (listingsError || !listings || listings.length === 0) {
      return new Response(
        JSON.stringify({ message: "No live listings available for digest" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: buyers, error: buyersError } = await supabase
      .from("user_profiles")
      .select("id,display_name,role")
      .eq("role", "buyer");

    if (buyersError || !buyers || buyers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No buyers found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const buyerIds = buyers.map((b: { id: string }) => b.id);
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const emailMap: Record<string, string> = {};
    if (authUsers?.users) {
      for (const u of authUsers.users) {
        if (u.email && buyerIds.includes(u.id)) {
          emailMap[u.id] = u.email;
        }
      }
    }

    const sendDigestEmail = async (to: string, name: string, listingSubset: typeof listings) => {
      const emailUrl = `${SUPABASE_URL}/functions/v1/send-email`;
      await fetch(emailUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "opportunity_digest",
          to,
          data: {
            buyer_name: name,
            listings: listingSubset,
          },
        }),
      });
    };

    let sentCount = 0;

    if (targetEmail) {
      const buyer = buyers.find((b: { id: string; display_name: string }) => emailMap[b.id] === targetEmail);
      const name = buyer?.display_name || "there";
      await sendDigestEmail(targetEmail, name, listings.slice(0, 6));
      sentCount = 1;
    } else {
      for (const buyer of buyers as Array<{ id: string; display_name: string }>) {
        const email = emailMap[buyer.id];
        if (!email) continue;
        await sendDigestEmail(email, buyer.display_name || "there", listings.slice(0, 6));
        sentCount++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, listings_count: listings.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
