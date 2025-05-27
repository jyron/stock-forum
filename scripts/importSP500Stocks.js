/**
 * Script to import SP500 stocks to the database
 * 
 * This script will add SP500 stocks to the database if they don't already exist.
 * It respects the 12data API rate limits (8 requests per minute, 800 per day).
 */

require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Import the consolidated Stock model
const Stock = require('../server/models/stock.model');

// We no longer need the StockData model since we've consolidated it into Stock
// The Stock model now includes all fields from both schemas

// Connect to MongoDB with proper options for mongoose 8.x
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stock-forum';
console.log(`Connecting to MongoDB at: ${mongoURI}`);
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// 12data API key from environment variables
const API_KEY = process.env.TWELVE_DATA_API_KEY;

// Check if API key is available
if (!API_KEY) {
  console.error('Error: TWELVE_DATA_API_KEY is not defined in the environment variables');
  process.exit(1);
}

// SP500 stock symbols
const SP500_SYMBOLS = ['MMM', 'AOS', 'ABT', 'ABBV', 'ACN', 'ADBE', 'AMD', 'AES', 'AFL', 'A', 'APD', 'ABNB', 'AKAM', 'ALB', 'ARE', 'ALGN', 'ALLE', 'LNT', 'ALL', 'GOOGL', 'GOOG', 'MO', 'AMZN', 'AMCR', 'AEE', 'AEP', 'AXP', 'AIG', 'AMT', 'AWK', 'AMP', 'AME', 'AMGN', 'APH', 'ADI', 'ANSS', 'AON', 'APA', 'APO', 'AAPL', 'AMAT', 'APTV', 'ACGL', 'ADM', 'ANET', 'AJG', 'AIZ', 'T', 'ATO', 'ADSK', 'ADP', 'AZO', 'AVB', 'AVY', 'AXON', 'BKR', 'BALL', 'BAC', 'BAX', 'BDX', 'BRK.B', 'BBY', 'TECH', 'BIIB', 'BLK', 'BX', 'BK', 'BA', 'BKNG', 'BSX', 'BMY', 'AVGO', 'BR', 'BRO', 'BF.B', 'BLDR', 'BG', 'BXP', 'CHRW', 'CDNS', 'CZR', 'CPT', 'CPB', 'COF', 'CAH', 'KMX', 'CCL', 'CARR', 'CAT', 'CBOE', 'CBRE', 'CDW', 'COR', 'CNC', 'CNP', 'CF', 'CRL', 'SCHW', 'CHTR', 'CVX', 'CMG', 'CB', 'CHD', 'CI', 'CINF', 'CTAS', 'CSCO', 'C', 'CFG', 'CLX', 'CME', 'CMS', 'KO', 'CTSH', 'COIN', 'CL', 'CMCSA', 'CAG', 'COP', 'ED', 'STZ', 'CEG', 'COO', 'CPRT', 'GLW', 'CPAY', 'CTVA', 'CSGP', 'COST', 'CTRA', 'CRWD', 'CCI', 'CSX', 'CMI', 'CVS', 'DHR', 'DRI', 'DVA', 'DAY', 'DECK', 'DE', 'DELL', 'DAL', 'DVN', 'DXCM', 'FANG', 'DLR', 'DG', 'DLTR', 'D', 'DPZ', 'DASH', 'DOV', 'DOW', 'DHI', 'DTE', 'DUK', 'DD', 'EMN', 'ETN', 'EBAY', 'ECL', 'EIX', 'EW', 'EA', 'ELV', 'EMR', 'ENPH', 'ETR', 'EOG', 'EPAM', 'EQT', 'EFX', 'EQIX', 'EQR', 'ERIE', 'ESS', 'EL', 'EG', 'EVRG', 'ES', 'EXC', 'EXE', 'EXPE', 'EXPD', 'EXR', 'XOM', 'FFIV', 'FDS', 'FICO', 'FAST', 'FRT', 'FDX', 'FIS', 'FITB', 'FSLR', 'FE', 'FI', 'F', 'FTNT', 'FTV', 'FOXA', 'FOX', 'BEN', 'FCX', 'GRMN', 'IT', 'GE', 'GEHC', 'GEV', 'GEN', 'GNRC', 'GD', 'GIS', 'GM', 'GPC', 'GILD', 'GPN', 'GL', 'GDDY', 'GS', 'HAL', 'HIG', 'HAS', 'HCA', 'DOC', 'HSIC', 'HSY', 'HES', 'HPE', 'HLT', 'HOLX', 'HD', 'HON', 'HRL', 'HST', 'HWM', 'HPQ', 'HUBB', 'HUM', 'HBAN', 'HII', 'IBM', 'IEX', 'IDXX', 'ITW', 'INCY', 'IR', 'PODD', 'INTC', 'ICE', 'IFF', 'IP', 'IPG', 'INTU', 'ISRG', 'IVZ', 'INVH', 'IQV', 'IRM', 'JBHT', 'JBL', 'JKHY', 'J', 'JNJ', 'JCI', 'JPM', 'JNPR', 'K', 'KVUE', 'KDP', 'KEY', 'KEYS', 'KMB', 'KIM', 'KMI', 'KKR', 'KLAC', 'KHC', 'KR', 'LHX', 'LH', 'LRCX', 'LW', 'LVS', 'LDOS', 'LEN', 'LII', 'LLY', 'LIN', 'LYV', 'LKQ', 'LMT', 'L', 'LOW', 'LULU', 'LYB', 'MTB', 'MPC', 'MKTX', 'MAR', 'MMC', 'MLM', 'MAS', 'MA', 'MTCH', 'MKC', 'MCD', 'MCK', 'MDT', 'MRK', 'META', 'MET', 'MTD', 'MGM', 'MCHP', 'MU', 'MSFT', 'MAA', 'MRNA', 'MHK', 'MOH', 'TAP', 'MDLZ', 'MPWR', 'MNST', 'MCO', 'MS', 'MOS', 'MSI', 'MSCI', 'NDAQ', 'NTAP', 'NFLX', 'NEM', 'NWSA', 'NWS', 'NEE', 'NKE', 'NI', 'NDSN', 'NSC', 'NTRS', 'NOC', 'NCLH', 'NRG', 'NUE', 'NVDA', 'NVR', 'NXPI', 'ORLY', 'OXY', 'ODFL', 'OMC', 'ON', 'OKE', 'ORCL', 'OTIS', 'PCAR', 'PKG', 'PLTR', 'PANW', 'PARA', 'PH', 'PAYX', 'PAYC', 'PYPL', 'PNR', 'PEP', 'PFE', 'PCG', 'PM', 'PSX', 'PNW', 'PNC', 'POOL', 'PPG', 'PPL', 'PFG', 'PG', 'PGR', 'PLD', 'PRU', 'PEG', 'PTC', 'PSA', 'PHM', 'PWR', 'QCOM', 'DGX', 'RL', 'RJF', 'RTX', 'O', 'REG', 'REGN', 'RF', 'RSG', 'RMD', 'RVTY', 'ROK', 'ROL', 'ROP', 'ROST', 'RCL', 'SPGI', 'CRM', 'SBAC', 'SLB', 'STX', 'SRE', 'NOW', 'SHW', 'SPG', 'SWKS', 'SJM', 'SW', 'SNA', 'SOLV', 'SO', 'LUV', 'SWK', 'SBUX', 'STT', 'STLD', 'STE', 'SYK', 'SMCI', 'SYF', 'SNPS', 'SYY', 'TMUS', 'TROW', 'TTWO', 'TPR', 'TRGP', 'TGT', 'TEL', 'TDY', 'TER', 'TSLA', 'TXN', 'TPL', 'TXT', 'TMO', 'TJX', 'TKO', 'TSCO', 'TT', 'TDG', 'TRV', 'TRMB', 'TFC', 'TYL', 'TSN', 'USB', 'UBER', 'UDR', 'ULTA', 'UNP', 'UAL', 'UPS', 'URI', 'UNH', 'UHS', 'VLO', 'VTR', 'VLTO', 'VRSN', 'VRSK', 'VZ', 'VRTX', 'VTRS', 'VICI', 'V', 'VST', 'VMC', 'WRB', 'GWW', 'WAB', 'WBA', 'WMT', 'DIS', 'WBD', 'WM', 'WAT', 'WEC', 'WFC', 'WELL', 'WST', 'WDC', 'WY', 'WSM', 'WMB', 'WTW', 'WDAY', 'WYNN', 'XEL', 'XYL', 'YUM', 'ZBRA', 'ZBH', 'ZTS'];

