const http = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");
const { setupWebsocket } = require("../socket/socket");

process.env.NODE_ENV = "test";

const BACKEND_PORT = 4400;
const BACKEND_URL = "http://localhost";

const BACKEND_API = `${BACKEND_URL}:${BACKEND_PORT}`;

describe("websocket server", () => {
  let ioServer, server, teacherSocket, studentSocket;

  beforeAll((done) => {
    const httpServer = http.createServer();
    ioServer = new Server(httpServer, {
      path: "/socket.io",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    setupWebsocket(ioServer);
    server = httpServer.listen(BACKEND_PORT, () => done());
  });

  afterAll(() => {
    ioServer.close();
    server.close();
    if (teacherSocket) {
      console.log("teacherSocket disconnect");
      teacherSocket.disconnect();
      if (studentSocket) {
        console.log("studentSocket disconnect");
        studentSocket.disconnect();
      }
    }
  });

  test("should connect to the server", (done) => {
    teacherSocket = new Client(BACKEND_API, {
      path: "/socket.io",
      transports: ["websocket"],
    });
    studentSocket = new Client(BACKEND_API, {
      path: "/socket.io",
      transports: ["websocket"],
    });
    studentSocket.on("connect", () => {
      expect(studentSocket.connected).toBe(true);
    });
    teacherSocket.on("connect", () => {
      expect(teacherSocket.connected).toBe(true);
      done();
    });
  });

  test("should create a room", (done) => {
    teacherSocket.emit("create-room", "room1");
    teacherSocket.on("create-success", (roomName) => {
      expect(roomName).toBe("ROOM1");
      done();
    });
  });

  test("should not create a room if it already exists", (done) => {
    teacherSocket.emit("create-room", "room1");
    teacherSocket.on("create-failure", () => {
      done();
    });
  });

  test("should join a room", (done) => {
    studentSocket.emit("join-room", {
      enteredRoomName: "ROOM1",
      username: "student1",
    });
    studentSocket.on("join-success", () => {
      done();
    });
  });

  test("should not join a room if it does not exist", (done) => {
    studentSocket.emit("join-room", {
      enteredRoomName: "ROOM2",
      username: "student1",
    });
    studentSocket.on("join-failure", () => {
      done();
    });
  });

  test("should launch student mode", (done) => {
    teacherSocket.emit("launch-student-mode", {
      roomName: "ROOM1",
      questions: [{ question: "question1" }, { question: "question2" }],
    });
    studentSocket.on("launch-student-mode", (questions) => {
      expect(questions).toEqual([
        { question: "question1" },
        { question: "question2" },
      ]);
      done();
    });
  });

  test("should send next question", (done) => {
    teacherSocket.emit("next-question", {
      roomName: "ROOM1",
      question: { question: "question2" },
    });
    studentSocket.on("next-question", (question) => {
      expect(question).toEqual({ question: "question2" });
      done();
    });
  });

  test("should send answer", (done) => {
    studentSocket.emit("submit-answer", {
      roomName: "ROOM1",
      username: "student1",
      answer: "answer1",
      idQuestion: 1,
    });
    teacherSocket.on("submit-answer", (answer) => {
      expect(answer).toEqual({
        idUser: studentSocket.id,
        username: "student1",
        answer: "answer1",
        idQuestion: 1,
      });
      done();
    });
  });

  test("should not join a room if no room name is provided", (done) => {
    studentSocket.emit("join-room", {
      enteredRoomName: "",
      username: "student1",
    });
    studentSocket.on("join-failure", () => {
      done();
    });
  });

  test("should not join a room if the username is not provided", (done) => {
    studentSocket.emit("join-room", { enteredRoomName: "ROOM2", username: "" });
    studentSocket.on("join-failure", () => {
      done();
    });
  });

  test("should end quiz", (done) => {
    teacherSocket.emit("end-quiz", {
      roomName: "ROOM1",
    });
    studentSocket.on("end-quiz", () => {
      done();
    });
  });

  test("should disconnect", (done) => {
    teacherSocket.disconnect();
    studentSocket.disconnect();
    done();
  });
});
