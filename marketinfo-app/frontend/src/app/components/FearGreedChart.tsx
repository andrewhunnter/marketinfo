'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface CryptoData {
  fear_greed_index: {
    value: number;
    value_classification: string;
    timestamp: string;
  };
}

export default function FearGreedChart() {
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

  if (!data || !data.fear_greed_index) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No Fear & Greed Index data available</p>
      </div>
    );
  }

  const fearGreedData = data.fear_greed_index;
  const value = fearGreedData.value;
  const remaining = 100 - value;

  // Color coding based on value
  let color;
  if (value < 25) {
    color = 'rgba(239, 68, 68, 0.8)'; // red for extreme fear
  } else if (value < 45) {
    color = 'rgba(249, 115, 22, 0.8)'; // orange for fear
  } else if (value < 55) {
    color = 'rgba(234, 179, 8, 0.8)'; // yellow for neutral
  } else if (value < 75) {
    color = 'rgba(34, 197, 94, 0.8)'; // green for greed
  } else {
    color = 'rgba(22, 163, 74, 0.8)'; // dark green for extreme greed
  }

  const chartData = {
    labels: [fearGreedData.value_classification, 'Remaining'],
    datasets: [
      {
        data: [value, remaining],
        backgroundColor: [
          color,
          'rgba(75, 85, 99, 0.3)', // gray for remaining
        ],
        borderColor: [
          color.replace('0.8', '1'),
          'rgba(75, 85, 99, 0.5)',
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
        position: 'bottom' as const,
        labels: {
          color: 'rgb(209, 213, 219)',
          font: {
            size: 12,
          },
          filter: function(legendItem: any) {
            return legendItem.text !== 'Remaining';
          }
        },
      },
      title: {
        display: true,
        text: 'Fear & Greed Index',
        color: 'rgb(249, 250, 251)',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
             tooltip: {
         callbacks: {
           label: function(context: any) {
             if (context.dataIndex === 0) {
               return `${fearGreedData.value_classification}: ${value}`;
             }
             return undefined;
           }
         }
       }
    },
    cutout: '50%',
  };

  return (
    <div className="space-y-3">
      <div className="h-48 md:h-56 flex flex-col items-center">
        <div className="flex-1 w-full">
          <Doughnut data={chartData} options={options} />
        </div>
        <div className="text-center mt-2">
          <div className="text-xl font-bold text-white">{value}</div>
          <div className="text-xs text-gray-400">{fearGreedData.value_classification}</div>
        </div>
      </div>
      <div className="text-xs text-gray-400 px-2">
        <p className="font-medium text-gray-300 mb-1">Crypto Fear & Greed Index</p>
        <p>Measures market sentiment from 0 (extreme fear) to 100 (extreme greed). Helps identify buying/selling opportunities.</p>
      </div>
    </div>
  );
} 