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

export default function ChangeChart() {
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-center">
          <p className="font-medium">Error loading chart</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.crypto_prices) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No crypto change data available</p>
      </div>
    );
  }

  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
    { symbol: 'ETH', name: 'Ethereum', color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
    { symbol: 'SOL', name: 'Solana', color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30' }
  ];

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getChangeBgColor = (change: number) => {
    return change >= 0 ? 'bg-green-500/20' : 'bg-red-500/20';
  };

  const getChangeBorderColor = (change: number) => {
    return change >= 0 ? 'border-green-500/40' : 'border-red-500/40';
  };

  const getArrow = (change: number) => {
    return change >= 0 ? '↗' : '↘';
  };

  const getChangeIntensity = (change: number) => {
    const absChange = Math.abs(change);
    if (absChange >= 0.1) return 'HIGH'; // 10%+
    if (absChange >= 0.05) return 'MED';  // 5-10%
    return 'LOW'; // <5%
  };

  const getIntensityIndicator = (intensity: string, change: number) => {
    const isPositive = change >= 0;
    switch (intensity) {
      case 'HIGH':
        return isPositive ? '🚀' : '📉';
      case 'MED':
        return isPositive ? '📈' : '📊';
      default:
        return isPositive ? '🟢' : '🔴';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">24-Hour Price Changes</h3>
        <p className="text-sm text-gray-400">Real-time percentage changes over the last 24 hours</p>
      </div>

      <div className="space-y-4">
        {cryptos.map(crypto => {
          const cryptoData = data.crypto_prices[crypto.symbol];
          if (!cryptoData) return null;

          const change = cryptoData.change_24h * 100; // Convert to percentage
          const changeColor = getChangeColor(change);
          const changeBgColor = getChangeBgColor(change);
          const changeBorderColor = getChangeBorderColor(change);
          const arrow = getArrow(change);
          const intensity = getChangeIntensity(Math.abs(change) / 100);
          const intensityIcon = getIntensityIndicator(intensity, change);

          return (
            <div key={crypto.symbol} className={`p-4 ${crypto.bgColor} rounded-xl border ${crypto.borderColor} hover:border-opacity-60 transition-all duration-300`}>
              <div className="flex items-center justify-between">
                {/* Left side - Crypto info */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`text-2xl font-bold ${crypto.color}`}>
                      {crypto.symbol}
                    </div>
                    <div className="text-sm text-gray-400">
                      {crypto.name}
                    </div>
                  </div>
                </div>

                {/* Right side - Change info */}
                <div className="flex items-center space-x-4">
                  {/* Change percentage with visual bar */}
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${changeColor} flex items-center space-x-1`}>
                        <span className="text-3xl">{arrow}</span>
                        <span>{Math.abs(change).toFixed(2)}%</span>
                        <span className="text-2xl">{intensityIcon}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {change >= 0 ? 'GAIN' : 'LOSS'} • {intensity} VOLATILITY
                      </div>
                    </div>
                    
                    {/* Visual progress bar */}
                    <div className="w-20 h-6 bg-gray-700 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full ${changeBgColor} ${changeBorderColor} border transition-all duration-500 rounded-full`}
                        style={{ 
                          width: `${Math.min(Math.abs(change) * 10, 100)}%`,
                          marginLeft: change < 0 ? `${100 - Math.min(Math.abs(change) * 10, 100)}%` : '0%'
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-0.5 h-4 bg-gray-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom row - Additional context */}
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Current Price: ${cryptoData.price_usd.toLocaleString()}</span>
                  <span>Volume: ${(cryptoData.volume_24h / 1000000000).toFixed(2)}B</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend/Help */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
        <div className="text-xs text-gray-400 space-y-2">
          <p className="font-medium text-gray-300 mb-2">How to Read This Display:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>• <span className="text-green-400">Green ↗</span> = Price increased (gains)</div>
            <div>• <span className="text-red-400">Red ↘</span> = Price decreased (losses)</div>
            <div>• 🚀📉 = High volatility (±10%+)</div>
            <div>• 📈📊 = Medium volatility (±5-10%)</div>
            <div>• 🟢🔴 = Low volatility (±0-5%)</div>
            <div>• Progress bar shows change intensity</div>
          </div>
        </div>
      </div>
    </div>
  );
} 