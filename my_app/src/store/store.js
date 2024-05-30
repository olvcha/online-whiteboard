import { configureStore } from "@reduxjs/toolkit"; // Import configureStore function from Redux Toolkit
import whiteboardSliceReducer from "../Whiteboard/whiteboardSlice"; // Import the reducer for the whiteboard slice
import cursorSliceReducer from "../CursorOverlay/cursorSlice"; // Import the reducer for the cursor slice

// Configure the Redux store using configureStore function
export const store = configureStore({
  reducer: {
    // Define reducers for different slices of state
    whiteboard: whiteboardSliceReducer, // Reducer for whiteboard slice
    cursor: cursorSliceReducer, // Reducer for cursor slice
  },
  // Configure middleware to handle serialization of actions and state 
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore certain actions from being serialized
          ignoreActions: ["whiteboard/setElements"],
          // Ignore certain paths within state objects from being serialized
          ignoredPaths: ["whiteboard.elements"],
        },
      }),
});
