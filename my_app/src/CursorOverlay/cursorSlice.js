import { createSlice } from "@reduxjs/toolkit";

// Initial state for the cursor slice
const initialState = {
    cursors: [],
};

// Create a slice for cursor state management
const cursorSlice = createSlice({
    name: "cursor",
    initialState,
    reducers: {
        // Reducer to update cursor position
        updateCursorPosition: (state, action) => {
            const { x, y, userId, userName } = action.payload;

            // Find the index of the cursor by userId
            const index = state.cursors.findIndex((c) => c.userId === userId);

            if (index !== -1) {
                // Update existing cursor position and userName
                state.cursors[index] = {
                    userId,
                    x,
                    y,
                    userName,
                };
            } else {
                // Add a new cursor to the state
                state.cursors.push({
                    userId,
                    x,
                    y,
                    userName,
                });
            }
        },
        // Reducer to remove a cursor by userId
        removeCursorPosition: (state, action) => {
            state.cursors = state.cursors.filter((c) => c.userId !== action.payload);
        },
    },
});

// Export actions for use in components
export const { updateCursorPosition, removeCursorPosition } = cursorSlice.actions;

// Export the reducer to be used in the store
export default cursorSlice.reducer;
