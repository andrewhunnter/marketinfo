from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import json
import os
from pathlib import Path
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Groq client (with error handling)
groq_client = None
try:
    groq_api_key = os.getenv('GROQ_API_KEY')
    if groq_api_key and groq_api_key != 'your_groq_api_key_here':
        # Initialize Groq client with explicit parameters only
        groq_client = Groq(
            api_key=groq_api_key,
            # Remove any potential proxy-related parameters
        )
        print("✅ Groq client initialized successfully")
    else:
        print("⚠️  Groq API key not configured. Chat functionality will be disabled.")
except Exception as e:
    print(f"⚠️  Failed to initialize Groq client: {e}")
    print("Chat functionality will be disabled.")
    # Try alternative initialization without any extra parameters
    try:
        groq_api_key = os.getenv('GROQ_API_KEY')
        if groq_api_key and groq_api_key != 'your_groq_api_key_here':
            import groq
            groq_client = groq.Groq(api_key=groq_api_key)
            print("✅ Groq client initialized successfully (fallback method)")
    except Exception as e2:
        print(f"⚠️  Fallback initialization also failed: {e2}")

# Base paths to data directories (relative to main marketinfo project root)
# The backend is in marketinfo-app/backend/, so we need to go up 2 levels to reach the main marketinfo directory
BASE_DIR = Path(__file__).parent.parent.parent
CLI_CHARTS_DATA = BASE_DIR / "cli-charts" / "data"
PUSHES_CRYPTO_DATA = BASE_DIR / "pushes" / "crypto_data"
PUSHES_MACRO_DATA = BASE_DIR / "pushes" / "macro_data"
CALENDAR_DATA = BASE_DIR / "calendar" / "data"

def _categorize_releases(events):
    """Categorize economic releases by type for better analysis"""
    categories = {
        "federal_reserve": [],
        "interest_rates": [],
        "employment": [],
        "inflation": [],
        "market_indices": [],
        "crypto": [],
        "other": []
    }
    
    for event in events:
        name = event.get("name", "").lower()
        if any(term in name for term in ["fomc", "federal funds", "fed"]):
            categories["federal_reserve"].append(event["name"])
        elif any(term in name for term in ["interest rate", "treasury", "sofr", "ameribor"]):
            categories["interest_rates"].append(event["name"])
        elif any(term in name for term in ["employment", "unemployment", "jobs"]):
            categories["employment"].append(event["name"])
        elif any(term in name for term in ["cpi", "inflation", "price"]):
            categories["inflation"].append(event["name"])
        elif any(term in name for term in ["dow jones", "nikkei", "s&p"]):
            categories["market_indices"].append(event["name"])
        elif any(term in name for term in ["crypto", "coinbase", "bitcoin"]):
            categories["crypto"].append(event["name"])
        else:
            categories["other"].append(event["name"])
    
    # Remove empty categories
    return {k: v for k, v in categories.items() if v}

