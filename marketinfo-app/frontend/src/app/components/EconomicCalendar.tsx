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
          setEvents(eventsData.slice(0, 10)); // Limit to first 10 events
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
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
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
      <div className="text-red-400 text-sm">
        <p className="font-medium">Error loading calendar</p>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return <div className="text-gray-400 text-sm">No economic events available</div>;
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
    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
      {events.map((event, index) => {
        // Try to extract common fields, handling various possible field names
        const title = event.title || event.event || event.name || event.description || 'Economic Event';
        const date = event.date || event.time || event.datetime || event.timestamp;
        const impact = event.impact || event.importance || event.priority || '';
        const country = event.country || event.region || '';
        const actual = event.actual || event.actualValue || '';
        const forecast = event.forecast || event.forecastValue || event.expected || '';

        return (
          <div key={index} className="border-l-4 border-gradient-to-b from-orange-400 to-pink-400 bg-black/20 backdrop-blur-sm rounded-r-lg pl-4 py-3 hover:bg-black/30 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm text-gray-100 mb-2">{title}</h4>
                <div className="space-y-1">
                  {date && (
                    <p className="text-xs text-gray-300">
                      <span className="font-medium text-orange-300">Date:</span> {formatDate(date)}
                    </p>
                  )}
                  {country && (
                    <p className="text-xs text-gray-300">
                      <span className="font-medium text-purple-300">Country:</span> {country}
                    </p>
                  )}
                  {actual && (
                    <p className="text-xs text-gray-300">
                      <span className="font-medium text-pink-300">Actual:</span> {actual}
                    </p>
                  )}
                  {forecast && (
                    <p className="text-xs text-gray-300">
                      <span className="font-medium text-indigo-300">Forecast:</span> {forecast}
                    </p>
                  )}
                </div>
              </div>
              {impact && (
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getImpactColor(impact)}`}>
                  {impact}
                </span>
              )}
            </div>
          </div>
        );
      })}
      
      {events.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <p>No economic events found</p>
        </div>
      )}
    </div>
  );
} 