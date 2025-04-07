import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  parsedData: {},
  education: [],
  specialties: [],
  experience: [],
  basicInformation: {},
};

export const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    setResumeData: (state, action) => {
      state.parsedData = action.payload;
    },
    setEducationData: (state, action) => {
      state.education = action.payload;
    },
    setSpecialtiesData: (state, action) => {
      state.specialties = action.payload;
    },
    setExperienceData: (state, action) => {
      state.experience = action.payload;
    },
    setBasicInformation: (state, action) => {
      state.basicInformation = action.payload; // Update Redux state
      sessionStorage.setItem(
        "basicInformation",
        JSON.stringify(action.payload)
      ); // Save to sessionStorage
    },
  },
});

export const {
  setResumeData,
  setEducationData,
  setSpecialtiesData,
  setExperienceData,
  setBasicInformation,
} = resumeSlice.actions;

export default resumeSlice.reducer;

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// const initialState = {
//   parsedData: {},
//   education: [],
//   specialties: [],
//   experience: [], // ✅ Ensure experience state exists
//   status: "idle", // New: Status tracking for async actions
//   error: null, // New: To store any error messages
// };

// export const resumeSlice = createSlice({
//   name: "resume",
//   initialState,
//   reducers: {
//     setResumeData: (state, action) => {
//       state.parsedData = action.payload;
//     },
//     setEducationData: (state, action) => {
//       state.education = action.payload;
//     },
//     setSpecialtiesData: (state, action) => {
//       state.specialties = action.payload;
//     },
//     setExperienceData: (state, action) => {
//       if (!Array.isArray(action.payload)) {
//         console.error(
//           "🚨 setExperienceData received invalid data:",
//           action.payload
//         );
//         return;
//       }
//       state.experience = action.payload;
//     },
//   },
// });

// export const {
//   setResumeData,
//   setEducationData,
//   setSpecialtiesData,
//   setExperienceData,
// } = resumeSlice.actions;
// export default resumeSlice.reducer;
