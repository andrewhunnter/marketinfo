'use client';

import { useEffect, useState } from 'react';

interface DataOverviewState {
  crypto_symbols: string[];
  has_crypto_pushes: boolean;
  has_macro_pushes: boolean;
  has_economic_calendar: boolean;
}

export default function DataOverview() {
  const [overview, setOverview] = useState<DataOverviewState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:5001/api/data/overview')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setOverview(data);
        }
      })
      .catch(err => {
        setError('Failed to fetch overview');
        console.error('Error fetching overview:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm">
        <p className="font-medium">Error loading overview</p>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  if (!overview) {
    return <div className="text-gray-400 text-sm">No data available</div>;
  }

  const statusIcon = (available: boolean) => (
    <span className={`inline-block w-3 h-3 rounded-full ${available ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'}`}></span>
  );

  return (
    <div className="space-y-4">
      {/* Crypto Symbols */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20">
        <div className="flex items-center gap-2 mb-2">
          {statusIcon(overview.crypto_symbols.length > 0)}
          <span className="font-medium text-sm text-orange-300">Crypto Data</span>
        </div>
        <div className="pl-4 text-xs text-gray-300">
          {overview.crypto_symbols.length > 0 ? (
            <div className="space-y-1">
              <p>{overview.crypto_symbols.length} symbols available:</p>
              <div className="flex flex-wrap gap-1">
                {overview.crypto_symbols.map(symbol => (
                  <span key={symbol} className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs border border-orange-500/30">
                    {symbol}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p>No crypto data available</p>
          )}
        </div>
      </div>

      {/* Push Data */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
        <div className="flex items-center gap-2 mb-2">
          {statusIcon(overview.has_crypto_pushes)}
          <span className="font-medium text-sm text-purple-300">Crypto Push Data</span>
        </div>
        <div className="pl-4 text-xs text-gray-300">
          {overview.has_crypto_pushes ? 'Available' : 'Not available'}
        </div>
      </div>

      <div className="p-3 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
        <div className="flex items-center gap-2 mb-2">
          {statusIcon(overview.has_macro_pushes)}
          <span className="font-medium text-sm text-pink-300">Macro Push Data</span>
        </div>
        <div className="pl-4 text-xs text-gray-300">
          {overview.has_macro_pushes ? 'Available' : 'Not available'}
        </div>
      </div>

      {/* Economic Calendar */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-2">
          {statusIcon(overview.has_economic_calendar)}
          <span className="font-medium text-sm text-indigo-300">Economic Calendar</span>
        </div>
        <div className="pl-4 text-xs text-gray-300">
          {overview.has_economic_calendar ? 'Available' : 'Not available'}
        </div>
      </div>
    </div>
  );
} 