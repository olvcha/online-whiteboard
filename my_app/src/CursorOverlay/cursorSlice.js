import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cursors: [],
};

const cursorSlice = createSlice({
    name: "cursor",
    initialState,
    reducers: {
        updateCursorPosition: (state, action) => {
            const { x, y, userId, userName } = action.payload;

            const index = state.cursors.findIndex((c) => c.userId === userId);

            if (index !== -1) {
                state.cursors[index] = {
                    userId,
                    x,
                    y,
                    userName, // Update userName if it already exists
                };
            } else {
                state.cursors.push({
                    userId,
                    x,
                    y,
                    userName, // Add new cursor with userName
                });
            }
        },
        removeCursorPosition: (state, action) => {
            state.cursors = state.cursors.filter((c) => c.userId !== action.payload);
        },
    },
});

export const { updateCursorPosition, removeCursorPosition } = cursorSlice.actions;

export default cursorSlice.reducer;
