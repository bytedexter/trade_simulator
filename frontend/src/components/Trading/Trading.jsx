import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
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
  const [stocks, setStocks] = useState([]); // holds CSV-loaded stocks
  const [selectedStock, setSelectedStock] = useState('');
  const [selectedPeriod,setSelectedPeriod]=useState('6mo');
  const [dropdownSearch, setDropdownSearch] = useState('');

  // Load stocks from CSV
  useEffect(() => {
    fetch('/nifty50stocks.csv')
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            setStocks(results.data);
            if (results.data.length > 0) {
              setSelectedStock(results.data[0].value); // default selection
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
  }, [selectedStock,selectedPeriod]);

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
      <Sidebar /> {/* 👈 Your custom sidebar here */}
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

          <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
        </div>
        <div ref={chartRef} style={{ flex: 1 }} />
      </div>
    </div>
  );
};

export default Trading;