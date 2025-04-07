import { useState } from "react";
import { useDispatch } from "react-redux";
import { setResumeData } from "../redux/slices/resumeSlice";
import { useNavigate } from "react-router-dom"; // For navigation
import { CircularProgress } from "@mui/material"; // Material UI Loader
import styles from "../styles/Home.module.css";
import { FaCloudUploadAlt } from "react-icons/fa";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook for navigation
  const [loading, setLoading] = useState(false); // tracks whether file upload is in progress.

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true); // Show loader when upload starts

    try {
      const response = await fetch("http://localhost:5000/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();

      // Save userId in sessionStorage
      if (data.user?.id) {
        sessionStorage.setItem("userId", data.user.id);
      }

      dispatch(setResumeData(data.parsedData)); // Save parsed resume data

      // Wait seconds, then redirect
      setTimeout(() => {
        setLoading(false);
        navigate("/profile/basic-info");
      }, 1000);
    } catch (error) {
      console.error("Error uploading resume:", error);
      setLoading(false); // Hide loader if there's an error
    }
  };

  return (
    <div className={styles.container}>
      <h2>Upload Your Resume</h2>

      {loading ? ( // Show loader when loading is true
        <div className={styles.loaderContainer}>
          <CircularProgress />
          <p>Processing your resume...</p>
        </div>
      ) : (
        <div className={styles.uploadContainer}>
          <label htmlFor="fileInput">
            <FaCloudUploadAlt className={styles.uploadIcon} />
            <p>Click to Upload Resume</p>
          </label>
          <input type="file" id="fileInput" onChange={handleUpload} />
        </div>
      )}
    </div>
  );
};

export default Home;

// import { useDispatch } from "react-redux";
// import { setResumeData } from "../redux/slices/resumeSlice";
// import styles from "../styles/Home.module.css";
// import { FaCloudUploadAlt } from "react-icons/fa";

// const Home = () => {
//   const dispatch = useDispatch();

//   const handleUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("resume", file);

//     try {
//       const response = await fetch("http://localhost:5000/api/resume/upload", {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) throw new Error("Upload failed");

//       const data = await response.json();

//       // ✅ Save userId in sessionStorage
//       if (data.user?.id) {
//         sessionStorage.setItem("userId", data.user.id);
//       }

//       dispatch(setResumeData(data.parsedData)); // ✅ Save parsed resume data
//     } catch (error) {
//       console.error("Error uploading resume:", error);
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <h2>Upload Your Resume</h2>
//       <div className={styles.uploadContainer}>
//         <label htmlFor="fileInput">
//           <FaCloudUploadAlt className={styles.uploadIcon} />
//           <p>Click to Upload Resume</p>
//         </label>
//         <input type="file" id="fileInput" onChange={handleUpload} />
//       </div>
//     </div>
//   );
// };

// export default Home;
