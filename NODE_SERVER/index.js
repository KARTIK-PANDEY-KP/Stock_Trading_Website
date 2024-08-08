  const express = require('express');
  const axios = require('axios');
  const app = express();
  app.use(express.json()); // This line is essential for parsing JSON bodies

  const port = 3000;
  const cors = require('cors');
  const mongoose = require('mongoose');
  app.use(cors());
  
// RHC7z8kOGQHtUuBBxaqHVrAQZpzG3ymp
  var finnhub_api = "";
  var polygon_api = ""
  var  mongoDB_connec_str = ""
  // Define the schema for the StockInfo
const stockInfoSchema = new mongoose.Schema({
  stock_ticker: { type: String, unique: true, required: true },
  stock_company_name: String
});

// Create the model from the schema
const StockInfo = mongoose.model('StockInfo', stockInfoSchema);

  
  // var url_polyogn__url = `https://api.polygon.io/v2/aggs/ticker/{stock_name}/range/1/hour/${prev_day}/${today}?adjusted=true&sort=asc&apiKey=${polygon_api}"`;
  // https://api.polygon.io/v2/aggs/ticker/${userInput}/range/1/hour/${from}/${to}?adjusted=true&sort=asc&apiKey=
  
  function getPdtDate(offsetDays = 0) {
    const date = new Date();
    // Adjust for the specific offset in days
    date.setDate(date.getDate() + offsetDays);
    // Format the date in PDT timezone
    return new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/Los_Angeles'
    }).format(date);
}

  app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
      res.status(400).send('Query parameter is required');
      return;
    }

    const finnhub_autocomplete = `https://finnhub.io/api/v1/search?q=${query}&token=${finnhub_api}`;
    console.log(finnhub_autocomplete);

    try {
      const response = await axios.get(finnhub_autocomplete);
      const filteredData = response.data.result.filter(stock => 
        stock.type === 'Common Stock' && !stock.symbol.includes('.')
      );

      // Convert data to array of strings
      const formattedData = filteredData.map(stock => `${stock.symbol} | ${stock.description}`);

      res.json(formattedData);
      console.log("finnhub_autocomplete - sent");
    } catch (error) {
      console.error(`ERROR_DEBUG: Error fetching data from Finnhub:`, error);
      res.status(500).send('Error fetching data');
    }
  })
  function calculateSentimentSummary(data) {
    let totalMspr = 0, positiveMspr = 0, negativeMspr = 0;
    let totalChange = 0, positiveChange = 0, negativeChange = 0;

    for (const entry of data) {
        totalMspr += entry.mspr;
        totalChange += entry.change;

        if (entry.mspr > 0) positiveMspr += entry.mspr;
        if (entry.mspr < 0) negativeMspr += entry.mspr;

        if (entry.change > 0) positiveChange += entry.change;
        if (entry.change < 0) negativeChange += entry.change;
    }

    return {
        totalMspr: parseFloat(totalMspr.toFixed(2)),
        positiveMspr: parseFloat(positiveMspr.toFixed(2)),
        negativeMspr: parseFloat(negativeMspr.toFixed(2)),
        totalChange: parseFloat(totalChange.toFixed(2)),
        positiveChange: parseFloat(positiveChange.toFixed(2)),
        negativeChange: parseFloat(negativeChange.toFixed(2))
    };
}


  app.get('/submit', async (req, res) => {
    const stockName = req.query.text;
    console.log(stockName);
  
    if (!stockName) {
      res.json({ status: 'error', message: 'Text parameter is required' });
      return;
    }
  
    const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${stockName}&token=${finnhub_api}`;
    const peersUrl = `https://finnhub.io/api/v1/stock/peers?symbol=${stockName}&token=${finnhub_api}`;
  
    try {
      const profileResponse = await axios.get(profileUrl);
      const peersResponse = await axios.get(peersUrl);
  
      if (profileResponse.data && 'name' in profileResponse.data) {
        // Merging the data from both API responses into a single object
        const mergedData = {
          ...profileResponse.data,
          peers: peersResponse.data // Assuming peersResponse.data is an array of peer symbols
        };
  
        console.log("Submit - sent");
        res.json(mergedData);
      } else {
        res.json({ status: 'error', message: 'No record has been found, please enter a valid symbol' });
      }
    } catch (error) {
      console.error(`ERROR_DEBUG: Error fetching data from Finnhub:`, error);
      res.status(500).send('Error fetching data');
    }
  });

  app.get('/stockdata', async (req, res) => {
    // Assuming req.query.stockname_marketstatus holds the value "stockname_marketstatus"
  
  
    // console.log(res.query)
    const stockname_marketstatus = req.query.stock_name;

    // Split the string into an array based on the underscore
    const parts = stockname_marketstatus.split('_');

    // Assign the values to the respective variables
    const stock_name = parts[0];
    const market_status = parts[1];

    console.log(stock_name);    // Outputs the stock name
    console.log(market_status); // Outputs the market status

    //TODO:
    if (!stock_name) {
      res.status(400).send('stock_name parameter is required');
      return;
    }
    if(market_status == 1){
      today = new Date().getTime();

      prev_day = today - 24 * 60 * 60 * 1000;
    }
    else{
      today = new Date().getTime();

      today = today - 24 * 60 * 60 * 1000;
      prev_day = today - 24 * 60 * 60 * 1000;
    }
    // prev_day.setDate(today.getDate() - 2);
    // today.setDate(today.getDate() - 1);
    // console.log(today, prev_day);
    // Your Unix timestamp
    // Function to format the date in YYYY-MM-DD format
   // Assume getPdtDate() returns dates in YYYY-DD-MM format
    // const currentDatePdt = getPdtDate();

    // // Get the previous date in PDT
    // const previousDatePdt = getPdtDate(-1);

    // // Function to convert YYYY-DD-MM to YYYY-MM-DD
    // function convertDateToYMD(dateString) {
    //     const parts = dateString.split('-');
    //     return `${parts[0]}-${parts[2]}-${parts[1]}`;
    // }

    // // Convert dates to YYYY-MM-DD format
    // const currentDateFormatted = convertDateToYMD(currentDatePdt);
    // const previousDateFormatted = convertDateToYMD(previousDatePdt);

    // console.log(`Current Date (PDT): ${currentDateFormatted}`);
    // console.log(`Previous Date (PDT): ${previousDateFormatted}`);


    // const format = date => date.toISOString().split('T')[0];
    // https://api.polygon.io/v2/aggs/ticker/MSFT/range/1/hour/1711602469697/1711688879697?adjusted=true&sort=asc&limit=5000&apiKey=RHC7z8kOGQHtUuBBxaqHVrAQZpzG3ymp
    // res.json({"ticker":"AAPL","queryCount":734,"resultsCount":16,"adjusted":true,"results":[{"v":12304,"vw":172.0921,"o":172.2,"c":172.18,"h":172.2,"l":172,"t":1711353600000,"n":623},{"v":26367,"vw":171.8675,"o":172.17,"c":171.71,"h":172.17,"l":171.68,"t":1711357200000,"n":670},{"v":22325,"vw":171.6108,"o":171.7,"c":171.3,"h":171.85,"l":171.3,"t":1711360800000,"n":714},{"v":99751,"vw":171.1989,"o":171.39,"c":171.19,"h":171.41,"l":171.07,"t":1711364400000,"n":2031},{"v":322034,"vw":171.4896,"o":171.4,"c":171,"h":172.27,"l":170.9,"t":1711368000000,"n":8091},{"v":9431537,"vw":170.07,"o":171.02,"c":170.18,"h":171.1,"l":169.45,"t":1711371600000,"n":129031},{"v":7647322,"vw":170.1026,"o":170.18,"c":170.55,"h":170.61,"l":169.77,"t":1711375200000,"n":164914},{"v":5080570,"vw":170.4135,"o":170.54,"c":170.62,"h":170.765,"l":170.09,"t":1711378800000,"n":165102},{"v":4474779,"vw":170.714,"o":170.62,"c":170.99,"h":171.15,"l":170.38,"t":1711382400000,"n":56526},{"v":4435363,"vw":171.3007,"o":171,"c":171.468,"h":171.52,"l":170.985,"t":1711386000000,"n":54815},{"v":3773515,"vw":171.4493,"o":171.465,"c":171.448,"h":171.61,"l":171.235,"t":1711389600000,"n":44380},{"v":8727515,"vw":171.2945,"o":171.45,"c":170.85,"h":171.94,"l":170.79,"t":1711393200000,"n":90738},{"v":2737895,"vw":170.8523,"o":170.86,"c":170.85,"h":171.1496,"l":170.75,"t":1711396800000,"n":3388},{"v":33623,"vw":170.856,"o":170.9078,"c":170.88,"h":170.93,"l":170.05,"t":1711400400000,"n":1173},{"v":32627,"vw":170.9108,"o":170.8301,"c":170.93,"h":170.9999,"l":170.83,"t":1711404000000,"n":873},{"v":18995,"vw":170.9076,"o":170.9,"c":170.92,"h":170.98,"l":170.83,"t":1711407600000,"n":673}],"status":"DELAYED","request_id":"6b802deab9ee1504861c49d14197f513","count":16});
    const url_polygon = `https://api.polygon.io/v2/aggs/ticker/${stock_name}/range/1/hour/${prev_day}/${today}?adjusted=true&sort=asc&limit=5000&apiKey=${polygon_api}`;
    console.log(url_polygon);
    try {
      const response = await axios.get(url_polygon);
      console.log(response.data);
      res.json(response.data);
    } catch (error) {
      // console.error(`ERROR_DEBUG: Error fetching data from Polygon:`, error);
      res.status(500).send('Error fetching data');
    }
  });

  app.get('/news', async (req, res) => {
    const symbol = req.query.symbol;
  
    if (!symbol) {
      res.status(400).send('Symbol parameter is required');
      return;
    }
  
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - 8);  // Set to 7 days before the current date
  
    const format = date => date.toISOString().split('T')[0];
  
    const finnhub_news_url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${format(fromDate)}&to=${format(toDate)}&token=${finnhub_api}`;
    console.log(finnhub_news_url);
  
    try {
      const response = await axios.get(finnhub_news_url);
      const news = response.data
        .filter(item => item.headline && item.image)  // Ensure both title and image are present
        .slice(0, 20);  // Get the first 20 news items after filtering
  
      if (news.length > 0) {
        // Pass all data of each news item to the client
        res.json(news);
      } else {
        res.status(404).send('No valid news found for the given symbol');
      }
    } catch (error) {
      console.error(`ERROR_DEBUG: Error fetching news from Finnhub:`, error);
      res.status(500).send('Error fetching data');
    }
  });

  app.get('/recom', async (req, res) => {
  const stockName = req.query.text;
  console.log(stockName);

  if (!stockName) {
    res.json({ status: 'error', message: 'Text parameter is required' });
    return;
  }

  const finnhub_url = `https://finnhub.io/api/v1/stock/endation?symbol=${stockName}&token=${finnhub_api}`;
  console.log(finnhub_url);

  try {
    const response = await axios.get(finnhub_url);
    // Assuming the response.data is an array of recommendations
    if (Array.isArray(response.data) && response.data.length > 0) {
      const modifiedData = response.data.map(item => {
        // Split the period into [year, month, day]
        const dateParts = item.period.split('-');
        return {
          ...item,
          // Concatenate the year and month parts to get YYYY-MM
          period: `${dateParts[0]}-${dateParts[1]}`
        };
      });
  
      console.log("Recommendation - sent");
      res.json(modifiedData); // Send the modified data
  
    } else {
      // Send a 404 status with a custom error message if no data is found
      res.json({ status: 'error', message: 'No recommendation data found for the given stock symbol' });
    }
  } catch (error) {
    console.error(`ERROR_DEBUG: Error fetching recommendation data from Finnhub:`, error);
    res.status(500).send('Error fetching recommendation data');
  }
});

