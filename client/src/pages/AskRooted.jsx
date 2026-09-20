import { useState } from "react";
import { Link } from "react-router-dom";
import { askRooted } from "../api/rootedApi";

const suggestedQuestions = [
  { label: "Progress", question: "What has changed since I started my plan?", icon: "↗" },
  { label: "My plan", question: "What should I focus on in my plan?", icon: "✓" },
  { label: "Testing", question: "What do my tests show?", icon: "◌" },
  { label: "Herbal safety", question: "What should I know about herbal support in my plan?", icon: "✦" },
];

function AskRooted() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submitQuestion(text) {
    const cleanQuestion = text.trim();
    if (!cleanQuestion || loading) return;
    setError(""); setQuestion("");
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: "user", text: cleanQuestion }]);
    setLoading(true);
    try {
      const result = await askRooted(1, cleanQuestion);
      setMessages((current) => [...current, { id: `rooted-${Date.now()}`, role: "rooted", ...result }]);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  function handleSubmit(event) { event.preventDefault(); submitQuestion(question); }

  return (
    <main className="ask-rooted-page">
      <section className="ask-rooted-hero ask-rooted-hero-v2">
        <div className="ask-rooted-orb"><span>R</span></div>
        <span className="section-eyebrow">ROOTED INTELLIGENCE</span>
        <h1>Understand your whole health picture.</h1>
        <p>Ask ROOTED about information already in your health record, practitioner-approved plan, testing, and progress. It connects the pieces so they are easier to understand and use.</p>
        <div className="ask-trust-row"><span>✓ Uses your ROOTED record</span><span>✓ Keeps professionals in control</span><span>✓ Shows what informed the answer</span></div>
      </section>

      {messages.length === 0 && <>
        <section className="ask-context-strip">
          <div><small>CONNECTED CONTEXT</small><strong>Amina's health journey</strong></div>
          <Link to="/health">Health profile <span>→</span></Link>
          <Link to="/plan">Active plan <span>→</span></Link>
          <Link to="/progress">Progress <span>→</span></Link>
        </section>
        <section className="ask-starters">
          <span className="ask-starters-label">START WITH YOUR RECORD</span>
          <div className="ask-starter-grid">{suggestedQuestions.map((item) => <button key={item.question} type="button" onClick={() => submitQuestion(item.question)}><span className="ask-starter-icon">{item.icon}</span><span className="ask-starter-copy"><small>{item.label}</small><strong>{item.question}</strong></span><b>→</b></button>)}</div>
        </section>
      </>}

      <section className="ask-conversation" aria-live="polite">
        {messages.map((message) => message.role === "user" ? <div key={message.id} className="ask-message ask-message-user"><span>You</span><p>{message.text}</p></div> : <div key={message.id} className="ask-message ask-message-rooted">
          <div className="ask-rooted-label"><span className="ask-mini-orb">R</span><div><strong>ROOTED</strong><small>Connected answer from your record</small></div></div>
          {message.requires_professional_review && <div className="ask-review-notice">Professional review recommended</div>}
          <p className="ask-answer">{message.answer}</p>
          {message.sources?.length > 0 && <div className="ask-sources"><span>WHAT INFORMED THIS ANSWER</span><div>{message.sources.map((source, index) => <article key={`${message.id}-${index}`}><small>{source.label}</small><strong>{source.value}</strong></article>)}</div></div>}
          {message.related_categories?.length > 0 && <div className="ask-related"><small>CONNECTED AREA</small>{message.related_categories.map((category) => <span key={category}>{category.replaceAll("_", " ")}</span>)}</div>}
          <p className="ask-boundary">{message.boundary}</p>
        </div>)}
        {loading && <div className="ask-thinking"><span /><span /><span /> ROOTED is connecting your record…</div>}
        {error && <div className="ask-error">{error}</div>}
      </section>

      <form className="ask-composer" onSubmit={handleSubmit}><div><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about your plan, progress, testing, or herbal safety…" aria-label="Ask ROOTED" /><button type="submit" disabled={!question.trim() || loading}>↑</button></div><small>ROOTED explains and connects your existing information. It does not create a diagnosis or independently prescribe treatment.</small></form>
    </main>
  );
}
export default AskRooted;
