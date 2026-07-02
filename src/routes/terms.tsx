import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "./privacy";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Apex Pro Traders" },
      { name: "description", content: "Terms and conditions for using Apex Pro Traders research services." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalShell title="Terms & Conditions" updated="30 June 2026">
      <p>
        Please read these Terms &amp; Conditions ("Terms") carefully before using
        the services offered by Apex Pro Traders ("we", "our", "us"), a SEBI
        Registered Research Analyst firm (SEBI RA Reg. No. INH000019460).
        By creating an account or subscribing to our services, you agree to be
        bound by these Terms.
      </p>

      <H2>1. Nature of services</H2>
      <p>
        We provide research reports and trade ideas across Equity, Derivatives,
        F&amp;O and Commodities. Our services are <strong>research only</strong>
        and do not constitute personalised investment advice, portfolio
        management, or any form of guaranteed returns.
      </p>

      <H2>2. Eligibility</H2>
      <p>
        You must be at least 18 years old and legally capable of entering into a
        contract under Indian law to use our services.
      </p>

      <H2>3. Account &amp; subscription</H2>
      <ul>
        <li>You are responsible for keeping your login credentials secure.</li>
        <li>Subscriptions are billed monthly via Razorpay. Access remains active for the duration of your paid term.</li>
        <li>We may suspend or terminate accounts that violate these Terms or applicable law.</li>
      </ul>

      <H2>4. Refund policy</H2>
      <p>
        Subscription fees are generally non-refundable once the service has been
        delivered, in keeping with the digital nature of our research. In cases
        of duplicate payment or technical failure, you may write to
        <a className="text-primary" href="mailto:support@apexprotraders.in"> support@apexprotraders.in </a>
        within 7 days for review.
      </p>

      <H2>5. Risk disclosure</H2>
      <ul>
        <li>Investments in securities market are subject to market risks.</li>
        <li>Past performance is not indicative of future results.</li>
        <li>We do not offer any assured or guaranteed returns.</li>
        <li>You alone are responsible for your investment decisions and trade execution.</li>
      </ul>

      <H2>6. User obligations</H2>
      <ul>
        <li>Do not redistribute, resell, or publicly share our research content.</li>
        <li>Do not attempt to bypass, reverse-engineer, or disrupt our systems.</li>
        <li>Provide accurate information and keep it up to date.</li>
      </ul>

      <H2>7. Intellectual property</H2>
      <p>
        All research, reports, logos, and content on this site are the property
        of Apex Pro Traders and are protected by applicable intellectual property
        laws.
      </p>

      <H2>8. Limitation of liability</H2>
      <p>
        To the maximum extent permitted by law, Apex Pro Traders shall not be
        liable for any indirect, incidental, special, or consequential damages
        arising from your use of our services, including any trading losses.
      </p>

      <H2>9. Grievance redressal</H2>
      <p>
        For any grievance, please write to
        <a className="text-primary" href="mailto:support@apexprotraders.in"> support@apexprotraders.in</a>.
        We endeavour to respond within 7 working days.
      </p>

      <H2>10. Governing law &amp; jurisdiction</H2>
      <p>
        These Terms are governed by the laws of India. Any disputes shall be
        subject to the exclusive jurisdiction of the courts at Mumbai.
      </p>

      <H2>11. Changes to terms</H2>
      <p>
        We may update these Terms from time to time. Continued use of our
        services after changes constitutes acceptance of the revised Terms.
      </p>
    </LegalShell>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2>{children}</h2>;
}
