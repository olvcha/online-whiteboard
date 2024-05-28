import { io } from "socket.io-client";
import {
    updateCursorPosition,
    removeCursorPosition,
} from "../CursorOverlay/cursorSlice";
import { store } from "../store/store";
import { setElements, updateElement, updateCanvasSize } from "../Whiteboard/whiteboardSlice";

let socket;

// Function to establish connection with the socket.io server
export const connectWithSocketServer = () => {
    // Connect to the server at the specified URL
    socket = io("http://localhost:3003");

    // Handle successful connection
    socket.on("connect", () => {
        console.log("connected to socket.io server");
    });

    // Handle receiving the initial state of the whiteboard
    socket.on("whiteboard-state", (elements) => {
        store.dispatch(setElements(elements));
    });

    // Handle updates to whiteboard elements
    socket.on("element-update", (elementData) => {
        store.dispatch(updateElement(elementData));
    });

    // Handle clearing the whiteboard
    socket.on("whiteboard-clear", () => {
        store.dispatch(setElements([]));
    });

    // Handle updates to cursor positions
    socket.on("cursor-position", (cursorData) => {
        store.dispatch(updateCursorPosition(cursorData));
    });

    // Handle user disconnection
    socket.on("user-disconnected", (disconnectedUserId) => {
        store.dispatch(removeCursorPosition(disconnectedUserId));
    });

    // Handle image uploads
    socket.on("image-upload", (imageData) => {
        store.dispatch(updateElement(imageData));
    });

    // Handle canvas resize events
    socket.on("canvas-resize", (canvasSize) => {
        store.dispatch(updateCanvasSize(canvasSize));
    });

    // Handle error messages from the server
    socket.on("error", (errorMessage) => {
        console.error(errorMessage);
        // Handle the error appropriately, e.g., show a message to the user
        alert(errorMessage);
        // Optionally, redirect the user to another part of the app
    });

    return socket; // Return the socket instance
};

// Function to join a specific room
export const joinRoom = (roomId) => {
    socket.emit('join-room', roomId);
};

// Function to emit an element update to the server
export const emitElementUpdate = (elementData) => {
    socket.emit("element-update", elementData);
};

// Function to emit a whiteboard clear event to the server
export const emitClearWhiteboard = () => {
    socket.emit("whiteboard-clear");
};

// Function to emit cursor position updates to the server
export const emitCursorPosition = (cursorData) => {
    socket.emit("cursor-position", cursorData);
};

// Function to emit image uploads to the server
export const emitImageUpload = (imageData) => {
    socket.emit("image-upload", imageData);
};

// Function to emit canvas resize events to the server
export const emitCanvasResize = (canvasSize) => {
    socket.emit("canvas-resize", canvasSize);
};
