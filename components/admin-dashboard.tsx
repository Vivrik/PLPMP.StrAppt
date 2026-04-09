"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { SubmissionRecord } from "@/lib/types";

export function AdminDashboard({ submissions }: { submissions: SubmissionRecord[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => {
      void (async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.refresh();
      })();
    });
  }

  return (
    <div className="admin-shell container">
      <div className="section-heading">
        <span className="eyebrow">Admin dashboard</span>
        <h1 style={{ fontSize: "clamp(2.6rem, 8vw, 4.8rem)" }}>Track leads, scores, and delivery status.</h1>
        <div className="stack-row">
          <p className="section-copy" style={{ margin: 0 }}>
            Review assessment submissions, identify patterns, and inspect report fulfillment.
          </p>
          <button type="button" className="secondary-button" disabled={isPending} onClick={handleLogout}>
            {isPending ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>

      <div className="admin-grid">
        <article className="feature-card">
          <span className="feature-tag">Submissions</span>
          <div className="metric-value">{submissions.length}</div>
        </article>
        <article className="feature-card">
          <span className="feature-tag">Reports sent</span>
          <div className="metric-value">{submissions.filter((item) => item.emailStatus === "sent").length}</div>
        </article>
        <article className="feature-card">
          <span className="feature-tag">Delivery issues</span>
          <div className="metric-value">{submissions.filter((item) => item.emailStatus === "failed").length}</div>
        </article>
      </div>

      <section className="table-card" style={{ marginTop: "1.5rem" }}>
        {submissions.length === 0 ? (
          <div className="empty-state">No submissions yet. Complete an assessment to populate the dashboard.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Submitted</th>
                <th>Lead</th>
                <th>Profile</th>
                <th>Overall</th>
                <th>Weakest areas</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => {
                const weakest = [...submission.summary.sectionScores]
                  .sort((left, right) => left.score - right.score)
                  .slice(0, 2)
                  .map((item) => item.section)
                  .join(", ");

                return (
                  <tr key={submission.id}>
                    <td>{new Date(submission.createdAt).toLocaleString()}</td>
                    <td>
                      <strong>{submission.contact?.name || "Preview only"}</strong>
                      <div className="muted-copy">{submission.contact?.email || "No email captured"}</div>
                    </td>
                    <td>
                      <div style={{ textTransform: "capitalize" }}>{submission.profile.stage}</div>
                      <div className="muted-copy" style={{ textTransform: "capitalize" }}>
                        {submission.profile.businessType} | {submission.profile.teamSize}
                      </div>
                    </td>
                    <td>
                      <strong>{submission.summary.overallScore}</strong>
                      <div>
                        <span className="score-pill" data-label={submission.summary.overallLabel}>
                          {submission.summary.overallLabel}
                        </span>
                      </div>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{weakest}</td>
                    <td>
                      <span className="status-pill" data-status={submission.emailStatus}>
                        {submission.emailStatus.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
