'use client';

import { useEffect, useState } from 'react';

interface EconomicEvent {
  date: string;
  release_id: number;
  name: string;
  press_release: boolean;
  link: string;
  notes: string;
}

interface EconomicCalendarData {
  updated_at: string;
  events_count: number;
  new_events_count: number;
  cached_events_count: number;
  events: EconomicEvent[];
}

type SortOrder = 'newest' | 'oldest';

export default function EconomicCalendar() {
  const [calendarData, setCalendarData] = useState<EconomicCalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  useEffect(() => {
    fetch('http://localhost:5001/api/calendar/economic')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setCalendarData(data);
        }
      })
      .catch(err => {
        setError('Failed to fetch calendar data');
        console.error('Error fetching calendar:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-red-400 text-center">
          <p className="font-medium">Error loading calendar</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!calendarData || !calendarData.events || calendarData.events.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <p className="text-gray-400">No economic events available</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const parseLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Sort events based on selected order
  const sortedEvents = [...calendarData.events].sort((a, b) => {
    const dateA = parseLocalDate(a.date).getTime();
    const dateB = parseLocalDate(b.date).getTime();
    
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const getDateColor = (dateString: string) => {
    try {
      const eventDate = parseLocalDate(dateString);
      const today = new Date();
      
      eventDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'text-gray-400';
      if (diffDays === 0) return 'text-yellow-400';
      if (diffDays <= 7) return 'text-blue-400';
      return 'text-gray-300';
    } catch {
      return 'text-gray-400';
    }
  };

  const handleSortChange = (newSortOrder: SortOrder) => {
    console.log('handleSortChange called with:', newSortOrder);
    console.log('Current sortOrder:', sortOrder);
    setSortOrder(newSortOrder);
    console.log('setSortOrder called');
  };

  return (
    <div className="space-y-4" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 20 }}>
        <div>
          <h3 className="text-lg font-semibold text-white">Economic Calendar</h3>
          <p className="text-xs text-gray-400">{calendarData.events_count} releases</p>
        </div>
        
        {/* Sort Tags */}
        <div className="flex items-center space-x-2 relative z-50">
          <button
            type="button"
            onMouseDown={(e) => {
              console.log('Mouse down on newest button');
              e.preventDefault();
            }}
            onMouseUp={(e) => {
              console.log('Mouse up on newest button');
              e.preventDefault();
            }}
            onClick={(e) => {
              console.log('NEWEST BUTTON CLICKED - This should appear!');
              e.preventDefault();
              e.stopPropagation();
              handleSortChange('newest');
            }}
            style={{
              pointerEvents: 'auto',
              zIndex: 1000,
              position: 'relative'
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer select-none relative z-50 ${
              sortOrder === 'newest'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'bg-gray-700/50 text-gray-400 border border-gray-600/30 hover:bg-gray-600/50 hover:text-gray-300'
            }`}
          >
            Most Recent
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              console.log('Mouse down on oldest button');
              e.preventDefault();
            }}
            onMouseUp={(e) => {
              console.log('Mouse up on oldest button');
              e.preventDefault();
            }}
            onClick={(e) => {
              console.log('OLDEST BUTTON CLICKED - This should appear!');
              e.preventDefault();
              e.stopPropagation();
              handleSortChange('oldest');
            }}
            style={{
              pointerEvents: 'auto',
              zIndex: 1000,
              position: 'relative'
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer select-none relative z-50 ${
              sortOrder === 'oldest'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'bg-gray-700/50 text-gray-400 border border-gray-600/30 hover:bg-gray-600/50 hover:text-gray-300'
            }`}
          >
            Oldest First
          </button>
        </div>
      </div>

      {/* Scrollable Calendar Container */}
      <div className="h-96 relative">
        <div 
          className="h-full overflow-y-auto bg-black/20 rounded-lg border border-gray-700/50 custom-scrollbar"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#4b5563 #1f2937'
          }}
        >
          <div className="p-4 space-y-2">
            {sortedEvents.map((event, index) => (
              <div 
                key={`${event.release_id}-${index}`} 
                className="group bg-gray-800/30 hover:bg-gray-700/40 rounded-lg p-3 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200"
              >
                {/* Main Content Row */}
                <div className="flex items-center justify-between">
                  {/* Left: Date and Name */}
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`text-xs font-medium ${getDateColor(event.date)} bg-gray-700/50 px-2 py-1 rounded flex-shrink-0`}>
                      {formatDate(event.date)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {event.link ? (
                        <a 
                          href={event.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-300 hover:text-blue-200 underline decoration-blue-400/50 hover:decoration-blue-300 transition-colors truncate block"
                          title={event.name}
                        >
                          {event.name}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-200 truncate" title={event.name}>
                          {event.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Indicators */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {event.press_release && (
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30">
                        Press
                      </span>
                    )}
                    {event.link && (
                      <span className="text-gray-400 group-hover:text-gray-300">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>

                {/* Expandable Notes (if present) */}
                {event.notes && (
                  <details className="mt-2 group/details">
                    <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-300 flex items-center space-x-1 select-none">
                      <span className="group-open/details:rotate-90 transition-transform">▶</span>
                      <span>Details</span>
                    </summary>
                    <div className="mt-2 text-xs text-gray-400 leading-relaxed pl-4 max-h-20 overflow-y-auto custom-scrollbar">
                      {event.notes}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-3">
          <span>📅 {calendarData.events_count} total</span>
          {calendarData.new_events_count > 0 && (
            <span className="text-green-400">✨ {calendarData.new_events_count} new</span>
          )}
        </div>
        <div className="text-gray-500">
          Updated: {new Date(calendarData.updated_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
} 