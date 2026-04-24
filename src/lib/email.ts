import { supabase } from './supabase';

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;

type EmailType =
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

async function getToken(providedToken?: string): Promise<string> {
  if (providedToken) return providedToken;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
}

async function sendEmail(type: EmailType, to: string, data: Record<string, unknown>, token?: string): Promise<boolean> {
  try {
    const authToken = await getToken(token);
    const res = await fetch(EDGE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, to, data }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function sendWelcomeEmail(to: string, role: "buyer" | "seller", displayName: string, token?: string) {
  const type = role === "seller" ? "welcome_seller" : "welcome_buyer";
  return sendEmail(type, to, { display_name: displayName }, token);
}

export async function sendBookingConfirmationEmails(
  buyerEmail: string,
  sellerEmail: string,
  bookingData: Record<string, unknown>
): Promise<void> {
  const sends: Promise<boolean>[] = [sendEmail("booking_confirmation_buyer", buyerEmail, bookingData)];
  if (sellerEmail) {
    sends.push(sendEmail("booking_confirmation_seller", sellerEmail, bookingData));
  }
  await Promise.all(sends);
}

export function sendSlotListedEmail(to: string, listingData: Record<string, unknown>) {
  return sendEmail("slot_listed", to, listingData);
}

export function sendAdminSlotPublishedEmail(to: string, listingData: Record<string, unknown>) {
  return sendEmail("admin_slot_published", to, listingData);
}

export function sendOpportunityDigest(to: string, buyerName: string, listings: Record<string, unknown>[]) {
  return sendEmail("opportunity_digest", to, { buyer_name: buyerName, listings });
}

export function sendClosingSoonDigest(to: string, buyerName: string, listings: Record<string, unknown>[]) {
  return sendEmail("closing_soon_digest", to, { buyer_name: buyerName, listings });
}

export function sendNewSlotsAlert(to: string, buyerName: string, listings: Record<string, unknown>[]) {
  return sendEmail("new_slots_alert", to, { buyer_name: buyerName, listings });
}

export function sendSlotRequestReceived(to: string, data: {
  buyer_name: string;
  slot_name: string;
  slot_date: string;
  slot_price: number;
}) {
  return sendEmail("slot_request_received", to, data);
}

export function sendSlotConfirmed(to: string, data: {
  buyer_name: string;
  slot_name: string;
  slot_date: string;
  slot_price: number;
  deposit_amount: number;
  payment_url: string;
}) {
  return sendEmail("slot_confirmed", to, data);
}

export function sendSlotUnavailable(to: string, data: {
  buyer_name: string;
  slot_name: string;
  alternatives?: Record<string, unknown>[];
}) {
  return sendEmail("slot_unavailable", to, data);
}

export function sendSellerNewRequest(to: string, data: {
  seller_name: string;
  slot_name: string;
  slot_date: string;
  buyer_company?: string;
  confirm_url: string;
  decline_url: string;
}) {
  return sendEmail("seller_new_request", to, data);
}

export function sendSellerRequestReminder(to: string, data: {
  seller_name: string;
  slot_name: string;
  slot_date: string;
  hours_remaining: number;
  confirm_url: string;
}) {
  return sendEmail("seller_request_reminder", to, data);
}

export function sendSellerWeeklyNudge(to: string, data: {
  seller_name: string;
  submit_url: string;
}) {
  return sendEmail("seller_weekly_nudge", to, data);
}

export function sendSlotExpired(to: string, data: {
  seller_name: string;
  slot_name: string;
  slot_date: string;
  submit_url: string;
}) {
  return sendEmail("slot_expired", to, data);
}

export function sendSlotSecuredSeller(to: string, data: {
  seller_name: string;
  slot_name: string;
  slot_date: string;
  buyer_name: string;
  buyer_email: string;
  deposit_amount: number;
  balance_due: number;
}) {
  return sendEmail("slot_secured_seller", to, data);
}
