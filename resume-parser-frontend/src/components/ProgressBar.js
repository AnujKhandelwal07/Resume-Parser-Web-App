import React, { useEffect, useState } from "react";
import { LinearProgress, Box } from "@mui/material";

const ProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Read flags from localStorage
    const basicInfoCompleted =
      localStorage.getItem("basicInfoCompleted") === "true";
    const educationCompleted =
      localStorage.getItem("educationCompleted") === "true";

    // Calculate progress
    let newProgress = 0;
    if (basicInfoCompleted) newProgress += 50;
    if (educationCompleted) newProgress += 50;

    setProgress(newProgress); // Update progress state
  }, []); // Empty dependency array ensures this runs once when the component mounts

  return (
    <Box sx={{ width: "100%" }}>
      <LinearProgress variant="determinate" value={progress} />
      <div>{progress}% Completed</div>
    </Box>
  );
};

export default ProgressBar;
