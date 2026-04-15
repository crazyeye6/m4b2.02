import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailPayload {
  type:
    | "welcome_buyer"
    | "welcome_seller"
    | "booking_confirmation_buyer"
    | "booking_confirmation_seller"
    | "slot_listed"
    | "opportunity_digest";
  to: string;
  data: Record<string, unknown>;
}

function brandHeader() {
  return `
    <div style="background:#ffffff;padding:24px 40px;border-bottom:1px solid rgba(0,0,0,0.06);">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1d1d1f;border-radius:8px;width:32px;height:32px;text-align:center;vertical-align:middle;">
                  <span style="color:#ffffff;font-size:15px;font-weight:900;line-height:32px;">⚡</span>
                </td>
                <td style="padding-left:10px;">
                  <span style="color:#1d1d1f;font-size:15px;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif;letter-spacing:-0.3px;">EndingThisWeek<span style="color:#16a34a;">.media</span></span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function brandFooter() {
  return `
    <div style="background:#f5f5f7;padding:24px 40px;border-top:1px solid rgba(0,0,0,0.06);margin-top:0;">
      <p style="color:#aeaeb2;font-size:12px;margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
        EndingThisWeek.media — last-minute advertising slots at discounted rates
      </p>
      <p style="color:#aeaeb2;font-size:11px;margin:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
        You're receiving this because you have an account on EndingThisWeek.media.
      </p>
    </div>
  `;
}

function wrapEmail(content: string, preheader = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>EndingThisWeek.media</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent;">${preheader}</div>` : ""}
  <table cellpadding="0" cellspacing="0" width="100%" style="background:#f5f5f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border:1px solid rgba(0,0,0,0.08);border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
          <tr><td>${brandHeader()}</td></tr>
          <tr><td style="padding:36px 40px;">${content}</td></tr>
          <tr><td>${brandFooter()}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function h1(text: string) {
  return `<h1 style="color:#1d1d1f;font-size:24px;font-weight:700;margin:0 0 10px 0;line-height:1.25;letter-spacing:-0.4px;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif;">${text}</h1>`;
}

function p(text: string, style = "") {
  return `<p style="color:#6e6e73;font-size:14px;line-height:1.65;margin:0 0 16px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;${style}">${text}</p>`;
}

function labelText(text: string) {
  return `<p style="color:#16a34a;font-size:13px;font-weight:600;margin:0 0 16px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${text}</p>`;
}

