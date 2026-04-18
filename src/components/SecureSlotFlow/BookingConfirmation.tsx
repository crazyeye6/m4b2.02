import { CheckCircle, Copy, ExternalLink, Mail, Phone, Globe, Shield, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { DepositBooking, Listing } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import { useLocale } from '../../context/LocaleContext';

interface BookingConfirmationProps {
  booking: DepositBooking;
  listing: Listing;
  depositTotal: number;
  onClose: () => void;
}

export default function BookingConfirmation({ booking, listing, depositTotal, onClose }: BookingConfirmationProps) {
  const [copied, setCopied] = useState(false);
  const tx = useTranslations();
  const { formatPrice } = useLocale();

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
        <h3 className="text-[#1d1d1f] font-black text-2xl mb-1">{tx.confirmation.title}</h3>
        <p className="text-[#6e6e73] text-sm">{tx.confirmation.subtitle}</p>
      </div>

      <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.06]">
          <p className="text-[#86868b] text-xs uppercase tracking-wide font-semibold">{tx.confirmation.bookingRef}</p>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-[#1d1d1f] font-mono font-bold text-base tracking-wide">{booking.reference_number}</span>
          <button
            onClick={copyRef}
            className="flex items-center gap-1.5 text-xs text-[#6e6e73] hover:text-[#1d1d1f] transition-colors bg-white hover:bg-[#f5f5f7] border border-black/[0.08] px-2.5 py-1.5 rounded-xl"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? tx.confirmation.copied : tx.confirmation.copy}
          </button>
        </div>
      </div>

      <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.06]">
          <p className="text-[#86868b] text-xs uppercase tracking-wide font-semibold">{tx.confirmation.paymentSummary}</p>
        </div>
        <div className="p-4 space-y-2.5">
          <Row label={tx.confirmation.depositPaid} value={formatPrice(depositTotal)} highlight />
          <Row label={tx.confirmation.balanceDue} value={formatPrice(booking.balance_amount)} />
          <Row label={tx.confirmation.totalValue} value={formatPrice(booking.total_price)} />
        </div>
      </div>

      <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.06]">
          <p className="text-[#86868b] text-xs uppercase tracking-wide font-semibold">{tx.confirmation.opportunitySection}</p>
        </div>
        <div className="p-4 space-y-2">
          <Row label={tx.confirmation.creator} value={listing.media_owner_name} />
          <Row label={tx.confirmation.platform} value={listing.media_company_name} />
          <Row label={tx.confirmation.opportunity} value={listing.property_name} />
          <Row label={tx.confirmation.contentType} value={listing.slot_type} />
          <Row label={tx.confirmation.adSlotDate} value={listing.date_label} />
        </div>
      </div>

      {hasSellerContact && (
        <div className="bg-green-50 border border-green-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-green-100">
            <p className="text-green-700 text-xs uppercase tracking-wide font-semibold">{tx.confirmation.sellerContact}</p>
            <p className="text-green-600/70 text-xs mt-0.5">{tx.confirmation.sellerContactSub}</p>
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

      <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4">
        <p className="text-[#1d1d1f] text-xs font-semibold uppercase tracking-wide mb-3">{tx.confirmation.nextSteps}</p>
        <div className="space-y-3">
          {[
            tx.confirmation.step1,
            tx.confirmation.step2,
            tx.confirmation.step3,
            tx.confirmation.step4,
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-[#1d1d1f] text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
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
          <p className="text-[#86868b] text-xs font-semibold">{tx.confirmation.platformRole}</p>
        </div>
        <p className="text-[#6e6e73] text-xs leading-relaxed">
          {tx.confirmation.platformRoleText}
        </p>
      </div>

      <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4">
        <p className="text-[#86868b] text-xs font-semibold mb-2">{tx.confirmation.refundPolicy}</p>
        <p className="text-[#6e6e73] text-xs leading-relaxed mb-2">
          {tx.confirmation.refundText1}
        </p>
        <p className="text-[#6e6e73] text-xs">
          {tx.confirmation.refundText2}
        </p>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-bold py-3.5 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
      >
        {tx.confirmation.done}
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
