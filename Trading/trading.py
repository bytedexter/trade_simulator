import os
import threading
import time
from datetime import datetime, timezone
from flask import Flask, request, jsonify
from pymongo import MongoClient
import yfinance as yf
from dotenv import load_dotenv
from bson.errors import InvalidId
from bson import ObjectId, errors
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load environment variables from .env file (create one in your working directory)
load_dotenv()

def get_database():
    # CONNECTION_STRING = os.getenv('')  # Set your MongoDB connection string in .env
    client = MongoClient("mongodb+srv://enbodyAdmin:O0r1MK2YLQ7QPkec@atlascluster.mz70pny.mongodb.net/")
    return client['IEM-CEDS-STOCK-TRADING']

db = get_database()

# Collections
users_col = db['USERS']
gtt_book_col = db['GTT_BOOK']

# Helper Function to Fetch Stock Data
def fetch_stock_data(ticker):
    stock = yf.Ticker(ticker)
    stock_info = stock.history(period="1d")
    if stock_info.empty:
        return None

    latest_data = stock_info.iloc[-1]
    current_price = latest_data['Close']
    fetch_time = datetime.now(timezone.utc)

    data = {
        'fetch_time': fetch_time,
        'current_price': current_price
    }
    return data

# Route to Receive GTT Order Data


@app.route('/add_gtt_order', methods=['POST'])
def add_gtt_order():
    data = request.get_json()
    user_id = data.get('user_id')
    stock_symbol = data.get('stock_symbol')
    trigger_price = data.get('trigger_price')
    quantity = data.get('quantity')

    if not all([user_id, stock_symbol, trigger_price, quantity]):
        return jsonify({'error': 'Missing required fields'}), 400

    # Validate and convert user_id to ObjectId
    try:
        user_obj_id = ObjectId(user_id)
    except errors.InvalidId:
        return jsonify({'error': 'Invalid user_id format. It must be a 24-character hex string.'}), 400

    # Check if the user exists in the database
    if not users_col.find_one({'_id': user_obj_id}):
        return jsonify({'error': 'User not found'}), 404

    # Create GTT Order
    gtt_order = {
        'user_id': user_obj_id,
        'stock_symbol': stock_symbol,
        'quantity': int(quantity),
        'trigger_price': float(trigger_price),
        'created_at': datetime.utcnow()  # Use UTC for consistent time across systems
    }

    gtt_book_col.insert_one(gtt_order)
    return jsonify({'message': 'GTT order added successfully'}), 201


# Background Worker to Monitor GTT Orders

def gtt_order_worker():
    count =0
    while True:
        count = count + 1
        # Fetch all GTT orders
        gtt_orders = list(gtt_book_col.find())

        # Fetch unique stock symbols from GTT orders
        stock_symbols = list(set(order['stock_symbol'] for order in gtt_orders))

        # Fetch current prices for all relevant stocks
        stock_prices = {}
        for symbol in stock_symbols:
            data = fetch_stock_data(symbol)
            if data:
                stock_prices[symbol] = data['current_price']
            else:
                print(f"Could not fetch data for {symbol}")

        # Check each GTT order
        for order in gtt_orders:
            user_id = order['user_id']
            stock_symbol = order['stock_symbol']
            trigger_price = order['trigger_price']
            quantity = order['quantity']
            current_price = stock_prices.get(stock_symbol)

            if current_price is None:
                continue

            # If current price meets or exceeds the trigger price
            if current_price == trigger_price:
                # Update user's portfolio
                user = users_col.find_one({'_id': user_id})
                if user:
                    # Check if the user has sufficient cash holdings
                    cash_in_hand = user.get('cash_holding', {}).get('cash_in_hand', 0)
                    if quantity > 0:
                        total_cost = quantity * current_price
                        new_cash_in_hand = cash_in_hand - total_cost

                        # Update user's stock holdings
                        stock_holdings = user.get('stock_holdings', [])
                        # Check if stock already exists in holdings
                        for holding in stock_holdings:
                            if holding['stock_symbol'] == stock_symbol:
                                if holding['purchase_price']==current_price:
                                    holding['quantity'] += quantity
                                    holding['purchase_price'] = current_price  # Assuming latest purchase price
                                    holding['purchase_date'] = datetime.now()
                                    break
                                else:
                                    break
                        else:
                            # Add new stock holding
                            stock_holdings.append({
                                'stock_symbol': stock_symbol,
                                'quantity': quantity,
                                'purchase_price': current_price,
                                'purchase_date': datetime.now()
                            })

                        # Update the user's document
                        users_col.update_one(
                            {'_id': user_id},
                            {'$set': {
                                'stock_holdings': stock_holdings,
                                'cash_holding.cash_in_hand': new_cash_in_hand
                            }}
                        )

                        print(f"GTT Order Executed: Bought {quantity} shares of {stock_symbol} at {current_price} for user {user_id}")

                        # Remove the executed GTT order
                        gtt_book_col.delete_one({'_id': order['_id']})
                    else:
                        print(f"Insufficient funds for user {user_id} to execute GTT order for {stock_symbol}")
                else:
                    print(f"User {user_id} not found.")

        # Sleep for a defined interval before checking again
        
        print("Iteration Count: ", count)
        time.sleep(1)  # Check every 60 seconds

# Start Background Worker Thread
worker_thread = threading.Thread(target=gtt_order_worker, daemon=True)
worker_thread.start()

# Run Flask App
if __name__ == '__main__':
    app.run(port = 5001,debug=True)