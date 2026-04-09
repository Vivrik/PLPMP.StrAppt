"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { questionBank } from "@/lib/questions";
import { BusinessProfile, SectionId } from "@/lib/types";

const sectionOrder: SectionId[] = [
  "strategy",
  "marketing",
  "sales",
  "operations",
  "finance",
  "people",
  "technology"
];

const stageOptions = [
  { value: "idea", label: "Idea / Pre-launch" },
  { value: "launch", label: "Launch / Early traction" },
  { value: "growth", label: "Growth / Expansion" },
  { value: "scale", label: "Scale / Multi-team" }
] as const;

const typeOptions = [
  { value: "services", label: "Services" },
  { value: "ecommerce", label: "Ecommerce" },
  { value: "saas", label: "SaaS" },
  { value: "local", label: "Local business" },
  { value: "agency", label: "Agency" },
  { value: "other", label: "Other" }
] as const;

const teamOptions = [
  { value: "solo", label: "Solo" },
  { value: "2-10", label: "2-10" },
  { value: "11-25", label: "11-25" },
  { value: "26-50", label: "26-50" },
  { value: "51+", label: "51+" }
] as const;

const revenueOptions = [
  { value: "pre-revenue", label: "Pre-revenue" },
  { value: "0-100k", label: "$0-$100k" },
  { value: "100k-500k", label: "$100k-$500k" },
  { value: "500k-2m", label: "$500k-$2M" },
  { value: "2m+", label: "$2M+" }
] as const;

const defaultProfile: BusinessProfile = {
  stage: "launch",
  businessType: "services",
  teamSize: "2-10",
  revenueBand: "0-100k"
};

export function AssessmentExperience() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [profile, setProfile] = useState<BusinessProfile>(defaultProfile);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [currentSection, setCurrentSection] = useState<SectionId>(sectionOrder[0]);
  const [error, setError] = useState<string | null>(null);

  const groupedQuestions = useMemo(() => {
    return sectionOrder.map((section) => ({
      section,
      questions: questionBank.filter((question) => question.section === section)
    }));
  }, []);

  const totalAnswered = Object.keys(responses).length;
  const progress = Math.round((totalAnswered / questionBank.length) * 100);

  function updateResponse(questionId: string, value: number) {
    setResponses((current) => ({ ...current, [questionId]: value }));
  }

  function goToNextSection() {
    const index = sectionOrder.indexOf(currentSection);
    const nextSection = sectionOrder[Math.min(index + 1, sectionOrder.length - 1)];
    setCurrentSection(nextSection);
  }

  async function handleSubmit() {
    if (totalAnswered !== questionBank.length) {
      setError("Please answer every question before generating your diagnostic.");
      return;
    }

    setError(null);

    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/assessment/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile, responses })
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? "We could not score the assessment.");
          return;
        }

        router.push(`/results?id=${data.id}`);
      })();
    });
  }

  return (
    <div className="container assessment-shell">
      <div className="section-heading">
        <span className="eyebrow">Assessment</span>
        <h1 style={{ fontSize: "clamp(2.6rem, 8vw, 4.8rem)" }}>Diagnose the business before you optimize it.</h1>
        <p className="section-copy">
          Score the operating reality across seven core functions. The roadmap is generated from
          deterministic rules first, then polished into a readable report after the preview.
        </p>
      </div>

      <div className="two-column-grid">
        <section className="panel">
          <h3>Business profile</h3>
          <p className="muted-copy">This context changes the weighting and phrasing of the roadmap.</p>

          <div className="form-grid" style={{ marginTop: "1rem" }}>
            <div className="field">
              <label htmlFor="stage">Stage</label>
              <select
                id="stage"
                value={profile.stage}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, stage: event.target.value as BusinessProfile["stage"] }))
                }
              >
                {stageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="type">Business type</label>
              <select
                id="type"
                value={profile.businessType}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    businessType: event.target.value as BusinessProfile["businessType"]
                  }))
                }
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="teamSize">Team size</label>
              <select
                id="teamSize"
                value={profile.teamSize}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    teamSize: event.target.value as BusinessProfile["teamSize"]
                  }))
                }
              >
                {teamOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="revenueBand">Revenue band</label>
              <select
                id="revenueBand"
                value={profile.revenueBand}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    revenueBand: event.target.value as BusinessProfile["revenueBand"]
                  }))
                }
              >
                {revenueOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <aside className="panel">
          <h3>Progress</h3>
          <div className="metric-value" style={{ marginTop: "0.3rem" }}>
            {progress}%
          </div>
          <div className="progress-bar" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="muted-copy">
            {totalAnswered} of {questionBank.length} questions answered
          </div>

          <div className="section-stepper" style={{ marginTop: "1.2rem" }}>
            {sectionOrder.map((section) => (
              <button
                type="button"
                key={section}
                className={`section-chip ${currentSection === section ? "active" : ""}`}
                onClick={() => setCurrentSection(section)}
              >
                {section}
              </button>
            ))}
          </div>
        </aside>
      </div>

      <section className="panel" style={{ marginTop: "1.5rem" }}>
        <div className="section-heading" style={{ marginBottom: "1rem" }}>
          <span className="eyebrow">Current section</span>
          <h2 style={{ textTransform: "capitalize" }}>{currentSection}</h2>
        </div>

        <div className="question-stack">
          {groupedQuestions
            .find((group) => group.section === currentSection)
            ?.questions.map((question) => (
              <article className="question-card" key={question.id}>
                <h3>{question.prompt}</h3>
                <p className="muted-copy">{question.helpText}</p>
                <div className="option-grid">
                  {question.options.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={`option-button ${responses[question.id] === option.value ? "active" : ""}`}
                      onClick={() => updateResponse(question.id, option.value)}
                    >
                      <span className="option-label">{option.label}</span>
                      <span className="option-description">{option.description}</span>
                    </button>
                  ))}
                </div>
              </article>
            ))}
        </div>

        {error ? <div className="error-state" style={{ marginTop: "1rem" }}>{error}</div> : null}

        <div className="stack-row" style={{ marginTop: "1.5rem" }}>
          <button type="button" className="secondary-button" onClick={goToNextSection}>
            Next section
          </button>
          <button type="button" className="primary-button" disabled={isPending} onClick={handleSubmit}>
            {isPending ? "Scoring diagnostic..." : "Generate preview"}
          </button>
        </div>
      </section>
    </div>
  );
}
