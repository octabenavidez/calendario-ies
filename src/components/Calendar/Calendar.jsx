import { useState, useMemo, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  parse,
  isSameMonth,
  isToday,
  isValid,
} from "date-fns";
import es from "date-fns/locale/es";
import { Calendar as CalendarIcon, List } from "lucide-react";
import { DayCell } from "./DayCell";
import { FilterBar } from "./FilterBar";
import { ListView } from "./ListView";
import { useGoogleSheetEvents } from "@/hooks/useGoogleSheetEvents";

/**
 * Main academic calendar component
 */
export const Calendar = () => {
  // Fetch events from Google Sheet (with fallback to static events)
  const {
    events: academicEvents,
    loading,
    error,
    usingFallback,
  } = useGoogleSheetEvents();

  // Initialize state from URL parameters
  const getInitialStateFromURL = () => {
    const params = new URLSearchParams(window.location.search);

    // Get month from URL (format: YYYY-MM)
    const monthParam = params.get("month");
    let initialDate = new Date();
    if (monthParam) {
      const parsedDate = parse(monthParam + "-01", "yyyy-MM-dd", new Date());
      if (isValid(parsedDate)) {
        initialDate = parsedDate;
      }
    }

    // Get filters from URL
    const typeParam = params.get("type") || "";
    const subjectParam = params.get("subject") || "";

    return {
      date: initialDate,
      type: typeParam,
      subject: subjectParam,
    };
  };

  const initialState = getInitialStateFromURL();
  const [currentDate, setCurrentDate] = useState(initialState.date);
  const [selectedType, setSelectedType] = useState(initialState.type);
  const [selectedSubject, setSelectedSubject] = useState(initialState.subject);
  const [linkCopied, setLinkCopied] = useState(false);
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" or "list"

  // Swipe detection for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchEndY, setTouchEndY] = useState(null);

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchEndY(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !touchStartY || !touchEndY) return;

    const distanceX = touchStart - touchEnd;
    const distanceY = Math.abs(touchStartY - touchEndY);

    // Only trigger swipe if horizontal movement is greater than vertical (to avoid conflicts with scroll)
    if (
      Math.abs(distanceX) > distanceY &&
      Math.abs(distanceX) > minSwipeDistance
    ) {
      const isLeftSwipe = distanceX > minSwipeDistance;
      const isRightSwipe = distanceX < -minSwipeDistance;

      if (isLeftSwipe) {
        goToNextMonth();
      }
      if (isRightSwipe) {
        goToPreviousMonth();
      }
    }

    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
    setTouchStartY(null);
    setTouchEndY(null);
  };

  // Get first and last day of the month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Get start and end of the week containing the first day of the month
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Generate all calendar days
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // Get unique subjects
  const subjects = useMemo(() => {
    const uniqueSubjects = [...new Set(academicEvents.map((e) => e.subject))];
    return uniqueSubjects.sort();
  }, [academicEvents]);


  // Auto-navigate to first event date if no URL param and events are loaded
  useEffect(() => {
    if (
      academicEvents.length > 0 &&
      !window.location.search.includes("month=")
    ) {
      // Find the earliest event date
      const eventDates = academicEvents
        .map((e) => e.date)
        .filter((d) => d)
        .sort();

      if (eventDates.length > 0) {
        const firstEventDate = parse(eventDates[0], "yyyy-MM-dd", new Date());
        if (isValid(firstEventDate)) {
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth();
          const eventYear = firstEventDate.getFullYear();
          const eventMonth = firstEventDate.getMonth();

          // Only change if we're not already showing a month with events
          const hasEventsInCurrentMonth = academicEvents.some((e) => {
            const eventDate = parse(e.date, "yyyy-MM-dd", new Date());
            return (
              isValid(eventDate) &&
              eventDate.getFullYear() === currentYear &&
              eventDate.getMonth() === currentMonth
            );
          });

          if (
            !hasEventsInCurrentMonth &&
            (currentYear !== eventYear || currentMonth !== eventMonth)
          ) {
            setCurrentDate(firstEventDate);
          }
        }
      }
    }
  }, [academicEvents, currentDate]);

  // Normalize event type (remove accents, lowercase) for comparison
  const normalizeType = (type) => {
    if (!type) return "";
    return type
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    const normalizedSelectedType = normalizeType(selectedType);
    return academicEvents.filter((event) => {
      const normalizedEventType = normalizeType(event.type);
      const matchesType =
        !selectedType || normalizedEventType === normalizedSelectedType;
      const matchesSubject =
        !selectedSubject || event.subject === selectedSubject;
      return matchesType && matchesSubject;
    });
  }, [academicEvents, selectedType, selectedSubject]);

  // Group filtered events by date
  const eventsByDate = useMemo(() => {
    const grouped = {};
    filteredEvents.forEach((event) => {
      const dateKey = event.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [filteredEvents]);

  // Get events for a specific day
  const getEventsForDay = (date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return eventsByDate[dateKey] || [];
  };

  // Update URL with current state
  const updateURL = (date, type, subject) => {
    const params = new URLSearchParams();

    // Add month (format: YYYY-MM)
    const monthStr = format(date, "yyyy-MM");
    params.set("month", monthStr);

    // Add filters only if they have values
    if (type) {
      params.set("type", type);
    }
    if (subject) {
      params.set("subject", subject);
    }

    // Update URL without reloading the page
    const newURL = `${window.location.pathname}${
      params.toString() ? "?" + params.toString() : ""
    }`;
    window.history.pushState({}, "", newURL);
  };

  // Sync state with URL whenever it changes (skip initial mount if URL already has params)
  useEffect(() => {
    // Skip if this is the initial mount and URL already has parameters
    const hasURLParams = window.location.search.length > 0;
    if (hasURLParams) {
      // Check if current state matches URL params (to avoid unnecessary updates)
      const params = new URLSearchParams(window.location.search);
      const urlMonth = params.get("month");
      const urlType = params.get("type") || "";
      const urlSubject = params.get("subject") || "";

      const currentMonth = format(currentDate, "yyyy-MM");
      if (
        urlMonth === currentMonth &&
        urlType === selectedType &&
        urlSubject === selectedSubject
      ) {
        return; // State matches URL, no need to update
      }
    }

    updateURL(currentDate, selectedType, selectedSubject);
  }, [currentDate, selectedType, selectedSubject]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const newState = getInitialStateFromURL();
      setCurrentDate(newState.date);
      setSelectedType(newState.type);
      setSelectedSubject(newState.subject);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Handle filter changes
  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
  };

  const handleClearFilters = () => {
    setSelectedType("");
    setSelectedSubject("");
  };

  // Copy current URL to clipboard
  const handleCopyLink = async () => {
    const currentURL = window.location.href;
    try {
      await navigator.clipboard.writeText(currentURL);
      setLinkCopied(true);
      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    } catch (err) {
      // Error al copiar enlace - silenciado en producción
    }
  };

  // Week day names
  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-3 sm:p-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-700">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            <p className="text-gray-300 text-lg">Cargando eventos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state (only show if not using fallback)
  if (error && !usingFallback) {
    return (
      <div className="max-w-6xl mx-auto p-3 sm:p-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-700 max-w-md">
          <div className="flex flex-col items-center gap-4">
            <svg
              className="w-16 h-16 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-100">
              Error al cargar eventos
            </h2>
            <p className="text-gray-400 text-center">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-6xl mx-auto p-3 sm:p-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6 border border-gray-700">
        {/* Warning banner if using fallback */}
        {usingFallback && (
          <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          {viewMode === "calendar" ? (
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-gray-700 active:bg-gray-600 transition-colors flex-shrink-0"
              aria-label="Mes anterior"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          ) : (
            <div className="w-10"></div>
          )}

          <div className="flex-1 flex flex-col items-center gap-2 px-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-100 text-center">
              {viewMode === "calendar"
                ? format(currentDate, "MMMM 'de' yyyy", { locale: es })
                : "Próximos Eventos"}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                  linkCopied
                    ? "text-green-400 bg-green-900/30"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-700 active:bg-gray-600"
                }`}
                title="Copiar enlace con filtros y mes actual"
              >
                {linkCopied ? (
                  <>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="hidden sm:inline">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Copiar enlace</span>
                  </>
                )}
              </button>
              {/* View mode toggle */}
              <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all flex items-center justify-center ${
                    viewMode === "calendar"
                      ? "bg-gray-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                  title="Vista calendario"
                >
                  <span className="hidden sm:inline">Calendario</span>
                  <CalendarIcon className="w-4 h-4 sm:hidden" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all flex items-center justify-center ${
                    viewMode === "list"
                      ? "bg-gray-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                  title="Vista lista"
                >
                  <span className="hidden sm:inline">Lista</span>
                  <List className="w-4 h-4 sm:hidden" />
                </button>
              </div>
            </div>
          </div>

          {viewMode === "calendar" ? (
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-gray-700 active:bg-gray-600 transition-colors flex-shrink-0"
              aria-label="Mes siguiente"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ) : (
            <div className="w-10"></div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-4 sm:mb-6 pb-4 border-b border-gray-700">
          <FilterBar
            subjects={subjects}
            selectedType={selectedType}
            selectedSubject={selectedSubject}
            onTypeChange={handleTypeChange}
            onSubjectChange={handleSubjectChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Event type legend */}
        {viewMode === "calendar" && (
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-700">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
              <span className="text-xs sm:text-sm text-gray-300">Evaluación</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs sm:text-sm text-gray-300">TP</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
              <span className="text-xs sm:text-sm text-gray-300">Tarea</span>
            </div>
          </div>
        )}

        {/* Calendar or List view */}
        {viewMode === "calendar" ? (
          /* Calendar grid */
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Day headers */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-400 py-1 sm:py-2 text-xs sm:text-sm"
              >
                {day}
              </div>
            ))}

            {/* Day cells */}
            {calendarDays.map((day, index) => (
              <DayCell
                key={index}
                date={day}
                isCurrentMonth={isSameMonth(day, currentDate)}
                isToday={isToday(day)}
                events={getEventsForDay(day)}
              />
            ))}
          </div>
        ) : (
          /* List view */
          <ListView
            events={filteredEvents}
            selectedType={selectedType}
            selectedSubject={selectedSubject}
          />
        )}
      </div>
    </div>
  );
};
