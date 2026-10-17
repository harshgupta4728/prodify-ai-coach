// Small input helpers for the routes. Anything in req.body can be any JSON type,
// so check types before calling string methods on it.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const isEmail = (value) => typeof value === 'string' && value.length <= 254 && EMAIL_PATTERN.test(value);

const isNonEmptyString = (value, maxLength) =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;

// Saved links are rendered as <a href>, so anything other than http(s) (javascript:, data:) is refused
const isHttpUrl = (value) => {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

// Name of the first string field longer than its limit, or undefined
const firstTooLong = (fields, limits) =>
  Object.keys(limits).find((key) => typeof fields[key] === 'string' && fields[key].length > limits[key]);

// Copies only the listed fields, so clients can't set things like userId or role
const pick = (source, keys) => {
  const result = {};
  for (const key of keys) {
    if (source[key] !== undefined) result[key] = source[key];
  }
  return result;
};

const toBoundedInt = (value, { min, max, fallback }) => {
  const number = parseInt(value, 10);
  if (Number.isNaN(number)) return fallback;
  return Math.min(Math.max(number, min), max);
};

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

module.exports = {
  normalizeEmail,
  isEmail,
  isNonEmptyString,
  isHttpUrl,
  firstTooLong,
  pick,
  toBoundedInt,
  escapeHtml,
};
