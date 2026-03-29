const express = require("express");
const Match = require("../models/Match");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// 1. GET ALL MATCHES (Public route for the User Dashboard)
router.get("/", async (req, res) => {
  try {
    const matches = await Match.find().sort({ createdAt: -1 }); // Newest first
    res.json(matches);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching matches", error: error.message });
  }
});

// 2. GET A SINGLE MATCH BY ID (Public route for viewing specific scorecard)
router.get("/:id", async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });
    res.json(match);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching match", error: error.message });
  }
});

// 3. CREATE A NEW MATCH (Protected: Admin Only)
router.post("/create", verifyAdmin, async (req, res) => {
  try {
    const { teamA, teamB, status, tossWinner, tossDecision } = req.body;

    const newMatch = new Match({
      teamA,
      teamB,
      status,
      tossWinner,
      tossDecision,
      // Initialize empty innings
      firstInnings: {
        teamName:
          tossDecision === "BAT"
            ? tossWinner
            : tossWinner === teamA
              ? teamB
              : teamA,
        batsmen: [],
        bowlers: [],
        overHistory: [], // explicitly initialize it here too
      },
      secondInnings: {
        teamName:
          tossDecision === "BOWL"
            ? tossWinner
            : tossWinner === teamA
              ? teamB
              : teamA,
        batsmen: [],
        bowlers: [],
        overHistory: [], // explicitly initialize it here too
      },
    });

    await newMatch.save();
    res
      .status(201)
      .json({ message: "Match created successfully", match: newMatch });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating match", error: error.message });
  }
});

// 4. UPDATE SCORE (Protected: Admin Only)
router.post("/:id/score", verifyAdmin, async (req, res) => {
  try {
    const matchId = req.params.id;
    // The data the Admin sends when they click a button
    const {
      inningsType, // 'firstInnings' or 'secondInnings'
      runsScored,
      batsmanName,
      bowlerName,
      isExtra, // boolean (true for wide/no-ball)
      isWicket, // boolean
    } = req.body;

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    // Target the correct innings
    let currentInnings = match[inningsType];

    // --- 1. UPDATE TEAM TOTALS ---
    currentInnings.totalRuns += runsScored;
    if (!isExtra) currentInnings.totalBalls += 1;
    if (isWicket) currentInnings.totalWickets += 1;

    // --- 2. UPDATE BATSMAN STATS ---
    // Find the batsman in the array, or create them if they don't exist yet
    let batsman = currentInnings.batsmen.find((b) => b.name === batsmanName);
    if (!batsman) {
      currentInnings.batsmen.push({
        name: batsmanName,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOut: false,
      });
      batsman = currentInnings.batsmen[currentInnings.batsmen.length - 1]; // Grab the newly added batsman
    }

    if (!isExtra) {
      batsman.runs += runsScored;
      batsman.balls += 1;
      if (runsScored === 4) batsman.fours += 1;
      if (runsScored === 6) batsman.sixes += 1;
      if (isWicket) {
        batsman.isOut = true;
        batsman.dismissalInfo = `b ${bowlerName}`; // Simple default, can be expanded later
      }
    }

    // --- 3. UPDATE BOWLER STATS ---
    // Find the bowler, or create them
    let bowler = currentInnings.bowlers.find((b) => b.name === bowlerName);
    if (!bowler) {
      currentInnings.bowlers.push({
        name: bowlerName,
        ballsBowled: 0,
        runsConceded: 0,
        wickets: 0,
      });
      bowler = currentInnings.bowlers[currentInnings.bowlers.length - 1];
    }

    bowler.runsConceded += runsScored;
    if (!isExtra) bowler.ballsBowled += 1;
    if (isWicket) bowler.wickets += 1;

    // --- 4. UPDATE OVER HISTORY ---
    let ballEvent = runsScored.toString();
    if (isWicket) ballEvent = "W";
    else if (isExtra) ballEvent = "Ex"; // Ex for Extra (Wide/No-Ball)

    currentInnings.overHistory.push(ballEvent);

    // Save all changes to the database
    await match.save();

    // --- 5. EMIT REAL-TIME UPDATE VIA SOCKET.IO ---
    const io = req.app.get("io");
    if (io) {
      io.emit("scoreUpdated", matchId);
    }
    // ----------------------------------------------

    res.json({ message: "Score updated successfully!", match });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating score", error: error.message });
  }
});

module.exports = router;
