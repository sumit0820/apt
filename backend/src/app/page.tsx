export default function HomePage() {
  return (
    <main style={{ maxWidth: 720, margin: "4rem auto", padding: "0 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>APT Backend API</h1>
      <p style={{ color: "#a3a3a3", marginBottom: "2rem" }}>
        Next.js + MongoDB backend running in parallel to the main TanStack frontend.
      </p>
      <ul style={{ lineHeight: 1.8 }}>
        <li>
          <code>GET /api/health</code> — health check
        </li>
        <li>
          <code>POST /api/auth/signup</code> · <code>POST /api/auth/login</code> · <code>GET /api/auth/me</code>
        </li>
        <li>
          <code>GET /api/plans</code> — plan catalog
        </li>
        <li>
          <code>POST /api/subscriptions/create</code> · <code>verify</code> · <code>GET /api/subscriptions/me</code>
        </li>
        <li>
          <code>GET /api/admin/overview</code> · <code>GET /api/admin/subscribers</code>
        </li>
        <li>
          <code>POST /api/contact</code> · <code>POST /api/webhooks/razorpay</code>
        </li>
      </ul>
      <p style={{ marginTop: "2rem", color: "#a3a3a3" }}>
        See <code>backend/README.md</code> for full endpoint documentation.
      </p>
    </main>
  );
}
