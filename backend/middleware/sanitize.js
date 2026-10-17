// Drops keys that MongoDB would read as query operators or paths ($ne, $gt, "a.b"),
// plus prototype keys, from user input. Without this, a body like
// { "email": { "$ne": null } } would turn into a query that matches any user.
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const clean = (value) => {
  if (Array.isArray(value)) {
    value.forEach(clean);
  } else if (value !== null && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.') || BLOCKED_KEYS.has(key)) {
        delete value[key];
      } else {
        clean(value[key]);
      }
    }
  }
};

module.exports = (req, res, next) => {
  clean(req.body);
  clean(req.query);
  next();
};
