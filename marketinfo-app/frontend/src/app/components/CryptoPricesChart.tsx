'use client';

import { useEffect, useState } from 'react';

interface CryptoData {
  crypto_prices: {
    [key: string]: {
      price_usd: number;
      market_cap: number;
      volume_24h: number;
      change_24h: number;
      timestamp: string;
    };
  };
}

export default function CryptoPricesChart() {
  const [data, setData] = useState<CryptoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch('http://localhost:5001/api/pushes/crypto')
      .then(res => res.json())
      .then(response => {
        if (response.error) {
          setError(response.error);
        } else {
          setData(response);
        }
      })
      .catch(err => {
        setError('Failed to fetch crypto data');
        console.error('Error fetching crypto data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-red-400 text-center">
          <p className="font-medium">Error loading prices</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.crypto_prices) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-400">No crypto price data available</p>
      </div>
    );
  }

  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', color: 'text-orange-400' },
    { symbol: 'ETH', name: 'Ethereum', color: 'text-purple-400' },
    { symbol: 'SOL', name: 'Solana', color: 'text-green-400' }
  ];

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toFixed(2)}`;
    }
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getArrow = (change: number) => {
    return change >= 0 ? '↗' : '↘';
  };

  return (
    <div className="space-y-3">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center text-white">
          Crypto Prices (USD)
        </h3>
        
        <div className="space-y-3">
          {cryptos.map(crypto => {
            const cryptoData = data.crypto_prices[crypto.symbol];
            if (!cryptoData) return null;

            const change = cryptoData.change_24h;
            const changeColor = getChangeColor(change);
            const arrow = getArrow(change);

            return (
              <div key={crypto.symbol} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`text-lg font-bold ${crypto.color}`}>
                    {crypto.symbol}
                  </div>
                  <div className="text-sm text-gray-400">
                    {crypto.name}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-lg font-semibold text-white">
                    {formatPrice(cryptoData.price_usd)}
                  </div>
                  <div className={`flex items-center space-x-1 ${changeColor} text-sm font-medium`}>
                    <span className="text-lg">{arrow}</span>
                    <span>{Math.abs(change).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="text-xs text-gray-400 px-2">
        <p className="font-medium text-gray-300 mb-1">Current Cryptocurrency Prices</p>
        <p>Real-time USD prices with 24h change indicators. Green arrows show gains, red arrows show losses.</p>
      </div>
    </div>
  );
} 