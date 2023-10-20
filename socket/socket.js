const socketIo = require('socket.io');
const configs = require('../configs/config');

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

        socket.on('join-room', (enteredPassword) => {
            if (enteredPassword === configs.getPassword()) {
                console.log("connection successful")
                socket.emit('join-success');
                // Do other things like maybe adding the user to a specific room
            } else {
                socket.emit('join-failure');
            }
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