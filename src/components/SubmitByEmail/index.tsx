import { useState } from 'react';
import { Mail, Copy, Check, Zap, Clock, Layers, ArrowRight, Shield, ChevronDown, ChevronUp, Download, Info } from 'lucide-react';

const SUBMISSION_EMAIL = 'slots@endingthisweek.media';

const NEWSLETTER_FIELDS = [
  { key: 'Media Type', example: 'Newsletter', required: true, note: 'Always Newsletter' },
  { key: 'Newsletter Name', example: 'Growth Insider', required: true, note: '' },
  { key: 'Publisher', example: 'Growth Insider Media', required: true, note: '' },
  { key: 'Category', example: 'Marketing / SaaS', required: true, note: 'e.g. Finance, B2B, Creator, Tech, DTC' },
  { key: 'Audience Size', example: '25,000', required: true, note: 'Subscriber count' },
  { key: 'Open Rate', example: '48%', required: false, note: 'Average open rate' },
  { key: 'Geography', example: 'UK / Europe', required: false, note: 'Primary audience region' },
  { key: 'Placement Type', example: 'Sponsored Placement', required: true, note: 'Featured, Dedicated, Classifieds, etc.' },
  { key: 'Send Date', example: 'Thursday 25 April', required: true, note: 'Issue send date' },
  { key: 'Deadline', example: 'Tuesday 23 April', required: true, note: 'Booking deadline' },
  { key: 'Rate Card Price', example: '€800', required: true, note: 'Standard list price' },
  { key: 'This Week Price', example: '€500', required: true, note: 'Your discounted offer' },
  { key: 'Slots Available', example: '2', required: false, note: '' },
  { key: 'Description', example: 'Weekly newsletter for SaaS founders and growth marketers', required: false, note: '' },
  { key: 'Past Advertisers', example: 'Notion, HubSpot, Loom', required: false, note: '' },
  { key: 'Sample Link', example: 'https://growthinside.co/issue-42', required: false, note: '' },
  { key: 'Booking URL', example: 'https://growthinside.co/advertise', required: false, note: '' },
];

const SLOT_2_VALUES: Record<string, string> = {
  'Media Type': 'Newsletter',
  'Newsletter Name': 'The Founder Brief',
  'Publisher': 'Founder Media Group',
  'Category': 'Startups / Business',
  'Audience Size': '32,000',
  'Open Rate': '41%',
  'Geography': 'US / UK',
  'Placement Type': 'Dedicated Send',
  'Send Date': 'Friday 26 April',
  'Deadline': 'Wednesday 24 April',
  'Rate Card Price': '$900',
  'This Week Price': '$590',
  'Slots Available': '1',
  'Description': 'A dedicated send to 32k early-stage founders. Your brand owns the entire edition.',
  'Past Advertisers': 'Stripe, Linear, Raycast',
  'Sample Link': 'https://founderbrief.co/sample',
  'Booking URL': 'https://founderbrief.co/advertise',
};

const SINGLE_TEMPLATE = NEWSLETTER_FIELDS.map(f => `${f.key}: ${f.example}`).join('\n');
const MULTI_TEMPLATE =
  '--- SLOT 1 ---\n' +
  NEWSLETTER_FIELDS.map(f => `${f.key}: ${f.example}`).join('\n') +
  '\n\n--- SLOT 2 ---\n' +
  NEWSLETTER_FIELDS.map(f => `${f.key}: ${SLOT_2_VALUES[f.key] ?? f.example}`).join('\n');

