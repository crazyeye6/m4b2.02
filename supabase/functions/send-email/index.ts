import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SITE_URL = "https://endingthisweek.media";

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
    | "admin_slot_published"
    | "opportunity_digest"
    | "closing_soon_digest"
    | "new_slots_alert"
    | "slot_request_received"
    | "slot_confirmed"
    | "slot_unavailable"
    | "seller_new_request"
    | "seller_request_reminder"
    | "seller_weekly_nudge"
    | "slot_expired"
    | "slot_secured_seller"
    | "account_invite"
    | "contact_form";
  to: string;
  data: Record<string, unknown>;
}

// ─── Shared components ────────────────────────────────────────────────────────

function brandHeader() {
  return `
    <div style="background:#ffffff;padding:22px 40px;border-bottom:1px solid rgba(0,0,0,0.06);">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1d1d1f;border-radius:7px;width:30px;height:30px;text-align:center;vertical-align:middle;">
                  <span style="color:#4ade80;font-size:14px;font-weight:900;line-height:30px;">&#9889;</span>
                </td>
                <td style="padding-left:10px;">
                  <span style="color:#1d1d1f;font-size:14px;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif;letter-spacing:-0.3px;">EndingThisWeek<span style="color:#16a34a;">.media</span></span>
                </td>
              </tr>
            </table>
          </td>
          <td style="text-align:right;">
            <span style="display:inline-block;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:20px;padding:3px 10px;">
              <span style="width:6px;height:6px;background:#16a34a;border-radius:50%;display:inline-block;vertical-align:middle;margin-right:5px;"></span>
              <span style="color:#15803d;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Open Slot Feed</span>
            </span>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function brandFooter(includeUnsubscribe = false, unsubLink = "") {
  const unsub = includeUnsubscribe && unsubLink
    ? `<p style="color:#aeaeb2;font-size:11px;margin:6px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;"><a href="${unsubLink}" style="color:#aeaeb2;text-decoration:underline;">Unsubscribe from slot alert emails</a></p>`
    : "";
  return `
    <div style="background:#f5f5f7;padding:22px 40px;border-top:1px solid rgba(0,0,0,0.06);margin-top:0;">
      <p style="color:#aeaeb2;font-size:12px;margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
        EndingThisWeek.media &mdash; live feed of open podcast ad slots
      </p>
      <p style="color:#aeaeb2;font-size:11px;margin:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
        You're receiving this because you have an account on EndingThisWeek.media.
      </p>
      ${unsub}
    </div>
  `;
}

function wrapEmail(content: string, preheader = "", includeUnsubscribe = false, unsubLink = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>EndingThisWeek.media</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f5;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent;">${preheader}</div>` : ""}
  <table cellpadding="0" cellspacing="0" width="100%" style="background:#f0f0f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border:1px solid rgba(0,0,0,0.08);border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
          <tr><td>${brandHeader()}</td></tr>
          <tr><td style="padding:36px 40px;">${content}</td></tr>
          <tr><td>${brandFooter(includeUnsubscribe, unsubLink)}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Typography helpers ────────────────────────────────────────────────────────

function h1(text: string) {
  return `<h1 style="color:#1d1d1f;font-size:23px;font-weight:700;margin:0 0 10px 0;line-height:1.25;letter-spacing:-0.4px;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif;">${text}</h1>`;
}

function h2(text: string) {
  return `<h2 style="color:#1d1d1f;font-size:16px;font-weight:700;margin:0 0 12px 0;line-height:1.3;letter-spacing:-0.2px;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif;">${text}</h2>`;
}

function p(text: string, style = "") {
  return `<p style="color:#6e6e73;font-size:14px;line-height:1.65;margin:0 0 16px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;${style}">${text}</p>`;
}

function small(text: string) {
  return `<p style="color:#aeaeb2;font-size:12px;line-height:1.6;margin:0 0 12px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${text}</p>`;
}

