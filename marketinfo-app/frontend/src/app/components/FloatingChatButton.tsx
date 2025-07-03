'use client';

import { ChatBubbleLeftRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface FloatingChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export default function FloatingChatButton({ onClick, isOpen }: FloatingChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-40 w-12 h-12 terminal-window terminal-glow-hover transition-all duration-300 flex items-center justify-center group ${
        isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
      }`}
      aria-label="Open AI Chat Assistant"
    >
      <div className="relative">
        <div className="relative">
          <SparklesIcon className="w-5 h-5 terminal-command group-hover:scale-110 transition-transform duration-200" />
          
          {/* Terminal status indicator */}
          <div className="absolute -top-1 -right-1 w-2 h-2 terminal-prompt rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Hover tooltip */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="terminal-window terminal-text text-xs px-2 py-1 whitespace-nowrap">
          <span className="terminal-prompt">$</span> <span className="terminal-command">chat</span>
        </div>
      </div>
    </button>
  );
} 