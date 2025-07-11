'use client';

import { useState, useEffect } from 'react';
import CryptoChart from './components/CryptoChart';

import EconomicCalendar from './components/EconomicCalendar';
import PushData from './components/PushData';

// New chart components
import CryptoPricesChart from './components/CryptoPricesChart';
import MarketCapChart from './components/MarketCapChart';
import VolumeChart from './components/VolumeChart';
import ChangeChart from './components/ChangeChart';
import BTCNetworkChart from './components/BTCNetworkChart';
import FearGreedChart from './components/FearGreedChart';
import SPYChart from './components/SP500Chart';
import QQQChart from './components/NASDAQChart';
import MarketIndicesChart from './components/MarketIndicesChart';
import InterestRatesChart from './components/InterestRatesChart';
import ConsumerDataChart from './components/ConsumerDataChart';
import RetailSalesChart from './components/RetailSalesChart';
import MoMYoYChart from './components/MoMYoYChart';
import UnemploymentChart from './components/UnemploymentChart';
import CryptoMarketCapPieChart from './components/CryptoMarketCapPieChart';
import CombinedIndicesChart from './components/CombinedIndicesChart';
import ChatBot from './components/ChatBot';
import FloatingChatButton from './components/FloatingChatButton';
import TickerTape from './components/TickerTape';


export default function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC');
  const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);



  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      .catch(err => console.error('Error fetching overview:', err))
      .finally(() => setIsLoaded(true));
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background with particles */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-slate-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent"></div>
        {isMounted && (
          <div className="particles">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 20}s`,
                  animationDuration: `${15 + Math.random() * 10}s`
                }}
              ></div>
            ))}
          </div>
        )}
      </div>
      
      {/* Ticker Tape Header */}
      <TickerTape watchlist={['NVDA', 'AAPL', 'AMZN', 'MSFT', 'GOOGL', 'TSLA', 'META']} />
      
      {/* Brand Header */}
      <header className="relative z-10 glass backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-6">
            <div className="text-center">
              <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-amber-400 to-pink-400 bg-clip-text text-transparent neon-text tracking-tight">
                marketinfo
              </h1>
              <p className="text-gray-400 text-sm font-medium">personal dashboard for market analysis</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">


        {/* Economic Calendar & Market Overview Section - 3 Column Layout */}
        <section className="animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Economic Calendar */}
            <div className="glass-card rounded-3xl p-8 card-hover animate-fade-in-left h-full">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Economic Events
                  </h3>
                  <p className="text-gray-400 text-sm">Upcoming market movers</p>
                </div>
              </div>
              <div className="flex-1">
                <EconomicCalendar />
              </div>
            </div>

            {/* Crypto Snapshot */}
            <div className="glass-card rounded-3xl p-8 card-hover animate-fade-in">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                    Crypto Snapshot
                  </h3>
                  <p className="text-gray-400 text-sm">Digital asset overview</p>
                </div>
              </div>
              <div className="space-y-8">
                <div className="pb-6 border-b border-white/10">
                  <CryptoPricesChart />
                </div>
                <div className="pb-6 border-b border-white/10">
                  <CryptoMarketCapPieChart />
                </div>
                <div>
                  <VolumeChart />
                </div>
              </div>
            </div>

            {/* Market Indices */}
            <div className="glass-card rounded-3xl p-8 card-hover animate-fade-in-right">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Market ETFs
                  </h3>
                  <p className="text-gray-400 text-sm">Popular trading instruments</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <SPYChart />
                <QQQChart />
              </div>
            </div>
          </div>
        </section>

        {/* Crypto Section */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-white">
              Web3 Dashboard
              <span className="block text-lg font-normal text-gray-400 mt-2">Decentralized finance insights</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3 glass-card rounded-3xl p-8 card-hover">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">
                  Historical Crypto Data
                </h3>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="bg-black/50 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm font-medium cursor-pointer hover:bg-black/70 transition-colors"
                  style={{ minWidth: '80px' }}
                >
                  {availableSymbols.map(symbol => (
                    <option key={symbol} value={symbol} className="bg-gray-900 text-white">{symbol}</option>
                  ))}
                </select>
              </div>
              <CryptoChart symbol={selectedSymbol} />
            </div>
            <div className="xl:col-span-1 space-y-8">
              <div className="glass-card rounded-3xl p-6 card-hover">
                <ChangeChart />
              </div>
              <div className="glass-card rounded-3xl p-6 card-hover">
                <FearGreedChart />
              </div>
            </div>
          </div>
        </section>

        {/* Economic Data Section */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Economic Indicators
              <span className="block text-lg font-normal text-gray-400 mt-2">Macro-economic health metrics</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
            <div className="glass-card rounded-3xl p-6 card-hover">
              <InterestRatesChart />
            </div>
            <div className="glass-card rounded-3xl p-6 card-hover">
              <ConsumerDataChart />
            </div>
            <div className="glass-card rounded-3xl p-6 card-hover">
              <RetailSalesChart />
            </div>
            <div className="glass-card rounded-3xl p-6 card-hover">
              <MoMYoYChart />
            </div>
            <div className="glass-card rounded-3xl p-6 card-hover">
              <UnemploymentChart />
            </div>
          </div>
        </section>

        {/* Push Data Section */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-white">
              Data Streams
              <span className="block text-lg font-normal text-gray-400 mt-2">Real-time market data feeds</span>
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-3xl p-8 card-hover">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                    Latest Push Data
                  </h3>
                  <p className="text-gray-400 text-sm">Real-time data streams</p>
                </div>
              </div>
              <PushData />
            </div>
          </div>
        </section>


      </main>
      

      {/* Floating Chat Button */}
      <FloatingChatButton 
        onClick={() => setIsChatOpen(!isChatOpen)}
        isOpen={isChatOpen}
      />

      {/* Chatbot Component */}
      <ChatBot 
        isOpen={isChatOpen} 
        onToggle={() => setIsChatOpen(!isChatOpen)} 
      />
    </div>
  );
}
