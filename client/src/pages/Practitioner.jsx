import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import IntelligencePanel from "../components/IntelligencePanel";
import {
  approvePlan,
  createPlanRevision,
  getMemberPractitionerView,
} from "../api/rootedApi";

const clean = (value = "") => value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
const formatDate = (value) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`)) : "Not scheduled";

function Practitioner() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadWorkspace() {
    try {
      setError("");
      const result = await getMemberPractitionerView(1);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadWorkspace(); }, []);

  const activePlan = useMemo(() => data?.plans?.find((plan) => plan.status === "ACTIVE"), [data]);
  const draftPlan = useMemo(() => data?.plans?.find((plan) => plan.status === "DRAFT"), [data]);

  if (loading) return <main className="dashboard practitioner-page"><div className="rooted-loading-card">Preparing Amina's care workspace…</div></main>;
  if (error) return <main className="dashboard practitioner-page"><div className="rooted-error-card"><strong>Workspace unavailable</strong><p>{error}</p></div></main>;

  const { member, profile, practitioners } = data;
  const practitioner = practitioners?.find((item) => item.id === activePlan?.practitioner_id) || practitioners?.[0];
  const conditions = profile?.medical_conditions || [];
  const medications = profile?.medications || [];
  const allergies = profile?.allergies || [];
  const labs = profile?.lab_results || [];
  const lifestyle = profile?.lifestyle_assessments || [];
  const latestLifestyle = lifestyle[0];

  async function createRevision() {
    if (!activePlan || working) return;
    setWorking(true); setActionError(""); setNotice("");
    try {
      const result = await createPlanRevision(activePlan.id);
      setNotice(`Draft v${result.version} created. Amina's active plan has not changed.`);
      await loadWorkspace();
    } catch (err) {
      if (err.data?.draft) {
        setNotice(`Draft v${err.data.draft.version} is already ready for review.`);
        await loadWorkspace();
      } else setActionError(err.message);
    } finally { setWorking(false); }
  }

  async function approveDraft() {
    if (!draftPlan || working) return;
    setWorking(true); setActionError(""); setNotice("");
    try {
      const approved = await approvePlan(draftPlan.id);
      setNotice(`Plan v${approved.version} approved. This is now Amina's active plan.`);
      await loadWorkspace();
    } catch (err) { setActionError(err.message); }
    finally { setWorking(false); }
  }

  return (
    <main className="dashboard practitioner-page practitioner-v2">
      <section className="practitioner-topbar">
        <div>
          <span className="section-label">ROOTED CARE WORKSPACE</span>
          <h1>Good afternoon, {practitioner?.first_name || "Nia"}.</h1>
          <p>One whole-health view before the next care decision.</p>
        </div>
        <div className="provider-identity">
          <div className="provider-avatar">{practitioner?.first_name?.[0] || "N"}{practitioner?.last_name?.[0] || "C"}</div>
          <div><strong>{practitioner?.first_name} {practitioner?.last_name}</strong><span>✓ Verified · {clean(practitioner?.professional_type)}</span></div>
        </div>
      </section>

      <section className="member-command-card">
        <div className="member-command-main">
          <div className="member-avatar">{member?.first_name?.[0]}{member?.last_name?.[0]}</div>
          <div><span className="section-label">MEMBER IN REVIEW</span><h2>{member?.first_name} {member?.last_name}</h2><p>{profile?.primary_goal || "Whole-health goals are being reviewed."}</p></div>
        </div>
        <div className="member-command-status"><span>Current plan</span><strong>v{activePlan?.version || "—"}</strong><small>{activePlan?.status === "ACTIVE" ? "● Active & member-visible" : "No active plan"}</small></div>
      </section>

      <section className="care-snapshot-grid">
        <article><span>Medical</span><strong>{conditions.length}</strong><small>conditions</small></article>
        <article><span>Medications</span><strong>{medications.length}</strong><small>on record</small></article>
        <article><span>Safety</span><strong>{allergies.length}</strong><small>allergies</small></article>
        <article><span>Testing</span><strong>{labs.length}</strong><small>lab results</small></article>
        <article><span>Plan</span><strong>{activePlan?.items?.length || 0}</strong><small>care areas</small></article>
      </section>

      <section className="practitioner-section practitioner-review-section">
        <div className="section-heading-row"><div><span className="section-label">WHOLE-HEALTH REVIEW</span><h3>What should inform the plan</h3></div><Link to="/health">Open full health profile →</Link></div>
        <div className="whole-health-review-grid">
          <article><div className="review-icon">✚</div><span>CONDITIONS</span>{conditions.length ? conditions.map(x => <div className="review-row" key={x.id}><strong>{x.name}</strong><small>{x.status || "Recorded"}</small></div>) : <p>None recorded.</p>}</article>
          <article><div className="review-icon">Rx</div><span>MEDICATIONS</span>{medications.length ? medications.map(x => <div className="review-row" key={x.id}><strong>{x.name}</strong><small>{x.dosage || "Dose recorded"}</small></div>) : <p>None recorded.</p>}</article>
          <article><div className="review-icon">!</div><span>ALLERGIES & SAFETY</span>{allergies.length ? allergies.map(x => <div className="review-row" key={x.id}><strong>{x.allergen}</strong><small>{x.severity || "Recorded"}</small></div>) : <p>No allergies recorded.</p>}</article>
          <article><div className="review-icon">☾</div><span>LIFESTYLE</span><div className="review-row"><strong>{latestLifestyle?.sleep_hours ?? "—"} hrs</strong><small>sleep</small></div><div className="review-row"><strong>{latestLifestyle?.hydration_cups ?? "—"} cups</strong><small>hydration</small></div></article>
        </div>
      </section>

      <section className="practitioner-section">
        <div className="section-heading-row"><div><span className="section-label">RECENT TESTING</span><h3>Results in context</h3></div><Link to="/testing">Review all testing →</Link></div>
        <div className="practitioner-labs practitioner-labs-v2">
          {labs.slice(0, 5).map((lab) => <article key={lab.id}><span>{lab.test_name}</span><strong>{lab.value} {lab.unit}</strong><small>{lab.reference_range ? `Reference ${lab.reference_range}` : "Professional review available"}</small></article>)}
          {!labs.length && <p>No lab results recorded.</p>}
        </div>
      </section>

      <IntelligencePanel memberId={member?.id || 1} mode="practitioner" />

      <section className="plan-control-center">
        <div className="section-heading-row plan-control-heading"><div><span className="section-label">PLAN CONTROL CENTER</span><h3>{activePlan?.title || "Personalized Whole-Health Plan"}</h3><p>{activePlan?.summary}</p></div><div className="approved-pill">✓ Practitioner approved</div></div>
        <div className="plan-control-meta"><div><span>ACTIVE VERSION</span><strong>v{activePlan?.version || "—"}</strong></div><div><span>PLAN AREAS</span><strong>{activePlan?.items?.length || 0}</strong></div><div><span>NEXT REVIEW</span><strong>{formatDate(activePlan?.review_date)}</strong></div></div>
        <div className="plan-control-items">{activePlan?.items?.map(item => <div key={item.id}><span>{clean(item.category)}</span><strong>{item.title}</strong><small>{item.frequency || "As directed"}</small></div>)}</div>

        <div className={`revision-workflow ${draftPlan ? "has-draft" : ""}`}>
          {!draftPlan ? <><div><span className="section-label">NEXT CARE DECISION</span><h4>Adjust the plan without interrupting Amina's care.</h4><p>Create a new draft from the active version. The plan Amina sees stays unchanged until the new version is approved.</p></div><button type="button" onClick={createRevision} disabled={working || !activePlan}>{working ? "Creating…" : `Create draft from v${activePlan?.version}`}</button></> : <><div><span className="draft-status">DRAFT · v{draftPlan.version}</span><h4>Revision ready for professional review</h4><p>{draftPlan.items?.length || 0} care areas copied from v{activePlan?.version}. Approval will supersede the current version and make v{draftPlan.version} member-visible.</p></div><div className="draft-actions"><button className="secondary-plan-button" type="button" onClick={() => document.getElementById("draft-items")?.scrollIntoView({ behavior: "smooth" })}>Review draft</button><button type="button" onClick={approveDraft} disabled={working}>{working ? "Approving…" : `Approve v${draftPlan.version}`}</button></div></>}
        </div>

        {draftPlan && <div id="draft-items" className="draft-preview"><div><span className="section-label">DRAFT PREVIEW</span><h4>Plan v{draftPlan.version}</h4></div>{draftPlan.items?.map(item => <article key={item.id}><div><span>{clean(item.category)}</span><strong>{item.title}</strong></div><p>{item.instructions}</p>{item.caution && <small>Safety: {item.caution}</small>}</article>)}</div>}
        {notice && <div className="workflow-notice success">✓ {notice}</div>}
        {actionError && <div className="workflow-notice error">{actionError}</div>}
      </section>

      <section className="practitioner-footer-actions"><Link to="/plan">See what Amina sees →</Link><Link to="/progress">Review member progress →</Link></section>
    </main>
  );
}

export default Practitioner;
