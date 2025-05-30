const mongoose = require("mongoose");
const Comment = require("../models/comment.model");
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

async function listAllComments() {
  try {
    // Get all comments and populate the author and stock references
    const comments = await Comment.find({})
      .populate("author", "username")
      .populate("stock", "symbol name")
      .sort({ createdAt: -1 });

    console.log(`\nFound ${comments.length} comments:\n`);

    comments.forEach((comment, index) => {
      console.log(`Comment #${index + 1}:`);
      console.log(`Content: ${comment.content}`);
      console.log(
        `Author: ${comment.author ? comment.author.username : "Anonymous"}`
      );
      console.log(`Stock: ${comment.stock ? comment.stock.symbol : "Unknown"}`);
      console.log(`Created: ${comment.createdAt}`);
      console.log(`Likes: ${comment.likes}, Dislikes: ${comment.dislikes}`);
      console.log(`Is Reply: ${comment.isReply ? "Yes" : "No"}`);
      if (comment.parentComment) {
        console.log(`Parent Comment ID: ${comment.parentComment}`);
      }
      console.log("----------------------------------------\n");
    });
  } catch (error) {
    console.error("Error listing comments:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

// Run the script
listAllComments();
