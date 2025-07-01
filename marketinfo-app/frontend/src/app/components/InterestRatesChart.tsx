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
  interest_rates: {
    us10yr: {
      yield_percent: number;
      change: number;
      timestamp: string;
    };
    fed_funds_rate: {
      rate_percent: number;
      date: string;
      timestamp: string;
      source: string;
    };
  };
}

export default function InterestRatesChart() {
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

  if (!data || !data.interest_rates) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No interest rates data available</p>
      </div>
    );
  }

  const us10yr = data.interest_rates.us10yr;
  const fedFunds = data.interest_rates.fed_funds_rate;

  const chartData = {
    labels: ['US 10Y Treasury', 'Fed Funds Rate'],
    datasets: [
      {
        label: 'Interest Rate (%)',
        data: [us10yr.yield_percent, fedFunds.rate_percent],
        backgroundColor: [
          'rgba(251, 146, 60, 0.8)', // orange for US 10Y
          'rgba(139, 92, 246, 0.8)', // purple for Fed Funds
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
        text: 'US Interest Rates',
        color: 'rgb(249, 250, 251)',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
          },
          afterLabel: function(context: any) {
            if (context.dataIndex === 0) {
              return `Source: Market Data`;
            } else {
              return `Source: ${fedFunds.source}`;
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
    <div className="space-y-3">
      <div className="h-48 md:h-56">
        <Bar data={chartData} options={options} />
      </div>
      <div className="text-xs text-gray-400 px-2">
        <p className="font-medium text-gray-300 mb-1">US Interest Rates Comparison</p>
        <p>10-year Treasury yield vs Fed Funds rate. Higher rates typically strengthen USD and affect investment flows.</p>
      </div>
    </div>
  );
} 