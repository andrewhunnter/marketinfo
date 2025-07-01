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

export default function VolumeChart() {
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
        <p className="text-gray-400">No crypto volume data available</p>
      </div>
    );
  }

  const cryptos = ['BTC', 'ETH', 'SOL'];
  const volumes = cryptos.map(crypto => data.crypto_prices[crypto]?.volume_24h || 0);

  const chartData = {
    labels: cryptos,
    datasets: [
      {
        label: '24h Volume (USD)',
        data: volumes,
        backgroundColor: [
          'rgba(251, 146, 60, 0.8)', // orange for BTC
          'rgba(139, 92, 246, 0.8)', // purple for ETH
          'rgba(34, 197, 94, 0.8)',  // green for SOL
        ],
        borderColor: [
          'rgb(251, 146, 60)',
          'rgb(139, 92, 246)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 2,
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
        text: '24h Volume',
        color: 'rgb(249, 250, 251)',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            const billions = value / 1000000000;
            return `${context.dataset.label}: $${billions.toFixed(2)}B`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(139, 92, 246, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: function(value: any) {
            const billions = value / 1000000000;
            return '$' + billions.toFixed(1) + 'B';
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
      <Bar data={chartData} options={options} />
    </div>
  );
} 