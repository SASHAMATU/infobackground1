export default function PrivacyPage() {
  return (
    <main style={{ padding: "160px 24px 100px", maxWidth: "720px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "24px" }}>
        Privacy Policy
      </h1>
      <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
        {/* TODO: replace with real privacy policy content before launch.
            The contact form collects name, contact info, and task details,
            stores them in Supabase, and may send them to Telegram and to
            whichever analytics providers are configured via environment
            variables. This page needs real legal copy describing that —
            not something to draft automatically, hand it to whoever owns
            compliance for this business. */}
        This page is a placeholder. Legal review pending — see the TODO in
        this file&apos;s source for what needs to be covered before launch.
      </p>
    </main>
  );
}
