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
  hash_rates: {
    BTC: {
      hash_rate_th_s: number;
      difficulty: number;
      timestamp: string;
    };
  };
}

export default function BTCNetworkChart() {
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

  if (!data || !data.hash_rates || !data.hash_rates.BTC) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No BTC network data available</p>
      </div>
    );
  }

  const btcData = data.hash_rates.BTC;
  
  // Normalize the data for better visualization
  const hashRateNormalized = btcData.hash_rate_th_s; // TH/s
  const difficultyNormalized = btcData.difficulty / 1000000000000; // Convert to trillions

  const chartData = {
    labels: ['Hash Rate (TH/s)', 'Difficulty (T)'],
    datasets: [
      {
        label: 'BTC Network Stats',
        data: [hashRateNormalized, difficultyNormalized],
        backgroundColor: [
          'rgba(251, 146, 60, 0.8)', // orange for hash rate
          'rgba(139, 92, 246, 0.8)', // purple for difficulty
        ],
        borderColor: [
          'rgb(251, 146, 60)',
          'rgb(139, 92, 246)',
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
        text: 'BTC Network Stats',
        color: 'rgb(249, 250, 251)',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const index = context.dataIndex;
            if (index === 0) {
              return `Hash Rate: ${btcData.hash_rate_th_s.toFixed(2)} TH/s`;
            } else {
              return `Difficulty: ${btcData.difficulty.toLocaleString()}`;
            }
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
    <div className="space-y-3">
      <div className="h-48 md:h-56">
        <Bar data={chartData} options={options} />
      </div>
      <div className="text-xs text-gray-400 px-2">
        <p className="font-medium text-gray-300 mb-1">Bitcoin Network Health</p>
        <p>Hash rate shows mining power securing the network. Difficulty adjusts to maintain 10-minute block times.</p>
      </div>
    </div>
  );
} 