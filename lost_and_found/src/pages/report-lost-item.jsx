import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/CSS/report-lost-item.css";

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

export default function ReportItem() {
  const nav = useNavigate();
  const { user } = useAuth();
  const token = user?.token;

  const [type, setType] = useState("lost");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [university, setUniversity] = useState("");
  const [whereToClaim, setWhereToClaim] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [posted, setPosted] = useState(false);

  const [files, setFiles] = useState([]); // File[]

  const canPost = !loading && title.trim().length > 0 && description.trim().length > 0 && university && files.length > 0;

  const leftTitle = useMemo(() => {
    return type === "lost" ? "Lost something?" : "Found something?";
  }, [type]);

  const leftText = useMemo(() => {
    return type === "lost"
      ? "You’re not alone.\nA clear post helps others recognize your item."
      : "Help someone find what they lost.\nEvery detail matters.";
  }, [type]);

  const tips = useMemo(() => {
    return type === "lost"
      ? ["Use a clear title", "Add real photos", "Mention exact location", "Include any unique details"]
      : ["Use a clear title", "Add real photos", "Mention where it can be claimed", "Include any unique details"];
  }, [type]);

  async function onSubmit(e) {
    e.preventDefault();

    if (!token) {
      setErr("You must be logged in to post.");
      return;
    }

    if (!files || files.length === 0) {
      setErr("Please add at least one photo.");
      return;
    }

    try {
      setErr("");
      setLoading(true);

      // 1) Upload images
      const fd = new FormData();
      files.forEach((file) => fd.append("images", file));

      const upRes = await fetch(`${API_BASE}/api/uploads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const upData = await upRes.json().catch(() => ({}));
      if (!upRes.ok) throw new Error(upData.message || "Upload failed");

      const uploadedImages = upData.images || [];
      if (uploadedImages.length === 0) throw new Error("Upload failed: no images returned");

      // 2) Post item
      const res = await fetch(`${API_BASE}/api/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          title,
          description,
          locationText: university,
          whereToClaim: type === "found" ? whereToClaim : "",
          images: uploadedImages.map((img) => img.url),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to post item");

      setPosted(true);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  }

  if (posted) {
    return (
      <div className="ri-page">
        <div className="ri-container">
          <div className="ri-card ri-success">
            <h2>✅ Posted successfully!</h2>
            <p>Your item is now live. Where do you want to go next?</p>

            <div className="ri-success-actions">
              <button className="ri-btn ri-btn-primary" onClick={() => nav("/home-page-main")}>
                Home
              </button>
              <button className="ri-btn ri-btn-secondary" onClick={() => nav("/view-lost-items")}>
                View items
              </button>
            </div>

            <div style={{ marginTop: 16 }}>
              <button
                className="ri-btn ri-btn-secondary"
                onClick={() => {
                  setPosted(false);
                  setType("lost");
                  setTitle("");
                  setDescription("");
                  setUniversity("");
                  setWhereToClaim("");
                  setFiles([]);
                  setErr("");
                }}
              >
                Post another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ri-page">
      <div className="ri-container ri-layout">
        {/* LEFT SIDE */}
        <aside className="ri-side ri-side-left">
          <div className="ri-side-card">
            <div className="ri-side-kicker">Lost &amp; Found</div>
            <h3 className="ri-side-title">{leftTitle}</h3>
            <p className="ri-side-text">
              {leftText.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          </div>
        </aside>

        {/* CENTER */}
        <main className="ri-center">
          <div className="ri-card">
            <div className="ri-topbar">
              <h2 className="ri-title">Report item</h2>
              <button type="button" className="ri-back" onClick={() => nav(-1)}>
                ← Back
              </button>
            </div>

            {err ? <div className="ri-error">{err}</div> : null}

            <form onSubmit={onSubmit} className="ri-form">
              <div className="ri-field">
                <label>Type:</label>
                <select
                  className="ri-select"
                  value={type}
                  onChange={(e) => {
                    const nextType = e.target.value;
                    setType(nextType);
                    if (nextType === "lost") setWhereToClaim("");
                  }}
                >
                  <option value="lost">Lost</option>
                  <option value="found">Found</option>
                </select>
              </div>

              <div className="ri-field">
                <label>Title:</label>
                <input className="ri-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div className="ri-field">
                <label>Description:</label>
                <textarea
                  className="ri-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={5}
                />
              </div>

              <div className="ri-field">
                <label>University (Bucharest):</label>
                <select className="ri-select" value={university} onChange={(e) => setUniversity(e.target.value)} required>
                  <option value="">Select...</option>
                  {UNIVERSITIES_BUCHAREST.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ri-field">
                <label>Where to claim / info (recommended):</label>
                <input
                  className="ri-input"
                  value={whereToClaim}
                  onChange={(e) => setWhereToClaim(e.target.value)}
                  disabled={type === "lost"}
                  placeholder={type === "lost" ? "Disabled for Lost items" : "e.g. Security / Guard / Reception"}
                />
              </div>

              <div className="ri-field">
                <label>Photos (required, max 5):</label>
                <input
                  className="ri-file"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    setErr("");
                    setFiles(Array.from(e.target.files || []).slice(0, 5));
                  }}
                />
              </div>

              {files.length > 0 ? (
                <div className="ri-files">
                  {files.map((f) => (
                    <div key={`${f.name}-${f.size}`} className="ri-chip">
                      {f.name}
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="ri-actions">
                <button className="ri-btn ri-btn-primary" type="submit" disabled={!canPost}>
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </main>

        {/* RIGHT SIDE */}
        <aside className="ri-side ri-side-right">
          <div className="ri-side-card">
            <div className="ri-side-kicker">Quick tips</div>
            <h3 className="ri-side-title">Tips for a better post</h3>

            <ul className="ri-tips">
              {tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>

            <div className="ri-side-note">
              More details = higher chances of recovery.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
