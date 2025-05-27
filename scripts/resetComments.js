const mongoose = require('mongoose');
const Comment = require('../server/models/comment.model');

async function resetComments() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/stock_forum');

    console.log('Connected to MongoDB');

    // Delete all comments
    await Comment.deleteMany({});
    console.log('All comments have been deleted');

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the reset function
resetComments();
