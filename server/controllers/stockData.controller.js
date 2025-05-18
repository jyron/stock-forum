/**
 * Stock Data Controller
 * 
 * Handles operations related to S&P 500 stock data from the 12data API,
 * including importing, searching, and updating stock information.
 */

const axios = require('axios');
const StockData = require('../models/stockData.model');
const Stock = require('../models/stock.model');

// API key for 12data from environment variables
const API_KEY = process.env.TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com/quote';

// S&P 500 stocks
const SP500_STOCKS = ['MMM', 'AOS', 'ABT', 'ABBV', 'ACN', 'ADBE', 'AMD', 'AES', 'AFL', 'A', 'APD', 'ABNB', 'AKAM', 'ALB', 'ARE', 'ALGN', 'ALLE', 'LNT', 'ALL', 'GOOGL', 'GOOG', 'MO', 'AMZN', 'AMCR', 'AEE', 'AEP', 'AXP', 'AIG', 'AMT', 'AWK', 'AMP', 'AME', 'AMGN', 'APH', 'ADI', 'ANSS', 'AON', 'APA', 'APO', 'AAPL', 'AMAT', 'APTV', 'ACGL', 'ADM', 'ANET', 'AJG', 'AIZ', 'T', 'ATO', 'ADSK', 'ADP', 'AZO', 'AVB', 'AVY', 'AXON', 'BKR', 'BALL', 'BAC', 'BAX', 'BDX', 'BRK.B', 'BBY', 'TECH', 'BIIB', 'BLK', 'BX', 'BK', 'BA', 'BKNG', 'BSX', 'BMY', 'AVGO', 'BR', 'BRO', 'BF.B', 'BLDR', 'BG', 'BXP', 'CHRW', 'CDNS', 'CZR', 'CPT', 'CPB', 'COF', 'CAH', 'KMX', 'CCL', 'CARR', 'CAT', 'CBOE', 'CBRE', 'CDW', 'COR', 'CNC', 'CNP', 'CF', 'CRL', 'SCHW', 'CHTR', 'CVX', 'CMG', 'CB', 'CHD', 'CI', 'CINF', 'CTAS', 'CSCO', 'C', 'CFG', 'CLX', 'CME', 'CMS', 'KO', 'CTSH', 'COIN', 'CL', 'CMCSA', 'CAG', 'COP', 'ED', 'STZ', 'CEG', 'COO', 'CPRT', 'GLW', 'CPAY', 'CTVA', 'CSGP', 'COST', 'CTRA', 'CRWD', 'CCI', 'CSX', 'CMI', 'CVS', 'DHR', 'DRI', 'DVA', 'DAY', 'DECK', 'DE', 'DELL', 'DAL', 'DVN', 'DXCM', 'FANG', 'DLR', 'DG', 'DLTR', 'D', 'DPZ', 'DASH', 'DOV', 'DOW', 'DHI', 'DTE', 'DUK', 'DD', 'EMN', 'ETN', 'EBAY', 'ECL', 'EIX', 'EW', 'EA', 'ELV', 'EMR', 'ENPH', 'ETR', 'EOG', 'EPAM', 'EQT', 'EFX', 'EQIX', 'EQR', 'ERIE', 'ESS', 'EL', 'EG', 'EVRG', 'ES', 'EXC', 'EXE', 'EXPE', 'EXPD', 'EXR', 'XOM', 'FFIV', 'FDS', 'FICO', 'FAST', 'FRT', 'FDX', 'FIS', 'FITB', 'FSLR', 'FE', 'FI', 'F', 'FTNT', 'FTV', 'FOXA', 'FOX', 'BEN', 'FCX', 'GRMN', 'IT', 'GE', 'GEHC', 'GEV', 'GEN', 'GNRC', 'GD', 'GIS', 'GM', 'GPC', 'GILD', 'GPN', 'GL', 'GDDY', 'GS', 'HAL', 'HIG', 'HAS', 'HCA', 'DOC', 'HSIC', 'HSY', 'HES', 'HPE', 'HLT', 'HOLX', 'HD', 'HON', 'HRL', 'HST', 'HWM', 'HPQ', 'HUBB', 'HUM', 'HBAN', 'HII', 'IBM', 'IEX', 'IDXX', 'ITW', 'INCY', 'IR', 'PODD', 'INTC', 'ICE', 'IFF', 'IP', 'IPG', 'INTU', 'ISRG', 'IVZ', 'INVH', 'IQV', 'IRM', 'JBHT', 'JBL', 'JKHY', 'J', 'JNJ', 'JCI', 'JPM', 'JNPR', 'K', 'KVUE', 'KDP', 'KEY', 'KEYS', 'KMB', 'KIM', 'KMI', 'KKR', 'KLAC', 'KHC', 'KR', 'LHX', 'LH', 'LRCX', 'LW', 'LVS', 'LDOS', 'LEN', 'LII', 'LLY', 'LIN', 'LYV', 'LKQ', 'LMT', 'L', 'LOW', 'LULU', 'LYB', 'MTB', 'MPC', 'MKTX', 'MAR', 'MMC', 'MLM', 'MAS', 'MA', 'MTCH', 'MKC', 'MCD', 'MCK', 'MDT', 'MRK', 'META', 'MET', 'MTD', 'MGM', 'MCHP', 'MU', 'MSFT', 'MAA', 'MRNA', 'MHK', 'MOH', 'TAP', 'MDLZ', 'MPWR', 'MNST', 'MCO', 'MS', 'MOS', 'MSI', 'MSCI', 'NDAQ', 'NTAP', 'NFLX', 'NEM', 'NWSA', 'NWS', 'NEE', 'NKE', 'NI', 'NDSN', 'NSC', 'NTRS', 'NOC', 'NCLH', 'NRG', 'NUE', 'NVDA', 'NVR', 'NXPI', 'ORLY', 'OXY', 'ODFL', 'OMC', 'ON', 'OKE', 'ORCL', 'OTIS', 'PCAR', 'PKG', 'PLTR', 'PANW', 'PARA', 'PH', 'PAYX', 'PAYC', 'PYPL', 'PNR', 'PEP', 'PFE', 'PCG', 'PM', 'PSX', 'PNW', 'PNC', 'POOL', 'PPG', 'PPL', 'PFG', 'PG', 'PGR', 'PLD', 'PRU', 'PEG', 'PTC', 'PSA', 'PHM', 'PWR', 'QCOM', 'DGX', 'RL', 'RJF', 'RTX', 'O', 'REG', 'REGN', 'RF', 'RSG', 'RMD', 'RVTY', 'ROK', 'ROL', 'ROP', 'ROST', 'RCL', 'SPGI', 'CRM', 'SBAC', 'SLB', 'STX', 'SRE', 'NOW', 'SHW', 'SPG', 'SWKS', 'SJM', 'SW', 'SNA', 'SOLV', 'SO', 'LUV', 'SWK', 'SBUX', 'STT', 'STLD', 'STE', 'SYK', 'SMCI', 'SYF', 'SNPS', 'SYY', 'TMUS', 'TROW', 'TTWO', 'TPR', 'TRGP', 'TGT', 'TEL', 'TDY', 'TER', 'TSLA', 'TXN', 'TPL', 'TXT', 'TMO', 'TJX', 'TKO', 'TSCO', 'TT', 'TDG', 'TRV', 'TRMB', 'TFC', 'TYL', 'TSN', 'USB', 'UBER', 'UDR', 'ULTA', 'UNP', 'UAL', 'UPS', 'URI', 'UNH', 'UHS', 'VLO', 'VTR', 'VLTO', 'VRSN', 'VRSK', 'VZ', 'VRTX', 'VTRS', 'VICI', 'V', 'VST', 'VMC', 'WRB', 'GWW', 'WAB', 'WBA', 'WMT', 'DIS', 'WBD', 'WM', 'WAT', 'WEC', 'WFC', 'WELL', 'WST', 'WDC', 'WY', 'WSM', 'WMB', 'WTW', 'WDAY', 'WYNN', 'XEL', 'XYL', 'YUM', 'ZBRA', 'ZBH', 'ZTS'];