function ctaButton(text: string, href: string) {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td style="background:#1d1d1f;border-radius:10px;">
          <a href="${href}" style="display:inline-block;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:13px 26px;letter-spacing:-0.1px;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${text}</a>
        </td>
      </tr>
    </table>
  `;
}

function dataRow(label: string, value: string) {
  return `
    <tr>
      <td style="color:#6e6e73;font-size:13px;padding:10px 16px;border-bottom:1px solid rgba(0,0,0,0.05);font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${label}</td>
      <td style="color:#1d1d1f;font-size:13px;font-weight:600;padding:10px 16px;border-bottom:1px solid rgba(0,0,0,0.05);text-align:right;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${value}</td>
    </tr>
  `;
}

function dataTable(rows: string) {
  return `
    <table cellpadding="0" cellspacing="0" width="100%" style="background:#f5f5f7;border:1px solid rgba(0,0,0,0.06);border-radius:12px;overflow:hidden;margin:0 0 24px 0;">
      ${rows}
    </table>
  `;
}

function divider() {
  return `<hr style="border:none;border-top:1px solid rgba(0,0,0,0.06);margin:28px 0;"/>`;
}

function infoBox(content: string, variant: "green" | "blue" | "orange" = "green") {
  const colors: Record<string, { bg: string; border: string }> = {
    green:  { bg: "#f0fdf4", border: "#bbf7d0" },
    blue:   { bg: "#eff6ff", border: "#bfdbfe" },
    orange: { bg: "#fff7ed", border: "#fed7aa" },
  };
  const { bg, border } = colors[variant];
  return `
    <div style="background:${bg};border:1px solid ${border};border-radius:12px;padding:18px 20px;margin:0 0 24px 0;">
      ${content}
    </div>
  `;
}

function buildWelcomeBuyer(data: Record<string, unknown>) {
  const name = String(data.display_name || "there");
  const content = `
    ${h1(`Welcome, ${name}!`)}
    ${p("You now have access to last-minute advertising slots at 20–50% below standard rates. Newsletters, podcasts, and influencer placements — all expiring soon.")}
    ${labelText("Here's how to get started:")}
    <ol style="color:#6e6e73;font-size:14px;line-height:1.9;padding-left:22px;margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
      <li>Browse available slots filtered by niche, geography, and budget</li>
      <li>Find a deal worth taking — real audience data, live countdown timers</li>
      <li>Pay a 10% deposit to lock in your slot instantly</li>
      <li>Contact the creator directly and finalise the campaign</li>
    </ol>
    ${ctaButton("Browse Opportunities →", "https://endingthistweek.media")}
    ${divider()}
    ${infoBox(`<p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Why a 10% deposit?</p><p style="color:#6e6e73;font-size:13px;margin:0;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Your deposit reserves the slot and releases the creator's contact details. The remaining 90% is paid directly to the creator — no platform cut on the balance.</p>`, "green")}
    ${p("If you have any questions, reply to this email and we'll help you out.", "color:#aeaeb2;font-size:12px;")}
  `;
  return { subject: "Welcome to EndingThisWeek.media", html: wrapEmail(content, `Last-minute ad slots at 20–50% off — welcome, ${name}!`) };
}

function buildWelcomeSeller(data: Record<string, unknown>) {
  const name = String(data.display_name || "there");
  const content = `
    ${h1(`Welcome, ${name}!`)}
    ${p("Your seller account is ready. List your unsold advertising slots and fill your inventory before the deadline — at a price that works for buyers and still works for you.")}
    ${labelText("Getting listed is free and takes less than 5 minutes:")}
    <ol style="color:#6e6e73;font-size:14px;line-height:1.9;padding-left:22px;margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
      <li>Fill in your media details (newsletter, podcast, or influencer slot)</li>
      <li>Set your original rate and discounted price</li>
      <li>Add real audience data — this is what buyers look for</li>
      <li>Set a deadline and publish — buyers can book instantly</li>
    </ol>
    ${ctaButton("List a Slot Free →", "https://endingthistweek.media")}
    ${divider()}
    ${infoBox(`<p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">How payouts work</p><p style="color:#6e6e73;font-size:13px;margin:0;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Buyers pay a 10% platform deposit to reserve your slot. You receive a booking notification with buyer details. The remaining 90% is paid directly to you — you invoice the buyer through your normal commercial process.</p>`, "green")}
  `;
  return { subject: "You're listed — start receiving bookings", html: wrapEmail(content, `List your first slot and start filling unsold inventory, ${name}`) };
}

function buildBookingConfirmationBuyer(data: Record<string, unknown>) {
  const ref = String(data.reference_number || "—");
  const propertyName = String(data.property_name || "—");
  const ownerName = String(data.media_owner_name || "—");
  const dateLabel = String(data.date_label || "—");
  const slotType = String(data.slot_type || "—");
  const depositAmount = Number(data.deposit_amount || 0).toLocaleString();
  const balanceAmount = Number(data.balance_amount || 0).toLocaleString();
  const totalPrice = Number(data.total_price || 0).toLocaleString();
  const sellerEmail = String(data.seller_email || "");
  const sellerName = String(data.seller_name || ownerName);
  const buyerName = String(data.buyer_name || "there");

  const contactSection = sellerEmail
    ? infoBox(`
        <p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Creator contact — released after deposit</p>
        <p style="color:#1d1d1f;font-size:14px;font-weight:600;margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${sellerName}</p>
        <p style="color:#6e6e73;font-size:13px;margin:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
          <a href="mailto:${sellerEmail}" style="color:#16a34a;text-decoration:none;">${sellerEmail}</a>
        </p>
      `, "green")
    : "";

  const content = `
    ${h1("Slot secured!")}
    ${p(`Hi ${buyerName}, your deposit has been paid and your advertising slot is reserved. The creator has been notified.`)}
    <p style="color:#6e6e73;font-size:13px;margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Booking reference: <span style="color:#1d1d1f;font-family:ui-monospace,'SF Mono',monospace;font-weight:700;background:#f5f5f7;padding:2px 8px;border-radius:6px;">${ref}</span></p>
    ${dataTable(
      dataRow("Opportunity", propertyName) +
      dataRow("Creator", ownerName) +
      dataRow("Slot type", slotType) +
      dataRow("Posting date", dateLabel) +
      dataRow("Deposit paid (10%)", `$${depositAmount}`) +
      dataRow("Balance to creator (90%)", `$${balanceAmount}`) +
      dataRow("Total campaign value", `$${totalPrice}`)
    )}
    ${contactSection}
    ${divider()}
    <p style="color:#1d1d1f;font-size:14px;font-weight:600;margin:0 0 12px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Next steps</p>
    <ol style="color:#6e6e73;font-size:14px;line-height:1.9;padding-left:22px;margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
      <li>Contact the creator using their details above</li>
      <li>Confirm final campaign details and creative requirements</li>
      <li>Arrange the remaining $${balanceAmount} balance directly with the creator</li>
      <li>Submit your creative within 24 hours of confirming</li>
    </ol>
    ${ctaButton("View Your Booking →", "https://endingthistweek.media")}
    ${p("Keep this email as your booking record. If you have issues, reply here.", "color:#aeaeb2;font-size:12px;")}
  `;
  return {
    subject: `Booking confirmed — ${propertyName} [${ref}]`,
    html: wrapEmail(content, `Your slot on ${propertyName} is reserved. Reference: ${ref}`),
  };
}

function buildBookingConfirmationSeller(data: Record<string, unknown>) {
  const ref = String(data.reference_number || "—");
  const propertyName = String(data.property_name || "—");
  const buyerName = String(data.buyer_name || "—");
  const buyerCompany = String(data.buyer_company || "—");
  const buyerEmail = String(data.buyer_email || "—");
  const buyerPhone = String(data.buyer_phone || "");
  const buyerWebsite = String(data.buyer_website || "");
  const buyerCountry = String(data.buyer_country || "—");
  const depositAmount = Number(data.deposit_amount || 0).toLocaleString();
  const balanceAmount = Number(data.balance_amount || 0).toLocaleString();
  const dateLabel = String(data.date_label || "—");
  const message = String(data.message_to_creator || "");
  const sellerName = String(data.seller_name || "there");

  const messageSection = message
    ? `${divider()}<p style="color:#1d1d1f;font-size:14px;font-weight:600;margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Message from buyer</p><p style="color:#6e6e73;font-size:14px;line-height:1.65;margin:0 0 24px 0;font-style:italic;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">"${message}"</p>`
    : "";

  const content = `
    ${h1("New booking received!")}
    ${p(`Hi ${sellerName}, a buyer has secured a slot on <strong style="color:#1d1d1f;">${propertyName}</strong>. Their 10% deposit has been collected by the platform.`)}
    <p style="color:#6e6e73;font-size:13px;margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Booking reference: <span style="color:#1d1d1f;font-family:ui-monospace,'SF Mono',monospace;font-weight:700;background:#f5f5f7;padding:2px 8px;border-radius:6px;">${ref}</span></p>
    ${infoBox(`
      <p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 10px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Buyer contact details</p>
      <p style="color:#1d1d1f;font-size:14px;font-weight:600;margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${buyerName} — ${buyerCompany}</p>
      <p style="color:#6e6e73;font-size:13px;margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;"><a href="mailto:${buyerEmail}" style="color:#16a34a;text-decoration:none;">${buyerEmail}</a></p>
      ${buyerPhone ? `<p style="color:#6e6e73;font-size:13px;margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${buyerPhone}</p>` : ""}
      ${buyerWebsite ? `<p style="color:#6e6e73;font-size:13px;margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;"><a href="${buyerWebsite}" style="color:#16a34a;text-decoration:none;">${buyerWebsite}</a></p>` : ""}
      <p style="color:#6e6e73;font-size:13px;margin:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${buyerCountry}</p>
    `, "green")}
    ${dataTable(
      dataRow("Slot", propertyName) +
      dataRow("Posting date", dateLabel) +
      dataRow("Platform deposit (paid)", `$${depositAmount}`) +
      dataRow("Your balance to collect", `$${balanceAmount}`)
    )}
    ${messageSection}
    ${divider()}
    <p style="color:#1d1d1f;font-size:14px;font-weight:600;margin:0 0 12px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">What to do now</p>
    <ol style="color:#6e6e73;font-size:14px;line-height:1.9;padding-left:22px;margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
      <li>Contact the buyer at ${buyerEmail} to confirm the booking</li>
      <li>Agree on creative requirements and submission deadline</li>
      <li>Invoice the buyer for the $${balanceAmount} balance using your standard process</li>
      <li>Deliver the campaign on the agreed date</li>
    </ol>
    ${ctaButton("View Booking Dashboard →", "https://endingthistweek.media")}
  `;
  return {
    subject: `New booking on ${propertyName} — ${buyerName} [${ref}]`,
    html: wrapEmail(content, `${buyerName} from ${buyerCompany} has secured your slot on ${propertyName}`),
  };
}