def get_current_market_data():
    """Gather ALL data from visualization sources for LLM context"""
    market_data = {
        "real_time_crypto": None,      # pushes/crypto_data/latest.json
        "real_time_macro": None,       # pushes/macro_data/latest.json  
        "economic_calendar": None,     # calendar/data/economic_calendar.json
        "historical_crypto": {},       # cli-charts/data/*.csv
        "data_overview": {},
        "all_visualization_data": {}   # Complete data used by frontend charts
    }
    
    try:
        # 1. REAL-TIME CRYPTO DATA (used by crypto charts)
        crypto_file = PUSHES_CRYPTO_DATA / "latest.json"
        if crypto_file.exists():
            with open(crypto_file, 'r') as f:
                market_data["real_time_crypto"] = json.load(f)
        
        # 2. REAL-TIME MACRO DATA (used by market indices, economic indicators)
        macro_file = PUSHES_MACRO_DATA / "latest.json"
        if macro_file.exists():
            with open(macro_file, 'r') as f:
                market_data["real_time_macro"] = json.load(f)
        
        # Get economic releases data
        calendar_file = CALENDAR_DATA / "economic_calendar.json"
        if calendar_file.exists():
            with open(calendar_file, 'r') as f:
                calendar_data = json.load(f)
                # Include recent economic releases for analysis
                if isinstance(calendar_data.get("events"), list):
                    market_data["economic_calendar"] = {
                        "updated_at": calendar_data.get("updated_at"),
                        "total_events": calendar_data.get("events_count", 0),
                        "recent_releases": calendar_data["events"][:15],  # Last 15 releases for context
                        "key_categories": _categorize_releases(calendar_data["events"][:15])
                    }
                else:
                    market_data["economic_calendar"] = calendar_data
        
        # 3. HISTORICAL CRYPTO DATA (used by CryptoChart component)
        crypto_symbols = []
        csv_files = list(CLI_CHARTS_DATA.glob("*.csv"))
        for csv_file in csv_files:
            symbol = csv_file.stem
            crypto_symbols.append(symbol)
            try:
                df = pd.read_csv(csv_file)
                # Get complete historical data for charts
                all_data = df.to_dict('records')
                
                # Calculate comprehensive statistical analysis
                if len(all_data) >= 2:
                    prices = [d['price'] for d in all_data]
                    latest_price = all_data[-1]['price']
                    week_ago_price = all_data[-7]['price'] if len(all_data) >= 7 else all_data[0]['price']
                    week_change = ((latest_price - week_ago_price) / week_ago_price) * 100
                    
                    # Calculate key statistics
                    average_price = sum(prices) / len(prices)
                    min_price = min(prices)
                    max_price = max(prices)
                    median_price = sorted(prices)[len(prices) // 2]
                    
                    # Get recent 30 days for visualization context
                    recent_30_days = all_data[-30:] if len(all_data) >= 30 else all_data
                    
                    market_data["historical_crypto"][symbol] = {
                        "symbol": symbol,
                        "total_data_points": len(all_data),
                        "latest_price": latest_price,
                        "average_price": average_price,
                        "median_price": median_price,
                        "week_change_percent": week_change,
                        "trend_direction": "up" if week_change > 0 else "down",
                        "recent_30_days": recent_30_days,
                        "full_historical_data": all_data,  # Include complete data for AI analysis
                        "date_range": f"{all_data[0]['date']} to {all_data[-1]['date']}" if all_data else "No data",
                        "price_range": {
                            "min": min_price,
                            "max": max_price,
                            "current": latest_price,
                            "average": average_price,
                            "median": median_price
                        },
                        "price_statistics": {
                            "count": len(prices),
                            "sum": sum(prices),
                            "average": average_price,
                            "min": min_price,
                            "max": max_price,
                            "median": median_price,
                            "range": max_price - min_price
                        }
                    }
            except Exception as e:
                print(f"Error processing {symbol} historical data: {e}")
        
        # 4. COMPLETE VISUALIZATION DATA AGGREGATION
        try:
            # Aggregate all data used by frontend components
            market_data["all_visualization_data"] = {
                # Data for crypto components
                "crypto_charts": {
                    "available_symbols": crypto_symbols,
                    "real_time_prices": market_data["real_time_crypto"],
                    "historical_data": market_data["historical_crypto"]
                },
                
                # Data for market indices components  
                "market_indices": {
                    "real_time_data": market_data["real_time_macro"],
                    "spy_data": market_data["real_time_macro"].get("market_indices", {}).get("sp500") if market_data["real_time_macro"] else None,
                    "qqq_data": market_data["real_time_macro"].get("market_indices", {}).get("nasdaq100") if market_data["real_time_macro"] else None,
                    "vix_data": market_data["real_time_macro"].get("market_indices", {}).get("vix") if market_data["real_time_macro"] else None
                },
                
                # Data for economic components
                "economic_indicators": {
                    "interest_rates": market_data["real_time_macro"].get("interest_rates") if market_data["real_time_macro"] else None,
                    "consumer_data": market_data["real_time_macro"].get("consumer_data") if market_data["real_time_macro"] else None,
                    "unemployment": market_data["real_time_macro"].get("consumer_data", {}).get("unemployment_rate") if market_data["real_time_macro"] else None,
                    "cpi": market_data["real_time_macro"].get("consumer_data", {}).get("cpi") if market_data["real_time_macro"] else None,
                    "retail_sales": market_data["real_time_macro"].get("consumer_data", {}).get("retail_sales") if market_data["real_time_macro"] else None
                },
                
                # Data for calendar component
                "economic_calendar": market_data["economic_calendar"],
                
                # Fear & Greed data
                "fear_greed": market_data["real_time_crypto"].get("fear_greed_index") if market_data["real_time_crypto"] else None
            }
            
            # Data overview stats
            market_data["data_overview"] = {
                "available_crypto_symbols": crypto_symbols,
                "total_crypto_datasets": len(crypto_symbols),
                "has_real_time_crypto": bool(market_data["real_time_crypto"]),
                "has_real_time_macro": bool(market_data["real_time_macro"]),
                "has_economic_calendar": bool(market_data["economic_calendar"]),
                "total_economic_releases": market_data["economic_calendar"].get("total_events", 0) if market_data["economic_calendar"] else 0,
                "data_sources": "Real-time APIs + Historical CSV + Economic Calendar",
                "visualization_components_data": list(market_data["all_visualization_data"].keys())
            }
        except Exception as e:
            print(f"Error aggregating visualization data: {e}")
    
    except Exception as e:
        print(f"Error loading market data: {e}")
    
    return market_data

def summarize_market_data(market_data):
    """Create a concise summary of ALL visualization data for the LLM context"""
    summary = []
    
    # Real-time crypto data summary
    if market_data.get("real_time_crypto"):
        crypto = market_data["real_time_crypto"]
        if crypto.get("crypto_prices"):
            btc_data = crypto["crypto_prices"].get("BTC", {})
            eth_data = crypto["crypto_prices"].get("ETH", {})
            sol_data = crypto["crypto_prices"].get("SOL", {})
            
            btc_price = btc_data.get("price_usd", "N/A")
            eth_price = eth_data.get("price_usd", "N/A")
            sol_price = sol_data.get("price_usd", "N/A")
            
            if btc_price != "N/A":
                btc_change = btc_data.get("change_24h", 0)
                summary.append(f"BTC: ${btc_price:,.0f} ({btc_change:+.2f}%)")
            if eth_price != "N/A":
                eth_change = eth_data.get("change_24h", 0)
                summary.append(f"ETH: ${eth_price:,.2f} ({eth_change:+.2f}%)")
            if sol_price != "N/A":
                sol_change = sol_data.get("change_24h", 0)
                summary.append(f"SOL: ${sol_price:,.2f} ({sol_change:+.2f}%)")
        
        if crypto.get("fear_greed_index"):
            fgi = crypto["fear_greed_index"]
            summary.append(f"Fear & Greed: {fgi.get('value', 'N/A')} ({fgi.get('value_classification', 'N/A')})")
    
    # Real-time macro data summary  
    if market_data.get("real_time_macro"):
        macro = market_data["real_time_macro"]
        if macro.get("market_indices"):
            sp500_data = macro["market_indices"].get("sp500", {})
            nasdaq_data = macro["market_indices"].get("nasdaq100", {})
            vix_data = macro["market_indices"].get("vix", {})
            
            if sp500_data.get("price"):
                sp500_price = sp500_data["price"]
                sp500_change = sp500_data.get("change_percent", 0) * 100
                summary.append(f"SPY: ${sp500_price:.2f} ({sp500_change:+.2f}%)")
                
            if nasdaq_data.get("price"):
                nasdaq_price = nasdaq_data["price"]
                nasdaq_change = nasdaq_data.get("change_percent", 0) * 100
                summary.append(f"QQQ: ${nasdaq_price:.2f} ({nasdaq_change:+.2f}%)")
                
            if vix_data.get("price"):
                vix_price = vix_data["price"]
                summary.append(f"VIX: {vix_price:.2f}")
        
        # Interest rates
        if macro.get("interest_rates", {}).get("us10yr"):
            us10yr = macro["interest_rates"]["us10yr"]["yield_percent"]
            summary.append(f"10Y Treasury: {us10yr:.2f}%")
        
        # Consumer data
        consumer = macro.get("consumer_data", {})
        if consumer.get("unemployment_rate"):
            unemployment = consumer["unemployment_rate"]["rate_percent"]
            summary.append(f"Unemployment: {unemployment}%")
    
    # Historical trends and averages
    if market_data.get("historical_crypto"):
        trends = []
        for symbol, data in market_data["historical_crypto"].items():
            week_change = data.get("week_change_percent", 0)
            direction = data.get("trend_direction", "flat")
            average_price = data.get("average_price", 0)
            current_price = data.get("latest_price", 0)
            total_points = data.get("total_data_points", 0)
            
            if symbol == "BTC":
                trends.append(f"BTC: Avg ${average_price:,.0f} | Current ${current_price:,.0f} | 7d {direction} {week_change:+.1f}% | {total_points} data points")
            else:
                trends.append(f"{symbol}: Avg ${average_price:,.2f} | Current ${current_price:,.2f} | 7d {direction} {week_change:+.1f}%")
        if trends:
            summary.append(" | ".join(trends))
    
    # Economic releases summary
    if market_data.get("economic_calendar"):
        calendar = market_data["economic_calendar"]
        if isinstance(calendar, dict) and calendar.get("recent_releases"):
            release_count = len(calendar["recent_releases"])
            categories = calendar.get("key_categories", {})
            cat_summary = []
            for cat, items in categories.items():
                if items and cat != "other":
                    cat_summary.append(f"{len(items)} {cat.replace('_', ' ')}")
            
            if cat_summary:
                summary.append(f"Economic releases: {', '.join(cat_summary[:3])}")
            else:
                summary.append(f"{release_count} economic releases available")
        elif isinstance(calendar, list) and len(calendar) > 0:
            summary.append(f"{len(calendar[:5])} economic releases available")
    
    # Data overview
    if market_data.get("data_overview"):
        overview = market_data["data_overview"]
        available_symbols = overview.get("available_crypto_symbols", [])
        if len(available_symbols) > 3:
            summary.append(f"Historical data: {', '.join(available_symbols[:3])}+")
    
    return " | ".join(summary) if summary else "Market data available for analysis"

@app.route('/api/chat', methods=['POST'])
def chat_with_ai():
    """Chat endpoint for AI investment analysis"""
    try:
        # Check if Groq client is available
        if not groq_client:
            return jsonify({
                "error": "AI chat service is not available. Please configure your Groq API key in backend/.env"
            }), 503
        
        data = request.json
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({"error": "Message is required"}), 400
        
        # Get current market data
        market_data = get_current_market_data()
        
        # Create concise market data summary
        market_summary = summarize_market_data(market_data)
        
        # Create comprehensive context with ALL visualization data
        context_data = {
            "market_summary": market_summary,
            "complete_visualization_data": market_data.get("all_visualization_data", {}),
            "data_sources": {
                "real_time_crypto": market_data.get("real_time_crypto", {}),
                "real_time_macro": market_data.get("real_time_macro", {}),
                "historical_crypto": market_data.get("historical_crypto", {}),
                "economic_calendar": market_data.get("economic_calendar", {}),
                "data_overview": market_data.get("data_overview", {})
            }
        }
        
        # Include full economic calendar data for AI to parse
        releases_context = ""
        if market_data.get("economic_calendar"):
            calendar_data = market_data["economic_calendar"]
            
            # If we have the structured data with recent_releases
            if calendar_data.get("recent_releases"):
                releases_context = f"\n\nFULL ECONOMIC CALENDAR DATA:\n{json.dumps(calendar_data, indent=2)}"
            
            # If we have the raw calendar data
            elif isinstance(calendar_data, dict) and calendar_data.get("events"):
                # Include full events data for AI to search through
                simplified_calendar = {
                    "total_events": calendar_data.get("events_count", len(calendar_data.get("events", []))),
                    "updated_at": calendar_data.get("updated_at"),
                    "events": calendar_data.get("events", [])
                }
                releases_context = f"\n\nFULL ECONOMIC CALENDAR DATA:\n{json.dumps(simplified_calendar, indent=2)}"
        
        # Create optimized system prompt
        system_prompt = f"""You are MarketInfo AI with COMPLETE ACCESS to all data used by the MarketInfo dashboard visualizations.

COMPLETE MARKET & VISUALIZATION DATA: {market_summary}{releases_context}

DATA SOURCES YOU HAVE ACCESS TO:
1. REAL-TIME CRYPTO DATA: Live prices, market caps, volumes, changes for BTC/ETH/SOL
2. REAL-TIME MACRO DATA: Stock indices (SPY/QQQ/VIX), interest rates, economic indicators
3. HISTORICAL CRYPTO DATA: Complete CSV datasets with FULL price history, calculated averages, statistics, and trends
4. ECONOMIC CALENDAR: Full database of economic releases with descriptions
5. VISUALIZATION COMPONENTS DATA: All data used by frontend charts and components

HISTORICAL DATA INCLUDES:
- Complete price history for each crypto symbol
- Calculated average prices, median prices, min/max prices
- Total data points, price ranges, and comprehensive statistics
- All historical data points are available for analysis

CAPABILITIES:
- Calculate and provide exact average prices from historical data
- Analyze crypto prices, trends, and historical patterns with precise statistics
- Explain stock market indices and their movements  
- Interpret economic indicators (CPI, unemployment, retail sales, interest rates)
- Search economic releases database and explain their market impact
- Compare cross-asset performance (crypto vs stocks)
- Analyze Fear & Greed Index and market sentiment
- Reference specific data points used in dashboard visualizations

RESPONSE RULES:
- Use ONLY the actual data provided above - DO NOT make up additional statistics
- When asked for averages, use ONLY the calculated average_price values from historical_crypto data
- DO NOT create fake breakdowns or additional time periods not in the data
- Reference exact prices, percentages, statistics, and release names from the provided data
- Explain what data means for markets and investments
- Keep responses under 250 words but be comprehensive
- Be direct and actionable

You have complete access to analyze any aspect of the market data that powers the visualizations, including calculated statistics like average prices."""

        # Make request to Groq
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.3,  # Lower temperature for more accurate data parsing
            max_tokens=300,   # Increased for comprehensive analysis
            stream=False
        )
        
        ai_response = completion.choices[0].message.content
        
        return jsonify({
            "response": ai_response,
            "model": "llama-3.1-8b-instant",
            "timestamp": pd.Timestamp.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({"error": f"AI chat error: {str(e)}"}), 500

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