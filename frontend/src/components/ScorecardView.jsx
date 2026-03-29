import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "./ScorecardView.css";

const socketTarget = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const socket = io(socketTarget);

/* ── Ball bubble component ── */
function Ball({ value, index }) {
  let bg, color = "#fff", glow = "";
  if (value === "6") { bg = "var(--accent-green)"; glow = "0 0 16px rgba(48,209,88,0.7)"; }
  else if (value === "4") { bg = "var(--accent-blue)"; glow = "0 0 16px rgba(10,132,255,0.7)"; }
  else if (value === "W") { bg = "var(--accent-red)"; glow = "0 0 16px rgba(255,69,58,0.7)"; }
  else if (value === "Ex") { bg = "var(--accent-yellow)"; color = "#000"; }
  else if (value === "0") { bg = "rgba(255,255,255,0.08)"; }
  else { bg = "rgba(255,255,255,0.12)"; }

  return (
    <div
      className="ball-bubble"
      style={{
        background: bg,
        color,
        boxShadow: glow,
        animationDelay: `${index * 0.06}s`,
      }}
    >
      {value}
    </div>
  );
}

/* ── Innings Progress Bar ── */
function OverBar({ innings, maxOvers = 20 }) {
  const totalBalls = innings.totalBalls || 0;
  const pct = Math.min((totalBalls / (maxOvers * 6)) * 100, 100);
  return (
    <div className="over-progress">
      <div className="over-progress-bar">
        <div className="over-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="over-progress-label">
        {Math.floor(totalBalls / 6)}.{totalBalls % 6} / {maxOvers} Overs
      </span>
    </div>
  );
}

/* ── RRR / CRR ── */
function RateCard({ label, value, color }) {
  return (
    <div className="rate-card">
      <span className="rate-label">{label}</span>
      <span className="rate-value" style={{ color }}>{value}</span>
    </div>
  );
}

