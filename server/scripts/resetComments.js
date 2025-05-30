const mongoose = require("mongoose");
const Comment = require("../models/comment.model");
const Stock = require("../models/stock.model");
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

async function resetComments() {
  try {
    // Delete all comments
    const result = await Comment.deleteMany({});
    console.log(`\nDeleted ${result.deletedCount} comments`);

    // Reset comment counts and last comment in stocks
    await Stock.updateMany(
      {},
      {
        $set: {
          commentCount: 0,
          lastComment: {
            content: null,
            author: null,
            authorId: null,
            date: null,
            commentId: null,
          },
        },
      }
    );
    console.log("Reset comment counts and last comment data in stocks");
  } catch (error) {
    console.error("Error resetting comments:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("\nMongoDB connection closed");
  }
}

// Run the script
resetComments();
