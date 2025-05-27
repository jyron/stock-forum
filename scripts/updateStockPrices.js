/**
 * Script to update prices for all stocks in the database
 *
 * This script will update price information for all stocks in the database.
 * It respects the 12data API rate limits (8 requests per minute, 800 per day).
 */

require("dotenv").config({ path: "./server/.env" });
const mongoose = require("mongoose");
const axios = require("axios");

// Import the Stock model
const Stock = require("../server/models/stock.model");

// Connect to MongoDB with proper options for mongoose 8.x
const mongoURI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/stock-forum";
console.log(`Connecting to MongoDB at: ${mongoURI}`);
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// 12data API key from environment variables
const API_KEY = process.env.TWELVE_DATA_API_KEY;

// Check if API key is available
if (!API_KEY) {
  console.error(
    "Error: TWELVE_DATA_API_KEY is not defined in the environment variables"
  );
  process.exit(1);
}

// Rate limiting parameters
const REQUESTS_PER_MINUTE = 8;
const REQUESTS_PER_DAY = 800;
const MINUTE_IN_MS = 60 * 1000;

// Function to fetch updated stock data from 12data API
async function fetchStockData(symbol) {
  try {
    console.log(`Updating data for ${symbol}...`);

    // Get basic stock info
    const response = await axios.get(
      `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${API_KEY}`
    );
    const stockData = response.data;

    if (stockData.code === 400 || stockData.status === "error") {
      console.error(
        `Error fetching ${symbol}:`,
        stockData.message || "API error"
      );
      return null;
    }

    return {
      currentPrice: parseFloat(stockData.close) || null,
      previousClose: parseFloat(stockData.previous_close) || null,
      percentChange: parseFloat(stockData.percent_change) || null,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error(`Error updating data for ${symbol}:`, error.message);
    return null;
  }
}

// Process stocks in batches to respect rate limits
async function updateStockPrices() {
  console.log("Starting stock price update process...");

  // Get all stocks from the Stock collection
  const stocks = await Stock.find({}, "symbol");
  const allSymbols = stocks.map((stock) => stock.symbol);

  console.log(`Found ${allSymbols.length} stock symbols to update.`);

  // Check if we're within the daily limit
  if (allSymbols.length > REQUESTS_PER_DAY) {
    console.warn(
      `Warning: ${allSymbols.length} stocks to update exceeds daily limit of ${REQUESTS_PER_DAY}.`
    );
    console.log(`Will only process the first ${REQUESTS_PER_DAY} stocks.`);
    allSymbols.length = REQUESTS_PER_DAY;
  }

  // Process in batches of REQUESTS_PER_MINUTE
  const batches = [];
  for (let i = 0; i < allSymbols.length; i += REQUESTS_PER_MINUTE) {
    batches.push(allSymbols.slice(i, i + REQUESTS_PER_MINUTE));
  }

  console.log(
    `Split into ${batches.length} batches of up to ${REQUESTS_PER_MINUTE} stocks each.`
  );

  // Process each batch with a delay between batches
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(
      `Processing batch ${i + 1}/${batches.length} with ${
        batch.length
      } stocks...`
    );

    // Process each stock in the batch
    const updatePromises = batch.map(async (symbol) => {
      const stockData = await fetchStockData(symbol);

      if (!stockData) {
        return { symbol, success: false };
      }

      // Update the Stock document
      const updateResult = await Stock.updateOne(
        { symbol },
        { $set: stockData }
      );

      const updated = updateResult.modifiedCount > 0;
      console.log(`${symbol}: Updated=${updated}`);

      return {
        symbol,
        success: true,
        updated,
      };
    });

    // Wait for all promises in the batch to resolve
    const results = await Promise.all(updatePromises);

    // Log results
    const successful = results.filter((r) => r.success).length;
    console.log(
      `Batch ${i + 1} complete: ${successful}/${
        batch.length
      } stocks updated successfully.`
    );

    // Wait before processing the next batch (if not the last batch)
    if (i < batches.length - 1) {
      console.log(`Waiting for rate limit (${MINUTE_IN_MS / 1000} seconds)...`);
      await new Promise((resolve) => setTimeout(resolve, MINUTE_IN_MS));
    }
  }

  console.log("Stock price update completed.");
}

// Run the update process
updateStockPrices()
  .then(() => {
    console.log("Script completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
