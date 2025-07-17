const mongoose = require('mongoose');

// models/Holding.js
const holdingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Users', 
    required: true 
  },
  ticker: { 
    type: String, 
    required: true  
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  averagePrice: { 
    type: Number, 
    required: true 
  }
});

const Holdings = mongoose.model('Holdings', holdingSchema);
module.exports = Holdings;