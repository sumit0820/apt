import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Apex Pro Traders" },
      { name: "description", content: "How Apex Pro Traders collects, uses, and protects your personal information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="30 June 2026">
      <p>
        Apex Pro Traders ("we", "our", "us") is a SEBI Registered Research Analyst firm
        (SEBI RA Reg. No. INH000019460). This Privacy Policy explains how we collect, use,
        disclose, and protect your personal information when you visit our website or
        subscribe to our research services.
      </p>

      <H2>1. Information we collect</H2>
      <ul>
        <li><strong>Account information</strong> — name, email address, phone number, and (optionally) PAN.</li>
        <li><strong>Payment information</strong> — handled by our payment processor (Razorpay). We do not store your card or banking credentials.</li>
        <li><strong>Usage information</strong> — pages visited, device information, and IP address for security and analytics.</li>
        <li><strong>Communications</strong> — messages you send us via WhatsApp, email, or the contact form.</li>
      </ul>

      <H2>2. How we use your information</H2>
      <ul>
        <li>To create and manage your account and subscription.</li>
        <li>To deliver research, trade ideas, and service updates through Telegram, WhatsApp, and email.</li>
        <li>To process payments and prevent fraud.</li>
        <li>To comply with applicable laws and SEBI Research Analyst Regulations, 2014.</li>
      </ul>

      <H2>3. Sharing of information</H2>
      <p>
        We do not sell your personal information. We share information only with:
      </p>
      <ul>
        <li>Service providers who help us operate — payment processor (Razorpay), authentication and database infrastructure, communication channels (Telegram, WhatsApp, email providers).</li>
        <li>Regulators or law-enforcement, when required by law.</li>
      </ul>

      <H2>4. Cookies</H2>
      <p>
        We use a minimal set of cookies and local storage for authentication and security.
        We do not use third-party advertising cookies.
      </p>

      <H2>5. Data retention</H2>
      <p>
        We retain your account information for as long as your account is active, and for
        a reasonable period afterwards to meet legal, accounting, and regulatory obligations.
      </p>

      <H2>6. Your rights</H2>
      <p>
        You can access, correct, or delete your account information by writing to
        <a className="text-primary" href="mailto:support@apexprotraders.in"> support@apexprotraders.in</a>.
        Deleting your account does not remove records we are legally required to keep.
      </p>

      <H2>7. Security</H2>
      <p>
        We use industry-standard safeguards including TLS in transit, encrypted storage,
        access controls, and row-level security on user data. No system is perfectly secure,
        but we work continuously to protect your data.
      </p>

      <H2>8. Children</H2>
      <p>Our services are not directed to anyone under 18.</p>

      <H2>9. Changes to this policy</H2>
      <p>
        We may update this policy from time to time. Changes will be posted on this page
        with a new "last updated" date.
      </p>

      <H2>10. Contact</H2>
      <p>
        Apex Pro Traders · <a className="text-primary" href="mailto:support@apexprotraders.in">support@apexprotraders.in</a>
      </p>
    </LegalShell>
  );
}

export function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/"><Logo size="sm" /></Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Back to home</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <h1 className="text-4xl font-extrabold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        <div className="prose prose-invert mt-8 space-y-4 text-sm leading-relaxed text-foreground/90 [&_h2]:text-primary [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-8 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:underline">
          {children}
        </div>
      </main>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2>{children}</h2>;
}
