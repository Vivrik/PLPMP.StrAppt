import Link from "next/link";

const pillars = [
  {
    title: "Surface the hidden drag",
    copy:
      "Find the strategic and operational issues that are quietly limiting margin, velocity, and confidence."
  },
  {
    title: "Score what matters now",
    copy:
      "Balance core business functions with stage-aware weighting so early and scaling companies are judged fairly."
  },
  {
    title: "Turn findings into sequence",
    copy:
      "Convert weak spots into a practical 30-, 60-, and 90-day roadmap rather than a vague list of ideas."
  }
];

const audiences = [
  "SMB owners trying to professionalize execution",
  "startup founders tightening go-to-market and operating cadence",
  "consultants who want a credible diagnostic before recommending change"
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <article className="hero-card">
            <div className="hero-content">
              <span className="eyebrow">Business strategy + operations diagnostic</span>
              <h1>See where the business is strong, fragile, and quietly leaking momentum.</h1>
              <p className="lede">
                OperatorOS helps entrepreneurs diagnose strategic alignment, growth systems,
                delivery operations, finance, people, and technology before building an
                optimization roadmap.
              </p>
              <div className="hero-actions">
                <Link href="/assessment" className="primary-button">
                  Start the diagnostic
                </Link>
                <a href="#framework" className="secondary-button">
                  Explore the framework
                </a>
              </div>
              <div className="hero-highlights">
                <div className="metric-card">
                  <div className="metric-label">Assessment coverage</div>
                  <div className="metric-value">7 functions</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Roadmap horizon</div>
                  <div className="metric-value">90 days</div>
                </div>
              </div>
            </div>
          </article>

          <aside className="hero-card hero-side">
            <div className="panel">
              <span className="feature-tag">What you get</span>
              <h3 style={{ marginTop: "0.8rem" }}>Immediate score preview, then a polished roadmap by email.</h3>
              <p className="muted-copy">
                Complete the multi-step assessment, review your headline results instantly, and
                unlock the full report with prioritized initiatives and rationale.
              </p>
            </div>
            <div className="metric-card">
              <div className="metric-label">Designed for</div>
              <div className="bullet-list">
                {audiences.map((audience) => (
                  <span key={audience}>{audience}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="section" id="framework">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Framework</span>
            <h2>One diagnostic lens, shaped by business stage.</h2>
            <p className="section-copy">
              The MVP uses a balanced score across strategy, marketing, sales, operations,
              finance, people, and technology. Recommendations adapt to whether the business is
              at idea, launch, growth, or scale.
            </p>
          </div>

          <div className="feature-grid">
            {pillars.map((pillar, index) => (
              <article className="feature-card" key={pillar.title}>
                <span className="feature-tag">0{index + 1}</span>
                <h3 style={{ marginTop: "0.9rem", marginBottom: "0.7rem" }}>{pillar.title}</h3>
                <p className="muted-copy">{pillar.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container two-column-grid">
          <article className="panel">
            <span className="eyebrow">Diagnostic flow</span>
            <h2 style={{ marginTop: "1rem" }}>From self-assessment to roadmap in one sitting.</h2>
            <div className="bullet-list" style={{ marginTop: "1rem" }}>
              <span>1. Capture stage, business model, team size, and revenue band.</span>
              <span>2. Score fourteen weighted questions across seven business functions.</span>
              <span>3. Preview overall maturity, strengths, risks, and top initiatives.</span>
              <span>4. Capture email after preview and send a polished report + PDF link.</span>
            </div>
          </article>
          <article className="panel">
            <span className="eyebrow">Internal operations</span>
            <h3 style={{ marginTop: "1rem", marginBottom: "0.8rem" }}>
              Lightweight admin visibility for follow-up and QA.
            </h3>
            <p className="muted-copy">
              The admin experience includes protected submission review, score breakdowns, report
              status, and contact details so this can work both as a lead magnet and an operating
              tool.
            </p>
            <div className="stack-row" style={{ marginTop: "1rem" }}>
              <Link href="/admin" className="secondary-button">
                View admin area
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
