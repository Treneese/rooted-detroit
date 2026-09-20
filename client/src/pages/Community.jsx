import { useMemo, useState } from "react";

const GROUPS = [
  {
    id: 1,
    title: "Detroit Healing Together",
    icon: "🌱",
    category: "Whole Health",
    members: 1200,
    description:
      "A supportive Detroit community focused on building healthier routines together.",
    tags: ["Wellness", "Support", "Detroit"],
  },
  {
    id: 2,
    title: "Nature in Detroit",
    icon: "🌳",
    category: "Nature",
    members: 856,
    description:
      "Group walks, outdoor activities, parks, gardens, and ways to reconnect with nature.",
    tags: ["Outdoors", "Movement", "Stress"],
  },
  {
    id: 3,
    title: "Healthy Detroit Families",
    icon: "👨‍👩‍👧",
    category: "Families",
    members: 1100,
    description:
      "Nutrition ideas, family wellness activities, education, and whole-family support.",
    tags: ["Families", "Nutrition", "Education"],
  },
  {
    id: 4,
    title: "Rooted in Better Sleep",
    icon: "🌙",
    category: "Lifestyle",
    members: 624,
    description:
      "A community for building better evening routines, sleep habits, and recovery.",
    tags: ["Sleep", "Habits", "Recovery"],
  },
];

const EVENTS = [
  {
    id: 1,
    month: "SEP",
    day: "26",
    title: "Herbal Wellness Workshop",
    type: "Education",
    location: "Detroit, MI",
    time: "11:00 AM",
    description:
      "Learn how herbal support can fit safely within a larger whole-health plan.",
  },
  {
    id: 2,
    month: "SEP",
    day: "28",
    title: "Walk + Reset",
    type: "Movement",
    location: "Detroit Riverfront",
    time: "9:00 AM",
    description:
      "A relaxed community walk focused on movement, nature, and stress recovery.",
  },
  {
    id: 3,
    month: "OCT",
    day: "03",
    title: "Whole Foods on a Budget",
    type: "Nutrition",
    location: "Detroit, MI",
    time: "6:00 PM",
    description:
      "Practical ideas for building nourishing meals while keeping grocery costs realistic.",
  },
];

const LEARNING = [
  {
    icon: "🥗",
    category: "Nutrition",
    title: "Building a balanced plate",
    description:
      "A simple framework for combining vegetables, protein, whole-food carbohydrates, and satisfying fats.",
  },
  {
    icon: "🌿",
    category: "Natural Support",
    title: "Herbs belong in the whole picture",
    description:
      "Why medications, allergies, testing, health conditions, and professional guidance still matter.",
  },
  {
    icon: "☀️",
    category: "Lifestyle",
    title: "Small routines can add up",
    description:
      "Explore realistic ways to support sleep, movement, hydration, stress, and time outdoors.",
  },
];