function buildSlotListed(data: Record<string, unknown>) {
  const propertyName = String(data.property_name || "—");
  const mediaType = String(data.media_type || "—");
  const discountedPrice = Number(data.discounted_price || 0).toLocaleString();
  const discount = Number(data.discount || 0);
  const deadline = String(data.deadline_at || "—");
  const sellerName = String(data.seller_name || "there");
  const slotsRemaining = Number(data.slots_remaining || 1);

  const deadlineDate = new Date(deadline);
  const deadlineStr = isNaN(deadlineDate.getTime())
    ? deadline
    : deadlineDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const content = `
    ${h1("Your listing is live!")}
    ${p(`Hi ${sellerName}, your ${mediaType} slot has been submitted and is now visible to buyers on EndingThisWeek.media.`)}
    ${dataTable(
      dataRow("Listing", propertyName) +
      dataRow("Media type", mediaType.charAt(0).toUpperCase() + mediaType.slice(1)) +
      dataRow("Discounted price", `$${discountedPrice}`) +
      dataRow("Discount", `-${discount}%`) +
      dataRow("Slots available", String(slotsRemaining)) +
      dataRow("Deadline", deadlineStr)
    )}
    ${infoBox(`
      <p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Tips to get booked faster</p>
      <ul style="color:#6e6e73;font-size:13px;line-height:1.9;padding-left:18px;margin:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
        <li>Make sure your seller email is correct — bookings come direct to your inbox</li>
        <li>A higher discount (30%+) drives significantly more interest</li>
        <li>Respond to buyer enquiries within a few hours</li>
        <li>Past advertiser logos build trust — add them if you can</li>
      </ul>
    `, "green")}
    ${ctaButton("View Your Dashboard →", "https://endingthistweek.media")}
    ${p("You'll receive an email notification the moment a buyer secures your slot.", "color:#aeaeb2;font-size:12px;")}
  `;
  return {
    subject: `Your listing is live — ${propertyName}`,
    html: wrapEmail(content, `${propertyName} is now visible to buyers. Here's what to expect.`),
  };
}

