import { useState, useEffect } from 'react';
import { fetchEventsFromGoogleSheet } from '@/services/googleSheets';
import { academicEvents } from '@/data/events';

/**
 * Custom hook to fetch and manage events from Google Sheet
 * Falls back to static events if Google Sheet fails to load
 * @returns {Object} { events, loading, error, refetch }
 */
export const useGoogleSheetEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingFallback(false);
      const fetchedEvents = await fetchEventsFromGoogleSheet();
      setEvents(fetchedEvents);
    } catch (err) {
      // Fallback to static events
      setEvents(academicEvents);
      setUsingFallback(true);
      setError(`No se pudo cargar desde Google Sheet: ${err.message}. Usando datos de respaldo.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    usingFallback,
    refetch: fetchEvents,
  };
};

