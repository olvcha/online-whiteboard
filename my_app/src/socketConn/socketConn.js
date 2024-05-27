import { io } from "socket.io-client";
import {
    updateCursorPosition,
    removeCursorPosition,
} from "../CursorOverlay/cursorSlice";
import { store } from "../store/store";
import { setElements, updateElement, updateCanvasSize } from "../Whiteboard/whiteboardSlice";

let socket;

export const connectWithSocketServer = () => {
    socket = io("http://localhost:3003");

    socket.on("connect", () => {
        console.log("connected to socket.io server");
    });

    socket.on("whiteboard-state", (elements) => {
        store.dispatch(setElements(elements));
    });

    socket.on("element-update", (elementData) => {
        store.dispatch(updateElement(elementData));
    });

    socket.on("whiteboard-clear", () => {
        store.dispatch(setElements([]));
    });

    socket.on("cursor-position", (cursorData) => {
        store.dispatch(updateCursorPosition(cursorData));
    });

    socket.on("user-disconnected", (disconnectedUserId) => {
        store.dispatch(removeCursorPosition(disconnectedUserId));
    });

    socket.on("image-upload", (imageData) => {
        store.dispatch(updateElement(imageData));
    });

    socket.on("canvas-resize", (canvasSize) => {
        store.dispatch(updateCanvasSize(canvasSize));
    });

    socket.on("error", (errorMessage) => {
        console.error(errorMessage);
        // Handle the error appropriately, e.g., show a message to the user
        alert(errorMessage);
        // Optionally, redirect the user to another part of the app
    });

    return socket; // Return the socket instance
};

export const joinRoom = (roomId) => {
    socket.emit('join-room', roomId);
};

export const emitElementUpdate = (elementData) => {
    socket.emit("element-update", elementData);
};

export const emitClearWhiteboard = () => {
    socket.emit("whiteboard-clear");
};

export const emitCursorPosition = (cursorData) => {
    socket.emit("cursor-position", cursorData);
};

export const emitImageUpload = (imageData) => {
    socket.emit("image-upload", imageData);
};

export const emitCanvasResize = (canvasSize) => {
    socket.emit("canvas-resize", canvasSize);
};
