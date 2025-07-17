// models/TradeLog.js
const mongoose = require('mongoose');

const tradeLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Users', 
    required: true 
  },
  ticker: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['buy', 'sell', 'short'], 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  volume: { 
    type: Number, 
    required: true 
  },
  fees: { 
    type: Number, 
    default: 0 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const TradeLog = mongoose.model('TradeLog', tradeLogSchema);
module.exports = TradeLog;