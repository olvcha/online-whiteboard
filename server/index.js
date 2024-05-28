// Import required modules
const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");

// Create an HTTP server
const server = http.createServer(app);

// Use CORS and JSON parsing middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize in-memory storage for rooms and timers for empty rooms
let rooms = {};
let roomTimers = {};

// Create a new instance of Socket.IO server with CORS configuration
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
    },
});

// Handle new socket connections
io.on('connection', (socket) => {

    // Handle the event when a user joins a room
    socket.on("join-room", (roomId) => {
        // Create a new room if it doesn't exist
        if (!rooms[roomId]) {
            rooms[roomId] = {
                elements: [],
                canvasSize: { width: 800, height: 600 }, // Default canvas size
                users: 0 // Track the number of users
            };
        }

        // Increase the user count for the room
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

        // Handle updates to elements on the whiteboard
        socket.on("element-update", (elementData) => {
            updateElementInRoom(roomId, elementData);
            socket.to(roomId).emit('element-update', elementData);
        });

        // Handle clearing of the whiteboard
        socket.on("whiteboard-clear", () => {
            rooms[roomId].elements = [];
            socket.to(roomId).emit("whiteboard-clear");
        });

        // Handle updates to cursor positions
        socket.on('cursor-position', (cursorData) => {
            socket.to(roomId).emit('cursor-position', {
                ...cursorData,
                userId: socket.id,
            });
        });

        // Handle disconnections
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

        // Handle image uploads to the whiteboard
        socket.on("image-upload", (imageData) => {
            rooms[roomId].elements.push(imageData);
            io.to(roomId).emit('image-upload', imageData);
            console.log('Image uploaded');
        });

        // Handle canvas resize events
        socket.on("canvas-resize", (canvasSize) => {
            rooms[roomId].canvasSize = canvasSize;
            socket.to(roomId).emit("canvas-resize", canvasSize);
        });
    });
});

// Define a simple route to verify the server is working
app.get('/', (req, res) => {
    res.send("Server is working");
});

// Start the server on the specified port
const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});

// Function to update elements in a specific room
const updateElementInRoom = (roomId, elementData) => {
    const room = rooms[roomId];
    const index = room.elements.findIndex(element => element.id === elementData.id);

    // Add new element if it doesn't exist
    if (index === -1) return room.elements.push(elementData);

    // Update existing element
    room.elements[index] = elementData;
};
