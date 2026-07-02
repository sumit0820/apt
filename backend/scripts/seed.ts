import "dotenv/config";
import { connectDb } from "../src/lib/mongodb";
import { hashPassword } from "../src/lib/auth";
import { BlogPost } from "../src/models/BlogPost";
import { SAMPLE_BLOG_CONTENT } from "../src/lib/blog-seed-content";
import { PlanCatalog } from "../src/models/PlanCatalog";
import { PastTrade } from "../src/models/PastTrade";
import { Testimonial } from "../src/models/Testimonial";
import { User } from "../src/models/User";

const PLANS = [
  { planKey: "plan-1", durationMonths: 3, priceInr: 6000, razorpayPlanId: "test-1" },
  { planKey: "plan-1", durationMonths: 6, priceInr: 12000, razorpayPlanId: "test-1" },
  { planKey: "plan-1", durationMonths: 12, priceInr: 24000, razorpayPlanId: "test-1" },
  { planKey: "plan-2", durationMonths: 3, priceInr: 9000, razorpayPlanId: "test-2" },
  { planKey: "plan-2", durationMonths: 6, priceInr: 18000, razorpayPlanId: "test-2" },
  { planKey: "plan-2", durationMonths: 12, priceInr: 36000, razorpayPlanId: "test-2" },
];

const PAST_TRADES = [
  { tradeDate: new Date("2024-05-20"), strategy: "Income", instrument: "NIFTY 23 MAY 22000 CE", direction: "Short", entry: "165.00 – 170.00", exit: "98.20", outcome: "Completed", published: true },
  { tradeDate: new Date("2024-05-17"), strategy: "Growth", instrument: "RELIANCE EQ", direction: "Long", entry: "2,820.00 – 2,860.00", exit: "3,045.00", outcome: "Completed", published: true },
  { tradeDate: new Date("2024-05-15"), strategy: "Diversified", instrument: "CRUDE OIL", direction: "Long", entry: "6,100 – 6,250", exit: "6,402.00", outcome: "Completed", published: true },
  { tradeDate: new Date("2024-05-10"), strategy: "Income", instrument: "BANKNIFTY 23 MAY 48000 PE", direction: "Short", entry: "210.00 – 220.00", exit: "125.60", outcome: "Completed", published: true },
  { tradeDate: new Date("2024-05-08"), strategy: "Growth", instrument: "INFY EQ", direction: "Long", entry: "1,410.00 – 1,440.00", exit: "1,525.00", outcome: "Completed", published: true },
];

const TESTIMONIALS = [
  {
    name: "Rajesh K.",
    content:
      "APT's research clarity and risk-defined calls helped me stay disciplined through volatile markets. The bull and bear coverage means I'm never caught on the wrong side of the narrative.",
    mediaType: "none",
    mediaUrl: null,
    published: true,
  },
  {
    name: "Priya M.",
    content:
      "What sets Apex Pro Traders apart is process over hype. Every idea comes with context, levels, and a clear rationale — exactly what a serious trader needs.",
    mediaType: "image",
    mediaUrl: "https://ui-avatars.com/api/?name=Priya+M&background=D4AF37&color=111&size=256&bold=true",
    published: true,
  },
  {
    name: "Amit S.",
    content:
      "I've subscribed to multiple research services. APT is the first where I felt the team genuinely views the market from both sides — not just permabull recommendations.",
    mediaType: "none",
    mediaUrl: null,
    published: true,
  },
];

const BLOG_POSTS = [
  {
    title: "Why selling premium in low VIX is a discipline game",
    tag: "Options",
    excerpt: "Vol crush is seductive — but only if your hedges and position size were defined before the trade.",
    content: SAMPLE_BLOG_CONTENT["why-selling-premium-in-low-vix-is-a-discipline-game"],
    publishedAt: new Date("2026-06-12"),
    published: true,
    slug: "why-selling-premium-in-low-vix-is-a-discipline-game",
  },
  {
    title: "Position sizing: the only edge you fully control",
    tag: "Risk",
    excerpt: "Most blow-ups aren't about bad ideas. They're about good ideas sized like a small one.",
    content: SAMPLE_BLOG_CONTENT["position-sizing-the-only-edge-you-fully-control"],
    publishedAt: new Date("2026-06-04"),
    published: true,
    slug: "position-sizing-the-only-edge-you-fully-control",
  },
  {
    title: "Reading RBI's tone: rates, liquidity and bank Nifty",
    tag: "Macro",
    excerpt: "How macro shifts quietly redraw the playbook for index option sellers.",
    content: SAMPLE_BLOG_CONTENT["reading-rbi-tone-rates-liquidity-and-bank-nifty"],
    publishedAt: new Date("2026-05-28"),
    published: true,
    slug: "reading-rbi-tone-rates-liquidity-and-bank-nifty",
  },
];

async function main() {
  await connectDb();

  for (const plan of PLANS) {
    await PlanCatalog.findOneAndUpdate(
      { planKey: plan.planKey, durationMonths: plan.durationMonths },
      { ...plan, active: true },
      { upsert: true, new: true },
    );
  }
  console.log("Seeded plan catalog");

  const tradeCount = await PastTrade.countDocuments();
  if (tradeCount === 0) {
    await PastTrade.insertMany(PAST_TRADES);
    console.log(`Seeded ${PAST_TRADES.length} past trades`);
  } else {
    console.log(`Past trades already seeded (${tradeCount} rows)`);
  }

  const testimonialCount = await Testimonial.countDocuments();
  if (testimonialCount === 0) {
    await Testimonial.insertMany(TESTIMONIALS);
    console.log(`Seeded ${TESTIMONIALS.length} testimonials`);
  } else {
    console.log(`Testimonials already seeded (${testimonialCount} rows)`);
  }

  const blogCount = await BlogPost.countDocuments();
  if (blogCount === 0) {
    await BlogPost.insertMany(BLOG_POSTS);
    console.log(`Seeded ${BLOG_POSTS.length} blog posts`);
  } else {
    console.log(`Blog posts already seeded (${blogCount} rows)`);
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@apexprotraders.in";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "AdminPass123!";
  const existing = await User.findOne({ email: adminEmail.toLowerCase() });
  if (!existing) {
    await User.create({
      email: adminEmail.toLowerCase(),
      passwordHash: await hashPassword(adminPassword),
      fullName: "Admin User",
      roles: ["admin", "user"],
    });
    console.log(`Created admin user: ${adminEmail}`);
  } else {
    if (!existing.roles.includes("admin")) {
      existing.roles.push("admin");
      await existing.save();
    }
    console.log(`Admin user already exists: ${adminEmail}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
