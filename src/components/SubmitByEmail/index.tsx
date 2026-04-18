import { useState } from 'react';
import { Mail, Copy, Check, ChevronDown, ChevronUp, Zap, Clock, Layers, ArrowRight } from 'lucide-react';

const SUBMISSION_EMAIL = 'slots@endingthisweek.media';

const SINGLE_TEMPLATE = `Media Name: Irish Startup Weekly
Media Type: Newsletter
Audience Size: 18,000
Opportunity Type: Sponsored Slot
Original Price: €350
Discount Price: €250
Slots Available: 2
Deadline: Friday 6pm
Category: Startups / Business
Booking URL: https://example.com
Description: One dedicated sponsor slot available in this week's edition.`;

const MULTI_TEMPLATE = `--- SLOT 1 ---
Media Name: Irish Startup Weekly
Media Type: Newsletter
Audience Size: 18,000
Opportunity Type: Sponsored Slot
Original Price: €350
Discount Price: €250
Slots Available: 2
Deadline: Friday 6pm
Category: Startups / Business
Booking URL: https://example.com
Description: One dedicated sponsor slot available in this week's edition.

--- SLOT 2 ---
Media Name: Founder Playbook Podcast
Media Type: Podcast
Audience Size: 25,000 downloads/month
Opportunity Type: Mid-roll Ad
Original Price: €500
Discount Price: €325
Slots Available: 1
Deadline: Thursday 5pm
Category: Business / Entrepreneurship
Booking URL: https://example.com
Description: Mid-roll placement in this week's upcoming episode.`;

interface SubmitByEmailProps {
  variant?: 'full' | 'compact';
}

