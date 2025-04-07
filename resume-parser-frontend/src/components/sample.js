// Education.js

import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { setResumeData } from "../redux/slices/resumeSlice";
import specialities from "../assets/SpecialtiesBanner.49c26bfb.svg";

const Education = () => {
  const dispatch = useDispatch();
  const education = useSelector((state) => state.resume.education);

  const [newEducation, setNewEducation] = useState({
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

  const [showEducationFields, setShowEducationFields] = useState(false);

  const handleChange = (e) => {
    setNewEducation({ ...newEducation, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    dispatch(setResumeData({ education: [...education, newEducation] }));
    setNewEducation({
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
    setShowEducationFields(false);
  };

  return (
    <Box
      component="form"
      sx={{
        width: "70%", // Balanced width
        "& .MuiTextField-root": { m: 1, width: "40ch" },
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: "800px",
        margin: "auto",
        padding: 3,
      }}
      noValidate
      autoComplete="off"
    >
      <header>
        <img src={specialities} alt="Logo" />
      </header>

      {/* Primary Details */}
      <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
        <TextField
          required
          name="primaryWorkType"
          label="Primary Type of Work"
          variant="outlined"
          focused
          value={newEducation.primaryWorkType}
          onChange={handleChange}
          sx={{
            "&:hover .MuiOutlinedInput-root": {
              borderColor: "blue",
            },
          }}
        />
      </fieldset>

      <Box sx={{ display: "flex", gap: 2 }}>
        <fieldset style={{ border: "none", margin: 0, padding: 0, flex: 1 }}>
          <TextField
            name="primarySpecialty"
            label="Primary Specialty"
            variant="outlined"
            focused
            value={newEducation.primarySpecialty}
            onChange={handleChange}
          />
        </fieldset>

        <fieldset style={{ border: "none", margin: 0, padding: 0, flex: 1 }}>
          <TextField
            required
            type="number"
            name="yearsOfExperience"
            label="Years of Experience"
            variant="outlined"
            focused
            value={newEducation.yearsOfExperience}
            onChange={handleChange}
          />
        </fieldset>
      </Box>

      <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
        <TextField
          name="secondarySpecialty"
          label="Secondary Specialty"
          variant="outlined"
          focused
          value={newEducation.secondarySpecialty}
          onChange={handleChange}
        />
      </fieldset>

      {/* Button to Show Additional Education Fields */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowEducationFields(true)}
      >
        Add Education
      </Button>

      {/* Additional Education Fields */}
      {showEducationFields && (
        <>
          <TextField
            required
            name="school"
            label="Healthcare/Vocational School"
            variant="outlined"
            value={newEducation.school}
            onChange={handleChange}
          />
          <TextField
            required
            name="city"
            label="City"
            variant="outlined"
            value={newEducation.city}
            onChange={handleChange}
          />
          <TextField
            required
            name="state"
            label="State"
            variant="outlined"
            value={newEducation.state}
            onChange={handleChange}
          />
          <TextField
            required
            name="degree"
            label="Degree"
            variant="outlined"
            value={newEducation.degree}
            onChange={handleChange}
          />
          <TextField
            required
            type="date"
            name="graduationDate"
            label="Graduation Date"
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            value={newEducation.graduationDate}
            onChange={handleChange}
          />
          <TextField
            required
            name="nameOnDegree"
            label="Name on Degree/Certification"
            variant="outlined"
            value={newEducation.nameOnDegree}
            onChange={handleChange}
          />
          <TextField
            required
            name="country"
            label="Country of Training"
            variant="outlined"
            value={newEducation.country}
            onChange={handleChange}
          />

          <Button variant="contained" color="success" onClick={handleSave}>
            Save
          </Button>
        </>
      )}
    </Box>
  );
};

export default Education;
