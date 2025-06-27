import requests
from datetime import datetime, timedelta
import plotext as plt
import os
import csv

cryptos = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "SOL": "solana"
}

DATA_DIR = "data"
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

def get_crypto_data(symbol, coingecko_id):
    filename = os.path.join(DATA_DIR, f"{symbol}.csv")
    all_prices = []
    
    if os.path.exists(filename):
        with open(filename, "r", newline="") as f:
            reader = csv.reader(f)
            # Skip header
            next(reader, None)
            for row in reader:
                try:
                    all_prices.append((datetime.strptime(row[0], '%d/%m/%Y'), float(row[1])))
                except (ValueError, IndexError):
                    continue # skip malformed rows

    # Determine the date range for fetching new data
    end_date = datetime.now()
    if all_prices:
        start_date = all_prices[-1][0] + timedelta(days=1)
    else:
        start_date = end_date - timedelta(days=30)
    
    # Fetch new data if needed
    if not all_prices or all_prices[-1][0].date() < end_date.date():
        print(f"Fetching new data for {symbol}...")
        # CoinGecko's free API gives daily data, we fetch last 30 days and filter what's new
        url = f"https://api.coingecko.com/api/v3/coins/{coingecko_id}/market_chart"
        params = { "vs_currency": "usd", "days": "30", "interval": "daily" }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json().get("prices", [])
            
            new_prices = []
            for ts, price in data:
                date = datetime.utcfromtimestamp(ts / 1000)
                if not all_prices or date > all_prices[-1][0]:
                     new_prices.append((date, price))

            if new_prices:
                existing_dates = {p[0] for p in all_prices}
                for date, price in new_prices:
                    if date not in existing_dates:
                        all_prices.append((date, price))
                
                all_prices.sort(key=lambda x: x[0])

                with open(filename, "w", newline="") as f:
                    writer = csv.writer(f)
                    writer.writerow(["date", "price"])
                    for date, price in all_prices:
                        writer.writerow([date.strftime('%d/%m/%Y'), price])
        except requests.exceptions.RequestException as e:
            print(f"Failed to fetch data for {symbol}: {e}")

    # Return last 30 days
    return all_prices[-30:]


all_dates = None
all_prices_dict = {}

for symbol, coingecko_id in cryptos.items():
    price_data = get_crypto_data(symbol, coingecko_id)
    if price_data:
        dates = [date.strftime('%d/%m/%Y') for date, _ in price_data]
        price_values = [price for _, price in price_data]
        
        if all_dates is None:
            all_dates = dates
        
        # Ensure all price lists are the same length as all_dates
        # by padding with the last known value if necessary.
        # This is a simple way to handle missing data for some cryptos on certain days.
        if len(price_values) < len(all_dates):
            last_price = price_values[-1] if price_values else 0
            price_values.extend([last_price] * (len(all_dates) - len(price_values)))
        
        all_prices_dict[symbol] = price_values
        
        print(f"Historical Price Data for {symbol}")
        print("Date\t\tPrice (USD)")
        for date, price in zip(dates, price_values):
            print(f"{date}\t{price:.2f}")
        print()

# Plotting in terminal with plotext
if all_dates:
    plt.clear_figure()
    plt.canvas_color("white")
    plt.axes_color("white")
    
    # Create a figure with 3 rows and 1 column for subplots
    plt.subplots(3, 1)

    colors = ["red", "blue", "green"]
    symbols = list(cryptos.keys())

    for i in range(len(symbols)):
        symbol = symbols[i]
        if symbol in all_prices_dict:
            plt.subplot(i + 1, 1)
            plt.title(f"{symbol} Price (Last 30 Days)")
            plt.plot(all_dates, all_prices_dict[symbol], color=colors[i])
            
            # Add trendline from start to end in yellow
            if len(all_prices_dict[symbol]) >= 2:
                start_price = all_prices_dict[symbol][0]
                end_price = all_prices_dict[symbol][-1]
                trendline_dates = [all_dates[0], all_dates[-1]]
                trendline_prices = [start_price, end_price]
                plt.plot(trendline_dates, trendline_prices, color="bright_yellow", marker="braille")
            
            # Reduce the number of x-axis ticks to avoid clutter
            num_ticks = 5
            step = len(all_dates) // num_ticks if len(all_dates) > num_ticks else 1
            ticks = all_dates[::step]
            plt.xticks(ticks)

    plt.show()
else:
    print("No data to plot.")
