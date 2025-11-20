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
      console.log('🔄 Iniciando carga de eventos desde Google Sheet...');
      const fetchedEvents = await fetchEventsFromGoogleSheet();
      console.log('✅ Eventos cargados exitosamente:', fetchedEvents.length);
      console.log('📅 Eventos:', fetchedEvents);
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('❌ Error loading events from Google Sheet:', err);
      console.warn('⚠️ Using fallback static events');
      // Fallback to static events
      setEvents(academicEvents);
      setUsingFallback(true);
      setError(`No se pudo cargar desde Google Sheet: ${err.message}. Usando datos de respaldo.`);
    } finally {
      setLoading(false);
      console.log('✅ Carga completada');
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

