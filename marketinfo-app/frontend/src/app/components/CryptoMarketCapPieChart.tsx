'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
    { symbol: 'BTC', name: 'Bitcoin', color: 'rgba(251, 146, 60, 0.8)' },
    { symbol: 'ETH', name: 'Ethereum', color: 'rgba(139, 92, 246, 0.8)' },
    { symbol: 'SOL', name: 'Solana', color: 'rgba(34, 197, 94, 0.8)' }
  ];

  const marketCaps = cryptos.map(crypto => data.crypto_prices[crypto.symbol]?.market_cap || 0);
  const totalMarketCap = marketCaps.reduce((sum, cap) => sum + cap, 0);

  const chartData = {
    labels: cryptos.map(crypto => crypto.name),
    datasets: [
      {
        label: 'Market Cap (USD)',
        data: marketCaps,
        backgroundColor: cryptos.map(crypto => crypto.color),
        borderColor: [
          'rgb(251, 146, 60)', // orange for BTC
          'rgb(139, 92, 246)', // purple for ETH
          'rgb(34, 197, 94)',  // green for SOL
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(209, 213, 219)',
          font: {
            size: 11,
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const billions = value / 1000000000;
            const percentage = ((value / totalMarketCap) * 100).toFixed(1);
            return `${context.label}: $${billions.toFixed(2)}B (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-center text-white">
        Crypto Market Cap Distribution
      </h3>
      <div className="h-48 md:h-56">
        <Pie data={chartData} options={options} />
      </div>
      <div className="text-xs text-gray-400 px-2">
        <p className="font-medium text-gray-300 mb-1">Market Cap Distribution</p>
        <p>Proportional representation of cryptocurrency market capitalizations. Shows market dominance and relative size.</p>
        <div className="mt-2 space-y-1">
          {cryptos.map((crypto, index) => {
            const marketCap = marketCaps[index];
            const percentage = ((marketCap / totalMarketCap) * 100).toFixed(1);
            const billions = marketCap / 1000000000;
            return (
              <div key={crypto.symbol} className="flex justify-between text-xs">
                <span className="text-gray-300">{crypto.name}:</span>
                <span className="text-gray-400">${billions.toFixed(2)}B ({percentage}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 