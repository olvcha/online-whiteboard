import { configureStore } from '@reduxjs/toolkit';
import whiteboardSliceReducer from "../Whiteboard/whiteboardSlice";

export const store = configureStore({
  reducer: {
    whiteboard: whiteboardSliceReducer,
  },
});
