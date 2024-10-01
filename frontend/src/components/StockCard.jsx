import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BuyStock from "../modals/BuyStock";
import axios from "axios";
import { Mosaic } from "react-loading-indicators";

const StockCard = ({ stockSymbol, stockName, stockPrice, stockChange }) => {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/api/${stockSymbol}`
        );
        setCurrentPrice(response.data.market_price);
      } catch (error) {
        console.error("Error fetching stock price:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentPrice();
  }, [stockSymbol]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Mosaic color="#32cd32" size="medium" text="" textColor="" />
      </div>
    );
  }

  return (
    <div className="relative p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-xl font-semibold text-gray-800">{stockSymbol}</h3>
      <div className="mt-2">
        <span className="text-2xl font-bold text-gray-900">
          <span className="text-2xl font-semibold text-green-500">
            Sold At:{" "}
          </span>
          ₹{stockPrice}
        </span>
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold text-gray-900">
          <span className="text-2xl font-semibold text-red-500">
            Current Price:{" "}
          </span>
          ₹{currentPrice}
        </span>
      </div>
      <BuyStock />
    </div>
  );
};

export default StockCard;
