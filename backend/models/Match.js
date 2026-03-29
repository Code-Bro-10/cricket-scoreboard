const mongoose = require("mongoose");

// Schema for individual batsmen
const batsmanSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Sarthak"
  runs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  isOut: { type: Boolean, default: false },
  dismissalInfo: { type: String, default: "Not Out" }, // e.g., "b Omkar" or "c Akash b Omkar"
});

// Schema for individual bowlers
const bowlerSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Omkar"
  ballsBowled: { type: Number, default: 0 }, // We store balls to easily calculate overs (e.g., 14 balls = 2.2 overs)
  maidens: { type: Number, default: 0 },
  runsConceded: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
});

// Schema for a single innings (one team batting)
const inningsSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  totalRuns: { type: Number, default: 0 },
  totalWickets: { type: Number, default: 0 },
  totalBalls: { type: Number, default: 0 },
  batsmen: [batsmanSchema], // Array of batsmen
  bowlers: [bowlerSchema], // Array of bowlers from the opposing team
  overHistory: { type: [String], default: [] }, // <-- THIS IS THE NEW LINE
});

// Main Match Schema
const matchSchema = new mongoose.Schema(
  {
    teamA: { type: String, required: true },
    teamB: { type: String, required: true },
    status: {
      type: String,
      enum: ["UPCOMING", "LIVE", "COMPLETED"],
      default: "UPCOMING",
    },
    tossWinner: { type: String },
    tossDecision: { type: String, enum: ["BAT", "BOWL"] },
    firstInnings: inningsSchema,
    secondInnings: inningsSchema,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Match", matchSchema);
