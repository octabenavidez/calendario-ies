import { useState } from "react";
import { format } from "date-fns";
import es from "date-fns/locale/es";
import { Tooltip } from "@/shared-components/molecules/Tooltip";
import { Modal } from "@/shared-components/molecules/Modal";

/**
 * Calendar day cell component
 * @param {Object} props
 * @param {Date} props.date - Day date
 * @param {boolean} props.isCurrentMonth - Whether it belongs to current month
 * @param {boolean} props.isToday - Whether it's today
 * @param {Array} props.events - Day events
 */
export const DayCell = ({ date, isCurrentMonth, isToday, events = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dayNumber = format(date, "d");
  const hasEvents = events.length > 0;

  // Normalize event type (remove accents, lowercase) for comparison
  const normalizeType = (type) => {
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
      case "evaluación": // Support both with and without accent
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
      case "evaluación": // Support both with and without accent
        return "Evaluación";
      case "tp":
        return "TP";
      case "tarea":
        return "Tarea";
      default:
        return eventType;
    }
  };

  // Handle cell click
  const handleCellClick = () => {
    if (hasEvents) {
      setIsModalOpen(true);
    }
  };

  // Build tooltip content
  const tooltipContent = events.length > 0 && (
    <div className="space-y-1">
      {events.map((event, index) => (
        <div key={index}>
          <div className="font-semibold text-gray-100">{event.title}</div>
          <div className="text-xs opacity-80 text-gray-300">
            {formatEventType(event.type)} •{" "}
            {format(date, "d 'de' MMMM, yyyy", { locale: es })}
          </div>
        </div>
      ))}
    </div>
  );

  const cellClasses = `
    relative min-h-[60px] sm:min-h-[80px] p-1.5 sm:p-2 border border-gray-700 rounded-lg
    transition-all duration-200 ease-in-out
    ${isCurrentMonth ? "bg-gray-800" : "bg-gray-900/50 text-gray-500"}
    ${isToday ? "ring-2 ring-blue-400 ring-offset-1 sm:ring-offset-2 ring-offset-gray-800 bg-blue-900/30" : ""}
    ${
      hasEvents
        ? "hover:shadow-lg hover:shadow-gray-900/50 hover:scale-105 cursor-pointer active:scale-95"
        : "hover:shadow-md hover:shadow-gray-900/30"
    }
  `;

  return (
    <>
      <Tooltip content={tooltipContent} position="top">
        <div className={cellClasses} onClick={handleCellClick}>
          <div
            className={`text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1 ${
              isToday ? "text-blue-400" : "text-gray-200"
            }`}
          >
            {dayNumber}
          </div>
          <div className="flex flex-wrap gap-0.5 sm:gap-1">
            {events.map((event, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getEventColor(event.type)}`}
                title={`${event.title} - ${formatEventType(event.type)}`}
              />
            ))}
          </div>
          {hasEvents && (
            <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-gray-400 leading-tight">
              {events.length} {events.length === 1 ? "evento" : "eventos"}
            </div>
          )}
        </div>
      </Tooltip>

      {/* Modal with event details */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Eventos del ${format(date, "d 'de' MMMM, yyyy", {
          locale: es,
        })}`}
      >
        <div className="space-y-3 sm:space-y-4">
          {events.map((event, index) => (
            <div
              key={index}
              className="p-3 sm:p-4 border border-gray-700 rounded-lg hover:shadow-md hover:shadow-gray-900/50 bg-gray-800 transition-shadow"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                {/* Color indicator */}
                <div
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mt-1 flex-shrink-0 ${getEventColor(
                    event.type
                  )}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <span className="text-xs sm:text-sm font-semibold text-gray-300 px-2 py-1 bg-gray-700 rounded self-start">
                      {formatEventType(event.type)}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-gray-100 break-words">
                      {event.title}
                    </h3>
                  </div>
                  {event.subject && (
                    <div className="mb-2">
                      <span className="text-xs sm:text-sm font-semibold text-gray-400">
                        Materia:
                      </span>
                      <span className="ml-2 text-xs sm:text-sm text-gray-200 break-words">
                        {event.subject}
                      </span>
                    </div>
                  )}
                  {event.description && (
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-400">
                        Descripción:
                      </span>
                      <p className="mt-1 text-xs sm:text-sm text-gray-300 break-words">
                        {event.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};
