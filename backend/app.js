const express = require('express');
const cors = require('cors');
const User = require('./models/user'); // Adjust the path as necessary
const connectDb = require('./config/db'); // Adjust the path as necessary

const app = express();

const PORT = process.env.PORT || 8000;

// Example endpoint to update transaction history
app.post('/api/transaction', async (req, res) => {
  try {
    const { userId, transaction } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.transaction_history.push(transaction);
    await user.save();

    // Emit the updated transaction history to all connected clients
    io.emit('updateTransactionHistory', user.transaction_history);

    res.status(200).json(user.transaction_history);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Connect to MongoDB
connectDb();

// Middleware
app.use(express.json());

// Use CORS middleware to allow all origins
app.use(cors());

// Routes
app.use("/api/users", require("./routes/userRoutes")); // Adjust the path as necessary

app.get("/api", (req, res) => {
  res.send("Welcome to the TradePro Backend");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});