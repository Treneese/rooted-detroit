import { useEffect, useState } from "react";
import {
  getMember,
  getHealthProfile,
  getMemberPlans,
} from "../api/rootedApi";


const categoryMeta = {
  NUTRITION: { icon: "🥗", label: "Nutrition" },
  HERBAL: { icon: "🌿", label: "Herbal & Natural" },
  HYDRATION: { icon: "💧", label: "Hydration" },
  SLEEP: { icon: "🌙", label: "Sleep" },
  MOVEMENT: { icon: "🚶🏽‍♀️", label: "Movement" },
  STRESS: { icon: "🧘🏽‍♀️", label: "Stress & Recovery" },
  NATURE: { icon: "🌳", label: "Nature" },
  MEDICAL_FOLLOW_UP: {
    icon: "🩺",
    label: "Medical Follow-Up",
  },
};


function Home() {
  const [member, setMember] = useState(null);
  const [profile, setProfile] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    async function loadDashboard() {
      try {
        const [memberData, profileData, planData] =
          await Promise.all([
            getMember(1),
            getHealthProfile(1),
            getMemberPlans(1),
          ]);

        setMember(memberData);
        setProfile(profileData);
        setPlans(planData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);


  if (loading) {
    return (
      <div className="center-state">
        <p>Growing your health picture...</p>
      </div>
    );
  }


  if (error) {
    return (
      <div className="center-state">
        <h2>We couldn't load ROOTED.</h2>
        <p>{error}</p>
      </div>
    );
  }


  const activePlan =
    plans.find((plan) => plan.status === "ACTIVE") || plans[0];

  const assessments = profile.lifestyle_assessments || [];

  const latestAssessment =
    assessments[assessments.length - 1];

  const reviewDate = activePlan?.review_date
    ? new Date(
        `${activePlan.review_date}T00:00:00`
      ).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;


  return (
    <main className="dashboard">
      <section className="home-brand-hero">
  <img
    src="/images/rooted-hero.png"
    alt=""
    className="home-brand-hero-image"
  />

  <div className="home-brand-hero-overlay" />

  <div className="home-brand-hero-content">
    <span className="home-brand-eyebrow">
      ROOTED IN DETROIT
    </span>

    <h1>
      Your health.
      <br />
      Your roots.
    </h1>

    <p>
      One connected place for your health, nutrition,
      natural support, care team, and community.
    </p>

    <div className="home-brand-hero-actions">
      <a href="#today" className="rooted-hero-primary">
        See today's plan
      </a>

      <button
        type="button"
        className="rooted-hero-secondary"
        onClick={() => {
          window.location.href = "/ask-rooted";
        }}
      >
        ✦ Ask ROOTED
      </button>
    </div>
  </div>
</section>

      <section id="today" className="welcome">
        <p className="eyebrow">
          YOUR HEALTH. YOUR ROOTS.
        </p>

        <h2>
          Good afternoon,
          <br />
          {member.first_name}.
        </h2>

        <p className="welcome-copy">
          Your whole-health journey brings your medical care,
          daily life, and wellness goals together in one place.
        </p>
      </section>


      {activePlan && (
        <section className="plan-card">
          <div className="plan-card-top">
            <span className="section-label">
              YOUR WHOLE-HEALTH PLAN
            </span>

            <span className="status-badge">
              {activePlan.status}
            </span>
          </div>

          <h3>{activePlan.title}</h3>

          <p className="plan-summary">
            {activePlan.summary}
          </p>

          <div className="practitioner">
            <div className="practitioner-avatar">
              {activePlan.practitioner.first_name.charAt(0)}
              {activePlan.practitioner.last_name.charAt(0)}
            </div>

            <div>
              <span>Your ROOTED practitioner</span>

              <strong>
                {activePlan.practitioner.first_name}{" "}
                {activePlan.practitioner.last_name}
              </strong>

              <small>
                {activePlan.practitioner.professional_type
                  .replaceAll("_", " ")
                  .toLowerCase()}
              </small>
            </div>
          </div>

          {reviewDate && (
            <div className="review-date">
              Plan review • {reviewDate}
            </div>
          )}
        </section>
      )}


      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-label">TODAY</span>
            <h3>Your daily roots</h3>
          </div>
        </div>

        <div className="root-grid">
          {activePlan?.items.map((item) => {
            const meta =
              categoryMeta[item.category] || {
                icon: "🌱",
                label: item.category,
              };

            return (
              <article className="root-card" key={item.id}>
                <span className="root-icon">
                  {meta.icon}
                </span>

                <div>
                  <span className="root-category">
                    {meta.label}
                  </span>

                  <h4>{item.title}</h4>
                  <p>{item.frequency}</p>
                </div>
              </article>
            );
          })}

          <article className="root-card muted-root">
            <span className="root-icon">💧</span>

            <div>
              <span className="root-category">
                Hydration
              </span>

              <h4>
                {latestAssessment?.nutrition
                  ?.water_cups_per_day
                  ? `${latestAssessment.nutrition.water_cups_per_day} cups currently`
                  : "Build your hydration routine"}
              </h4>

              <p>Daily wellness</p>
            </div>
          </article>

          <article className="root-card muted-root">
            <span className="root-icon">🌙</span>

            <div>
              <span className="root-category">
                Sleep
              </span>

              <h4>
                {latestAssessment?.sleep?.sleep_hours
                  ? `${latestAssessment.sleep.sleep_hours} hours currently`
                  : "Support your sleep"}
              </h4>

              <p>Whole-health assessment</p>
            </div>
          </article>
        </div>
      </section>


      <section className="health-card">
        <div>
          <span className="section-label">MY HEALTH</span>
          <h3>Your health picture</h3>

          <p>
            Medical information, labs, lifestyle, and progress
            together—not scattered across different places.
          </p>
        </div>

        <div className="health-stats">
          <div>
            <strong>
              {profile.lab_results?.length || 0}
            </strong>
            <span>Labs</span>
          </div>

          <div>
            <strong>
              {profile.medical_conditions?.length || 0}
            </strong>
            <span>Conditions</span>
          </div>

          <div>
            <strong>
              {profile.medications?.length || 0}
            </strong>
            <span>Medications</span>
          </div>
        </div>
      </section>


      <section className="detroit-card">
        <div className="detroit-icon">✦</div>

        <div>
          <span className="section-label">
            ROOTED IN DETROIT
          </span>

          <h3>Detroit Wellness Network</h3>

          <p>
            Discover food, movement, nature, health, and
            community resources around the city.
          </p>
        </div>
      </section>
    </main>
  );
}


export default Home;