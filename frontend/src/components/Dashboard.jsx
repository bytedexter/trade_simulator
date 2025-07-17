import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StockCard from "./StockCard";
import PendingOrderCard from "./PendingOrderCard";
import axios from "axios";
import moment from "moment-timezone";
import { Mosaic } from "react-loading-indicators";

import {
  ChevronLeft,
  ChevronRight,
  Home,
  Briefcase,
  List,
  TrendingUp,
  Newspaper,
  BookOpen,
  User,
  LogOut,
} from "lucide-react";


const Dashboard = () => {
  const [userDetails, setUserDetails] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isExpanded, setIsExpanded] = useState(true);

  // useEffect(() => {
  //   // Fetch pending orders
  //   const fetchPendingOrders = async () => {
  //     try {
  //       const token = localStorage.getItem("authToken");
  //       if (!token) {
  //         console.error("No auth token found. Redirecting to login.");
  //         navigate("/signin");
  //         return;
  //       }
        
  //       const response = await axios.get(
  //         "http://localhost:8000/api/users/pending-orders",  // Ensure URL points to the correct server/port
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,  // Pass the token in the headers
  //           },
  //         }
  //       );
        
  //       setPendingOrders(response.data);
  //     } catch (error) {
  //       console.error("Error fetching pending orders:", error.response?.data || error.message);
  //     }
  //   };
  
  //   fetchPendingOrders();
  // }, []);
  

  useEffect(() => {
  const fetchPendingOrders = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found. Redirecting to login.");
        navigate("/signin");
        return;
      }

      const response = await axios.get(
        "http://localhost:8000/api/users/getPendingOrders", // ✅ Make sure the endpoint matches your Express route
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPendingOrders(response.data);
    } catch (error) {
      console.error("Error fetching pending orders:", error.response?.data || error.message);
    }
  };

  fetchPendingOrders();
}, []);


  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        console.log("User details:", response.data);
        setUserDetails(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Mosaic color="#32cd32" size="medium" text="" textColor="" />
      </div>
    );
  }

  const logout = () => {
    localStorage.removeItem("authToken");
    console.clear();
    navigate("/");
  };

  const transactionHistory = userDetails.transaction_history;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactionHistory.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const sidebarItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/portfolio", icon: Briefcase, label: "Portfolio" },
    { path: "/watchlist", icon: List, label: "Watchlist" },
    { path: "/trading", icon: TrendingUp, label: "Trading" },
    { path: "/news", icon: Newspaper, label: "News" },
    { path: "/learn", icon: BookOpen, label: "Learn" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const sidebarVariants = {
    expanded: { width: "15rem" },
    collapsed: { width: "6rem" },
  };

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  return (
    <div className="flex bg-gray-100">
      <motion.aside
        initial="expanded"
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-b from-blue-600 to-blue-800 text-white fixed h-screen overflow-hidden"
      >
        <div className="p-6 flex flex-col h-full">
          <motion.h1
            initial={{ opacity: 1 }}
            animate={{ opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-2xl font-bold mb-8"
          >
            {isExpanded ? "StockTrader Pro" : ""}
          </motion.h1>
          <nav className="flex-grow">
            <ul>
              <AnimatePresence>
                {sidebarItems.map((item) => (
                  <motion.li
                    key={item.path}
                    whileHover={{ scale: 1.05, originX: 0 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="mb-4"
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${
                        location.pathname === item.path
                          ? "bg-blue-700 text-white"
                          : "text-blue-100 hover:bg-blue-700 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {isExpanded && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </Link>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </nav>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="flex items-center p-2 rounded-lg transition-colors duration-200 text-blue-100 hover:bg-blue-700 hover:text-white w-full mt-auto"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {isExpanded && <span>Log Out</span>}
          </motion.button>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className="absolute top-7 right-1 bg-blue-500 text-white p-1 rounded-full"
        >
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </motion.button>
      </motion.aside>

      <main
        className={`flex-1 p-6 ${
          isExpanded ? "ml-64" : "ml-20"
        } transition-all duration-300`}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-white rounded-lg shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Cash Holdings
            </h2>
            <p className="text-3xl font-bold text-green-600">
              ₹{userDetails.cash_holding.cash_in_hand.toFixed(2)}
            </p>
            <h2 className="text-xl font-semibold text-gray-700 my-4">
              Intraday Profit/Loss
            </h2>
            <p className="text-3xl font-bold text-green-600">
              ₹{userDetails.cash_holding.intraday_profit_loss}
            </p>
            <h2 className="text-xl font-semibold text-gray-700 my-4">
              Intraday Buy
            </h2>
            <p className="text-3xl font-bold text-green-600">
              ₹{userDetails.intraday_holdings.intraday_buy}
            </p>
            <h2 className="text-xl font-semibold text-gray-700 my-4">
              Intraday Sell
            </h2>
            <p className="text-3xl font-bold text-green-600">
              ₹{userDetails.intraday_holdings.intraday_sell}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 bg-white rounded-lg shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Pending Orders
            </h2>
            {pendingOrders.length === 0 ? (
              <div className="flex items-center justify-center bg-opacity-75 text-gray-500 rounded-lg h-full">
                <p>No Pending Orders yet.</p>
              </div>
            ) : (
              pendingOrders.map((order, index) => (
                <PendingOrderCard
                  key={index}
                  stockSymbol={order.ticker}
                  stockPrice={order.price}
                  orderType={order.orderType}
                  quantity={order.quantity}
                  side={order.type}
                  status={order.status}
                />
              ))
            )}
            </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-6 bg-white rounded-lg shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Market Overview
            </h2>
            <ul>
              <li className="flex justify-between items-center mb-2">
                <span>S&P 500</span>
                <span className="text-green-600">+1.2%</span>
              </li>
              <li className="flex justify-between items-center mb-2">
                <span>NASDAQ</span>
                <span className="text-red-600">-0.5%</span>
              </li>
              <li className="flex justify-between items-center">
                <span>DOW</span>
                <span className="text-green-600">+0.8%</span>
              </li>
            </ul>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-lg shadow-lg p-6 mt-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Transaction History
          </h2>
          <div className="overflow-x-auto">
            {transactionHistory.length === 0 ? (
              <div className="text-center text-gray-600">
                No transactions yet.
              </div>
            ) : (
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">S.No</th>
                    <th className="py-3 px-6 text-left">Stock</th>
                    <th className="py-3 px-6 text-right">Price</th>
                    <th className="py-3 px-6 text-center">Type</th>
                    <th className="py-3 px-6 text-right">Quantity</th>
                    <th className="py-3 px-6 text-right">Date (IST)</th>
                    <th className="py-3 px-6 text-right">Time (IST)</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  <AnimatePresence>
                    {currentTransactions.map((transaction, index) => {
                      const istDateTime = moment(transaction.timestamp).tz(
                        "Asia/Kolkata"
                      );
                      const date = istDateTime.format("YYYY-MM-DD");
                      const time = istDateTime.format("HH:mm:ss");
                      return (
                        <motion.tr
                          key={transaction._id} // Ensure each key is unique
                          className="border-b border-gray-200 hover:bg-gray-50 transition duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <td className="py-4 px-6 text-left whitespace-nowrap font-medium">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td className="py-4 px-6 text-left whitespace-nowrap font-medium">
                            {transaction.stock_symbol}
                          </td>
                          <td className="py-4 px-6 text-right font-medium">
                            ₹{transaction.price}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                transaction.type === "intraday Buy" ||
                                transaction.type === "buy"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {transaction.type}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-medium">
                            {transaction.quantity}
                          </td>
                          <td className="py-4 px-6 text-right font-medium">
                            {date}
                          </td>
                          <td className="py-4 px-6 text-right font-medium">
                            {time}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>
          {transactionHistory.length > 0 && (
            <div className="mt-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, transactionHistory.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {transactionHistory.length}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {Array.from({
                    length: Math.ceil(transactionHistory.length / itemsPerPage),
                  }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === index + 1
                          ? "bg-gray-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
