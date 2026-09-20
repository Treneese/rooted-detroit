import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getHealthProfile } from "../api/rootedApi";

const show = (v, fallback = "Not recorded") => (v === null || v === undefined || v === "" ? fallback : v);
const formatDate = (v) => v ? new Date(v).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "Not recorded";

function Health() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { (async () => {
    try { setProfile(await getHealthProfile(1)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  })(); }, []);

  const data = useMemo(() => {
    if (!profile) return null;
    const assessments = profile.lifestyle_assessments || [];
    return {
      conditions: profile.medical_conditions || [], medications: profile.medications || [],
      allergies: profile.allergies || [], labs: profile.lab_results || [],
      latest: assessments[assessments.length - 1]
    };
  }, [profile]);

  if (loading) return <main className="dashboard page-screen"><p>Gathering your whole-health picture...</p></main>;
  if (error) return <main className="dashboard page-screen"><h2>We couldn't load your health profile.</h2><p>{error}</p></main>;

  const { conditions, medications, allergies, labs, latest } = data;
  const lifestyle = [
    ["💧","Hydration", latest?.nutrition?.water_cups_per_day, "cups / day"],
    ["☾","Sleep", latest?.sleep?.sleep_hours, "hours / night"],
    ["↗","Movement", latest?.movement?.exercise_days_per_week, "days / week"],
    ["◎","Stress", latest?.stress?.stress_level, "self-rating"],
    ["☀","Outdoors", latest?.nature_environment?.outdoor_days_per_week, "days / week"],
    ["✦","Energy", latest?.general?.energy_level, "self-rating"],
  ];

  return <main className="dashboard health-v2">
    <section className="health-v2-hero">
      <div>
        <span className="section-label">MY HEALTH</span>
        <h2>Your whole health, in one picture.</h2>
        <p>ROOTED brings your medical information, testing, daily habits and natural-health practices together so your care team can see context—not isolated data.</p>
      </div>
      <div className="health-record-status"><span>✓</span><div><small>HEALTH PROFILE</small><strong>Living record</strong><p>Updated as your health journey changes.</p></div></div>
    </section>

    <section className="health-summary-grid">
      <article><span>◌</span><div><small>LAB RESULTS</small><strong>{labs.length}</strong><p>results on file</p></div></article>
      <article><span>♡</span><div><small>CONDITIONS</small><strong>{conditions.length}</strong><p>in your profile</p></div></article>
      <article><span>✚</span><div><small>MEDICATIONS</small><strong>{medications.length}</strong><p>currently recorded</p></div></article>
      <article className={allergies.length ? "health-alert-stat" : ""}><span>!</span><div><small>ALLERGIES</small><strong>{allergies.length}</strong><p>safety records</p></div></article>
    </section>

    <Link to="/testing" className="health-lab-banner">
      <div className="health-lab-mark">⌁</div><div><span className="section-label">TESTING & RESULTS</span><h3>See what your labs add to the picture.</h3><p>Review results, reference ranges and professional context together.</p></div><b>Explore results →</b>
    </Link>

    {latest && <section className="health-v2-section">
      <div className="health-v2-heading"><div><span className="section-label">WHOLE-HEALTH ASSESSMENT</span><h3>Your everyday patterns</h3><p>Your care plan considers what happens between appointments, too.</p></div><small>Assessment {formatDate(latest.assessed_at)}</small></div>
      <div className="health-lifestyle-grid">{lifestyle.map(([icon,label,value,unit]) => <article key={label}><span>{icon}</span><small>{label}</small><strong>{show(value,"—")}</strong><p>{value === null || value === undefined ? "Not recorded" : unit}</p></article>)}</div>
      <div className="health-context-notes">
        <div><small>DIETARY PATTERN</small><strong>{show(latest.nutrition?.dietary_pattern)}</strong></div>
        <div><small>NATURAL HEALTH</small><strong>{show(latest.natural_health?.current_herbs_teas, "No herbs or teas recorded")}</strong></div>
        <div><small>PERSONAL GOAL</small><strong>{show(latest.general?.personal_goals || profile.primary_goal)}</strong></div>
      </div>
    </section>}

    <section className="health-v2-section">
      <div className="health-v2-heading"><div><span className="section-label">MEDICAL PICTURE</span><h3>Clinical information & safety</h3><p>Information your care team should see before recommendations are created or adjusted.</p></div></div>
      <div className="health-clinical-columns">
        <div className="health-clinical-group"><h4>Conditions</h4>{conditions.length ? conditions.map(x => <article key={x.id}><span>♡</span><div><strong>{x.name}</strong><p>{show(x.status,"Recorded in health profile")}</p></div></article>) : <p className="health-none">No conditions recorded.</p>}</div>
        <div className="health-clinical-group"><h4>Medications</h4>{medications.length ? medications.map(x => <article key={x.id}><span>✚</span><div><strong>{x.name}</strong><p>{[x.dosage,x.frequency].filter(Boolean).join(" • ") || "Active medication"}</p></div></article>) : <p className="health-none">No medications recorded.</p>}</div>
        <div className="health-clinical-group"><h4>Allergies & safety</h4>{allergies.length ? allergies.map(x => <article className="health-safety-row" key={x.id}><span>!</span><div><strong>{x.allergen}</strong><p>{[x.severity,x.reaction].filter(Boolean).join(" • ") || "Recorded allergy"}</p></div></article>) : <p className="health-none">No allergies recorded.</p>}</div>
      </div>
    </section>

    <section className="health-rooted-view"><span>ROOTED VIEW</span><h3>Your records aren't separate from your life.</h3><p>A lab value, medication, sleep pattern or herbal practice means more when it is understood alongside the rest of your health picture. ROOTED keeps those pieces connected for professional review.</p><div><Link to="/plan">See how this informs your plan →</Link><Link to="/practitioner">View care team →</Link></div></section>
  </main>;
}
export default Health;
