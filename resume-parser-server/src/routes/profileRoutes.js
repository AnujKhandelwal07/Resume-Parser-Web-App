const express = require("express");
const {
  createProfile,
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

const router = express.Router();

// Single route for Creating a full profile
router.post("/", createProfile);

// Single route for Fetching a profile
router.get("/:userId", getProfile);

// Single route for Updating a full profile
router.put("/:userId", updateProfile);

module.exports = router;

// const express = require("express");
// const {
//   getProfile,
//   updateProfile,
//   createProfile,
//   addEducation,
//   addWorkExperience, // ✅ Add back after implementing
//   addSpecialties, // ✅ Add back after implementing
// } = require("../controllers/profileController");

// const router = express.Router();

// // ✅ Create User Profile
// router.post("/", createProfile);

// // ✅ Fetch User Profile
// router.get("/:userId", getProfile);

// // ✅ Update User Profile
// router.put("/:userId", updateProfile);

// // ✅ Add Education
// router.post("/:userId/education", addEducation);

// // ✅ Add Work Experience
// router.post("/:userId/work-experience", addWorkExperience);

// // ✅ Add Specialties
// router.post("/:userId/specialties", addSpecialties);

// module.exports = router;
