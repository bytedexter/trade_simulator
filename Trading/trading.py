import os
import threading
from flask import Flask, request, jsonify
from pymongo import MongoClient
import yfinance as yf
from dotenv import load_dotenv
from bson.errors import InvalidId
from bson import ObjectId, errors
from flask_cors import CORS
from datetime import datetime, time
import pytz
import time as time_module  

ist = pytz.timezone('Asia/Kolkata')

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
    fetch_time = datetime.now(ist)

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
    order_type = data.get('order_type')
    now = datetime.now(ist)
    market_close_time = time(15, 30)
    if now.time() >= market_close_time:
        return jsonify({'error': 'Market is closed. Cannot place GTT sell order.'}), 400

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
        'order_type':order_type,
        'created_at': datetime.now(ist)  # Use UTC for consistent time across systems
    }

    gtt_book_col.insert_one(gtt_order)
    return jsonify({'message': 'GTT order added successfully'}), 201

@app.route('/add_short_sell_order', methods=['POST'])
def add_short_sell_order():
    data = request.get_json()
    user_id = data.get('user_id')
    stock_symbol = data.get('stock_symbol')
    trigger_price = data.get('trigger_price')
    quantity = data.get('quantity')
    order_type = data.get('order_type', 'long')  # default to trigger if not specified    
    now = datetime.now(ist)
    market_close_time = time(15, 30)
    if now.time() >= market_close_time:
        return jsonify({'error': 'Market is closed. Cannot place GTT sell order.'}), 400

    if not all([user_id, stock_symbol, trigger_price, quantity]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        user_obj_id = ObjectId(user_id)
    except errors.InvalidId:
        return jsonify({'error': 'Invalid user_id format.'}), 400

    if not users_col.find_one({'_id': user_obj_id}):
        return jsonify({'error': 'User not found'}), 404

    sell_order = {
        'user_id': user_obj_id,
        'stock_symbol': stock_symbol,
        'quantity': int(quantity),
        'trigger_price': float(trigger_price),
        'created_at': datetime.now(ist),
        'order_type': order_type
    }

    gtt_sell_book_col.insert_one(sell_order)
    return jsonify({'message': 'GTT sell order added successfully'}), 201

# Ensure to initialize the gtt_sell_book_col similar to gtt_book_col
gtt_sell_book_col = db['GTT_SELL_BOOK']

# Background Worker to Monitor GTT Orders
count =0
def gtt_order_worker():
    while True:
        # Fetch all GTT orders
        gtt_orders = list(gtt_book_col.find())
        
        # Fetch unique stock symbols from GTT orders
        stock_symbols = list(set(order['stock_symbol'] for order in gtt_orders))
        
        now = datetime.now(ist)
        market_close_time = time(15, 30)
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
            order_type = order['order_type']
            current_price = stock_prices.get(stock_symbol)
            
            if (current_price and current_price >= trigger_price) or (order_type == 'intraday' and now.time() >= market_close_time):
                # Execute the order
                user = users_col.find_one({'_id': user_id})
                if user:
                    # Check if the user has sufficient funds
                    cash_in_hand = user.get('cash_holding', {}).get('cash_in_hand', 0)
                    total_cost = quantity * current_price
                    if cash_in_hand >= total_cost:
                        new_cash_in_hand = cash_in_hand - total_cost

                        # Update user's stock holdings
                        stock_holdings = user.get('stock_holdings', [])
                        flag = 0
                        for holding in stock_holdings:
                            if holding['stock_symbol'] == stock_symbol:
                                holding['quantity'] += quantity
                                holding['purchase_price'] = current_price  # Assuming latest purchase price
                                if not isinstance(holding['purchase_date'], list):
                                    holding['purchase_date'] = [holding['purchase_date']]
                                holding['purchase_date'].append(datetime.now())
                                flag = 1
                                break
                        if flag == 0:
                            stock_holdings.append({
                                'stock_symbol': stock_symbol,
                                'quantity': quantity,
                                'purchase_price': current_price,
                                'purchase_date': datetime.now()
                            })

                        # Update user's transaction history
                        transaction_history = user.get('transaction_history', [])
                        transaction_history.append({
                            'type': 'Buy',
                            'quantity': quantity,
                            'price': current_price,
                            'totalCost': total_cost,
                            'purchase_date': datetime.now()
                        })

                        # Update the user's document
                        users_col.update_one(
                            {'_id': user_id},
                            {'$set': {
                                'stock_holdings': stock_holdings,
                                'cash_holding.cash_in_hand': new_cash_in_hand,
                                'transaction_history': transaction_history
                            }}
                        )

                        print(f"GTT Order Executed: Bought {quantity} shares of {stock_symbol} at {current_price} for user {user_id}")

                        # Remove the executed GTT order
                        gtt_book_col.delete_one({'_id': order['_id']})
                    else:
                        print(f"Insufficient funds for user {user_id} to execute GTT order for {stock_symbol}")
                else:
                    print(f"User {user_id} not found.")
                    gtt_book_col.delete_one({'_id': order['_id']})

        # Sleep for a defined interval before checking again

# Start Background Worker Thread
worker_thread = threading.Thread(target=gtt_order_worker, daemon=True)
worker_thread.start()

def sell_order():
    while True:
        gtt_sell_orders = list(gtt_sell_book_col.find())
        stock_symbols = list(set(order['stock_symbol'] for order in gtt_sell_orders))

        stock_prices = {}
        for symbol in stock_symbols:
            data = fetch_stock_data(symbol)
            if data:
                stock_prices[symbol] = data['current_price']
            else:
                print(f"Could not fetch data for {symbol}")
                
        for order in gtt_sell_orders:
            user_id = order['user_id']
            stock_symbol = order['stock_symbol']
            trigger_price = order['trigger_price']
            quantity = order['quantity']
            current_price = stock_prices.get(stock_symbol)

            if current_price and current_price <= trigger_price:
                user = users_col.find_one({'_id': user_id})
                if user:
                    stock_holdings = user.get('stock_holdings', [])
                    for holding in stock_holdings:
                        if holding['stock_symbol'] == stock_symbol and holding['quantity'] >= quantity:
                            holding['quantity'] -= quantity
                            if holding['quantity'] == 0:
                                stock_holdings.remove(holding)
                            break
                    else:
                        print("Not enough stock to sell.")
                        continue

                    users_col.update_one(
                        {'_id': user_id},
                        {'$set': {'stock_holdings': stock_holdings}}
                    )

                    print(f"GTT Sell Order Executed: Sold {quantity} shares of {stock_symbol} at {current_price}.")
                    gtt_sell_book_col.delete_one({'_id': order['_id']})
  # Check every minute

sell_worker_thread = threading.Thread(target=gtt_short_sell_order, daemon=True)
sell_worker_thread.start()


# Run Flask App
if __name__ == '__main__':
    app.run(port = 5001,debug=True)