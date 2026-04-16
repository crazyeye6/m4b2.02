import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BuyerProfile {
  id: string;
  display_name: string;
  digest_enabled: boolean;
  digest_frequency: "daily" | "weekly";
  digest_media_types: string[];
  digest_locations: string[];
  digest_tags: string[];
  digest_last_sent_at: string | null;
}

interface Listing {
  id: string;
  media_type: string;
  property_name: string;
  media_owner_name: string;
  location: string;
  original_price: number;
  discounted_price: number;
  date_label: string;
  audience: string;
  slots_remaining: number;
  deadline_at: string;
  tags?: Array<{ tag: { name: string } }>;
}

function shouldSendToday(buyer: BuyerProfile): boolean {
  if (!buyer.digest_enabled) return false;

  const now = new Date();
  const lastSent = buyer.digest_last_sent_at ? new Date(buyer.digest_last_sent_at) : null;

  if (!lastSent) return true;

  if (buyer.digest_frequency === "daily") {
    const hoursSince = (now.getTime() - lastSent.getTime()) / 1000 / 60 / 60;
    return hoursSince >= 23;
  }

  const daysSince = (now.getTime() - lastSent.getTime()) / 1000 / 60 / 60 / 24;
  return daysSince >= 6;
}

function scoreListingForBuyer(listing: Listing, buyer: BuyerProfile): number {
  let score = 0;

  if (buyer.digest_media_types.length > 0) {
    if (buyer.digest_media_types.includes(listing.media_type)) score += 10;
    else return -1;
  }

  if (buyer.digest_locations.length > 0) {
    const loc = listing.location?.toLowerCase() || "";
    const matched = buyer.digest_locations.some(dl => loc.includes(dl.toLowerCase()) || dl.toLowerCase() === "global");
    if (matched) score += 5;
    else if (!buyer.digest_locations.includes("Global")) return -1;
  }

  if (buyer.digest_tags.length > 0 && listing.tags && listing.tags.length > 0) {
    const listingTagNames = listing.tags.map(t => t.tag?.name?.toLowerCase() || "");
    const matchedTags = buyer.digest_tags.filter(bt =>
      listingTagNames.some(lt => lt.includes(bt.toLowerCase()) || bt.toLowerCase().includes(lt))
    );
    score += matchedTags.length * 3;
  }

  return score;
}

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
    const forceAll: boolean = body.force_all === true;

    const { data: listings, error: listingsError } = await supabase
      .from("listings")
      .select(`
        id, media_type, property_name, media_owner_name, location,
        original_price, discounted_price, date_label, audience,
        slots_remaining, deadline_at,
        tags:listing_tags(tag:tags(name))
      `)
      .eq("status", "live")
      .gt("deadline_at", new Date().toISOString())
      .order("deadline_at", { ascending: true })
      .limit(50);

    if (listingsError || !listings || listings.length === 0) {
      return new Response(
        JSON.stringify({ message: "No live listings available for digest" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: buyers, error: buyersError } = await supabase
      .from("user_profiles")
      .select("id, display_name, digest_enabled, digest_frequency, digest_media_types, digest_locations, digest_tags, digest_last_sent_at")
      .eq("role", "buyer");

    if (buyersError || !buyers || buyers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No buyers found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const emailMap: Record<string, string> = {};
    if (authUsers?.users) {
      for (const u of authUsers.users) {
        if (u.email) emailMap[u.id] = u.email;
      }
    }

    const sendDigestEmail = async (to: string, name: string, listingSubset: Listing[]) => {
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
    const results: Array<{ email: string; listings_matched: number; sent: boolean; reason?: string }> = [];

    const buyerList = buyers as BuyerProfile[];

    if (targetEmail) {
      const buyer = buyerList.find(b => emailMap[b.id] === targetEmail);
      if (!buyer) {
        return new Response(
          JSON.stringify({ message: "Buyer not found for given email" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!buyer.digest_enabled) {
        return new Response(
          JSON.stringify({ message: "Buyer has disabled digest emails" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const scored = (listings as Listing[])
        .map(l => ({ listing: l, score: scoreListingForBuyer(l, buyer) }))
        .filter(x => x.score >= 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map(x => x.listing);

      if (scored.length === 0) {
        results.push({ email: targetEmail, listings_matched: 0, sent: false, reason: "no_matching_listings" });
      } else {
        await sendDigestEmail(targetEmail, buyer.display_name || "there", scored);
        await supabase.from("user_profiles").update({ digest_last_sent_at: new Date().toISOString() }).eq("id", buyer.id);
        sentCount = 1;
        results.push({ email: targetEmail, listings_matched: scored.length, sent: true });
      }
    } else {
      for (const buyer of buyerList) {
        const email = emailMap[buyer.id];
        if (!email) continue;

        if (!forceAll && !shouldSendToday(buyer)) {
          results.push({ email, listings_matched: 0, sent: false, reason: "frequency_not_due" });
          continue;
        }

        if (!buyer.digest_enabled) {
          results.push({ email, listings_matched: 0, sent: false, reason: "disabled_by_buyer" });
          continue;
        }

        const scored = (listings as Listing[])
          .map(l => ({ listing: l, score: scoreListingForBuyer(l, buyer) }))
          .filter(x => x.score >= 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 6)
          .map(x => x.listing);

        if (scored.length === 0) {
          results.push({ email, listings_matched: 0, sent: false, reason: "no_matching_listings" });
          continue;
        }

        await sendDigestEmail(email, buyer.display_name || "there", scored);
        await supabase.from("user_profiles").update({ digest_last_sent_at: new Date().toISOString() }).eq("id", buyer.id);
        sentCount++;
        results.push({ email, listings_matched: scored.length, sent: true });
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, total_buyers: buyerList.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
