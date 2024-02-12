const express = require("express");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const connectDB = require("./db/connectDB.js");
const usersRoute = require("./routes/usersRoute.js");
const partyRoute = require("./routes/partyRoute.js");
const errorHandler = require("./middleware/errorHandler.js");
const PORT = process.env.PORT || 5200;
const cors = require("cors");
const path = require("path");
const passport = require("passport");
const helmet = require("helmet");
const cache = require("./middleware/cache.js");
const Party = require("./models/partyModel");

app.use(
  helmet({
    crossOriginOpenerPolicy: false,
  })
);
app.use(
  cors({
    origin: [
      `http://localhost:${PORT}`,
      "http://localhost:5173",
      "https://ghaith-drawing.onrender.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
require("./utils/passportJWT.js");
require("./utils/passportGoogle.js");
connectDB();
app.use("/api/users", usersRoute);
app.use("/api/party", partyRoute);
app.use(errorHandler);
app.use(cache);

const __dirname1 = path.resolve();

if (process.env.NODE_ENV == "production") {
  app.use(express.static(path.join(__dirname1, "/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "build", "index.html"));
  });
}

const server = app.listen(PORT, () =>
  console.log(`Server is running on port ${PORT}`)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: ["http://localhost:5173", "https://ghaith-drawing.onrender.com"],
  },
});

io.on("connection", (socket) => {
  socket.on("joined", (partyId, userId) => {
    socket.join(partyId);
    io.to(partyId).emit("joined", partyId, userId);
  });
  socket.on("leaved", (partyId, userId) => {
    io.to(partyId).emit("leaved", partyId, userId);
  });
  socket.on("start-drawing", (e, lineWidth, color, partyId) => {
    socket.to(partyId).emit("start-drawing", e, lineWidth, color);
  });
  socket.on("drawing", (e, tool, color, partyId) => {
    socket.to(partyId).emit("drawing", e, tool, color);
  });
  socket.on("stop-drawing", (partyId) => {
    socket.to(partyId).emit("stop-drawing");
  });
  socket.on("clear", (partyId) => socket.to(partyId).emit("clear"));
  socket.on("undo", (partyId) => socket.to(partyId).emit("undo"));
  socket.on("send-guess", async (partyId, guess) => {
    if (guess.correct) {
      const party = await Party.findById(partyId);
      party.members[
        party.members.findIndex(
          (member) => member.user.toString() == party.turn.toString()
        )
      ].score += 2;
      party.members[
        party.members.findIndex(
          (member) => member.user.toString() == guess.sender_id.toString()
        )
      ].score += 3;
      await party.save();
    }
    socket.to(partyId).emit("receive-guess", guess);
  });
  socket.on("send-message", async (partyId, message) => {
    socket.to(partyId).emit("receive-message", message);
  });
});

module.exports = io;
