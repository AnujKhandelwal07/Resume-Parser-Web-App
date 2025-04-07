const prisma = require("../config/db");
const fs = require("fs");
const fsPromises = require("fs/promises"); // Async operations
const axios = require("axios");
const FormData = require("form-data");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const uploadDir = "uploads";
    await fsPromises.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(
      uploadDir,
      `${Date.now()}-${req.file.originalname}`
    );
    await fsPromises.writeFile(filePath, req.file.buffer);

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const flaskApiUrl = "http://127.0.0.1:5001/parse-resume";
    const response = await axios.post(flaskApiUrl, formData, {
      headers: formData.getHeaders(),
    });

    if (!response.data || !response.data.output) {
      throw new Error("Invalid response from resume parser.");
    }

    const parsedData = response.data.output;
    console.log("Parsed Resume Data:", parsedData);

    let phoneNumber = parsedData.contact_number;
    if (Array.isArray(phoneNumber)) {
      phoneNumber = phoneNumber.join(", "); // this line converts it into a single string
    }

    // Ensure `whatShiftsCanYouWork` is stored correctly
    let shifts = parsedData.whatShiftsCanYouWork || [];
    if (!Array.isArray(shifts)) {
      shifts = [shifts]; // Convert single value to an array
    }

    // Filter out invalid values
    const validShifts = shifts.filter(
      (shift) => ["MORNING", "MID", "NIGHT"].includes(shift) // This line filters the shifts array to only include valid shifts.
    );

    let user = await prisma.user.findUnique({
      where: { email: parsedData.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: uuidv4(),
          firstName: parsedData.name?.split(" ")[0] || "",
          lastName: parsedData.name?.split(" ")[1] || "",
          email: parsedData.email || `unknown-${uuidv4()}@example.com`,
          phoneNumber: phoneNumber || null,
          howSoonCanYouStart: new Date().toISOString(),
          whatShiftsCanYouWork: validShifts.length ? validShifts : ["MORNING"],
        },
      });
    }

    // Remove education database insertion, just send parsed data to frontend
    res.status(200).json({
      message: "Resume uploaded and parsed successfully",
      parsedData,
      user,
    });

    if (fs.existsSync(filePath)) {
      await fsPromises.unlink(filePath);
    }
  } catch (error) {
    console.error(" Error uploading and parsing resume:", error);

    if (typeof filePath !== "undefined" && fs.existsSync(filePath)) {
      try {
        await fsPromises.unlink(filePath);
      } catch (unlinkError) {
        console.error(" Failed to delete temporary file:", unlinkError);
      }
    }

    res
      .status(500)
      .json({ error: "Failed to process resume", details: error.message });
  }
};

// exports.uploadResume = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//     const uploadDir = "uploads";
//     await fsPromises.mkdir(uploadDir, { recursive: true });

//     const filePath = path.join(
//       uploadDir,
//       `${Date.now()}-${req.file.originalname}`
//     );
//     await fsPromises.writeFile(filePath, req.file.buffer);

//     const formData = new FormData();
//     formData.append("file", fs.createReadStream(filePath));

//     const flaskApiUrl = "http://127.0.0.1:5001/parse-resume";
//     const response = await axios.post(flaskApiUrl, formData, {
//       headers: formData.getHeaders(),
//     });

//     if (!response.data || !response.data.output) {
//       throw new Error("Invalid response from resume parser.");
//     }

//     const parsedData = response.data.output;
//     console.log("📜 Parsed Resume Data:", parsedData);

//     let phoneNumber = parsedData.contact_number;
//     if (Array.isArray(phoneNumber)) {
//       phoneNumber = phoneNumber.join(", ");
//     }

//     let user = await prisma.user.findUnique({
//       where: { email: parsedData.email },
//     });

//     if (!user) {
//       user = await prisma.user.create({
//         data: {
//           id: uuidv4(),
//           firstName: parsedData.name?.split(" ")[0] || "Unknown",
//           lastName: parsedData.name?.split(" ")[1] || "Unknown",
//           email: parsedData.email || `unknown-${uuidv4()}@example.com`,
//           phoneNumber: phoneNumber || null,
//         },
//       });
//     }

//     const userId = user.id;

//     // ✅ Fix: Convert `education` string into an array of objects
//     const educationData =
//       typeof parsedData.education === "string"
//         ? parsedData.education
//             .split("\n") // Split by new lines
//             .map((edu) => edu.trim()) // Trim spaces
//             .filter((edu) => edu) // Remove empty lines
//             .map((edu) => {
//               const parts = edu.match(/(.+?)\s(\d{4} - \d{4})\s(.+)/); // Extract name, years, and score
//               return parts
//                 ? {
//                     school: parts[1] || "Unknown School",
//                     degree: parts[3] || "Unknown Degree",
//                     graduationDate: parts[2]
//                       ? new Date(parts[2].split(" - ")[1])
//                       : null,
//                     nameOnDegree: parsedData.name || "Unknown",
//                     country: "India",
//                     userId,
//                   }
//                 : null;
//             })
//             .filter(Boolean) // Remove null values
//         : [];

//     if (educationData.length > 0) {
//       await prisma.education.createMany({
//         data: educationData,
//         skipDuplicates: true,
//       });
//     }

