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
    nasdaq100: {
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

export default function NASDAQChart() {
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
          <p className="font-medium">Error loading chart</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.market_indices || !data.market_indices.nasdaq100) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No NASDAQ 100 data available</p>
      </div>
    );
  }

  const nasdaq100 = data.market_indices.nasdaq100;
  
  // Use polygon data for more accurate OHLC
  const ohlcData = [
    { label: 'Open', value: nasdaq100.open },
    { label: 'High', value: Math.max(nasdaq100.polygon_high, nasdaq100.high) },
    { label: 'Low', value: Math.min(nasdaq100.polygon_low, nasdaq100.low) },
    { label: 'Close', value: nasdaq100.polygon_price || nasdaq100.price },
  ];

  const chartData = {
    labels: ohlcData.map(item => item.label),
    datasets: [
      {
        label: 'NASDAQ 100 OHLC',
        data: ohlcData.map(item => item.value),
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: ohlcData.map((item, index) => {
          if (index === 0) return 'rgb(34, 197, 94)'; // green for open
          if (index === 1) return 'rgb(34, 197, 94)'; // green for high
          if (index === 2) return 'rgb(239, 68, 68)'; // red for low
          return 'rgb(139, 92, 246)'; // purple for close
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
        text: 'NASDAQ 100 Price Range',
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
          color: 'rgba(139, 92, 246, 0.2)',
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
          color: 'rgba(139, 92, 246, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
    },
  };

  return (
    <div className="h-64 md:h-80">
      <Line data={chartData} options={options} />
    </div>
  );
} 