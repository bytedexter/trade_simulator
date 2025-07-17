import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BuyStock from "../modals/BuyStock";
import axios from "axios";
import { Mosaic } from "react-loading-indicators";

const PendingOrderCard = ({ stockSymbol, stockName, stockPrice, stockChange, side }) => {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/stock-data?ticker=${stockSymbol}&period=1d&interval=1d`
        );
        const candleData = response.data;
        if(candleData && candleData.length > 0){
            const lastCandle = candleData[candleData.length - 1];
            setCurrentPrice(lastCandle.Close.toFixed(2));
        }
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
            Limit Price:{" "}
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
      <div className="mt-2">
        <span className="text-2xl font-bold text-gray-900">
          <span className="text-2xl font-semibold text-red-500">
            Order type:{" "}
          </span>
          {side}
        </span>
      </div>
      <BuyStock />
    </div>
  );
};

export default PendingOrderCard;
