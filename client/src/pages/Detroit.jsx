import { useEffect, useMemo, useState } from "react";
import { getResources, getMapResources } from "../api/rootedApi";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const categories = [
  { key: "ALL", label: "All", icon: "✦" },
  { key: "FOOD", label: "Food", icon: "🥘" },
  { key: "NATURAL_HEALTH", label: "Natural Health", icon: "🌿" },
  { key: "CLINICAL", label: "Clinical", icon: "🩺" },
  { key: "TESTING", label: "Testing", icon: "🧪" },
  { key: "NATURE", label: "Nature", icon: "🌳" },
  { key: "MOVEMENT", label: "Movement", icon: "🚶🏽‍♀️" },
];

const categoryIcons = {
  FOOD: "🥘", HERBAL: "🌿", CLINICAL: "🩺", NATURE: "🌳", MOVEMENT: "🚶🏽‍♀️",
  COMMUNITY: "🤝", TESTING: "🧪", CLINICAL_TRIAL: "🔬", NATURAL_HEALTH: "🌱", MENTAL_WELLNESS: "🧠",
};

const createRootedMarker = (category) => L.divIcon({
  className: "rooted-map-marker",
  html: `<div class="rooted-marker rooted-marker-${String(category || "community").toLowerCase()}"><span>${categoryIcons[category] || "✦"}</span></div>`,
  iconSize: [42, 42], iconAnchor: [21, 42], popupAnchor: [0, -42],
});

