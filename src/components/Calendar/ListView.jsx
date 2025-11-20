import { useState, useMemo } from "react";
import { format, parse, isValid, isAfter, isToday, startOfDay } from "date-fns";
import es from "date-fns/locale/es";

/**
 * List view component for displaying upcoming events
 * @param {Object} props
 * @param {Array} props.events - Filtered events to display
 * @param {string} props.selectedType - Currently selected event type filter
 * @param {string} props.selectedSubject - Currently selected subject filter
 */
export const ListView = ({ events, selectedType, selectedSubject }) => {
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"

  // Normalize event type (remove accents, lowercase) for comparison
  const normalizeType = (type) => {
    if (!type) return "";
    return type
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  // Get color based on event type
  const getEventColor = (eventType) => {
    const normalized = normalizeType(eventType);
    switch (normalized) {
      case "evaluacion":
      case "evaluación":
        return "bg-red-500";
      case "tp":
        return "bg-blue-500";
      case "tarea":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // Format event type for display
  const formatEventType = (eventType) => {
    const normalized = normalizeType(eventType);
    switch (normalized) {
      case "evaluacion":
      case "evaluación":
        return "Evaluación";
      case "tp":
        return "TP";
      case "tarea":
        return "Tarea";
      default:
        return eventType;
    }
  };

  // Filter and sort events
  const processedEvents = useMemo(() => {
    const today = startOfDay(new Date());
    
    // Filter events: only future events (>= today)
    const futureEvents = events.filter((event) => {
      if (!event.date) return false;
      const eventDate = parse(event.date, "yyyy-MM-dd", new Date());
      if (!isValid(eventDate)) return false;
      
      const eventDay = startOfDay(eventDate);
      // Include today's events
      return isToday(eventDay) || isAfter(eventDay, today);
    });

    // Sort events by date
    const sorted = [...futureEvents].sort((a, b) => {
      const dateA = parse(a.date, "yyyy-MM-dd", new Date());
      const dateB = parse(b.date, "yyyy-MM-dd", new Date());
      
      if (sortOrder === "asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    return sorted;
  }, [events, sortOrder]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = parse(dateString, "yyyy-MM-dd", new Date());
    if (!isValid(date)) return dateString;
    
    const today = startOfDay(new Date());
    const eventDay = startOfDay(date);
    
    if (isToday(eventDay)) {
      return "Hoy";
    }
    
    // Check if it's tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (eventDay.getTime() === startOfDay(tomorrow).getTime()) {
      return "Mañana";
    }
    
    // Check if it's this week
    const daysDiff = Math.ceil((eventDay - today) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7 && daysDiff > 0) {
      return format(date, "EEEE 'día' d", { locale: es });
    }
    
    return format(date, "EEEE d 'de' MMMM, yyyy", { locale: es });
  };

  // Get relative date indicator
  const getRelativeDateInfo = (dateString) => {
    const date = parse(dateString, "yyyy-MM-dd", new Date());
    if (!isValid(date)) return null;
    
    const today = startOfDay(new Date());
    const eventDay = startOfDay(date);
    const daysDiff = Math.ceil((eventDay - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return null;
    if (daysDiff === 0) return { text: "Hoy", color: "text-blue-400" };
    if (daysDiff === 1) return { text: "Mañana", color: "text-yellow-400" };
    if (daysDiff <= 7) return { text: `En ${daysDiff} días`, color: "text-green-400" };
    return { text: `En ${daysDiff} días`, color: "text-gray-400" };
  };

  if (processedEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16">
        <div className="text-6xl sm:text-7xl mb-4">🎉</div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-200 mb-2 text-center">
          No hay eventos próximos
        </h3>
        <p className="text-sm sm:text-base text-gray-400 text-center max-w-md px-4">
          {selectedType || selectedSubject
            ? "Intenta ajustar los filtros para ver más eventos."
            : "No hay eventos programados a partir de hoy."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort controls */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-700">
        <div className="text-sm text-gray-400">
          {processedEvents.length}{" "}
          {processedEvents.length === 1 ? "evento próximo" : "eventos próximos"}
        </div>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          title={`Ordenar ${sortOrder === "asc" ? "descendente" : "ascendente"}`}
        >
          <svg
            className={`w-4 h-4 transition-transform ${
              sortOrder === "asc" ? "" : "rotate-180"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
          <span className="hidden sm:inline">
            {sortOrder === "asc" ? "Más próximos primero" : "Más lejanos primero"}
          </span>
          <span className="sm:hidden">Ordenar</span>
        </button>
      </div>

      {/* Events list */}
      <div className="space-y-3 sm:space-y-4">
        {processedEvents.map((event, index) => {
          const relativeInfo = getRelativeDateInfo(event.date);
          const isExpanded = expandedEvent === index;

          return (
            <div
              key={index}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-5 hover:shadow-lg hover:shadow-gray-900/50 transition-all cursor-pointer"
              onClick={() => setExpandedEvent(isExpanded ? null : index)}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Date column */}
                <div className="flex-shrink-0 text-center min-w-[70px] sm:min-w-[90px]">
                  <div className="text-xs sm:text-sm font-semibold text-gray-400 uppercase mb-1">
                    {format(parse(event.date, "yyyy-MM-dd", new Date()), "EEE", {
                      locale: es,
                    })}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-200">
                    {format(parse(event.date, "yyyy-MM-dd", new Date()), "d")}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {format(parse(event.date, "yyyy-MM-dd", new Date()), "MMM", {
                      locale: es,
                    })}
                  </div>
                  {relativeInfo && (
                    <div
                      className={`text-xs font-medium mt-2 ${relativeInfo.color}`}
                    >
                      {relativeInfo.text}
                    </div>
                  )}
                </div>

                {/* Event content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 sm:gap-3 mb-2">
                    {/* Type indicator */}
                    <div
                      className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 mt-1 ${getEventColor(
                        event.type
                      )}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs sm:text-sm font-semibold text-gray-300 px-2 py-0.5 bg-gray-700 rounded">
                          {formatEventType(event.type)}
                        </span>
                        {event.subject && (
                          <span className="text-xs sm:text-sm text-gray-400 truncate">
                            {event.subject}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-100 break-words mb-1">
                        {event.title}
                      </h3>
                      <div className="text-xs sm:text-sm text-gray-400">
                        {formatDate(event.date)}
                      </div>
                    </div>
                  </div>

                  {/* Description (expandable) */}
                  {event.description && (
                    <div
                      className={`mt-3 pt-3 border-t border-gray-700 transition-all ${
                        isExpanded ? "block" : "hidden"
                      }`}
                    >
                      <p className="text-sm text-gray-300 break-words">
                        {event.description}
                      </p>
                    </div>
                  )}

                  {/* Expand/collapse indicator */}
                  {event.description && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      <span>
                        {isExpanded ? "Ocultar" : "Ver"} descripción
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