function buildOpportunityDigest(data: Record<string, unknown>) {
  const buyerName = String(data.buyer_name || "there");
  const listings = (data.listings as Array<Record<string, unknown>>) || [];

  const mediaTypeStyles: Record<string, { bg: string; border: string; color: string }> = {
    newsletter:  { bg: "#eff6ff", border: "#bfdbfe", color: "#2563eb" },
    podcast:     { bg: "#f0fdf4", border: "#bbf7d0", color: "#16a34a" },
    influencer:  { bg: "#fff7ed", border: "#fed7aa", color: "#ea580c" },
  };

  const listingCards = listings
    .slice(0, 6)
    .map((l) => {
      const discount = Math.round(
        ((Number(l.original_price) - Number(l.discounted_price)) / Number(l.original_price)) * 100
      );
      const typeKey = String(l.media_type || "").toLowerCase();
      const typeStyle = mediaTypeStyles[typeKey] || { bg: "#f5f5f7", border: "rgba(0,0,0,0.08)", color: "#6e6e73" };
      const typeLabel = String(l.media_type || "").charAt(0).toUpperCase() + String(l.media_type || "").slice(1);

      return `
        <tr>
          <td style="padding:0 0 16px 0;">
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#ffffff;border:1px solid rgba(0,0,0,0.08);border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:20px;">
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td>
                        <span style="display:inline-block;background:${typeStyle.bg};border:1px solid ${typeStyle.border};color:${typeStyle.color};font-size:10px;font-weight:700;padding:3px 9px;border-radius:6px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${typeLabel}</span>
                        <p style="color:#1d1d1f;font-size:15px;font-weight:700;margin:0 0 3px 0;letter-spacing:-0.2px;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif;">${String(l.property_name)}</p>
                        <p style="color:#6e6e73;font-size:13px;margin:0 0 14px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${String(l.media_owner_name)} · ${String(l.location)}</p>
                      </td>
                      <td style="text-align:right;vertical-align:top;padding-left:12px;">
                        <div style="display:inline-block;background:#1d1d1f;color:#ffffff;font-size:12px;font-weight:700;padding:4px 10px;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">-${discount}%</div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span style="color:#1d1d1f;font-size:22px;font-weight:700;letter-spacing:-0.5px;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif;">$${Number(l.discounted_price).toLocaleString()}</span>
                        <span style="color:#aeaeb2;font-size:13px;text-decoration:line-through;margin-left:8px;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">$${Number(l.original_price).toLocaleString()}</span>
                      </td>
                      <td style="text-align:right;vertical-align:bottom;">
                        <p style="color:#aeaeb2;font-size:12px;margin:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${String(l.date_label)}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join("");

  const content = `
    ${h1(`${listings.length} new opportunities for you`)}
    ${p(`Hi ${buyerName}, here are this week's best last-minute advertising slots. These are expiring soon — act fast.`)}
    ${divider()}
    <table cellpadding="0" cellspacing="0" width="100%">
      ${listingCards}
    </table>
    ${ctaButton("See All Opportunities →", "https://endingthistweek.media")}
    ${divider()}
    ${p("Slots fill up fast. Each listing shows a live countdown — when it's gone, it's gone.", "color:#aeaeb2;font-size:12px;")}
    ${p(`<a href="https://endingthistweek.media/unsubscribe" style="color:#aeaeb2;text-decoration:underline;">Unsubscribe from digest emails</a>`, "color:#aeaeb2;font-size:11px;")}
  `;
  return {
    subject: `${listings.length} expiring ad slots this week — don't miss out`,
    html: wrapEmail(content, `${listings.length} last-minute advertising slots matched to your interests`),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: EmailPayload = await req.json();
    const { type, to, data } = payload;

    if (!type || !to) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, to" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let emailContent: { subject: string; html: string };

    switch (type) {
      case "welcome_buyer":
        emailContent = buildWelcomeBuyer(data);
        break;
      case "welcome_seller":
        emailContent = buildWelcomeSeller(data);
        break;
      case "booking_confirmation_buyer":
        emailContent = buildBookingConfirmationBuyer(data);
        break;
      case "booking_confirmation_seller":
        emailContent = buildBookingConfirmationSeller(data);
        break;
      case "slot_listed":
        emailContent = buildSlotListed(data);
        break;
      case "opportunity_digest":
        emailContent = buildOpportunityDigest(data);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown email type: ${type}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "EndingThisWeek.media <onboarding@resend.dev>",
        to: [to],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: result }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
