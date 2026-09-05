/* CelebrationVerse client-side security hardening.
 * IMPORTANT: this is defense-in-depth for a static site. It is NOT a replacement
 * for server-side authentication, authorization, rate limiting, or WAF controls.
 */
(() => {
  'use strict';

  const LIMITS = Object.freeze({
    name: 80,
    sender: 120,
    message: 4000,
    wish: 1000,
    importBytes: 512 * 1024,
    mediaBytes: 8 * 1024 * 1024,
    maxMedia: 12,
    maxWishes: 8
  });

  const ALLOWED_MEDIA = new Set([
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/ogg'
  ]);

  const RATE_LIMITS = Object.freeze({
    import: { windowMs: 60_000, max: 5 },
    share: { windowMs: 60_000, max: 10 },
    media: { windowMs: 60_000, max: 12 }
  });

  const buckets = new Map();

  function cleanText(value, max) {
    return String(value ?? '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim()
      .slice(0, max);
  }

  function isAllowedProtocol(value) {
    try {
      const url = new URL(String(value), window.location.href);
      return ['https:', 'http:', 'data:', 'blob:'].includes(url.protocol);
    } catch {
      return false;
    }
  }

  function allowRate(name) {
    const cfg = RATE_LIMITS[name];
    if (!cfg) return true;
    const now = Date.now();
    const existing = buckets.get(name) || [];
    const recent = existing.filter(t => now - t < cfg.windowMs);
    if (recent.length >= cfg.max) return false;
    recent.push(now);
    buckets.set(name, recent);
    return true;
  }

  function safeJsonParse(text) {
    if (typeof text !== 'string' || text.length > LIMITS.importBytes) {
      throw new Error('Import is too large.');
    }
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Invalid celebration format.');
    }
    return parsed;
  }

  function validateCelebration(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new Error('Invalid celebration data.');
    }

    const output = {
      event: cleanText(input.event, 40),
      recipient: cleanText(input.recipient, LIMITS.name),
      sender: cleanText(input.sender, LIMITS.sender),
      message: cleanText(input.message, LIMITS.message),
      date: input.date == null ? null : cleanText(input.date, 40),
      quoteStyle: cleanText(input.quoteStyle, 20),
      pace: cleanText(input.pace, 20),
      wishes: [],
      media: []
    };

    if (Array.isArray(input.wishes)) {
      output.wishes = input.wishes
        .slice(0, LIMITS.maxWishes)
        .map(w => cleanText(w, LIMITS.wish))
        .filter(Boolean);
    }

    if (Array.isArray(input.media)) {
      output.media = input.media.slice(0, LIMITS.maxMedia).map(item => {
        if (!item || typeof item !== 'object') throw new Error('Invalid media entry.');
        const type = cleanText(item.type, 80).toLowerCase();
        const data = String(item.data ?? '');
        const name = cleanText(item.name, 120);
        if (!ALLOWED_MEDIA.has(type)) throw new Error('Unsupported media type.');
        if (data.length > LIMITS.mediaBytes * 1.4) throw new Error('Media entry is too large.');
        if (!isAllowedProtocol(data)) throw new Error('Unsafe media URL.');
        return { type, data, name };
      });
    }

    return output;
  }

  function safeStorageGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function safeStorageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  // Public, namespaced API for the existing single-page app.
  window.CelebrationSecurity = Object.freeze({
    LIMITS,
    cleanText,
    isAllowedProtocol,
    allowRate,
    safeJsonParse,
    validateCelebration,
    safeStorageGet,
    safeStorageSet
  });
})();
