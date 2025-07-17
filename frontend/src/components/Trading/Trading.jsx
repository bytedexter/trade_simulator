// import React, { useEffect, useRef, useState } from 'react';
// import { createChart, CandlestickSeries } from 'lightweight-charts';
// import Papa from 'papaparse';
// import Sidebar from './SideBar';

// const periods = [
//   { label: '1D', value: '1d' },
//   { label: '5D', value: '5d' },
//   { label: '1M', value: '1mo' },
//   { label: '3M', value: '3mo' },
//   { label: '6M', value: '6mo' },
//   { label: '1Y', value: '1y' },
//   { label: '5Y', value: '5y' }
// ];

// const Trading = () => {
//   const chartRef = useRef(null);
//   const [stockData, setStockData] = useState({});
//   const [stocks, setStocks] = useState([]); // holds CSV-loaded stocks
//   const [selectedStock, setSelectedStock] = useState('');
//   const [selectedPeriod,setSelectedPeriod]=useState('6mo');
//   const [dropdownSearch, setDropdownSearch] = useState('');

//   // Load stocks from CSV
//   useEffect(() => {
//     fetch('/nifty50stocks.csv')
//       .then(res => res.text())
//       .then(csvText => {
//         Papa.parse(csvText, {
//           header: true,
//           complete: (results) => {
//             setStocks(results.data);
//             if (results.data.length > 0) {
//               setSelectedStock(results.data[0].value); // default selection
//               setDropdownSearch(results.data[0].label);
//             }
//           },
//         });
//       })
//       .catch(err => console.error("CSV Load Error:", err));
//   }, []);

//   const filteredStocks = stocks
//     .filter(stock => stock.label?.toLowerCase().includes(dropdownSearch.toLowerCase()))
//     .sort((a, b) => {
//       const search = dropdownSearch.toLowerCase();
//       const aStarts = a.label.toLowerCase().startsWith(search);
//       const bStarts = b.label.toLowerCase().startsWith(search);
//       if (aStarts && !bStarts) return -1;
//       if (!aStarts && bStarts) return 1;
//       return a.label.localeCompare(b.label);
//     });

//   useEffect(() => {
//     if (!selectedStock) return;

//     const fetchData = async () => {
//       try {
//         const response = await fetch(
//           `http://localhost:8000/api/users/getStockData?ticker=${selectedStock}&period=${selectedPeriod}&interval=1d`
//         );
//         const data = await response.json();
//         const grouped = {};
//         data.forEach(item => {
//           if (!grouped[item.ticker]) grouped[item.ticker] = [];
//           grouped[item.ticker].push({
//             time: new Date(item.time).getTime() / 1000,
//             open: item.Open,
//             high: item.High,
//             low: item.Low,
//             close: item.Close,
//           });
//         });
//         setStockData(grouped);
//       } catch (error) {
//         console.error('Fetch error:', error);
//       }
//     };
//     fetchData();
//   }, [selectedStock,selectedPeriod]);

//   useEffect(() => {
//     if (!chartRef.current || Object.keys(stockData).length === 0) return;

//     const chart = createChart(chartRef.current, {
//       layout: {
//         background: { type: 'solid', color: '#ffffff' },
//         textColor: 'black',
//         attributionLogo: false,
//       },
//       width: chartRef.current.clientWidth,
//       height: 500,
//     });

//     Object.entries(stockData).forEach(([ticker, data]) => {
//       const series = chart.addSeries(CandlestickSeries, {
//         upColor: '#4FC3F7',
//         downColor: '#FFB74D',
//         borderVisible: false,
//         wickUpColor: '#4FC3F7',
//         wickDownColor: '#FFB74D',
//       });
//       series.setData(data);
//     });

//     chart.timeScale().fitContent();
//     return () => chart.remove();
//   }, [stockData]);

//   const handleOrder = async (type) => {
//   try {
//     const res = await fetch('http://localhost:3000/api/order', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ type, ticker: selectedStock }),
//     });
//     const result = await res.json();
//     console.log(result.message);
//   } catch (err) {
//     console.error('Order error:', err);
//   }
// };

