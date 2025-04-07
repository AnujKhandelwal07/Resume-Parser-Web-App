import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  basicInfoCompleted: 0, // percentage of completion
  educationCompleted: 0,
};

const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    updateBasicInfoProgress: (state, action) => {
      state.basicInfoCompleted = action.payload;
    },
    updateEducationProgress: (state, action) => {
      state.educationCompleted = action.payload;
    },
  },
});

export const { updateBasicInfoProgress, updateEducationProgress } =
  progressSlice.actions;
export default progressSlice.reducer;
