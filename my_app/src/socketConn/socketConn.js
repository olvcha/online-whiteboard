
import {io} from "socket.io-client"
import {store} from "../store/store"
import { setElements, updateElement } from "../Whiteboard/whiteboardSlice";
let socket;

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3003";

export const connectWithSocketServer = () =>{
    socket = io(BACKEND_URL);

    socket.on("console", () =>{
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
    })
};

export const emitElementUpdate = (elementData) => {
    socket.emit("element-update", elementData);

};

export const emitClearWhiteboard = () => {
    socket.emit("whiteboard-clear");
};