//   return (
//     <div style={{ display: 'flex', height: '100vh' }}>
//       <Sidebar /> {/* 👈 Your custom sidebar here */}
//       <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//         <div style={{ padding: '16px', backgroundColor: '#f5f5f5' }}>
//           <input
//             type="text"
//             value={dropdownSearch}
//             onChange={(e) => setDropdownSearch(e.target.value)}
//             placeholder="Search stock..."
//             style={{
//               padding: '8px',
//               fontSize: '16px',
//               width: '100%',
//               marginBottom: '8px',
//               borderRadius: '4px',
//               border: '1px solid #ccc',
//             }}
//           />
//           <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px' }}>
//             {filteredStocks.map(stock => (
//               <div
//                 key={stock.value}
//                 onClick={() => {
//                   setSelectedStock(stock.value);
//                   setDropdownSearch(stock.label);
//                 }}
//                 style={{
//                   padding: '8px',
//                   cursor: 'pointer',
//                   backgroundColor: stock.value === selectedStock ? '#e0f7fa' : '#fff',
//                   borderBottom: '1px solid #eee'
//                 }}
//               >
//                 {stock.label}
//               </div>
//             ))}
//           </div>

//           <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
//             {periods.map(p => (
//               <button
//                 key={p.value}
//                 onClick={() => setSelectedPeriod(p.value)}
//                 style={{
//                   padding: '6px 12px',
//                   backgroundColor: selectedPeriod === p.value ? '#4FC3F7' : '#ddd',
//                   color: selectedPeriod === p.value ? '#fff' : '#000',
//                   borderRadius: '4px',
//                   border: 'none',
//                   cursor: 'pointer'
//                 }}
//               >
//                 {p.label}
//               </button>
//             ))}
//           </div>
//           <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
//           <button
//             onClick={() => handleOrder('buy')}
//             style={{
//               padding: '10px 20px',
//               backgroundColor: '#4CAF50',
//               color: '#fff',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer'
//             }}
//           >
//             Buy
//           </button>
//           <button
//             onClick={() => handleOrder('sell')}
//             style={{
//               padding: '10px 20px',
//               backgroundColor: '#f44336',
//               color: '#fff',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer'
//             }}
//           >
//             Sell
//           </button>
//         </div>
//         </div>
//         <div ref={chartRef} style={{ flex: 1 }} />
//       </div>
//     </div>
//   );
// };

// export default Trading;

import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import { useAuth } from '../../context/AuthContext';
import Papa from 'papaparse';
import Sidebar from './SideBar';

