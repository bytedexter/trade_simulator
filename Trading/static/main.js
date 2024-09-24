// Ensure all necessary scripts are included in your HTML:
// <script src="https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js"></script>
// <script src="https://unpkg.com/flowbite@1.4.7/dist/flowbite.js"></script>

// Chart options
const chartOptions1 = {
  layout: {
    background: { type: "solid", color: "white" },
    textColor: "black",
  },
  grid: {
    vertLines: {
      color: "#e1e1e1",
    },
    horzLines: {
      color: "#e1e1e1",
    },
  },
  crosshair: {
    mode: LightweightCharts.CrosshairMode.Normal,
  },
  timeScale: {
    visible: false,
  },
  width: document.getElementById("chart").clientWidth,
  height: document.getElementById("chart").clientHeight,
};

const chartOptions2 = {
  layout: {
    background: { type: "solid", color: "white" },
    textColor: "black",
  },
  grid: {
    vertLines: {
      color: "#e1e1e1",
    },
    horzLines: {
      color: "#e1e1e1",
    },
  },
  timeScale: {
    visible: true,
  },
  width: document.getElementById("chart").clientWidth,
  height: document.getElementById("rsiChart").clientHeight,
};

// Create charts
const chart = LightweightCharts.createChart(
  document.getElementById("chart"),
  chartOptions1
);
const candlestickSeries = chart.addCandlestickSeries();
const emaLine = chart.addLineSeries({
  color: "blue",
  lineWidth: 2,
});

const rsiChart = LightweightCharts.createChart(
  document.getElementById("rsiChart"),
  chartOptions2
);
const rsiLine = rsiChart.addLineSeries({
  color: "red",
  lineWidth: 2,
});

let autoUpdateInterval;

