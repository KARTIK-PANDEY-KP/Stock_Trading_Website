const mongoose = require('mongoose');

// Define the schema for the stock details
const stockSchema = new mongoose.Schema({
  stock_ticker: String,
  stock_company_name: String,
  quantity_owned: Number,
  stock_avg_price_per_share: Number
});

// Define the main schema including the moneyInWallet and stocks array
const userPortfolioSchema = new mongoose.Schema({
  moneyInWallet: Number,
  stocks: [stockSchema]
});

// Create the model from the schema
const UserPortfolio = mongoose.model('UserPortfolio', userPortfolioSchema);

module.exports = UserPortfolio;
