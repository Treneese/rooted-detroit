import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMemberPlans } from "../api/rootedApi";

const categories = [
  { key: "NUTRITION", label: "Nutrition", short: "Nutrition", icon: "🥗", description: "Food, meals, portions, and practical nutrition support" },
  { key: "HERBAL", label: "Herbs & Natural Support", short: "Herbs & Tea", icon: "🌿", description: "Personalized natural-health support with safety guidance" },
  { key: "SLEEP", label: "Sleep", short: "Sleep", icon: "☾", description: "Rest, recovery, and sleep routine" },
  { key: "MOVEMENT", label: "Movement", short: "Movement", icon: "↗", description: "Movement and physical activity" },
  { key: "STRESS", label: "Stress & Recovery", short: "Stress", icon: "◌", description: "Stress support, recovery, and mental wellness" },
  { key: "NATURE", label: "Nature & Environment", short: "Nature", icon: "🌳", description: "Outdoor time, sunlight, and environment" },
  { key: "HYDRATION", label: "Hydration", short: "Hydration", icon: "💧", description: "Daily hydration support" },
  { key: "MEDICAL_FOLLOW_UP", label: "Medical Support", short: "Medical", icon: "✚", description: "Clinical care, testing, and follow-up" },
];

function formatDate(value) {
  if (!value) return "Not scheduled";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function Plan() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("OVERVIEW");

  useEffect(() => {
    async function loadPlan() {
      try {
        const plans = await getMemberPlans(1);
        const active = plans.find((item) => item.status === "ACTIVE") || plans[0];
        setPlan(active || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, []);

  const activeCategories = useMemo(() => {
    if (!plan) return [];
    return categories.filter((category) =>
      plan.items.some((item) => item.category === category.key)
    );
  }, [plan]);

  const visibleCategories = useMemo(() => {
    if (activeTab === "OVERVIEW") return categories;
    return categories.filter((category) => category.key === activeTab);
  }, [activeTab]);

  if (loading) return <div className="center-state"><p>Growing your plan...</p></div>;
  if (error) return <div className="center-state"><h2>We couldn't load your plan.</h2><p>{error}</p></div>;
  if (!plan) return <main className="dashboard page-screen"><h2 className="page-title">No active plan yet.</h2></main>;

  const practitioner = plan.practitioner
    ? `${plan.practitioner.first_name} ${plan.practitioner.last_name}`
    : "Your ROOTED care team";

  return (
    <main className="dashboard plan-page plan-page-v2">
      <section className="plan-hero plan-hero-v2">
        <div className="plan-hero-kicker">
          <span className="section-label">YOUR PERSONALIZED PLAN</span>
          <span className="plan-approved-pill">✓ Practitioner approved</span>
        </div>

        <div className="plan-hero-heading">
          <div>
            <h2>{plan.title || "Your Whole-Health Plan"}</h2>
            <p>{plan.summary || "A whole-health plan built around your health information, daily life, goals, and barriers."}</p>
          </div>
          <span className="status-badge">{plan.status}</span>
        </div>

        <div className="plan-care-team-strip">
          <div className="plan-practitioner-avatar">{plan.practitioner?.first_name?.[0] || "R"}</div>
          <div className="plan-practitioner-copy">
            <small>CREATED & OVERSEEN BY</small>
            <strong>{practitioner}</strong>
            <span>{plan.practitioner?.credentials || plan.practitioner?.practitioner_type || "ROOTED practitioner"}</span>
          </div>
          <div className="plan-care-divider" />
          <div className="plan-mini-meta"><small>PLAN</small><strong>Version {plan.version}</strong></div>
          <div className="plan-mini-meta"><small>NEXT REVIEW</small><strong>{formatDate(plan.review_date)}</strong></div>
        </div>
      </section>

      <section className="plan-week-card">
        <div>
          <span className="section-label">THIS WEEK</span>
          <h3>Your whole health, working together.</h3>
          <p>These recommendations come from one connected plan—not separate wellness tips.</p>
        </div>
        <div className="plan-week-stats">
          <div><strong>{activeCategories.length}</strong><span>plan areas</span></div>
          <div><strong>{plan.items.length}</strong><span>recommendations</span></div>
          <div><strong>{plan.status === "ACTIVE" ? "Live" : plan.status}</strong><span>plan status</span></div>
        </div>
      </section>

      <section className="plan-content plan-content-v2">
        <div className="plan-tabs plan-tabs-v2" role="tablist" aria-label="Plan areas">
          <button className={activeTab === "OVERVIEW" ? "active" : ""} onClick={() => setActiveTab("OVERVIEW")}>Overview</button>
          {activeCategories.map((category) => (
            <button key={category.key} className={activeTab === category.key ? "active" : ""} onClick={() => setActiveTab(category.key)}>
              {category.short}
            </button>
          ))}
        </div>

        <div className="section-heading plan-section-heading">
          <div>
            <span className="section-label">{activeTab === "OVERVIEW" ? "YOUR CARE PLAN" : "PLAN AREA"}</span>
            <h3>{activeTab === "OVERVIEW" ? "What you're focusing on" : categories.find((c) => c.key === activeTab)?.label}</h3>
          </div>
          {activeTab === "OVERVIEW" && <span className="plan-count">{plan.items.length} active recommendations</span>}
        </div>

        <div className={`plan-category-list ${activeTab !== "OVERVIEW" ? "single-category" : ""}`}>
          {visibleCategories.map((category) => {
            const item = plan.items.find((planItem) => planItem.category === category.key);
            return (
              <article className={`plan-category-card plan-category-card-v2 ${item ? "has-plan" : "not-added"}`} key={category.key}>
                <div className="plan-category-icon">{category.icon}</div>
                <div className="plan-category-body">
                  <div className="plan-category-top">
                    <div>
                      <span>{category.label}</span>
                      <h4>{item ? item.title : category.description}</h4>
                    </div>
                    <span className={item ? "recommendation-status active" : "recommendation-status"}>{item ? "IN YOUR PLAN" : "NOT ADDED"}</span>
                  </div>

                  {item ? (
                    <>
                      {item.purpose && <div className="plan-why"><small>WHY THIS IS IN YOUR PLAN</small><p>{item.purpose}</p></div>}
                      <div className="plan-instruction"><small>YOUR GUIDANCE</small><p>{item.instructions}</p></div>
                      <div className="recommendation-details">
                        {item.frequency && <span><strong>Frequency</strong>{item.frequency}</span>}
                        {item.duration && <span><strong>Duration</strong>{item.duration}</span>}
                      </div>
                      {item.caution && <div className="plan-caution"><strong>Safety note</strong>{item.caution}</div>}
                    </>
                  ) : (
                    <p>This area is not part of your current practitioner-approved plan.</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="plan-support-grid">
        <Link to="/ask" className="plan-support-card plan-support-ai">
          <span className="plan-support-icon">✦</span>
          <div><small>ASK ROOTED</small><strong>Need help following your plan?</strong><p>Ask how to apply your existing recommendations to everyday life.</p></div>
          <b>→</b>
        </Link>
        <Link to="/practitioner" className="plan-support-card">
          <span className="plan-support-icon">♙</span>
          <div><small>YOUR CARE TEAM</small><strong>Professional oversight stays visible.</strong><p>Your plan is created and reviewed by people—not generated by AI alone.</p></div>
          <b>→</b>
        </Link>
      </section>

      <section className="plan-philosophy plan-philosophy-v2">
        <span>🌱</span>
        <div><strong>Health is a system.</strong><p>Food, sleep, movement, stress, natural support, environment, and medical care work together. ROOTED keeps the full picture connected.</p></div>
      </section>
    </main>
  );
}

export default Plan;
