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

interface CryptoData {
  [key: string]: any;
}

interface CryptoChartProps {
  symbol: string;
}

export default function CryptoChart({ symbol }: CryptoChartProps) {
  const [data, setData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    setLoading(true);
    setError(null);

    fetch(`http://localhost:5001/api/crypto/prices/${symbol}`)
      .then(res => res.json())
      .then(response => {
        if (response.error) {
          setError(response.error);
        } else {
          setData(response.data || []);
        }
      })
      .catch(err => {
        setError('Failed to fetch data');
        console.error('Error fetching crypto data:', err);
      })
      .finally(() => setLoading(false));
  }, [symbol]);

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

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No data available for {symbol}</p>
      </div>
    );
  }

  // Extract labels and values from the data
  // Create simple numbered labels for minimal look
  const labels = data.map((_, index) => (index + 1).toString());

  // Try to find price-like columns
  const priceKey = Object.keys(data[0]).find(key => 
    key.toLowerCase().includes('price') || 
    key.toLowerCase().includes('close') || 
    key.toLowerCase().includes('value')
  ) || Object.keys(data[0])[1]; // fallback to second column

  const prices = data.map(item => parseFloat(item[priceKey]) || 0);

  // Calculate trend line from beginning to end
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const trendLineData = prices.map((_, index) => {
    const progress = index / (prices.length - 1);
    return firstPrice + (lastPrice - firstPrice) * progress;
  });

  // Calculate support and resistance levels
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const priceRange = maxPrice - minPrice;
  
  // Resistance level (yellow) - upper level
  const resistance = maxPrice - priceRange * 0.15; // 15% below max
  
  // Support level (white) - lower level  
  const support = minPrice + priceRange * 0.15; // 15% above min

  // Create arrays for horizontal lines
  const resistanceData = new Array(prices.length).fill(resistance);
  const supportData = new Array(prices.length).fill(support);

  const chartData = {
    labels,
    datasets: [
      {
        label: `${symbol} Price`,
        data: prices,
        borderColor: 'rgb(251, 146, 60)', // orange-400
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(251, 146, 60)',
        pointBorderColor: 'rgb(251, 146, 60)',
        pointHoverBackgroundColor: 'rgb(251, 146, 60)',
        pointHoverBorderColor: 'rgb(255, 255, 255)',
        pointRadius: 4,
        pointHoverRadius: 6,
        order: 1,
      },
      {
        label: 'Trend Line',
        data: trendLineData,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [10, 5], // Dotted line
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        order: 2,
      },
      {
        label: 'Resistance',
        data: resistanceData,
        borderColor: 'rgba(255, 255, 0, 0.8)', // Yellow
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [8, 4],
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        order: 3,
      },
      {
        label: 'Support',
        data: supportData,
        borderColor: 'rgba(255, 255, 255, 0.8)', // White
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [8, 4],
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        order: 4,
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
          color: 'rgb(209, 213, 219)', // gray-300
          font: {
            size: 12,
          },
          filter: function(legendItem: any) {
            // Show all legend items
            return true;
          }
        },
      },
      title: {
        display: true,
        text: `${symbol} Price Chart with Technical Analysis`,
        color: 'rgb(249, 250, 251)', // gray-50
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            if (context.datasetIndex === 0) {
              return `${symbol} Price: $${context.parsed.y.toFixed(2)}`;
            } else if (context.datasetIndex === 1) {
              return `Trend: $${context.parsed.y.toFixed(2)}`;
            } else if (context.datasetIndex === 2) {
              return `Resistance: $${context.parsed.y.toFixed(2)}`;
            } else if (context.datasetIndex === 3) {
              return `Support: $${context.parsed.y.toFixed(2)}`;
            }
            return '';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(139, 92, 246, 0.2)', // purple-500 with opacity
        },
        ticks: {
          color: 'rgb(156, 163, 175)', // gray-400
          callback: function(value: any) {
            return '$' + value.toFixed(2);
          }
        },
      },
      x: {
        grid: {
          color: 'rgba(139, 92, 246, 0.2)', // purple-500 with opacity
        },
        ticks: {
          color: 'rgb(156, 163, 175)', // gray-400
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div className="h-96 md:h-[32rem] lg:h-[36rem]">
      <Line data={chartData} options={options} />
    </div>
  );
} 