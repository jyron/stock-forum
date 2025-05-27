/**
 * Migration script to move data from stockdatas collection to stocks collection
 *
 * This script migrates existing stock data from the legacy stockdatas collection
 * to the new consolidated stocks collection with the proper schema.
 */

require("dotenv").config({ path: "./server/.env" });
const mongoose = require("mongoose");

// Connect to MongoDB
const mongoURI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/stock-forum";
console.log(`Connecting to MongoDB at: ${mongoURI}`);

async function migrateStockData() {
  try {
    // Connect to MongoDB and wait for connection
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
    console.log("Starting stock data migration...");

    // Get the database
    const db = mongoose.connection.db;

    // Get collections
    const stockdatasCollection = db.collection("stockdatas");
    const stocksCollection = db.collection("stocks");
    const usersCollection = db.collection("users");

    // Get a user to assign as creator (use the first user found)
    const user = await usersCollection.findOne();
    if (!user) {
      console.error("No users found in database. Please create a user first.");
      process.exit(1);
    }

    console.log(
      `Using user ${user.username} (${user._id}) as creator for migrated stocks`
    );

    // Get all stockdatas
    const stockdatas = await stockdatasCollection.find().toArray();
    console.log(`Found ${stockdatas.length} stocks to migrate`);

    // Check if stocks collection already has data
    const existingStocksCount = await stocksCollection.countDocuments();
    if (existingStocksCount > 0) {
      console.log(
        `Warning: stocks collection already has ${existingStocksCount} documents`
      );
      console.log(
        "This migration will skip existing symbols to avoid duplicates"
      );
    }

    let migrated = 0;
    let skipped = 0;

    for (const stockdata of stockdatas) {
      // Check if stock already exists in stocks collection
      const existingStock = await stocksCollection.findOne({
        symbol: stockdata.symbol,
      });

      if (existingStock) {
        console.log(
          `Skipping ${stockdata.symbol} - already exists in stocks collection`
        );
        skipped++;
        continue;
      }

      // Create new stock document with mapped fields
      const newStock = {
        symbol: stockdata.symbol,
        name: stockdata.name,
        description: `${stockdata.name} stock traded on ${stockdata.exchange}`,
        exchange: stockdata.exchange,
        currency: stockdata.currency,
        currentPrice: stockdata.close, // Map close to currentPrice
        previousClose: stockdata.previousClose,
        percentChange: stockdata.percentChange,
        likes: 0,
        dislikes: 0,
        likedBy: [],
        dislikedBy: [],
        createdBy: user._id,
        lastUpdated: stockdata.lastUpdated || new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Insert into stocks collection
      await stocksCollection.insertOne(newStock);
      console.log(`Migrated ${stockdata.symbol} - ${stockdata.name}`);
      migrated++;
    }

    console.log("\nMigration completed!");
    console.log(`Migrated: ${migrated} stocks`);
    console.log(`Skipped: ${skipped} stocks`);
    console.log(`Total in stockdatas: ${stockdatas.length}`);

    // Verify the migration
    const finalStocksCount = await stocksCollection.countDocuments();
    console.log(`Final count in stocks collection: ${finalStocksCount}`);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migrateStockData()
  .then(() => {
    console.log("Migration script completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });
