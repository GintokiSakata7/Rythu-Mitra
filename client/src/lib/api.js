const LOCAL_BASE = 'http://localhost:4000/api';
const RENDER_BASE = 'https://mandi-mitra-nbtv.onrender.com/api';

const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

// In HTTPS production (e.g. Vercel), cannot call http:// (mixed content).
// In local dev (http:), try LOCAL_BASE first or configured VITE_API_BASE_URL, with automatic Render fallback.
const configuredBase = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, '')
  : null;

let activeBase = isHttps
  ? (configuredBase?.startsWith('https') ? configuredBase : RENDER_BASE)
  : (configuredBase || LOCAL_BASE);

if (!activeBase.endsWith('/api')) activeBase = `${activeBase}/api`;

const fallbackBase = RENDER_BASE;

// Quick background probe in local dev: if localhost isn't running, switch to Render proactively
if (typeof window !== 'undefined' && !isHttps && activeBase.includes('localhost')) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 1200);
  fetch(`${activeBase.replace(/\/api$/, '')}/health`, { signal: ctrl.signal })
    .then(res => {
      clearTimeout(timer);
      if (!res.ok) {
        console.warn(`[RythuMitra API] Localhost health check failed (${res.status}), switching to Render backend`);
        activeBase = fallbackBase;
      }
    })
    .catch(() => {
      clearTimeout(timer);
      console.warn('[RythuMitra API] Localhost backend unreachable, switching to Render backend');
      activeBase = fallbackBase;
    });
}

export function getActiveBase() {
  return activeBase;
}

async function request(path, options = {}) {
  const currentBase = activeBase;
  const url = `${currentBase}${path}`;

  // Sensible default timeout so offline backend doesn't stall the UI
  const timeoutMs = options.timeout || 8000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const signal = options.signal || controller.signal;

  try {
    const response = await fetch(url, {
      ...options,
      signal,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    clearTimeout(timer);

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
    return data;
  } catch (err) {
    clearTimeout(timer);

    // If local request failed due to network error/timeout, retry with Render fallback
    const isNetworkError =
      err.name === 'AbortError' ||
      err.name === 'TypeError' ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('NetworkError');

    if (isNetworkError && currentBase !== fallbackBase && !isHttps) {
      console.warn(`[RythuMitra API] Request to ${currentBase}${path} failed (${err.message}). Retrying with Render backend (${fallbackBase})...`);
      activeBase = fallbackBase;

      const fallbackUrl = `${fallbackBase}${path}`;
      const fallbackResponse = await fetch(fallbackUrl, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
      });
      const data = await fallbackResponse.json().catch(() => ({}));
      if (!fallbackResponse.ok) throw new Error(data.error || `Request failed: ${fallbackResponse.status}`);
      return data;
    }

    throw err;
  }
}

export const api = {
  markets: () => request('/markets'),
  commodities: () => request('/markets/commodities'),
  recommend: (payload) => request('/recommendations', { method: 'POST', body: JSON.stringify(payload) }),
  buyers: (crop = '') => request(`/buyers/requirements${crop ? `?crop=${encodeURIComponent(crop)}` : ''}`),
  verifyBuyer: (payload) => request('/buyers/verify', { method: 'POST', body: JSON.stringify(payload) }),
  postBuyer: (payload) => request('/buyers/requirements', { method: 'POST', body: JSON.stringify(payload) }),
  parseHarvest: (text) => request('/ai/parse-harvest', { method: 'POST', body: JSON.stringify({ text }) }),
  health: () => request('/health'),
  candidates: (lat, lng, crop = 'Tomato', count = 5) => request(`/markets/candidates?lat=${lat}&lng=${lng}&crop=${encodeURIComponent(crop)}&count=${count}`),
  ttsUrl: (text, lang = 'te') => `${activeBase}/ai/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}`
};
