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

export default function CryptoMarketCapPieChart() {
  const [data, setData] = useState<CryptoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

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

  // Animation effect
  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => {
        setAnimationProgress(1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [data]);

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
    { 
      symbol: 'BTC', 
      name: 'Bitcoin', 
      color: '#FB923C',
      gradient: 'from-orange-400 to-orange-600',
      glowColor: 'rgba(251, 146, 60, 0.4)',
      textColor: 'text-orange-400'
    },
    { 
      symbol: 'ETH', 
      name: 'Ethereum', 
      color: '#A855F7',
      gradient: 'from-purple-400 to-purple-600',
      glowColor: 'rgba(168, 85, 247, 0.4)',
      textColor: 'text-purple-400'
    },
    { 
      symbol: 'SOL', 
      name: 'Solana', 
      color: '#22C55E',
      gradient: 'from-green-400 to-green-600',
      glowColor: 'rgba(34, 197, 94, 0.4)',
      textColor: 'text-green-400'
    }
  ];

  const marketCaps = cryptos.map(crypto => data.crypto_prices[crypto.symbol]?.market_cap || 0);
  const totalMarketCap = marketCaps.reduce((sum, cap) => sum + cap, 0);

  const formatMarketCap = (marketCap: number) => {
    const billions = marketCap / 1000000000;
    if (billions >= 1000) {
      return `$${(billions / 1000).toFixed(2)}T`;
    }
    return `$${billions.toFixed(2)}B`;
  };

  const getMarketCapChange = (marketCap: number, priceChange: number) => {
    const changeAmount = marketCap * priceChange;
    return {
      percentage: priceChange * 100,
      amount: changeAmount
    };
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getArrow = (change: number) => {
    return change >= 0 ? '↗' : '↘';
  };

  // Calculate angles for pie chart
  let currentAngle = -90; // Start from top
  const segments = cryptos.map((crypto, index) => {
    const marketCap = marketCaps[index];
    const percentage = (marketCap / totalMarketCap) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...crypto,
      marketCap,
      percentage,
      startAngle,
      endAngle,
      angle,
      cryptoData: data.crypto_prices[crypto.symbol]
    };
  });

  const createPath = (centerX: number, centerY: number, startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const start = polarToCartesian(centerX, centerY, outerRadius, endAngle);
    const end = polarToCartesian(centerX, centerY, outerRadius, startAngle);
    const innerStart = polarToCartesian(centerX, centerY, innerRadius, endAngle);
    const innerEnd = polarToCartesian(centerX, centerY, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y, 
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
      "L", innerEnd.x, innerEnd.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const centerX = 90;
  const centerY = 90;
  const innerRadius = 35;
  const outerRadius = 75;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-1">
          Market Cap Distribution
        </h3>
        <div className="text-sm font-semibold text-white">
          Total: {formatMarketCap(totalMarketCap)}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {/* Custom SVG Donut Chart */}
        <div className="relative">
          <svg width="180" height="180" className="transform -rotate-90">
            <defs>
              {segments.map((segment, index) => (
                <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={segment.color} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={segment.color} stopOpacity="1" />
                </linearGradient>
              ))}
              {segments.map((segment, index) => (
                <filter key={`glow-${index}`} id={`glow-${index}`}>
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              ))}
            </defs>
            
            {segments.map((segment, index) => {
              const animatedEndAngle = segment.startAngle + (segment.angle * animationProgress);
              const path = createPath(centerX, centerY, segment.startAngle, animatedEndAngle, innerRadius, outerRadius);
              const isHovered = hoveredIndex === index;
              const currentOuterRadius = isHovered ? outerRadius + 8 : outerRadius;
              const hoveredPath = isHovered ? createPath(centerX, centerY, segment.startAngle, animatedEndAngle, innerRadius, currentOuterRadius) : path;
              
              return (
                <path
                  key={index}
                  d={hoveredPath}
                  fill={`url(#gradient-${index})`}
                  stroke={segment.color}
                  strokeWidth="2"
                  filter={isHovered ? `url(#glow-${index})` : 'none'}
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 12px ${segment.glowColor})` : 'none'
                  }}
                />
              );
            })}
            
            {/* Center circle with total */}
            <circle
              cx={centerX}
              cy={centerY}
              r={innerRadius - 5}
              fill="rgba(0, 0, 0, 0.8)"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
            
            {/* Center text */}
            <text
              x={centerX}
              y={centerY - 5}
              textAnchor="middle"
              className="fill-white text-xs font-bold"
              transform={`rotate(90 ${centerX} ${centerY})`}
            >
              TOTAL
            </text>
            <text
              x={centerX}
              y={centerY + 8}
              textAnchor="middle"
              className="fill-purple-400 text-xs font-semibold"
              transform={`rotate(90 ${centerX} ${centerY})`}
            >
              {formatMarketCap(totalMarketCap)}
            </text>
          </svg>

          {/* Hover tooltip */}
          {hoveredIndex !== null && (
            <div className="absolute top-1 left-1 bg-black/90 backdrop-blur-sm rounded-lg p-2 border border-white/20 z-10">
              <div className="text-white text-xs font-semibold">
                {segments[hoveredIndex].name}
              </div>
              <div className="text-gray-300 text-xs">
                {segments[hoveredIndex].percentage.toFixed(1)}% of total
              </div>
              <div className="text-purple-400 text-xs font-bold">
                {formatMarketCap(segments[hoveredIndex].marketCap)}
              </div>
            </div>
          )}
        </div>

        {/* Compact Legend */}
        <div className="w-full space-y-2">
          {segments.map((segment, index) => {
            const marketCapChange = getMarketCapChange(segment.marketCap, segment.cryptoData.change_24h);
            const changeColor = getChangeColor(marketCapChange.percentage);
            const arrow = getArrow(marketCapChange.percentage);

            return (
              <div
                key={segment.symbol}
                className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                  hoveredIndex === index 
                    ? 'bg-white/10 border-white/30 scale-[1.02]' 
                    : 'bg-white/5 border-white/10 hover:bg-white/8'
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  boxShadow: hoveredIndex === index ? `0 0 15px ${segment.glowColor}` : 'none'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <div className={`text-sm font-bold ${segment.textColor}`}>
                      {segment.symbol}
                    </div>
                    <div className="text-xs text-gray-400">
                      {segment.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${changeColor} flex items-center space-x-1`}>
                      <span className="text-xs">{arrow}</span>
                      <span>{Math.abs(marketCapChange.percentage).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Cap:</span>
                    <span className="text-white font-semibold ml-1">
                      {formatMarketCap(segment.marketCap)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Share:</span>
                    <span className="text-purple-400 font-semibold ml-1">
                      {segment.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {/* Compact market share progress bar */}
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000 rounded-full"
                      style={{ 
                        width: `${segment.percentage * animationProgress}%`,
                        backgroundColor: segment.color,
                        boxShadow: `0 0 6px ${segment.glowColor}`
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 