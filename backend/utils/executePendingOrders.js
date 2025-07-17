const Order = require('../models/Order'); // adjust if path differs
const User = require('../models/user');   // adjust path accordingly
const axios = require('axios');

const executePendingOrders = async () => {
  try {
    // 1. Fetch all pending limit orders
    const pendingOrders = await Order.find({ orderType: 'limit', status: 'pending' });

    for (const order of pendingOrders) {
      const { ticker, quantity, price: limitPrice, type: orderSide, userId } = order;

      // 2. Fetch current price (from Python backend)
      const response = await axios.get(`http://localhost:5000/api/stock-data?ticker=${ticker}&period=1d&interval=1d`);
      const candleData=response.data;
      let currentPrice = null;
      if(candleData && candleData.length > 0){
        const lastCandle = candleData[candleData.length - 1];
        currentPrice=lastCandle.Close;
      }
      if (!currentPrice) {
        console.log(`⚠️ No current price found for ${ticker}, skipping...`);
        continue;
       }
      const user = await User.findById(userId);
      if (!user) continue;

      let shouldExecute = false;

      if (orderSide === 'buy' && currentPrice <= limitPrice) {
        const cost = currentPrice * quantity;
        if (user.cash_holding.cash_in_hand >= cost) {
          user.cash_holding.cash_in_hand -= cost;
          user.stock_holdings.push({
            stock_symbol: ticker,
            quantity,
            avg_price: currentPrice
          });
          shouldExecute = true;
        }
      }

      if (orderSide === 'sell' && currentPrice >= limitPrice) {
        const holding = user.stock_holdings.find(h => h.stock_symbol === ticker);
        if (holding && holding.quantity >= quantity) {
          holding.quantity -= quantity;
          user.cash_holding.cash_in_hand += currentPrice * quantity;
          shouldExecute = true;
        }
      }

      if (shouldExecute) {
        user.transaction_history.push({
            type: orderSide,
            stock_symbol: ticker,
            quantity,
            price: currentPrice,
            totalCost: currentPrice * quantity,
            purchase_date: new Date(),
        });
        await user.save();
        
        order.status = 'filled';
        order.executedAt = new Date();
        await order.save();

        console.log(`✅ Order ${order._id} executed.`);
      }
    }
  } catch (err) {
    console.error('Error executing pending orders:', err.message);
  }
};

module.exports = executePendingOrders;
