import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    tool:null,
};
const whiteboardSlice=createSlice({
    name: 'whiteboard',
    initialState,
    reducers:{
        setToolType: (state, action) => {
            state.tool = action.payload;
        },
    },
});

export const {setToolType} = whiteboardSlice.actions;
export default whiteboardSlice.reducer;

