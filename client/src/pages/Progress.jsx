import { useEffect, useMemo, useState } from "react";
import { createProgressEntry, getMemberPlans, getMemberProgress } from "../api/rootedApi";
import IntelligencePanel from "../components/IntelligencePanel";

const categoryMeta = {
  NUTRITION:{label:"Nutrition",icon:"🥗",prompt:"How did eating to your plan go today?"},
  HERBAL:{label:"Herbal support",icon:"🌿",prompt:"Did you follow your approved herbal support today?"},
  SLEEP:{label:"Sleep",icon:"☾",prompt:"How many hours did you sleep?",unit:"hours"},
  MOVEMENT:{label:"Movement",icon:"↗",prompt:"How much intentional movement did you get?",unit:"minutes"},
  STRESS:{label:"Stress & recovery",icon:"◌",prompt:"How would you rate your stress today?",unit:"/10"},
  NATURE:{label:"Nature",icon:"🌳",prompt:"How much time did you spend outdoors?",unit:"minutes"},
  HYDRATION:{label:"Hydration",icon:"💧",prompt:"How many cups of water did you have?",unit:"cups"},
  MEDICAL_FOLLOW_UP:{label:"Medical follow-up",icon:"✚",prompt:"Did you complete the next medical follow-up step?"},
};

function prettyDate(value){ if(!value) return "—"; return new Date(value).toLocaleDateString(undefined,{month:"short",day:"numeric"}); }

