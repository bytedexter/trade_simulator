// Ensure all necessary scripts are included in your HTML:
// <script src="https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js"></script>
// <script src="https://unpkg.com/flowbite@1.4.7/dist/flowbite.js"></script>

// Chart options
const chartOptions1 = {
    layout: {
        background: { type: 'solid', color: 'white' },
        textColor: 'black',
    },
    grid: {
        vertLines: {
            color: '#e1e1e1',
        },
        horzLines: {
            color: '#e1e1e1',
        },
    },
    crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
    },
    timeScale: {
        visible: false,
    },
    width: document.getElementById('chart').clientWidth,
    height: document.getElementById('chart').clientHeight,
};

const chartOptions2 = {
    layout: {
        background: { type: 'solid', color: 'white' },
        textColor: 'black',
    },
    grid: {
        vertLines: {
            color: '#e1e1e1',
        },
        horzLines: {
            color: '#e1e1e1',
        },
    },
    timeScale: {
        visible: true,
    },
    width: document.getElementById('chart').clientWidth,
    height: document.getElementById('rsiChart').clientHeight,
};

// Create charts
const chart = LightweightCharts.createChart(document.getElementById('chart'), chartOptions1);
const candlestickSeries = chart.addCandlestickSeries();
const emaLine = chart.addLineSeries({
    color: 'blue',
    lineWidth: 2
});

const rsiChart = LightweightCharts.createChart(document.getElementById('rsiChart'), chartOptions2);
const rsiLine = rsiChart.addLineSeries({
    color: 'red',
    lineWidth: 2
});

let autoUpdateInterval;

