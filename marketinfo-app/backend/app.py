from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import json
import os
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Base paths to data directories (relative to main marketinfo project root)
# The backend is in marketinfo-app/backend/, so we need to go up 2 levels to reach the main marketinfo directory
BASE_DIR = Path(__file__).parent.parent.parent
CLI_CHARTS_DATA = BASE_DIR / "cli-charts" / "data"
PUSHES_CRYPTO_DATA = BASE_DIR / "pushes" / "crypto_data"
PUSHES_MACRO_DATA = BASE_DIR / "pushes" / "macro_data"
CALENDAR_DATA = BASE_DIR / "calendar" / "data"

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy", 
        "message": "MarketInfo API is running",
        "base_dir": str(BASE_DIR),
        "paths": {
            "cli_charts": str(CLI_CHARTS_DATA),
            "crypto_pushes": str(PUSHES_CRYPTO_DATA),
            "macro_pushes": str(PUSHES_MACRO_DATA),
            "calendar": str(CALENDAR_DATA)
        },
        "files_exist": {
            "cli_charts_dir": CLI_CHARTS_DATA.exists(),
            "crypto_pushes_file": (PUSHES_CRYPTO_DATA / "latest.json").exists(),
            "macro_pushes_file": (PUSHES_MACRO_DATA / "latest.json").exists(),
            "calendar_file": (CALENDAR_DATA / "economic_calendar.json").exists()
        }
    })

@app.route('/api/crypto/prices/<symbol>', methods=['GET'])
def get_crypto_prices(symbol):
    """Get crypto price data from CSV files"""
    try:
        symbol = symbol.upper()
        csv_file = CLI_CHARTS_DATA / f"{symbol}.csv"
        
        if not csv_file.exists():
            return jsonify({"error": f"Data for {symbol} not found"}), 404
        
        df = pd.read_csv(csv_file)
        data = df.to_dict('records')
        
        return jsonify({
            "symbol": symbol,
            "data": data,
            "count": len(data)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/crypto/prices', methods=['GET'])
def get_all_crypto_prices():
    """Get all available crypto price data"""
    try:
        crypto_data = {}
        csv_files = CLI_CHARTS_DATA.glob("*.csv")
        
        for csv_file in csv_files:
            symbol = csv_file.stem
            df = pd.read_csv(csv_file)
            crypto_data[symbol] = df.to_dict('records')
        
        return jsonify({
            "data": crypto_data,
            "symbols": list(crypto_data.keys())
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/pushes/crypto', methods=['GET'])
def get_crypto_pushes():
    """Get latest crypto push data"""
    try:
        json_file = PUSHES_CRYPTO_DATA / "latest.json"
        
        if not json_file.exists():
            return jsonify({"error": "Crypto push data not found"}), 404
        
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/pushes/macro', methods=['GET'])
def get_macro_pushes():
    """Get latest macro push data"""
    try:
        json_file = PUSHES_MACRO_DATA / "latest.json"
        
        if not json_file.exists():
            return jsonify({"error": "Macro push data not found"}), 404
        
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/calendar/economic', methods=['GET'])
def get_economic_calendar():
    """Get economic calendar data"""
    try:
        json_file = CALENDAR_DATA / "economic_calendar.json"
        
        if not json_file.exists():
            return jsonify({"error": "Economic calendar data not found"}), 404
        
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/data/overview', methods=['GET'])
def get_data_overview():
    """Get an overview of all available data"""
    try:
        overview = {
            "crypto_symbols": [],
            "has_crypto_pushes": False,
            "has_macro_pushes": False,
            "has_economic_calendar": False
        }
        
        # Check crypto CSV files
        csv_files = CLI_CHARTS_DATA.glob("*.csv")
        overview["crypto_symbols"] = [f.stem for f in csv_files]
        
        # Check push data files
        overview["has_crypto_pushes"] = (PUSHES_CRYPTO_DATA / "latest.json").exists()
        overview["has_macro_pushes"] = (PUSHES_MACRO_DATA / "latest.json").exists()
        
        # Check calendar data
        overview["has_economic_calendar"] = (CALENDAR_DATA / "economic_calendar.json").exists()
        
        return jsonify(overview)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 