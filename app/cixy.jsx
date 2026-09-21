"use client";

import { useEffect, useRef, useState } from "react";
import CixyWardrobe from "./cixy-wardrobe.jsx";

export default function Cixy() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState("chat");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/cixy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "request_failed");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.text }]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) =>
        prev.slice(0, -1)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cixy-container">
      <button
        className="cixy-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle Cixy chat"
      >
        {open ? "✕" : "Cixy"}
      </button>

      {open && (
        <div className="cixy-chat">
          <div className="cixy-header">
            <h3>Cixy · Launch Ops AI</h3>
            <p>Launch strategy, waitlists, positioning, GTM sequencing</p>
            <div className="cixy-tabs" role="tablist" aria-label="Cixy">
              <button
                type="button"
                role="tab"
                aria-selected={panel === "chat"}
                className={panel === "chat" ? "is-active" : ""}
                onClick={() => setPanel("chat")}
              >
                Chat
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={panel === "wardrobe"}
                className={panel === "wardrobe" ? "is-active" : ""}
                onClick={() => setPanel("wardrobe")}
              >
                Wardrobe
              </button>
            </div>
          </div>

          {panel === "wardrobe" ? (
            <div className="cixy-messages" role="tabpanel">
              <CixyWardrobe />
            </div>
          ) : (
          <div className="cixy-messages" role="tabpanel">
            {messages.length === 0 && (
              <div className="cixy-welcome">
                <p>
                  <strong>As-salamu alaykum!</strong> I'm Cixy, your launch operations
                  expert. Ask me about waitlist strategy, domain positioning, GTM timing,
                  or Vercel/GitHub setup.
                </p>
                <p className="cixy-hint">
                  Insha'Allah, let's ship this launch, one step at a time.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`cixy-message cixy-${msg.role}`}>
                {msg.role === "assistant" && <span className="cixy-badge">Cixy</span>}
                <div className="cixy-text">{msg.text}</div>
              </div>
            ))}

            {loading && (
              <div className="cixy-message cixy-assistant">
                <span className="cixy-badge">Cixy</span>
                <div className="cixy-text cixy-thinking">Thinking…</div>
              </div>
            )}

            {error && (
              <div className="cixy-error">
                Error: {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
          )}

          {panel === "chat" && (
          <form onSubmit={handleSubmit} className="cixy-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about launches, positioning, GTM…"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
          )}
        </div>
      )}

      <style jsx>{`
        .cixy-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          z-index: 9999;
        }

        .cixy-toggle {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          transition: all 0.3s;
        }

        .cixy-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .cixy-chat {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: min(380px, calc(100vw - 40px));
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
          display: flex;
          flex-direction: column;
        }

        .cixy-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px 12px 0 0;
        }

        .cixy-header h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
        }

        .cixy-header p {
          margin: 0;
          font-size: 12px;
          opacity: 0.9;
        }

        .cixy-tabs {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .cixy-tabs button {
          background: transparent;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.45);
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .cixy-tabs button.is-active {
          background: white;
          color: #3d2a6d;
          border-color: white;
        }

        .cixy-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cixy-welcome {
          text-align: center;
          color: #666;
          font-size: 14px;
        }

        .cixy-welcome p {
          margin: 8px 0;
        }

        .cixy-hint {
          font-style: italic;
          color: #999;
          font-size: 13px;
        }

        .cixy-message {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .cixy-user {
          justify-content: flex-end;
          text-align: right;
        }

        .cixy-assistant {
          justify-content: flex-start;
        }

        .cixy-badge {
          font-size: 11px;
          font-weight: bold;
          color: #667eea;
          min-width: 40px;
        }

        .cixy-text {
          background: #f3f4f6;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.4;
          max-width: 80%;
        }

        .cixy-user .cixy-text {
          background: #667eea;
          color: white;
        }

        .cixy-thinking {
          font-style: italic;
          color: #999;
        }

        .cixy-error {
          background: #fee;
          color: #c33;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13px;
        }

        .cixy-form {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .cixy-form input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }

        .cixy-form button {
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .cixy-form button:hover:not(:disabled) {
          background: #5568d3;
        }

        .cixy-form button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
