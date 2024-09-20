import { Schema, model } from "mongoose";

const gttBookSchema = new Schema(
  {
    user_id: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
      },
    ],
    stock_symbol: {
      type: String,
      required: true,
      unique: true,
    },
    trigger_price: {
      type: Number,
      required: true,
      unique: true,
    },
    order_type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const gttBook = model("GTT_Book", gttBookSchema, "GTT_BOOK");
export default gttBook;
