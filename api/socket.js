const Party = require("./models/partyModel");

const io = require("socket.io")(3000, {
  pingTimeout: 60000,
  cors: {
    origin: ["http://localhost:5173"],
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