const periods = [
  { label: '1D', value: '1d' },
  { label: '5D', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' }
];

const Trading = () => {
  const chartRef = useRef(null);
  const [stockData, setStockData] = useState({});
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('6mo');
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [stockHoldings, setStockHoldings] = useState([]);  //STOCK HOLDINGS DEKHANOR JONNO

  // Order Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderSide, setOrderSide] = useState('buy');
  const [orderType, setOrderType] = useState('market');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [stopLoss, setStopLoss] = useState(0);
  const [bookProfit, setBookProfit] = useState(0);

  const { user } = useAuth(); // user will contain { email, name, ... }

  const getToken = () => {
  return localStorage.getItem("authToken"); // Replace with correct key if you used a different one
};
  // Load CSV
  useEffect(() => {
    fetch('/nifty50stocks.csv')
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            setStocks(results.data);
            if (results.data.length > 0) {
              setSelectedStock(results.data[0].value);
              setDropdownSearch(results.data[0].label);
            }
          },
        });
      })
      .catch(err => console.error("CSV Load Error:", err));
  }, []);

  const filteredStocks = stocks
    .filter(stock => stock.label?.toLowerCase().includes(dropdownSearch.toLowerCase()))
    .sort((a, b) => {
      const search = dropdownSearch.toLowerCase();
      const aStarts = a.label.toLowerCase().startsWith(search);
      const bStarts = b.label.toLowerCase().startsWith(search);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.label.localeCompare(b.label);
    });

  // Fetch data
  useEffect(() => {
    if (!selectedStock) return;

    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/users/getStockData?ticker=${selectedStock}&period=${selectedPeriod}&interval=1d`
        );
        const data = await response.json();
        const grouped = {};
        data.forEach(item => {
          if (!grouped[item.ticker]) grouped[item.ticker] = [];
          grouped[item.ticker].push({
            time: new Date(item.time).getTime() / 1000,
            open: item.Open,
            high: item.High,
            low: item.Low,
            close: item.Close,
          });
        });
        setStockData(grouped);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
    fetchData();
  }, [selectedStock, selectedPeriod]);


  //STOCK HOLDINGS ER JONNO CHOLCHE
  useEffect(() => {
  const fetchHoldings = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/users/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        }
      });
      const data = await res.json();
      setStockHoldings(data.stock_holdings || []);
    } catch (err) {
      console.error("Error fetching user holdings:", err);
    }
  };

  if (isOrderModalOpen && orderSide === 'sell') {
    fetchHoldings();
  }
}, [isOrderModalOpen, orderSide]);

  // Draw chart
  useEffect(() => {
    if (!chartRef.current || Object.keys(stockData).length === 0) return;

    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: 'solid', color: '#ffffff' },
        textColor: 'black',
        attributionLogo: false,
      },
      width: chartRef.current.clientWidth,
      height: 500,
    });

    Object.entries(stockData).forEach(([ticker, data]) => {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#4FC3F7',
        downColor: '#FFB74D',
        borderVisible: false,
        wickUpColor: '#4FC3F7',
        wickDownColor: '#FFB74D',
      });
      series.setData(data);
    });

    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [stockData]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', backgroundColor: '#f5f5f5' }}>
          <input
            type="text"
            value={dropdownSearch}
            onChange={(e) => setDropdownSearch(e.target.value)}
            placeholder="Search stock..."
            style={{
              padding: '8px',
              fontSize: '16px',
              width: '100%',
              marginBottom: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px' }}>
            {filteredStocks.map(stock => (
              <div
                key={stock.value}
                onClick={() => {
                  setSelectedStock(stock.value);
                  setDropdownSearch(stock.label);
                }}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  backgroundColor: stock.value === selectedStock ? '#e0f7fa' : '#fff',
                  borderBottom: '1px solid #eee'
                }}
              >
                {stock.label}
              </div>
            ))}
          </div>

          <div
          style={{
            marginTop: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Timeline buttons group */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {periods.map(p => (
              <button
                key={p.value}
                onClick={() => setSelectedPeriod(p.value)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: selectedPeriod === p.value ? '#4FC3F7' : '#ddd',
                  color: selectedPeriod === p.value ? '#fff' : '#000',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Buy and Sell buttons group (aligned to right) */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setOrderSide('buy');
                setIsOrderModalOpen(true);
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4FC3F7',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Buy
            </button>
            <button
              onClick={() => {
                setOrderSide('sell');
                setIsOrderModalOpen(true);
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4FC3F7',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Sell
            </button>
          </div>
        </div>

        </div>

        <div ref={chartRef} style={{ flex: 1 }} />

        {/* Modal */}
    {isOrderModalOpen && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  }}>
    <div style={{
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '12px',
      width: '480px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      <h2 style={{ textAlign: 'center', fontSize: '20px', marginBottom: '20px' }}>
        Place {orderSide.toUpperCase()} Order
      </h2>

      <div style={{ marginBottom: '12px' }}>
        <strong>Stock:</strong> {selectedStock}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>Current Price:</strong> ₹{(() => {
          const data = stockData[selectedStock];
          if (data && data.length > 0) {
            const lastCandle = data[data.length - 1];
            return lastCandle.close.toFixed(2);
          }
          return 'N/A';
        })()}
      </div>
      {/* {STOCK HOLDING DEKHANOR JONNO} */}
      {orderSide === 'sell' && (
        <div style={{ marginBottom: '12px' }}>
          <strong>Current Stocks:</strong>{' '}
          {(() => {
            const holding = stockHoldings.find(h => h.stock_symbol === selectedStock);
            return holding ? holding.quantity : 0;
          })()}
        </div>
      )}
      {/* Order Type */}
      <div style={{ marginBottom: '16px' }}>
        <label><strong>Order Type</strong></label>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '4px',
            borderRadius: '6px',
            border: '1px solid #ccc'
          }}
        >
          <option value="market">Market</option>
          <option value="limit">Limit</option>
        </select>
      </div>

      {/* Quantity & Limit Price */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <label><strong>Quantity</strong></label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc'
            }}
          />
        </div>
        {orderType === 'limit' && (
          <div style={{ flex: 1 }}>
            <label><strong>Limit Price</strong></label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ccc'
              }}
            />
          </div>
        )}
      </div>

      {/* Stop Loss and Book Profit */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <label><strong>Stop Loss (%)</strong></label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc'
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label><strong>Stop Loss (Price)</strong></label>
          <input
            type="number"
            value={price && stopLoss ? (price - (price * stopLoss) / 100).toFixed(2) : 0}
            readOnly
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              backgroundColor: '#f5f5f5'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <label><strong>Book Profit (%)</strong></label>
          <input
            type="number"
            value={bookProfit}
            onChange={(e) => setBookProfit(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc'
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label><strong>Book Profit (Price)</strong></label>
          <input
            type="number"
            value={price && bookProfit ? (price + (price * bookProfit) / 100).toFixed(2) : 0}
            readOnly
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              backgroundColor: '#f5f5f5'
            }}
          />
        </div>
      </div>

      {/* Total Amount */}
      <div style={{ marginBottom: '16px' }}>
        <strong>Total Amount:</strong> ₹{(() => {
          const cost = orderType === 'market'
            ? (() => {
              const data = stockData[selectedStock];
              if (data && data.length > 0) {
                return data[data.length - 1].close;
              }
              return 0;
            })()
            : price;
          return (cost * quantity || 0).toFixed(2);
        })()}
      </div>

      {/* Submit Button */}
      <button
        onClick={async () => {
          if(orderType === 'limit' && (!price || price <= 0)) {
            alert("Please enter a valid limit price");
            return;
          }

          const currentPrice = orderType === 'market'
            ? stockData[selectedStock]?.[stockData[selectedStock].length - 1]?.close
            : price;

          const payload = {
            ticker: selectedStock,
            quantity,
            orderSide
          };
          if(orderType==='limit'){
            payload.limitPrice=price;
          } else {
            payload.price=currentPrice;
          }
          console.log("📦 Payload being sent:", payload);
          const endpoint = ( ()=>{
            if(orderSide === 'buy'){
              return orderType==='market'
              ? 'http://localhost:8000/api/users/placeBuyOrder'
              : 'http://localhost:8000/api/users/placeLimitOrder';
            } else {
              return orderType==='market'
              ? 'http://localhost:8000/api/users/placeSellOrder'
              : 'http://localhost:8000/api/users/placeLimitOrder';
            }
          })();

          try {
            const response = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
              },
              body: JSON.stringify(payload)
            });

            const text = await response.text();
            let result;
            try {
              result = JSON.parse(text);
            } catch {
              result = { message: text };
            }

            if (!response.ok) {
              throw new Error(result.message || "Unauthorized");
            }

            alert(result.message || "Order placed successfully!");
          } catch (err) {
            console.error("Order Error:", err);
            alert(err.message || "Failed to place order.");
          }

          setIsOrderModalOpen(false);
        }}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#2196F3',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          marginBottom: '10px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        {orderSide === 'buy' ? 'Place Order' : 'Sell Stock'}
      </button>

      <button
        onClick={() => setIsOrderModalOpen(false)}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#ccc',
          color: '#000',
          border: 'none',
          borderRadius: '6px'
        }}
      >
        Cancel
      </button>
    </div>
  </div>
)}



      </div>
    </div>
  );
};

export default Trading;