export default function SubmitByEmail({ variant = 'full' }: SubmitByEmailProps) {
  const [emailCopied, setEmailCopied] = useState(false);
  const [singleCopied, setSingleCopied] = useState(false);
  const [multiCopied, setMultiCopied] = useState(false);
  const [showMulti, setShowMulti] = useState(false);

  const copy = async (text: string, setter: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  if (variant === 'compact') {
    return (
      <div className="bg-[#1d1d1f] rounded-3xl p-6 border border-white/[0.08]">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-white/[0.08] border border-white/[0.12] rounded-2xl flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="w-5 h-5 text-white/70" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-base mb-1">Prefer to submit by email?</h3>
            <p className="text-white/50 text-sm mb-4 leading-relaxed">
              Send your unsold slots directly to us. We'll turn them into draft listings for review — no form needed.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 py-2 flex-1 min-w-0">
                <Mail className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <span className="text-white/80 text-sm font-mono truncate">{SUBMISSION_EMAIL}</span>
              </div>
              <button
                onClick={() => copy(SUBMISSION_EMAIL, setEmailCopied)}
                className="flex items-center gap-1.5 bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white/70 hover:text-white text-xs font-medium px-3 py-2 rounded-xl transition-all shrink-0"
              >
                {emailCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {emailCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#f5f5f7] border border-black/[0.08] text-[#6e6e73] text-[12px] font-medium px-4 py-1.5 rounded-full mb-5">
            <Mail className="w-3.5 h-3.5" />
            Submit by Email
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#1d1d1f] tracking-[-0.02em] mb-3">
            Email your unsold slots to us
          </h2>
          <p className="text-[#6e6e73] text-lg max-w-xl mx-auto leading-relaxed">
            Send one or multiple opportunities in the format below and we'll turn them into draft listings for review.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: <Zap className="w-4 h-4" />, title: 'No form required', desc: 'Skip the form entirely — just email us your slots' },
            { icon: <Layers className="w-4 h-4" />, title: 'Multiple slots, one email', desc: 'Send several opportunities in a single structured email' },
            { icon: <Clock className="w-4 h-4" />, title: 'Faster for repeat sellers', desc: 'Copy, fill, send — quicker than logging in every time' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-sm">
              <div className="w-8 h-8 bg-[#f5f5f7] border border-black/[0.06] rounded-xl flex items-center justify-center mb-3 text-[#1d1d1f]">
                {icon}
              </div>
              <p className="text-[#1d1d1f] font-semibold text-sm mb-1">{title}</p>
              <p className="text-[#6e6e73] text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm mb-6">
          <div className="px-6 py-5 border-b border-black/[0.06] flex items-center justify-between">
            <div>
              <h3 className="text-[#1d1d1f] font-semibold text-base">Your submission address</h3>
              <p className="text-[#6e6e73] text-sm mt-0.5">Send your slots to this address — nothing auto-publishes, all submissions go to admin review first.</p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex items-center gap-3 bg-[#f5f5f7] border border-black/[0.08] rounded-2xl px-5 py-3.5 flex-1">
                <Mail className="w-4 h-4 text-[#86868b] shrink-0" />
                <span className="text-[#1d1d1f] font-mono font-semibold text-base tracking-tight">{SUBMISSION_EMAIL}</span>
              </div>
              <button
                onClick={() => copy(SUBMISSION_EMAIL, setEmailCopied)}
                className="flex items-center justify-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold px-6 py-3.5 rounded-2xl transition-all text-sm shrink-0"
              >
                {emailCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {emailCopied ? 'Copied!' : 'Copy address'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm mb-6">
          <div className="px-6 py-5 border-b border-black/[0.06] flex items-center justify-between">
            <div>
              <h3 className="text-[#1d1d1f] font-semibold text-base">Single slot format</h3>
              <p className="text-[#6e6e73] text-sm mt-0.5">Use this format when submitting one opportunity. For fastest approval, include all fields.</p>
            </div>
            <button
              onClick={() => copy(SINGLE_TEMPLATE, setSingleCopied)}
              className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] border border-black/[0.08] hover:border-black/[0.16] text-sm font-medium px-3.5 py-2 rounded-xl transition-all shrink-0"
            >
              {singleCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {singleCopied ? 'Copied' : 'Copy template'}
            </button>
          </div>
          <div className="p-6">
            <pre className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-5 text-sm text-[#1d1d1f] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
{SINGLE_TEMPLATE}
            </pre>
            <p className="mt-4 text-[#86868b] text-xs flex items-start gap-1.5">
              <span className="text-[#1d1d1f] font-semibold">Tip:</span>
              For fastest approval, use the format shown above. Missing fields will be flagged for manual review.
            </p>
          </div>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm">
          <button
            onClick={() => setShowMulti(v => !v)}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-[#fafafa] transition-colors"
          >
            <div className="text-left">
              <h3 className="text-[#1d1d1f] font-semibold text-base">Multiple slots in one email</h3>
              <p className="text-[#6e6e73] text-sm mt-0.5">Separate each opportunity with a clear divider — we'll parse each one individually.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              {showMulti ? (
                <ChevronUp className="w-4 h-4 text-[#86868b]" />
              ) : (
                <>
                  <span className="text-[#6e6e73] text-sm font-medium hidden sm:block">Show format</span>
                  <ChevronDown className="w-4 h-4 text-[#86868b]" />
                </>
              )}
            </div>
          </button>

          {showMulti && (
            <div className="border-t border-black/[0.06]">
              <div className="px-6 py-4 flex items-center justify-between border-b border-black/[0.04]">
                <p className="text-[#6e6e73] text-sm">Each <span className="font-mono font-semibold text-[#1d1d1f]">--- SLOT N ---</span> header starts a new opportunity. Each becomes its own pending listing in admin review.</p>
                <button
                  onClick={() => copy(MULTI_TEMPLATE, setMultiCopied)}
                  className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] border border-black/[0.08] hover:border-black/[0.16] text-sm font-medium px-3.5 py-2 rounded-xl transition-all shrink-0 ml-4"
                >
                  {multiCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {multiCopied ? 'Copied' : 'Copy template'}
                </button>
              </div>
              <div className="p-6">
                <pre className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-5 text-sm text-[#1d1d1f] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
{MULTI_TEMPLATE}
                </pre>
                <p className="mt-4 text-[#86868b] text-xs">
                  <span className="text-[#1d1d1f] font-semibold">Note:</span> If your email includes multiple opportunities without the slot dividers, we'll still capture it — but it may be flagged as "Needs Review" for manual parsing.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-[#f5f5f7] border border-black/[0.06] rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[#1d1d1f] font-semibold text-sm mb-1">What happens after you send?</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-[#6e6e73] text-xs">
              <span>1. We receive your email</span>
              <ArrowRight className="w-3 h-3 mt-0.5 hidden sm:block" />
              <span>2. Each slot is parsed into a draft listing</span>
              <ArrowRight className="w-3 h-3 mt-0.5 hidden sm:block" />
              <span>3. Admin reviews and approves each one</span>
              <ArrowRight className="w-3 h-3 mt-0.5 hidden sm:block" />
              <span>4. Published to the marketplace</span>
            </div>
          </div>
          <a
            href={`mailto:${SUBMISSION_EMAIL}`}
            className="flex items-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold px-5 py-3 rounded-2xl transition-all text-sm shrink-0"
          >
            <Mail className="w-4 h-4" />
            Open in mail app
          </a>
        </div>
      </div>
    </div>
  );
}
