// src/pages/News.jsx
import { useMemo } from "react";
import "../styles/CSS/news.css";

export default function News() {
  const posts = [
  {
    date: "December 19",
    title: "Official Launch of Lost & Found",
    tag: "Update",
    content: [
      "Today we officially launched the Lost & Found platform – a place made for students who want to recover lost items more easily on campus.",
      "You can post lost or found items, search quickly, and contact the person who posted directly.",
      "Thank you to everyone who tested the app and sent us feedback before launch!",
    ],
  },
  {
    date: "January 1",
    title: "Happy New Year! 🎆",
    tag: "Announcement",
    content: [
      "We are starting the new year with energy and new ideas for Lost & Found!",
      "In the next period, we plan to improve search, filters, and the mobile experience.",
      "Thank you for being part of the Lost & Found community. Happy New Year!",
    ],
  },
  {
    date: "January 17",
    title: "Stability & Improvements",
    tag: "Dev",
    content: [
      "We are constantly working on stability and performance.",
      "We optimized loading and prepared the base for future updates, including more filters and a faster experience.",
    ],
  },
];


  return (
    <div className="news-page">
      <div className="news-hero">
        <div className="news-hero__inner">
          <h1 className="news-title">NEWS</h1>
          <p className="news-subtitle">
            Latest announcements and updates about the Lost &amp; Found platform.
          </p>
        </div>
      </div>

      <div className="news-container">
        <div className="news-grid">
          {posts.map((p, idx) => (
            <article className="news-card" key={`${p.title}-${idx}`}>
              <div className="news-card__top">
                <span className="news-date">{p.date}</span>
                <span className="news-tag">{p.tag}</span>
              </div>

              <h2 className="news-card__title">{p.title}</h2>

              <div className="news-card__content">
                {p.content.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              <div className="news-card__footer">
                <span className="news-dot" />
                <span className="news-footer-text">Lost &amp; Found Team</span>
              </div>
            </article>
          ))}
        </div>

        <div className="news-note">
          <p>
           Have a suggestion or found a bug? Contact us via email at berries.lostfound@gmail.com.g
          </p>
        </div>
      </div>
    </div>
  );
}
