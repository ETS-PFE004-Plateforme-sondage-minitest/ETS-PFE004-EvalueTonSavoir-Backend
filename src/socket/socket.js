const setupWebsocket = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("create-room", (sentRoomName) => {
      if (sentRoomName) {
        const roomName = sentRoomName.toUpperCase();
        if (!io.sockets.adapter.rooms.get(roomName)) {
          socket.join(roomName);
          socket.emit("create-success", roomName);
        } else {
          socket.emit("create-failure");
        }
      } else {
        const roomName = generateRoomName();
        if (!io.sockets.adapter.rooms.get(roomName)) {
          socket.join(roomName);
          socket.emit("create-success", roomName);
        } else {
          socket.emit("create-failure");
        }
      }
    });

    socket.on("join-room", ({ enteredRoomName, username }) => {
      console.log("coucou");
      console.log(io.sockets.adapter.rooms);
      if (io.sockets.adapter.rooms.has(enteredRoomName)) {
        socket.join(enteredRoomName);
        socket.to(enteredRoomName).emit("user-joined", username);
        socket.emit("join-success");
      } else {
        socket.emit("join-failure");
      }
    });

    socket.on("next-question", ({ roomName, question }) => {
      console.log("next-question", roomName, question);
      socket.to(roomName).emit("next-question", question);
    });

    socket.on("launch-student-mode", ({ roomName, questions }) => {
      socket.to(roomName).emit("launch-student-mode", questions);
    });

    socket.on("end-quiz", ({ roomName }) => {
      socket.to(roomName).emit("end-quiz");
    });

    socket.on("message", (data) => {
      console.log("Received message from", socket.id, ":", data);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });

    socket.on("submit-answer", ({ roomName, username, answer, idQuestion }) => {
      socket
        .to(roomName)
        .emit("submit-answer", { username, answer, idQuestion });
    });
  });

  const generateRoomName = (length = 6) => {
    const characters = "0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };
};

module.exports = { setupWebsocket };
