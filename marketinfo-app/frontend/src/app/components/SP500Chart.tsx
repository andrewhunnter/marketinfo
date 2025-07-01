'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MacroData {
  market_indices: {
    sp500: {
      price: number;
      open: number;
      high: number;
      low: number;
      volume: number;
      change: number;
      change_percent: number;
      timestamp: string;
      polygon_price: number;
      polygon_volume: number;
      polygon_high: number;
      polygon_low: number;
    };
  };
}

export default function SPYChart() {
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-center">
          <p className="font-medium">Error loading SPY chart</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.market_indices || !data.market_indices.sp500) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No SPY data available</p>
      </div>
    );
  }

  const sp500 = data.market_indices.sp500;
  const currentPrice = sp500.polygon_price || sp500.price;
  const change = sp500.change_percent;
  const changeColor = change >= 0 ? 'text-green-400' : 'text-red-400';
  const arrow = change >= 0 ? '↗' : '↘';

  const formatPrice = (price: number) => {
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Use polygon data for more accurate OHLC
  const ohlcData = [
    { label: 'Open', value: sp500.open },
    { label: 'High', value: Math.max(sp500.polygon_high || sp500.high, sp500.high) },
    { label: 'Low', value: Math.min(sp500.polygon_low || sp500.low, sp500.low) },
    { label: 'Close', value: sp500.polygon_price || sp500.price },
  ];

  const chartData = {
    labels: ohlcData.map(item => item.label),
    datasets: [
      {
        label: '$SPY OHLC',
        data: ohlcData.map(item => item.value),
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: ohlcData.map((item, index) => {
          if (index === 0) return 'rgb(34, 197, 94)'; // green for open
          if (index === 1) return 'rgb(34, 197, 94)'; // green for high
          if (index === 2) return 'rgb(239, 68, 68)'; // red for low
          return 'rgb(251, 146, 60)'; // orange for close
        }),
        pointBorderColor: 'rgb(255, 255, 255)',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(209, 213, 219)',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: '$SPY Price Range',
        color: 'rgb(249, 250, 251)',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(251, 146, 60, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: function(value: any) {
            return '$' + value.toFixed(2);
          }
        },
      },
      x: {
        grid: {
          color: 'rgba(251, 146, 60, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
    },
  };

  return (
    <div className="space-y-4">
      {/* Clean ticker card */}
      <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-bold text-orange-400">$SPY</div>
            <div className="text-xs text-gray-400">SPDR S&P 500</div>
          </div>
          <div className={`flex items-center space-x-1 ${changeColor} text-sm font-medium`}>
            <span className="text-lg">{arrow}</span>
            <span>{Math.abs(change).toFixed(2)}%</span>
          </div>
        </div>
        
        <div className="text-2xl font-bold text-white mt-2">
          ${formatPrice(currentPrice)}
        </div>
      </div>

      {/* OHLC Chart */}
      <div className="h-48 md:h-56">
        <Line data={chartData} options={options} />
      </div>
      
      <div className="text-xs text-gray-400 px-2">
        <p className="font-medium text-gray-300 mb-1">SPDR S&P 500 ETF OHLC</p>
        <p>Open, High, Low, Close prices showing the day's trading range for SPY.</p>
      </div>
    </div>
  );
} 