import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminDashboard() {
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [inningsType, setInningsType] = useState("firstInnings");
  const [batsmanName, setBatsmanName] = useState("Virat");
  const [bowlerName, setBowlerName] = useState("Starc");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  // Retrieve the VIP pass from browser storage
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    // Security check: If there's no token, kick them back to login
    if (!token) {
      navigate("/admin/login");
      return;
    }

    // Fetch all matches to populate the dropdown menu
    const fetchMatches = async () => {
      try {
        const res = await axios.get("/api/matches");
        setMatches(res.data);
        if (res.data.length > 0) setSelectedMatchId(res.data[0]._id);
      } catch (error) {
        console.error("Error fetching matches", error);
      }
    };
    fetchMatches();
  }, [token, navigate]);

  // --- NEW LOGOUT FUNCTION ---
  const handleLogout = () => {
    localStorage.removeItem("adminToken"); // Destroy the VIP pass
    localStorage.removeItem("userRole");
    navigate("/admin/login"); // Kick them back to the login screen
  };

  // The function that runs when you click a scoring button
  const handleScoreUpdate = async (
    runsScored,
    isWicket = false,
    isExtra = false,
  ) => {
    if (!selectedMatchId) return alert("Please select a match first");

    try {
      const payload = {
        inningsType,
        runsScored,
        batsmanName,
        bowlerName,
        isExtra,
        isWicket,
      };

      // We manually attach the Authorization header, just like in Postman!
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.post(
        `/api/matches/${selectedMatchId}/score`,
        payload,
        config,
      );

      setMessage(
        `Success! ${isWicket ? "Wicket taken!" : runsScored + " runs added."}`,
      );
      setTimeout(() => setMessage(""), 3000); // Hide message after 3 seconds
    } catch (error) {
      console.error(error);
      setMessage("Failed to update score. Your token might be expired.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "20px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fdfdfd",
      }}
    >
      {/* --- UPDATED HEADER WITH LOGOUT BUTTON --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #333",
          paddingBottom: "10px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>Admin Scoring Panel</h2>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>
      </div>

      {message && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#d4edda",
            color: "#155724",
            marginBottom: "15px",
            borderRadius: "5px",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "15px",
          marginBottom: "25px",
          backgroundColor: "#eee",
          padding: "15px",
          borderRadius: "5px",
        }}
      >
        <div>
          <label style={{ fontWeight: "bold" }}>Select Match:</label>
          <select
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
          >
            {matches.map((m) => (
              <option key={m._id} value={m._id}>
                {m.teamA} vs {m.teamB}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontWeight: "bold" }}>Active Innings:</label>
          <select
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            value={inningsType}
            onChange={(e) => setInningsType(e.target.value)}
          >
            <option value="firstInnings">1st Innings</option>
            <option value="secondInnings">2nd Innings</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: "bold" }}>Striker (Batter):</label>
            <input
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              type="text"
              value={batsmanName}
              onChange={(e) => setBatsmanName(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: "bold" }}>Current Bowler:</label>
            <input
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              type="text"
              value={bowlerName}
              onChange={(e) => setBowlerName(e.target.value)}
            />
          </div>
        </div>
      </div>

      <h3>Score Next Ball</h3>
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* Run Buttons */}
        {[0, 1, 2, 3, 4, 6].map((runs) => (
          <button
            key={runs}
            onClick={() => handleScoreUpdate(runs)}
            style={{
              padding: "15px 20px",
              fontSize: "20px",
              fontWeight: "bold",
              cursor: "pointer",
              backgroundColor: runs === 4 || runs === 6 ? "#28a745" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              flex: "1 1 20%",
            }}
          >
            {runs}
          </button>
        ))}
        {/* Wicket Button */}
        <button
          onClick={() => handleScoreUpdate(0, true)}
          style={{
            padding: "15px 20px",
            fontSize: "20px",
            fontWeight: "bold",
            cursor: "pointer",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            flex: "1 1 40%",
          }}
        >
          WICKET
        </button>
        {/* Extras Button */}
        <button
          onClick={() => handleScoreUpdate(1, false, true)}
          style={{
            padding: "15px 20px",
            fontSize: "20px",
            fontWeight: "bold",
            cursor: "pointer",
            backgroundColor: "#ffc107",
            color: "black",
            border: "none",
            borderRadius: "5px",
            flex: "1 1 40%",
          }}
        >
          WIDE / NB
        </button>
      </div>
    </div>
  );
}
