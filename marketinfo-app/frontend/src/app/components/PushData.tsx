'use client';

import { useEffect, useState } from 'react';

interface PushData {
  [key: string]: any;
}

export default function PushData() {
  const [cryptoData, setCryptoData] = useState<PushData | null>(null);
  const [macroData, setMacroData] = useState<PushData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cryptoResponse, macroResponse] = await Promise.all([
          fetch('http://localhost:5001/api/pushes/crypto').catch(() => null),
          fetch('http://localhost:5001/api/pushes/macro').catch(() => null)
        ]);

        if (cryptoResponse && cryptoResponse.ok) {
          const cryptoJson = await cryptoResponse.json();
          setCryptoData(cryptoJson.error ? null : cryptoJson);
        }

        if (macroResponse && macroResponse.ok) {
          const macroJson = await macroResponse.json();
          setMacroData(macroJson.error ? null : macroJson);
        }
      } catch (err) {
        setError('Failed to fetch push data');
        console.error('Error fetching push data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const renderDataSection = (title: string, data: PushData | null, bgColor: string) => {
    if (!data) {
      return (
        <div className={`${bgColor} p-4 rounded-lg border border-white/10`}>
          <h4 className="font-medium text-sm mb-2 text-gray-200">{title}</h4>
          <p className="text-xs text-gray-400">No data available</p>
        </div>
      );
    }

    // Extract meaningful data from the object
    const entries = Object.entries(data).slice(0, 5); // Limit to first 5 entries

    return (
      <div className={`${bgColor} p-4 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200`}>
        <h4 className="font-medium text-sm mb-3 text-gray-200">{title}</h4>
        <div className="space-y-2">
          {entries.map(([key, value], index) => {
            // Skip certain metadata fields
            if (key.toLowerCase().includes('timestamp') || key.toLowerCase().includes('date')) {
              const formattedDate = new Date(value as string).toLocaleString();
              return (
                <div key={index} className="text-xs">
                  <span className="font-medium text-orange-300">{key}:</span>
                  <span className="text-gray-300 ml-1">{formattedDate}</span>
                </div>
              );
            }

            // Handle different value types
            let displayValue = value;
            if (typeof value === 'object' && value !== null) {
              displayValue = JSON.stringify(value).slice(0, 50) + '...';
            } else if (typeof value === 'number') {
              displayValue = value.toLocaleString();
            } else if (typeof value === 'string' && value.length > 50) {
              displayValue = value.slice(0, 50) + '...';
            }

            return (
              <div key={index} className="text-xs">
                <span className="font-medium text-purple-300">{key}:</span>
                <span className="text-gray-300 ml-1">{String(displayValue)}</span>
              </div>
            );
          })}
          
          {entries.length === 0 && (
            <p className="text-xs text-gray-400">No data fields available</p>
          )}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="text-red-400 text-sm">
        <p className="font-medium">Error loading push data</p>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {renderDataSection('Crypto Push Data', cryptoData, 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10')}
      {renderDataSection('Macro Push Data', macroData, 'bg-gradient-to-br from-green-500/10 to-emerald-500/10')}
      
      {!cryptoData && !macroData && (
        <div className="text-center text-gray-400 py-4">
          <p className="text-sm">No push data available</p>
        </div>
      )}
    </div>
  );
} 