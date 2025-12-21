import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/CSS/item-details.css";

const API_BASE = "https://berries-web-app.onrender.com";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [err, setErr] = useState("");
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // ✅ slider
  const [activeImg, setActiveImg] = useState(0);

  const { user } = useAuth();
  const token = user?.token;

  async function load() {
    try {
      setErr("");
      const res = await fetch(`${API_BASE}/api/items/${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to load item");
      setItem(data);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    load();
    setActiveImg(0); // ✅ reset slider la item nou
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const authorLabel = useMemo(() => {
    if (!item) return "";
    const a = item.reportedBy || item.user || item.owner || item.createdBy;
    return (
      a?.name ||
      a?.fullName ||
      a?.username ||
      a?.email ||
      item.authorName ||
      "Anonim"
    );
  }, [item]);

  const postedAtLabel = useMemo(() => {
    if (!item?.createdAt) return "";
    try {
      return new Date(item.createdAt).toLocaleString();
    } catch {
      return "";
    }
  }, [item]);

  const typeLabel = useMemo(() => {
    const t = item?.type;
    if (t === "lost") return "LOST";
    if (t === "found") return "FOUND";
    return "ITEM";
  }, [item]);

  const imageUrls = useMemo(() => {
    if (!item) return [];

    const raw =
      item.images ||
      item.photos ||
      item.imageUrls ||
      item.imageUrl ||
      item.image ||
      item.photoUrl ||
      item.photo;

    if (!raw) return [];
    const arr = Array.isArray(raw) ? raw : [raw];

    const pickUrl = (val) => {
      if (!val) return "";
      if (typeof val === "string") return val;
      if (typeof val === "object") {
        return (
          val.url ||
          val.path ||
          val.secure_url ||
          val.location ||
          val.filePath ||
          val.filename ||
          ""
        );
      }
      return "";
    };

    return arr
      .map(pickUrl)
      .filter(Boolean)
      .map((u) => {
        let s = String(u).trim().replaceAll("\\", "/");
        if (!s.startsWith("http") && !s.startsWith("/") && !s.includes("/")) {
          s = `/uploads/${s}`;
        }
        if (!s.startsWith("http") && !s.startsWith("/")) s = "/" + s;
        if (!s.startsWith("http")) return `${API_BASE}${s}`;
        return s;
      });
  }, [item]);

  // ✅ siguranță: dacă activeImg devine out of range (ex. s-a schimbat lista)
  useEffect(() => {
    if (activeImg >= imageUrls.length) setActiveImg(0);
  }, [imageUrls, activeImg]);

  const hasImages = imageUrls.length > 0;

  const goPrev = () => {
    if (!hasImages) return;
    setActiveImg((i) => (i - 1 + imageUrls.length) % imageUrls.length);
  };

  const goNext = () => {
    if (!hasImages) return;
    setActiveImg((i) => (i + 1) % imageUrls.length);
  };

  async function postComment(e) {
    e.preventDefault();

    try {
      setPosting(true);
      setErr("");

      const res = await fetch(`${API_BASE}/api/items/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to post comment");

      setItem((prev) => ({
        ...prev,
        comments: [...(prev?.comments || []), data],
      }));
      setText("");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setPosting(false);
    }
  }

  async function deleteComment(commentId) {
    if (!window.confirm("Delete this comment?")) return;

    await fetch(`${API_BASE}/api/items/${id}/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setItem((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c._id !== commentId),
    }));
  }

  async function saveEdit(commentId) {
    await fetch(`${API_BASE}/api/items/${id}/comments/${commentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: editText }),
    });

    setItem((prev) => ({
      ...prev,
      comments: prev.comments.map((c) =>
        c._id === commentId ? { ...c, text: editText, editedAt: new Date() } : c
      ),
    }));

    setEditingId(null);
  }

  return (
    <div className="id-page">
      <div className="id-wrap">
        <button type="button" className="id-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {err && <div className="id-error">{err}</div>}

        {!item ? (
          <div className="id-loading">Loading...</div>
        ) : (
          <div className="id-card">
            <div className="id-header">
              <div className="id-badges">
                <span
                  className={`id-badge id-badge--${(item.type || "item").toLowerCase()}`}
                >
                  {typeLabel}
                </span>
              </div>

              <h2 className="id-title">{item.title}</h2>

              <div className="id-meta">
                <div className="id-meta-row">
                  <span className="id-meta-label">
                    {item.type === "lost"
                      ? "Lost by:"
                      : item.type === "found"
                      ? "Found by:"
                      : "Posted by:"}
                  </span>
                  <span className="id-meta-value">{authorLabel}</span>
                </div>

                {postedAtLabel && (
                  <div className="id-meta-row">
                    <span className="id-meta-label">Posted on:</span>
                    <span className="id-meta-value">{postedAtLabel}</span>
                  </div>
                )}
              </div>
            </div>

            {item.description && <div className="id-desc">{item.description}</div>}

            {/* ✅ SLIDER POZE */}
            {imageUrls.length > 0 && (
              <div className="id-media">
                <div className="id-slider">
                  <div
                    className="id-img-wrapper"
                    style={{ backgroundImage: `url(${imageUrls[activeImg]})` }}
                  >
                    <img className="id-main-img" src={imageUrls[activeImg]} alt="Item" />
                  </div>

                  {imageUrls.length > 1 && (
                    <div className="id-arrows">
                      <button type="button" className="id-arrow" onClick={goPrev} aria-label="Previous">
                        ‹
                      </button>
                      <button type="button" className="id-arrow" onClick={goNext} aria-label="Next">
                        ›
                      </button>
                    </div>
                  )}
                </div>

                {imageUrls.length > 1 && (
                  <div className="id-thumbs">
                    {imageUrls.map((src, idx) => (
                      <button
                        key={`${src}-${idx}`}
                        type="button"
                        className={`id-thumb-btn ${idx === activeImg ? "is-active" : ""}`}
                        onClick={() => setActiveImg(idx)}
                        aria-label={`Open image ${idx + 1}`}
                      >
                        <img className="id-thumb" src={src} alt={`Thumb ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="id-info">
              {item.locationText ? (
                <div className="id-info-row">📍 <span>{item.locationText}</span></div>
              ) : null}

              {item.whereToClaim ? (
                <div className="id-info-row">🛡️ <span>{item.whereToClaim}</span></div>
              ) : null}
            </div>

            <div className="id-divider" />

            <div className="id-comments">
              <h3 className="id-subtitle">Comments</h3>

              <div className="id-comments-list">
                {(item.comments || []).length === 0 ? (
                  <div className="id-empty">No comments yet.</div>
                ) : (
                  item.comments.map((c) => (
                    <div key={c._id} className="id-comment">
                      <div className="id-comment-head">
                        <div className="id-comment-author">{c.authorName || "Anonim"}</div>

                        {c.userId === String(user?.id || user?._id || "") && (
                          <div className="id-comment-actions">
                            <button
                              type="button"
                              className="id-action-btn"
                              onClick={() => {
                                setEditingId(c._id);
                                setEditText(c.text || "");
                              }}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="id-action-btn id-action-btn--danger"
                              onClick={() => deleteComment(c._id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {editingId === c._id ? (
                        <div className="id-edit">
                          <textarea
                            className="id-textarea"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                          />

                          <div className="id-edit-actions">
                            <button
                              type="button"
                              className="id-btn"
                              disabled={editText.trim().length < 2}
                              onClick={() => saveEdit(c._id)}
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              className="id-btn id-btn--ghost"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="id-comment-text">{c.text}</div>
                          <div className="id-comment-date">
                            {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              <form className="id-form" onSubmit={postComment}>
                <input
                  className="id-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Ex: It's at the university security desk"
                />
                <button className="id-btn" disabled={posting || text.trim().length < 2}>
                  {posting ? "Posting..." : "Send"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
