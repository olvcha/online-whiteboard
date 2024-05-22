const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const {Server} = require("socket.io");

const server = http.createServer(app);

app.use(cors());

let rooms = {};

const io = new Server(server, {
    cors:{
        origin: '*',
        methods: ["GET", "POST"],
    },
});

io.on('connection', (socket) => {
    console.log('user connected');

    socket.on("join-room", (roomId) => {
        socket.join(roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = {
                elements: []
            };
        }

        io.to(socket.id).emit("whiteboard-state", rooms[roomId].elements);

        socket.on("element-update", (elementData) => {
            updateElementInRoom(roomId, elementData);
            socket.to(roomId).emit('element-update', elementData);
        });

        socket.on("whiteboard-clear", () => {
            rooms[roomId].elements = [];
            socket.to(roomId).emit("whiteboard-clear");
        });

        socket.on('cursor-position', (cursorData) => {
            socket.to(roomId).emit('cursor-position', {
                ...cursorData,
                userId: socket.id,
            });
        });

        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnected", socket.id);
        });
    });
});

app.get('/', (req, res) => {
    res.send("Server is working");
});

const PORT = process.env.PORT || 3003;

server.listen(PORT, () => {
    console.log("server is running on port", PORT);
});

const updateElementInRoom = (roomId, elementData) => {
    const room = rooms[roomId];
    const index = room.elements.findIndex(element => element.id === elementData.id);

    if (index === -1) return room.elements.push(elementData);

    room.elements[index] = elementData;
};
