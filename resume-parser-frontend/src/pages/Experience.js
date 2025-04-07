import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // For navigation (if using react-router)
import { useDispatch, useSelector } from "react-redux";
import { setExperienceData } from "../redux/slices/resumeSlice";
import { Delete, Edit } from "@mui/icons-material";
import expBanner from "../assets/WorkExpBanner.a2a9e7a7.svg";
import Add from "../assets/Add.png";
import { useMemo } from "react";

const Experience = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");

  // const experience = useSelector((state) => state.resume.experience) || [];
  const experience = useSelector((state) => state.resume.experience);
  const parsedData = useSelector((state) => state.resume.parsedData);
  const memoizedExperience = useMemo(() => experience || [], [experience]); // only recalculate it when experience changes.

  const [formData, setFormData] = useState({
    companyName: "",
    city: "",
    profession: "",
    specialty: "",
    role: "",
    shiftWorked: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState(""); // store error messages.

  // Load experience from sessionStorage
  useEffect(() => {
    const storedExperience = sessionStorage.getItem("experienceData");
    if (storedExperience && experience.length === 0) {
      const parsed = JSON.parse(storedExperience);
      dispatch(setExperienceData(parsed));
    }
  }, [dispatch, experience.length]);

  // Populate from parsedData if empty
  useEffect(() => {
    if (parsedData?.workExperience && experience.length === 0) {
      const parsedExperience = parsedData.workExperience.map((item) => ({
        companyName: item.companyName || "",
        city: "",
        profession: "",
        specialty: "",
        role: item.role || "",
        shiftWorked: item.shiftWorked || "",
        responsibilities: item.responsibilities || [],
      }));
      dispatch(setExperienceData(parsedExperience));
      sessionStorage.setItem(
        "experienceData",
        JSON.stringify(parsedExperience)
      );
    }
  }, [parsedData, experience.length, dispatch]);

  console.log("Parsed Data from Redux:", parsedData);
  console.log("Experience length:", experience.length);

  useEffect(() => {
    sessionStorage.setItem(
      "experienceData",
      JSON.stringify(memoizedExperience)
    );
  }, [memoizedExperience]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validate required fields
  const validateForm = () => {
    const requiredFields = [
      "companyName",
      "city",
      "profession",
      "specialty",
      "role",
      "shiftWorked",
    ];
    for (let field of requiredFields) {
      if (!formData[field].trim()) {
        return `Please fill in the ${field} field.`;
      }
    }
    return null;
  };

  const isCompleteEntry = (entry) =>
    entry.companyName?.trim() &&
    entry.city?.trim() &&
    entry.profession?.trim() &&
    entry.specialty?.trim() &&
    entry.role?.trim() &&
    entry.shiftWorked?.trim();

  const handleSave = async () => {
    if (!userId) return alert("User not logged in. Please log in again.");
    const validationError = validateForm();
    if (validationError) return setError(validationError);
    setError("");

    const updatedExperience =
      editIndex !== null
        ? experience.map((exp, idx) => (idx === editIndex ? formData : exp))
        : [...experience, formData];

    const updatedWithStatus = updatedExperience.map((exp) => ({
      ...exp,
      isComplete: isCompleteEntry(exp),
    }));

    const allComplete = updatedWithStatus.every((exp) => exp.isComplete);

    try {
      const response = await fetch(
        `http://localhost:5000/api/profile/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workExperience: updatedWithStatus }),
        }
      );

      const responseData = await response.json();
      if (!response.ok)
        throw new Error(responseData.error || "Failed to update experience");

      dispatch(setExperienceData(updatedWithStatus));
      sessionStorage.setItem(
        "experienceData",
        JSON.stringify(updatedWithStatus)
      );
      sessionStorage.setItem("experienceCompleted", allComplete.toString());
      window.dispatchEvent(new Event("progressUpdated"));

      alert("Experience saved successfully!");
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  // Handle edit
  const handleEdit = (index) => {
    setEditIndex(index);
    setFormData({ ...experience[index] });
    setShowForm(true);
  };

  const handleDelete = (index) => {
    const updatedExperience = experience.filter((_, i) => i !== index);
    const updatedWithStatus = updatedExperience.map((exp) => ({
      ...exp,
      isComplete: isCompleteEntry(exp),
    }));
    const allComplete = updatedWithStatus.every((exp) => exp.isComplete);

    dispatch(setExperienceData(updatedWithStatus));
    sessionStorage.setItem("experienceData", JSON.stringify(updatedWithStatus));
    sessionStorage.setItem("experienceCompleted", allComplete.toString());
  };

  const resetForm = () => {
    setFormData({
      companyName: "",
      city: "",
      profession: "",
      specialty: "",
      role: "",
      shiftWorked: "",
    });
    setEditIndex(null);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  // Handle back navigation
  const handleBack = () => {
    navigate("/profile/education");
  };

  return (
    <Box sx={{ padding: 3 }}>
      {/* Work Experience Banner */}
      <Typography variant="h4" gutterBottom>
        <img
          src={expBanner}
          alt="Logo"
          style={{ width: "90%", objectFit: "contain" }}
        />
      </Typography>
      <br></br>
      {/* Description Paragraph */}
      <Typography variant="body1" sx={{ marginBottom: 2 }}>
        <span style={{ color: "#d7282f", lineHeight: "26px" }}>
          To work with us, you will need to provide as much professional work
          history as possible (up to 7 years total).
        </span>
        The more experience you give us, the
        <br></br>
        faster you may be submitted for this position. It will also help us
        recommend jobs. For most positions, you will need to meet the minimum
        work experience
        <br></br>
        requirement that is 1 year.
      </Typography>
      <br></br>
      {/* Add More Experience Button */}
      {!showForm && (
        <Button variant="contained" onClick={() => setShowForm(true)}>
          <img
            src={Add}
            alt="Add"
            width={"18px"}
            style={{ marginRight: "8px" }}
          />
          Add More Experience
        </Button>
      )}
      {/* Experience Form */}
      {showForm && (
        <Box
          sx={{
            marginTop: 1,
            padding: 2,
            // border: "1px solid #ccc",
            // borderRadius: 2,
            maxWidth: "1100px", // Set a max-width to limit the form's size
            width: "100%", // Ensure it takes up the full width but within maxWidth
            overflow: "hidden", // Prevent any overflow outside the form container
          }}
        >
          {/* Display error message */}
          {error && (
            <Alert
              severity="error"
              sx={{
                marginBottom: 3,
                padding: 1,
                fontSize: "0.875rem",
                maxWidth: "260px",
                width: "100%",
              }}
            >
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4} marginBottom={3}>
              <TextField
                required
                name="companyName"
                label="Facility Name"
                variant="outlined"
                value={formData.companyName}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                required
                name="city"
                label="City"
                variant="outlined"
                value={formData.city}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                required
                name="profession"
                label="Profession"
                variant="outlined"
                value={formData.profession}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                required
                name="specialty"
                label="Specialty"
                variant="outlined"
                value={formData.specialty}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="role"
                label="Type of Position (Employment Type)"
                variant="outlined"
                value={formData.role}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} marginBottom={3}>
              <TextField
                required
                name="shiftWorked"
                label="Shift Worked"
                variant="outlined"
                value={formData.shiftWorked}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>

          <Box sx={{ marginTop: 2, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleSave}
              style={{
                padding: "5px 18px",
                fontSize: "12px",
                borderRadius: "10px",
                marginLeft: "",
              }}
            >
              {editIndex !== null ? "Update" : "Save"}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancel}
              style={{
                padding: "5px 18px",
                fontSize: "12px",
                borderRadius: "10px",
                marginLeft: "",
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}
      {/* Experience Table */}
      {experience.length > 0 && (
        <TableContainer component={Paper} sx={{ marginTop: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: "#89CFF0" }}>
                  Status
                </TableCell>
                <TableCell sx={{ backgroundColor: "#89CFF0" }}>
                  Facility Name
                </TableCell>
                <TableCell sx={{ backgroundColor: "#89CFF0" }}>City</TableCell>
                <TableCell sx={{ backgroundColor: "#89CFF0" }}>
                  Profession
                </TableCell>
                <TableCell sx={{ backgroundColor: "#89CFF0" }}>
                  Type Of Position
                </TableCell>
                <TableCell sx={{ backgroundColor: "#89CFF0" }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {experience.map((exp, index) => (
                <TableRow
                  key={index}
                  sx={{
                    // backgroundColor: !exp.isComplete ? "#fff3cd" : "inherit", // yellow for incomplete
                    backgroundColor: "white",
                  }}
                >
                  <TableCell>
                    {exp.isComplete ? (
                      <Typography color="green">Complete</Typography>
                    ) : (
                      <Typography color="red">Incomplete</Typography>
                    )}
                  </TableCell>
                  <TableCell>{exp.companyName || "-"}</TableCell>
                  <TableCell>{exp.city || "-"}</TableCell>
                  <TableCell>{exp.profession || "-"}</TableCell>
                  <TableCell>{exp.role || "-"}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(index)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(index)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <br></br> <br></br>
      {/* Back Button */}
      <Button
        variant="outlined"
        color="primary"
        onClick={handleBack}
        style={{
          padding: "5px 18px",
          fontSize: "12px",
          borderRadius: "10px",
          marginLeft: "0",
        }}
      >
        Back
      </Button>
    </Box>
  );
};

export default Experience;

// companyName, city, profession, specialty, role, shiftWorked
