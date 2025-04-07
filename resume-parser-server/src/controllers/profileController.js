const prisma = require("../config/db");

exports.createProfile = async (req, res) => {
  try {
    console.log(" Received Request Body:", req.body);

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      howSoonCanYouStart,
      whatShiftsCanYouWork,
      address,
      emergencyContact,
      education,
      workExperience,
      specialties,
    } = req.body;

    if (!firstName || !lastName || !email) {
      return res
        .status(400)
        .json({ error: "First name, last name, and email are required" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists." });
    }

    // Create User with Address, Emergency Contact, Education, Work Experience, and Specialties
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          phoneNumber,
          dateOfBirth,
          howSoonCanYouStart,
          whatShiftsCanYouWork,
        },
      });

      if (address) {
        await tx.address.create({ data: { ...address, userId: user.id } });
      }

      if (emergencyContact) {
        await tx.emergencyContact.create({
          data: { ...emergencyContact, userId: user.id },
        });
      }

      if (education?.length > 0) {
        await tx.education.createMany({
          data: education.map((edu) => ({
            ...edu,
            userId: user.id,
            graduationDate: parseInt(edu.graduationDate), // Ensure it's stored as an integer
          })),
        });
      }

      if (workExperience?.length > 0) {
        await tx.workExperience.createMany({
          data: workExperience.map((exp) => ({ ...exp, userId: user.id })),
        });
      }

      if (specialties?.length > 0) {
        await tx.specialty.createMany({
          data: specialties.map((spec) => ({ ...spec, userId: user.id })),
        });
      }

      return user;
    });

    res.status(201).json({ message: "Profile created successfully", newUser });
  } catch (error) {
    console.error(" Error creating user profile:", error);
    res
      .status(500)
      .json({ error: "Error creating profile", details: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.userId.trim();
    console.log(" Fetching profile for userId:", userId);

    if (!userId) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const profile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        address: true,
        emergencyContact: true,
        education: true,
        workExperience: true,
        specialties: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    if (profile.phoneNumber === "Not Found") {
      profile.phoneNumber = "";
    }

    res.json(profile);
  } catch (error) {
    console.error(" Error fetching profile:", error);
    res
      .status(500)
      .json({ error: "Error fetching profile", details: error.message });
  }
};

// exports.updateProfile = async (req, res) => {
//   try {
//     const userId = req.params.userId.trim();
//     console.log(" Updating profile for userId:", userId);

//     if (!userId) {
//       return res.status(400).json({ error: "User ID is required." });
//     }

//     const userExists = await prisma.user.findUnique({ where: { id: userId } });
//     if (!userExists) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const {
//       firstName,
//       lastName,
//       email,
//       phoneNumber,
//       dateOfBirth,
//       howSoonCanYouStart,
//       whatShiftsCanYouWork,
//       address,
//       emergencyContact,
//       education,
//       workExperience,
//       specialties,
//     } = req.body;

//     let updateOperations = []; // Creates an array to store db updated queries

//     // Only update fields that are provided
//     const updateUserData = {};
//     if (firstName) updateUserData.firstName = firstName;
//     if (lastName) updateUserData.lastName = lastName;
//     if (email) updateUserData.email = email;
//     if (phoneNumber) updateUserData.phoneNumber = phoneNumber;
//     if (dateOfBirth) updateUserData.dateOfBirth = dateOfBirth;
//     if (howSoonCanYouStart)
//       updateUserData.howSoonCanYouStart = howSoonCanYouStart;
//     if (whatShiftsCanYouWork)
//       updateUserData.whatShiftsCanYouWork = whatShiftsCanYouWork;

//     if (Object.keys(updateUserData).length > 0) {
//       updateOperations.push(
//         prisma.user.update({
//           where: { id: userId },
//           data: updateUserData,
//         })
//       );
//     }

//     if (address) {
//       updateOperations.push(
//         prisma.address.upsert({
//           where: { userId },
//           create: { ...address, userId },
//           update: { ...address },
//         })
//       );
//     }

//     if (emergencyContact) {
//       updateOperations.push(
//         prisma.emergencyContact.upsert({
//           where: { userId },
//           create: { ...emergencyContact, userId },
//           update: { ...emergencyContact },
//         })
//       );
//     }

//     // Ensure `education` is an array and delete previous records
//     if (Array.isArray(education) && education.length > 0) {
//       await prisma.education.deleteMany({ where: { userId } });

//       updateOperations.push(
//         prisma.education.createMany({
//           data: education.map((edu) => ({
//             school: edu.school || null,
//             city: edu.city || null,
//             state: edu.state || null,
//             degree: edu.degree || null,
//             graduationDate: edu.graduationDate
//               ? parseInt(edu.graduationDate)
//               : null,
//             nameOnDegree: edu.nameOnDegree || null,
//             country: edu.country || null,
//             userId: userId, // Ensure userId is included
//           })),
//           skipDuplicates: true, // Prevent duplicate inserts
//         })
//       );
//     }

//     if (Array.isArray(workExperience) && workExperience.length > 0) {
//       await prisma.workExperience.deleteMany({ where: { userId } });

//       updateOperations.push(
//         prisma.workExperience.createMany({
//           data: workExperience.map((exp) => ({
//             facilityName: exp.facilityName || null,
//             city: exp.city || null,
//             profession: exp.profession || null,
//             specialty: exp.specialty || null,
//             typeOfPosition: exp.typeOfPosition || "default", // ✅ Ensure this field exists
//             shiftWorked: exp.shiftWorked || null,
//             userId,
//           })),
//         })
//       );
//     }

//     if (Array.isArray(specialties) && specialties.length > 0) {
//       await prisma.specialty.deleteMany({ where: { userId } });

//       updateOperations.push(
//         prisma.specialty.createMany({
//           data: specialties.map((spec) => ({
//             ...spec,
//             userId,
//           })),
//           skipDuplicates: true,
//         })
//       );
//     }

//     await prisma.$transaction(updateOperations);

//     res.json({ message: "Profile updated successfully" });
//   } catch (error) {
//     console.error(" Error updating profile:", error);
//     res
//       .status(500)
//       .json({ error: "Error updating profile", details: error.message });
//   }
// };

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId.trim();
    console.log(" Updating profile for userId:", userId);

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      howSoonCanYouStart,
      whatShiftsCanYouWork,
      address,
      emergencyContact,
      education,
      workExperience,
      specialties,
    } = req.body;

    let updateOperations = []; // Creates an array to store db updated queries

    // Only update fields that are provided
    const updateUserData = {};
    if (firstName) updateUserData.firstName = firstName;
    if (lastName) updateUserData.lastName = lastName;
    if (email) updateUserData.email = email;
    // if (phoneNumber) updateUserData.phoneNumber = phoneNumber;
    if (phoneNumber && phoneNumber !== "Not Found") {
      updateUserData.phoneNumber = phoneNumber;
    } else {
      updateUserData.phoneNumber = ""; // or null, depending on DB schema
    }
    if (dateOfBirth) updateUserData.dateOfBirth = dateOfBirth;
    if (howSoonCanYouStart)
      updateUserData.howSoonCanYouStart = howSoonCanYouStart;
    if (whatShiftsCanYouWork)
      updateUserData.whatShiftsCanYouWork = whatShiftsCanYouWork;

    if (Object.keys(updateUserData).length > 0) {
      updateOperations.push(
        prisma.user.update({
          where: { id: userId },
          data: updateUserData,
        })
      );
    }

    if (address) {
      updateOperations.push(
        prisma.address.upsert({
          where: { userId },
          create: { ...address, userId },
          update: { ...address },
        })
      );
    }

    if (emergencyContact) {
      updateOperations.push(
        prisma.emergencyContact.upsert({
          where: { userId },
          create: { ...emergencyContact, userId },
          update: { ...emergencyContact },
        })
      );
    }

    // Ensure `education` is an array and delete previous records
    if (Array.isArray(education) && education.length > 0) {
      await prisma.education.deleteMany({ where: { userId } });

      updateOperations.push(
        prisma.education.createMany({
          data: education.map((edu) => ({
            school: edu.school || null,
            city: edu.city || null,
            state: edu.state || null,
            degree: edu.degree || null,
            graduationDate: edu.graduationDate
              ? parseInt(edu.graduationDate)
              : null,
            nameOnDegree: edu.nameOnDegree || null,
            country: edu.country || null,
            userId: userId, // Ensure userId is included
          })),
          skipDuplicates: true, // Prevent duplicate inserts
        })
      );
    }

    if (Array.isArray(workExperience) && workExperience.length > 0) {
      await prisma.workExperience.deleteMany({ where: { userId } });

      updateOperations.push(
        prisma.workExperience.createMany({
          data: workExperience.map((exp) => ({
            companyName: exp.companyName || null,
            city: exp.city || null,
            profession: exp.profession || null,
            specialty: exp.specialty || null,
            role: exp.role || "default", // Ensure this field exists
            shiftWorked: exp.shiftWorked || null,
            userId,
          })),
        })
      );
    }

    if (Array.isArray(specialties) && specialties.length > 0) {
      await prisma.specialty.deleteMany({ where: { userId } });

      updateOperations.push(
        prisma.specialty.createMany({
          data: specialties.map((spec) => ({
            primaryWorkType: spec.primaryWorkType,
            primarySpecialty: spec.primarySpecialty,
            yearsOfExperience: spec.yearsOfExperience,
            secondarySpecialty: spec.secondarySpecialty || null,
            userId,
          })),
          skipDuplicates: true,
        })
      );
    }

    await prisma.$transaction(updateOperations);

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(" Error updating profile:", error);
    res
      .status(500)
      .json({ error: "Error updating profile", details: error.message });
  }
};
