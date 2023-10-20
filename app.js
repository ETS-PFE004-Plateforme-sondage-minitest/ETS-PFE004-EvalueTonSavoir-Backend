const express = require('express');
const app = express();
const http = require('http');
const { setupWebsocket } = require('./socket/socket');
const bodyParser = require('body-parser');
const cors = require('cors');

const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');

const server = http.createServer(app);
setupWebsocket(server);
app.use(cors());
app.use(bodyParser.json());


app.use('/', studentRoutes);
app.use('/', teacherRoutes);


const port = process.env.PORT || 4400;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
