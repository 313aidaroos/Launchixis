"use client";

import { useState } from "react";

export default function SupportPage() {
  const [form, setForm] = useState({
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
          company_slug: "launchixis",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "request_failed");
      }

      setSent(true);
      setForm({ email: "", subject: "", message: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shell">
      <header className="top">
        <div>
          <div className="logo">LAUNCHIXIS</div>
          <h1>Support</h1>
          <p className="lede">
            Have a question or need help? Send us a message and we'll route it to
            awad@apixis.dev.
          </p>
        </div>
      </header>

      {sent && (
        <div className="support-success">
          <h2>Message sent</h2>
          <p>
            Your support request has been received and routed to awad@apixis.dev.
            We'll respond to your email as soon as possible.
          </p>
          <button
            onClick={() => setSent(false)}
            className="btn ghost"
            style={{ marginTop: 12 }}
          >
            Send another message
          </button>
        </div>
      )}

      {!sent && (
        <form onSubmit={handleSubmit} className="support-form">
          {error && <p className="err">{error}</p>}
          
          <div>
            <label htmlFor="email">Your email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              value={form.subject}
              onChange={(e) => update("subject", e.target.value)}
              placeholder="What do you need help with?"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder="Describe your issue or question in detail…"
              disabled={loading}
              required
              style={{ minHeight: 120 }}
            />
          </div>

          <button
            type="submit"
            className="btn"
            disabled={
              loading ||
              !form.email.trim() ||
              !form.subject.trim() ||
              !form.message.trim()
            }
          >
            {loading ? "Sending…" : "Send message"}
          </button>
        </form>
      )}

      <div className="support-footer">
        <p style={{ color: "var(--dim)", fontSize: 14, marginBottom: 12 }}>
          Support inbox: <strong style={{ color: "var(--text)" }}>launchixis@apixis.dev</strong>
          <br />
          Routes to: <strong style={{ color: "var(--text)" }}>awad@apixis.dev</strong>
        </p>
        <a href="/">← Back to board</a>
      </div>

      <style jsx>{`
        .support-form {
          max-width: 600px;
          margin: 24px 0;
        }

        .support-form > div {
          margin-bottom: 16px;
        }

        .support-success {
          max-width: 500px;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }

        .support-success h2 {
          font-size: 18px;
          color: var(--gold-2);
          margin: 0 0 12px 0;
        }

        .support-success p {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        .support-footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--line);
        }

        .support-footer a {
          color: var(--gold);
          text-decoration: none;
          font-size: 14px;
        }

        .support-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
