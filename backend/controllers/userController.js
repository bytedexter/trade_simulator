const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const constants = require("../constants");
const shortSellBook = require("../models/shortSellBook");
const Order = require('../models/Order');
const axios = require('axios'); // Add this line at the top

// Sign-up function
const Sign_up = asyncHandler(async (req, res) => {
  const { email, password, name} = req.body;

  // Validate request
  if (!email || !password || !name) {
    return res.status(400).json("All fields are required");
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = {
    email,
    password: hashedPassword,
    name,
  };

  const user = await User.create(newUser);

  // Generate JWT without expiration
  const accessToken = jwt.sign(
    {
      user: {
        _id: user._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET
  );

  // Assign token to user and save
  user.access_token = accessToken;
  await user.save();

  // Respond with the access token
  res.json({ accessToken });
});

// Sign-in function
const Sign_in = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate request
  if (!email || !password) {
    return res.status(400).json("All fields are required");
  }

  // Check if user exists
  const userAvailable = await User.findOne({ email });

  if (userAvailable && (await bcrypt.compare(password, userAvailable.password))) {
    // Generate JWT with expiration
    const accessToken = jwt.sign(
      {
        user: {
          _id: userAvailable._id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    // Respond with the access token
    res.json({ accessToken });
  }
  else if(!userAvailable) {
    res.status(401).json("Please Sign-Up first");
  }
  else {
    res.status(401).json("Invalid email or password");
  }
});

const userProfile = asyncHandler(async (req, res) => {
  try {
    console.log('[DEBUG] req.user:', req.user);
    // Extract the ID from the authenticated user
    const id = req.user._id;
    console.log('[DEBUG] User ID:', id);

    // Fetch and return the specific student if id is provided
    if (id) {
      const user = await User.findById(id);
      console.log('[DEBUG] User from DB:', user);

      if (user) {
        console.log('[DEBUG] User email exists:', !!user.email);
        console.log('[DEBUG] Full user object:', JSON.stringify(user, null, 2));
        return res.status(constants.OK).json(user);
      } else {
        console.error('[ERROR] User not found in database');
        return res.status(constants.NOT_FOUND).json({ message: 'User not found' });
      }
    } else {
      console.warn('[WARNING] No user ID found in request');
      // Fetch and return all students if no id is provided (optional, adjust as needed)
      const users = await User.find({});
      return res.status(constants.OK).json(users);
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(constants.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
});

const updatePortfolio = asyncHandler(async (req, res) => {
  try {
    const { email, intraday_buy, intraday_sell, cash_holding, stock_holdings, transaction_history } = req.body;
    
    if(!intraday_buy){
      const user = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            'intraday_holdings.intraday_sell': intraday_sell,
            'cash_holding.cash_in_hand': cash_holding,
            'stock_holdings': stock_holdings,
            'transaction_history': transaction_history
          }
        },
        { new: true }
      );
      if (!user) {
        return res.status(constants.NOT_FOUND).json({ message: 'User not found' });
      }
      res.status(constants.OK).json({ message: 'Portfolio updated successfully', user });
    }
    else{
      const user = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            'intraday_holdings.intraday_buy': intraday_buy,
            'cash_holding.cash_in_hand': cash_holding,
            'stock_holdings': stock_holdings,
            'transaction_history': transaction_history
          }
        },
        { new: true }
      )
      if (!user) {
        return res.status(constants.NOT_FOUND).json({ message: 'User not found' });
      }
  
      res.status(constants.OK).json({ message: 'Portfolio updated successfully', user });
    }
  } catch (error) {
    console.error('Error updating portfolio:', error);
    res.status(constants.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
});

const resetPortfolio = asyncHandler(async (req, res) => {
  const { email } = req.body; // Get the user's email from the request body

  // Default values for resetting the portfolio
  const resetPortfolio = {
    cash_holding: {
      cash_in_hand: 10000000, // Reset to initial cash value, e.g., 10 million
      intraday_profit_loss: 0
    },
    intraday_holdings: {
      intraday_buy: 0,
      intraday_sell: 0
    },
    stock_holdings: [], // Clear all stock holdings
    transaction_history: [],
    stock_holdings:[] // Clear transaction history
  };

  try {
    // Find the user by email and update their portfolio with reset values
    const result = await User.findOneAndUpdate(
      { email: email },
      { $set: resetPortfolio },
      { new: true } // Return the updated document
    );

    if (!result) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json({ message: 'Portfolio reset successfully', user: result });
    }
  } catch (err) {
    console.error('Error resetting portfolio:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const pendingOrders = asyncHandler(async (req, res) => {
  try {
    // Extract the ID from the authenticated user
    const id = req.user._id;

    // Fetch and return the pending orders for the specific user
    if (id) {
      const pendingOrders = await shortSellBook.find({ user_id: id });
      if (pendingOrders.length > 0) {
        return res.status(constants.OK).json(pendingOrders);
      } else {
        return res.status(constants.NOT_FOUND).json({ message: 'No pending orders found for this user' });
      }
    } else {
      return res.status(constants.BAD_REQUEST).json({ message: 'User ID is required' });
    }
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    res.status(constants.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
});

const Sign_out = asyncHandler(async (req, res) => {
  // Invalidate the token on the client side
  res.status(200).json({ message: "User signed out successfully" });
});


const getStockData = async (req, res) => {
  try {
    const tickers = req.query.ticker || 'AAPL';
    const period = req.query.period || '6mo';
    const interval = req.query.interval || '1d';
    
    const pythonApiUrl = `http://localhost:5000/api/stock-data?ticker=${tickers}&period=${period}&interval=${interval}`;
    const response = await axios.get(pythonApiUrl);
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
};


// Buy Order Logic
const placeBuyOrder = asyncHandler(async (req, res) => {
  try {
    const email=req.user.email;
    const { ticker, quantity, price } = req.body;
    const totalCost = quantity * price;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.cash_holding.cash_in_hand < totalCost) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }
    user.cash_holding.cash_in_hand -= totalCost;
    const existing = user.stock_holdings.find(h => h.stock_symbol === ticker);
    if (existing) {
      existing.quantity += quantity;
      existing.purchase_price = price;
      existing.purchase_date.push(new Date());
    } else {
      user.stock_holdings.push({
        stock_symbol: ticker,
        quantity,
        purchase_price: price,
        purchase_date: [new Date()],
      });
    }
    user.transaction_history.push({
      type: 'buy',
      stock_symbol: ticker,
      quantity,
      price,
      totalCost,
      purchase_date: new Date(),
    });
    await user.save();
    res.status(200).json({ message: 'Buy order placed successfully' });
  } catch (err) {
    console.error('Buy Order Error:', err);
    res.status(500).json({ message: 'Buy order failed' });
  }
});


// Sell Order Logic
const placeSellOrder = asyncHandler(async (req, res) => {
  try {
    const email = req.user.email;
    const { ticker, quantity, price } = req.body;
    const totalAmount = quantity * price;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const holding = user.stock_holdings.find(h => h.stock_symbol === ticker);
    console.log(holding);
    if (!holding || holding.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock holdings to sell' });
    }

    // Deduct quantity
    holding.quantity -= quantity;

    // If quantity becomes 0, remove that holding
    if (holding.quantity === 0) {
      user.stock_holdings = user.stock_holdings.filter(h => h.stock_symbol !== ticker);
    }

    // Add to cash in hand
    user.cash_holding.cash_in_hand += totalAmount;

    // Log the transaction
    user.transaction_history.push({
      type: 'sell',
      stock_symbol: ticker,
      quantity,
      price,
      totalCost: totalAmount,
      purchase_date: new Date(),
    });

    await user.save();

    res.status(200).json({ message: 'Sell order placed successfully' });
  } catch (err) {
    console.error('Sell Order Error:', err);
    res.status(500).json({ message: 'Sell order failed' });
  }
});


const placeLimitOrder = asyncHandler(async (req, res) => {
  const email = req.user.email;
  const { ticker, quantity, limitPrice, orderSide } = req.body;

  if (!ticker || !quantity || !limitPrice || !orderSide) {
    return res.status(400).json({ 
      message: "All fields are required",
      missing:{
        ticker:!!ticker,
        quantity:!!quantity,
        limitPrice:!!limitPrice,
        orderSide:!!orderSide
      }
     });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  // For buy order: ensure user has sufficient funds
  if (orderSide === 'buy') {
    const estimatedCost = quantity * limitPrice;
    if (user.cash_holding.cash_in_hand < estimatedCost) {
      return res.status(400).json({ message: "Insufficient funds for limit buy" });
    }
  }

  // For sell order: ensure user owns enough quantity
  if (orderSide === 'sell') {
    const holding = user.stock_holdings.find(h => h.stock_symbol === ticker);
    if (!holding || holding.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock to sell" });
    }
  }

  await Order.create({
    userId: user._id,
    ticker,
    quantity,
    price:limitPrice,
    type: orderSide,
    orderType: 'limit'
  });

  return res.status(202).json({ message: `Limit ${orderSide} order queued successfully` });
});


const getPendingOrders = asyncHandler(async (req, res) => {
  const email = req.user.email;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const pendingOrders = await Order.find({
    userId: user._id,
    status: 'pending'
  });

  res.status(200).json(pendingOrders);
});

module.exports = {
  Sign_up,
  Sign_in,
  Sign_out,
  userProfile,
  updatePortfolio,
  resetPortfolio,
  pendingOrders,
  getStockData,
  placeBuyOrder,
  placeSellOrder,
  placeLimitOrder,
  getPendingOrders
};