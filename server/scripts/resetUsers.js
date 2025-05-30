const mongoose = require("mongoose");
const User = require("../models/user.model");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/stock-forum", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

async function resetUsers() {
  try {
    // Delete all users
    const result = await User.deleteMany({});
    console.log(`\nDeleted ${result.deletedCount} users`);
  } catch (error) {
    console.error("Error resetting users:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("\nMongoDB connection closed");
  }
}

// Run the script
resetUsers();
