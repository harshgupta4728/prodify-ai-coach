// Calendar days in the user's own timezone (the browser sends it as X-Timezone),
// so "today", streaks and the daily problem roll over at the user's midnight.

const formatters = new Map();
const formatterFor = (timeZone) => {
  if (!formatters.has(timeZone)) {
    formatters.set(timeZone, new Intl.DateTimeFormat('en-US', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit'
    }));
  }
  return formatters.get(timeZone);
};

const isValidTimeZone = (timeZone) => {
  try {
    formatterFor(timeZone);
    return true;
  } catch {
    return false;
  }
};

const timeZoneOf = (req) => {
  const timeZone = req.get('X-Timezone');
  return typeof timeZone === 'string' && timeZone.length <= 64 && isValidTimeZone(timeZone) ? timeZone : 'UTC';
};

// "2026-10-17" for the given moment in the given timezone
const dayKey = (date, timeZone) => {
  const parts = {};
  for (const part of formatterFor(timeZone).formatToParts(date)) parts[part.type] = part.value;
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const shiftDay = (key, days) => {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

// Consecutive days in the set ending today, or yesterday if nothing happened yet today
// (a streak stays alive until a whole day is missed)
const countStreak = (days, today) => {
  let day = days.has(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (days.has(day)) {
    streak += 1;
    day = shiftDay(day, -1);
  }
  return streak;
};

// Day of the year (1-366) for a "YYYY-MM-DD" key
const dayOfYear = (key) => {
  const date = new Date(`${key}T00:00:00Z`);
  return Math.floor((date - Date.UTC(date.getUTCFullYear(), 0, 0)) / (24 * 60 * 60 * 1000));
};

module.exports = { timeZoneOf, dayKey, shiftDay, countStreak, dayOfYear };
