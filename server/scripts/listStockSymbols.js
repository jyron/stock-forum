const mongoose = require("mongoose");
const Stock = require("../models/stock.model");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "NONONNO", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

async function listStockSymbols() {
  try {
    // Get all stocks and sort by symbol
    const stocks = await Stock.find({}).sort({ symbol: 1 });

    console.log(`\nFound ${stocks.length} stocks:\n`);

    stocks.forEach((stock, index) => {
      console.log(`${stock.symbol}`);
    });
  } catch (error) {
    console.error("Error listing stocks:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("\nMongoDB connection closed");
  }
}

// Run the script
listStockSymbols();
