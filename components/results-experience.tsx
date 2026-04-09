"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { SubmissionRecord } from "@/lib/types";

export function ResultsExperience() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id");
  const [submission, setSubmission] = useState<SubmissionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveryMessage, setDeliveryMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  useEffect(() => {
    async function load() {
      if (!submissionId) {
        setError("Missing submission id.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/assessment/${submissionId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to load diagnostic.");
        setIsLoading(false);
        return;
      }

      setSubmission(data);
      setIsLoading(false);
    }

    void load();
  }, [submissionId]);

  const overallScore = submission?.summary.overallScore ?? 0;
  const roadmap = submission?.summary.roadmap ?? [];
  const sortedSections = useMemo(() => {
    return [...(submission?.summary.sectionScores ?? [])].sort((left, right) => left.score - right.score);
  }, [submission]);

  async function sendReport() {
    if (!submissionId) return;

    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/report/deliver", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submissionId,
            contact: { name, email, company }
          })
        });

        const data = await response.json();

        if (!response.ok) {
          setDeliveryMessage(data.error ?? "We could not deliver the report.");
          return;
        }

        setSubmission(data.submission);
        setDeliveryMessage(
          data.delivery.status === "sent"
            ? "Report sent successfully."
            : `Report generated, but email delivery failed: ${data.delivery.error ?? "unknown issue"}`
        );
      })();
    });
  }

  if (isLoading) {
    return (
      <div className="container results-shell">
        <div className="panel">Loading your diagnostic...</div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="container results-shell">
        <div className="error-state">{error ?? "Submission not found."}</div>
      </div>
    );
  }

  return (
    <div className="container results-shell">
      <div className="section-heading">
        <span className="eyebrow">Results preview</span>
        <h1 style={{ fontSize: "clamp(2.6rem, 8vw, 4.8rem)" }}>Your business can move faster with sharper priorities.</h1>
        <p className="section-copy">
          This preview shows the score profile and top roadmap items first. Enter your email to
          receive the polished report and PDF link.
        </p>
      </div>

      <div className="result-grid">
        <section className="result-card">
          <div className="kpi-ring" style={{ ["--score" as string]: overallScore }}>
            <strong>{overallScore}</strong>
          </div>
          <div className="stack-row" style={{ justifyContent: "center", marginTop: "1rem" }}>
            <span className="score-pill" data-label={submission.summary.overallLabel}>
              {submission.summary.overallLabel}
            </span>
          </div>
          <div className="bullet-list" style={{ marginTop: "1.4rem" }}>
            <strong>Top strengths</strong>
            {submission.summary.topStrengths.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="bullet-list" style={{ marginTop: "1.4rem" }}>
            <strong>Primary risks</strong>
            {submission.summary.topRisks.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        <section className="result-card">
          <h3>Email the full roadmap</h3>
          <p className="muted-copy">
            We’ll send the polished advisory report and generated PDF link after you unlock it.
          </p>
          <div className="form-grid" style={{ marginTop: "1rem" }}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="field full">
              <label htmlFor="company">Company (optional)</label>
              <input
                id="company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />
            </div>
          </div>

          <div className="stack-row" style={{ marginTop: "1rem" }}>
            <button
              type="button"
              className="primary-button"
              disabled={isPending || !name || !email}
              onClick={sendReport}
            >
              {isPending ? "Delivering..." : "Email my roadmap"}
            </button>
            {submission.pdfUrl ? (
              <span className="muted-copy">PDF placeholder: {submission.pdfUrl}</span>
            ) : null}
          </div>

          {deliveryMessage ? <div className="panel" style={{ marginTop: "1rem" }}>{deliveryMessage}</div> : null}
        </section>
      </div>

      <section className="section">
        <div className="stats-grid">
          <article className="result-card">
            <h3>Section scores</h3>
            <div className="score-list" style={{ marginTop: "1rem" }}>
              {submission.summary.sectionScores.map((section) => (
                <div key={section.section} className="score-row">
                  <div>
                    <strong style={{ textTransform: "capitalize" }}>{section.section}</strong>
                    <div className="muted-copy">{section.summary}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <strong>{section.score}</strong>
                    <div>
                      <span className="score-pill" data-label={section.label}>
                        {section.label}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="result-card">
            <h3>Where to act first</h3>
            <div className="bullet-list" style={{ marginTop: "1rem" }}>
              {sortedSections.slice(0, 3).map((section) => (
                <span key={section.section}>
                  <strong style={{ textTransform: "capitalize" }}>{section.section}</strong>:{" "}
                  {section.summary}
                </span>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <span className="eyebrow">Roadmap</span>
          <h2>Priority moves for the next 90 days</h2>
        </div>
        <div className="roadmap-grid">
          {roadmap.map((item) => (
            <article className="roadmap-card" key={item.id}>
              <span className="feature-tag">
                #{item.order} {item.timeframe}
              </span>
              <h3 style={{ marginTop: "0.8rem", marginBottom: "0.5rem" }}>{item.title}</h3>
              <p className="muted-copy">{item.rationale}</p>
              <div className="stack-row" style={{ marginTop: "1rem" }}>
                <span className="score-pill" data-label="stable">
                  Impact: {item.impact}
                </span>
                <span className="score-pill" data-label="developing">
                  Effort: {item.effort}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
