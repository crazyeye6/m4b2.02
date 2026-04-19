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

async function getToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
}

async function sendEmail(type: EmailType, to: string, data: Record<string, unknown>) {
  try {
    const token = await getToken();
    await fetch(EDGE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, to, data }),
    });
  } catch {
  }
}

export function sendWelcomeEmail(to: string, role: "buyer" | "seller", displayName: string) {
  const type = role === "seller" ? "welcome_seller" : "welcome_buyer";
  return sendEmail(type, to, { display_name: displayName });
}

export function sendBookingConfirmationEmails(
  buyerEmail: string,
  sellerEmail: string,
  bookingData: Record<string, unknown>
) {
  sendEmail("booking_confirmation_buyer", buyerEmail, bookingData);
  if (sellerEmail) {
    sendEmail("booking_confirmation_seller", sellerEmail, bookingData);
  }
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
