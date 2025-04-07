import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TextField, Button, ButtonGroup, FormLabel } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { setBasicInformation } from "../redux/slices/resumeSlice";
import styles from "../styles/BasicInformation.module.css";
import logo from "../assets/Basic-info.svg";
import preferencesLogo from "../assets/YourPreferences.91026981.svg";

const BasicInformation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = sessionStorage.getItem("userId"); // Fetch from sessionStorage
  console.log("Fetching profile for userId:", userId);

  // Load data from Redux state or sessionStorage
  const basicInfoFromRedux = useSelector(
    (state) => state.resume.basicInformation
  );

  // Fetch parsed resume data from Redux
  const parsedData = useSelector((state) => state.resume.parsedData);

  const today = new Date().toISOString().split("T")[0]; // Gets today’s date in YYYY-MM-DD format.

  // Fetch profile from backend when component mounts (if no session data exists)

  const [formData, setFormData] = useState(() => {
    const savedData = sessionStorage.getItem("formData");
    const parsedSavedData = savedData ? JSON.parse(savedData) : null;

    return parsedSavedData
      ? {
          ...parsedSavedData,
          shifts: Array.isArray(parsedSavedData.shifts)
            ? parsedSavedData.shifts
            : [],
        } // Load sessionStorage first
      : basicInfoFromRedux && Object.keys(basicInfoFromRedux).length > 0
      ? { ...basicInfoFromRedux, shifts: basicInfoFromRedux.shifts || [] }
      : {
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          dob: "",
          street: "",
          apt: "",
          city: "",
          state: "",
          zip: "",
          country: "",
          emergencyName: "",
          emergencyPhone: "",
          emergencyRelation: "",
          startDate: "",
          shifts: [],
        };
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        console.warn("No userId found in sessionStorage!");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/profile/${userId}` // Sends a GET request
        );
        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();

        // merging existing data (prevData) with newly fetched data(data)
        setFormData((prevData) => ({
          ...prevData,
          ...data,
          shifts: data.shifts || prevData.shifts || [], // Preserve existing shifts
        }));

        sessionStorage.setItem(
          "formData",
          JSON.stringify({ ...data, shifts: data.shifts || [] })
        );
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (
      !sessionStorage.getItem("formData") &&
      Object.keys(basicInfoFromRedux).length === 0
    ) {
      fetchProfile();
    }
  }, [userId, dispatch, basicInfoFromRedux]); // Runs when any of these changes

  useEffect(() => {
    window.dispatchEvent(new Event("progressUpdated"));
  }, []);

  useEffect(() => {
    if (parsedData && Object.keys(parsedData).length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        ...Object.fromEntries(
          Object.entries(parsedData).filter(([key, value]) => !prevData[key]) // new fields from parsedData are added to prevData
        ), // Only update empty fields
        shifts: parsedData.shifts || prevData.shifts || [], // Keep shifts intact
      }));
    }
  }, [parsedData]);

  // Debugging: Log Redux updates
  useEffect(() => {
    console.log("Redux parsedData updated:", parsedData);
  }, [parsedData]); // Logs when Redux data changes

  // Handle shift selection toggle

  const handleChange = (e) => {
    const { name, value } = e.target; // name refers to the name attribute // value refers to the new value
    if (
      ["phoneNumber", "zip", "emergencyPhone"].includes(name) &&
      !/^\d*$/.test(value) //  prevents the user from entering non-numeric characters
    )
      return;

    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    dispatch(setBasicInformation(updatedData)); // Update Redux
    sessionStorage.setItem("formData", JSON.stringify(updatedData));
  };

  const handleShiftChange = (shift) => {
    const shiftMapping = {
      Day: "MORNING",
      Mid: "MID",
      Night: "NIGHT",
    };

    const prismaShift = shiftMapping[shift];

    setFormData((prevData) => {
      if (!prevData) return {}; // Prevents crashing if prevData is undefined

      const updatedShifts = Array.isArray(prevData.shifts)
        ? prevData.shifts
        : []; // Ensure shifts is always an array

      const newShifts = updatedShifts.includes(prismaShift)
        ? updatedShifts.filter((s) => s !== prismaShift)
        : [...updatedShifts, prismaShift]; // it adds the shift if it’s not already selected

      const updatedData = { ...prevData, shifts: newShifts };

      sessionStorage.setItem("formData", JSON.stringify(updatedData));
      return updatedData;
    });
  };

  const renderField = (label, key, type = "text") => (
    <fieldset
      style={{ border: "none", margin: 10, padding: 10, marginBottom: "12px" }}
    >
      <TextField
        required
        name={key}
        label={label}
        type={type}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        value={formData[key]}
        onChange={handleChange}
        style={{ width: "80%", objectFit: "contain" }}
        size="small"
      />
    </fieldset>
  );

  // Function to validate if all required fields are filled
  const validateFields = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "dob",
      "street",
      "apt",
      "city",
      "state",
      "zip",
      "country",
      "emergencyName",
      "emergencyPhone",
      "emergencyRelation",
      "startDate",
      "shifts",
    ];

    for (let field of requiredFields) {
      if (
        !formData[field] ||
        (field === "shifts" && formData.shifts.length === 0)
      ) {
        alert(`Please fill out the "${field}" field.`);
        return false;
      }
    }

    return true;
  };

  // Save updated profile to backend & navigate

  const handleSaveProfile = async () => {
    if (!validateFields()) return;

    try {
      const userId = sessionStorage.getItem("userId");
      if (!userId) {
        alert("User ID is missing. Please upload a resume first.");
        return;
      }

      const formattedDOB = formData.dob
        ? new Date(formData.dob).toISOString()
        : null;
      const formattedStartDate = formData.startDate
        ? new Date(formData.startDate).toISOString()
        : null;
      const validShifts = ["MORNING", "MID", "NIGHT"];
      const selectedShifts = formData.shifts.filter((shift) =>
        validShifts.includes(shift)
      ); // It checks that the shifts the user selected are valid

      const updatedProfile = {
        ...formData, // Preserve existing data
        dateOfBirth: formattedDOB,
        howSoonCanYouStart: formattedStartDate,
        whatShiftsCanYouWork: selectedShifts,
        address: {
          ...formData.address, // Preserve other address fields if any
          street: formData.street,
          apt: formData.apt,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zip,
          country: formData.country,
        },
        emergencyContact: {
          ...formData.emergencyContact, // Preserve other emergency fields if any
          emergencyContactName: formData.emergencyName,
          emergencyContactPhone: formData.emergencyPhone,
          emergencyContactRel: formData.emergencyRelation,
        },
      };

      const response = await fetch(
        `http://localhost:5000/api/profile/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProfile),
        }
      );

      if (!response.ok) throw new Error("Failed to update profile");

      dispatch(setBasicInformation(updatedProfile)); // Save to Redux
      sessionStorage.setItem("formData", JSON.stringify(updatedProfile)); // Save to sessionStorage

      sessionStorage.setItem("basicInfoCompleted", "true"); //  indicate profile completion.

      // Update Progress Bar
      window.dispatchEvent(new Event("progressUpdated"));

      navigate("/profile/education"); // Navigate **only after** saving data
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  return (
    <div>
      <header>
        <img
          src={logo}
          alt="Logo"
          style={{
            marginTop: "15px",
            marginBottom: "37px",
            paddingLeft: 20,
            width: "90%", // Logo takes 80% of the page width
            objectFit: "contain", // Ensure the logo maintains its aspect ratio
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      </header>

      <div>
        <div className={styles.infoGrid}>
          {renderField("First Name", "firstName")}
          {renderField("Last Name", "lastName")}
          {renderField("Email", "email")}
          <fieldset
            style={{
              border: "none",
              margin: 10,
              padding: 10,
              marginBottom: "12px",
            }}
          >
            <TextField
              required
              name="phoneNumber"
              label="Phone Number"
              type="text" // You can keep this for mobile-specific keyboard support
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={formData.phoneNumber}
              onChange={handleChange}
              style={{ width: "80%", objectFit: "contain" }}
              size="small"
              inputProps={{
                pattern: "[0-9]*", // Enforces numeric input
                inputMode: "numeric", // Ensures a numeric keypad on mobile devices
                maxLength: "10", // Optional: max length for the phone number (e.g., 10 digits)
              }}
              onInput={(e) => {
                // Only allow numeric input
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
            />
          </fieldset>

          {renderField("Date of Birth", "dob", "date")}
        </div>

        <h2 className={styles.sectionTitle}>What’s your permanent address? </h2>
        <div className={styles.infoGrid}>
          {renderField("Street", "street")}
          {renderField("Apartment", "apt")}
          {renderField("City", "city")}
          {renderField("State", "state")}
          {/* Zip Code Field with type="number" */}
          <fieldset
            style={{
              border: "none",
              margin: 10,
              padding: 10,
              marginBottom: "12px",
            }}
          >
            <TextField
              required
              name="zip"
              label="ZIP Code"
              type="text" // Use type="number" for Zip Code
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={formData.zip}
              onChange={handleChange}
              style={{ width: "80%", objectFit: "contain" }}
              size="small"
              inputProps={{
                pattern: "[0-9]*", // Ensures only numbers are entered
                inputMode: "numeric",
                maxLength: 6, // Ensures max 5 digits
              }}
            />
          </fieldset>
          {renderField("Country", "country")}
        </div>

        <h2 className={styles.sectionTitle}>Emergency Contact</h2>
        <div className={styles.infoGrid}>
          {renderField("Emergency Name", "emergencyName")}
          <fieldset
            style={{
              border: "none",
              margin: 10,
              padding: 10,
              marginBottom: "12px",
            }}
          >
            <TextField
              required
              name="emergencyPhone"
              label="Emergency Phone"
              type="text" // You can keep this for mobile-specific keyboard support
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={formData.emergencyPhone}
              onChange={handleChange}
              style={{ width: "80%", objectFit: "contain" }}
              size="small"
              inputProps={{
                pattern: "[0-9]*", // Enforces numeric input
                inputMode: "numeric", // Ensures a numeric keypad on mobile devices
                maxLength: 10, // Limits the input to 10 digits
              }}
              onInput={(e) => {
                // Only allow numeric input and limit to 10 digits
                let value = e.target.value.replace(/[^0-9]/g, "");
                if (value.length > 10) {
                  value = value.slice(0, 10); // Ensure max length of 10
                }
                e.target.value = value;
              }}
            />
          </fieldset>

          {/* {renderField("Emergency Phone", "emergencyPhone")} */}
          {renderField("Emergency Relation", "emergencyRelation")}
        </div>
      </div>

      <br></br>
      <br></br>
      <br></br>

      <header>
        <img
          src={preferencesLogo}
          alt="Logo"
          style={{
            paddingLeft: 20,
            width: "90%", // Logo takes 80% of the page width
            objectFit: "contain", // Ensure the logo maintains its aspect ratio
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "25px",
          }}
        />
      </header>

      <div
        className={styles.dateShiftRow}
        style={{ display: "flex", alignItems: "center" }}
      >
        {/* Date Field */}
        <fieldset
          style={{
            border: "none",
            margin: 0,
            padding: 0,
            marginBottom: "12px",
            flex: 1, // Ensures the date field takes up available space
          }}
        >
          <TextField
            required
            name="startDate"
            label="How soon can you start?"
            type="date"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={formData.startDate}
            onChange={handleChange}
            style={{ width: "45%", objectFit: "contain" }} // Adjust width to 100% for proper layout
            size="medium"
            inputProps={{ min: today }}
          />
        </fieldset>

        {/* Shift Field (Button Group) */}
        <div>
          <FormLabel
            style={{
              marginLeft: "3px",
              fontSize: "18px",
              marginBottom: "10px",
            }}
          >
            What shifts can you work?
          </FormLabel>
          <br /> <br />
          <ButtonGroup
            variant="contained"
            aria-label="Shift button group"
            style={{
              gap: "15px",
              border: "none", // Ensure no border around the ButtonGroup itself
              boxShadow: "none", // Remove any shadow from the group
            }}
          >
            <Button
              onClick={() => handleShiftChange("Day")}
              value="Day"
              // color={
              //   formData.shifts.includes("MORNING") ? "primary" : "secondary"
              // }
              color={
                Array.isArray(formData.shifts) &&
                formData.shifts.includes("MORNING")
                  ? "primary"
                  : "secondary"
              }
              disableElevation
              style={{
                backgroundColor: formData.shifts.includes("MORNING")
                  ? "#d32f2f"
                  : "#f0f0f0", // Light gray for non-selected
                color: formData.shifts.includes("MORNING") ? "white" : "#333", // Dark text for non-selected
                borderRadius: "20px",
                padding: "8px 16px", // Increased padding for larger buttons
                transition: "all 0.3s ease", // Smooth transition for color change
                boxShadow: formData.shifts.includes("MORNING")
                  ? "0px 4px 8px rgba(0,0,0,0.1)"
                  : "", // Subtle shadow when selected
                fontSize: "14px", // Slightly larger font size
                textTransform: "none", // Prevents uppercase transformation of text
                border: "none", // Remove any borders
                outline: "none", // Remove outline when the button is focused
                "&:hover": {
                  backgroundColor: formData.shifts.includes("MORNING")
                    ? "#c62828"
                    : "#e0e0e0", // Darker shade on hover
                  boxShadow: "0px 6px 12px rgba(0,0,0,0.1)", // Slightly bigger shadow on hover
                },
                "&:active": {
                  backgroundColor: formData.shifts.includes("MORNING")
                    ? "#c62828"
                    : "#e0e0e0", // Maintain same color on active state
                  boxShadow: "0px 4px 8px rgba(0,0,0,0.1)", // Reset shadow on active
                },
              }}
            >
              Day
            </Button>
            <Button
              onClick={() => handleShiftChange("Mid")}
              value="Mid"
              // color={formData.shifts.includes("MID") ? "primary" : "secondary"}
              color={
                Array.isArray(formData.shifts) &&
                formData.shifts.includes("MID")
                  ? "primary"
                  : "secondary"
              }
              disableElevation // Removes shadow/elevation from the button
              style={{
                backgroundColor: formData.shifts.includes("MID")
                  ? "#d32f2f"
                  : "#f0f0f0", // Light gray for non-selected
                color: formData.shifts.includes("MID") ? "white" : "#333", // Dark text for non-selected
                borderRadius: "20px", // More rounded corners
                padding: "8px 16px", // Increased padding for larger buttons
                transition: "all 0.3s ease", // Smooth transition for color change
                boxShadow: formData.shifts.includes("MID")
                  ? "0px 4px 8px rgba(0,0,0,0.1)"
                  : "", // Subtle shadow when selected
                fontSize: "14px", // Slightly larger font size
                textTransform: "none", // Prevents uppercase transformation of text
                border: "none", // Remove any borders
                outline: "none", // Remove outline when the button is focused
                "&:hover": {
                  backgroundColor: formData.shifts.includes("MID")
                    ? "#c62828"
                    : "#e0e0e0", // Darker shade on hover
                  boxShadow: "0px 6px 12px rgba(0,0,0,0.1)", // Slightly bigger shadow on hover
                },
                "&:active": {
                  backgroundColor: formData.shifts.includes("MID")
                    ? "#c62828"
                    : "#e0e0e0", // Maintain same color on active state
                  boxShadow: "0px 4px 8px rgba(0,0,0,0.1)", // Reset shadow on active
                },
              }}
            >
              Mid
            </Button>
            <Button
              onClick={() => handleShiftChange("Night")}
              value="NIGHT"
              // color={
              //   formData.shifts.includes("NIGHT") ? "primary" : "secondary"
              // }
              color={
                Array.isArray(formData.shifts) &&
                formData.shifts.includes("NIGHT")
                  ? "primary"
                  : "secondary"
              }
              disableElevation // Removes shadow/elevation from the button
              style={{
                backgroundColor: formData.shifts.includes("NIGHT")
                  ? "#d32f2f"
                  : "#f0f0f0", // Light gray for non-selected
                color: formData.shifts.includes("NIGHT") ? "white" : "#333", // Dark text for non-selected
                borderRadius: "20px", // More rounded corners
                padding: "8px 16px", // Increased padding for larger buttons
                transition: "all 0.3s ease", // Smooth transition for color change
                boxShadow: formData.shifts.includes("NIGHT")
                  ? "0px 4px 8px rgba(0,0,0,0.1)"
                  : "", // Subtle shadow when selected
                fontSize: "14px", // Slightly larger font size
                textTransform: "none", // Prevents uppercase transformation of text
                border: "none", // Remove any borders
                outline: "none", // Remove outline when the button is focused
                "&:hover": {
                  backgroundColor: formData.shifts.includes("NIGHT")
                    ? "#c62828"
                    : "#e0e0e0", // Darker shade on hover
                  boxShadow: "0px 6px 12px rgba(0,0,0,0.1)", // Slightly bigger shadow on hover
                },
                "&:active": {
                  backgroundColor: formData.shifts.includes("NIGHT")
                    ? "#c62828"
                    : "#e0e0e0", // Maintain same color on active state
                  boxShadow: "0px 4px 8px rgba(0,0,0,0.1)", // Reset shadow on active
                },
              }}
            >
              Night
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <br></br>
      <hr className={styles.divider} />

      <p className={styles.legalNotice}>
        For this type of employment, Kentucky state law requires a criminal
        record check as a condition of employment.
      </p>

      {/* Add Next button */}
      <Button
        variant="contained"
        color="error"
        onClick={handleSaveProfile}
        style={{
          padding: "5px 18px",
          fontSize: "12px",
          borderRadius: "10px",
          marginLeft: "90%", // Adds space between the paragraph and the button
        }}
      >
        Next
      </Button>
    </div>
  );
};

export default BasicInformation;
