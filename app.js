const express = require('express');
const app = express();
const http = require('http');
const { setupWebsocket } = require('./socket/socket');
const bodyParser = require('body-parser');
const cors = require('cors');

const server = http.createServer(app);
setupWebsocket(server);
app.use(cors());
app.use(bodyParser.json());


const port = process.env.PORT || 4400;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
