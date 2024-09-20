import { Schema, model } from 'mongoose';

const gttSellBookSchema = new Schema({
    user_id: [{
        type: Schema.Types.ObjectId,
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

const gttBook = model('GTT_Sell_Book', gttSellBookSchema, "GTT_SELL_BOOK");
export default gttBook;