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
  consumer_data: {
    retail_sales: {
      value: number;
      change_mom: number;
      change_yoy: number;
      date: string;
      timestamp: string;
      source: string;
    };
  };
}

export default function RetailSalesChart() {
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

  if (!data || !data.consumer_data || !data.consumer_data.retail_sales) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No retail sales data available</p>
      </div>
    );
  }

  const retailSales = data.consumer_data.retail_sales;

  // Create data points for visualization
  const dataPoints = [
    { label: 'Value (Billions)', value: retailSales.value / 1000, color: 'rgb(251, 146, 60)' },
    { label: 'MoM Change (%)', value: retailSales.change_mom, color: 'rgb(34, 197, 94)' },
    { label: 'YoY Change (%)', value: retailSales.change_yoy, color: 'rgb(139, 92, 246)' },
  ];

  const chartData = {
    labels: dataPoints.map(point => point.label),
    datasets: [
      {
        label: 'Retail Sales Metrics',
        data: dataPoints.map(point => point.value),
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: dataPoints.map(point => point.color),
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
        text: 'Retail Sales',
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
              return `Value: $${retailSales.value.toLocaleString()} Million`;
            } else if (index === 1) {
              return `MoM Change: ${retailSales.change_mom.toFixed(2)}%`;
            } else {
              return `YoY Change: ${retailSales.change_yoy.toFixed(2)}%`;
            }
          },
          afterLabel: function() {
            return `Source: ${retailSales.source}`;
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
        <Line data={chartData} options={options} />
      </div>
      <div className="text-xs text-gray-400 px-2">
        <p className="font-medium text-gray-300 mb-1">Retail Sales Performance</p>
        <p>Monthly retail sales data with MoM and YoY changes. Indicates consumer spending strength and economic health.</p>
      </div>
    </div>
  );
} 