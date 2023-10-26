const socketIo = require('socket.io');
const configs = require('../configs/config');
const socketController = require('../controllers/socketController');

const setupWebsocket = (server) => {
    const io = socketIo(server, {
        path: '/socket.io',
        cors: {
            origin: '*',
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('create-room', () => {
            const  roomName = socketController.generateRoomName();
            if(!io.sockets.adapter.rooms.get(roomName)){
                socket.join(roomName);
                socket.emit('create-success', roomName);
            }
            else{
                socket.emit('create-failure'); //TODO - handle (backend and frontend) create-failure
            }
        });


        socket.on('join-room', ({enteredRoomName, username}) => {
            if (io.sockets.adapter.rooms.has(enteredRoomName)) {
                socket.join(enteredRoomName);
                console.log(`User ${socket.id} joined room: ${enteredRoomName}`);
                socket.to(enteredRoomName).emit('user-joined', username);
                socket.emit('join-success');
            } else {
                socket.emit('join-failure');
            }
        });

        socket.on('next-question', ({roomName, question}) => {
            socket.to(roomName).emit('next-question', question);
        });

        socket.on('end-quiz',({roomName}) => {
            socket.to(roomName).emit('end-quiz');
        });

        socket.on('message', (data) => {
            console.log('Received message from', socket.id, ':', data);
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
        });
    });
}

module.exports = { setupWebsocket };