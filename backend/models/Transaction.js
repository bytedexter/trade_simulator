// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Users', 
    required: true 
  },
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
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

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
