const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const constants = require("../constants");

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
    // Extract the ID from the authenticated user
    const id = req.user._id;

    // Fetch and return the specific student if id is provided
    if (id) {
      const user = await User.findById(id);
      if (user) {
        return res.status(constants.OK).json(user);
      } else {
        return res.status(constants.NOT_FOUND).json({ message: 'User not found' });
      }
    } else {
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


const Sign_out = asyncHandler(async (req, res) => {
  // Invalidate the token on the client side
  res.status(200).json({ message: "User signed out successfully" });
});



module.exports = {
  Sign_up,
  Sign_in,
  Sign_out,
  userProfile,
  updatePortfolio,
  resetPortfolio
};