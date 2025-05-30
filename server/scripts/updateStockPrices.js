const axios = require("axios");
const mongoose = require("mongoose");
const Stock = require("../models/stock.model");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;

// Check if API key is available
if (!TWELVE_DATA_API_KEY) {
  console.error("Error: TWELVE_DATA_API_KEY is not set in .env file");
  process.exit(1);
}

// Connect to MongoDB using the same configuration as the main server
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/stock-forum")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Helper function to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function updateStockPrices() {
  try {
    // Get all stocks from the database
    const stocks = await Stock.find({});
    console.log(`Found ${stocks.length} stocks to update`);

    // Process stocks in batches of 8 (the API limit per minute)
    const BATCH_SIZE = 8;
    const DELAY_BETWEEN_REQUESTS = 7500; // 7.5 seconds between requests to fit 8 requests per minute

    for (let i = 0; i < stocks.length; i += BATCH_SIZE) {
      const batch = stocks.slice(i, i + BATCH_SIZE);
      console.log(
        `Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(
          stocks.length / BATCH_SIZE
        )}`
      );

      // Process all stocks in the batch concurrently
      const updatePromises = batch.map(async (stock) => {
        try {
          // Fetch quote from Twelve Data API
          const response = await axios.get(
            `https://api.twelvedata.com/quote?symbol=${stock.symbol}&apikey=${TWELVE_DATA_API_KEY}`
          );

          const quote = response.data;

          // Check for rate limit error
          if (quote.status === "error" && quote.code === 429) {
            console.log(
              `Rate limit hit for ${stock.symbol}, waiting 60 seconds...`
            );
            await delay(60000);
            return null;
          }

          // Validate the response data
          if (!quote || !quote.close || !quote.percent_change) {
            console.error(`Invalid response for ${stock.symbol}:`, quote);
            return null;
          }

          const price = parseFloat(quote.close);
          const percentChange = parseFloat(quote.percent_change);

          // Validate parsed values
          if (isNaN(price) || isNaN(percentChange)) {
            console.error(`Invalid numeric values for ${stock.symbol}:`, {
              price,
              percentChange,
              rawClose: quote.close,
              rawPercentChange: quote.percent_change,
            });
            return null;
          }

          // Update only price and percent change
          stock.currentPrice = price;
          stock.percentChange = percentChange;

          await stock.save();
          console.log(
            `Updated ${stock.symbol}: $${stock.currentPrice} (${stock.percentChange}%)`
          );
          return stock;
        } catch (error) {
          console.error(`Error updating ${stock.symbol}:`, error.message);
          if (error.response) {
            console.error("API Response:", error.response.data);
            if (
              error.response.status === 429 ||
              (error.response.data &&
                error.response.data.message &&
                error.response.data.message.includes("API credits"))
            ) {
              console.log("Rate limit hit, waiting 60 seconds...");
              await delay(60000);
            }
          }
          return null;
        }
      });

      // Wait for all requests in the batch to complete
      await Promise.all(updatePromises);

      // If this isn't the last batch, wait for the next minute
      if (i + BATCH_SIZE < stocks.length) {
        console.log("Waiting for next minute...");
        await delay(60000); // Wait exactly one minute
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
