import { Zap, ArrowLeft } from 'lucide-react';

interface PrivacyPageProps {
  onBack: () => void;
  onTerms?: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-[#e6edf3] mb-4 pb-2 border-b border-[#30363d]">{title}</h2>
      <div className="space-y-3 text-[#8b949e] text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-[#c9d1d9] mb-2">{title}</h3>
      <div className="space-y-2 text-[#8b949e] text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export default function PrivacyPage({ onBack, onTerms }: PrivacyPageProps) {
  const effectiveDate = 'April 14, 2026';

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-24">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#8b949e] hover:text-[#e6edf3] text-sm mb-10 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to marketplace
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-[#238636] rounded-md flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-[#e6edf3] font-semibold">
            EndingThisWeek<span className="text-[#3fb950]">.media</span>
          </span>
        </div>

        <h1 className="text-3xl font-bold text-[#e6edf3] mt-6 mb-2">Privacy Policy</h1>
        <p className="text-[#6e7681] text-sm mb-12">Effective date: {effectiveDate}</p>

        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 mb-10 text-sm text-[#8b949e] leading-relaxed">
          This Privacy Policy explains how EndingThisWeek.media ("we", "us", or "our") collects, uses, stores, and protects your personal information when you use our platform. By accessing or using EndingThisWeek.media, you agree to the practices described in this policy. If you do not agree, please do not use the platform.
        </div>

        <Section title="1. Who We Are">
          <p>
            EndingThisWeek.media is an online marketplace connecting media property owners (Sellers) with advertisers and brands (Buyers). We operate the platform at endingthisweek.media. For the purposes of applicable data protection law, EndingThisWeek.media is the data controller of personal information collected through the platform.
          </p>
          <p>
            If you have any questions about this policy or how we handle your data, contact us at: <span className="text-[#c9d1d9]">privacy@endingthisweek.media</span>
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <SubSection title="2.1 Information You Provide">
            <p>We collect personal information you voluntarily provide when using the platform:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 pl-2">
              <li><span className="text-[#c9d1d9]">Buyers:</span> Full name, email address, company name, website URL, phone/WhatsApp number, billing country, and any campaign messaging or notes you include in a booking.</li>
              <li><span className="text-[#c9d1d9]">Sellers:</span> Full name, company or publication name, email address, phone number, website URL, media property details, audience metrics, and pricing information submitted in a listing.</li>
              <li><span className="text-[#c9d1d9]">All users:</span> Any communications you send to us, including support requests, refund requests, and admin correspondence.</li>
            </ul>
          </SubSection>

          <SubSection title="2.2 Information Collected Automatically">
            <p>When you visit or use the platform, we may automatically collect:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 pl-2">
              <li>IP address and general geographic location</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent on the platform</li>
              <li>Referring URLs and navigation paths</li>
              <li>Device identifiers and screen resolution</li>
            </ul>
          </SubSection>

          <SubSection title="2.3 Payment Information">
            <p>
              Payment processing on the platform is handled by Stripe, a third-party provider. We do not store, collect, or have access to your full card number, CVV, or other sensitive payment credentials. Stripe processes payments directly and provides us with a transaction reference and status confirmation only. Your use of Stripe is also subject to <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#3fb950] hover:underline">Stripe's Privacy Policy</a>.
            </p>
          </SubSection>

          <SubSection title="2.4 Booking Records">
            <p>
              When a booking is confirmed, we create and store a booking record that includes the Buyer's details, the Seller's details, the listing information, deposit amount, payment reference, and any notes submitted. This record is retained for the purposes of dispute resolution, refund processing, and platform operations.
            </p>
          </SubSection>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use the information we collect for the following purposes:</p>

          <SubSection title="3.1 Platform Operations">
            <ul className="list-disc list-inside space-y-1 mt-2 pl-2">
              <li>To process and confirm bookings and deposits</li>
              <li>To display listings and facilitate slot discovery</li>
              <li>To connect Buyers with Sellers after a deposit is confirmed</li>
              <li>To manage refund requests and disputes</li>
              <li>To maintain booking records and transaction history</li>
              <li>To provide customer support and respond to enquiries</li>
            </ul>
          </SubSection>

          <SubSection title="3.2 Communication">
            <ul className="list-disc list-inside space-y-1 mt-2 pl-2">
              <li>To send booking confirmation and reference details to Buyers</li>
              <li>To notify Sellers of new secured bookings</li>
              <li>To communicate platform updates, policy changes, or service notices</li>
              <li>To respond to support or refund requests</li>
            </ul>
          </SubSection>

          <SubSection title="3.3 Platform Improvement">
            <ul className="list-disc list-inside space-y-1 mt-2 pl-2">
              <li>To analyse usage patterns and improve platform functionality</li>
              <li>To monitor and prevent fraud, abuse, or policy violations</li>
              <li>To maintain platform security and integrity</li>
              <li>To generate aggregated, anonymised analytics (no individual identification)</li>
            </ul>
          </SubSection>

          <SubSection title="3.4 Legal Compliance">
            <ul className="list-disc list-inside space-y-1 mt-2 pl-2">
              <li>To comply with applicable legal obligations</li>
              <li>To enforce our Terms of Service</li>
              <li>To respond to lawful requests from government or regulatory authorities</li>
            </ul>
          </SubSection>
        </Section>

        <Section title="4. Information Shared Between Users">
          <p>
            EndingThisWeek.media shares Buyer contact details (name, email, company, website, phone) with the relevant Seller only after a Deposit has been successfully processed and confirmed. This disclosure is necessary to enable the Seller to fulfil the advertising slot and for both parties to complete the transaction.
          </p>
          <p>
            Sellers acknowledge that their contact details (name, email, phone, website) will be disclosed to Buyers following deposit confirmation to facilitate direct communication.
          </p>
          <p>
            Neither Buyers nor Sellers are permitted to use contact information received through the platform for purposes unrelated to fulfilling the specific booking for which the information was shared. Using such information for unsolicited marketing or any other purpose is a violation of these terms.
          </p>
        </Section>

        <Section title="5. Information Shared With Third Parties">
          <p>We do not sell, rent, or trade your personal information. We may share your information in limited circumstances:</p>

          <SubSection title="5.1 Service Providers">
            <p>
              We work with trusted third-party service providers who assist us in operating the platform. These include payment processors (Stripe), database and hosting providers (Supabase), and analytics tools. These providers access only the data necessary to perform their services and are contractually bound to protect your information.
            </p>
          </SubSection>

          <SubSection title="5.2 Legal Requirements">
            <p>
              We may disclose your information if required to do so by law or in good-faith belief that such disclosure is necessary to: comply with a legal obligation; protect and defend the rights or property of EndingThisWeek.media; prevent or investigate possible wrongdoing; protect the personal safety of users or the public; or protect against legal liability.
            </p>
          </SubSection>

          <SubSection title="5.3 Business Transfers">
            <p>
              If EndingThisWeek.media is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will provide notice before your personal information is transferred and becomes subject to a different privacy policy.
            </p>
          </SubSection>
        </Section>

        <Section title="6. Data Retention">
          <p>
            We retain personal information for as long as necessary to fulfil the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements.
          </p>
          <p>
            Booking records are retained for a minimum of three years from the date of the transaction to allow for dispute resolution and audit purposes. Listing data submitted by Sellers may be retained beyond the listing's expiry for platform integrity and fraud prevention purposes.
          </p>
          <p>
            Where we have no ongoing legitimate business need to process your personal information, we will either delete or anonymise it. If deletion is not immediately possible, we will securely store the information and restrict it from further processing until deletion is possible.
          </p>
        </Section>

        <Section title="7. Cookies & Tracking">
          <p>
            EndingThisWeek.media may use cookies and similar tracking technologies to enhance your experience on the platform. Cookies are small data files stored on your device that allow us to remember your preferences and understand how you use the platform.
          </p>
          <p>We may use the following types of cookies:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 pl-2">
            <li><span className="text-[#c9d1d9]">Essential cookies:</span> Required for core platform functionality such as session management and security.</li>
            <li><span className="text-[#c9d1d9]">Analytics cookies:</span> Help us understand how visitors interact with the platform so we can improve it.</li>
            <li><span className="text-[#c9d1d9]">Preference cookies:</span> Remember your settings and filter selections.</li>
          </ul>
          <p className="mt-3">
            Most web browsers allow you to control cookies through browser settings. Disabling cookies may affect the functionality of certain platform features. By continuing to use the platform, you consent to our use of cookies as described.
          </p>
        </Section>

        <Section title="8. Data Security">
          <p>
            We implement reasonable technical and organisational security measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. These measures include encrypted data transmission (HTTPS), access controls, and secure database infrastructure.
          </p>
          <p>
            However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security. You use the platform at your own risk.
          </p>
          <p>
            If you become aware of any security vulnerability or breach related to the platform, please notify us immediately at <span className="text-[#c9d1d9]">security@endingthisweek.media</span>.
          </p>
        </Section>

        <Section title="9. Your Rights">
          <p>
            Depending on your location and applicable law, you may have certain rights regarding your personal information:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 pl-2">
            <li><span className="text-[#c9d1d9]">Access:</span> Request a copy of the personal information we hold about you.</li>
            <li><span className="text-[#c9d1d9]">Correction:</span> Request that we correct inaccurate or incomplete information.</li>
            <li><span className="text-[#c9d1d9]">Deletion:</span> Request that we delete your personal information, subject to our legal obligations and legitimate operational needs.</li>
            <li><span className="text-[#c9d1d9]">Restriction:</span> Request that we restrict the processing of your information in certain circumstances.</li>
            <li><span className="text-[#c9d1d9]">Portability:</span> Request a machine-readable copy of your personal data where technically feasible.</li>
            <li><span className="text-[#c9d1d9]">Objection:</span> Object to processing of your information for direct marketing purposes.</li>
            <li><span className="text-[#c9d1d9]">Withdraw consent:</span> Where processing is based on consent, withdraw that consent at any time.</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, contact us at <span className="text-[#c9d1d9]">privacy@endingthisweek.media</span>. We will respond to verified requests within a commercially reasonable timeframe. We may need to verify your identity before fulfilling a request.
          </p>
          <p className="mt-2">
            Please note that certain rights may be limited where we have overriding legitimate interests or legal obligations that require us to retain or process the data.
          </p>
        </Section>

        <Section title="10. Children's Privacy">
          <p>
            EndingThisWeek.media is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a minor, please contact us immediately and we will take steps to delete it.
          </p>
        </Section>

        <Section title="11. International Data Transfers">
          <p>
            Your information may be transferred to and processed in countries other than your own. These countries may have data protection laws that differ from those in your jurisdiction. Where such transfers occur, we take reasonable steps to ensure your data is protected in accordance with this Privacy Policy and applicable law, including through the use of standard contractual clauses or equivalent safeguards where required.
          </p>
        </Section>

        <Section title="12. Third-Party Links">
          <p>
            The platform may contain links to third-party websites, including Seller websites and media properties. This Privacy Policy does not apply to those third-party sites. We have no control over and accept no responsibility for the content, privacy practices, or policies of any third-party websites. We encourage you to review the privacy policy of any site you visit.
          </p>
        </Section>

        <Section title="13. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will indicate the revised effective date at the top of this page. Your continued use of the platform after any changes constitutes your acceptance of the updated policy. We encourage you to review this policy periodically.
          </p>
          <p>
            For material changes, we will make reasonable efforts to provide more prominent notice, such as a notification on the platform.
          </p>
        </Section>

        <Section title="14. Contact Us">
          <p>
            If you have any questions, concerns, or requests relating to this Privacy Policy or the handling of your personal information, please contact us:
          </p>
          <div className="mt-3 bg-[#161b22] border border-[#30363d] rounded-md p-4 text-[#c9d1d9]">
            <p className="font-medium">EndingThisWeek.media — Privacy Team</p>
            <p className="mt-1 text-[#8b949e]">Email: privacy@endingthisweek.media</p>
          </div>
        </Section>

        {onTerms && (
          <div className="mt-8 pt-6 border-t border-[#30363d]">
            <p className="text-[#6e7681] text-sm">
              This Privacy Policy should be read alongside our{' '}
              <button
                onClick={onTerms}
                className="text-[#3fb950] hover:underline"
              >
                Terms of Service
              </button>
              .
            </p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-[#30363d] text-center text-xs text-[#484f58]">
          &copy; 2026 EndingThisWeek.media. All rights reserved.
        </div>
      </div>
    </div>
  );
}
