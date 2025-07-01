'use client';

import { useState, useEffect } from 'react';
import CryptoChart from './components/CryptoChart';
import DataOverview from './components/DataOverview';
import EconomicCalendar from './components/EconomicCalendar';
import PushData from './components/PushData';

// New chart components
import CryptoPricesChart from './components/CryptoPricesChart';
import MarketCapChart from './components/MarketCapChart';
import VolumeChart from './components/VolumeChart';
import ChangeChart from './components/ChangeChart';
import BTCNetworkChart from './components/BTCNetworkChart';
import FearGreedChart from './components/FearGreedChart';
import SP500Chart from './components/SP500Chart';
import NASDAQChart from './components/NASDAQChart';
import MarketIndicesChart from './components/MarketIndicesChart';
import InterestRatesChart from './components/InterestRatesChart';
import ConsumerDataChart from './components/ConsumerDataChart';
import RetailSalesChart from './components/RetailSalesChart';
import MoMYoYChart from './components/MoMYoYChart';
import UnemploymentChart from './components/UnemploymentChart';
import CryptoMarketCapPieChart from './components/CryptoMarketCapPieChart';

export default function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC');
  const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);

  useEffect(() => {
    // Fetch available symbols
    fetch('http://localhost:5001/api/data/overview')
      .then(res => res.json())
      .then(data => {
        if (data.crypto_symbols) {
          setAvailableSymbols(data.crypto_symbols);
          if (data.crypto_symbols.length > 0) {
            setSelectedSymbol(data.crypto_symbols[0]);
          }
        }
      })
      .catch(err => console.error('Error fetching overview:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-red-500/5 to-green-500/5 animate-pulse"></div>
      
      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md border-b border-green-500/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                MarketInfo Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Real-time market data</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Crypto Section */}
        <section className="mb-12">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-orange-400 to-pink-400 bg-clip-text text-transparent mb-8">
              web-3 dashboard
            </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            <div className="bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-green-500/20 p-6 hover:border-green-500/40 transition-all duration-300">
              <CryptoPricesChart />
            </div>
            <div className="bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-green-500/20 p-6 hover:border-green-500/40 transition-all duration-300">
              <CryptoMarketCapPieChart />
            </div>
            <div className="bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-green-500/20 p-6 hover:border-green-500/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Historical Crypto Data
                </h3>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="px-3 py-1 bg-black/80 text-white border border-green-500/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 backdrop-blur-sm text-sm"
                >
                  {availableSymbols.map(symbol => (
                    <option key={symbol} value={symbol} className="bg-black">{symbol}</option>
                  ))}
                </select>
              </div>
              <CryptoChart symbol={selectedSymbol} />
            </div>
            <div className="bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-green-500/20 p-6 hover:border-green-500/40 transition-all duration-300">
              <VolumeChart />
            </div>
            <div className="bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-green-500/20 p-6 hover:border-green-500/40 transition-all duration-300">
              <ChangeChart />
            </div>
            <div className="bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-green-500/20 p-6 hover:border-green-500/40 transition-all duration-300">
              <FearGreedChart />
            </div>
          </div>
        </section>

        {/* Market Indices Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent mb-8">
            Market Indices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            <div className="bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 hover:border-white/40 transition-all duration-300">
              <SP500Chart />
            </div>
            <div className="bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 hover:border-white/40 transition-all duration-300">
              <NASDAQChart />
            </div>
            <div className="bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 hover:border-white/40 transition-all duration-300">
              <MarketIndicesChart />
            </div>
          </div>
        </section>

        {/* Economic Data Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-white bg-clip-text text-transparent mb-8">
            Economic Indicators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            <div className="bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-red-500/20 p-6 hover:border-red-500/40 transition-all duration-300">
              <InterestRatesChart />
            </div>
            <div className="bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-red-500/20 p-6 hover:border-red-500/40 transition-all duration-300">
              <ConsumerDataChart />
            </div>
            <div className="bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-red-500/20 p-6 hover:border-red-500/40 transition-all duration-300">
              <RetailSalesChart />
            </div>
            <div className="bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-red-500/20 p-6 hover:border-red-500/40 transition-all duration-300">
              <MoMYoYChart />
            </div>
            <div className="bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-red-500/20 p-6 hover:border-red-500/40 transition-all duration-300">
              <UnemploymentChart />
            </div>
          </div>
        </section>

        {/* Legacy Components Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-white to-red-400 bg-clip-text text-transparent mb-8">
            news releases + data overview
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Economic Calendar */}
            <div className="bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-500/20 p-6 hover:border-gray-500/40 transition-all duration-300">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-red-300 bg-clip-text text-transparent mb-6">
                Economic Calendar
              </h3>
              <EconomicCalendar />
            </div>

            {/* Data Overview & Push Data */}
            <div className="space-y-6">
              <div className="bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-500/20 p-6 hover:border-green-500/40 transition-all duration-300">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-green-300 to-white bg-clip-text text-transparent mb-4">
                  Data Overview
                </h3>
                <DataOverview />
              </div>

              <div className="bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-500/20 p-6 hover:border-red-500/40 transition-all duration-300">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-red-300 to-white bg-clip-text text-transparent mb-4">
                  Latest Push Data
                </h3>
                <PushData />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
