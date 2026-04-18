import { useState } from 'react';
import { Mail, Copy, Check, Zap, Clock, Layers, ArrowRight, Shield, ChevronDown, ChevronUp, Download } from 'lucide-react';

const SUBMISSION_EMAIL = 'slots@endingthisweek.media';

const TEMPLATE_FIELDS = [
  { key: 'Media Name', example: 'SaaS Growth Weekly', required: true },
  { key: 'Media Type', example: 'Newsletter', required: true },
  { key: 'Audience Size', example: '48,000', required: true },
  { key: 'Opportunity Type', example: 'Featured sponsor', required: true },
  { key: 'Original Price', example: '$1,200', required: true },
  { key: 'Discount Price', example: '$840', required: true },
  { key: 'Slots Available', example: '2', required: false },
  { key: 'Deadline', example: 'Wednesday 5pm', required: true },
  { key: 'Category', example: 'SaaS / B2B', required: false },
  { key: 'Booking URL', example: 'https://example.com/advertise', required: false },
  { key: 'Description', example: 'Featured sponsor slot in our Thursday edition reaching 48k SaaS founders and growth marketers.', required: false },
];

const SLOT_2_VALUES: Record<string, string> = {
  'Media Name': 'The Founder Brief',
  'Media Type': 'Newsletter',
  'Audience Size': '32,000',
  'Opportunity Type': 'Dedicated send',
  'Original Price': '$900',
  'Discount Price': '$630',
  'Slots Available': '1',
  'Deadline': 'Sunday 6pm',
  'Category': 'Startups / Business',
  'Booking URL': 'https://example.com/founder-brief',
  'Description': 'A dedicated send to 32k early-stage founders. Your brand owns the entire edition.',
};

const SINGLE_TEMPLATE = TEMPLATE_FIELDS.map(f => `${f.key}: ${f.example}`).join('\n');
const MULTI_TEMPLATE =
  '--- SLOT 1 ---\n' +
  TEMPLATE_FIELDS.map(f => `${f.key}: ${f.example}`).join('\n') +
  '\n\n--- SLOT 2 ---\n' +
  TEMPLATE_FIELDS.map(f => `${f.key}: ${SLOT_2_VALUES[f.key] ?? f.example}`).join('\n');

const DOWNLOAD_TEMPLATE =
`EndingThisWeek.media — Email Submission Template
=================================================
Send this email to: slots@endingthisweek.media
Subject: New Slots — [Your Newsletter Name]

Instructions:
- Each slot starts with --- SLOT N ---
- Replace the example values below with your own details
- Delete any fields you don't have (optional ones only)
- Fields marked (required) must be included for fast approval
- You can add more slots by copying the block and incrementing the number

=================================================

--- SLOT 1 ---
Media Name: SaaS Growth Weekly          (required)
Media Type: Newsletter                  (required)
Audience Size: 48,000                   (required)
Opportunity Type: Featured sponsor      (required)
Original Price: $1,200                  (required)
Discount Price: $840                    (required)
Slots Available: 2
Deadline: Wednesday 5pm                 (required)
Category: SaaS / B2B
Booking URL: https://your-booking-link.com
Description: Featured sponsor slot in our Thursday edition reaching 48k SaaS founders and growth marketers. Full header placement, logo, and a 150-word write-up.

--- SLOT 2 ---
Media Name: The Founder Brief           (required)
Media Type: Newsletter                  (required)
Audience Size: 32,000                   (required)
Opportunity Type: Dedicated send        (required)
Original Price: $900                    (required)
Discount Price: $630                    (required)
Slots Available: 1
Deadline: Sunday 6pm                    (required)
Category: Startups / Business
Booking URL: https://your-booking-link.com
Description: A dedicated send to 32k early-stage founders. Your brand owns the entire edition — full creative control, your subject line, your message.

=================================================
Need help? Reply to any of our emails and we'll assist you.
`;

