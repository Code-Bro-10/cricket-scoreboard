import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("/api/auth/login", { username, password });
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("userRole", response.data.user.role);
      if (response.data.user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        setError("Access Denied: Only admins can access the dashboard.");
      }
    } catch {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      {/* Background orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />

      <div className="login-card glass-card animate-scale">
        {/* Icon */}
        <div className="login-icon-wrap">
          <div className="login-icon">🏏</div>
        </div>

        <h1 className="login-title">Admin Portal</h1>
        <p className="login-subtitle">Sign in to manage live match scores</p>

        {error && (
          <div className="login-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label className="login-label">Username</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">👤</span>
              <input
                className="input-field"
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                style={{ paddingLeft: 44 }}
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">🔒</span>
              <input
                className="input-field"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingLeft: 44 }}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-full btn-lg login-submit ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" /> Signing In…
              </>
            ) : (
              <>⚡ Sign In to Dashboard</>
            )}
          </button>
        </form>

        <div className="login-footer-link">
          <Link to="/" className="back-btn" style={{ width: "100%", justifyContent: "center" }}>
            ← Back to Scoreboard
          </Link>
        </div>
      </div>

      <style>{`
        .admin-login-page {
          min-height: calc(100vh - 64px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
        }
        .login-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .login-orb-1 {
          width: 400px; height: 400px;
          top: -100px; left: -100px;
          background: rgba(10,132,255,0.08);
        }
        .login-orb-2 {
          width: 300px; height: 300px;
          bottom: -80px; right: -80px;
          background: rgba(48,209,88,0.06);
        }
        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          padding: 44px 40px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .login-icon-wrap {
          display: flex;
          justify-content: center;
        }
        .login-icon {
          width: 72px; height: 72px;
          background: linear-gradient(135deg, #0a84ff, #5ac8fa);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          box-shadow: 0 8px 32px rgba(10,132,255,0.4);
        }
        .login-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.5px;
          text-align: center;
          margin: 0;
        }
        .login-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          text-align: center;
          margin: -8px 0 0;
        }
        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(255,69,58,0.1);
          border: 1px solid rgba(255,69,58,0.25);
          border-radius: var(--radius-md);
          color: var(--accent-red);
          font-size: 14px;
          font-weight: 500;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .login-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .login-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.3px;
        }
        .login-input-wrap {
          position: relative;
        }
        .login-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          z-index: 1;
          pointer-events: none;
        }
        .login-submit { margin-top: 8px; }
        .login-submit.loading { opacity: 0.75; cursor: not-allowed; }
        .spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-footer-link { margin-top: 4px; }
      `}</style>
    </div>
  );
}