app.get('/epsinfo', async (req, res) => {
  const stockName = req.query.text;
  console.log(stockName);

  if (!stockName) {
      res.json({ status: 'error', message: 'Text parameter is required' });
      return;
  }

  const finnhub_url = `https://finnhub.io/api/v1/stock/earnings?symbol=${stockName}&token=${finnhub_api}`;
  console.log(finnhub_url);

  try {
      const response = await axios.get(finnhub_url);
      // Assuming that the 'response.data' contains the actual data we need to process
      if (response.data && Array.isArray(response.data)) {
          console.log("EPS Info - sent");
          // Process data to replace null values with 0
          const processedData = response.data.map(item => {
              return Object.fromEntries(
                  Object.entries(item).map(([key, value]) => [key, value === null ? 0 : value])
              );
          });
          res.json(processedData);
      } else {
          // Send a 404 status with a custom error message if no data is found
          res.json({ status: 'error', message: 'No earnings information found, please enter a valid symbol' });
      }
  } catch (error) {
      console.error(`ERROR_DEBUG: Error fetching EPS information from Finnhub:`, error);
      res.status(500).send('Error fetching data');
  }
});

app.get('/quote', async (req, res) => {
  const stockName = req.query.text;
  const quote_url = `https://finnhub.io/api/v1/quote?symbol=${stockName}&token=${finnhub_api}`;

  try {
      const response = await axios.get(quote_url);
      // Assuming that the 'response.data' contains the actual data we need to check
      // And assuming 'c' (current price) is a field in the response data to verify valid data
      if (response.data && 'c' in response.data) {
          console.log("Quote fetched successfully");
          res.json(response.data);
      } else {
          // Send a 404 status with a custom error message if 'c' is not in the data
          res.status(404).json({ status: 'error', message: 'No quote data found, please enter a valid symbol' });
      }
  } catch (error) {
      console.error(`ERROR_DEBUG: Error fetching quote data from Finnhub:`, error);
      res.status(500).send('Error fetching quote data');
  }
});

