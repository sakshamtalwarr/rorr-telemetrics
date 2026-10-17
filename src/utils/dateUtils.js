/**
 * Date & Time Utilities for Oben Rorr Telemetrics
 * Accurately handles UTC timestamps from Oben Cloud Backend & translates to IST (Asia/Kolkata).
 */

/**
 * Parses raw dates from Oben Cloud or local telemetrics.
 * Oben's backend stores timestamps in UTC format like "YYYY-MM-DD HH:mm:ss.SSS" without the 'Z'.
 * If passed to standard new Date(), browsers assume local timezone (or fail on Safari),
 * causing massive hour drift and filtering errors.
 */
export function parseObenDate(raw) {
  if (!raw) return new Date();
  if (raw instanceof Date) return raw;
  if (typeof raw === "number") return new Date(raw);
  
  const s = String(raw).trim();
  if (!s) return new Date();

  // Pattern "YYYY-MM-DD HH:mm:ss.SSS" or "YYYY-MM-DD HH:mm:ss"
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/.test(s)) {
    return new Date(s.replace(" ", "T") + "Z");
  }

  // Already ISO with Z or timezone offset
  if (s.includes("Z") || (s.includes("T") && /[+-]\d{2}:\d{2}$/.test(s))) {
    return new Date(s);
  }

  // Fallback ISO
  if (s.includes("T")) {
    return new Date(s + "Z");
  }

  const parsed = new Date(s);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Formats time in Indian Standard Time (12-hour AM/PM format, e.g. "09:48 pm")
 */
export function formatISTTime(raw, options = {}) {
  const d = parseObenDate(raw);
  if (Number.isNaN(d.getTime())) return "--:--";

  return d.toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    ...options,
  }).toLowerCase();
}

/**
 * Formats date in Indian Standard Time (e.g. "Wed, Sep 30, 2026" or "30 Sep 2026")
 */
export function formatISTDate(raw, options = {}) {
  const d = parseObenDate(raw);
  if (Number.isNaN(d.getTime())) return "Unknown Date";

  return d.toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

/**
 * Returns YYYY-MM-DD string according to Indian Standard Time (for grouping & day-wise keys)
 */
export function getISTDateKey(raw) {
  const d = parseObenDate(raw);
  if (Number.isNaN(d.getTime())) return "unknown";

  return d.toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Formats duration in hours & minutes (e.g. "01 hrs 20 mins" or "18 mins")
 */
export function formatDuration(minutes) {
  const mins = Math.max(0, Math.round(Number(minutes) || 0));
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${String(hrs).padStart(2, "0")} hrs ${String(remMins).padStart(2, "0")} mins`;
  }
  return `${mins} mins`;
}
