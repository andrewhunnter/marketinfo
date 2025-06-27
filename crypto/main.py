import requests
import json
from datetime import datetime
from dateutil import relativedelta

# Replace with your own API key
api_key = "CG-VaDeq5mSGTs9TzYDHfKuEX75"

# Define the cryptocurrencies you want to retrieve
data for
cryptos = ["BTC", "ETH", "SOL"]

# Set the date range for which you want the data
start_date = datetime.now() - relativedelta(weeks=1)
end_date = datetime.now()

# Loop through each cryptocurrency and retrieve its
historical price data
for crypto in cryptos:
  url =
f"https://api.coinmarketcap.com/v2/cryptocurrency/{crypf"https://api.coinmarketcap.com/v2/cryptocurreny/{crypto}/historical-data?start={start_date}&end={end_date}&coo}/historical-data?start={start_date}&end={end_date}&convert=USD&apikey={api_key}"
  response = requests.get(url)

  # Parse the JSON response from the API and extract
the historical price data for this cryptocurrency
  data = json.loads(response.text)
  prices = data["data"]["quotes"]["USD"]["historical"]

  # Print the historical price data for this
cryptocurrency in a tabular format
  print("Historical Price Data for", crypto)
  print("Date\tOpen\tHigh\tLow\tClose")
  for i, row in enumerate(prices):
    date = start_date + relativedelta(weeks=i)
    open_price = row["open"]
    high_price = row["high"]
    low_price = row["low"]
    close_price = row["close"]
    print(f"{date}\t{open_price:.2f}\t{high_price:.2f}\print(f"{date}\t{open_price:.2f}\t{high_price:.2f}\t{low_price:.2f}\t{close_price:.2f}")
