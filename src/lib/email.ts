import { supabase } from './supabase';

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;

type EmailType =
  | "welcome_buyer"
  | "welcome_seller"
  | "booking_confirmation_buyer"
  | "booking_confirmation_seller"
  | "slot_listed"
  | "admin_slot_published"
  | "opportunity_digest";

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

export function sendSlotListedEmail(
  to: string,
  listingData: Record<string, unknown>
) {
  return sendEmail("slot_listed", to, listingData);
}

export function sendAdminSlotPublishedEmail(
  to: string,
  listingData: Record<string, unknown>
) {
  return sendEmail("admin_slot_published", to, listingData);
}

export function sendOpportunityDigest(
  to: string,
  buyerName: string,
  listings: Record<string, unknown>[]
) {
  return sendEmail("opportunity_digest", to, { buyer_name: buyerName, listings });
}
