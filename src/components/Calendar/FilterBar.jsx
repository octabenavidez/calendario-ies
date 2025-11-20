/**
 * Filter bar component for filtering events by type and subject
 * @param {Object} props
 * @param {Array} props.subjects - Available subjects
 * @param {string} props.selectedType - Currently selected event type filter
 * @param {string} props.selectedSubject - Currently selected subject filter
 * @param {Function} props.onTypeChange - Handler for type filter change
 * @param {Function} props.onSubjectChange - Handler for subject filter change
 * @param {Function} props.onClearFilters - Handler to clear all filters
 */
export const FilterBar = ({
  subjects,
  selectedType,
  selectedSubject,
  onTypeChange,
  onSubjectChange,
  onClearFilters,
}) => {
  const eventTypes = [
    { value: "", label: "Todos", bgClass: "bg-gray-600" },
    { value: "evaluación", label: "Evaluación", bgClass: "bg-red-500" },
    { value: "tp", label: "TP", bgClass: "bg-blue-500" },
    { value: "tarea", label: "Tarea", bgClass: "bg-green-500" },
  ];

  const hasActiveFilters = selectedType || selectedSubject;

  return (
    <div className="w-full space-y-4">
      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Event type filter */}
        <div className="flex-1 w-full sm:w-auto">
          <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">
            Tipo de evento:
          </label>
          <div className="flex flex-wrap gap-2">
            {eventTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => onTypeChange(type.value)}
                className={`
                  px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all
                  ${
                    selectedType === type.value
                      ? `${type.bgClass} text-white shadow-md`
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-500"
                  }
                `}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject filter */}
        <div className="flex-1 w-full sm:w-auto">
          <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">
            Materia:
          </label>
          <select
            value={selectedSubject || ""}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-600 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-700 text-gray-200"
          >
            <option value="">Todas las materias</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear filters button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={onClearFilters}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-400 hover:text-gray-200 active:text-gray-100 underline transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};

