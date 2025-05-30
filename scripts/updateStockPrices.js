const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Define a simple Stock schema for this script
const stockSchema = new mongoose.Schema({
  symbol: String,
  currentPrice: Number,
  percentChange: Number,
});

const Stock = mongoose.model("Stock", stockSchema);

async function updateStockPrices() {
  try {
    // Get all stocks from the database
    const stocks = await Stock.find({});
    console.log(`Found ${stocks.length} stocks to update`);

    for (const stock of stocks) {
      try {
        // Fetch quote from Twelve Data API
        const response = await axios.get(
          `https://api.twelvedata.com/quote?symbol=${stock.symbol}&apikey=${TWELVE_DATA_API_KEY}`
        );

        const quote = response.data;

        // Update only price and percent change
        stock.currentPrice = parseFloat(quote.close);
        stock.percentChange = parseFloat(quote.percent_change);

        await stock.save();
        console.log(
          `Updated ${stock.symbol}: $${stock.currentPrice} (${stock.percentChange}%)`
        );
      } catch (error) {
        console.error(`Error updating ${stock.symbol}:`, error.message);
      }
    }

    console.log("Stock price update completed");
  } catch (error) {
    console.error("Error in updateStockPrices:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
  }
}

// Run the update
updateStockPrices()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
