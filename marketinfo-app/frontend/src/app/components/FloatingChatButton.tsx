'use client';

import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface FloatingChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export default function FloatingChatButton({ onClick, isOpen }: FloatingChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-purple-500 to-amber-500 rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center group pulse-glow ${
        isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
      }`}
      aria-label="Open chat"
    >
      <div className="relative">
        <ChatBubbleLeftRightIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
        
        {/* Notification dot */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
        
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-amber-500 opacity-0 group-hover:opacity-20 scale-150 transition-all duration-300"></div>
      </div>
      
      {/* Floating particles around button */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-2 -left-2 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-75"></div>
        <div className="absolute -bottom-1 -right-3 w-1 h-1 bg-amber-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute -top-3 -right-1 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }}></div>
      </div>
    </button>
  );
} 