function splitTags(value) {
  if (!value) return [];
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function Detroit() {
  const [resources, setResources] = useState([]);
  const [mapResources, setMapResources] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [view, setView] = useState("map");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getResources(), getMapResources()])
      .then(([resourceData, mapData]) => { setResources(resourceData); setMapResources(mapData); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const matches = (resource) => {
    const categoryMatch = activeCategory === "ALL" || resource.category === activeCategory;
    const haystack = [resource.name, resource.description, resource.services, resource.neighborhood, resource.city, resource.cultural_tags, resource.dietary_tags].filter(Boolean).join(" ").toLowerCase();
    return categoryMatch && (!query.trim() || haystack.includes(query.trim().toLowerCase()));
  };

  const filteredResources = useMemo(() => resources.filter(matches), [resources, activeCategory, query]);
  const visibleMapResources = useMemo(() => mapResources.filter(matches), [mapResources, activeCategory, query]);
  const culturalTags = useMemo(() => [...new Set(resources.filter((r) => r.category === "FOOD").flatMap((r) => [...splitTags(r.cultural_tags), ...splitTags(r.dietary_tags)]))].slice(0, 10), [resources]);

  if (loading) return <div className="center-state"><p>Growing your Detroit wellness network...</p></div>;
  if (error) return <div className="center-state"><h2>We couldn't load Detroit resources.</h2><p>{error}</p></div>;

  return (
    <main className="dashboard detroit-page">
      <section className="detroit-network-header">
        <div>
          <span className="section-label">ROOTED IN DETROIT</span>
          <h2>Detroit Wellness Network</h2>
          <p>Find trusted people and places that can help you carry your health plan into everyday life.</p>
        </div>
        <div className="detroit-network-stat"><strong>{resources.length}</strong><span>local resources</span></div>
      </section>

      <section className="detroit-toolbar">
        <div className="detroit-view-toggle">
          <button className={view === "map" ? "active" : ""} onClick={() => setView("map")}>Map</button>
          <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>List</button>
        </div>
        <label className="resource-search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search food, clinics, herbs..." /></label>
      </section>

      <div className="category-scroll detroit-category-scroll">
        {categories.map((category) => (
          <button key={category.key} className={activeCategory === category.key ? "resource-filter active" : "resource-filter"} onClick={() => setActiveCategory(category.key)}>
            <span>{category.icon}</span>{category.label}
          </button>
        ))}
      </div>

      {view === "map" && (
        <section className="detroit-map network-map">
          <MapContainer center={[42.36, -83.08]} zoom={11} scrollWheelZoom={false} className="rooted-leaflet-map">
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {visibleMapResources.filter((r) => r.latitude && r.longitude).map((resource) => (
              <Marker key={resource.id} position={[resource.latitude, resource.longitude]} icon={createRootedMarker(resource.category)}>
                <Popup><div className="rooted-map-popup"><span>{categoryIcons[resource.category] || "✦"} {resource.category?.replaceAll("_", " ")}</span><strong>{resource.name}</strong><p>{resource.neighborhood || resource.city}</p>{resource.verified && <b>✓ Verified resource</b>}</div></Popup>
              </Marker>
            ))}
          </MapContainer>
          <div className="real-map-footer"><span><strong>{visibleMapResources.length}</strong> shown on map</span><span>Detroit + nearby communities</span></div>
        </section>
      )}

      {culturalTags.length > 0 && activeCategory === "ALL" && !query && (
        <section className="culture-strip network-culture-strip">
          <div><span className="section-label">FOOD THAT FEELS LIKE HOME</span><h3>Health doesn't erase culture.</h3><p>ROOTED helps members find food that fits their plan, traditions, dietary needs, and household.</p></div>
          <div className="culture-tags">{culturalTags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        </section>
      )}

      <section className="detroit-discovery network-results">
        <div className="section-heading resource-heading"><div><span className="section-label">NEARBY SUPPORT</span><h3>{activeCategory === "ALL" ? "Explore your network" : categories.find((c) => c.key === activeCategory)?.label || activeCategory}</h3></div><span className="resource-count">{filteredResources.length} results</span></div>

        {filteredResources.length === 0 ? (
          <div className="resource-empty"><span>🌱</span><h3>No matches yet</h3><p>Try another category or a broader search.</p></div>
        ) : (
          <div className="resource-grid">
            {filteredResources.map((resource) => {
              const tags = [...splitTags(resource.cultural_tags), ...splitTags(resource.dietary_tags)].slice(0, 3);
              return (
                <article className="resource-card network-resource-card" key={resource.id}>
                  <div className={`resource-visual resource-${String(resource.category).toLowerCase()}`}><span>{categoryIcons[resource.category] || "✦"}</span><div><small>{String(resource.category).replaceAll("_", " ")}</small>{resource.verified && <strong>✓ Verified</strong>}</div></div>
                  <div className="resource-card-body">
                    <div className="resource-location">{resource.neighborhood || resource.city || "Detroit"}</div>
                    <h4>{resource.name}</h4><p>{resource.description}</p>
                    {tags.length > 0 && <div className="resource-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
                    {resource.services && <div className="resource-services"><span>HOW THIS CAN SUPPORT YOU</span><p>{resource.services}</p></div>}
                    <div className="resource-practical-grid">
                      {resource.cost_level && <div><span>Cost</span><strong>{resource.cost_level}</strong></div>}
                      {resource.appointment_required !== undefined && resource.appointment_required !== null && <div><span>Visit</span><strong>{resource.appointment_required ? "Appointment" : "Walk-in / check first"}</strong></div>}
                      {resource.languages && <div><span>Languages</span><strong>{resource.languages}</strong></div>}
                    </div>
                    {resource.transportation_notes && <p className="resource-note"><b>Getting there:</b> {resource.transportation_notes}</p>}
                    <div className="resource-card-footer"><span>{resource.address}{resource.city ? ` • ${resource.city}` : ""}</span>{resource.verified && <strong>ROOTED VERIFIED</strong>}</div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="detroit-rooted-message"><span>🌱</span><div><strong>Your plan should work in your real life.</strong><p>ROOTED connects professional guidance with Detroit's food, care, testing, movement, nature, and community resources.</p></div></section>
    </main>
  );
}

export default Detroit;
