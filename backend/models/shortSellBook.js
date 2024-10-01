const mongoose = require('mongoose');

const gttSellBookSchema = new mongoose.Schema({
    user_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    }],
    stock_symbol: {
        type: String,
        required: true,
        unique: true,
    },
    trigger_price: {
        type: Number,
        required: true,
        unique: true
    },
    created_at: {
        type: Number,
        required: true,
        unique: true
    },
    }, {
    timestamps: true
})

const shortSellBook = mongoose.model('GTT_Sell_Book', gttSellBookSchema, "SHORT_SELL_BOOK");
module.exports= shortSellBook;