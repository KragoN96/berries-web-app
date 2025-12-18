import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/CSS/view-lost-items.css";

const API_BASE = "http://localhost:5000";

const UNIVERSITIES_BUCHAREST = [
  'Academia de Politie "Alexandru Ioan Cuza"',
  "Academia de Studii Economice",
  "Academia Nationala de Informatii",
  "Politehnica Bucuresti",
  "SNSPA",
  'UMF "Carol Davila"',
  'UNATC "I. L. Caragiale"',
  "UNEFS",
  "Universitatea Athenaeum",
  "Universitatea Bioterra",
  "Universitatea Dimitrie Cantemir",
  "Universitatea din Bucuresti",
  "Universitatea Ecologica din Bucuresti",
  "Universitatea Hyperion",
  "Universitatea Nationala de Aparare",
  "Universitatea Nationala de Arte",
  "Universitatea Nationala de Muzica",
  "Universitatea Nicolae Titulescu",
  "Universitatea Romano-Americana",
  "Universitatea Spiru Haret",
  "Universitatea Titu Maiorescu",
].sort((a, b) => a.localeCompare(b, "ro"));

export default function ViewItems() {
  const [type, setType] = useState("lost");
  const [location, setLocation] = useState(""); // ✅ filtru locație
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load(reset = false) {
    try {
      setLoading(true);
      setErr("");

      const params = new URLSearchParams();
      params.set("type", type);
      params.set("limit", "10");

      // ✅ filtru locație către backend
      if (location) params.set("location", location);

      // cursor doar când NU e reset
      if (!reset && cursor) params.set("cursor", cursor);

      const res = await fetch(`${API_BASE}/api/items?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to load feed");

      setItems((prev) => (reset ? data.items : [...prev, ...(data.items || [])]));
      setCursor(data.nextCursor || null);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ✅ reset feed când se schimbă type sau location
  useEffect(() => {
    setItems([]);
    setCursor(null);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, location]);
const titleLabel = type === "lost" ? "Lost items" : "Found items";

const fullTitle = location
  ? `${titleLabel} · ${location}`
  : titleLabel;
  return (
    <div className="vi-page">
      <div className="vi-container">
        {/* TOP BAR */}
        <div className="vi-topbar">
          <Link className="vi-link" to="/home-page">
            ← Home
          </Link>

          <h2 className="vi-title">{fullTitle}</h2>

          <Link className="vi-link vi-link-accent" to="/report-lost-item">
            + Report item
          </Link>
        </div>

        {/* FILTERS */}
        <div className="vi-filters">
          <button
            className={`vi-filter-btn ${type === "lost" ? "is-active" : ""}`}
            onClick={() => setType("lost")}
            disabled={type === "lost"}
          >
            Lost
          </button>

          <button
            className={`vi-filter-btn ${type === "found" ? "is-active" : ""}`}
            onClick={() => setType("found")}
            disabled={type === "found"}
          >
            Found
          </button>

          {/* ✅ FILTRU LOCAȚIE */}
          <select
            className="vi-select"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">All locations</option>
            {UNIVERSITIES_BUCHAREST.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {err && <div className="vi-error">{err}</div>}

        {/* ITEMS */}
        <div className="vi-grid">
          {items.map((it) => {
            const cover =
              Array.isArray(it.images) && it.images.length > 0
                ? typeof it.images[0] === "string"
                  ? it.images[0]
                  : it.images[0]?.url
                : null;

            const imagesCount = Array.isArray(it.images) ? it.images.length : 0;

            // ✅ normalizează URL dacă e "/uploads/.."
            const coverUrl = cover
              ? cover.startsWith("http")
                ? cover
                : cover.startsWith("/")
                ? `${API_BASE}${cover}`
                : `${API_BASE}/${cover}`
              : null;

            return (
              <div key={it._id} className="vi-card">
                {coverUrl ? (
                  <div className="vi-cover">
                    <img
                      className="vi-cover-img"
                      src={coverUrl}
                      alt={it.title || "item"}
                      loading="lazy"
                    />
                    {imagesCount > 1 ? (
                      <div className="vi-more">+{imagesCount - 1} more photo(s)</div>
                    ) : null}
                  </div>
                ) : null}

                <div className="vi-card-body">
                  <div className="vi-card-title">{it.title}</div>

                  <div className="vi-card-desc">
                    {it.description?.slice(0, 160)}
                    {it.description?.length > 160 ? "…" : ""}
                  </div>

                  {it.locationText ? <div className="vi-meta">📍 {it.locationText}</div> : null}
                  {it.whereToClaim ? <div className="vi-meta">🛡️ {it.whereToClaim}</div> : null}

                  <div className="vi-footer">
                    <span className="vi-comments">💬 {it.comments?.length || 0}</span>
                    <Link className="vi-open" to={`/items/${it._id}`}>
                      Open →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* LOAD MORE */}
        <div className="vi-loadmore">
          <button className="vi-btn" onClick={() => load(false)} disabled={loading || !cursor}>
            {loading ? "Loading..." : cursor ? "Load more" : "No more items"}
          </button>
        </div>
      </div>
    </div>
  );
}
