'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, PaperAirplaneIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatBot({ isOpen, onToggle }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: "👋 Welcome to MarketInfo AI! I'm here to help you analyze market data, trends, and answer questions about your portfolio. What would you like to know?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting to the analysis service right now. Please make sure the backend is running and try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-[420px] h-[600px] z-50 animate-slide-up">
      <div className="relative h-full">
        {/* Terminal glow effect */}
        <div className="absolute inset-0 terminal-glow rounded-lg"></div>
        
        {/* Main chat container */}
        <div className="relative h-full terminal-window terminal-text overflow-hidden">
          {/* Header */}
          <div className="terminal-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 terminal-border rounded flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4 terminal-command" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 terminal-prompt rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-sm font-bold terminal-command">
                    marketinfo-ai@terminal
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs terminal-prompt">●</span>
                    <span className="text-xs terminal-output">ready</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="terminal-border-focus p-1 rounded transition-all duration-200"
              >
                <XMarkIcon className="w-4 h-4 terminal-command" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="terminal-content terminal-scrollbar overflow-y-auto space-y-3 h-[calc(100%-120px)]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className="flex items-start space-x-2 max-w-[85%]">
                  {!message.isUser && (
                    <div className="w-6 h-6 terminal-border rounded flex items-center justify-center flex-shrink-0 mt-1">
                      <SparklesIcon className="w-3 h-3 terminal-command" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded terminal-border ${
                      message.isUser
                        ? 'terminal-bg-light terminal-command ml-auto'
                        : 'terminal-bg terminal-output'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 opacity-60`}>
                      [{message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}]
                    </p>
                  </div>
                  {message.isUser && (
                    <div className="w-6 h-6 terminal-border rounded flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 terminal-prompt" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 terminal-border rounded flex items-center justify-center flex-shrink-0">
                    <SparklesIcon className="w-3 h-3 terminal-command" />
                  </div>
                  <div className="terminal-bg terminal-border p-3 rounded">
                    <div className="flex items-center space-x-1">
                      <span className="terminal-cursor text-sm">thinking</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="absolute bottom-0 left-0 right-0 terminal-bg terminal-border-focus p-4">
            <div className="flex items-center space-x-2">
              <span className="terminal-prompt text-sm">$</span>
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="query market data..."
                  className="w-full terminal-bg terminal-border rounded px-3 py-2 terminal-text placeholder-gray-500 focus:outline-none focus:terminal-border-focus text-sm transition-all duration-200"
                  disabled={isTyping}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="terminal-border terminal-glow-hover p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
              >
                <PaperAirplaneIcon className="w-4 h-4 terminal-command" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 