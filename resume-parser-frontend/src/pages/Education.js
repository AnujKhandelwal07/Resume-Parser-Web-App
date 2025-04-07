import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import {
  setEducationData,
  setResumeData,
  setSpecialtiesData,
} from "../redux/slices/resumeSlice";
import { useNavigate } from "react-router-dom"; // Add this import
import specialities from "../assets/SpecialtiesBanner.49c26bfb.svg";
import educationLogo from "../assets/EducationBanner.7c37b107.svg";
import Add from "../assets/Add.png";

const Education = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");

  console.log("Fetching profile for userId:", userId);

  const parsedData = useSelector((state) => state.resume.parsedData);
  const education = useSelector((state) => state.resume.education) || [];

  // Ensure education & specialties are stored properly
  const [formData, setFormData] = useState({
    primaryWorkType: "",
    primarySpecialty: "",
    yearsOfExperience: "",
    secondarySpecialty: "",
    school: "",
    city: "",
    state: "",
    degree: "",
    graduationDate: "",
    nameOnDegree: "",
    country: "",
  });

  // Load education & specialties from sessionStorage on mount
  useEffect(() => {
    const storedEducation = sessionStorage.getItem("educationData");
    const storedSpecialties = sessionStorage.getItem("specialtiesData");

    if (storedEducation) {
      dispatch(setEducationData(JSON.parse(storedEducation))); // Redux sync
    }

    if (storedSpecialties) {
      dispatch(setSpecialtiesData(JSON.parse(storedSpecialties))); // Redux sync
    }
  }, [dispatch]);

  const [showEducationFields, setShowEducationFields] = useState(false); // Controls whether the education form is visible.
  const [editIndex, setEditIndex] = useState(null); // Tracks which entry is being edited.

  useEffect(() => {
    const hasStoredEducation = sessionStorage.getItem("educationData");
    const hasStoredSpecialties = sessionStorage.getItem("specialtiesData");

    if (!hasStoredEducation && parsedData?.education?.length > 0) {
      const updatedEducation = parsedData.education.map((edu) => ({
        ...edu,
        isIncomplete: [
          "school",
          "city",
          "state",
          "degree",
          "graduationDate",
          "nameOnDegree",
          "country",
        ].some((field) => !edu[field]),
      }));
      dispatch(setEducationData(updatedEducation));
      sessionStorage.setItem("educationData", JSON.stringify(updatedEducation));
    }

    if (!hasStoredSpecialties && parsedData?.specialties?.length > 0) {
      const specialties = parsedData.specialties[0];
      dispatch(setSpecialtiesData([specialties]));
      sessionStorage.setItem("specialtiesData", JSON.stringify([specialties]));
      setFormData((prevData) => ({
        ...prevData,
        ...specialties,
      }));
    }
  }, [parsedData, dispatch]);

  useEffect(() => {
    const storedEducation = sessionStorage.getItem("educationData");
    const storedSpecialties = sessionStorage.getItem("specialtiesData");

    if (storedEducation) {
      const parsed = JSON.parse(storedEducation);
      dispatch(setEducationData(parsed));
      dispatch(setResumeData({ education: parsed }));
    }

    if (storedSpecialties) {
      const parsedSpecialties = JSON.parse(storedSpecialties)[0] || {};
      dispatch(setSpecialtiesData([parsedSpecialties]));
      setFormData((prev) => ({
        ...prev,
        ...parsedSpecialties,
      }));
    }
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target; // refers to the input field

    if (name === "yearsOfExperience") {
      const numericValue = Number(value);
      if (numericValue < 0 || numericValue > 20) return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value.trim(),
    }));

    console.log(`Updated ${name}:`, value);
  };

  const handleSave = () => {
    const requiredFields = [
      "school",
      "city",
      "state",
      "degree",
      "graduationDate",
      "nameOnDegree",
      "country",
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        // If any field is empty
        alert(`Please fill in the required field: ${field}`);
        return;
      }
    }

    // update an existing education entry or add a new one
    const updatedEducation =
      editIndex !== null
        ? education.map((edu, index) => (index === editIndex ? formData : edu)) //  it's updating the specific education entry that the user is editing.
        : [...education, formData];

    const specialtiesData = {
      primaryWorkType: formData.primaryWorkType,
      primarySpecialty: formData.primarySpecialty,
      yearsOfExperience: formData.yearsOfExperience
        ? parseInt(formData.yearsOfExperience, 10) //  decimal number
        : 0,
      secondarySpecialty: formData.secondarySpecialty || null,
    };

    // Store education & specialties in Redux
    dispatch(setEducationData(updatedEducation));
    dispatch(setSpecialtiesData([specialtiesData])); // Store specialties as an array

    // Store in session storage
    sessionStorage.setItem("educationData", JSON.stringify(updatedEducation));
    sessionStorage.setItem(
      "specialtiesData",
      JSON.stringify([specialtiesData])
    );

    setEditIndex(null);
    setShowEducationFields(false);

    // It helps reset the form
    setFormData((prevData) => ({
      ...prevData, // Keep specialty fields intact
      school: "",
      city: "",
      state: "",
      degree: "",
      graduationDate: "",
      nameOnDegree: "",
      country: "",
    }));

    console.log("Education & Specialties Data Saved:", {
      education: updatedEducation,
      specialties: specialtiesData,
    });
  };

  const handleEdit = (index) => {
    const edu = education[index];

    const storedSpecialties = sessionStorage.getItem("specialtiesData");
    const specialties = storedSpecialties
      ? JSON.parse(storedSpecialties)[0] || {}
      : {};

    setFormData((prev) => ({
      ...prev,
      ...specialties, // Keep specialties
      ...edu, // Overwrite only education fields
    }));

    setEditIndex(index);
    setShowEducationFields(true);
  };

  const handleDelete = (index) => {
    const updatedEducation = education.filter((_, i) => i !== index); // creates a new array

    // Update Redux and SessionStorage
    dispatch(setEducationData(updatedEducation));
    sessionStorage.setItem("educationData", JSON.stringify(updatedEducation));
  };

  const handleNext = async () => {
    const storedEducation =
      JSON.parse(sessionStorage.getItem("educationData")) || education;
    const storedSpecialties =
      JSON.parse(sessionStorage.getItem("specialtiesData")) || [];

    const specialtiesFilled =
      storedSpecialties.length > 0 &&
      storedSpecialties[0].primaryWorkType &&
      storedSpecialties[0].primarySpecialty &&
      storedSpecialties[0].yearsOfExperience !== undefined;

    const hasCompleteEducation = storedEducation.some((edu) => {
      return (
        edu.school &&
        edu.city &&
        edu.state &&
        edu.degree &&
        edu.graduationDate &&
        edu.nameOnDegree &&
        edu.country
      );
    });

    if (specialtiesFilled && !hasCompleteEducation) {
      alert(
        "Please complete at least one full education entry before proceeding."
      );
      return;
    }

    try {
      if (!userId) {
        alert("User ID is missing. Please log in again.");
        return;
      }

      const educationData = storedEducation.map((edu) => ({
        ...edu,
        graduationDate: edu.graduationDate
          ? new Date(edu.graduationDate).toISOString()
          : null,
      }));

      console.log("Sending to Server:", {
        education: educationData,
        specialties: storedSpecialties,
      });

      const response = await fetch(
        `http://localhost:5000/api/profile/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            education: educationData,
            specialties: storedSpecialties,
          }),
        }
      );

      const responseData = await response.json();
      console.log("Server Response:", responseData);

      if (!response.ok)
        throw new Error(responseData.error || "Failed to update profile");

      sessionStorage.setItem("educationCompleted", "true");
      window.dispatchEvent(new Event("progressUpdated"));
      navigate("/profile/experience");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setShowEducationFields(false);
    setEditIndex(null);
    setFormData((prevData) => ({
      ...prevData,
      school: "",
      city: "",
      state: "",
      degree: "",
      graduationDate: "",
      nameOnDegree: "",
      country: "",
    }));
  };

  const handleBack = () => {
    navigate("/profile/basic-info");
  };

  return (
    <Box
      component="form"
      sx={{
        width: "100%", // Balanced width
        "& .MuiTextField-root": { m: 1, width: "50ch" },
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: "800px",
        padding: 3,
        paddingLeft: 0,
        paddingRight: 0,
      }}
      noValidate
      autoComplete="off"
    >
      <header>
        <img
          src={specialities}
          alt="Logo"
          style={{
            paddingLeft: 20,
            width: "135%", // Logo takes 80% of the page width
            objectFit: "contain", // Ensure the logo maintains its aspect ratio
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      </header>

      <br></br>
      {/* Primary Details */}
      <fieldset
        style={{ border: "none", margin: 0, padding: 0, marginBottom: "12px" }}
      >
        <TextField
          required
          name="primaryWorkType"
          label="Primary Type of Work"
          variant="outlined"
          InputLabelProps={{
            shrink: true, // Always show label like a "legend"
          }}
          value={formData.primaryWorkType || ""}
          onChange={handleChange}
          style={{
            width: "40%", // Reduced width
            objectFit: "contain",
          }}
          sx={{
            "&:hover .MuiOutlinedInput-root": {
              borderColor: "blue",
            },
          }}
          size="small" // Makes input height smaller
        />
      </fieldset>

      <Box sx={{ display: "flex", gap: 4 }}>
        <fieldset
          style={{
            border: "none",
            margin: 0,
            padding: 0,
            flex: "0 1 40%",
            marginBottom: "12px",
          }}
        >
          <TextField
            required
            name="primarySpecialty"
            label="Primary Specialty"
            variant="outlined"
            InputLabelProps={{
              shrink: true, // Always show label like a "legend"
            }}
            value={formData.primarySpecialty || ""}
            onChange={handleChange}
            style={{
              width: "100%", // Logo takes 80% of the page width
              objectFit: "contain",
            }}
            size="small" // Makes input height smaller
          />
        </fieldset>

        <fieldset
          style={{
            border: "none",
            margin: 0,
            padding: 0,
            flex: 1,
            marginBottom: "12px",
          }}
        >
          <TextField
            required
            type="number"
            name="yearsOfExperience"
            label="Years of Experience"
            variant="outlined"
            InputLabelProps={{
              shrink: true, // Always show label like a "legend"
            }}
            value={formData.yearsOfExperience || ""}
            onChange={handleChange}
            style={{
              width: "70%", // Logo takes 80% of the page width
              objectFit: "contain",
            }}
            size="small" // Makes input height smaller
          />
        </fieldset>
      </Box>

      <fieldset
        style={{ border: "none", margin: 0, padding: 0, marginBottom: "12px" }}
      >
        <TextField
          name="secondarySpecialty"
          label="Secondary Specialty"
          variant="outlined"
          InputLabelProps={{
            shrink: true, // Always show label like a "legend"
          }}
          value={formData.secondarySpecialty || ""}
          onChange={handleChange}
          style={{
            width: "40%", // Logo takes 80% of the page width
            objectFit: "contain",
          }}
          size="small"
        />
      </fieldset>

      <header>
        <img
          src={educationLogo}
          alt="Logo"
          style={{
            marginBottom: "17px",
            paddingLeft: 20,
            width: "135%", // Logo takes 80% of the page width
            objectFit: "contain", // Ensure the logo maintains its aspect ratio
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      </header>

      {/* Add Education Button (Hidden when form is open) */}
      {!showEducationFields && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowEducationFields(true)}
          style={{ width: "40%", marginBottom: "10px" }}
        >
          <img
            src={Add}
            alt="Add"
            width={"18px"}
            style={{ marginRight: "8px" }}
          />
          Add Education
        </Button>
      )}

      {/* Additional Education Fields (Only visible when form is open) */}
      {showEducationFields && (
        <>
          <Grid container spacing={6} sx={{ width: "130%" }}>
            {[
              "school",
              "city",
              "state",
              "degree",
              "graduationDate",
              "nameOnDegree",
              "country",
            ].map((field, idx) => (
              <Grid item xs={12} md={4} key={idx} paddingRight={6}>
                <TextField
                  required
                  name={field}
                  label={
                    field === "graduationDate"
                      ? "Graduation Date"
                      : field === "nameOnDegree"
                      ? "Name on Degree"
                      : field.charAt(0).toUpperCase() + field.slice(1)
                  }
                  variant="outlined"
                  value={formData[field]}
                  onChange={handleChange}
                  style={{
                    width: "110%", // Logo takes 80% of the page width
                    objectFit: "contain",
                  }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                  type={field === "graduationDate" ? "date" : "text"} // Set type to date for graduationDate
                />
              </Grid>
            ))}
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
                marginLeft: "55%",
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
        </>
      )}

      {/* Education Table */}
      {/* Education Table */}
      {education.length > 0 && (
        <TableContainer
          component={Paper}
          sx={{
            marginTop: 5,
            width: "140%",
            maxWidth: "1200px",
            marginX: "auto",
            overflowX: "auto",
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                {[
                  "Status",
                  "Degree",
                  "City",
                  "State/Province",
                  "School",
                  "Action",
                ].map((label) => (
                  <TableCell
                    key={label}
                    sx={{ width: "16.6%", backgroundColor: "#89CFF0" }}
                  >
                    <b>{label}</b>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {education.map((edu, index) => {
                const isIncomplete = [
                  edu.degree,
                  edu.city,
                  edu.state,
                  edu.school,
                ].some((val) => !val);

                return (
                  <TableRow
                    key={index}
                    sx={{
                      // backgroundColor: isIncomplete ? "#ffe0e0" : "white",
                      backgroundColor: "white",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: isIncomplete ? "red" : "green",
                      }}
                    >
                      {isIncomplete ? "Incomplete" : "Complete"}
                    </TableCell>
                    <TableCell>{edu.degree || "-"}</TableCell>
                    <TableCell>{edu.city || "-"}</TableCell>
                    <TableCell>{edu.state || "-"}</TableCell>
                    <TableCell>{edu.school || "-"}</TableCell>
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
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Buttons for Back and Next */}
      <Box sx={{ display: "flex", gap: 2, marginTop: 3 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleBack} // This will navigate back to the previous page
          style={{
            padding: "5px 18px",
            fontSize: "12px",
            borderRadius: "10px",
            marginLeft: "3%",
          }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleNext} // This will save the data and navigate to the next page
          style={{
            padding: "5px 18px",
            fontSize: "12px",
            borderRadius: "10px",
            marginLeft: "117%", // Adds space between the paragraph and the button
          }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default Education;

// primaryWorkType, primarySpecialty, yearsOfExperience, secondarySpecialty, school, city, state, degree, graduationDate, nameOnDegree, country
