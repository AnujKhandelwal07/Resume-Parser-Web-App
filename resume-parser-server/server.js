const app = require("./src/app");
const prisma = require("./src/config/db");

const PORT = process.env.PORT || 5000;

// Validate Required Environment Variables
// ["DATABASE_URL"].forEach((key) => {
//   // checks if environment variable DATABASE_URL is defined.
//   if (!process.env[key]) {
//     console.error(` Missing environment variable: ${key}`);
//     process.exit(1);
//   }
// });

if (!process.env.DATABASE_URL) {
  console.error("Missing environment variable: DATABASE_URL");
  process.exit(1);
}

//  Graceful Shutdown Function
const gracefulShutdown = async () => {
  console.log(" Shutting down server...");
  await prisma.$disconnect();
  console.log(" Database disconnected.");
  process.exit(0);
};

//  Start Server with Database Connection
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log(" Connected to PostgreSQL database.");

    const server = app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });

    //  Handle SIGINT and SIGTERM for Graceful Shutdown
    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
  } catch (error) {
    console.error(" Failed to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
