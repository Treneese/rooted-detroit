import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMemberPlans } from "../api/rootedApi";

const DEMO_HERBAL_DETAILS = {
  "morning detox tea": {
    image: "🌿",
    type: "Herbal tea",
    timing: "Morning",
    preparation: "Prepare according to the instructions in your approved plan.",
    purpose: "Daily herbal support included in your current wellness plan.",
    safety:
      "Follow the preparation and amount approved by your practitioner. Review medications, allergies, pregnancy status, and health conditions before making changes.",
  },

  "anti-inflammatory blend": {
    image: "🍃",
    type: "Herbal support",
    timing: "With your daily routine",
    preparation: "Use only as directed in your approved ROOTED plan.",
    purpose:
      "Natural support selected as part of your whole-health plan.",
    safety:
      "Do not increase the amount or add additional supplements without professional review.",
  },

  "evening calm tea": {
    image: "☕",
    type: "Herbal tea",
    timing: "Evening",
    preparation:
      "Prepare according to your plan and use at the recommended time.",
    purpose:
      "Supports the evening routine established in your personalized plan.",
    safety:
      "Check with your care team before combining herbal products with medications or other supplements.",
  },
};

function normalize(value = "") {
  return value.trim().toLowerCase();
}

function prettyDate(value) {
  if (!value) return "Not scheduled";

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HerbalGuide() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMemberPlans(1);
        setPlans(data);
      } catch (err) {
        setError(err.message || "Unable to load your herbal plan.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const activePlan = useMemo(
    () => plans.find((plan) => plan.status === "ACTIVE"),
    [plans]
  );

  const herbalItems = useMemo(() => {
    return (activePlan?.items || []).filter(
      (item) => item.category === "HERBAL"
    );
  }, [activePlan]);

  const selectedItem = herbalItems[selectedIndex];

  const selectedDetails = useMemo(() => {
    if (!selectedItem) return null;

    const searchable = normalize(
      `${selectedItem.title || ""} ${selectedItem.description || ""}`
    );

    const match = Object.entries(DEMO_HERBAL_DETAILS).find(([key]) =>
      searchable.includes(key)
    );

    return (
      match?.[1] || {
        image: "🌿",
        type: "Natural support",
        timing: selectedItem.frequency || "Follow your plan",
        preparation:
          selectedItem.instructions ||
          "Follow the preparation instructions provided by your practitioner.",
        purpose:
          selectedItem.description ||
          "This natural-health support is part of your personalized ROOTED plan.",
        safety:
          "Use this item only as directed in your practitioner-approved plan. Talk with your care team before changing the amount or combining it with additional herbs or supplements.",
      }
    );
  }, [selectedItem]);

  if (loading) {
    return (
      <main className="dashboard herbal-guide-page">
        <div className="rooted-loading-card">
          Loading your herbal guide…
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard herbal-guide-page">
        <div className="rooted-error-card">{error}</div>
      </main>
    );
  }

  return (
    <main className="dashboard herbal-guide-page">
      <section className="herbal-guide-hero">
        <div className="herbal-hero-content">
          <span className="section-label">HERBAL & NATURAL SUPPORT</span>

          <h2>
            Natural support,
            <br />
            connected to your health.
          </h2>

          <p>
            Explore the herbs and teas already included in your
            practitioner-approved ROOTED plan, along with preparation,
            timing, and safety guidance.
          </p>

          <div className="herbal-hero-badges">
            <span>✓ Practitioner approved</span>
            <span>✦ Personalized to your plan</span>
            <span>♡ Whole-health focused</span>
          </div>
        </div>

        <div className="herbal-hero-art">
          <div className="herbal-art-leaf">🌿</div>

          <div>
            <small>YOUR HERBAL PLAN</small>
            <strong>
              {herbalItems.length}{" "}
              {herbalItems.length === 1 ? "support" : "supports"}
            </strong>
            <span>
              Part of Plan v{activePlan?.version || "—"}
            </span>
          </div>
        </div>
      </section>

      <section className="herbal-plan-summary">
        <div>
          <span className="section-label">YOUR PLAN</span>
          <h3>Herbs & teas selected for you</h3>

          <p>
            These are not general wellness suggestions. They come from
            the herbal portion of your active ROOTED plan.
          </p>
        </div>

        <div className="herbal-review-card">
          <small>NEXT PLAN REVIEW</small>
          <strong>{prettyDate(activePlan?.review_date)}</strong>
          <Link to="/plan">View full plan →</Link>
        </div>
      </section>

      {herbalItems.length ? (
        <section className="herbal-guide-layout">
          <div className="herbal-item-list">
            {herbalItems.map((item, index) => {
              const active = selectedIndex === index;

              return (
                <button
                  key={item.id || index}
                  className={
                    active
                      ? "herbal-item-button active"
                      : "herbal-item-button"
                  }
                  onClick={() => setSelectedIndex(index)}
                >
                  <span className="herbal-item-icon">🌿</span>

                  <div>
                    <small>
                      {item.frequency || "YOUR PLAN"}
                    </small>

                    <strong>
                      {item.title || "Herbal support"}
                    </strong>

                    <p>
                      {item.description ||
                        "Personalized natural support"}
                    </p>
                  </div>

                  <b>›</b>
                </button>
              );
            })}
          </div>

          {selectedItem && selectedDetails && (
            <article className="herbal-detail-card">
              <div className="herbal-detail-image">
                <span>{selectedDetails.image}</span>

                <div>
                  <small>{selectedDetails.type}</small>
                  <strong>
                    {selectedItem.title || "Herbal support"}
                  </strong>
                </div>
              </div>

              <div className="herbal-detail-body">
                <div className="herbal-detail-row">
                  <span>◷</span>

                  <div>
                    <small>WHEN TO USE</small>
                    <strong>
                      {selectedItem.frequency ||
                        selectedDetails.timing}
                    </strong>
                  </div>
                </div>

                <div className="herbal-detail-row">
                  <span>♨</span>

                  <div>
                    <small>HOW TO PREPARE</small>
                    <strong>
                      {selectedItem.instructions ||
                        selectedDetails.preparation}
                    </strong>
                  </div>
                </div>

                <div className="herbal-detail-row">
                  <span>🌱</span>

                  <div>
                    <small>WHY IT'S IN YOUR PLAN</small>
                    <strong>
                      {selectedItem.description ||
                        selectedDetails.purpose}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="herbal-safety-box">
                <div className="herbal-safety-title">
                  <span>🛡</span>

                  <div>
                    <small>ROOTED SAFETY</small>
                    <strong>Natural doesn't mean risk-free.</strong>
                  </div>
                </div>

                <p>
                  {selectedItem.safety_notes ||
                    selectedDetails.safety}
                </p>

                <Link to="/health">
                  Review medications & allergies →
                </Link>
              </div>
            </article>
          )}
        </section>
      ) : (
        <section className="herbal-empty-state">
          <span>🌱</span>
          <h3>No herbal support is currently in your plan.</h3>

          <p>
            ROOTED only displays herbal recommendations that are part of
            your active professional care plan.
          </p>

          <Link to="/plan" className="rooted-primary-button">
            View your plan
          </Link>
        </section>
      )}

      <section className="herbal-education-section">
        <div className="herbal-education-heading">
          <div>
            <span className="section-label">LEARN</span>
            <h3>Use natural support with context.</h3>
          </div>

          <p>
            ROOTED considers herbal support alongside medications,
            allergies, testing, lifestyle, and the rest of your health
            picture.
          </p>
        </div>

        <div className="herbal-education-grid">
          <article>
            <span>🌿</span>
            <h4>Your Plan</h4>
            <p>
              Follow the herbs, amounts, timing, and preparation already
              established in your care plan.
            </p>
          </article>

          <article>
            <span>⚕</span>
            <h4>Safety First</h4>
            <p>
              Medications, allergies, health conditions, pregnancy, and
              testing can affect what is appropriate.
            </p>
          </article>

          <article>
            <span>◌</span>
            <h4>Whole Health</h4>
            <p>
              Herbs work within the larger picture of nutrition, sleep,
              movement, stress, medical care, and daily life.
            </p>
          </article>
        </div>
      </section>

      <section className="herbal-guide-footer">
        <div>
          <span>✦</span>

          <div>
            <small>HAVE A QUESTION?</small>
            <strong>Ask ROOTED about your existing plan.</strong>
          </div>
        </div>

        <Link to="/ask-rooted">Ask ROOTED →</Link>
      </section>
    </main>
  );
}