/* ── Innings Panel ── */
function InningsPanel({ innings, title, match }) {
  const recentBalls = innings.overHistory ? innings.overHistory.slice(-6) : [];

  const totalBalls = innings.totalBalls || 0;
  const overs = totalBalls > 0 ? totalBalls / 6 : 0;
  const crr = overs > 0 ? (innings.totalRuns / overs).toFixed(2) : "0.00";

  // CRR label + color
  const crrNum = parseFloat(crr);
  const crrColor = crrNum >= 8 ? "var(--accent-green)" : crrNum >= 5 ? "var(--accent-yellow)" : "var(--accent-red)";

  return (
    <div className="innings-panel animate-scale">
      {/* Inn Header */}
      <div className="innings-header">
        <div className="innings-title-row">
          <span className="innings-label">{title}</span>
          <span className="innings-team">{innings.teamName}</span>
        </div>
        <div className="innings-score-display">
          <span className="innings-runs">{innings.totalRuns}</span>
          <span className="innings-divider">/</span>
          <span className="innings-wickets">{innings.totalWickets}</span>
          <span className="innings-overs">
            ({Math.floor(totalBalls / 6)}.{totalBalls % 6} ov)
          </span>
        </div>

        {/* Rate cards */}
        <div className="rate-cards-row">
          <RateCard label="CRR" value={crr} color={crrColor} />
          <RateCard label="Wickets" value={innings.totalWickets} color="var(--accent-red)" />
          <RateCard label="Boundaries" value={
            innings.batsmen?.reduce((acc, b) => acc + (b.fours || 0) + (b.sixes || 0), 0) ?? 0
          } color="var(--accent-blue)" />
        </div>

        {/* Overs progress */}
        <OverBar innings={innings} maxOvers={match.overs || 20} />
      </div>

      {/* Ball history */}
      {recentBalls.length > 0 && (
        <div className="ball-history-section">
          <span className="ball-history-label">Last {recentBalls.length} Balls</span>
          <div className="ball-history-row">
            {recentBalls.map((b, i) => (
              <Ball key={i} value={b} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Batting Table */}
      <div className="innings-section">
        <div className="innings-section-header">
          <span className="innings-section-title batting-title">🏏 Batting</span>
        </div>
        <table className="cricket-table">
          <thead>
            <tr>
              <th>Batter</th>
              <th></th>
              <th className="num">R</th>
              <th className="num">B</th>
              <th className="num">4s</th>
              <th className="num">6s</th>
              <th className="num">SR</th>
            </tr>
          </thead>
          <tbody>
            {innings.batsmen?.map((b) => {
              const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0";
              const isHighScore = b.runs >= 50;
              return (
                <tr key={b._id} className="batting-row">
                  <td>
                    <div className="batter-name-cell">
                      <span className="batter-name">{b.name}</span>
                      {isHighScore && <span className="badge-half">{b.runs >= 100 ? "💯 TON" : "⭐ 50+"}</span>}
                    </div>
                  </td>
                  <td className="dismissal-cell" style={{ color: b.isOut ? "var(--accent-red)" : "var(--accent-green)", fontSize: 12 }}>
                    {b.isOut ? b.dismissalInfo : "Not Out ✓"}
                  </td>
                  <td className="num runs-cell" style={{ fontWeight: 800, fontSize: 18 }}>{b.runs}</td>
                  <td className="num muted">{b.balls}</td>
                  <td className="num muted">{b.fours}</td>
                  <td className="num muted">{b.sixes}</td>
                  <td className="num">
                    <span className="sr-badge" style={{
                      color: parseFloat(sr) >= 150 ? "var(--accent-green)" : parseFloat(sr) >= 100 ? "var(--accent-yellow)" : "var(--text-muted)"
                    }}>{sr}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bowling Table */}
      <div className="innings-section">
        <div className="innings-section-header">
          <span className="innings-section-title bowling-title">🏃 Bowling</span>
        </div>
        <table className="cricket-table">
          <thead>
            <tr>
              <th>Bowler</th>
              <th className="num">O</th>
              <th className="num">M</th>
              <th className="num">R</th>
              <th className="num">W</th>
              <th className="num">Econ</th>
            </tr>
          </thead>
          <tbody>
            {innings.bowlers?.map((b) => {
              const econ = b.ballsBowled > 0 ? (b.runsConceded / (b.ballsBowled / 6)).toFixed(2) : "0.00";
              const isFifer = b.wickets >= 5;
              return (
                <tr key={b._id} className="bowling-row">
                  <td>
                    <div className="batter-name-cell">
                      <span className="batter-name">{b.name}</span>
                      {isFifer && <span className="badge-half" style={{ background: "rgba(255,69,58,0.12)", color: "var(--accent-red)" }}>🎳 Fifer</span>}
                    </div>
                  </td>
                  <td className="num muted">{Math.floor(b.ballsBowled / 6)}.{b.ballsBowled % 6}</td>
                  <td className="num muted">{b.maidens}</td>
                  <td className="num muted">{b.runsConceded}</td>
                  <td className="num wickets-cell">{b.wickets}</td>
                  <td className="num">
                    <span className="sr-badge" style={{
                      color: parseFloat(econ) <= 6 ? "var(--accent-green)" : parseFloat(econ) <= 9 ? "var(--accent-yellow)" : "var(--accent-red)"
                    }}>{econ}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function ScorecardView() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [activeTab, setActiveTab] = useState("1st");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showLiveNotif, setShowLiveNotif] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const resp = await axios.get(`/api/matches/${id}`);
        setMatch(resp.data);
      } catch (err) {
        console.error("Error fetching match:", err);
      }
    };
    fetchMatch();

    socket.on("scoreUpdated", (updatedId) => {
      if (updatedId === id) {
        fetchMatch();
        setLastUpdate(new Date().toLocaleTimeString());
        setShowLiveNotif(true);
        setTimeout(() => setShowLiveNotif(false), 3000);
      }
    });
    return () => socket.off("scoreUpdated");
  }, [id]);

  if (!match) return (
    <div className="loading-screen">
      <div className="loading-cricket-ball">
        <img src="/cricket_ball.png" alt="Loading" style={{ width: "100%", borderRadius: "50%" }} />
      </div>
      <div className="loading-text">Loading Live Broadcast…</div>
      <div className="loading-bar" />
    </div>
  );

  const isLive = match.status?.toUpperCase() === "LIVE";

  return (
    <div className="scorecard-page">
      {/* Live Update Toast */}
      <div className={`live-toast ${showLiveNotif ? "visible" : ""}`}>
        ⚡ Live update · {lastUpdate}
      </div>

      {/* Back Button */}
      <div className="scorecard-back page-wrapper">
        <Link to="/" className="back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Match Hero */}
      <div className="scorecard-hero page-wrapper">
        <div className="scorecard-hero-inner">
          {/* Team A */}
          <div className="scorecard-team team-a">
            <div className="team-avatar team-a-avatar">
              {match.teamA?.charAt(0)}
            </div>
            <div className="team-name">{match.teamA}</div>
            <div className="team-score-big" style={{ color: "var(--accent-blue)" }}>
              {match.firstInnings?.totalRuns ?? 0}
              <span style={{ fontSize: "0.45em", color: "var(--accent-red)", margin: "0 2px" }}>
                /{match.firstInnings?.totalWickets ?? 0}
              </span>
            </div>
          </div>

          {/* Centre */}
          <div className="scorecard-vs-centre">
            <div className="scorecard-match-badge">
              <span className={`status-badge ${isLive ? "status-live" : "status-completed"}`}>
                {match.status}
              </span>
            </div>
            <div className="scorecard-vs-text">VS</div>
            {lastUpdate && (
              <div className="last-update-text">Updated {lastUpdate}</div>
            )}
          </div>

          {/* Team B */}
          <div className="scorecard-team team-b">
            <div className="team-avatar team-b-avatar">
              {match.teamB?.charAt(0)}
            </div>
            <div className="team-name">{match.teamB}</div>
            <div className="team-score-big" style={{ color: "var(--accent-green)" }}>
              {match.secondInnings?.totalRuns ?? 0}
              <span style={{ fontSize: "0.45em", color: "var(--accent-red)", margin: "0 2px" }}>
                /{match.secondInnings?.totalWickets ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Toss info */}
        {match.tossWinner && (
          <div className="toss-info">
            🪙 {match.tossWinner} won toss and chose to {match.tossDecision}
          </div>
        )}
      </div>

      {/* Innings Tabs */}
      <div className="innings-tabs page-wrapper">
        {["1st", "2nd"].map((tab) => (
          <button
            key={tab}
            className={`innings-tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} Innings
          </button>
        ))}
      </div>

      {/* Scorecard panels */}
      <div className="page-wrapper scorecard-content">
        {activeTab === "1st" && match.firstInnings && (
          <InningsPanel
            innings={match.firstInnings}
            title="1st Innings"
            match={match}
          />
        )}
        {activeTab === "2nd" && match.secondInnings && (
          <InningsPanel
            innings={match.secondInnings}
            title="2nd Innings"
            match={match}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>🏏 CricketLive · Real-time updates via WebSocket · {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
