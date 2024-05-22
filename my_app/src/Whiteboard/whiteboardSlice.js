import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    tool: null,
    elements: [],
    roomId: null, // Track current room ID
    image: null,
    color: "#000000",
    canvasSize: { width: window.innerWidth, height: window.innerHeight }, // Default canvas size
};

const whiteboardSlice = createSlice({
    name: "whiteboard",
    initialState,
    reducers: {
        setToolType: (state, action) => {
            state.tool = action.payload;
        },
        updateElement: (state, action) => {
            const { id } = action.payload;

            const index = state.elements.findIndex((element) => element.id === id);

            if (index === -1) {
                state.elements.push(action.payload);
            } else {
                state.elements[index] = action.payload;
            }
        },
        setElements: (state, action) => {
            state.elements = action.payload;
        },
        setRoomId: (state, action) => {
            state.roomId = action.payload;
        },
        setImage: (state, action) => {
            state.image = action.payload; // Set image data
        },
        setColor: (state, action) => {
            state.color = action.payload;
        },
        updateCanvasSize: (state, action) => {
            state.canvasSize = action.payload; // Update canvas size
        },
    },
});

export const { setToolType, updateElement, setElements, setRoomId, setImage, setColor, updateCanvasSize } = whiteboardSlice.actions;

export default whiteboardSlice.reducer;
