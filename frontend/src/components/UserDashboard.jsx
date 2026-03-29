import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./UserDashboard.css";

/* ── helpers ── */
function getStatusClass(status) {
  if (!status) return "status-upcoming";
  const s = status.toUpperCase();
  if (s === "LIVE") return "status-live";
  if (s === "COMPLETED" || s === "FINISHED") return "status-completed";
  return "status-upcoming";
}

function ScoreRing({ pct = 0, color = "#0a84ff", size = 56, stroke = 4 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - Math.min(pct, 1))}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
}

function MatchCard({ match, index }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientY - rect.top) / rect.height - 0.5;
    const y = (e.clientX - rect.left) / rect.width - 0.5;
    setTilt({ x: -x * 12, y: y * 12 });
  };
  const resetTilt = () => setTilt({ x: 0, y: 0 });

  const runs1 = match.firstInnings?.totalRuns ?? 0;
  const wkts1 = match.firstInnings?.totalWickets ?? 0;
  const balls1 = match.firstInnings?.totalBalls ?? 0;
  const overs1 = `${Math.floor(balls1 / 6)}.${balls1 % 6}`;

  const runs2 = match.secondInnings?.totalRuns ?? 0;
  const wkts2 = match.secondInnings?.totalWickets ?? 0;
  const balls2 = match.secondInnings?.totalBalls ?? 0;
  const overs2 = `${Math.floor(balls2 / 6)}.${balls2 % 6}`;

  const maxRuns = Math.max(runs1, runs2, 1);
  const isLive = match.status?.toUpperCase() === "LIVE";

  return (
    <div
      ref={cardRef}
      className="match-card-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div
        className="match-card glass-card"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: tilt.x === 0 ? "transform 0.5s ease" : "transform 0.1s ease",
        }}
      >
        {/* Glowing border for live matches */}
        {isLive && <div className="match-card-live-ring" />}

        {/* Card Header */}
        <div className="match-card-header">
          <div className="match-card-meta">
            <span className={`status-badge ${getStatusClass(match.status)}`}>
              {match.status}
            </span>
            {match.matchType && (
              <span className="tag tag-blue" style={{ fontSize: 11 }}>{match.matchType}</span>
            )}
          </div>
          <div className="match-card-vs">
            <span className="match-team">{match.teamA}</span>
            <span className="match-vs-text">vs</span>
            <span className="match-team">{match.teamB}</span>
          </div>
          {match.tossWinner && (
            <p className="match-toss">
              🪙 {match.tossWinner} won toss · chose to {match.tossDecision}
            </p>
          )}
        </div>

        {/* Score Section */}
        {(runs1 > 0 || runs2 > 0) && (
          <div className="match-scores">
            {/* Team A Score */}
            <div className="score-row">
              <div className="score-ring-wrap">
                <ScoreRing pct={runs1 / maxRuns} color="#0a84ff" />
                <div className="score-ring-label">
                  <span className="score-val">{runs1}</span>
                </div>
              </div>
              <div className="score-info">
                <span className="score-team-name">{match.teamA}</span>
                <span className="score-detail">
                  <span style={{ color: "var(--accent-red)", fontWeight: 700 }}>/{wkts1}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 12 }}> ({overs1} ov)</span>
                </span>
              </div>
            </div>

            {/* Team B Score */}
            <div className="score-row">
              <div className="score-ring-wrap">
                <ScoreRing pct={runs2 / maxRuns} color="#30d158" />
                <div className="score-ring-label">
                  <span className="score-val" style={{ color: "#30d158" }}>{runs2}</span>
                </div>
              </div>
              <div className="score-info">
                <span className="score-team-name">{match.teamB}</span>
                <span className="score-detail">
                  <span style={{ color: "var(--accent-red)", fontWeight: 700 }}>/{wkts2}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 12 }}> ({overs2} ov)</span>
                </span>
              </div>
            </div>

            {/* Run diff bar */}
            <div className="run-compare-bar">
              <div
                className="run-bar-fill"
                style={{ width: `${(runs1 / (runs1 + runs2 || 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        <Link to={`/match/${match._id}`} className="match-card-cta">
          <div className="btn btn-primary btn-full">
            <span>View Full Scorecard</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
}

function HeroStats({ matches }) {
  const live = matches.filter(m => m.status?.toUpperCase() === "LIVE").length;
  const completed = matches.filter(m => m.status?.toUpperCase() === "COMPLETED" || m.status?.toUpperCase() === "FINISHED").length;
  const upcoming = matches.length - live - completed;

  const stats = [
    { label: "Live Matches", value: live, color: "var(--accent-red)", icon: "🔴" },
    { label: "Upcoming", value: upcoming, color: "var(--accent-blue)", icon: "🔵" },
    { label: "Completed", value: completed, color: "var(--text-secondary)", icon: "⚪" },
    { label: "Total Matches", value: matches.length, color: "var(--accent-purple)", icon: "🏏" },
  ];

  return (
    <div className="hero-stats">
      {stats.map((s) => (
        <div key={s.label} className="hero-stat-card glass-card">
          <span className="hero-stat-icon">{s.icon}</span>
          <span className="hero-stat-value" style={{ color: s.color }}>{s.value}</span>
          <span className="hero-stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function UserDashboard() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get("/api/matches");
        setMatches(response.data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
    // Auto-refresh every 30s for live matches
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const filterButtons = ["ALL", "LIVE", "UPCOMING", "COMPLETED"];

  const filtered = matches.filter((m) => {
    const status = (m.status || "").toUpperCase();
    const matchesFilter = filter === "ALL" || status === filter ||
      (filter === "UPCOMING" && status !== "LIVE" && status !== "COMPLETED" && status !== "FINISHED") ||
      (filter === "COMPLETED" && (status === "COMPLETED" || status === "FINISHED"));
    const matchesSearch =
      !search ||
      m.teamA?.toLowerCase().includes(search.toLowerCase()) ||
      m.teamB?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-cricket-ball">
        <img src="/cricket_ball.png" alt="Loading" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }} />
      </div>
      <div className="loading-text">Loading Live Matches…</div>
      <div className="loading-bar" />
    </div>
  );

  return (
    <div className="dashboard-page">
      {/* ── Hero Section ── */}
      <section className="hero-section">
        {/* Background */}
        <div className="hero-bg">
          <img src="/stadium.png" className="hero-bg-img" alt="" />
          <div className="hero-bg-overlay" />
          <div className="hero-bg-gradient" />
        </div>

        {/* Floating 3D Ball */}
        <img
          src="/cricket_ball.png"
          className="hero-floating-ball float-element"
          alt=""
        />
        <img
          src="/cricket_bat.png"
          className="hero-floating-bat float-element"
          alt=""
          style={{ animationDelay: "-3s" }}
        />

        {/* Hero Content */}
        <div className="hero-content page-wrapper">
          <div className="section-label animate-fade-up">🏏 Live Cricket · Real Time</div>
          <h1 className="hero-title animate-fade-up" style={{ animationDelay: "0.1s" }}>
            The Future of<br />
            <span className="hero-title-gradient">Cricket Scoring</span>
          </h1>
          <p className="hero-subtitle animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Ultra-fast live scores, ball-by-ball updates, and stunning analytics — all in one place.
          </p>
          <div className="hero-cta animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <a href="#matches" className="btn btn-primary btn-lg">
              🎯 View Matches
            </a>
            <Link to="/admin/login" className="btn btn-secondary btn-lg" style={{ color: "rgba(255,255,255,0.8)" }}>
              ⚙️ Admin Panel
            </Link>
          </div>

          {/* Stats */}
          <HeroStats matches={matches} />
        </div>
      </section>

      {/* ── Matches Section ── */}
      <section id="matches" className="matches-section page-wrapper">
        {/* Section header */}
        <div className="matches-header">
          <div>
            <div className="section-label">Match Centre</div>
            <h2 className="section-title" style={{ fontSize: "clamp(22px, 3vw, 36px)" }}>
              All Matches
            </h2>
          </div>

          {/* Search */}
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search teams…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          {filterButtons.map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "LIVE" && "🔴 "}
              {f === "UPCOMING" && "🔵 "}
              {f === "COMPLETED" && "⚪ "}
              {f === "ALL" && "🏏 "}
              {f}
            </button>
          ))}
          <span className="filter-count">{filtered.length} match{filtered.length !== 1 ? "es" : ""}</span>
        </div>

        {/* Match Grid */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏏</div>
            <h3 className="empty-state-title">
              {matches.length === 0 ? "No matches yet" : "No matches found"}
            </h3>
            <p className="empty-state-sub">
              {matches.length === 0
                ? "The Admin hasn't created any matches yet. Check back soon!"
                : "Try adjusting your search or filter."}
            </p>
            {search && (
              <button className="btn btn-secondary" onClick={() => setSearch("")}>
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="matches-grid">
            {filtered.map((match, i) => (
              <MatchCard key={match._id} match={match} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ── Feature Highlights ── */}
      <section className="features-section page-wrapper">
        <div className="divider" />
        <div className="section-label" style={{ textAlign: "center" }}>Built for Fans</div>
        <h2 className="section-title" style={{ textAlign: "center", marginBottom: 48 }}>
          Why CricketLive?
        </h2>
        <div className="features-grid">
          {[
            { icon: "⚡", title: "Real-Time Updates", desc: "WebSocket-powered live scoring that updates in milliseconds. No refresh needed." },
            { icon: "📊", title: "Deep Analytics", desc: "Batting SR, bowling economy, wagon wheel data and more at your fingertips." },
            { icon: "🌙", title: "Beautiful Dark UI", desc: "Crafted with obsessive attention to detail. Dark, elegant, and fast." },
            { icon: "📱", title: "Works Everywhere", desc: "Responsive design that looks stunning on any device." },
          ].map((f, i) => (
            <div key={i} className="feature-card glass-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>🏏 CricketLive · Built with ❤️ · {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
