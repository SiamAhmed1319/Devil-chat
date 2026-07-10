const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        // সকেট অবজেক্টে রুম আইডি সেভ করে রাখা যেন ডিসকানেক্টের সময় রুম ট্র্যাক করা যায়
        socket.currentRoom = roomId; 
        
        const clients = io.sockets.adapter.rooms.get(roomId);
        const numClients = clients ? clients.size : 0;

        if (numClients > 1) {
            io.to(roomId).emit('user-connected');
        }
    });

    socket.on('send-message', (data) => {
        socket.to(data.room).emit('receive-message', data.message);
    });

    // কেউ ট্যাব কেটে দিলে বা লিভ নিলে অন্যজনকে জানানো
    socket.on('disconnect', () => {
        const roomId = socket.currentRoom;
        if (roomId) {
            socket.to(roomId).emit('user-disconnected');
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});