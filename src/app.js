const express = require("express");
const app = express();
const http = require("http");
const { setupWebsocket } = require("./socket/socket");
const bodyParser = require("body-parser");
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
app.use(bodyParser.json());

const port = process.env.PORT || 4400;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
