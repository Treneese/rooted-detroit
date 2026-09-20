import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getHealthProfile } from "../api/rootedApi";

const formatDate = (v) => v ? new Date(`${v}T00:00:00`).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "Date not recorded";
const rangeText = (lab) => lab.reference_text || (lab.reference_low != null && lab.reference_high != null ? `${lab.reference_low}–${lab.reference_high} ${lab.unit || ""}` : lab.reference_low != null ? `≥ ${lab.reference_low} ${lab.unit || ""}` : lab.reference_high != null ? `≤ ${lab.reference_high} ${lab.unit || ""}` : "Reference range not recorded");
const resultValue = (lab) => lab.value_text || (lab.value != null ? `${lab.value} ${lab.unit || ""}`.trim() : "Recorded");
const flagLabel = (flag) => !flag ? "Recorded" : flag.replaceAll("_"," ");

function Testing() {
  const [profile,setProfile] = useState(null); const [loading,setLoading] = useState(true); const [error,setError] = useState("");
  useEffect(() => { (async()=>{ try{setProfile(await getHealthProfile(1));}catch(e){setError(e.message)}finally{setLoading(false)}})(); },[]);
  const labs = useMemo(() => [...(profile?.lab_results || [])].sort((a,b)=>String(b.collected_date||"").localeCompare(String(a.collected_date||""))),[profile]);
  if (loading) return <main className="dashboard page-screen"><p>Loading your health results...</p></main>;
  if (error) return <main className="dashboard page-screen"><p>{error}</p></main>;

  return <main className="dashboard testing-v2">
    <section className="testing-v2-hero"><div><span className="section-label">TESTING & RESULTS</span><h2>Understand what's happening inside.</h2><p>See laboratory information alongside the health context that helps you and your care team ask better questions and make informed next steps.</p></div><Link to="/health" className="testing-back-card"><span>←</span><div><small>WHOLE-HEALTH PROFILE</small><strong>Back to My Health</strong></div></Link></section>

    <section className="testing-v2-section">
      <div className="testing-v2-heading"><div><span className="section-label">LATEST RESULTS</span><h3>Your laboratory record</h3><p>{labs.length} result{labs.length===1?"":"s"} currently connected to this demo health profile.</p></div><span className="testing-review-pill">Professional context matters</span></div>
      {labs.length ? <div className="lab-result-list">{labs.map(lab => {
        const flagged = lab.flag && !["NORMAL","WITHIN_RANGE","NONE"].includes(String(lab.flag).toUpperCase());
        return <article className={`lab-result-row ${flagged ? "lab-flagged" : ""}`} key={lab.id}>
          <div className="lab-result-icon">◌</div><div className="lab-result-main"><small>{lab.category || "LAB RESULT"}</small><h4>{lab.test_name}</h4><p>{lab.source ? `Source: ${lab.source}` : "Connected health record"} • {formatDate(lab.collected_date)}</p></div>
          <div className="lab-result-value"><strong>{resultValue(lab)}</strong><span className={flagged ? "lab-flag lab-flag-attention" : "lab-flag"}>{flagLabel(lab.flag)}</span></div>
          <div className="lab-reference"><small>REFERENCE</small><strong>{rangeText(lab)}</strong>{lab.notes && <p>{lab.notes}</p>}</div>
        </article>;
      })}</div> : <div className="testing-empty"><span>◌</span><h3>No laboratory results yet</h3><p>When testing is added to the profile, results can appear here with their source and reference information.</p></div>}
    </section>

    <section className="testing-meaning-grid">
      <article className="testing-rooted-card"><span className="section-label">ROOTED VIEW</span><h3>A result is one piece of your health story.</h3><p>ROOTED places testing beside conditions, medications, allergies, nutrition, hydration, sleep, movement, stress, environment and health goals instead of treating a number as the whole story.</p><Link to="/health">See the whole-health picture →</Link></article>
      <article className="testing-professional-card"><div className="testing-professional-mark">✓</div><div><span className="section-label">PROFESSIONAL REVIEW</span><h3>Interpretation stays with qualified professionals.</h3><p>ROOTED can organize and explain information, while testing and medical decisions remain with appropriately qualified healthcare professionals.</p><Link to="/practitioner">View care team →</Link></div></article>
    </section>

    <section className="testing-cycle"><span className="section-label">THE HEALTH JOURNEY</span><div><b>Understand</b><i>→</i><b>Plan</b><i>→</i><b>Act</b><i>→</i><b>Track</b><i>→</i><b className="active">Test</b><i>→</i><b>Review</b><i>→</i><b>Adjust</b></div><p>Testing becomes most useful when it can be reviewed over time alongside what changed in everyday life.</p></section>
  </main>;
}
export default Testing;
