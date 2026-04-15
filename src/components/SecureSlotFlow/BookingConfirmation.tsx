import { CheckCircle, Copy, ExternalLink, Mail, Phone, Globe, Shield, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { DepositBooking, Listing } from '../../types';

interface BookingConfirmationProps {
  booking: DepositBooking;
  listing: Listing;
  depositTotal: number;
  onClose: () => void;
}

export default function BookingConfirmation({ booking, listing, depositTotal, onClose }: BookingConfirmationProps) {
  const [copied, setCopied] = useState(false);

  const copyRef = () => {
    navigator.clipboard.writeText(booking.reference_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasSellerContact = booking.seller_email || booking.seller_phone || booking.seller_website;

  return (
    <div className="space-y-5">
      <div className="text-center py-2">
        <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-[#1d1d1f] font-black text-2xl mb-1">Slot Secured</h3>
        <p className="text-[#6e6e73] text-sm">Your deposit has been paid and your slot is reserved</p>
      </div>

      <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.06]">
          <p className="text-[#86868b] text-xs uppercase tracking-wide font-semibold">Booking reference</p>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-[#1d1d1f] font-mono font-bold text-base tracking-wide">{booking.reference_number}</span>
          <button
            onClick={copyRef}
            className="flex items-center gap-1.5 text-xs text-[#6e6e73] hover:text-[#1d1d1f] transition-colors bg-white hover:bg-[#f5f5f7] border border-black/[0.08] px-2.5 py-1.5 rounded-xl"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.06]">
          <p className="text-[#86868b] text-xs uppercase tracking-wide font-semibold">Payment summary</p>
        </div>
        <div className="p-4 space-y-2.5">
          <Row label="Deposit paid" value={`$${depositTotal.toLocaleString()}`} highlight />
          <Row label="Balance due to creator" value={`$${booking.balance_amount.toLocaleString()}`} />
          <Row label="Total campaign value" value={`$${booking.total_price.toLocaleString()}`} />
        </div>
      </div>

      <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.06]">
          <p className="text-[#86868b] text-xs uppercase tracking-wide font-semibold">Opportunity</p>
        </div>
        <div className="p-4 space-y-2">
          <Row label="Creator" value={listing.media_owner_name} />
          <Row label="Platform" value={listing.media_company_name} />
          <Row label="Opportunity" value={listing.property_name} />
          <Row label="Content type" value={listing.slot_type} />
          <Row label="Ad slot date" value={listing.date_label} />
        </div>
      </div>

      {hasSellerContact && (
        <div className="bg-green-50 border border-green-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-green-100">
            <p className="text-green-700 text-xs uppercase tracking-wide font-semibold">Creator / seller contact</p>
            <p className="text-green-600/70 text-xs mt-0.5">Released after deposit payment</p>
          </div>
          <div className="p-4 space-y-3">
            {booking.seller_name && (
              <p className="text-[#1d1d1f] font-semibold text-sm">{booking.seller_name}</p>
            )}
            {booking.seller_email && (
              <ContactRow icon={<Mail className="w-3.5 h-3.5 text-green-600" />} label={booking.seller_email} href={`mailto:${booking.seller_email}`} />
            )}
            {booking.seller_phone && (
              <ContactRow icon={<Phone className="w-3.5 h-3.5 text-green-600" />} label={booking.seller_phone} href={`tel:${booking.seller_phone}`} />
            )}
            {booking.seller_website && (
              <ContactRow icon={<Globe className="w-3.5 h-3.5 text-green-600" />} label={booking.seller_website} href={booking.seller_website} external />
            )}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <p className="text-blue-700 text-xs font-semibold uppercase tracking-wide mb-3">Next steps</p>
        <div className="space-y-3">
          {[
            'Contact the creator using the details above',
            'Confirm final campaign details and the ad slot date',
            'Prepare and send your ad copy — allow lead time before the slot date',
            'Pay the remaining balance directly to the creator',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-[#6e6e73] text-xs leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-[#aeaeb2]" />
          <p className="text-[#86868b] text-xs font-semibold">Platform role</p>
        </div>
        <p className="text-[#6e6e73] text-xs leading-relaxed">
          You have reserved this opportunity by paying a 10% deposit to EndingThisWeek.media. The remaining balance is arranged directly with the creator or seller. The creator will invoice you directly or follow standard commercial practice for their media niche.
        </p>
      </div>

      <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4">
        <p className="text-[#86868b] text-xs font-semibold mb-2">Refund policy</p>
        <p className="text-[#6e6e73] text-xs leading-relaxed mb-2">
          Deposit refunds are assessed case by case. You may be eligible if the seller cannot provide the opportunity, materially changes terms, or if the booking cannot proceed.
        </p>
        <p className="text-[#6e6e73] text-xs">
          Refunds are not available if you change your mind, fail to respond, or request changes outside the original listing scope.
        </p>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-bold py-3.5 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
      >
        Done — View More Opportunities
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#86868b] text-xs">{label}</span>
      <span className={`text-xs font-bold ${highlight ? 'text-green-600 text-sm' : 'text-[#1d1d1f]'}`}>{value}</span>
    </div>
  );
}

function ContactRow({ icon, label, href, external }: { icon: React.ReactNode; label: string; href: string; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors text-sm group"
    >
      {icon}
      <span className="text-sm">{label}</span>
      {external && <ExternalLink className="w-3 h-3 text-green-400 group-hover:text-green-600 transition-colors ml-auto" />}
    </a>
  );
}