/**
 * Helper function to delay execution for API rate limiting
 * 
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after the specified delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch stock data from 12data API
 * 
 * @param {string} symbol - Stock symbol to fetch data for
 * @returns {Object|null} - Stock data or null if fetch failed
 */
const fetchStockData = async (symbol) => {
  try {
    const url = `${BASE_URL}?symbol=${symbol}&apikey=${API_KEY}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error.message);
    return null;
  }
};

/**
 * Import S&P 500 stocks from the 12data API
 * 
 * Fetches stock data for S&P 500 companies and stores it in the database.
 * Implements rate limiting to respect the API's limits (8 requests per minute).
 * Only imports stocks that don't already exist in the database.
 * 
 * @param {Object} req - Express request object with userId from auth middleware
 * @param {Object} res - Express response object
 * @returns {Object} - Import results with counts of imported, skipped, and error stocks
 */
exports.importSP500Stocks = async (req, res) => {
  try {
    const userId = req.userId;
    let importedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    // Check how many stocks are already in the database
    const existingStockData = await StockData.find({}, 'symbol');
    const existingSymbols = new Set(existingStockData.map(stock => stock.symbol));
    
    // Process stocks in batches to respect API rate limits (8 per minute)
    const batchSize = 8;
    const delayBetweenBatches = 60000; // 60 seconds between batches
    
    // Filter out stocks that already exist in the database
    const stocksToImport = SP500_STOCKS.filter(symbol => !existingSymbols.has(symbol));
    
    if (stocksToImport.length === 0) {
      return res.status(200).json({
        message: 'All S&P 500 stocks are already imported',
        importedCount: 0,
        skippedCount: SP500_STOCKS.length,
        errorCount: 0
      });
    }
    
    // Process stocks in batches
    for (let i = 0; i < stocksToImport.length; i += batchSize) {
      const batch = stocksToImport.slice(i, i + batchSize);
      const batchPromises = [];
      
      for (const symbol of batch) {
        batchPromises.push(processStock(symbol, userId));
      }
      
      const results = await Promise.all(batchPromises);
      
      results.forEach(result => {
        if (result.status === 'imported') importedCount++;
        else if (result.status === 'error') errorCount++;
        else if (result.status === 'skipped') skippedCount++;
      });
      
      // If there are more stocks to process, wait before the next batch
      if (i + batchSize < stocksToImport.length) {
        await delay(delayBetweenBatches);
      }
    }
    
    res.status(200).json({
      message: 'S&P 500 stocks import process completed',
      importedCount,
      skippedCount,
      errorCount
    });
  } catch (error) {
    console.error('Error importing S&P 500 stocks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Process a single stock for import
 * 
 * Fetches stock data from the API and saves it to the database.
 * Creates both a StockData record and a Stock record if they don't exist.
 * 
 * @param {string} symbol - Stock symbol to process
 * @param {string} userId - ID of the user performing the import
 * @returns {Object} - Result object with status and message
 */
const processStock = async (symbol, userId) => {
  try {
    // Check if stock data already exists in StockData collection
    const existingStockData = await StockData.findOne({ symbol });
    
    if (existingStockData) {
      return { symbol, status: 'skipped', message: 'Stock data already exists' };
    }
    
    // Fetch stock data from API
    const stockData = await fetchStockData(symbol);
    
    if (!stockData || stockData.status === 'error') {
      return { symbol, status: 'error', message: 'Failed to fetch stock data' };
    }
    
    // Create new stock data record
    const newStockData = new StockData({
      symbol: stockData.symbol,
      name: stockData.name,
      exchange: stockData.exchange,
      currency: stockData.currency,
      close: parseFloat(stockData.close),
      // Ensure percent_change is properly parsed - if it's missing, calculate it if we have previous close
      percentChange: stockData.percent_change ? parseFloat(stockData.percent_change) : 
                    (stockData.previous_close && stockData.close) ? 
                    ((parseFloat(stockData.close) - parseFloat(stockData.previous_close)) / parseFloat(stockData.previous_close) * 100).toFixed(2) : 0,
      lastUpdated: new Date()
    });
    
    await newStockData.save();
    
    // Check if stock already exists in Stock collection
    const existingStock = await Stock.findOne({ symbol });
    
    if (!existingStock) {
      // Create new stock in the Stock collection
      const newStock = new Stock({
        symbol: stockData.symbol,
        name: stockData.name,
        description: `${stockData.name} is traded on ${stockData.exchange} in ${stockData.currency}.`,
        currentPrice: parseFloat(stockData.close),
        createdBy: userId
      });
      
      await newStock.save();
    }
    
    return { symbol, status: 'imported', message: 'Stock data imported successfully' };
  } catch (error) {
    console.error(`Error processing stock ${symbol}:`, error);
    return { symbol, status: 'error', message: error.message };
  }
};

/**
 * Get all imported stock data with optional search filtering
 * 
 * Retrieves all stock data from the database, with optional filtering by symbol or name.
 * Supports case-insensitive search on both fields.
 * 
 * @param {Object} req - Express request object with optional search query parameter
 * @param {Object} res - Express response object
 * @returns {Array} - List of stock data matching the search criteria
 */
exports.getAllStockData = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    // If search parameter is provided, search by symbol or name
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
      query = {
        $or: [
          { symbol: searchRegex },
          { name: searchRegex }
        ]
      };
    }
    
    const stockData = await StockData.find(query).sort({ symbol: 1 });
    
    res.status(200).json(stockData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get stock data for a specific symbol
 * 
 * Retrieves stock data for a specific symbol from the database.
 * 
 * @param {Object} req - Express request object with symbol parameter
 * @param {Object} res - Express response object
 * @returns {Object} - Stock data for the requested symbol
 */
exports.getStockDataBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const stockData = await StockData.findOne({ symbol: symbol.toUpperCase() });
    
    if (!stockData) {
      return res.status(404).json({ message: 'Stock data not found' });
    }
    
    res.status(200).json(stockData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update stock data from the 12data API
 * 
 * Fetches the latest data for a specific symbol from the API and updates
 * both the StockData and Stock records in the database.
 * 
 * @param {Object} req - Express request object with symbol parameter
 * @param {Object} res - Express response object
 * @returns {Object} - Updated stock data
 */
exports.updateStockData = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Fetch latest data from API
    const stockData = await fetchStockData(symbol);
    
    if (!stockData || stockData.status === 'error') {
      return res.status(400).json({ message: 'Failed to fetch stock data from API' });
    }
    
    // Calculate percent change if not provided by API
    let percentChange;
    if (stockData.percent_change) {
      percentChange = parseFloat(stockData.percent_change);
    } else if (stockData.previous_close && stockData.close) {
      percentChange = ((parseFloat(stockData.close) - parseFloat(stockData.previous_close)) / parseFloat(stockData.previous_close) * 100).toFixed(2);
    } else {
      // If we can't calculate, keep existing value or default to 0
      const existingStock = await StockData.findOne({ symbol: symbol.toUpperCase() });
      percentChange = existingStock?.percentChange || 0;
    }
    
    // Update stock data in database
    const updatedStockData = await StockData.findOneAndUpdate(
      { symbol: symbol.toUpperCase() },
      {
        close: parseFloat(stockData.close),
        percentChange,
        lastUpdated: new Date()
      },
      { new: true }
    );
    
    if (!updatedStockData) {
      return res.status(404).json({ message: 'Stock data not found' });
    }
    
    // Update stock price in Stock collection
    await Stock.findOneAndUpdate(
      { symbol: symbol.toUpperCase() },
      { currentPrice: parseFloat(stockData.close) }
    );
    
    res.status(200).json({
      message: 'Stock data updated successfully',
      stockData: updatedStockData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