function ctaButton(text: string, href: string, color = "#1d1d1f") {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="background:${color};border-radius:10px;">
          <a href="${href}" style="display:inline-block;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:13px 26px;letter-spacing:-0.1px;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${text}</a>
        </td>
      </tr>
    </table>
  `;
}

function secondaryButton(text: string, href: string) {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:8px 0 24px 0;">
      <tr>
        <td style="background:#f5f5f7;border:1px solid rgba(0,0,0,0.10);border-radius:10px;">
          <a href="${href}" style="display:inline-block;color:#1d1d1f;font-size:13px;font-weight:600;text-decoration:none;padding:10px 22px;letter-spacing:-0.1px;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${text}</a>
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

function infoBox(content: string, variant: "green" | "blue" | "orange" | "red" = "green") {
  const colors: Record<string, { bg: string; border: string }> = {
    green:  { bg: "#f0fdf4", border: "#bbf7d0" },
    blue:   { bg: "#eff6ff", border: "#bfdbfe" },
    orange: { bg: "#fff7ed", border: "#fed7aa" },
    red:    { bg: "#fef2f2", border: "#fecaca" },
  };
  const { bg, border } = colors[variant];
  return `
    <div style="background:${bg};border:1px solid ${border};border-radius:12px;padding:18px 20px;margin:0 0 24px 0;">
      ${content}
    </div>
  `;
}

function urgencyBar(text: string) {
  return `
    <div style="background:#1d1d1f;border-radius:10px;padding:12px 18px;margin:0 0 24px 0;display:flex;align-items:center;gap:10px;">
      <p style="color:#ffffff;font-size:13px;font-weight:600;margin:0;line-height:1.4;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
        <span style="color:#fbbf24;">&#9679;</span>&nbsp; ${text}
      </p>
    </div>
  `;
}

function statPill(label: string, value: string) {
  return `<span style="display:inline-block;background:#f5f5f7;border:1px solid rgba(0,0,0,0.08);border-radius:8px;padding:4px 10px;font-size:11px;color:#3a3a3c;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;margin:0 4px 4px 0;"><span style="color:#aeaeb2;">${label}:</span> <strong style="color:#1d1d1f;">${value}</strong></span>`;
}

function slotRow(podcastName: string, audience: string, price: string, ends: string, url: string) {
  return `
    <tr>
      <td style="padding:0 0 12px 0;">
        <table cellpadding="0" cellspacing="0" width="100%" style="background:#f5f5f7;border:1px solid rgba(0,0,0,0.06);border-radius:10px;overflow:hidden;">
          <tr>
            <td style="padding:14px 16px;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="vertical-align:middle;">
                    <p style="color:#1d1d1f;font-size:14px;font-weight:700;margin:0 0 2px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${podcastName}</p>
                    <p style="color:#6e6e73;font-size:12px;margin:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${audience}</p>
                  </td>
                  <td style="text-align:right;vertical-align:middle;padding-left:12px;white-space:nowrap;">
                    <p style="color:#1d1d1f;font-size:15px;font-weight:700;margin:0 0 2px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${price}</p>
                    <p style="color:#dc2626;font-size:11px;font-weight:600;margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${ends}</p>
                    <a href="${url}" style="display:inline-block;background:#1d1d1f;color:#ffffff;font-size:11px;font-weight:600;padding:5px 12px;border-radius:7px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Secure slot &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

// ─── Email builders ────────────────────────────────────────────────────────────

function buildWelcomeBuyer(data: Record<string, unknown>) {
  const name = String(data.display_name || "there");
  const content = `
    ${h1(`Welcome, ${name}`)}
    ${p("You now have access to open podcast ad slots — unsold host-read placements that will default to programmatic if not filled this week.")}
    ${urgencyBar("Act fast. Open slots close when the episode records.")}
    <p style="color:#1d1d1f;font-size:13px;font-weight:600;margin:0 0 10px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">How it works:</p>
    <ol style="color:#6e6e73;font-size:14px;line-height:1.9;padding-left:22px;margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
      <li>Browse open slots — filter by niche, audience, and budget</li>
      <li>Pay a 5% deposit to secure the slot instantly</li>
      <li>Host's contact details released immediately after payment</li>
      <li>Settle the remaining 95% and deliver your campaign directly</li>
    </ol>
    ${ctaButton("Browse Open Slots &rarr;", SITE_URL, "#16a34a")}
    ${divider()}
    ${infoBox(`<p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Why 5% deposit?</p><p style="color:#6e6e73;font-size:13px;margin:0;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">The deposit locks the slot and stops it defaulting to programmatic. The remaining 95% goes directly to the host — no platform cut on the balance.</p>`, "green")}
    ${small("Questions? Reply to this email and we'll help.")}
  `;
  return {
    subject: "Your access to open podcast ad slots",
    html: wrapEmail(content, `Open ad slots this week — welcome, ${name}`),
  };
}

function buildWelcomeSeller(data: Record<string, unknown>) {
  const name = String(data.display_name || "there");
  const content = `
    ${h1(`Welcome, ${name}`)}
    ${p("Your seller account is live. Submit your open ad slots and we'll promote them to active buyers before they default to programmatic.")}
    ${urgencyBar("Unsold slots fall back to programmatic. Get them in front of buyers first.")}
    <p style="color:#1d1d1f;font-size:13px;font-weight:600;margin:0 0 10px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Listing takes under 5 minutes:</p>
    <ol style="color:#6e6e73;font-size:14px;line-height:1.9;padding-left:22px;margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
      <li>Submit your podcast details — name, downloads per episode, niche</li>
      <li>Set your rate card price and any discount for urgency</li>
      <li>Set a booking deadline and go live</li>
      <li>When a buyer secures the slot, you get their details directly</li>
    </ol>
    ${ctaButton("Submit Your First Open Slot &rarr;", `${SITE_URL}/list`, "#16a34a")}
    ${divider()}
    ${infoBox(`<p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">How payouts work</p><p style="color:#6e6e73;font-size:13px;margin:0;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">A buyer pays a 5% deposit to reserve your slot. You receive their contact details immediately. Invoice them directly for the remaining 95% — no commission taken on the balance.</p>`, "green")}
  `;
  return {
    subject: "Your seller account is ready — submit your first open slot",
    html: wrapEmail(content, `Submit your open slots and fill inventory before it defaults, ${name}`),
  };
}

function buildBookingConfirmationBuyer(data: Record<string, unknown>) {
  const ref = String(data.reference_number || "—");
  const propertyName = String(data.property_name || "—");
  const ownerName = String(data.media_owner_name || "—");
  const dateLabel = String(data.date_label || "—");
  const slotType = String(data.slot_type || "—");
  const depositAmount = Number(data.deposit_amount || 0).toLocaleString("en-GB");
  const balanceAmount = Number(data.balance_amount || 0).toLocaleString("en-GB");
  const totalPrice = Number(data.total_price || 0).toLocaleString("en-GB");
  const sellerEmail = String(data.seller_email || "");
  const sellerName = String(data.seller_name || ownerName);
  const sellerPhone = String(data.seller_phone || "");
  const sellerWebsite = String(data.seller_website || "");
  const buyerName = String(data.buyer_name || "there");
  const currency = String(data.currency || "$");

  const contactRows = [
    sellerEmail ? `<p style="color:#6e6e73;font-size:13px;margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;"><a href="mailto:${sellerEmail}" style="color:#16a34a;text-decoration:none;">${sellerEmail}</a></p>` : "",
    sellerPhone ? `<p style="color:#6e6e73;font-size:13px;margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${sellerPhone}</p>` : "",
    sellerWebsite ? `<p style="color:#6e6e73;font-size:13px;margin:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;"><a href="${sellerWebsite}" style="color:#16a34a;text-decoration:none;">${sellerWebsite}</a></p>` : "",
  ].filter(Boolean).join("");

  const contactSection = sellerEmail
    ? infoBox(`
        <p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Host contact — released after deposit</p>
        <p style="color:#1d1d1f;font-size:14px;font-weight:600;margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${sellerName}</p>
        ${contactRows}
      `, "green")
    : "";

  const content = `
    ${h1("Open slot secured")}
    ${p(`Hi ${buyerName}, your deposit has been paid. Your open ad slot is reserved — this slot will no longer default to programmatic.`)}
    <p style="color:#6e6e73;font-size:13px;margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Booking reference: <span style="color:#1d1d1f;font-family:ui-monospace,'SF Mono',monospace;font-weight:700;background:#f5f5f7;padding:2px 8px;border-radius:6px;">${ref}</span></p>
    ${dataTable(
      dataRow("Open slot", propertyName) +
      dataRow("Host", ownerName) +
      dataRow("Format", slotType) +
      dataRow("Episode date", dateLabel) +
      dataRow("Deposit paid (5%)", `${currency}${depositAmount}`) +
      dataRow("Balance to host (95%)", `${currency}${balanceAmount}`) +
      dataRow("Total campaign value", `${currency}${totalPrice}`)
    )}
    ${contactSection}
    ${divider()}
    <p style="color:#1d1d1f;font-size:14px;font-weight:600;margin:0 0 12px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">What to do now</p>
    <ol style="color:#6e6e73;font-size:14px;line-height:1.9;padding-left:22px;margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
      <li>Contact the host at the details above</li>
      <li>Confirm creative requirements and submission deadline</li>
      <li>Arrange the ${currency}${balanceAmount} balance directly with the host</li>
      <li>Deliver your ad copy before the episode records</li>
    </ol>
    ${ctaButton("View My Bookings &rarr;", `${SITE_URL}/buyer`)}
    ${small("Keep this email as your booking record. Reply here if you have any issues.")}
  `;
  return {
    subject: `Slot secured — ${propertyName} [${ref}]`,
    html: wrapEmail(content, `Your open slot on ${propertyName} is reserved. Reference: ${ref}`),
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
  const depositAmount = Number(data.deposit_amount || 0).toLocaleString("en-GB");
  const balanceAmount = Number(data.balance_amount || 0).toLocaleString("en-GB");
  const dateLabel = String(data.date_label || "—");
  const message = String(data.message_to_creator || "");
  const sellerName = String(data.seller_name || "there");
  const currency = String(data.currency || "$");

  const messageSection = message
    ? `${divider()}<p style="color:#1d1d1f;font-size:14px;font-weight:600;margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Message from buyer</p><p style="color:#6e6e73;font-size:14px;line-height:1.65;margin:0 0 24px 0;font-style:italic;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">&ldquo;${message}&rdquo;</p>`
    : "";

  const content = `
    ${h1("Your open slot has been secured")}
    ${p(`Hi ${sellerName}, a buyer has secured an open ad slot on <strong style="color:#1d1d1f;">${propertyName}</strong>. Their 5% deposit has been collected. Contact them directly to confirm details.`)}
    <p style="color:#6e6e73;font-size:13px;margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Booking reference: <span style="color:#1d1d1f;font-family:ui-monospace,'SF Mono',monospace;font-weight:700;background:#f5f5f7;padding:2px 8px;border-radius:6px;">${ref}</span></p>
    ${infoBox(`
      <p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 10px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Buyer contact details</p>
      <p style="color:#1d1d1f;font-size:14px;font-weight:600;margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${buyerName} &mdash; ${buyerCompany}</p>
      <p style="color:#6e6e73;font-size:13px;margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;"><a href="mailto:${buyerEmail}" style="color:#16a34a;text-decoration:none;">${buyerEmail}</a></p>
      ${buyerPhone ? `<p style="color:#6e6e73;font-size:13px;margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${buyerPhone}</p>` : ""}
      ${buyerWebsite ? `<p style="color:#6e6e73;font-size:13px;margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;"><a href="${buyerWebsite}" style="color:#16a34a;text-decoration:none;">${buyerWebsite}</a></p>` : ""}
      <p style="color:#6e6e73;font-size:13px;margin:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${buyerCountry}</p>
    `, "green")}
    ${dataTable(
      dataRow("Open slot", propertyName) +
      dataRow("Episode date", dateLabel) +
      dataRow("Platform deposit (collected)", `${currency}${depositAmount}`) +
      dataRow("Your balance to collect", `${currency}${balanceAmount}`)
    )}
    ${messageSection}
    ${divider()}
    <p style="color:#1d1d1f;font-size:14px;font-weight:600;margin:0 0 12px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">What to do now</p>
    <ol style="color:#6e6e73;font-size:14px;line-height:1.9;padding-left:22px;margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
      <li>Contact the buyer at ${buyerEmail} to confirm the booking</li>
      <li>Agree on creative requirements and submission deadline</li>
      <li>Invoice the buyer for the ${currency}${balanceAmount} balance directly</li>
      <li>Deliver the campaign on the agreed episode date</li>
    </ol>
    ${ctaButton("View Seller Dashboard &rarr;", `${SITE_URL}/seller`)}
  `;
  return {
    subject: `Open slot secured — ${propertyName} — ${buyerName} [${ref}]`,
    html: wrapEmail(content, `${buyerName} from ${buyerCompany} has secured your open slot on ${propertyName}`),
  };
}

function buildSlotListed(data: Record<string, unknown>) {
  const propertyName = String(data.property_name || "—");
  const mediaType = String(data.media_type || "podcast");
  const discountedPrice = Number(data.discounted_price || 0).toLocaleString("en-GB");
  const originalPrice = Number(data.original_price || 0).toLocaleString("en-GB");
  const discount = Number(data.discount || 0);
  const deadline = String(data.deadline_at || "—");
  const sellerName = String(data.seller_name || "there");
  const slotsRemaining = Number(data.slots_remaining || 1);
  const subscribers = data.subscribers ? Number(data.subscribers).toLocaleString("en-GB") : null;

  const deadlineDate = new Date(deadline);
  const deadlineStr = isNaN(deadlineDate.getTime())
    ? deadline
    : deadlineDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const content = `
    ${h1("Your open slot is live")}
    ${p(`Hi ${sellerName}, your open ad slot for <strong style="color:#1d1d1f;">${propertyName}</strong> is now live in the feed. Active buyers can see and secure it now.`)}
    ${subscribers ? `<p style="color:#6e6e73;font-size:13px;margin:0 0 20px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${subscribers} downloads/episode</p>` : ""}
    ${dataTable(
      dataRow("Open slot", propertyName) +
      dataRow("Format", mediaType.charAt(0).toUpperCase() + mediaType.slice(1)) +
      dataRow("Rate card price", `$${originalPrice}`) +
      dataRow("Listed price", `$${discountedPrice}`) +
      (discount > 0 ? dataRow("Discount", `-${discount}%`) : "") +
      dataRow("Slots available", String(slotsRemaining)) +
      dataRow("Closing", deadlineStr)
    )}
    ${infoBox(`
      <p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Get booked faster</p>
      <ul style="color:#6e6e73;font-size:13px;line-height:1.9;padding-left:18px;margin:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
        <li>Respond to buyer requests within a few hours — faster responses fill slots</li>
        <li>A 25%+ discount drives significantly more buyer interest</li>
        <li>Past advertiser names build trust — add them to your profile if you can</li>
      </ul>
    `, "green")}
    ${ctaButton("View Your Dashboard &rarr;", `${SITE_URL}/seller`)}
    ${small("You'll be notified by email the moment a buyer secures this slot.")}
  `;
  return {
    subject: `Your open slot is live — ${propertyName}`,
    html: wrapEmail(content, `${propertyName} is live in the open slot feed`),
  };
}

function buildAdminSlotPublished(data: Record<string, unknown>) {
  const propertyName = String(data.property_name || "—");
  const mediaType = String(data.media_type || "podcast");
  const sellerName = String(data.seller_name || "there");
  const sellerEmail = String(data.seller_email || "");
  const discountedPrice = Number(data.discounted_price || 0).toLocaleString("en-GB");
  const originalPrice = Number(data.original_price || 0).toLocaleString("en-GB");
  const discount = Number(data.discount || 0);
  const slotsRemaining = Number(data.slots_remaining || 1);
  const deadline = String(data.deadline_at || "—");
  const submissionRef = String(data.submission_ref || "");

  const deadlineDate = new Date(deadline);
  const deadlineStr = isNaN(deadlineDate.getTime())
    ? deadline
    : deadlineDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const content = `
    ${h1("Your open slot is now live")}
    ${p(`Hi ${sellerName}, your submission has been reviewed and approved. Your open ad slot for <strong style="color:#1d1d1f;">${propertyName}</strong> is now visible to active buyers in the feed.`)}
    ${submissionRef ? `<p style="color:#6e6e73;font-size:13px;margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Submission reference: <span style="color:#1d1d1f;font-family:ui-monospace,'SF Mono',monospace;font-weight:700;background:#f5f5f7;padding:2px 8px;border-radius:6px;">${submissionRef}</span></p>` : ""}
    ${dataTable(
      dataRow("Open slot", propertyName) +
      dataRow("Format", mediaType.charAt(0).toUpperCase() + mediaType.slice(1)) +
      dataRow("Rate card price", `$${originalPrice}`) +
      dataRow("Listed price", `$${discountedPrice}`) +
      (discount > 0 ? dataRow("Discount", `-${discount}%`) : "") +
      dataRow("Slots available", String(slotsRemaining)) +
      dataRow("Closing", deadlineStr)
    )}
    ${infoBox(`
      <p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">What happens next</p>
      <p style="color:#6e6e73;font-size:13px;margin:0;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">When a buyer secures your slot, you receive their contact details and campaign brief directly by email. Contact them quickly to confirm details before the episode records.</p>
    `, "green")}
    ${sellerEmail ? infoBox(`<p style="color:#1e40af;font-size:13px;font-weight:600;margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Booking notifications go to:</p><p style="color:#6e6e73;font-size:13px;margin:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${sellerEmail}</p>`, "blue") : ""}
    ${ctaButton("View Live Slot &rarr;", SITE_URL)}
  `;
  return {
    subject: `Approved — ${propertyName} is live in the open slot feed`,
    html: wrapEmail(content, `Your open ad slot for ${propertyName} has been approved and is live`),
  };
}

function buildOpportunityDigest(data: Record<string, unknown>) {
  const buyerName = String(data.buyer_name || "there");
  const listings = (data.listings as Array<Record<string, unknown>>) || [];
  const unsubToken = String(data.unsub_token || "");
  const unsubLink = unsubToken ? `${SITE_URL}/unsubscribe?token=${unsubToken}` : `${SITE_URL}/buyer`;

  const listingCards = listings
    .slice(0, 6)
    .map((l) => {
      const origPrice = Number(l.original_price || 0);
      const discPrice = Number(l.discounted_price || 0);
      const discount = origPrice > 0 ? Math.round(((origPrice - discPrice) / origPrice) * 100) : 0;

      const subscriberCount = l.subscribers ? Number(l.subscribers).toLocaleString("en-GB") : null;
      const audience = String(l.audience || l.media_profile?.audience_type || "");
      const location = String(l.location || "");
      const slotType = String(l.slot_type || l.deliverable || "Host-read");

      const statsHtml = [
        subscriberCount ? statPill("Downloads/ep", subscriberCount) : null,
        audience ? statPill("Audience", audience) : null,
        location ? statPill("Location", location) : null,
      ].filter(Boolean).join("");

      const listingUrl = l.id ? `${SITE_URL}/?listing=${l.id}` : SITE_URL;

      const deadlineAt = l.deadline_at ? new Date(String(l.deadline_at)) : null;
      const hoursLeft = deadlineAt ? Math.max(0, Math.round((deadlineAt.getTime() - Date.now()) / 3600000)) : null;
      const deadlineLabel = hoursLeft !== null
        ? hoursLeft <= 24 ? `Closes in ${hoursLeft}h` : hoursLeft <= 48 ? `Closes in ${Math.round(hoursLeft / 24)}d` : `Closes ${deadlineAt!.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
        : String(l.date_label || "");
      const isUrgent = hoursLeft !== null && hoursLeft <= 48;

      return `
        <tr>
          <td style="padding:0 0 14px 0;">
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#ffffff;border:1px solid ${isUrgent ? "#fecaca" : "rgba(0,0,0,0.08)"};border-radius:12px;overflow:hidden;">
              <tr>
                ${isUrgent ? `<td colspan="2" style="background:#fef2f2;padding:7px 16px;border-bottom:1px solid #fecaca;"><p style="color:#dc2626;font-size:11px;font-weight:700;margin:0;letter-spacing:0.3px;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">&#9679; Closing soon — ${deadlineLabel}</p></td>` : ""}
              </tr>
              <tr>
                <td style="padding:16px 16px 12px 16px;">
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="vertical-align:top;">
                        <span style="display:inline-block;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;font-size:9px;font-weight:700;padding:2px 8px;border-radius:5px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Open Slot</span>
                        <p style="color:#1d1d1f;font-size:15px;font-weight:700;margin:0 0 2px 0;letter-spacing:-0.2px;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif;">${String(l.property_name || "")}</p>
                        <p style="color:#6e6e73;font-size:12px;margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${String(l.media_owner_name || "")} &middot; ${slotType}</p>
                        ${statsHtml ? `<div style="margin-bottom:8px;">${statsHtml}</div>` : ""}
                      </td>
                      <td style="text-align:right;vertical-align:top;padding-left:12px;white-space:nowrap;">
                        ${discount > 0 ? `<div style="display:inline-block;background:#1d1d1f;color:#ffffff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;margin-bottom:4px;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">-${discount}%</div><br>` : ""}
                        <span style="color:#1d1d1f;font-size:20px;font-weight:700;letter-spacing:-0.5px;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif;">$${discPrice.toLocaleString("en-GB")}</span>
                        ${origPrice > discPrice ? `<br><span style="color:#aeaeb2;font-size:12px;text-decoration:line-through;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">$${origPrice.toLocaleString("en-GB")}</span>` : ""}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        ${!isUrgent ? `<p style="color:#6e6e73;font-size:11px;margin:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${deadlineLabel}</p>` : ""}
                        <p style="color:#aeaeb2;font-size:10px;margin:4px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Will default to programmatic if unfilled</p>
                      </td>
                      <td style="text-align:right;vertical-align:bottom;">
                        <a href="${listingUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;font-size:11px;font-weight:600;padding:6px 14px;border-radius:8px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Secure slot &rarr;</a>
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
    ${h1(`Open podcast ad slots this week`)}
    ${p(`Hi ${buyerName}, here are open host-read placements matched to your interests. These are unsold slots that will default to programmatic if not filled.`)}
    ${urgencyBar("Act before these close. Once unsold, they fall back to programmatic.")}
    <table cellpadding="0" cellspacing="0" width="100%">
      ${listingCards}
    </table>
    ${ctaButton("View All Open Slots &rarr;", SITE_URL, "#16a34a")}
    ${divider()}
    ${small("Slots fill fast. Each listing shows a live countdown — when the deadline closes, the slot defaults.")}
  `;
  return {
    subject: `Open podcast ad slots this week`,
    html: wrapEmail(content, `Open host-read ad slots matched to your interests — closing soon`, true, unsubLink),
  };
}

function buildClosingSoonDigest(data: Record<string, unknown>) {
  const buyerName = String(data.buyer_name || "there");
  const listings = (data.listings as Array<Record<string, unknown>>) || [];
  const unsubToken = String(data.unsub_token || "");
  const unsubLink = unsubToken ? `${SITE_URL}/unsubscribe?token=${unsubToken}` : `${SITE_URL}/buyer`;

  const rows = listings.slice(0, 5).map((l) => {
    const deadlineAt = l.deadline_at ? new Date(String(l.deadline_at)) : null;
    const hoursLeft = deadlineAt ? Math.max(0, Math.round((deadlineAt.getTime() - Date.now()) / 3600000)) : null;
    const timeLabel = hoursLeft !== null
      ? hoursLeft <= 1 ? "Closing in under 1 hour" : hoursLeft <= 24 ? `Closing in ${hoursLeft}h` : `Closing in ${Math.round(hoursLeft / 24)}d`
      : "Closing soon";
    const discPrice = Number(l.discounted_price || 0);
    const audience = String(l.audience || l.media_profile?.audience_type || l.location || "");
    const url = l.id ? `${SITE_URL}/?listing=${l.id}` : SITE_URL;
    return slotRow(String(l.property_name || ""), audience, `$${discPrice.toLocaleString("en-GB")}`, timeLabel, url);
  }).join("");

  const content = `
    ${h1("Slots closing in 24–48 hours")}
    ${p(`Hi ${buyerName}, these open ad slots are about to close. If not filled, they default to programmatic.`)}
    ${urgencyBar("These close soon. Securing takes under 2 minutes.")}
    <table cellpadding="0" cellspacing="0" width="100%">
      ${rows}
    </table>
    ${ctaButton("View Remaining Open Slots &rarr;", SITE_URL, "#dc2626")}
    ${small("Once the deadline passes, these slots are gone. No extensions.")}
  `;
  return {
    subject: "Slots closing in 24–48 hours",
    html: wrapEmail(content, "Open ad slots closing soon — secure before they default to programmatic", true, unsubLink),
  };
}

function buildNewSlotsAlert(data: Record<string, unknown>) {
  const buyerName = String(data.buyer_name || "there");
  const listings = (data.listings as Array<Record<string, unknown>>) || [];
  const unsubToken = String(data.unsub_token || "");
  const unsubLink = unsubToken ? `${SITE_URL}/unsubscribe?token=${unsubToken}` : `${SITE_URL}/buyer`;

  const rows = listings.slice(0, 5).map((l) => {
    const discPrice = Number(l.discounted_price || 0);
    const audience = String(l.audience || l.media_profile?.audience_type || l.location || "");
    const url = l.id ? `${SITE_URL}/?listing=${l.id}` : SITE_URL;
    const deadlineAt = l.deadline_at ? new Date(String(l.deadline_at)) : null;
    const daysLeft = deadlineAt ? Math.max(0, Math.round((deadlineAt.getTime() - Date.now()) / 86400000)) : null;
    const endsLabel = daysLeft !== null ? `Closes in ${daysLeft}d` : String(l.date_label || "");
    return slotRow(String(l.property_name || ""), audience, `$${discPrice.toLocaleString("en-GB")}`, endsLabel, url);
  }).join("");

  const content = `
    ${h1("New open slots just added")}
    ${p(`Hi ${buyerName}, new open ad slots have just been added to the feed. These are time-sensitive host-read placements — they may be filled quickly.`)}
    <table cellpadding="0" cellspacing="0" width="100%">
      ${rows}
    </table>
    ${ctaButton("Browse All Open Slots &rarr;", SITE_URL, "#16a34a")}
    ${small("These slots default to programmatic if not filled. Secure early to lock in the best price.")}
  `;
  return {
    subject: "New open slots just added",
    html: wrapEmail(content, `New open podcast ad slots just added — browse before they close`, true, unsubLink),
  };
}

function buildSlotRequestReceived(data: Record<string, unknown>) {
  const buyerName = String(data.buyer_name || "there");
  const propertyName = String(data.property_name || "—");
  const slotType = String(data.slot_type || "—");
  const dateLabel = String(data.date_label || "—");

  const content = `
    ${h1("We're confirming your slot")}
    ${p(`Hi ${buyerName}, we've received your request to secure this open ad slot. We are now confirming availability with the media owner.`)}
    ${infoBox(`
      <p style="color:#1e40af;font-size:13px;font-weight:600;margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">No payment taken yet</p>
      <p style="color:#6e6e73;font-size:13px;margin:0;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">No payment has been taken at this stage. You'll receive a separate email once availability is confirmed.</p>
    `, "blue")}
    ${dataTable(
      dataRow("Open slot", propertyName) +
      dataRow("Format", slotType) +
      dataRow("Episode date", dateLabel)
    )}
    ${p("We'll update you shortly. If you have questions in the meantime, reply to this email.")}
  `;
  return {
    subject: "We're confirming your slot",
    html: wrapEmail(content, `Your request for the open ad slot on ${propertyName} is being confirmed`),
  };
}

function buildSlotConfirmed(data: Record<string, unknown>) {
  const buyerName = String(data.buyer_name || "there");
  const propertyName = String(data.property_name || "—");
  const slotType = String(data.slot_type || "—");
  const dateLabel = String(data.date_label || "—");
  const price = Number(data.price || 0).toLocaleString("en-GB");
  const depositAmount = Number(data.deposit_amount || 0).toLocaleString("en-GB");
  const currency = String(data.currency || "$");
  const paymentUrl = String(data.payment_url || SITE_URL);

  const content = `
    ${h1("Your open slot is ready to secure")}
    ${p(`Hi ${buyerName}, this open ad slot is still available.`)}
    ${urgencyBar("This slot closes soon. Securing is fast — 5% deposit locks it instantly.")}
    ${dataTable(
      dataRow("Open slot", propertyName) +
      dataRow("Format", slotType) +
      dataRow("Episode date", dateLabel) +
      dataRow("Total price", `${currency}${price}`) +
      dataRow("Deposit to pay now (5%)", `${currency}${depositAmount}`)
    )}
    ${ctaButton("Secure This Slot &rarr;", paymentUrl, "#16a34a")}
    ${infoBox(`<p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Why secure now?</p><p style="color:#6e6e73;font-size:13px;margin:0;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">If this slot isn't secured before the deadline, it will be removed from the feed and default to programmatic. The 5% deposit locks your position immediately.</p>`, "green")}
    ${small("Host contact details are released immediately after payment.")}
  `;
  return {
    subject: "Your open slot is ready to secure",
    html: wrapEmail(content, `${propertyName} is still available — secure now before it closes`),
  };
}

function buildSlotUnavailable(data: Record<string, unknown>) {
  const buyerName = String(data.buyer_name || "there");
  const propertyName = String(data.property_name || "—");
  const alternativeListings = (data.alternative_listings as Array<Record<string, unknown>>) || [];

  const altRows = alternativeListings.slice(0, 3).map((l) => {
    const discPrice = Number(l.discounted_price || 0);
    const audience = String(l.audience || l.location || "");
    const url = l.id ? `${SITE_URL}/?listing=${l.id}` : SITE_URL;
    const deadlineAt = l.deadline_at ? new Date(String(l.deadline_at)) : null;
    const daysLeft = deadlineAt ? Math.max(0, Math.round((deadlineAt.getTime() - Date.now()) / 86400000)) : null;
    return slotRow(String(l.property_name || ""), audience, `$${discPrice.toLocaleString("en-GB")}`, daysLeft !== null ? `Closes in ${daysLeft}d` : "", url);
  }).join("");

  const content = `
    ${h1("This slot has been taken")}
    ${p(`Hi ${buyerName}, the open ad slot on <strong style="color:#1d1d1f;">${propertyName}</strong> is no longer available.`)}
    ${alternativeListings.length > 0 ? `
      ${h2("Similar open slots still available")}
      <table cellpadding="0" cellspacing="0" width="100%">
        ${altRows}
      </table>
    ` : ""}
    ${ctaButton("View All Open Slots &rarr;", SITE_URL)}
    ${small("Open slots close fast. Set up alerts in your dashboard to be notified first when new slots are added.")}
  `;
  return {
    subject: "This slot has been taken",
    html: wrapEmail(content, `The open slot on ${propertyName} is gone — similar slots still available`),
  };
}

function buildSellerNewRequest(data: Record<string, unknown>) {
  const sellerName = String(data.seller_name || "there");
  const propertyName = String(data.property_name || "—");
  const dateLabel = String(data.date_label || "—");
  const price = Number(data.price || 0).toLocaleString("en-GB");
  const currency = String(data.currency || "$");
  const buyerName = String(data.buyer_name || "—");
  const buyerCompany = String(data.buyer_company || "");
  const buyerEmail = String(data.buyer_email || "—");
  const confirmUrl = String(data.confirm_url || SITE_URL);
  const declineUrl = String(data.decline_url || SITE_URL);

  const content = `
    ${h1("New request for your open slot")}
    ${p(`Hi ${sellerName}, you've received a request for one of your open ad slots. Confirm quickly — fast responses maximise your chance of filling the slot.`)}
    ${infoBox(`
      <p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Buyer details</p>
      <p style="color:#1d1d1f;font-size:14px;font-weight:600;margin:0 0 2px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">${buyerName}${buyerCompany ? ` &mdash; ${buyerCompany}` : ""}</p>
      <p style="color:#6e6e73;font-size:13px;margin:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;"><a href="mailto:${buyerEmail}" style="color:#16a34a;text-decoration:none;">${buyerEmail}</a></p>
    `, "green")}
    ${dataTable(
      dataRow("Open slot", propertyName) +
      dataRow("Episode date", dateLabel) +
      dataRow("Listed price", `${currency}${price}`)
    )}
    <p style="color:#1d1d1f;font-size:14px;font-weight:600;margin:0 0 12px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Please confirm if this slot is still available:</p>
    ${ctaButton("Confirm Availability &rarr;", confirmUrl, "#16a34a")}
    ${secondaryButton("Mark Unavailable", declineUrl)}
    ${small("Faster responses increase your fill rate. If this slot defaults due to no response, it may fall to programmatic.")}
  `;
  return {
    subject: `New request for your open slot — ${propertyName}`,
    html: wrapEmail(content, `A buyer has requested your open slot on ${propertyName} — confirm availability`),
  };
}

function buildSellerRequestReminder(data: Record<string, unknown>) {
  const sellerName = String(data.seller_name || "there");
  const propertyName = String(data.property_name || "—");
  const confirmUrl = String(data.confirm_url || SITE_URL);

  const content = `
    ${h1("Reminder: open slot request pending")}
    ${p(`Hi ${sellerName}, you have a pending buyer request for an open slot on <strong style="color:#1d1d1f;">${propertyName}</strong>.`)}
    ${urgencyBar("Please confirm availability so the buyer can proceed. Delays cost you the booking.")}
    ${p("Confirm whether this slot is still available so the buyer can proceed to payment.")}
    ${ctaButton("Confirm Availability &rarr;", confirmUrl, "#dc2626")}
    ${small("If you no longer have this slot available, reply to this email and we'll remove it from the feed.")}
  `;
  return {
    subject: `Reminder: open slot request pending — ${propertyName}`,
    html: wrapEmail(content, `Pending buyer request on ${propertyName} — confirm to proceed`),
  };
}

function buildSellerWeeklyNudge(data: Record<string, unknown>) {
  const sellerName = String(data.seller_name || "there");
  const submitEmail = "slots@endingthisweek.media";

  const content = `
    ${h1("Any open slots this week?")}
    ${p(`Hi ${sellerName}, if you have unsold ad slots coming up this week, reply to this email or send details to <a href="mailto:${submitEmail}" style="color:#16a34a;text-decoration:none;">${submitEmail}</a>.`)}
    ${infoBox(`
      <p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">What to include</p>
      <ul style="color:#6e6e73;font-size:13px;line-height:1.9;padding-left:18px;margin:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
        <li>Podcast name and episode date</li>
        <li>Slot format (pre-roll, mid-roll, post-roll)</li>
        <li>Downloads per episode</li>
        <li>Your asking price</li>
      </ul>
    `, "green")}
    ${p("We list and promote your slots immediately to active buyers — before they fall back to programmatic.")}
    ${ctaButton("Submit Open Slots &rarr;", `${SITE_URL}/list`)}
    ${small("We help fill inventory that would otherwise go to waste. No commission on the deal.")}
  `;
  return {
    subject: "Any open slots this week?",
    html: wrapEmail(content, "Got unsold inventory? Submit it before it defaults to programmatic"),
  };
}

function buildSlotExpired(data: Record<string, unknown>) {
  const sellerName = String(data.seller_name || "there");
  const propertyName = String(data.property_name || "—");
  const submitEmail = "slots@endingthisweek.media";

  const content = `
    ${h1("Your slot has expired")}
    ${p(`Hi ${sellerName}, your open ad slot for <strong style="color:#1d1d1f;">${propertyName}</strong> has now expired and has been removed from the feed.`)}
    ${p("If you have new availability this week, send the details and we'll list it immediately.")}
    ${ctaButton("Submit New Open Slots &rarr;", `${SITE_URL}/list`)}
    ${small(`Or email your slot details directly to <a href="mailto:${submitEmail}" style="color:#16a34a;text-decoration:none;">${submitEmail}</a> — we'll list it within hours.`)}
  `;
  return {
    subject: `Your slot has expired — ${propertyName}`,
    html: wrapEmail(content, `Your open slot on ${propertyName} has expired`),
  };
}

function buildSlotSecuredSeller(data: Record<string, unknown>) {
  const sellerName = String(data.seller_name || "there");
  const propertyName = String(data.property_name || "—");
  const buyerName = String(data.buyer_name || "—");

  const content = `
    ${h1("Your slot has been secured")}
    ${p(`Hi ${sellerName}, your open ad slot for <strong style="color:#1d1d1f;">${propertyName}</strong> has been successfully secured by ${buyerName}. This slot will no longer default to programmatic.`)}
    ${p("You can now complete the booking directly with the buyer. Their contact details have been released to them — they will be in touch.")}
    ${ctaButton("View Seller Dashboard &rarr;", `${SITE_URL}/seller`)}
    ${small("If you do not hear from the buyer within 48 hours, reply to this email and we'll assist.")}
  `;
  return {
    subject: `Your slot has been secured — ${propertyName}`,
    html: wrapEmail(content, `${buyerName} has secured your open slot on ${propertyName}`),
  };
}

function buildAccountInvite(data: Record<string, unknown>) {
  const name = String(data.display_name || "there");
  const company = String(data.company || "");
  const claimUrl = String(data.claim_url || SITE_URL);

  const content = `
    ${h1(`Your seller account is ready, ${name}`)}
    ${p("An account has been created for you on EndingThisWeek.media. Your open podcast ad slots are live and visible to active buyers in the feed.")}
    ${company ? dataTable(dataRow("Publisher", company)) : ""}
    ${infoBox(`<p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Claim your account</p><p style="color:#6e6e73;font-size:13px;margin:0;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Click below to set your password and access your seller dashboard — where you can manage open slots, edit listings, and track bookings.</p>`, "green")}
    ${ctaButton("Claim Your Account &rarr;", claimUrl, "#16a34a")}
    ${divider()}
    ${small("Once claimed, you can add new open slots, manage bookings, and update your publisher profile.")}
    ${small("This link expires in 24 hours. If you did not expect this email, you can safely ignore it.")}
  `;
  return {
    subject: "Your EndingThisWeek.media seller account is ready",
    html: wrapEmail(content, "Your seller account is ready — claim it to manage your open slots"),
  };
}

function buildContactForm(data: Record<string, unknown>) {
  const name = String(data.name || "—");
  const email = String(data.email || "—");
  const subject = String(data.subject || "General enquiry");
  const message = String(data.message || "—");

  const content = `
    ${h1("New contact form submission")}
    ${dataTable(
      dataRow("Name", name) +
      dataRow("Email", `<a href="mailto:${email}" style="color:#16a34a;text-decoration:none;">${email}</a>`) +
      dataRow("Subject", subject)
    )}
    ${h2("Message")}
    <div style="background:#f5f5f7;border:1px solid rgba(0,0,0,0.06);border-radius:12px;padding:18px 20px;margin:0 0 24px 0;">
      <p style="color:#3a3a3c;font-size:14px;line-height:1.7;margin:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;white-space:pre-wrap;">${message}</p>
    </div>
    ${infoBox(`<p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Reply directly</p><p style="color:#6e6e73;font-size:13px;margin:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">Reply to this email or contact <a href="mailto:${email}" style="color:#16a34a;text-decoration:none;">${email}</a> directly.</p>`, "green")}
  `;
  return {
    subject: `Contact: ${subject} — from ${name}`,
    html: wrapEmail(content, `New message from ${name} via EndingThisWeek.media`),
  };
}

// ─── Router ───────────────────────────────────────────────────────────────────

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
      case "welcome_buyer":             emailContent = buildWelcomeBuyer(data); break;
      case "welcome_seller":            emailContent = buildWelcomeSeller(data); break;
      case "booking_confirmation_buyer": emailContent = buildBookingConfirmationBuyer(data); break;
      case "booking_confirmation_seller": emailContent = buildBookingConfirmationSeller(data); break;
      case "slot_listed":               emailContent = buildSlotListed(data); break;
      case "admin_slot_published":      emailContent = buildAdminSlotPublished(data); break;
      case "opportunity_digest":        emailContent = buildOpportunityDigest(data); break;
      case "closing_soon_digest":       emailContent = buildClosingSoonDigest(data); break;
      case "new_slots_alert":           emailContent = buildNewSlotsAlert(data); break;
      case "slot_request_received":     emailContent = buildSlotRequestReceived(data); break;
      case "slot_confirmed":            emailContent = buildSlotConfirmed(data); break;
      case "slot_unavailable":          emailContent = buildSlotUnavailable(data); break;
      case "seller_new_request":        emailContent = buildSellerNewRequest(data); break;
      case "seller_request_reminder":   emailContent = buildSellerRequestReminder(data); break;
      case "seller_weekly_nudge":       emailContent = buildSellerWeeklyNudge(data); break;
      case "slot_expired":              emailContent = buildSlotExpired(data); break;
      case "slot_secured_seller":       emailContent = buildSlotSecuredSeller(data); break;
      case "account_invite":            emailContent = buildAccountInvite(data); break;
      case "contact_form":              emailContent = buildContactForm(data); break;
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
        from: "EndingThisWeek.media <hello@updates.endingthisweek.media>",
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