app.get('/insider-sentiment', async (req, res) => {
  const ticker = req.query.text;
  const fromDate = '2022-01-01'; // Adjust as needed
  const url = `https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${ticker}&from=${fromDate}&token=${finnhub_api}`;

  try {
      const response = await axios.get(url);
      const data = response.data.data; // Assume data is in the 'data' property of the response
      const summary = calculateSentimentSummary(data);
      res.json(summary);
  } catch (error) {
      console.error('Error fetching insider sentiment data:', error);
      res.status(500).json({ error: 'Failed to fetch insider sentiment data' });
  }
});

app.get('/volumechart', async (req, res) => {
  const stock_name = req.query.text;
  if (!stock_name) {
      res.status(400).send('Symbol parameter is required');
      return;
  }

  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setFullYear(toDate.getFullYear() - 2);
  const format = date => date.toISOString().split('T')[0];

  const url_polygon = `https://api.polygon.io/v2/aggs/ticker/${stock_name}/range/1/day/${format(fromDate)}/${format(toDate)}?adjusted=true&sort=asc&apiKey=${polygon_api}`;

  try {
      const response = await axios.get(url_polygon);
      const data = response.data.results;

      const formattedData = data.map(item => {
          const date = new Date(item.t);
          const formattedDate = date.toISOString().split('T')[0]; // Converts timestamp to yyyy-mm-dd format
          return [item.t, item.o, item.h, item.l, item.c, item.v];
      });

      res.json(formattedData);
  } catch (error) {
      console.error(`ERROR_DEBUG: Error fetching data from Polygon:`, error);
      res.status(500).send('Error fetching data');
  }
});


