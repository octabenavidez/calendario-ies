/**
 * Service to fetch data from Google Sheets
 */

const GOOGLE_SHEET_ID =
  "2PACX-1vTzGJ8fZJ0jl7ivdqAYZk2YmAaOBqmjm7rA932tMkES-xqONk7vqLJXnlDjYIICAbm8A2orUW-zuhGK";

/**
 * Parse CSV string to array of objects
 * Handles quoted fields with commas inside
 * @param {string} csvText - CSV text content
 * @returns {Array<Object>} Array of objects with keys from header row
 */
const parseCSV = (csvText) => {
  const lines = csvText.split("\n").filter((line) => line.trim() !== "");
  if (lines.length === 0) return [];

  // Function to parse CSV line handling quoted fields
  const parseCSVLine = (line) => {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    // Add last field
    result.push(current.trim());
    return result;
  };

  // Parse header row
  const headerLine = parseCSVLine(lines[0]);
  const headers = headerLine.map((h) => h.replace(/^"|"$/g, ""));

  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((header, index) => {
      let value = values[index] || "";
      // Remove surrounding quotes
      value = value.replace(/^"|"$/g, "");
      row[header] = value;
    });
    data.push(row);
  }

  return data;
};

/**
 * Convert Google Sheet row to event format
 * @param {Object} row - Row from Google Sheet
 * @returns {Object|null} Event object or null if invalid
 */
const convertRowToEvent = (row) => {
  // Expected columns: fecha, titulo, tipo, materia, descripcion
  // Handle different possible column names (case insensitive)
  const getValue = (row, possibleKeys) => {
    for (const key of possibleKeys) {
      const foundKey = Object.keys(row).find(
        (k) => k.toLowerCase().trim() === key.toLowerCase().trim()
      );
      if (foundKey && row[foundKey]) {
        return row[foundKey].trim();
      }
    }
    return "";
  };


  const date = getValue(row, ["date", "fecha", "fecha evento"]);
  const title = getValue(row, ["title", "titulo", "título", "nombre"]);
  const type = getValue(row, ["type", "tipo", "tipo evento"]);
  const subject = getValue(row, ["subject", "materia", "asignatura"]);
  const description = getValue(row, [
    "description",
    "descripcion",
    "descripción",
    "detalle",
  ]);

  // Validate required fields
  if (!date || !title || !type) {
    return null;
  }

  // Normalize date format (handle different formats)
  let normalizedDate = date;
  try {
    // Try different date formats
    // Format 1: YYYY-MM-DD (ISO format)
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      normalizedDate = date;
    }
    // Format 2: DD/MM/YYYY or DD-MM-YYYY
    else if (/^\d{1,2}[-\/]\d{1,2}[-\/]\d{4}$/.test(date)) {
      const parts = date.split(/[-\/]/);
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      normalizedDate = `${year}-${month}-${day}`;
    }
    // Format 3: Try JavaScript Date parsing
    else {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        normalizedDate = `${year}-${month}-${day}`;
      } else {
        return null; // Invalid date
      }
    }

    // Validate the normalized date
    const dateObj = new Date(normalizedDate);
    if (isNaN(dateObj.getTime())) {
      return null;
    }
  } catch (e) {
    return null;
  }

  // Normalize type (lowercase, remove accents)
  const normalizedType = type
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  return {
    date: normalizedDate,
    title: title,
    type: normalizedType,
    subject: subject || "",
    description: description || "",
  };
};

/**
 * Fetch events from Google Sheet
 * @returns {Promise<Array>} Array of event objects
 */
export const fetchEventsFromGoogleSheet = async () => {
  try {
    // For published sheets (pubhtml), use the pub endpoint with CSV output
    // Try multiple URL formats to ensure compatibility
    const urlFormats = [
      `https://docs.google.com/spreadsheets/d/e/${GOOGLE_SHEET_ID}/pub?output=csv`,
      `https://docs.google.com/spreadsheets/d/e/${GOOGLE_SHEET_ID}/pub?gid=0&single=true&output=csv`,
      `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv&gid=0`,
    ];

    let csvText = null;
    let lastError = null;
    let successfulUrl = null;

    // Try each URL format until one works
    for (const csvUrl of urlFormats) {
      try {
        // Add timestamp to URL to prevent caching
        const timestamp = new Date().getTime();
        const urlWithCacheBuster = `${csvUrl}${
          csvUrl.includes("?") ? "&" : "?"
        }_t=${timestamp}`;

        const response = await fetch(urlWithCacheBuster, {
          cache: "no-store", // Prevent caching
          // No custom headers to avoid CORS issues
          // The timestamp in URL already prevents caching
        });

        if (response.ok) {
          // Try to get text with proper encoding
          const blob = await response.blob();
          csvText = await blob.text();

          // Check if we got valid CSV (not HTML error page)
          if (
            csvText &&
            !csvText.includes("<!DOCTYPE") &&
            csvText.trim().length > 0
          ) {
            // Check if it looks like CSV (has commas and newlines)
            if (csvText.includes(",") && csvText.includes("\n")) {
              successfulUrl = csvUrl;
              break; // Success!
            }
          }
        }
      } catch (err) {
        lastError = err;
        continue; // Try next URL format
      }
    }

    if (!csvText) {
      throw new Error(
        lastError?.message ||
          "No se pudo acceder al Google Sheet. Verifica que esté publicado públicamente."
      );
    }

    const rows = parseCSV(csvText);

    if (rows.length === 0) {
      throw new Error("El Google Sheet está vacío o no tiene datos válidos.");
    }

    // Convert rows to events
    const events = rows
      .map((row) => convertRowToEvent(row))
      .filter((event) => event !== null); // Remove invalid events

    if (events.length === 0) {
      throw new Error(
        "No se encontraron eventos válidos en el Google Sheet. Verifica el formato de los datos."
      );
    }

    return events;
  } catch (error) {
    throw error;
  }
};
