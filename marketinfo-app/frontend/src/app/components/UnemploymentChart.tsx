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
  consumer_data: {
    unemployment_rate: {
      rate_percent: number;
      date: string;
      timestamp: string;
      source: string;
    };
  };
}

export default function UnemploymentChart() {
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

  if (!data || !data.consumer_data || !data.consumer_data.unemployment_rate) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No unemployment data available</p>
      </div>
    );
  }

  const unemployment = data.consumer_data.unemployment_rate;

  const chartData = {
    labels: ['Current Unemployment Rate'],
    datasets: [
      {
        label: 'Unemployment Rate (%)',
        data: [unemployment.rate_percent],
        backgroundColor: 'rgba(239, 68, 68, 0.8)', // red for unemployment
        borderColor: 'rgb(239, 68, 68)',
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
        text: 'Unemployment Rate',
        color: 'rgb(249, 250, 251)',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
          },
          afterLabel: function() {
            return `Source: ${unemployment.source}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: 'rgba(139, 92, 246, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: function(value: any) {
            return value.toFixed(1) + '%';
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