mongoose.connect(mongoDB_connec_str)
  .then((result) => {
    console.log("MongoDB connected wohoooo!!!!!!.........");
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

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
app.post('/buy', async (req, res) => {
  console.log(req.body);

    const { ticker, companyName, qty, currentStockPrice } = req.body;
    console.log(ticker, companyName, qty, currentStockPrice);
    // Check if all required parameters are provided
    if (!ticker || !companyName || qty === undefined || !currentStockPrice) {
        return res.status(400).json({ error: 'All parameters (ticker, companyName, qty, currentStockPrice) are required' });
    }

    try {
        // Retrieve the user's portfolio from the database or create a new one if it doesn't exist
        let portfolio = await UserPortfolio.findOne({});
        if (!portfolio) {
            portfolio = new UserPortfolio({ moneyInWallet: 25000, stocks: [] }); // Assuming a default starting wallet amount
        }

        // Check if the user has enough money to buy the stocks
        const totalCost = qty * currentStockPrice;
        if (portfolio.moneyInWallet < totalCost) {
            return res.status(400).json({ error: 'Not enough money to buy the stocks' });
        }

        // Find if the stock already exists in the user's portfolio
        const stockIndex = portfolio.stocks.findIndex(stock => stock.stock_ticker === ticker);

        if (stockIndex >= 0) {
            // Update the quantity and average price per share if the stock exists
            let existingStock = portfolio.stocks[stockIndex];
            const totalQuantity = existingStock.quantity_owned + qty;
            existingStock.stock_avg_price_per_share = parseFloat(
              (((existingStock.stock_avg_price_per_share * existingStock.quantity_owned) + 
              (currentStockPrice * qty)) / totalQuantity).toFixed(2)
          );
                      existingStock.quantity_owned = totalQuantity;
        } else {
            // Add the new stock to the portfolio if it doesn't exist
            portfolio.stocks.push({
                stock_ticker: ticker,
                stock_company_name: companyName,
                quantity_owned: qty,
                stock_avg_price_per_share: currentStockPrice
            });
        }

        // Decrease the money in the wallet
        portfolio.moneyInWallet -= totalCost;

        // Save the updated portfolio to the database
        await portfolio.save();

        // Respond with a success message without returning the entire portfolio
        res.json({ message: 'Stock purchase successful' });
    } catch (error) {
        console.error('Error processing stock purchase:', error);
        res.status(500).json({ error: 'Error processing stock purchase' });
    }
  });
app.post('/sell', async (req, res) => {
  console.log(req.body);
  const { ticker, qty, currentStockPrice } = req.body;

  // Check if all required parameters are provided
  if (!ticker || qty === undefined || !currentStockPrice) {
      return res.status(400).json({ error: 'All parameters (ticker, qty, currentStockPrice) are required' });
  }

  try {
      // Retrieve the user's portfolio from the database
      let portfolio = await UserPortfolio.findOne({});
      if (!portfolio) {
          return res.status(404).json({ error: 'Portfolio not found' });
      }

      // Find the stock in the user's portfolio
      const stockIndex = portfolio.stocks.findIndex(stock => stock.stock_ticker === ticker);

      if (stockIndex === -1) {
          return res.status(404).json({ error: 'Stock not found in portfolio' });
      }

      let existingStock = portfolio.stocks[stockIndex];

      // Check if the user has enough of the stock to sell
      if (existingStock.quantity_owned < qty) {
          return res.status(400).json({ error: 'Not enough stock quantity to sell' });
      }

      // Update the quantity of the stock in the portfolio
      existingStock.quantity_owned -= qty;

      // Increase the money in the wallet
      portfolio.moneyInWallet += qty * currentStockPrice;

      // Remove the stock from the portfolio if the quantity owned reaches 0
      if (existingStock.quantity_owned === 0) {
          portfolio.stocks.splice(stockIndex, 1);
      }

      // Save the updated portfolio to the database
      await portfolio.save();

      // Respond with a success message
      res.json({ message: 'Stock sale successful' });
  } catch (error) {
      console.error('Error processing stock sale:', error);
      res.status(500).json({ error: 'Error processing stock sale' });
  }
});

app.get('/fetch', async (req, res) => {
  try {
      const portfolio = await UserPortfolio.findOne({});
      if (!portfolio) {
          return res.status(404).json({ error: 'Portfolio not found' });
      }

      // Fetch the current stock price for each stock in the portfolio
      const stockPricePromises = portfolio.stocks.map(async (stock) => {
          const quote_url = `https://finnhub.io/api/v1/quote?symbol=${stock.stock_ticker}&token=${finnhub_api}`;
          try {
              const response = await axios.get(quote_url);
              if (response.data && 'c' in response.data) {
                  return { ...stock._doc, currentPrice: response.data.c };
              } else {
                  return { ...stock._doc, currentPrice: null };
              }
          } catch (error) {
              console.error(`Error fetching quote data for ${stock.stock_ticker}:`, error);
              return { ...stock._doc, currentPrice: null };
          }
      });

      const updatedStocks = await Promise.all(stockPricePromises);

      // Return the portfolio with the current prices included
      res.json({ ...portfolio._doc, stocks: updatedStocks });
  } catch (error) {
      console.error('Error fetching portfolio:', error);
      res.status(500).json({ error: 'Error fetching portfolio' });
  }
});

app.get('/fetch_big', async (req, res) => {
  try {
      const portfolio = await UserPortfolio.findOne({});
      if (!portfolio) {
          return res.status(404).json({ error: 'Portfolio not found' });
      }

      // Fetch the current stock price and company name for each stock in the portfolio
      const stockDetailsPromises = portfolio.stocks.map(async (stock) => {
          const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${stock.stock_ticker}&token=${finnhub_api}`;
          const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${stock.stock_ticker}&token=${finnhub_api}`;

          try {
              const [quoteResponse, profileResponse] = await Promise.all([
                  axios.get(quoteUrl),
                  axios.get(profileUrl)
              ]);

              let currentPrice = null;
              if (quoteResponse.data && 'c' in quoteResponse.data) {
                  currentPrice = quoteResponse.data.c;
              }

              let companyName = profileResponse.data?.name || null;

              return { ...stock._doc, currentPrice, stock_company_name: companyName };
          } catch (error) {
              console.error(`Error fetching data for ${stock.stock_ticker}:`, error);
              return { ...stock._doc, currentPrice: null, stock_company_name: null };
          }
      });

      const updatedStocks = await Promise.all(stockDetailsPromises);

      // Return the portfolio with the current prices and company names included
      res.json({ ...portfolio._doc, stocks: updatedStocks });
  } catch (error) {
      console.error('Error fetching portfolio:', error);
      res.status(500).json({ error: 'Error fetching portfolio' });
  }
});

app.post('/add-stock', async (req, res) => {
  const { stock_ticker, stock_company_name } = req.body;

  if (!stock_ticker || !stock_company_name) {
    return res.status(400).json({ error: 'Both stock ticker and company name are required' });
  }

  try {
    const newStockInfo = new StockInfo({ stock_ticker, stock_company_name });
    const savedStockInfo = await newStockInfo.save();
    res.status(201).json(savedStockInfo);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Stock ticker already exists' });
    }
    console.error('Error adding stock info:', error);
    res.status(500).json({ error: 'Error adding stock info' });
  }
});

app.delete('/remove-stock', async (req, res) => {
  const { stock_ticker } = req.body;

  if (!stock_ticker) {
    return res.status(400).json({ error: 'Stock ticker is required' });
  }

  try {
    const result = await StockInfo.deleteOne({ stock_ticker: stock_ticker });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Stock ticker not found' });
    }
    res.json({ message: 'Stock info deleted successfully' });
  } catch (error) {
    console.error('Error removing stock info:', error);
    res.status(500).json({ error: 'Error removing stock info' });
  }
});