function memberLabel(number) {
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K members`;
  }

  return `${number} members`;
}

export default function Community() {
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [groupFilter, setGroupFilter] = useState("All");

  const categories = useMemo(
    () => ["All", ...new Set(GROUPS.map((group) => group.category))],
    []
  );

  const visibleGroups = useMemo(() => {
    if (groupFilter === "All") return GROUPS;

    return GROUPS.filter(
      (group) => group.category === groupFilter
    );
  }, [groupFilter]);

  function toggleGroup(groupId) {
    setJoinedGroups((current) =>
      current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId]
    );
  }

  function toggleEvent(eventId) {
    setRegisteredEvents((current) =>
      current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId]
    );
  }

  return (
    <main className="dashboard community-page">
      <section className="community-hero">
        <div className="community-hero-copy">
          <span className="section-label">
            COMMUNITY & SUPPORT
          </span>

          <h2>
            Health grows
            <br />
            in community.
          </h2>

          <p>
            Find people, learning, local activities, and supportive
            spaces that make your health journey feel less isolated
            and more connected to Detroit.
          </p>

          <div className="community-hero-pills">
            <span>♥ Local support</span>
            <span>✦ Whole-health learning</span>
            <span>⌖ Detroit focused</span>
          </div>
        </div>

        <div className="community-hero-card">
          <div className="community-people">
            <span>🌿</span>
            <span>🥗</span>
            <span>🚶🏽</span>
            <span>☀️</span>
          </div>

          <small>ROOTED COMMUNITY</small>

          <strong>
            Health is personal.
            <br />
            It doesn't have to be lonely.
          </strong>

          <p>
            Connect the plan you follow at home with support,
            education, and opportunities around you.
          </p>
        </div>
      </section>

      <section className="community-section">
        <div className="community-section-heading">
          <div>
            <span className="section-label">
              GROUPS
            </span>

            <h3>Find your people.</h3>

            <p>
              Join communities built around the parts of health you
              want to strengthen.
            </p>
          </div>

          <div className="community-count">
            <strong>{joinedGroups.length}</strong>
            <span>Joined</span>
          </div>
        </div>

        <div className="community-filter-row">
          {categories.map((category) => (
            <button
              key={category}
              className={
                groupFilter === category ? "active" : ""
              }
              onClick={() => setGroupFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="community-group-grid">
          {visibleGroups.map((group) => {
            const joined = joinedGroups.includes(group.id);

            return (
              <article
                className="community-group-card"
                key={group.id}
              >
                <div className="community-group-image">
                  <span>{group.icon}</span>

                  <div className="community-group-category">
                    {group.category}
                  </div>
                </div>

                <div className="community-group-body">
                  <div>
                    <h4>{group.title}</h4>

                    <span className="community-member-count">
                      ◉ {memberLabel(group.members)}
                    </span>
                  </div>

                  <p>{group.description}</p>

                  <div className="community-tags">
                    {group.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  <button
                    className={
                      joined
                        ? "community-join-button joined"
                        : "community-join-button"
                    }
                    onClick={() => toggleGroup(group.id)}
                  >
                    {joined ? "✓ Joined" : "Join group"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="community-section community-events-section">
        <div className="community-section-heading">
          <div>
            <span className="section-label">
              EVENTS
            </span>

            <h3>What's happening around Detroit?</h3>

            <p>
              Local opportunities to learn, move, connect, and
              practice whole health together.
            </p>
          </div>

          <div className="community-count">
            <strong>{registeredEvents.length}</strong>
            <span>Saved</span>
          </div>
        </div>

        <div className="community-events-list">
          {EVENTS.map((event) => {
            const registered = registeredEvents.includes(
              event.id
            );

            return (
              <article
                className="community-event-card"
                key={event.id}
              >
                <div className="community-event-date">
                  <small>{event.month}</small>
                  <strong>{event.day}</strong>
                </div>

                <div className="community-event-content">
                  <div className="community-event-topline">
                    <span>{event.type}</span>
                  </div>

                  <h4>{event.title}</h4>

                  <p>{event.description}</p>

                  <div className="community-event-meta">
                    <span>⌖ {event.location}</span>
                    <span>◷ {event.time}</span>
                  </div>
                </div>

                <button
                  className={
                    registered
                      ? "community-register-button registered"
                      : "community-register-button"
                  }
                  onClick={() => toggleEvent(event.id)}
                >
                  {registered ? "✓ Saved" : "Save event"}
                </button>
              </article>
            );
          })}
        </div>

        <p className="community-demo-note">
          Demo events shown for the ROOTED Detroit prototype.
        </p>
      </section>

      <section className="community-learning-section">
        <div className="community-learning-intro">
          <span className="section-label">
            LEARN TOGETHER
          </span>

          <h3>
            Better information.
            <br />
            Stronger everyday choices.
          </h3>

          <p>
            ROOTED community education connects natural health,
            nutrition, lifestyle, and medical care instead of treating
            them as separate worlds.
          </p>
        </div>

        <div className="community-learning-grid">
          {LEARNING.map((item) => (
            <article key={item.title}>
              <span className="community-learning-icon">
                {item.icon}
              </span>

              <small>{item.category}</small>

              <h4>{item.title}</h4>

              <p>{item.description}</p>

              <button>Explore topic →</button>
            </article>
          ))}
        </div>
      </section>

      <section className="community-support-banner">
        <div className="community-support-icon">
          ♥
        </div>

        <div>
          <small>YOUR HEALTH JOURNEY</small>

          <strong>
            Your care team guides your plan. Your community can help
            you live it.
          </strong>

          <p>
            ROOTED brings professional care, personal action, and
            Detroit community support into one connected experience.
          </p>
        </div>
      </section>
    </main>
  );
}