//     res.status(200).json({
//       message: "Resume uploaded and parsed successfully",
//       parsedData,
//       user,
//     });

//     if (fs.existsSync(filePath)) {
//       await fsPromises.unlink(filePath);
//     }
//   } catch (error) {
//     console.error("❌ Error uploading and parsing resume:", error);

//     if (typeof filePath !== "undefined" && fs.existsSync(filePath)) {
//       try {
//         await fsPromises.unlink(filePath);
//       } catch (unlinkError) {
//         console.error("⚠️ Failed to delete temporary file:", unlinkError);
//       }
//     }

//     res
//       .status(500)
//       .json({ error: "Failed to process resume", details: error.message });
//   }
// };

// ---------------------------------------------------------------------

// const prisma = require("../config/db");
// const fs = require("fs");
// const axios = require("axios");
// const FormData = require("form-data");
// const { v4: uuidv4 } = require("uuid");

// exports.uploadResume = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//     // ✅ Ensure uploads directory exists
//     const uploadDir = "uploads";
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     // ✅ Save resume file to disk
//     const filePath = `${uploadDir}/${Date.now()}-${req.file.originalname}`;
//     fs.writeFileSync(filePath, req.file.buffer);

//     // ✅ Send resume to Flask API for parsing
//     const formData = new FormData();
//     formData.append("file", fs.createReadStream(filePath));

//     const flaskApiUrl = "http://127.0.0.1:5001/parse-resume";
//     const response = await axios.post(flaskApiUrl, formData, {
//       headers: formData.getHeaders(),
//     });

//     const parsedData = response.data.output;
//     console.log("📜 Parsed Resume Data:", parsedData);

//     // ✅ Ensure phoneNumber is stored as a string, not an array
//     let phoneNumber = parsedData.contact_number;
//     if (Array.isArray(phoneNumber)) {
//       phoneNumber = phoneNumber.join(", "); // Convert array to string
//     }

//     // ✅ Check if the user already exists based on email
//     let user = await prisma.user.findUnique({
//       where: { email: parsedData.email },
//     });

//     // ✅ Create new user if they don't exist
//     if (!user) {
//       user = await prisma.user.create({
//         data: {
//           id: uuidv4(),
//           firstName: parsedData.name?.split(" ")[0] || "Unknown",
//           lastName: parsedData.name?.split(" ")[1] || "Unknown",
//           email: parsedData.email || `unknown-${uuidv4()}@example.com`,
//           phoneNumber: phoneNumber || null, // ✅ Ensure this is a string or null
//         },
//       });
//     }

//     const userId = user.id;

//     // ✅ Insert education details
//     for (const edu of parsedData.education || []) {
//       // ✅ Check if an entry with the same school, degree, and user already exists
//       const existingEducation = await prisma.education.findFirst({
//         where: {
//           school: edu.university || "Unknown University",
//           degree: edu.degree || "Unknown Degree",
//           userId: userId, // Ensure it's linked to the same user
//         },
//       });

//       if (!existingEducation) {
//         await prisma.education.create({
//           data: {
//             school: edu.university || "Unknown University",
//             city:
//               edu.city && typeof edu.city === "string"
//                 ? edu.city
//                 : "Unknown City",
//             state:
//               edu.state && typeof edu.state === "string"
//                 ? edu.state
//                 : "Unknown State",
//             degree: edu.degree || "Unknown Degree",
//             graduationDate: edu.graduationDate
//               ? new Date(edu.graduationDate)
//               : new Date("1970-01-01"),
//             nameOnDegree: parsedData.name || "Unknown",
//             country: "USA",
//             user: {
//               connect: { id: userId },
//             },
//           },
//         });
//       } else {
//         console.log("⚠️ Duplicate education entry skipped:", existingEducation);
//       }
//     }

//     // ✅ Insert work experience details
//     for (const exp of parsedData.experience || []) {
//       // ✅ Check if an entry with the same company, profession, and user already exists
//       const existingExperience = await prisma.workExperience.findFirst({
//         where: {
//           facilityName: exp.company || "Unknown Company",
//           profession: exp.position || "Unknown Position",
//           userId: userId, // Ensure it's linked to the same user
//         },
//       });

//       if (!existingExperience) {
//         await prisma.workExperience.create({
//           data: {
//             facilityName: exp.company || "Unknown Company",
//             city:
//               exp.city && typeof exp.city === "string"
//                 ? exp.city
//                 : "Unknown City",
//             profession: exp.position || "Unknown Position",
//             specialty: "Software Development",
//             typeOfPosition: "Full-time",
//             shiftWorked: "Day",
//             user: {
//               connect: { id: userId },
//             },
//           },
//         });
//       } else {
//         console.log(
//           "⚠️ Duplicate work experience entry skipped:",
//           existingExperience
//         );
//       }
//     }

//     res.status(200).json({
//       message: "Resume uploaded and parsed successfully",
//       parsedData,
//       user,
//     });

//     // ✅ Delete temporary file
//     fs.unlinkSync(filePath);
//   } catch (error) {
//     console.error("❌ Error uploading and parsing resume:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to process resume", details: error.message });
//   }
// };
