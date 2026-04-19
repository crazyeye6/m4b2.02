import { Zap, ArrowLeft } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4 pb-2 border-b border-black/[0.06]">{title}</h2>
      <div className="space-y-3 text-[#6e6e73] text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-[#1d1d1f] mb-2">{title}</h3>
      <div className="space-y-2 text-[#6e6e73] text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export default function TermsPage({ onBack }: TermsPageProps) {
  const effectiveDate = 'April 14, 2026';

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-24">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#6e6e73] hover:text-[#1d1d1f] text-sm mb-10 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to marketplace
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-[#1d1d1f] rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-[#1d1d1f] font-semibold">
            EndingThisWeek<span className="text-[#6e6e73]">.media</span>
          </span>
        </div>

        <h1 className="text-3xl font-bold text-[#1d1d1f] mt-6 mb-2">Terms of Service</h1>
        <p className="text-[#aeaeb2] text-sm mb-12">Effective date: {effectiveDate}</p>

        <div className="bg-white border border-black/[0.08] rounded-2xl p-5 mb-10 text-sm text-[#6e6e73] leading-relaxed">
          Please read these Terms of Service carefully before using EndingThisWeek.media. By accessing or using the platform in any capacity — as a buyer, seller, or visitor — you agree to be bound by these terms. If you do not agree, you must not use the platform.
        </div>

        <Section title="1. About EndingThisWeek.media">
          <p>
            EndingThisWeek.media ("the Platform", "we", "us", or "our") is an online marketplace that connects media property owners — including newsletter publishers, podcast producers, and social media influencers ("Sellers") — with brands and advertisers ("Buyers") seeking last-minute, discounted advertising inventory. The Platform facilitates discovery, slot reservation, and deposit collection. It does not deliver advertising campaigns or guarantee media performance.
          </p>
          <p>
            EndingThisWeek.media acts solely as an intermediary. We are not a party to any advertising agreement between a Buyer and a Seller, and we have no editorial control over content published by Sellers.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>
            You must be at least 18 years of age and have the legal authority to enter into binding contracts to use this Platform. By using EndingThisWeek.media, you represent and warrant that you meet these requirements. If you are using the Platform on behalf of a business entity, you represent that you have authority to bind that entity to these terms.
          </p>
        </Section>

        <Section title="3. User Roles & Responsibilities">
          <SubSection title="3.1 Sellers">
            <p>
              Sellers are media property owners who list advertising slots on the Platform. By submitting a listing, Sellers represent and warrant that:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2 pl-2">
              <li>They own or have full rights to sell the advertising inventory described.</li>
              <li>All audience metrics, pricing, and media descriptions provided are accurate, current, and not misleading.</li>
              <li>They have the legal right and capacity to fulfil the advertising slot as listed.</li>
              <li>They will respond to secured bookings in a timely manner and within any stated hold window.</li>
              <li>They will not materially alter the terms, deliverables, or scope of a listing after a Buyer has secured it.</li>
              <li>They accept full responsibility for delivering the agreed advertising slot to the Buyer.</li>
              <li>All content published within booked slots complies with applicable laws, including advertising standards, data protection laws, and platform-specific guidelines.</li>
            </ul>
            <p className="mt-2">
              Sellers acknowledge that EndingThisWeek.media reserves the right to remove any listing at its sole discretion, including listings that are inaccurate, expired, or in violation of these Terms.
            </p>
          </SubSection>

          <SubSection title="3.2 Buyers">
            <p>
              Buyers are brands, agencies, or individuals who browse and secure advertising slots on the Platform. By securing a slot, Buyers represent and warrant that:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2 pl-2">
              <li>All information submitted during booking — including company name, email, billing details, and campaign messaging — is accurate.</li>
              <li>They have the authority and budget to complete the transaction.</li>
              <li>They will promptly respond to Seller communications following a confirmed booking.</li>
              <li>They understand that the Platform collects a 5% deposit and that the remaining 95% balance is to be settled directly with the Seller off-platform.</li>
              <li>They will supply any required creative assets, copy, or campaign briefs to the Seller in a timely manner.</li>
              <li>They will not submit fraudulent, defamatory, or illegal advertising content to Sellers.</li>
            </ul>
          </SubSection>
        </Section>

        <Section title="4. Listings">
          <p>
            Listings represent specific advertising slots within a Seller's media property. Each listing is time-limited and subject to inventory constraints. EndingThisWeek.media does not independently verify audience metrics, subscriber counts, engagement rates, or download figures provided by Sellers. All listing data is supplied by Sellers and presented on an "as is" basis. Buyers are encouraged to conduct their own due diligence prior to securing a slot.
          </p>
          <p>
            Listings expire automatically when their stated deadline is reached. Once expired, a slot cannot be secured through the Platform. Listings may also be removed by EndingThisWeek.media at any time for any reason without prior notice.
          </p>
          <p>
            The Platform does not guarantee the availability of any listing at any given time. Displaying a listing on the Platform does not constitute a binding offer by EndingThisWeek.media. The binding relationship is formed between the Buyer and Seller upon deposit confirmation.
          </p>
        </Section>

        <Section title="5. Deposits, Payments & the 5%/95% Model">
          <SubSection title="5.1 Deposit Collection">
            <p>
              When a Buyer secures a slot, the Platform collects a deposit equal to 5% of the listed slot price (the "Deposit"). The Deposit is processed via third-party payment provider Stripe. By completing a payment, you also agree to Stripe's terms of service.
            </p>
            <p className="mt-2">
              The Deposit is non-refundable except in limited circumstances described in Section 6 (Refunds). Submission of payment constitutes acceptance of these Terms and acknowledgment that the Deposit is only refundable under the stated Refund Policy.
            </p>
          </SubSection>

          <SubSection title="5.2 Balance Payment">
            <p>
              The remaining 95% balance of the slot price ("Balance") is not collected by EndingThisWeek.media. It is the sole responsibility of the Buyer and Seller to agree and transact the Balance directly between themselves. EndingThisWeek.media has no involvement in, and accepts no liability for, any dispute arising from Balance payment, non-payment, or delayed payment.
            </p>
          </SubSection>

          <SubSection title="5.3 Platform Role">
            <p>
              EndingThisWeek.media holds the Deposit as a facilitation mechanism to confirm intent and secure the slot. By collecting a Deposit, the Platform does not guarantee campaign delivery, Seller performance, or the quality of any advertising placement. The Platform is not a bank, escrow agent, or regulated financial institution.
            </p>
          </SubSection>

          <SubSection title="5.4 Taxes">
            <p>
              Buyers and Sellers are each responsible for determining and fulfilling their own tax obligations arising from transactions conducted through the Platform. EndingThisWeek.media is not responsible for collecting, reporting, or remitting any taxes on behalf of either party.
            </p>
          </SubSection>
        </Section>

        <Section title="6. Refund Policy">
          <SubSection title="6.1 Eligible Refunds">
            <p>A Deposit refund may be issued at the sole discretion of EndingThisWeek.media in the following circumstances:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 pl-2">
              <li>The Seller is demonstrably unable to provide the advertising slot as listed.</li>
              <li>The Seller materially changes the terms, deliverables, or scope of the listing after the slot has been secured.</li>
              <li>The slot becomes unavailable due to a technical error on the Platform.</li>
              <li>The booking cannot proceed under normal and reasonable practice through no fault of the Buyer.</li>
            </ul>
          </SubSection>

          <SubSection title="6.2 Non-Eligible Refunds">
            <p>Deposits will not be refunded in the following circumstances:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 pl-2">
              <li>The Buyer changes their mind or decides not to proceed after securing the slot.</li>
              <li>The Buyer fails to respond to Seller communications within a reasonable time.</li>
              <li>The Buyer fails to meet the Seller's reasonable campaign or approval requirements.</li>
              <li>The Buyer requests changes to the campaign that fall outside the scope of the original listing.</li>
              <li>The Buyer does not submit required creative assets or briefs in time for campaign delivery.</li>
              <li>The Buyer provides inaccurate details at the time of booking.</li>
            </ul>
          </SubSection>

          <SubSection title="6.3 Refund Process">
            <p>
              To request a refund, the Buyer must submit a refund request through the Platform, providing a written explanation and the relevant booking reference. All refund requests are reviewed by the EndingThisWeek.media administration team. The decision of EndingThisWeek.media is final. Approved refunds will be processed to the original payment method within a commercially reasonable timeframe.
            </p>
          </SubSection>
        </Section>

        <Section title="7. Prohibited Conduct">
          <p>You agree not to use the Platform to:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 pl-2">
            <li>Submit false, misleading, or fraudulent listings or booking information.</li>
            <li>Circumvent the Platform to transact directly with other users without paying applicable deposits.</li>
            <li>Harass, threaten, or engage in abusive conduct toward other users.</li>
            <li>Violate any applicable law, regulation, or third-party right.</li>
            <li>Upload or transmit malware, spam, or any harmful code.</li>
            <li>Scrape, crawl, or systematically extract data from the Platform without written permission.</li>
            <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity.</li>
            <li>Use the Platform to advertise products or services that are illegal, deceptive, or harmful.</li>
          </ul>
          <p className="mt-3">
            EndingThisWeek.media reserves the right to suspend or permanently ban any user found in violation of these prohibitions, without notice, refund, or liability.
          </p>
        </Section>

        <Section title="8. Intellectual Property">
          <p>
            All content, design, software, and materials on the Platform — including the EndingThisWeek.media name, logo, and interface — are the exclusive property of EndingThisWeek.media or its licensors. You may not copy, reproduce, modify, or distribute any Platform content without express written permission.
          </p>
          <p>
            By submitting a listing, Sellers grant EndingThisWeek.media a non-exclusive, royalty-free, worldwide licence to display, reproduce, and promote listing content solely for the purposes of operating and marketing the Platform.
          </p>
          <p>
            Buyers and Sellers retain ownership of their own creative assets, copy, and intellectual property. Neither EndingThisWeek.media nor the other party acquires any rights to such content beyond what is necessary to fulfil the transaction.
          </p>
        </Section>

        <Section title="9. No Guarantee of Results">
          <p>
            EndingThisWeek.media makes no guarantees, representations, or warranties regarding the effectiveness, reach, or outcome of any advertising slot purchased through the Platform. Audience metrics, engagement rates, and other performance indicators are provided by Sellers and are not verified or endorsed by the Platform.
          </p>
          <p>
            The Platform does not guarantee that any listing will result in a secured booking, that any booking will result in a completed campaign, or that any campaign will achieve a particular result for the Buyer.
          </p>
        </Section>

        <Section title="10. Disclaimer of Warranties">
          <p>
            The Platform is provided on an "as is" and "as available" basis, without warranty of any kind, whether express or implied. EndingThisWeek.media expressly disclaims all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, and uninterrupted or error-free operation.
          </p>
          <p>
            We do not warrant that the Platform will be available at all times, free from errors, or free from viruses or other harmful components. We do not warrant the accuracy or completeness of any listing information.
          </p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p>
            To the fullest extent permitted by applicable law, EndingThisWeek.media and its officers, directors, employees, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including but not limited to loss of revenue, lost profits, loss of data, or loss of business opportunity — arising out of or in connection with your use of the Platform, even if we have been advised of the possibility of such damages.
          </p>
          <p>
            In no event shall EndingThisWeek.media's total liability to any party for any claim arising out of or related to these Terms or the Platform exceed the amount of the Deposit paid by that party in connection with the specific transaction giving rise to the claim.
          </p>
          <p>
            EndingThisWeek.media is not liable for any failure or delay in performance arising from circumstances beyond our reasonable control, including but not limited to acts of God, internet outages, third-party service failures, or regulatory changes.
          </p>
        </Section>

        <Section title="12. Indemnification">
          <p>
            You agree to indemnify, defend, and hold harmless EndingThisWeek.media and its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or in connection with: (a) your use of the Platform; (b) your breach of these Terms; (c) any content, listing, or campaign submitted by you; (d) your violation of any third-party rights; or (e) any dispute between you and another user.
          </p>
        </Section>

        <Section title="13. Dispute Resolution Between Users">
          <p>
            EndingThisWeek.media is not responsible for resolving disputes between Buyers and Sellers, except in relation to Deposit refund requests as described in Section 6. All disputes regarding Balance payments, campaign quality, content approvals, or delivery are strictly between the Buyer and Seller and must be resolved directly between those parties.
          </p>
          <p>
            EndingThisWeek.media may, at its sole and absolute discretion, facilitate communication between parties in a dispute but is under no obligation to do so and accepts no liability for the outcome of any such dispute.
          </p>
        </Section>

        <Section title="14. Privacy">
          <p>
            Your use of the Platform is also governed by our Privacy Policy. By using the Platform, you consent to the collection and use of your information as described therein. Buyer contact details are shared with the relevant Seller only after a Deposit has been successfully processed. EndingThisWeek.media takes reasonable measures to protect user data but cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="15. Third-Party Services">
          <p>
            The Platform integrates with third-party services, including Stripe for payment processing. Your use of such services is subject to their respective terms and privacy policies. EndingThisWeek.media is not responsible for the practices, availability, or content of any third-party service.
          </p>
        </Section>

        <Section title="16. Modifications to the Platform and Terms">
          <p>
            EndingThisWeek.media reserves the right to modify, suspend, or discontinue the Platform (or any part thereof) at any time without notice or liability. We also reserve the right to update these Terms at any time. We will indicate the revised effective date at the top of this page. Continued use of the Platform after any such changes constitutes your acceptance of the updated Terms. It is your responsibility to review these Terms periodically.
          </p>
        </Section>

        <Section title="17. Termination">
          <p>
            EndingThisWeek.media may terminate or suspend your access to the Platform immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Platform ceases immediately. Provisions of these Terms that by their nature should survive termination shall survive, including Sections 8, 10, 11, 12, and 18.
          </p>
        </Section>

        <Section title="18. Governing Law & Jurisdiction">
          <p>
            These Terms are governed by and construed in accordance with applicable law. Any disputes arising out of or in connection with these Terms or the Platform shall be subject to the exclusive jurisdiction of the relevant courts, unless you and EndingThisWeek.media agree otherwise in writing.
          </p>
          <p>
            If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect.
          </p>
        </Section>

        <Section title="19. Entire Agreement">
          <p>
            These Terms, together with the Privacy Policy and any other policies posted on the Platform, constitute the entire agreement between you and EndingThisWeek.media regarding your use of the Platform and supersede all prior agreements, representations, and understandings.
          </p>
        </Section>

        <Section title="20. Contact">
          <p>
            If you have questions about these Terms, please contact us at:
          </p>
          <div className="mt-3 bg-white border border-black/[0.08] rounded-2xl p-4 text-[#1d1d1f]">
            <p className="font-semibold">EndingThisWeek.media</p>
            <p className="mt-1 text-[#6e6e73]">Email: legal@endingthisweek.media</p>
          </div>
        </Section>

        <div className="mt-12 pt-6 border-t border-black/[0.06] text-center text-xs text-[#aeaeb2]">
          &copy; 2026 EndingThisWeek.media. All rights reserved.
        </div>
      </div>
    </div>
  );
}
