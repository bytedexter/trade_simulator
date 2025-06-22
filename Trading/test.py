from flask import Flask, request, jsonify
import yfinance as yf
from flask_cors import CORS;
app = Flask(__name__)
CORS(app)

# @app.route('/api/stock-data')
# def get_stock_data():
#     ticker = request.args.get('ticker', default='AAPL')
#     period = request.args.get('period', default='6mo')
#     interval = request.args.get('interval', default='1d')
    
#     data = yf.Ticker(ticker).history(period=period, interval=interval)
#     data = data.reset_index().rename(columns={'Date': 'time'})
#     data['time'] = data['time'].astype(str)  # Convert to string for JSON serialization
#     return jsonify(data.to_dict('records'))

#NEW CODE
@app.route('/api/stock-data')
def get_stock_data():
    tickers = request.args.get('ticker', default='AAPL').split(',')
    period = request.args.get('period', default='6mo')
    interval = request.args.get('interval', default='1d')

    data = yf.download(
        tickers=tickers,
        period=period,
        interval=interval,
        group_by='ticker'
    )

    all_data = []
    for ticker in tickers:
        if ticker in data.columns.get_level_values(0):
            ticker_data = data[ticker]
            ticker_data = ticker_data.reset_index()
            ticker_data = ticker_data.rename(columns={'Date': 'time'})
            ticker_data['time'] = ticker_data['time'].astype(str)
            ticker_data['ticker'] = ticker
            all_data.extend(ticker_data.to_dict('records'))

    return jsonify(all_data)

if __name__ == '__main__':
    app.run(debug=True)