import { createSlice } from "@reduxjs/toolkit"; // Import createSlice function from Redux Toolkit

// Define initial state for the whiteboard slice
const initialState = {
    tool: null, // Selected drawing tool
    elements: [], // Array of elements drawn on the whiteboard
    roomId: null, // Track current room ID
    image: null, // Image data
    color: "#000000", // Default color
    pencilSize: 5, // Default pencil size 
    textSize: 20, // Default text size
    canvasSize: { width: window.innerWidth, height: window.innerHeight }, // Default canvas size
};

// Create a Redux slice named "whiteboard"
const whiteboardSlice = createSlice({
    name: "whiteboard",
    initialState, // Initial state
    reducers: {
        // Reducer for setting the selected tool type
        setToolType: (state, action) => {
            state.tool = action.payload;
        },
        // Reducer for updating an element in the elements array
        updateElement: (state, action) => {
            const { id } = action.payload;

            const index = state.elements.findIndex((element) => element.id === id);

            if (index === -1) {
                state.elements.push(action.payload);
            } else {
                state.elements[index] = action.payload;
            }
        },
        // Reducer for setting the elements array
        setElements: (state, action) => {
            state.elements = action.payload;
        },
        // Reducer for setting the current room ID
        setRoomId: (state, action) => {
            state.roomId = action.payload;
        },
        // Reducer for setting the image data
        setImage: (state, action) => {
            state.image = action.payload;
        },
        // Reducer for setting the selected color
        setColor: (state, action) => {
            state.color = action.payload;
        },
        // Reducer for setting the selected pencil size
        setPencilSize: (state, action) => {
            state.pencilSize = action.payload;
        },
        // Reducer for setting the selected pencil size
        setTextSize: (state, action) => {
            state.textSize = action.payload;
        },
        // Reducer for updating the canvas size
        updateCanvasSize: (state, action) => {
            state.canvasSize = action.payload;
        },
    },
});

// Extract action creators and reducer from the whiteboard slice
export const { setToolType, updateElement, setElements, setRoomId, setImage, setColor, setPencilSize, setTextSize, updateCanvasSize } = whiteboardSlice.actions;

// Export the reducer function generated by createSlice
export default whiteboardSlice.reducer;
