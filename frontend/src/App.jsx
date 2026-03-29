import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from "react-router-dom";
import UserDashboard from "./components/UserDashboard";
import ScorecardView from "./components/ScorecardView";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import "./App.css";

function Navbar() {
  const location = useLocation();
  return (
    <nav className="nav">
      <NavLink to="/" className="nav-logo">
        <div className="nav-logo-icon">🏏</div>
        <span className="nav-logo-text">CricketLive</span>
      </NavLink>

      <div className="nav-links">
        {/* Live dot - only show on home */}
        {location.pathname === "/" && (
          <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--accent-red)", fontWeight:600, marginRight:8 }}>
            <span className="nav-live-dot" /> LIVE
          </span>
        )}
        <NavLink to="/" className="nav-link">
          🏠 Home
        </NavLink>
        <NavLink to="/admin/login" className="nav-link nav-admin">
          ⚙️ Admin
        </NavLink>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<UserDashboard />} />
          <Route path="/match/:id" element={<ScorecardView />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
