'use client';

import { useEffect, useState } from 'react';

interface MacroData {
  market_indices: {
    sp500: {
      price: number;
      change: number;
      change_percent: number;
      timestamp: string;
      polygon_price: number;
    };
    nasdaq100: {
      price: number;
      change: number;
      change_percent: number;
      timestamp: string;
      polygon_price: number;
    };
  };
}

export default function CombinedIndicesChart() {
  const [data, setData] = useState<MacroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch('http://localhost:5001/api/pushes/macro')
      .then(res => res.json())
      .then(response => {
        if (response.error) {
          setError(response.error);
        } else {
          setData(response);
        }
      })
      .catch(err => {
        setError('Failed to fetch macro data');
        console.error('Error fetching macro data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-red-400 text-center">
          <p className="font-medium">Error loading indices</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.market_indices) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-400">No market indices data available</p>
      </div>
    );
  }

  const { sp500, nasdaq100 } = data.market_indices;

  const formatPrice = (price: number) => {
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getArrow = (change: number) => {
    return change >= 0 ? '↗' : '↘';
  };

  const indices = [
    {
      name: 'SPDR S&P 500',
      symbol: '$SPY',
      data: sp500,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30'
    },
    {
      name: 'Invesco QQQ',
      symbol: '$QQQ',
      data: nasdaq100,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center text-white">
        Market ETFs
      </h3>
      
      <div className="space-y-3">
        {indices.map(index => {
          if (!index.data) return null;
          
          const currentPrice = index.data.polygon_price || index.data.price;
          const change = index.data.change_percent;
          const changeColor = getChangeColor(change);
          const arrow = getArrow(change);

          return (
            <div key={index.symbol} className={`p-4 ${index.bgColor} rounded-lg border ${index.borderColor} hover:border-opacity-50 transition-all duration-200`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`text-sm font-bold ${index.color}`}>
                    {index.symbol}
                  </div>
                  <div className="text-xs text-gray-400">
                    {index.name}
                  </div>
                </div>
                <div className={`flex items-center space-x-1 ${changeColor} text-sm font-medium`}>
                  <span className="text-lg">{arrow}</span>
                  <span>{Math.abs(change).toFixed(2)}%</span>
                </div>
              </div>

              {/* Price */}
              <div className="text-xl font-bold text-white">
                ${formatPrice(currentPrice)}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="text-xs text-gray-400 px-2">
        <p className="font-medium text-gray-300 mb-1">Popular Market ETFs</p>
        <p>Real-time SPY and QQQ prices tracking major US market performance.</p>
      </div>
    </div>
  );
} 