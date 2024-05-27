const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");

const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

let rooms = {};
let roomTimers = {}; // To store timers for empty rooms

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
    },
});

io.on('connection', (socket) => {
    socket.on("join-room", (roomId) => {
        if (!rooms[roomId]) {
            rooms[roomId] = {
                elements: [],
                canvasSize: { width: 800, height: 600 }, // Default canvas size
                users: 0 // Track the number of users
            };
        }

        rooms[roomId].users += 1;
        socket.join(roomId);


        // Clear the delete timer if it exists
        if (roomTimers[roomId]) {
            clearTimeout(roomTimers[roomId]);
            delete roomTimers[roomId];
        }

        // Send the current state of the whiteboard and canvas size to the new user
        io.to(socket.id).emit("whiteboard-state", rooms[roomId].elements);
        io.to(socket.id).emit("canvas-resize", rooms[roomId].canvasSize);

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
            rooms[roomId].users -= 1;
            socket.to(roomId).emit("user-disconnected", socket.id);

            // If room becomes empty, set a timer to delete it
            if (rooms[roomId].users === 0) {
                roomTimers[roomId] = setTimeout(() => {
                    delete rooms[roomId]; // This will delete the room and all its elements
                    console.log(`Room ${roomId} deleted due to inactivity`);
                }, 60000); // 60 seconds
            }
        });

        socket.on("image-upload", (imageData) => {
            rooms[roomId].elements.push(imageData);
            io.to(roomId).emit('image-upload', imageData);
            console.log('image upload');
        });

        socket.on("canvas-resize", (canvasSize) => {
            rooms[roomId].canvasSize = canvasSize;
            socket.to(roomId).emit("canvas-resize", canvasSize);
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