// Fetch data function
function fetchData(ticker, timeframe, emaPeriod, rsiPeriod) {
  fetch(`/api/data/${ticker}/${timeframe}/${emaPeriod}/${rsiPeriod}`)
    .then((response) => response.json())
    .then((data) => {
      candlestickSeries.setData(data.candlestick);
      emaLine.setData(data.ema);
      rsiLine.setData(data.rsi);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

// Fetch default data on page load
const tickerInput = document.getElementById("ticker");

function getUrlParams() {
  const params = {};
  window.location.search
    .substr(1)
    .split("&")
    .forEach(function (item) {
      const pair = item.split("=");
      if (pair[0]) {
        params[pair[0]] = decodeURIComponent(pair[1]);
      }
    });
  return params;
}

let userDetails = null;
window.addEventListener("load", () => {
  const urlParams = getUrlParams();
  if (urlParams.user) {
    try {
      userDetails = JSON.parse(urlParams.user);
      console.log("User details retrieved from URL:", userDetails);
    } catch (error) {
      console.error("Error parsing user details from URL:", error);
      userDetails = null;
    }
  } else {
    console.warn("No user details found in URL parameters.");
  }

  // Fetch default stock data
  fetchData("WIPRO.NS", "1d", 20, 14);
  tickerInput.value = "WIPRO.NS";
  loadWatchlist();
});

// Handle data fetching on button click
document.getElementById("fetchData").addEventListener("click", () => {
  const ticker = document.getElementById("ticker").value;
  const timeframe = document.getElementById("timeframe").value;
  const emaPeriod = document.getElementById("emaPeriod").value;
  const rsiPeriod = document.getElementById("rsiPeriod").value;
  fetchData(ticker, timeframe, emaPeriod, rsiPeriod);
});

// Handle auto-update functionality
document.getElementById("autoUpdate").addEventListener("change", (event) => {
  if (event.target.checked) {
    const frequency = document.getElementById("updateFrequency").value * 1000;
    autoUpdateInterval = setInterval(() => {
      const ticker = document.getElementById("ticker").value;
      const timeframe = document.getElementById("timeframe").value;
      const emaPeriod = document.getElementById("emaPeriod").value;
      const rsiPeriod = document.getElementById("rsiPeriod").value;
      fetchData(ticker, timeframe, emaPeriod, rsiPeriod);
    }, frequency);
  } else {
    clearInterval(autoUpdateInterval);
  }
});

// Handle window resize
window.addEventListener("resize", () => {
  chart.resize(
    document.getElementById("chart").clientWidth,
    document.getElementById("chart").clientHeight
  );
  rsiChart.resize(
    document.getElementById("rsiChart").clientWidth,
    document.getElementById("rsiChart").clientHeight
  );
});

// Theme toggle functionality
document.getElementById("themeToggle").addEventListener("click", () => {
  const bodyClassList = document.body.classList;
  const watchlist = document.getElementById("watchlist");
  const inputs = document.querySelectorAll("input, select");
  if (bodyClassList.contains("bg-white")) {
    bodyClassList.replace("bg-white", "bg-gray-900");
    bodyClassList.replace("text-black", "text-white");
    watchlist.classList.replace("bg-gray-100", "bg-gray-800");
    watchlist.classList.replace("text-black", "text-white");
    inputs.forEach((input) => {
      input.classList.replace("bg-white", "bg-gray-900");
      input.classList.replace("text-black", "text-white");
    });
    chart.applyOptions({
      layout: {
        background: { type: "solid", color: "black" },
        textColor: "white",
      },
      grid: {
        vertLines: {
          color: "black",
        },
        horzLines: {
          color: "black",
        },
      },
    });
    rsiChart.applyOptions({
      layout: {
        background: { type: "solid", color: "black" },
        textColor: "white",
      },
      grid: {
        vertLines: {
          color: "black",
        },
        horzLines: {
          color: "black",
        },
      },
    });
  } else {
    bodyClassList.replace("bg-gray-900", "bg-white");
    bodyClassList.replace("text-white", "text-black");
    watchlist.classList.replace("bg-gray-800", "bg-gray-100");
    watchlist.classList.replace("text-white", "text-black");
    inputs.forEach((input) => {
      input.classList.replace("bg-gray-900", "bg-white");
      input.classList.replace("text-white", "text-black");
    });
    chart.applyOptions({
      layout: {
        background: { type: "solid", color: "white" },
        textColor: "black",
      },
      grid: {
        vertLines: {
          color: "#e1e1e1",
        },
        horzLines: {
          color: "#e1e1e1",
        },
      },
    });
    rsiChart.applyOptions({
      layout: {
        background: { type: "solid", color: "white" },
        textColor: "black",
      },
      grid: {
        vertLines: {
          color: "#e1e1e1",
        },
        horzLines: {
          color: "#e1e1e1",
        },
      },
    });
  }
});

// Load watchlist symbols from the server
function loadWatchlist() {
  fetch("/api/symbols")
    .then((response) => response.json())
    .then((symbols) => {
      const watchlistItems = document.getElementById("watchlistItems");
      watchlistItems.innerHTML = "";
      symbols.forEach((symbol) => {
        const item = document.createElement("div");
        item.className = "watchlist-item";
        item.innerText = symbol;
        item.addEventListener("click", () => {
          document.getElementById("ticker").value = symbol;
          fetchData(
            symbol,
            document.getElementById("timeframe").value,
            document.getElementById("emaPeriod").value,
            document.getElementById("rsiPeriod").value
          );
        });
        watchlistItems.appendChild(item);
      });
    })
    .catch((error) => {
      console.error("Error loading watchlist:", error);
    });
}

// Sync visible logical range between charts
function syncVisibleLogicalRange(chart1, chart2) {
  chart1.timeScale().subscribeVisibleLogicalRangeChange((timeRange) => {
    chart2.timeScale().setVisibleLogicalRange(timeRange);
  });

  chart2.timeScale().subscribeVisibleLogicalRangeChange((timeRange) => {
    chart1.timeScale().setVisibleLogicalRange(timeRange);
  });
}

syncVisibleLogicalRange(chart, rsiChart);

// Sync crosshair position between charts
function getCrosshairDataPoint(series, param) {
  if (!param.time) {
    return null;
  }
  const dataPoint = param.seriesData.get(series);
  return dataPoint || null;
}

function syncCrosshair(chart, series, dataPoint) {
  if (dataPoint) {
    chart.setCrosshairPosition(dataPoint.value, dataPoint.time, series);
    return;
  }
  chart.clearCrosshairPosition();
}

chart.subscribeCrosshairMove((param) => {
  const dataPoint = getCrosshairDataPoint(candlestickSeries, param);
  syncCrosshair(rsiChart, rsiLine, dataPoint);
});

rsiChart.subscribeCrosshairMove((param) => {
  const dataPoint = getCrosshairDataPoint(rsiLine, param);
  syncCrosshair(chart, candlestickSeries, dataPoint);
});

const suggestionsDiv = document.getElementById("suggestions");

tickerInput.addEventListener("input", () => {
  const query = tickerInput.value.trim();
  if (query.length > 0) {
    fetch(`/api/search?q=${query}`)
      .then((response) => response.json())
      .then((stocks) => {
        if (stocks.length > 0) {
          suggestionsDiv.innerHTML = "";
          stocks.forEach((stock) => {
            const item = document.createElement("div");
            item.className = "p-2 hover:bg-gray-200 cursor-pointer";
            item.textContent = `${stock.company_name} (${stock.symbol})`;
            item.addEventListener("click", () => {
              tickerInput.value = `${stock.symbol}.NS`;
              suggestionsDiv.innerHTML = ""; // Clear suggestions
              fetchData(
                tickerInput.value,
                document.getElementById("timeframe").value,
                document.getElementById("emaPeriod").value,
                document.getElementById("rsiPeriod").value
              );
            });
            suggestionsDiv.appendChild(item);
          });
          suggestionsDiv.classList.remove("hidden");
        } else {
          suggestionsDiv.classList.add("hidden");
        }
      })
      .catch((error) =>
        console.error("Error fetching stock suggestions:", error)
      );
  } else {
    suggestionsDiv.classList.add("hidden");
  }
});

// Function to fetch and set the market price in the buy modal
function fetchAndSetModalBuyPrice(symbol) {
  fetch(`/api/${symbol}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.market_price) {
        const modalBuyPrice = document.getElementById("modalBuyPrice");
        if (modalBuyPrice) {
          modalBuyPrice.value = data.market_price; // Set the fetched price in buy modal
          console.log("Price fetched and set in buy modal");
        } else {
          console.error("modalBuyPrice element not found");
        }
      } else {
        console.error("Error fetching stock price:", data.error);
      }
    })
    .catch((error) => console.error("Error fetching stock price:", error));
}

// Function to fetch and set the market price in the sell modal
function fetchAndSetModalSellPrice(symbol) {
  fetch(`/api/${symbol}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.market_price) {
        const modalSellPrice = document.getElementById("modalSellPrice");
        if (modalSellPrice) {
          modalSellPrice.value = data.market_price; // Set the fetched price in sell modal
          console.log("Price fetched and set in sell modal");
        } else {
          console.error("modalSellPrice element not found");
        }
      } else {
        console.error("Error fetching stock price:", data.error);
      }
    })
    .catch((error) => console.error("Error fetching stock price:", error));
}

// Event listener for price option change in the buy modal
function handlePriceOptionChange() {
  const priceOption = document.querySelector(
    'input[name="priceOption"]:checked'
  ).value;
  const modalBuyPrice = document.getElementById("modalBuyPrice");
  if (priceOption === "market") {
    // Fetch and set the current market price in buy modal
    const symbol = document.getElementById("ticker").value;
    fetchAndSetModalBuyPrice(symbol);
    modalBuyPrice.readOnly = true;
  } else {
    // Allow user to input a trigger price in buy modal
    modalBuyPrice.value = "";
    modalBuyPrice.readOnly = false;
  }
}

document
  .getElementById("marketPriceOption")
  .addEventListener("change", handlePriceOptionChange);
document
  .getElementById("triggerPriceOption")
  .addEventListener("change", handlePriceOptionChange);

// Event listener for price option change in the sell modal
function handleSellPriceOptionChange() {
  const priceOption = document.querySelector(
    'input[name="sellPriceOption"]:checked'
  ).value;
  const modalSellPrice = document.getElementById("modalSellPrice");

  if (priceOption === "market") {
    // Fetch and set the current market price in sell modal
    const symbol = document.getElementById("ticker").value;
    fetchAndSetModalSellPrice(symbol);
    modalSellPrice.readOnly = true;
  } else {
    // Allow user to input a trigger price in sell modal
    const symbol = document.getElementById("ticker").value;
    fetchAndSetModalSellPrice(symbol);
    modalSellPrice.readOnly = true;
  }
}

document
  .getElementById("marketSellPriceOption")
  .addEventListener("change", handleSellPriceOptionChange);
document
  .getElementById("triggerSellPriceOption")
  .addEventListener("change", handleSellPriceOptionChange);

// Initialize buy modal when it's opened
document
  .querySelector('[data-modal-toggle="crud-modal"]')
  .addEventListener("click", () => {
    const priceOption = document.querySelector(
      'input[name="priceOption"]:checked'
    ).value;
    if (priceOption === "market") {
      const symbol = document.getElementById("ticker").value;
      fetchAndSetModalBuyPrice(symbol);
    } else if (priceOption === "trigger") {
      const symbol = document.getElementById("ticker").value;
    }
  });

// Initialize sell modal when it's opened
document.querySelector('[data-modal-toggle="crud-modal-2"]')
  .addEventListener("click", () => {
    const priceOption = document.querySelector(
      'input[name="sellPriceOption"]:checked'
    ).value;
    if (priceOption === "market") {
      const symbol = document.getElementById("ticker").value;
      fetchAndSetModalSellPrice(symbol);
    } else if (priceOption === "trigger") {
      const symbol = document.getElementById("ticker").value;
      fetchAndSetModalSellPrice(symbol);
    }
  });
  
  // Handle form submission in the buy modal
document.getElementById("buyForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const quantity = document.getElementById("modalQuantity").value;
  const tradeType = document.getElementById("modalTradeType").value;
  const priceOption = document.querySelector(
    'input[name="priceOption"]:checked'
  ).value;
  let buyPrice = parseFloat(document.getElementById("modalBuyPrice").value);

  if (isNaN(quantity) || quantity <= 0) {
    document.getElementById("feedback404").innerText =
      "Please enter a valid quantity";
    document.getElementById("errorAlert").style.display = "flex";
    return;
  }

  if (isNaN(buyPrice) || buyPrice <= 0) {
    document.getElementById("feedback404").innerText =
      "Please enter a valid buy price";
    document.getElementById("errorAlert").style.display = "flex";
    return;
  }

  const symbol = document.getElementById("ticker").value;

  const now = new Date();
  const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const marketOpenTime = new Date(istNow);
  marketOpenTime.setHours(10, 0, 0, 0); // Set to 10:00 AM IST
  const marketCloseTime = new Date(istNow);
  marketCloseTime.setHours(15, 30, 0, 0); // Set to 3:30 PM IST 

  if (istNow < marketOpenTime || istNow >= marketCloseTime) {
    feedback404.innerText = "Market is closed. Cannot place order.";
    return;
  } 

  // Fetch the market price if priceOption is 'market' to ensure accuracy
  if (priceOption === "market") {
    fetch(`/api/${symbol}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.market_price) {
          buyPrice = data.market_price;
          // Proceed to update the portfolio
          updatePortfolio(symbol, quantity, buyPrice, tradeType);
        }
      })
      .catch((error) => {
        console.error("Error fetching stock price:", error);
        document.getElementById("feedback404").innerText =
          "Error fetching stock price";
        document.getElementById("errorAlert").style.display = "flex";
      });
  } else {
    // For trigger price, use the user-entered buyPrice
    async function placeGttOrder(userDetails, symbol, quantity, buyPrice) {
      try {
        // Send POST request to the backend API to place the GTT order
        const response = await fetch(`http://127.0.0.1:5001/add_gtt_order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userDetails._id, // Ensure _id is passed as a valid MongoDB ObjectId
            stock_symbol: symbol,
            quantity: quantity,
            trigger_price: buyPrice,
            order_type: tradeType, // Use the user-entered buyPrice as the trigger price
          }),
        });

        // Check if the response is not OK, and throw an error if so
        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.error === 'Market is closed. Cannot place order.') {
            document.getElementById("feedback404").innerText = errorData.error;
            document.getElementById("errorAlert").style.display = "flex";
            triggerFlicker(errorAlert);
          } else {
            document.getElementById("feedback404").innerText = `Failed to place GTT order for ${quantity} shares of ${symbol} at $${buyPrice.toFixed(2)} each.`;
            document.getElementById("errorAlert").style.display = "flex";
            triggerFlicker(errorAlert);
          }
          return;
        }
        // Display a success message in the UI
        document.getElementById(
          "feedback"
        ).innerText = `Successfully placed GTT order for ${quantity} shares of ${symbol} at $${buyPrice.toFixed(
          2
        )} each.`;
        document.getElementById("errorAlert").style.display = "flex";
        // Close the modal after successful order placement
        document.querySelector('[data-modal-toggle="crud-modal-2"]').click();
      } catch (error) {
        // Log and display any error encountered while placing the order
        console.error("Error placing GTT order:", error);
        document.getElementById(
          "feedback404"
        ).innerText = `Error placing GTT order: ${error.message}`;
        document.getElementById("errorAlert").style.display = "flex";
      }
    }

    // Example usage of the placeGttOrder function
    // You need to pass the correct variables: userDetails, symbol, quantity, and buyPrice
    placeGttOrder(userDetails, symbol, quantity, buyPrice);
  }
  document.querySelector('[data-modal-toggle="crud-modal-2"]').click();
});