// Rate limiting parameters
const REQUESTS_PER_MINUTE = 8;
const REQUESTS_PER_DAY = 800;
const MINUTE_IN_MS = 60 * 1000;

// Function to fetch stock data from 12data API
async function fetchStockData(symbol) {
  try {
    console.log(`Fetching data for ${symbol}...`);

    // Get basic stock info
    const response = await axios.get(`https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${API_KEY}`);
    const stockData = response.data;

    if (stockData.code === 400 || stockData.status === 'error') {
      console.error(`Error fetching ${symbol}:`, stockData.message || 'API error');
      return null;
    }

    return {
      symbol: symbol,
      name: stockData.name || `${symbol} Stock`,
      exchange: stockData.exchange || 'Unknown',
      currency: stockData.currency || 'USD',
      open: parseFloat(stockData.open) || null,
      high: parseFloat(stockData.high) || null,
      low: parseFloat(stockData.low) || null,
      close: parseFloat(stockData.close) || null,
      volume: parseInt(stockData.volume) || null,
      previousClose: parseFloat(stockData.previous_close) || null,
      percentChange: parseFloat(stockData.percent_change) || null,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error.message);
    return null;
  }
}

// Process stocks in batches to respect rate limits
async function processStocks() {
  console.log(`Starting SP500 stock import process for ${SP500_SYMBOLS.length} symbols...`);

  // Check which stocks already exist in the database
  const existingStocks = await StockData.find({ symbol: { $in: SP500_SYMBOLS } });
  const existingSymbols = existingStocks.map(stock => stock.symbol);

  console.log(`Found ${existingSymbols.length} stocks already in the database.`);

  // Filter out stocks that already exist
  const symbolsToFetch = SP500_SYMBOLS.filter(symbol => !existingSymbols.includes(symbol));

  console.log(`Need to fetch ${symbolsToFetch.length} new stocks.`);

  if (symbolsToFetch.length === 0) {
    console.log('All SP500 stocks are already in the database. Nothing to do.');
    return;
  }

  // Check if we're within the daily limit
  if (symbolsToFetch.length > REQUESTS_PER_DAY) {
    console.warn(`Warning: ${symbolsToFetch.length} stocks to fetch exceeds daily limit of ${REQUESTS_PER_DAY}.`);
    console.log(`Will only process the first ${REQUESTS_PER_DAY} stocks.`);
    symbolsToFetch.length = REQUESTS_PER_DAY;
  }

  // Process in batches of REQUESTS_PER_MINUTE
  const batches = [];
  for (let i = 0; i < symbolsToFetch.length; i += REQUESTS_PER_MINUTE) {
    batches.push(symbolsToFetch.slice(i, i + REQUESTS_PER_MINUTE));
  }

  console.log(`Split into ${batches.length} batches of up to ${REQUESTS_PER_MINUTE} stocks each.`);

  // Process each batch with a delay between batches
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Processing batch ${i + 1}/${batches.length} with ${batch.length} stocks...`);

    // Process each stock in the batch
    const promises = batch.map(async (symbol) => {
      const stockData = await fetchStockData(symbol);

      if (stockData) {
        // Save to database
        const newStock = new StockData(stockData);
        await newStock.save();
        console.log(`Saved ${symbol} to database.`);
        return { symbol, success: true };
      } else {
        return { symbol, success: false };
      }
    });

    // Wait for all promises in the batch to resolve
    const results = await Promise.all(promises);

    // Log results
    const successful = results.filter(r => r.success).length;
    console.log(`Batch ${i + 1} complete: ${successful}/${batch.length} stocks processed successfully.`);

    // Wait before processing the next batch (if not the last batch)
    if (i < batches.length - 1) {
      console.log(`Waiting for rate limit (${MINUTE_IN_MS / 1000} seconds)...`);
      await new Promise(resolve => setTimeout(resolve, MINUTE_IN_MS));
    }
  }

  console.log('SP500 stock import completed.');
}

// Run the import process
processStocks()
  .then(() => {
    console.log('Script completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
