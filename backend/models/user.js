const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Existing fields
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    ProfileImage: {
      type: String,
      required: false,
    },

    portfolio_name: {
      type: String,
      required: false,
    },

    stock_holdings: [
      {
        stock_symbol: {
          type: String,
          required: false,
        },
        quantity: {
          type: Number,
          required: false,
        },
        purchase_price: {
          type: Number,
          required: false,
        },
        purchase_date: {
          type: Date,
          required: false,
        },
      },
    ],

    // New field: transaction_history
    transaction_history: [
      {
        type: {
          type: String, // 'buy' or 'sell'
          required: true,
        },
        stock_symbol: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    cash_holding: {
      cash_in_hand: {
        type: Number,
        default: 10000000,
        required: false,
      },
      intraday_profit_loss: {
        type: Number,
        default: 0,
        required: false,
      },
    },

    intraday_holdings: {
      intraday_buy: {
        type: Number,
        default: 0,
        required: false,
      },
      intraday_sell: {
        type: Number,
        default: 0,
        required: false,
      },
    },
    access_token: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("Users", userSchema, "USERS");
module.exports = User;
