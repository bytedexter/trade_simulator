// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Users', 
    required: true 
  },
  ticker: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['buy', 'sell', 'short'], 
    required: true 
  },
  orderType: { 
    type: String, 
    enum: ['market', 'limit', 'gtt'], 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  // only for GTT
  triggerPrice: { 
    type: Number 
  }, 
  status: { 
    type: String, 
    enum: ['pending', 'filled', 'partially-filled', 'cancelled'], 
    default: 'pending' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now
   }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;