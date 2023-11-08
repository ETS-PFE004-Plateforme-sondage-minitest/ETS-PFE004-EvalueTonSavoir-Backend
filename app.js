const express = require("express");
const app = express();
const http = require("http");
const { setupWebsocket } = require("./src/socket/socket");
const cors = require("cors");
const { Server } = require("socket.io");

const configureServer = (httpServer) => {
  return new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
};

const server = http.createServer(app);
const io = configureServer(server);

setupWebsocket(io);
app.use(cors());

const port = process.env.PORT || 4400;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
