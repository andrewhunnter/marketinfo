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
      
      {/* Header */}
      <header className="relative z-10 glass backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-amber-500 rounded-2xl flex items-center justify-center pulse-glow">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-amber-400 to-pink-400 bg-clip-text text-transparent neon-text">
                  marketinfo
                </h1>
                <p className="text-gray-400 text-sm font-medium">personal dashboard for market analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-2 glass rounded-full px-4 py-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                </svg>
                <span className="text-xs text-gray-400">Updated now</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Hero Section */}
        <section className={`text-center transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Inline ChatGPT-style Interface */}
          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-3xl p-8 border border-purple-400/30">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
                    Ask About Your Data
                  </h3>
                  <p className="text-gray-400 text-sm">Get insights about market trends, crypto performance, and economic indicators</p>
                </div>
              </div>
              
              {/* Chat Messages Area */}
              <div className="mb-6 h-64 overflow-y-auto bg-black/20 rounded-2xl p-4 border border-white/10">
                <div className="space-y-4">
                  {/* Welcome Message */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364-.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="bg-gray-800/50 rounded-2xl px-4 py-3">
                      <p className="text-white text-sm">
                        Hi! Ask me anything about the market data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chat Input */}
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Ask about your market data..."
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300"
                    />
                  </div>
                  <button className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 rounded-2xl p-4 text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Economic Calendar & Market Overview Section - 3 Column Layout */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-white">
              Market Pulse
              <span className="block text-lg font-normal text-gray-400 mt-2">Key indicators at a glance</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  className="glass rounded-xl px-4 py-2 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm font-medium"
                >
                  {availableSymbols.map(symbol => (
                    <option key={symbol} value={symbol} className="bg-gray-900">{symbol}</option>
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
      

      {/* Chatbot Component */}
      <ChatBot 
        isOpen={isChatOpen} 
        onToggle={() => setIsChatOpen(!isChatOpen)} 
      />
    </div>
  );
}