export default function Progress(){
  const [entries,setEntries]=useState([]); const [plans,setPlans]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const [selected,setSelected]=useState(""); const [value,setValue]=useState(""); const [note,setNote]=useState(""); const [completed,setCompleted]=useState(true); const [saving,setSaving]=useState(false); const [notice,setNotice]=useState("");

  async function load(){ try { const [p,pl]=await Promise.all([getMemberProgress(1),getMemberPlans(1)]); setEntries(p); setPlans(pl); } catch(e){setError(e.message);} finally{setLoading(false);} }
  useEffect(()=>{load();},[]);

  const activePlan=useMemo(()=>plans.find(p=>p.status==="ACTIVE"),[plans]);
  const planCategories=useMemo(()=>[...new Set((activePlan?.items||[]).map(i=>i.category))],[activePlan]);
  useEffect(()=>{ if(!selected && planCategories.length) setSelected(planCategories[0]); },[selected,planCategories]);
  const latestByCategory=useMemo(()=>{const out={}; entries.forEach(e=>{if(!out[e.category])out[e.category]=e;}); return out;},[entries]);
  const checked=planCategories.filter(c=>latestByCategory[c]).length; const completedCount=planCategories.filter(c=>latestByCategory[c]?.completed).length;
  const percent=planCategories.length?Math.round((checked/planCategories.length)*100):0;
  const recent=entries.slice(0,6);

  const trends=useMemo(()=>{
    return planCategories.map(category=>{
      const vals=entries.filter(e=>e.category===category && e.value!=null).slice(0,6).reverse();
      if(vals.length<2) return null;
      const first=vals[0],last=vals[vals.length-1]; const delta=Number(last.value)-Number(first.value);
      return {category,first,last,delta};
    }).filter(Boolean).slice(0,4);
  },[entries,planCategories]);

  async function submit(e){ e.preventDefault(); if(!selected)return; setSaving(true); setNotice("");
    try { const meta=categoryMeta[selected]||{}; const payload={category:selected,plan_id:activePlan?.id||null,completed,note:note.trim()||null}; if(value!==""){payload.value=Number(value); payload.unit=meta.unit||null;} const created=await createProgressEntry(1,payload); setEntries(prev=>[created,...prev]); setValue("");setNote("");setNotice("Check-in saved. Your care team can now see this in your progress history."); }
    catch(err){setNotice(err.message);} finally{setSaving(false);} }
  

  if(loading) return <main className="dashboard progress-v2"><div className="rooted-loading-card">Loading your progress…</div></main>;
  if(error) return <main className="dashboard progress-v2"><div className="rooted-error-card">{error}</div></main>;
  const selectedMeta=categoryMeta[selected]||{label:selected,icon:"✦",prompt:"How is this part of your plan going?"};

  return <main className="dashboard progress-v2">
    <section className="progress-v2-hero">
      <div><span className="section-label">YOUR HEALTH JOURNEY</span><h2>Progress is a pattern,<br/>not a grade.</h2><p>ROOTED connects the everyday actions in your plan with what changes over time—so you and your care team can review the whole picture.</p></div>
      <div className="progress-cycle-card"><div className="progress-ring" style={{"--progress":`${percent*3.6}deg`}}><div><strong>{percent}%</strong><span>checked in</span></div></div><div><small>CURRENT PLAN CYCLE</small><strong>{checked} of {planCategories.length} areas</strong><span>{completedCount} marked complete</span></div></div>
    </section>

    <section className="progress-v2-section">
      <div className="progress-section-heading"><div><span className="section-label">TODAY'S CHECK-IN</span><h3>How are you doing?</h3><p>Record a quick update from your practitioner-approved plan.</p></div><span className="progress-private-pill">🔒 Part of your health record</span></div>
      <div className="checkin-layout">
        <div className="checkin-category-list">{planCategories.map(cat=>{const m=categoryMeta[cat]||{label:cat,icon:"✦"};const latest=latestByCategory[cat];return <button key={cat} className={selected===cat?"active":""} onClick={()=>{setSelected(cat);setValue("");setNote("");}}><span>{m.icon}</span><div><strong>{m.label}</strong><small>{latest?`Last check-in ${prettyDate(latest.recorded_at)}`:"No check-in yet"}</small></div><b>{latest?"✓":"›"}</b></button>})}</div>
        <form className="checkin-form" onSubmit={submit}><div className="checkin-form-title"><span>{selectedMeta.icon}</span><div><small>{selectedMeta.label?.toUpperCase()}</small><h4>{selectedMeta.prompt}</h4></div></div>
          {selectedMeta.unit && <label>Today's value<div className="value-input"><input type="number" step="0.1" min="0" value={value} onChange={e=>setValue(e.target.value)} placeholder="Enter value"/><span>{selectedMeta.unit}</span></div></label>}
          <label>Optional note<textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Anything your care team should know?" rows="3"/></label>
          <label className="completed-toggle"><input type="checkbox" checked={completed} onChange={e=>setCompleted(e.target.checked)}/><span><strong>Mark today's action complete</strong><small>You can still save a check-in if it isn't complete.</small></span></label>
          <button className="save-checkin" disabled={saving}>{saving?"Saving…":"Save check-in"}</button>{notice&&<p className="checkin-notice">{notice}</p>}
        </form>
      </div>
    </section>

    <section className="progress-v2-section"><div className="progress-section-heading"><div><span className="section-label">WHOLE-HEALTH VIEW</span><h3>Your plan at a glance</h3></div><small>Latest check-in for each area</small></div>
      <div className="progress-category-grid v2">{planCategories.map(cat=>{const m=categoryMeta[cat]||{label:cat,icon:"✦"};const e=latestByCategory[cat];return <article className={e?"progress-category-card tracked":"progress-category-card"} key={cat}><div className="progress-category-top"><span className="progress-category-icon">{m.icon}</span><span className={e?.completed?"progress-status complete":e?"progress-status started":"progress-status"}>{e?.completed?"CHECKED IN":e?"RECORDED":"NOT YET"}</span></div><h4>{m.label}</h4>{e?<><div className="progress-value">{e.value!=null&&<strong>{e.value} {e.unit}</strong>}{e.note&&<span>{e.note}</span>}</div><small className="progress-date">{prettyDate(e.recorded_at)}</small></>:<p>No progress recorded for this plan area yet.</p>}</article>})}</div>
    </section>

    <section className="progress-v2-grid">
      <div className="progress-v2-section"><span className="section-label">PATTERNS OVER TIME</span><h3>What is changing?</h3>{trends.length?trends.map(t=>{const m=categoryMeta[t.category]||{label:t.category,icon:"✦"};return <div className="trend-row v2" key={t.category}><div className="trend-icon">{m.icon}</div><div><span>{m.label.toUpperCase()}</span><strong>{t.first.value} → {t.last.value} {t.last.unit}</strong><small>{prettyDate(t.first.recorded_at)} to {prettyDate(t.last.recorded_at)}</small></div><span className={t.delta===0?"trend-flat":t.delta>0?"trend-up":"trend-down"}>{t.delta===0?"—":t.delta>0?"↑":"↓"}</span></div>}):<div className="progress-empty-mini"><strong>Patterns start with check-ins.</strong><p>Once an area has multiple numeric entries, ROOTED will show the direction of change here.</p></div>}</div>
      <div className="progress-v2-section"><span className="section-label">RECENT HISTORY</span><h3>Your latest check-ins</h3><div className="progress-history">{recent.length?recent.map(e=>{const m=categoryMeta[e.category]||{label:e.category,icon:"✦"};return <article key={e.id}><span>{m.icon}</span><div><strong>{m.label}</strong><small>{e.note|| (e.completed?"Action completed":"Progress recorded")}</small></div>{e.value!=null&&<b>{e.value} {e.unit}</b>}<time>{prettyDate(e.recorded_at)}</time></article>}):<div className="progress-empty-mini"><p>No check-ins yet.</p></div>}</div></div>
    </section>

    <IntelligencePanel memberId={1} mode="member" />
    <section className="progress-rooted-cycle"><span className="section-label">THE ROOTED CYCLE</span><div className="cycle-flow"><span>Understand</span><b>→</b><span>Plan</span><b>→</b><span>Act</span><b>→</b><span className="cycle-active">Track</span><b>→</b><span>Test</span><b>→</b><span>Review</span><b>→</b><span>Adjust</span></div><p>Your next review can use these check-ins alongside testing, symptoms, and your professional care plan.</p></section>
  </main>;
}
