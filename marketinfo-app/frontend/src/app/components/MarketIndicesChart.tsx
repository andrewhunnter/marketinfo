'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MacroData {
  market_indices: {
    sp500: {
      price: number;
      change_percent: number;
      polygon_price: number;
    };
    nasdaq100: {
      price: number;
      change_percent: number;
      polygon_price: number;
    };
  };
}

export default function MarketIndicesChart() {
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

  if (!data || !data.market_indices) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No market indices data available</p>
      </div>
    );
  }

  const sp500 = data.market_indices.sp500;
  const nasdaq100 = data.market_indices.nasdaq100;

  const chartData = {
    labels: ['S&P 500', 'NASDAQ 100'],
    datasets: [
      {
        label: 'Price ($)',
        data: [
          sp500.polygon_price || sp500.price,
          nasdaq100.polygon_price || nasdaq100.price
        ],
        backgroundColor: [
          'rgba(251, 146, 60, 0.8)', // orange for S&P 500
          'rgba(139, 92, 246, 0.8)', // purple for NASDAQ 100
        ],
        borderColor: [
          'rgb(251, 146, 60)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 2,
        yAxisID: 'y',
      },
      {
        label: 'Change (%)',
        data: [sp500.change_percent, nasdaq100.change_percent],
        backgroundColor: [
          sp500.change_percent >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)',
          nasdaq100.change_percent >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          sp500.change_percent >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
          nasdaq100.change_percent >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
        yAxisID: 'y1',
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
        text: 'Market Indices Comparison',
        color: 'rgb(249, 250, 251)',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            if (context.datasetIndex === 0) {
              return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
            } else {
              return `${context.dataset.label}: ${context.parsed.y >= 0 ? '+' : ''}${context.parsed.y.toFixed(2)}%`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(139, 92, 246, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: 'rgba(139, 92, 246, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: function(value: any) {
            return '$' + value.toFixed(0);
          }
        },
        title: {
          display: true,
          text: 'Price ($)',
          color: 'rgb(156, 163, 175)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: function(value: any) {
            return value.toFixed(1) + '%';
          }
        },
        title: {
          display: true,
          text: 'Change (%)',
          color: 'rgb(156, 163, 175)',
        },
      },
    },
  };

  return (
    <div className="h-64 md:h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
} 