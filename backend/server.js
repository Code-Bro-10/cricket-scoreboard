const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http"); // Required for Socket.io
const { Server } = require("socket.io"); // Required for Socket.io

dotenv.config();
const app = express();

// --- 1. SET UP SOCKET.IO ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*", // Allow React app to connect dynamically
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Make the 'io' object available inside our routes
app.set("io", io);

// Listen for connections just to log them
io.on("connection", (socket) => {
  console.log("📺 A user connected to the Live Broadcast!");
  socket.on("disconnect", () => {
    console.log("User disconnected from broadcast.");
  });
});
// ----------------------------

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "*"
}));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));

const PORT = process.env.PORT || 5000;

// --- 2. START THE SERVER ---
// CRITICAL: We must listen on 'server', not 'app' now!
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
