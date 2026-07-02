import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { HeroStats } from "@/components/site/HeroStats";
import { Strategies } from "@/components/site/Strategies";
import { HowItWorks } from "@/components/site/HowItWorks";
import { TradeInsights } from "@/components/site/TradeInsights";
import { About } from "@/components/site/About";
import { Blog } from "@/components/site/Blog";
import { Contact } from "@/components/site/Contact";
import { Testimonials } from "@/components/site/Testimonials";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Apex Pro Traders — Precision Research. Returns on Both Sides." },
      { name: "description", content: "SEBI Registered Research Analyst firm delivering research-backed trade ideas across Equity, Derivatives, F&O and Commodities. Bull or bear — we view the market from both sides." },
      { property: "og:title", content: "Apex Pro Traders — Precision Research. Returns on Both Sides." },
      { property: "og:description", content: "Research-backed trade ideas across Equity, Derivatives, F&O and Commodities from a SEBI Registered Research Analyst." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <HeroStats />
        <Strategies />
        <Reveal><HowItWorks /></Reveal>
        <Reveal delay={80}><TradeInsights /></Reveal>
        <Reveal><About /></Reveal>
        <Reveal delay={80}><Testimonials /></Reveal>
        <Reveal delay={80}><Blog /></Reveal>
        <Reveal><Contact /></Reveal>
      </main>
      <Footer />
    </div>
  );
}
