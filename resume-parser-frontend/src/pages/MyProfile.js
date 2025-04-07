import { Link, Outlet } from "react-router-dom";
import styles from "../styles/MyProfile.module.css";
import userIcon from "../assets/Basic Info.png";
import Education from "../assets/Education.png";
import WorkExperience from "../assets/WorkExperience.png";
import { useState, useEffect } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const MyProfile = () => {
  const [progress, setProgress] = useState(0);
  const [profile, setProfile] = useState(null);

  // Get `userId` dynamically from sessionStorage
  const userId = sessionStorage.getItem("userId");

  // Fetch profile data from the backend

  useEffect(() => {
    if (!userId || userId.length !== 36) {
      console.warn("Invalid user ID. Profile will not be fetched.");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/profile/${userId}` // makes a get request
        );
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [userId]); // This effect re-runs only when userId changes.

  useEffect(() => {
    const updateProgress = () => {
      const basicInfoCompleted =
        sessionStorage.getItem("basicInfoCompleted") === "true"; // "true", means the user has completed this section,
      const educationCompleted =
        sessionStorage.getItem("educationCompleted") === "true";
      const experienceCompleted =
        sessionStorage.getItem("experienceCompleted") === "true";

      let newProgress = 0;
      if (basicInfoCompleted) newProgress += 33;
      if (educationCompleted) newProgress += 33;
      if (experienceCompleted) newProgress += 34; // Adjusted for 100% total

      console.log("New Progress:", newProgress);

      setProgress(newProgress);
    };

    // Call initially
    updateProgress();

    // Listen for custom progress update event
    window.addEventListener("progressUpdated", updateProgress); // When progressUpdated event is fired (new Event("progressUpdated")), the updateProgress function will be triggered automatically.

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("progressUpdated", updateProgress); // need to be removed otherwise it would still be active
    };
  }, []);

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <ul>
          <br />
          <li className={styles.head}>My Profile</li>
          <br />
          <li>
            <Link to="basic-info" className={styles.link}>
              <img src={userIcon} alt="User Icon" className={styles.icon} />
              Basic Information
            </Link>
          </li>
          <li>
            <Link to="education" className={styles.link}>
              <img src={Education} alt="Education" className={styles.icon} />
              Specialties & Education
            </Link>
          </li>
          <li>
            <Link to="experience" className={styles.link}>
              <img
                src={WorkExperience}
                alt="WorkExperience"
                className={styles.icon}
              />
              Experience
            </Link>
          </li>
          <br />
          <li>
            <div
              style={{
                width: 120,
                height: 120,
                margin: "20px",
                position: "relative",
              }}
            >
              <CircularProgressbar
                value={progress} // Use the dynamic progress value
                text={`${progress}%`} // Display the percentage on the circle
                styles={{
                  root: {
                    position: "relative",
                  },
                  path: {
                    stroke: "#036", // Progress color (you can change this)
                    strokeLinecap: "round", // Rounded ends for the stroke
                    transition: "stroke-dasharray 0.5s ease 0s", // Smooth transition
                  },
                  trail: {
                    stroke: "#e0e0e0", // Light gray trail color
                    strokeLinecap: "round", // Rounded ends for the trail
                  },
                  text: {
                    fill: "#ff0000", // Red color for the percentage text
                    fontSize: "18px", // Larger font size for better visibility
                    fontWeight: "bold",
                    dominantBaseline: "middle", // Vertically center the text
                    textAnchor: "middle", // Horizontally center the text
                  },
                  background: {
                    fill: "transparent", // No background color for the circle
                  },
                }}
              />
            </div>
          </li>
        </ul>
      </nav>
      <main className={styles.content}>
        {profile ? (
          <div>
            <h3>
              Welcome, {profile.firstName} {profile.lastName}!
            </h3>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}
        {/* This Outlet will render the content dynamically based on the routes */}
        <Outlet />
      </main>
    </div>
  );
};

export default MyProfile;
