import { useEffect, useState } from "react";
import { getMemberInsights } from "../api/rootedApi";
import { Link } from "react-router-dom";

const insightMeta = {
  PROGRESS: {
    icon: "↗",
    label: "Progress",
  },
  SAFETY: {
    icon: "!",
    label: "Safety review",
  },
  REVIEW: {
    icon: "◎",
    label: "Professional review",
  },
};

function IntelligencePanel({
  memberId = 1,
  mode = "member",
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInsights() {
      try {
        const result = await getMemberInsights(memberId);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadInsights();
  }, [memberId]);

  if (loading) {
    return (
      <section className="intelligence-panel">
        <p>ROOTED Intelligence is reviewing your health picture…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="intelligence-panel">
        <p>{error}</p>
      </section>
    );
  }

  const insights = data?.insights || [];

  return (
    <section className="intelligence-panel">
      <div className="intelligence-heading">
        <div>
          <span className="section-eyebrow">
            ROOTED INTELLIGENCE
          </span>

          <h2>
            {mode === "practitioner"
              ? "What deserves attention"
              : "Connecting the pieces"}
          </h2>

          <p>
            {mode === "practitioner"
              ? "ROOTED brings together health history, labs, the active plan, and progress so important context is easier to review."
              : "ROOTED looks across your health profile, plan, testing, and progress to help you see how the pieces connect."}
          </p>
        </div>

        <div className="intelligence-mark">
          <span>R</span>
          <small>INTELLIGENCE</small>
        </div>
      </div>

      {mode === "practitioner" && (
  <div className="practitioner-review-summary">
    <div>
      <strong>
        {
          insights.filter(
            (insight) =>
              insight.requires_professional_review
          ).length
        }
      </strong>
      <span>items need review</span>
    </div>

    <div>
      <strong>
        {
          insights.filter(
            (insight) =>
              insight.category === "PROGRESS"
          ).length
        }
      </strong>
      <span>progress signals</span>
    </div>

    <div>
      <strong>
        {data?.generated_from
          ?.active_plan_version || "—"}
      </strong>
      <span>active plan version</span>
    </div>
  </div>
)}

     <div className="intelligence-grid">
  {insights.map((insight) => {
    const meta =
      insightMeta[insight.category] ||
      insightMeta.PROGRESS;

    return (
      <article
        key={insight.id}
        className={`intelligence-card intelligence-${insight.category.toLowerCase()}`}
      >
        <div className="intelligence-card-top">
          <span className="intelligence-icon">
            {meta.icon}
          </span>

          <span className="intelligence-type">
            {meta.label}
          </span>

          {insight.requires_professional_review && (
            <span className="review-pill">
              REVIEW
            </span>
          )}
        </div>

        <h3>{insight.title}</h3>

        <p>{insight.summary}</p>

        {insight.evidence?.length > 0 && (
          <div className="intelligence-evidence">
            <span>Connected from</span>

            <div className="evidence-list">
              {insight.evidence.map(
                (evidence, index) => (
                  <div
                    className="evidence-chip"
                    key={`${insight.id}-${index}`}
                  >
                    <small>
                      {evidence.label}
                    </small>

                    <strong>
                      {evidence.value}
                    </strong>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {mode === "practitioner" &&
          insight.requires_professional_review && (
            <div className="practitioner-intelligence-action">
              {insight.category === "REVIEW" && (
                <Link to="/testing">
                  Review testing
                  <span>→</span>
                </Link>
              )}

              {insight.category === "SAFETY" && (
                <Link to="/plan">
                  Review active plan
                  <span>→</span>
                </Link>
              )}
            </div>
          )}
      </article>
    );
  })}
</div>

      {mode === "member" && (
  <Link
    to="/ask"
    className="intelligence-ask-link"
  >
    Ask ROOTED about your health picture
    <span>→</span>
  </Link>
)}

      <div className="intelligence-boundary">
        <span>✦</span>
        <p>{data?.disclaimer}</p>
      </div>
    </section>
  );
}

export default IntelligencePanel;