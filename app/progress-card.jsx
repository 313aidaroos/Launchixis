"use client";

export default function ProgressCard({ launch }) {
  if (!launch) return null;

  // Find specific steps: auth, admin, support
  const items = launch.items || [];
  const authItem = items.find((i) => i.id === "auth");
  const adminItem = items.find((i) => i.id === "admin");
  const supportItem = items.find((i) => i.id === "support");

  const authDone = authItem?.done ?? false;
  const adminDone = adminItem?.done ?? false;
  const supportDone = supportItem?.done ?? false;

  const statuses = [
    { label: "Auth (Magic Link)", done: authDone, hint: "OAuth/magic-link signup" },
    { label: "Admin", done: adminDone, hint: "awad@apixis.dev can manage" },
    { label: "Support Intake", done: supportDone, hint: "launchixis@apixis.dev → awad" },
  ];

  return (
    <div className="progress-card">
      <h3>Progress</h3>
      <div className="progress-items">
        {statuses.map((s) => (
          <div key={s.label} className={`progress-item ${s.done ? "done" : ""}`}>
            <div className="progress-check">
              {s.done ? "✓" : "○"}
            </div>
            <div className="progress-details">
              <div className="progress-label">{s.label}</div>
              <div className="progress-hint">{s.hint}</div>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .progress-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px;
          margin-top: 16px;
        }

        .progress-card h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .progress-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 8px;
          border-radius: 6px;
          background: white;
          border: 1px solid #f0f0f0;
        }

        .progress-item.done {
          background: #f0fdf4;
          border-color: #dcfce7;
        }

        .progress-check {
          font-size: 16px;
          font-weight: bold;
          min-width: 24px;
          text-align: center;
          color: #6b7280;
        }

        .progress-item.done .progress-check {
          color: #16a34a;
        }

        .progress-details {
          flex: 1;
        }

        .progress-label {
          font-size: 13px;
          font-weight: 500;
          color: #111827;
        }

        .progress-hint {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