function downloadTemplate() {
  const blob = new Blob([DOWNLOAD_TEMPLATE], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'endingthisweek-slot-template.txt';
  a.click();
  URL.revokeObjectURL(url);
}

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
    setTimeout(() => setter(false), 2500);
  };

  if (variant === 'compact') {
    return (
      <div className="bg-[#1d1d1f] rounded-3xl p-6 border border-white/[0.06]">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-white/[0.08] border border-white/[0.12] rounded-2xl flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="w-5 h-5 text-white/70" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-1">Prefer email?</p>
            <h3 className="text-white font-semibold text-base mb-1.5 tracking-[-0.01em]">Submit your slots by email</h3>
            <p className="text-white/50 text-sm mb-3 leading-relaxed">
              No form needed. Send one or multiple slots in the structured format and we'll turn them into draft listings for review.
            </p>
            <div className="mb-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3">
              <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-1.5">Not sure of the format?</p>
              <p className="text-white/50 text-xs leading-relaxed mb-2.5">
                Download the template — it includes 2 pre-filled newsletter slots with real example data so you can see exactly how to structure your email. Edit the values, delete what you don't need, and send.
              </p>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 bg-white/[0.10] hover:bg-white/[0.18] border border-white/[0.14] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download example template (.txt)
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.10] rounded-xl px-3.5 py-2.5 flex-1 min-w-0">
                <Mail className="w-3.5 h-3.5 text-white/35 shrink-0" />
                <span className="text-white/80 text-sm font-mono truncate">{SUBMISSION_EMAIL}</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => copy(SUBMISSION_EMAIL, setEmailCopied)}
                  className="flex items-center gap-1.5 bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white/70 hover:text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all"
                >
                  {emailCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {emailCopied ? 'Copied!' : 'Copy'}
                </button>
                <a
                  href={`mailto:${SUBMISSION_EMAIL}`}
                  className="flex items-center gap-1.5 bg-white text-[#1d1d1f] hover:bg-white/90 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Open email
                </a>
              </div>
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
          <div className="inline-flex items-center gap-2 bg-[#f5f5f7] border border-black/[0.08] text-[#6e6e73] text-[11px] font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Zap className="w-4 h-4" />, title: 'No form required', desc: 'Skip the form entirely — just send us your slots by email' },
            { icon: <Layers className="w-4 h-4" />, title: 'Multiple slots, one email', desc: 'Submit several opportunities at once in a single structured email' },
            { icon: <Clock className="w-4 h-4" />, title: 'Faster for repeat sellers', desc: 'Copy the template, fill in your details, and send — takes under a minute' },
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

        <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm mb-5">
          <div className="px-6 py-5 border-b border-black/[0.06]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[#1d1d1f] font-semibold text-base">Submission address</h3>
                <p className="text-[#6e6e73] text-sm mt-0.5">All submissions go to admin review first — nothing auto-publishes.</p>
              </div>
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg shrink-0">
                <Shield className="w-3 h-3" />
                Reviewed before publishing
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-3 bg-[#f5f5f7] border border-black/[0.08] rounded-2xl px-5 py-4 flex-1">
                <Mail className="w-4 h-4 text-[#86868b] shrink-0" />
                <span className="text-[#1d1d1f] font-mono font-semibold text-base tracking-tight select-all">{SUBMISSION_EMAIL}</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => copy(SUBMISSION_EMAIL, setEmailCopied)}
                  className={`flex items-center justify-center gap-2 font-semibold px-5 py-4 rounded-2xl transition-all text-sm flex-1 sm:flex-auto ${
                    emailCopied
                      ? 'bg-green-600 text-white'
                      : 'bg-[#f5f5f7] border border-black/[0.08] hover:border-black/[0.16] text-[#1d1d1f]'
                  }`}
                >
                  {emailCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {emailCopied ? 'Copied!' : 'Copy'}
                </button>
                <a
                  href={`mailto:${SUBMISSION_EMAIL}`}
                  className="flex items-center justify-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold px-5 py-4 rounded-2xl transition-all text-sm flex-1 sm:flex-auto"
                >
                  <Mail className="w-4 h-4" />
                  Open in mail app
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm mb-5">
          <div className="px-6 py-5 border-b border-black/[0.06] flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-[#1d1d1f] font-semibold text-base">Single slot template</h3>
                <span className="bg-[#f5f5f7] border border-black/[0.06] text-[#86868b] text-[10px] font-semibold px-2 py-0.5 rounded-lg uppercase tracking-wide">1 slot</span>
              </div>
              <p className="text-[#6e6e73] text-sm">Copy this, fill in your details, and paste into your email. All fields help us process faster.</p>
            </div>
            <button
              onClick={() => copy(SINGLE_TEMPLATE, setSingleCopied)}
              className={`flex items-center gap-2 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shrink-0 ${
                singleCopied
                  ? 'bg-green-600 text-white'
                  : 'bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white'
              }`}
            >
              {singleCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {singleCopied ? 'Copied!' : 'Copy template'}
            </button>
          </div>
          <div className="p-6">
            <div className="bg-[#fafafa] border border-black/[0.06] rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-black/[0.05] flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-black/[0.08]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-black/[0.08]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-black/[0.08]" />
                </div>
                <span className="text-[#aeaeb2] text-xs ml-1">Email body</span>
              </div>
              <div className="p-5">
                {TEMPLATE_FIELDS.map(({ key, example, required }) => (
                  <div key={key} className="flex items-baseline gap-0 leading-7">
                    <span className="font-mono text-sm text-[#6e6e73] shrink-0 w-44">{key}:</span>
                    <span className="font-mono text-sm text-[#1d1d1f]">{example}</span>
                    {required && (
                      <span className="ml-2 text-[9px] font-bold text-red-400 uppercase tracking-wide shrink-0 self-center">required</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-[#86868b] text-xs leading-relaxed">
              <span className="text-[#1d1d1f] font-semibold">Tip:</span> Fields marked <span className="text-red-400 font-semibold">required</span> are needed for fastest approval. Optional fields help buyers make quicker decisions.
            </p>
          </div>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm mb-8">
          <button
            onClick={() => setShowMulti(v => !v)}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-[#fafafa] transition-colors"
          >
            <div className="text-left">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-[#1d1d1f] font-semibold text-base">Multiple slots in one email</h3>
                <span className="bg-[#1d1d1f] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wide">2+ slots</span>
              </div>
              <p className="text-[#6e6e73] text-sm">Use a divider between each slot — we'll parse each one into a separate listing.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className="text-[#6e6e73] text-sm font-medium hidden sm:block">
                {showMulti ? 'Hide' : 'Show format'}
              </span>
              {showMulti ? (
                <ChevronUp className="w-4 h-4 text-[#86868b]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#86868b]" />
              )}
            </div>
          </button>

          {showMulti && (
            <div className="border-t border-black/[0.06]">
              <div className="px-6 py-4 bg-[#f5f5f7] border-b border-black/[0.06] flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <p className="text-[#6e6e73] text-sm leading-relaxed">
                  Start each opportunity with <code className="bg-white border border-black/[0.08] text-[#1d1d1f] font-mono font-semibold text-xs px-1.5 py-0.5 rounded-lg">--- SLOT N ---</code>. Each slot becomes its own separate draft in the admin review queue.
                </p>
                <button
                  onClick={() => copy(MULTI_TEMPLATE, setMultiCopied)}
                  className={`flex items-center gap-2 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shrink-0 ${
                    multiCopied
                      ? 'bg-green-600 text-white'
                      : 'bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white'
                  }`}
                >
                  {multiCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {multiCopied ? 'Copied!' : 'Copy full template'}
                </button>
              </div>

              <div className="p-6 space-y-4">
                {[
                  { label: 'SLOT 1', fields: TEMPLATE_FIELDS.map(f => ({ key: f.key, value: f.example })) },
                  { label: 'SLOT 2', fields: TEMPLATE_FIELDS.map(f => ({ key: f.key, value: SLOT_2_VALUES[f.key] ?? f.example })) },
                ].map(({ label, fields }) => (
                  <div key={label} className="bg-[#fafafa] border border-black/[0.06] rounded-2xl overflow-hidden">
                    <div className="px-5 py-2.5 bg-[#1d1d1f] flex items-center gap-2">
                      <span className="text-white/50 font-mono text-[11px]">---</span>
                      <span className="text-white font-mono font-bold text-xs tracking-widest">{label}</span>
                      <span className="text-white/50 font-mono text-[11px]">---</span>
                    </div>
                    <div className="p-5">
                      {fields.map(({ key, value }) => (
                        <div key={key} className="flex items-baseline gap-0 leading-7">
                          <span className="font-mono text-sm text-[#6e6e73] shrink-0 w-44">{key}:</span>
                          <span className="font-mono text-sm text-[#1d1d1f]">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <p className="text-[#86868b] text-xs leading-relaxed">
                  <span className="text-[#1d1d1f] font-semibold">Note:</span> You can include as many slots as you like in one email. If you forget the dividers, we'll still capture the email — but it may be flagged as "Needs Review" for manual parsing, which slows approval.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#1d1d1f] rounded-3xl p-6 sm:p-8">
          <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-4">What happens after you send</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { step: '01', title: 'We receive your email', desc: 'Your submission lands in our system within minutes' },
              { step: '02', title: 'Slots are parsed', desc: 'Each structured slot becomes a separate draft listing' },
              { step: '03', title: 'Admin review', desc: 'We verify details and prepare each listing for publishing' },
              { step: '04', title: 'Live on marketplace', desc: 'Approved listings go live for buyers to discover and book' },
            ].map(({ step, title, desc }, i, arr) => (
              <div key={step} className="flex sm:flex-col gap-4 sm:gap-2">
                <div className="flex items-center gap-2 shrink-0 sm:mb-1">
                  <span className="text-white/30 font-mono font-bold text-xs">{step}</span>
                  {i < arr.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-white/20 hidden sm:block" />
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-0.5">{title}</p>
                  <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