document.querySelector('[data-modal-toggle="crud-modal"]').addEventListener("click", function () {
  document.getElementById("errorAlert").style.display = "none";
  document.getElementById("feedback404").innerText = "";
});
document.querySelector('[data-modal-toggle="crud-modal-2"]').addEventListener("click", function () {
  document.getElementById("errorAlert").style.display = "none";
  document.getElementById("feedback404").innerText = "";
});

// Handle form submission in the sell modal
document.getElementById('sellForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const quantity = document.getElementById("modalSellQuantity").value;
  const tradeType = document.getElementById("modalSellTradeType").value;
  const priceOption = document.querySelector(
    'input[name="sellPriceOption"]:checked'
  ).value;
  let sellPrice = parseFloat(document.getElementById("modalSellPrice").value);

  if (isNaN(quantity) || quantity <= 0) {
    document.getElementById("sellFeedback404").innerText =
      "Please enter a valid quantity";
    document.getElementById("sellErrorAlert").style.display = "flex";
    return;
  }

  if (isNaN(sellPrice) || sellPrice <= 0) {
    document.getElementById("sellFeedback404").innerText =
      "Please enter a valid buy price";
    document.getElementById("sellErrorAlert").style.display = "flex";
    return;
  }

  const symbol = document.getElementById("ticker").value;

 // Check if the current time is within market hours (10:00 AM to 3:30 PM IST)
  const now = new Date();
  const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const marketOpenTime = new Date(istNow);
  marketOpenTime.setHours(10, 0, 0, 0); // Set to 10:00 AM IST
  const marketCloseTime = new Date(istNow);
  marketCloseTime.setHours(15, 30, 0, 0); // Set to 3:30 PM IST 

  if (istNow < marketOpenTime && istNow >= marketCloseTime) {
    feedback404.innerText = "Market is closed. Cannot place order.";
    errorAlert.style.display = "flex";
    triggerFlicker(errorAlert);
    return;
  } 

  // Fetch the market price if priceOption is 'market' to ensure accuracy
  if (priceOption === "market") {
    fetch(`/api/${symbol}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.market_price) {
          sellPrice = data.market_price;
          // Proceed to update the portfolio
          updateSellPortfolio(symbol, quantity, sellPrice, tradeType);
        }
      })
      .catch((error) => {
        console.error("Error fetching stock price:", error);
        document.getElementById("sellFeedback404").innerText =
          "Error fetching stock price";
        document.getElementById("sellErrorAlert").style.display = "flex";
      });
  } else {
    // For trigger price, use the user-entered buyPrice
    async function placeShortSellOrder(userDetails, symbol, quantity, buyPrice) {
      try {
        // Send POST request to the backend API to place the GTT order
        const response = await fetch(`http://127.0.0.1:5001/sell_order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userDetails._id, // Ensure _id is passed as a valid MongoDB ObjectId
            stock_symbol: symbol,
            quantity: quantity,
            order_type: tradeType, // Use the user-entered buyPrice as the trigger price
          }),
        });

        // Check if the response is not OK, and throw an error if so
        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.error === 'Market is closed. Cannot place order.') {
            document.getElementById("sellFeedback404").innerText = errorData.error;
            document.getElementById("sellErrorAlert").style.display = "flex";
            triggerFlicker(errorAlert);
          } else {
            document.getElementById("sellFeedback404").innerText = `Failed to place GTT order for ${quantity} shares of ${symbol} at $${buyPrice.toFixed(2)} each.`;
            document.getElementById("sellErrorAlert").style.display = "flex";
            triggerFlicker(errorAlert);
          }
          return;
        }
        // Display a success message in the UI
        document.getElementById(
          "sellFeedback404"
        ).innerText = `Successfully placed short sell order for ${quantity} shares of ${symbol} at $${buyPrice.toFixed(
          2
        )} each.`;
        document.getElementById("sellErrorAlert").style.display = "flex";
        // Close the modal after successful order placement
        document.querySelector('[data-modal-toggle="crud-modal-2"]').click();
      } catch (error) {
        // Log and display any error encountered while placing the order
        console.error("Error placing short sell order:", error);
        document.getElementById(
          "sellFeedback404"
        ).innerText = `Error placing short sell order: ${error.message}`;
        document.getElementById("sellErrorAlert").style.display = "flex";
        triggerFlicker(errorAlert);
      }
    }

    // Example usage of the placeGttOrder function
    // You need to pass the correct variables: userDetails, symbol, quantity, and buyPrice
    placeShortSellOrder(userDetails, symbol, quantity, sellPrice);
  }
});