const DOWNLOAD_TEMPLATE =
`EndingThisWeek.media — Email Submission Template
=================================================
Send to: slots@endingthisweek.media
Subject: New Slots — [Your Newsletter Name]

Tips for fastest approval:
- Use the exact field names below (we parse them automatically)
- Required fields must be included for approval
- For multiple opportunities, repeat blocks separated by --- SLOT N ---
- Include open rate, geography, and past advertisers for better buyer matching

=================================================

--- SLOT 1 ---
Media Type: Newsletter                          (required)
Newsletter Name: Growth Insider                 (required)
Publisher: Growth Insider Media                 (required)
Category: Marketing / SaaS                     (required)
Audience Size: 25,000                           (required)
Open Rate: 48%
Geography: UK / Europe
Placement Type: Sponsored Placement            (required)
Send Date: Thursday 25 April                   (required)
Deadline: Tuesday 23 April                     (required)
Rate Card Price: €800                          (required)
This Week Price: €500                          (required)
Slots Available: 2
Description: Weekly newsletter for SaaS founders and growth marketers
Past Advertisers: Notion, HubSpot, Loom
Sample Link: https://growthinside.co/issue-42
Booking URL: https://growthinside.co/advertise

--- SLOT 2 ---
Media Type: Newsletter                          (required)
Newsletter Name: The Founder Brief              (required)
Publisher: Founder Media Group                  (required)
Category: Startups / Business                  (required)
Audience Size: 32,000                           (required)
Open Rate: 41%
Geography: US / UK
Placement Type: Dedicated Send                 (required)
Send Date: Friday 26 April                     (required)
Deadline: Wednesday 24 April                   (required)
Rate Card Price: $900                          (required)
This Week Price: $590                          (required)
Slots Available: 1
Description: A dedicated send to 32k early-stage founders. Your brand owns the entire edition.
Past Advertisers: Stripe, Linear, Raycast
Sample Link: https://founderbrief.co/sample
Booking URL: https://founderbrief.co/advertise

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
  const [showFormat, setShowFormat] = useState(false);

  const copy = async (text: string, setter: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2500);
  };

  if (variant === 'compact') {
    return (
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[#1d1d1f] font-semibold text-sm mb-0.5">Send your slots to our inbox</p>
            <p className="text-[#6e6e73] text-xs leading-relaxed">No form needed — we parse and create listings for you.</p>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 bg-[#f5f5f7] border border-black/[0.08] hover:border-black/[0.16] text-[#1d1d1f] text-xs font-semibold px-3 py-2 rounded-xl transition-all shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Template
          </button>
        </div>

        <div className="flex items-center gap-2 bg-[#f5f5f7] border border-black/[0.08] rounded-2xl px-4 py-3">
          <Mail className="w-4 h-4 text-[#86868b] shrink-0" />
          <span className="text-[#1d1d1f] font-mono text-sm tracking-tight flex-1 select-all truncate">{SUBMISSION_EMAIL}</span>
          <button
            onClick={() => copy(SUBMISSION_EMAIL, setEmailCopied)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shrink-0 ${
              emailCopied
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-white border border-black/[0.08] hover:border-black/[0.16] text-[#1d1d1f]'
            }`}
          >
            {emailCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {emailCopied ? 'Copied!' : 'Copy'}
          </button>
          <a
            href={`mailto:${SUBMISSION_EMAIL}`}
            className="flex items-center gap-1.5 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shrink-0"
          >
            <Mail className="w-3.5 h-3.5" />
            Open
          </a>
        </div>

        <div className="bg-[#fafafa] border border-black/[0.06] rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowFormat(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-[#1d1d1f] font-semibold text-xs">Recommended email format</span>
              <span className="bg-[#1d1d1f] text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">format</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#aeaeb2] transition-transform ${showFormat ? 'rotate-180' : ''}`} />
          </button>
          {showFormat && (
            <div className="border-t border-black/[0.06] px-4 py-4 space-y-1">
              {NEWSLETTER_FIELDS.map(({ key, example, required }) => (
                <div key={key} className="flex items-baseline gap-2 leading-6">
                  <span className="font-mono text-xs text-[#6e6e73] shrink-0 w-36">{key}:</span>
                  <span className="font-mono text-xs text-[#1d1d1f]">{example}</span>
                  {required && (
                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-wide shrink-0 self-center">req</span>
                  )}
                </div>
              ))}
              <div className="pt-3 border-t border-black/[0.06] mt-3">
                <button
                  onClick={() => copy(SINGLE_TEMPLATE, setSingleCopied)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
                    singleCopied
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-[#1d1d1f] text-white hover:bg-[#3a3a3c]'
                  }`}
                >
                  {singleCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {singleCopied ? 'Copied!' : 'Copy template'}
                </button>
              </div>
            </div>
          )}
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
            Send one or more opportunities in the format below. We'll parse each one into a separate draft listing for review.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 mb-8 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-800 font-semibold text-sm mb-0.5">Use the recommended format for fastest approval</p>
            <p className="text-blue-700 text-xs leading-relaxed">
              Emails matching the format below are parsed automatically. Missing required fields will be flagged for manual review. Including open rate, geography, and past advertisers helps buyers make faster decisions and improves your listing's match scores.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Zap className="w-4 h-4" />, title: 'Auto-parsed on arrival', desc: 'Structured emails are parsed instantly — fields extracted, confidence scored, and queued for review' },
            { icon: <Layers className="w-4 h-4" />, title: 'Multiple slots, one email', desc: 'Submit several opportunities at once. Each block becomes its own draft listing in the review queue' },
            { icon: <Clock className="w-4 h-4" />, title: 'Faster approval', desc: 'High-confidence submissions go from inbox to live listing in minutes — not hours' },
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
                <h3 className="text-[#1d1d1f] font-semibold text-base">Recommended email format</h3>
                <span className="bg-[#f5f5f7] border border-black/[0.06] text-[#86868b] text-[10px] font-semibold px-2 py-0.5 rounded-lg uppercase tracking-wide">newsletter optimised</span>
              </div>
              <p className="text-[#6e6e73] text-sm">Use these field names for automatic parsing and high-confidence scoring.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-1.5 bg-[#f5f5f7] border border-black/[0.08] hover:border-black/[0.16] text-[#1d1d1f] text-xs font-semibold px-3 py-2.5 rounded-xl transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
              <button
                onClick={() => copy(SINGLE_TEMPLATE, setSingleCopied)}
                className={`flex items-center gap-2 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm ${
                  singleCopied
                    ? 'bg-green-600 text-white'
                    : 'bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white'
                }`}
              >
                {singleCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {singleCopied ? 'Copied!' : 'Copy template'}
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-[#fafafa] border border-black/[0.06] rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-black/[0.05] flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-black/[0.08]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-black/[0.08]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-black/[0.08]" />
                </div>
                <span className="text-[#aeaeb2] text-xs ml-1">Email body — one slot</span>
              </div>
              <div className="p-5">
                {NEWSLETTER_FIELDS.map(({ key, example, required, note }) => (
                  <div key={key} className="flex items-baseline gap-0 leading-7 group">
                    <span className="font-mono text-sm text-[#6e6e73] shrink-0 w-44">{key}:</span>
                    <span className="font-mono text-sm text-[#1d1d1f]">{example}</span>
                    {required && (
                      <span className="ml-2 text-[9px] font-bold text-red-400 uppercase tracking-wide shrink-0 self-center">required</span>
                    )}
                    {note && (
                      <span className="ml-2 text-[10px] text-[#aeaeb2] hidden group-hover:inline self-center">{note}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-[#86868b] text-xs leading-relaxed">
                <span className="text-[#1d1d1f] font-semibold">Tip:</span> Fields marked <span className="text-red-400 font-semibold">required</span> are needed for fastest approval. Optional fields improve your listing's match score and buyer visibility.
              </p>
              <p className="text-[#86868b] text-xs leading-relaxed">
                <span className="text-[#1d1d1f] font-semibold">Multiple slots:</span> Use one block per slot separated by <code className="bg-[#f5f5f7] px-1 rounded text-[10px]">--- SLOT ---</code> dividers. Each slot can have a different placement type and send date.
              </p>
            </div>
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
              <p className="text-[#6e6e73] text-sm">Use a divider between each slot — we'll parse each one into a separate draft listing.</p>
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
                  Start each opportunity with <code className="bg-white border border-black/[0.08] text-[#1d1d1f] font-mono font-semibold text-xs px-1.5 py-0.5 rounded-lg">--- SLOT N ---</code>. Each slot becomes its own separate draft in the review queue.
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
                  { label: 'SLOT 1', fields: NEWSLETTER_FIELDS.map(f => ({ key: f.key, value: f.example })) },
                  { label: 'SLOT 2', fields: NEWSLETTER_FIELDS.map(f => ({ key: f.key, value: SLOT_2_VALUES[f.key] ?? f.example })) },
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
                  <span className="text-[#1d1d1f] font-semibold">Note:</span> You can include as many slots as you like in one email. If you forget the dividers, we'll still capture the email — but it may be flagged for manual parsing, which slows approval.
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
              { step: '02', title: 'Fields parsed automatically', desc: 'Each slot is extracted and confidence-scored. High-confidence slots move faster' },
              { step: '03', title: 'Admin review', desc: 'We verify details, fill any gaps, and prepare each listing for publishing' },
              { step: '04', title: 'Live and matched', desc: 'Approved listings go live and are immediately scored against buyer preferences' },
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