// Fetch data function
function fetchData(ticker, timeframe, emaPeriod, rsiPeriod) {
    fetch(`/api/data/${ticker}/${timeframe}/${emaPeriod}/${rsiPeriod}`)
        .then(response => response.json())
        .then(data => {
            candlestickSeries.setData(data.candlestick);
            emaLine.setData(data.ema);
            rsiLine.setData(data.rsi);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Fetch default data on page load
const tickerInput = document.getElementById('ticker');

function getUrlParams() {
    const params = {};
    window.location.search.substr(1).split("&").forEach(function(item) {
        const pair = item.split("=");
        if (pair[0]) {
            params[pair[0]] = decodeURIComponent(pair[1]);
        }
    });
    return params;
}

let userDetails = null;
window.addEventListener('load', () => {
    const urlParams = getUrlParams();
    if (urlParams.user) {
        try {
            userDetails = JSON.parse(urlParams.user);
            console.log('User details retrieved from URL:', userDetails);
        } catch (error) {
            console.error('Error parsing user details from URL:', error);
            userDetails = null;
        }
    } else {
        console.warn('No user details found in URL parameters.');
    }

    // Fetch default stock data
    fetchData('WIPRO.NS', '1d', 20, 14);
    tickerInput.value = 'WIPRO.NS';
    loadWatchlist();
})

// Handle data fetching on button click
document.getElementById('fetchData').addEventListener('click', () => {
    const ticker = document.getElementById('ticker').value;
    const timeframe = document.getElementById('timeframe').value;
    const emaPeriod = document.getElementById('emaPeriod').value;
    const rsiPeriod = document.getElementById('rsiPeriod').value;
    fetchData(ticker, timeframe, emaPeriod, rsiPeriod);
});

// Handle auto-update functionality
document.getElementById('autoUpdate').addEventListener('change', (event) => {
    if (event.target.checked) {
        const frequency = document.getElementById('updateFrequency').value * 1000;
        autoUpdateInterval = setInterval(() => {
            const ticker = document.getElementById('ticker').value;
            const timeframe = document.getElementById('timeframe').value;
            const emaPeriod = document.getElementById('emaPeriod').value;
            const rsiPeriod = document.getElementById('rsiPeriod').value;
            fetchData(ticker, timeframe, emaPeriod, rsiPeriod);
        }, frequency);
    } else {
        clearInterval(autoUpdateInterval);
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    chart.resize(document.getElementById('chart').clientWidth, document.getElementById('chart').clientHeight);
    rsiChart.resize(document.getElementById('rsiChart').clientWidth, document.getElementById('rsiChart').clientHeight);
});

// Theme toggle functionality
document.getElementById('themeToggle').addEventListener('click', () => {
    const bodyClassList = document.body.classList;
    const watchlist = document.getElementById('watchlist');
    const inputs = document.querySelectorAll('input, select');
    if (bodyClassList.contains('bg-white')) {
        bodyClassList.replace('bg-white', 'bg-gray-900');
        bodyClassList.replace('text-black', 'text-white');
        watchlist.classList.replace('bg-gray-100', 'bg-gray-800');
        watchlist.classList.replace('text-black', 'text-white');
        inputs.forEach(input => {
            input.classList.replace('bg-white', 'bg-gray-900');
            input.classList.replace('text-black', 'text-white');
        });
        chart.applyOptions({
            layout: {
                background: { type: 'solid', color: 'black' },
                textColor: 'white',
            },
            grid: {
                vertLines: {
                    color: 'black',
                },
                horzLines: {
                    color: 'black',
                },
            }
        });
        rsiChart.applyOptions({
            layout: {
                background: { type: 'solid', color: 'black' },
                textColor: 'white',
            },
            grid: {
                vertLines: {
                    color: 'black',
                },
                horzLines: {
                    color: 'black',
                },
            }
        });
    } else {
        bodyClassList.replace('bg-gray-900', 'bg-white');
        bodyClassList.replace('text-white', 'text-black');
        watchlist.classList.replace('bg-gray-800', 'bg-gray-100');
        watchlist.classList.replace('text-white', 'text-black');
        inputs.forEach(input => {
            input.classList.replace('bg-gray-900', 'bg-white');
            input.classList.replace('text-white', 'text-black');
        });
        chart.applyOptions({
            layout: {
                background: { type: 'solid', color: 'white' },
                textColor: 'black',
            },
            grid: {
                vertLines: {
                    color: '#e1e1e1',
                },
                horzLines: {
                    color: '#e1e1e1',
                },
            }
        });
        rsiChart.applyOptions({
            layout: {
                background: { type: 'solid', color: 'white' },
                textColor: 'black',
            },
            grid: {
                vertLines: {
                    color: '#e1e1e1',
                },
                horzLines: {
                    color: '#e1e1e1',
                },
            }
        });
    }
});

// Load watchlist symbols from the server
function loadWatchlist() {
    fetch('/api/symbols')
        .then(response => response.json())
        .then(symbols => {
            const watchlistItems = document.getElementById('watchlistItems');
            watchlistItems.innerHTML = '';
            symbols.forEach(symbol => {
                const item = document.createElement('div');
                item.className = 'watchlist-item';
                item.innerText = symbol;
                item.addEventListener('click', () => {
                    document.getElementById('ticker').value = symbol;
                    fetchData(symbol, document.getElementById('timeframe').value, document.getElementById('emaPeriod').value, document.getElementById('rsiPeriod').value);
                });
                watchlistItems.appendChild(item);
            });
        })
        .catch(error => {
            console.error('Error loading watchlist:', error);
        });
}

// Sync visible logical range between charts
function syncVisibleLogicalRange(chart1, chart2) {
    chart1.timeScale().subscribeVisibleLogicalRangeChange(timeRange => {
        chart2.timeScale().setVisibleLogicalRange(timeRange);
    });

    chart2.timeScale().subscribeVisibleLogicalRangeChange(timeRange => {
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

chart.subscribeCrosshairMove(param => {
    const dataPoint = getCrosshairDataPoint(candlestickSeries, param);
    syncCrosshair(rsiChart, rsiLine, dataPoint);
});

rsiChart.subscribeCrosshairMove(param => {
    const dataPoint = getCrosshairDataPoint(rsiLine, param);
    syncCrosshair(chart, candlestickSeries, dataPoint);
});

const suggestionsDiv = document.getElementById('suggestions');

tickerInput.addEventListener('input', () => {
    const query = tickerInput.value.trim();
    if (query.length > 0) {
        fetch(`/api/search?q=${query}`)
            .then(response => response.json())
            .then(stocks => {
                if (stocks.length > 0) {
                    suggestionsDiv.innerHTML = '';
                    stocks.forEach(stock => {
                        const item = document.createElement('div');
                        item.className = 'p-2 hover:bg-gray-200 cursor-pointer';
                        item.textContent = `${stock.company_name} (${stock.symbol})`;
                        item.addEventListener('click', () => {
                            tickerInput.value = `${stock.symbol}.NS`;
                            suggestionsDiv.innerHTML = '';  // Clear suggestions
                            fetchData(tickerInput.value, document.getElementById('timeframe').value, document.getElementById('emaPeriod').value, document.getElementById('rsiPeriod').value);
                        });
                        suggestionsDiv.appendChild(item);
                    });
                    suggestionsDiv.classList.remove('hidden');
                } else {
                    suggestionsDiv.classList.add('hidden');
                }
            })
            .catch(error => console.error('Error fetching stock suggestions:', error));
    } else {
        suggestionsDiv.classList.add('hidden');
    }
});

// Function to fetch and set the market price in the modal
function fetchAndSetModalBuyPrice(symbol) {
    fetch(`/api/${symbol}`)
        .then(response => response.json())
        .then(data => {
            if (data.market_price) {
                const modalBuyPrice = document.getElementById('modalBuyPrice');
                if (modalBuyPrice) {
                    modalBuyPrice.value = data.market_price;
                    console.log('Price fetched and set in modal');
                } else {
                    console.error('modalBuyPrice element not found');
                }
            } else {
                console.error('Error fetching stock price:', data.error);
            }
        })
        .catch(error => console.error('Error fetching stock price:', error));
}

// Event listener for price option change in the modal
function handlePriceOptionChange() {
    const priceOption = document.querySelector('input[name="priceOption"]:checked').value;
    const modalBuyPrice = document.getElementById('modalBuyPrice');
    if (priceOption === 'market') {
        // Fetch and set the current market price
        const symbol = document.getElementById('ticker').value;
        fetchAndSetModalBuyPrice(symbol);
        modalBuyPrice.readOnly = true;
    } else {
        // Allow user to input a trigger price
        modalBuyPrice.value = '';
        modalBuyPrice.readOnly = false;
    }
}

document.getElementById('marketPriceOption').addEventListener('change', handlePriceOptionChange);
document.getElementById('triggerPriceOption').addEventListener('change', handlePriceOptionChange);

// Initialize modal when it's opened
document.querySelector('[data-modal-toggle="crud-modal"]').addEventListener('click', () => {
    const priceOption = document.querySelector('input[name="priceOption"]:checked').value;
    if (priceOption === 'market') {
        const symbol = document.getElementById('ticker').value;
        fetchAndSetModalBuyPrice(symbol);
    }
    else if (priceOption === 'trigger') {
        const symbol = document.getElementById('ticker').value;
        fetchAndSetModalBuyPrice(symbol);
    }
});

// Handle form submission in the modal
document.getElementById('buyForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const quantity = document.getElementById('modalQuantity').value;
    const tradeType = document.getElementById('modalTradeType').value;
    const priceOption = document.querySelector('input[name="priceOption"]:checked').value;
    let buyPrice = parseFloat(document.getElementById('modalBuyPrice').value);

    if (isNaN(quantity) || quantity <= 0) {
        document.getElementById('feedback').innerText = 'Please enter a valid quantity';
        return;
    }

    if (isNaN(buyPrice) || buyPrice <= 0) {
        document.getElementById('feedback').innerText = 'Please enter a valid buy price';
        return;
    }

    const symbol = document.getElementById('ticker').value;

    // Fetch the market price if priceOption is 'market' to ensure accuracy
    if (priceOption === 'market') {
        fetch(`/api/${symbol}`)
            .then(response => response.json())
            .then(data => {
                if (data.market_price) {
                    buyPrice = data.market_price;
                    // Proceed to update the portfolio
                    updatePortfolio(symbol, quantity, buyPrice, tradeType);
                } else {
                    console.error('Error fetching stock price:', data.error);
                    document.getElementById('feedback').innerText = 'Error fetching stock price';
                }
            })
            .catch(error => {
                console.error('Error fetching stock price:', error);
                document.getElementById('feedback').innerText = 'Error fetching stock price';
            });
    } else {
        // For trigger price, use the user-entered buyPrice
        updatePortfolio(symbol, quantity, buyPrice, tradeType);
    }

    // Close the modal
    document.querySelector('[data-modal-toggle="crud-modal"]').click();
});

// Function to update the portfolio
function updatePortfolio(symbol, quantity, price, tradeType) {
    // Extract user details from localStorage or other means
     // Implement this function based on how you store user data

    if (!userDetails) {
        document.getElementById('feedback').innerText = 'User details not found. Please log in.';
        return;
    }

    // Calculate the total cost of the purchase
    const totalCost = price * quantity;

    // Ensure intraday_holdings and cash_holding are not null
    if (!userDetails.intraday_holdings) {
        userDetails.intraday_holdings = { intraday_buy: 0, intraday_sell: 0 };
    }
    if (!userDetails.cash_holding) {
        userDetails.cash_holding = { cash_in_hand: 10000000, intraday_profit_loss: 0 };
    }

    // Update intraday_buy and cash_in_hand
    const newCashInHand = parseFloat((userDetails.cash_holding.cash_in_hand - totalCost).toFixed(2));
    const newIntradayBuy = parseFloat((userDetails.intraday_holdings.intraday_buy + totalCost).toFixed(2));

    if (newCashInHand < 0) {
        document.getElementById('feedback').innerText = 'Insufficient funds to complete this purchase.';
        return;
    }


    // Send the updated user details to the backend to update the database
    fetch('http://localhost:8000/api/users/update-portfolio', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            // Include authentication token if required
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
            email: userDetails.email,
            intraday_holdings: newIntradayBuy,
            cash_holding: newCashInHand
        })
    })
    .then(updateResponse => updateResponse.json())
    .then(updateData => {
        if (updateData.message === 'Portfolio updated successfully') {
            console.log('Portfolio updated successfully');
            // Display a success message on the page
            document.getElementById('feedback').innerText = 'Portfolio updated successfully';
            // Update userDetails in localStorage
            localStorage.setItem('userDetails', JSON.stringify(userDetails));
        } else {
            console.error('Error updating portfolio:', updateData.error);
            // Display an error message on the page
            document.getElementById('feedback').innerText = 'Error updating portfolio';
        }
    })
    .catch(error => {
        console.error('Error updating portfolio:', error);
        document.getElementById('feedback').innerText = 'Error updating portfolio';
    });
}


// Handle theme toggle (if needed)
document.getElementById('themeToggle').addEventListener('click', function () {
    document.body.classList.toggle('bg-white');
    document.body.classList.toggle('bg-gray-900');
    document.body.classList.toggle('text-black');
    document.body.classList.toggle('text-white');
});