function updateSellPortfolio(symbol, quantity, sellPrice, tradeType){
  if (!userDetails) {
    document.getElementById("feedback").innerText =
      "User details not found. Please log in.";
    return;
  }

  // Calculate the total cost of the purchase
  const totalCost = sellPrice * quantity;

  // Ensure intraday_holdings and cash_holding are not null
  if (!userDetails.intraday_holdings) {
    userDetails.intraday_holdings = { intraday_buy: 0, intraday_sell: 0 };
  }
  if (!userDetails.cash_holding) {
    userDetails.cash_holding = {
      cash_in_hand: 10000000,
      intraday_profit_loss: 0,
    };
  }

  // Update intraday_buy and cash_in_hand
  const newCashInHand = parseFloat(
    (userDetails.cash_holding.cash_in_hand + totalCost).toFixed(2)
  );
  const newIntradaySell = parseFloat(
    (userDetails.intraday_holdings.intraday_sell + totalCost).toFixed(2)
  );

  let stockExists = false;
  userDetails.stock_holdings = userDetails.stock_holdings.map((holding) => {
    if(parseInt(quantity)>holding.quantity){
      document.getElementById("sellFeedback404").innerText =
          "Cannot sell more stocks than you own!";
    }
    if (holding.stock_symbol == symbol) {
      holding.quantity = parseInt(holding.quantity) - parseInt(quantity);
      stockExists=true
    }
    return holding;
  });

  userDetails.stock_holdings = userDetails.stock_holdings.filter(
    (holding) => holding.quantity > 0
  );
  // If the stock doesn't exist or was bought at a different price, append it as a new entry
  if (!stockExists) {
    document.getElementById("feedback").innerText =
      "Cannot place general sell order for stocks which you don't own!";
    return;
  }

  tradeType = tradeType + " Sell ";
  if (!userDetails.transaction_history) {
    userDetails.transaction_history = [];
  }

  // Create the new transaction object
  const newTransaction = {
    type: tradeType,
    stock_symbol: symbol,
    quantity: quantity,
    price: sellPrice,
    timestamp: new Date().toLocaleString(),
  };

  try {
    userDetails.transaction_history.push(newTransaction);
    console.log("Transaction added to history");
  } catch (error) {
    console.error("Error adding transaction to history:", error);
  }
  // Send the updated user details to the backend to update the database
  fetch("http://localhost:8000/api/users/update-portfolio", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      // Include authentication token if required
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: JSON.stringify({
      email: userDetails.email,
      intraday_sell: newIntradaySell,
      cash_holding: newCashInHand,
      stock_holdings: userDetails.stock_holdings,
      transaction_history: userDetails.transaction_history,
    }),
  })
    .then((updateResponse) => updateResponse.json())
    .then((updateData) => {
      if (updateData.message === "Portfolio updated successfully") {
        console.log("Portfolio updated successfully");
        // Display a success message on the page
        document.getElementById(
          "feedback"
        ).innerText = `Successfully sold ${quantity} shares of ${symbol} at $${sellPrice.toFixed(
          2
        )} each.`;
        // Update userDetails in localStorage
        localStorage.setItem("userDetails", JSON.stringify(userDetails));
      } else {
        console.error("Error updating portfolio:", updateData.error);
        // Display an error message on the page
        document.getElementById("feedback").innerText =
          "Error updating portfolio";
      }
    })
    .catch((error) => {
      console.error("Error updating portfolio:", error);
      document.getElementById("feedback").innerText =
        "Error updating portfolio";
    });
}
// Function to update the portfolio
function updatePortfolio(symbol, quantity, price, tradeType) {
  // Extract user details from localStorage or other means
  // Implement this function based on how you store user data
  if (!userDetails) {
    document.getElementById("feedback").innerText =
      "User details not found. Please log in.";
    return;
  }

  // Calculate the total cost of the purchase
  const totalCost = price * quantity;

  // Ensure intraday_holdings and cash_holding are not null
  if (!userDetails.intraday_holdings) {
    userDetails.intraday_holdings = { intraday_buy: 0, intraday_sell: 0 };
  }
  if (!userDetails.cash_holding) {
    userDetails.cash_holding = {
      cash_in_hand: 10000000,
      intraday_profit_loss: 0,
    };
  }

  // Update intraday_buy and cash_in_hand
  const newCashInHand = parseFloat(
    (userDetails.cash_holding.cash_in_hand - totalCost).toFixed(2)
  );
  const newIntradayBuy = parseFloat(
    (userDetails.intraday_holdings.intraday_buy + totalCost).toFixed(2)
  );

  if (newCashInHand < 0) {
    document.getElementById("feedback").innerText =
      "Insufficient funds to complete this purchase.";
    return;
  }

  let stockExists = false;
  userDetails.stock_holdings = userDetails.stock_holdings.map((holding) => {
    if (holding.stock_symbol === symbol) {
      // If the stock exists and was bought at the same price, increase the quantity
      holding.quantity = parseInt(holding.quantity) + parseInt(quantity);
      if (parseInt(holding.purchase_price) != parseInt(price)) {
        holding.purchase_price = (holding.purchase_price + price)/2;
      }
      stockExists = true;
    }
    return holding;
  });

  // If the stock doesn't exist or was bought at a different price, append it as a new entry
  if (!stockExists) {
    userDetails.stock_holdings.push({
      stock_symbol: symbol,
      quantity: quantity,
      purchase_price: price,
      purchase_date: new Date().toISOString(), // Store purchase date
    });
  }

  tradeType = tradeType + " Buy";
  if (!userDetails.transaction_history) {
    userDetails.transaction_history = [];
  }

  // Create the new transaction object
  const newTransaction = {
    type: tradeType,
    stock_symbol: symbol,
    quantity: quantity,
    price: price,
    timestamp: new Date().toLocaleString(),
  };

  try {
    userDetails.transaction_history.push(newTransaction);
    console.log("Transaction added to history");
  } catch (error) {
    console.error("Error adding transaction to history:", error);
  }
  // Send the updated user details to the backend to update the database
  fetch("http://localhost:8000/api/users/update-portfolio", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      // Include authentication token if required
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: JSON.stringify({
      email: userDetails.email,
      intraday_buy: newIntradayBuy,
      cash_holding: newCashInHand,
      stock_holdings: userDetails.stock_holdings,
      transaction_history: userDetails.transaction_history,
    }),
  })
    .then((updateResponse) => updateResponse.json())
    .then((updateData) => {
      if (updateData.message === "Portfolio updated successfully") {
        console.log("Portfolio updated successfully");
        // Display a success message on the page
        document.getElementById(
          "feedback"
        ).innerText = `Successfully bought ${quantity} shares of ${symbol} at $${price.toFixed(
          2
        )} each.`;
        // Update userDetails in localStorage
        localStorage.setItem("userDetails", JSON.stringify(userDetails));
      } else {
        console.error("Error updating portfolio:", updateData.error);
        // Display an error message on the page
        document.getElementById("feedback").innerText =
          "Error updating portfolio";
      }
    })
    .catch((error) => {
      console.error("Error updating portfolio:", error);
      document.getElementById("feedback").innerText =
        "Error updating portfolio";
    });
}

// Handle theme toggle (if needed)
document.getElementById("themeToggle").addEventListener("click", function () {
  document.body.classList.toggle("bg-white");
  document.body.classList.toggle("bg-gray-900");
  document.body.classList.toggle("text-black");
  document.body.classList.toggle("text-white");
});
