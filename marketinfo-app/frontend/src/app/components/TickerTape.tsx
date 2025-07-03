'use client';

import { useState, useEffect } from 'react';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  volume?: number;
}

interface TickerTapeProps {
  watchlist?: string[];
}

const TickerTape: React.FC<TickerTapeProps> = ({ 
  watchlist = ['NVDA', 'AAPL', 'AMZN', 'MSFT', 'GOOGL', 'TSLA', 'META'] 
}) => {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:5001/api/stocks/watchlist?symbols=${watchlist.join(',')}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setStockData(data.stocks || []);
            } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load stock data');
        // Set empty array when API fails
        setStockData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStockData, 30000);
    
    return () => clearInterval(interval);
  }, [watchlist]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatChangePercent = (changePercent: number) => {
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="w-full bg-black/90 border-b border-white/10 py-4 overflow-hidden">
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading market data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black/90 border-b border-white/10 py-4 overflow-hidden relative">
      {/* Gradient overlays for smooth fade effect */}
      <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-black/90 to-transparent z-10"></div>
      <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-black/90 to-transparent z-10"></div>
      
      <div className="ticker-scroll">
        <div className="ticker-content">
          {/* Duplicate the content for seamless scrolling */}
          {[...Array(2)].map((_, duplicateIndex) => (
            <div key={duplicateIndex} className="flex items-center space-x-8 whitespace-nowrap">
              {stockData.map((stock, index) => (
                <div
                  key={`${duplicateIndex}-${stock.symbol}-${index}`}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  {/* Stock Symbol */}
                  <div className="text-white font-bold text-lg">
                    ${stock.symbol}
                  </div>
                  
                  {/* Price */}
                  <div className="text-gray-300 font-semibold">
                    {formatPrice(stock.price)}
                  </div>
                  
                  {/* Change */}
                  <div className={`flex items-center space-x-1 font-medium ${
                    stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <span className="text-sm">
                      {formatChange(stock.change)}
                    </span>
                    <span className="text-xs">
                      ({formatChangePercent(stock.changePercent)})
                    </span>
                    {stock.change >= 0 ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
              {/* Spacing between duplicates */}
              <div className="w-8"></div>
            </div>
          ))}
        </div>
      </div>
      
      {error && (
        <div className="absolute top-2 right-4 text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default TickerTape; 