app.get('/fetch-stocks', async (req, res) => {
  try {
    const allStocks = await StockInfo.find({});
    res.json(allStocks);
  } catch (error) {
    console.error('Error fetching stock info:', error);
    res.status(500).json({ error: 'Error fetching stock info' });
  }
});

app.delete('/reset-portfolio', async (req, res) => {
  try {
    await UserPortfolio.deleteMany({});  // This deletes all documents in the UserPortfolio collection
    res.json({ message: 'Portfolio reset successfully' });
  } catch (error) {
    console.error('Error resetting portfolio:', error);
    res.status(500).json({ error: 'Error resetting portfolio' });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post('/init', async (req, res) => {
  console.log(req.body);

    const { ticker, companyName, qty, currentStockPrice } = req.body;
    // console.log(ticker, companyName, qty, currentStockPrice);
    // // Check if all required parameters are provided
    // if (!ticker || !companyName || qty === undefined || !currentStockPrice) {
    //     return res.status(400).json({ error: 'All parameters (ticker, companyName, qty, currentStockPrice) are required' });
    // }

    // try {
    //     // Retrieve the user's portfolio from the database or create a new one if it doesn't exist
        let portfolio = await UserPortfolio.findOne({});
    //     if (!portfolio) {
    //         portfolio = new UserPortfolio({ moneyInWallet: 25000, stocks: [] }); // Assuming a default starting wallet amount
    //     }

    //     // Check if the user has enough money to buy the stocks
    //     const totalCost = qty * currentStockPrice;
    //     if (portfolio.moneyInWallet < totalCost) {
    //         return res.status(400).json({ error: 'Not enough money to buy the stocks' });
    //     }

    //     // Find if the stock already exists in the user's portfolio
    //     const stockIndex = portfolio.stocks.findIndex(stock => stock.stock_ticker === ticker);

    //     if (stockIndex >= 0) {
    //         // Update the quantity and average price per share if the stock exists
    //         let existingStock = portfolio.stocks[stockIndex];
    //         const totalQuantity = existingStock.quantity_owned + qty;
    //         existingStock.stock_avg_price_per_share = parseFloat(
    //           (((existingStock.stock_avg_price_per_share * existingStock.quantity_owned) + 
    //           (currentStockPrice * qty)) / totalQuantity).toFixed(2)
    //       );
    //                   existingStock.quantity_owned = totalQuantity;
    //     } else {
    //         // Add the new stock to the portfolio if it doesn't exist
    //         portfolio.stocks.push({
    //             stock_ticker: ticker,
    //             stock_company_name: companyName,
    //             quantity_owned: qty,
    //             stock_avg_price_per_share: currentStockPrice
    //         });
    //     }

        // Decrease the money in the wallet
        portfolio.moneyInWallet = 25000;
        portfolio.stocks = [];

        // Save the updated portfolio to the database
        await portfolio.save();

        // Respond with a success message without returning the entire portfolio
        res.json({ message: 'Stock purchase successful' });
    // } catch (error) {
    //     console.error('Error processing stock purchase:', error);
    //     res.status(500).json({ error: 'Error processing stock purchase' });
    // }
  });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
