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
        <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-white font-black text-2xl mb-1">Slot Secured</h3>
        <p className="text-gray-400 text-sm">Your deposit has been paid and your slot is reserved</p>
      </div>

      <div className="bg-white/[0.03] border border-white/8 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Booking reference</p>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-white font-mono font-bold text-base tracking-wide">{booking.reference_number}</span>
          <button
            onClick={copyRef}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/8 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Payment summary</p>
        </div>
        <div className="p-4 space-y-2.5">
          <Row label="Deposit paid" value={`$${depositTotal.toLocaleString()}`} highlight />
          <Row label="Balance due to creator" value={`$${booking.balance_amount.toLocaleString()}`} />
          <Row label="Total campaign value" value={`$${booking.total_price.toLocaleString()}`} />
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/8 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Opportunity</p>
        </div>
        <div className="p-4 space-y-2">
          <Row label="Creator" value={listing.media_owner_name} />
          <Row label="Platform" value={listing.media_company_name} />
          <Row label="Opportunity" value={listing.property_name} />
          <Row label="Content type" value={listing.slot_type} />
          <Row label="Posting date" value={listing.date_label} />
        </div>
      </div>

      {hasSellerContact && (
        <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-emerald-500/10">
            <p className="text-emerald-400 text-xs uppercase tracking-wide font-semibold">Creator / seller contact</p>
            <p className="text-gray-400 text-xs mt-0.5">Released after deposit payment</p>
          </div>
          <div className="p-4 space-y-3">
            {booking.seller_name && (
              <p className="text-white font-semibold text-sm">{booking.seller_name}</p>
            )}
            {booking.seller_email && (
              <ContactRow icon={<Mail className="w-3.5 h-3.5 text-emerald-400" />} label={booking.seller_email} href={`mailto:${booking.seller_email}`} />
            )}
            {booking.seller_phone && (
              <ContactRow icon={<Phone className="w-3.5 h-3.5 text-emerald-400" />} label={booking.seller_phone} href={`tel:${booking.seller_phone}`} />
            )}
            {booking.seller_website && (
              <ContactRow icon={<Globe className="w-3.5 h-3.5 text-emerald-400" />} label={booking.seller_website} href={booking.seller_website} external />
            )}
          </div>
        </div>
      )}

      <div className="bg-blue-950/30 border border-blue-500/15 rounded-xl p-4">
        <p className="text-blue-400 text-xs font-semibold uppercase tracking-wide mb-3">Next steps</p>
        <div className="space-y-3">
          {[
            'Contact the creator using the details above',
            'Confirm final campaign details with the creator',
            'Pay the remaining balance directly to the creator',
            'Complete the campaign booking and brief handover',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-gray-400" />
          <p className="text-gray-400 text-xs font-semibold">Platform role</p>
        </div>
        <p className="text-gray-400 text-xs leading-relaxed">
          You have reserved this opportunity by paying a 10% deposit to EndingThisWeek.media. The remaining balance is arranged directly with the creator or seller. The creator will invoice you directly or follow standard commercial practice for their media niche.
        </p>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <p className="text-gray-400 text-xs font-semibold mb-2">Refund policy</p>
        <p className="text-gray-400 text-xs leading-relaxed mb-2">
          Deposit refunds are assessed case by case. You may be eligible if the seller cannot provide the opportunity, materially changes terms, or if the booking cannot proceed.
        </p>
        <p className="text-gray-400 text-xs">
          Refunds are not available if you change your mind, fail to respond, or request changes outside the original listing scope.
        </p>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
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
      <span className="text-gray-400 text-xs">{label}</span>
      <span className={`text-xs font-bold ${highlight ? 'text-emerald-400 text-sm' : 'text-white'}`}>{value}</span>
    </div>
  );
}

function ContactRow({ icon, label, href, external }: { icon: React.ReactNode; label: string; href: string; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="flex items-center gap-2 text-emerald-300 hover:text-emerald-200 transition-colors text-sm group"
    >
      {icon}
      <span className="text-sm">{label}</span>
      {external && <ExternalLink className="w-3 h-3 text-emerald-600 group-hover:text-emerald-400 transition-colors ml-auto" />}
    </a>
  );
}
