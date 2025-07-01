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

export default function MarketCapChart() {
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
        <p className="text-gray-400">No crypto market cap data available</p>
      </div>
    );
  }

  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', chartColor: '#FB923C' },
    { symbol: 'ETH', name: 'Ethereum', color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30', chartColor: '#A855F7' },
    { symbol: 'SOL', name: 'Solana', color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30', chartColor: '#22C55E' }
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

  const formatMarketCap = (marketCap: number) => {
    const billions = marketCap / 1000000000;
    if (billions >= 1000) {
      return `$${(billions / 1000).toFixed(2)}T`;
    }
    return `$${billions.toFixed(2)}B`;
  };

  const getMarketCapChange = (marketCap: number, priceChange: number) => {
    // Since market cap = price × supply, and supply is constant,
    // market cap change percentage equals price change percentage
    const changeAmount = marketCap * priceChange;
    return {
      percentage: priceChange * 100,
      amount: changeAmount
    };
  };

  const getMarketCapRank = (marketCap: number, allMarketCaps: number[]) => {
    const sorted = [...allMarketCaps].sort((a, b) => b - a);
    return sorted.indexOf(marketCap) + 1;
  };

  const allMarketCaps = cryptos.map(crypto => data.crypto_prices[crypto.symbol]?.market_cap || 0);
  const totalMarketCap = allMarketCaps.reduce((sum, cap) => sum + cap, 0);

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Market Capitalization Overview</h3>
        <p className="text-sm text-gray-400">Total market value and 24-hour changes for major cryptocurrencies</p>
        <div className="mt-2 text-lg font-semibold text-purple-400">
          Total Market Cap: {formatMarketCap(totalMarketCap)}
        </div>
      </div>

      <div className="space-y-4">
        {cryptos.map(crypto => {
          const cryptoData = data.crypto_prices[crypto.symbol];
          if (!cryptoData) return null;

          const marketCap = cryptoData.market_cap;
          const marketCapChange = getMarketCapChange(marketCap, cryptoData.change_24h);
          const changeColor = getChangeColor(marketCapChange.percentage);
          const changeBgColor = getChangeBgColor(marketCapChange.percentage);
          const changeBorderColor = getChangeBorderColor(marketCapChange.percentage);
          const arrow = getArrow(marketCapChange.percentage);
          const intensity = getChangeIntensity(Math.abs(marketCapChange.percentage) / 100);
          const intensityIcon = getIntensityIndicator(intensity, marketCapChange.percentage);
          const rank = getMarketCapRank(marketCap, allMarketCaps);
          const marketShare = ((marketCap / totalMarketCap) * 100);

          return (
            <div key={crypto.symbol} className={`p-5 ${crypto.bgColor} rounded-xl border ${crypto.borderColor} hover:border-opacity-60 transition-all duration-300 hover:scale-[1.02]`}>
              {/* Header with rank and main info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className={`text-3xl font-bold ${crypto.color} flex items-center space-x-2`}>
                      <span>#{rank}</span>
                      <span>{crypto.symbol}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {crypto.name}
                    </div>
                  </div>
                </div>

                {/* Market cap change */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${changeColor} flex items-center space-x-1`}>
                      <span className="text-3xl">{arrow}</span>
                      <span>{Math.abs(marketCapChange.percentage).toFixed(2)}%</span>
                      <span className="text-2xl">{intensityIcon}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {marketCapChange.percentage >= 0 ? 'GAIN' : 'LOSS'} • {intensity} VOLATILITY
                    </div>
                  </div>
                  
                  {/* Visual progress bar */}
                  <div className="w-24 h-6 bg-gray-700 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full ${changeBgColor} ${changeBorderColor} border transition-all duration-500 rounded-full`}
                      style={{ 
                        width: `${Math.min(Math.abs(marketCapChange.percentage) * 10, 100)}%`,
                        marginLeft: marketCapChange.percentage < 0 ? `${100 - Math.min(Math.abs(marketCapChange.percentage) * 10, 100)}%` : '0%'
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-gray-500"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market cap value and share */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {formatMarketCap(marketCap)}
                    </div>
                    <div className="text-sm text-gray-400">
                      Market Capitalization
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-gray-300">
                      {marketShare.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">
                      Market Share
                    </div>
                  </div>
                </div>
              </div>

              {/* Market share visual bar */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs text-gray-400">Market Dominance</span>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000 rounded-full"
                      style={{ 
                        width: `${marketShare}%`,
                        backgroundColor: crypto.chartColor,
                        boxShadow: `0 0 8px ${crypto.chartColor}40`
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-300">{marketShare.toFixed(1)}%</span>
                </div>
              </div>

              {/* Change amount and additional info */}
              <div className="pt-3 border-t border-gray-700/50">
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                  <div>
                    <span className="block text-gray-300 font-medium">24h Change Amount:</span>
                    <span className={`font-bold ${changeColor}`}>
                      {marketCapChange.amount >= 0 ? '+' : ''}{formatMarketCap(Math.abs(marketCapChange.amount))}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-300 font-medium">Current Price:</span>
                    <span className="font-bold text-white">
                      ${cryptoData.price_usd.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
        <div className="text-xs text-gray-400 space-y-2">
          <p className="font-medium text-gray-300 mb-2">Market Cap Insights:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>• Higher market cap = More established & stable</div>
            <div>• Market share shows relative dominance</div>
            <div>• 24h changes reflect investor sentiment</div>
            <div>• Rankings show current market position</div>
          </div>
        </div>
      </div>
    </div>
  );
} 