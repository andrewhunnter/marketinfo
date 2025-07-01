'use client';

import { useEffect, useState } from 'react';

interface EconomicEvent {
  [key: string]: any;
}

export default function EconomicCalendar() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:5001/api/calendar/economic')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          // Handle both array and object responses
          const eventsData = Array.isArray(data) ? data : data.events || [data];
          setEvents(eventsData.slice(0, 12)); // Show more events for better fill
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
      <div className="space-y-3 h-full">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm h-full flex items-center justify-center">
        <div className="text-center">
          <p className="font-medium">Error loading calendar</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-gray-400 text-sm h-full flex items-center justify-center">
        No economic events available
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getImpactColor = (impact: string) => {
    const impactLower = impact?.toLowerCase() || '';
    if (impactLower.includes('high')) return 'text-red-300 bg-red-500/20 border-red-500/30';
    if (impactLower.includes('medium')) return 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30';
    if (impactLower.includes('low')) return 'text-green-300 bg-green-500/20 border-green-500/30';
    return 'text-gray-300 bg-gray-500/20 border-gray-500/30';
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <p className="text-sm text-gray-400">
          {events.length} upcoming events
        </p>
        <div className="text-xs text-gray-500">↕ Scroll to see more</div>
      </div>
      
      {/* Vertical scrollable container - fills remaining space */}
      <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 min-h-0">
        {events.map((event, index) => {
          // Try to extract common fields, handling various possible field names
          const title = event.title || event.event || event.name || event.description || 'Economic Event';
          const date = event.date || event.time || event.datetime || event.timestamp;
          const impact = event.impact || event.importance || event.priority || '';
          const country = event.country || event.region || '';
          const actual = event.actual || event.actualValue || '';
          const forecast = event.forecast || event.forecastValue || event.expected || '';
          const link = event.link || event.url || '';
          const notes = event.notes || event.description || '';

          return (
            <div key={index} className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-gray-600/30 hover:border-green-500/50 hover:bg-black/40 transition-all duration-200 flex-shrink-0">
              {/* Header with impact and date */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  {date && (
                    <p className="text-xs text-orange-300 font-medium mb-1">
                      {formatDate(date)}
                    </p>
                  )}
                  {country && (
                    <p className="text-xs text-purple-300 font-medium">
                      {country}
                    </p>
                  )}
                </div>
                {impact && (
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getImpactColor(impact)}`}>
                    {impact}
                  </span>
                )}
              </div>

              {/* Event title with optional link */}
              {link ? (
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-sm text-blue-300 hover:text-blue-200 mb-2 leading-tight block underline decoration-blue-400/50 hover:decoration-blue-300 transition-colors duration-200"
                  title={`Click to view: ${title}`}
                >
                  {title} 🔗
                </a>
              ) : (
                <h4 className="font-medium text-sm text-gray-100 mb-2 leading-tight">
                  {title}
                </h4>
              )}

              {/* Data values in a compact layout */}
              {(actual || forecast) && (
                <div className="space-y-1 mb-2">
                  {actual && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-pink-300 font-medium">Actual:</span>
                      <span className="text-xs text-gray-200">{actual}</span>
                    </div>
                  )}
                  {forecast && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-indigo-300 font-medium">Forecast:</span>
                      <span className="text-xs text-gray-200">{forecast}</span>
                    </div>
                  )}
                </div>
              )}

              {/* URL display */}
              {link && (
                <div className="mt-2 pt-2 border-t border-gray-600/30">
                  <p className="text-xs text-gray-400 break-all">
                    {link}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {events.length === 0 && (
        <div className="text-center text-gray-400 py-8 flex-shrink-0">
          <p>No economic events found</p>
        </div>
      )}
    </div>
  );
} 