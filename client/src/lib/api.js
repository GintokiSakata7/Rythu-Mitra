const BASE = import.meta.env.VITE_API_BASE_URL || 'https://mandi-mitra-nbtv.onrender.com/api';

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
  return data;
}

export const api = {
  markets: () => request('/markets'),
  recommend: (payload) => request('/recommendations', { method: 'POST', body: JSON.stringify(payload) }),
  buyers: (crop = '') => request(`/buyers/requirements${crop ? `?crop=${encodeURIComponent(crop)}` : ''}`),
  verifyBuyer: (payload) => request('/buyers/verify', { method: 'POST', body: JSON.stringify(payload) }),
  postBuyer: (payload) => request('/buyers/requirements', { method: 'POST', body: JSON.stringify(payload) }),
  parseHarvest: (text) => request('/ai/parse-harvest', { method: 'POST', body: JSON.stringify({ text }) }),
  health: () => request('/health'),
  ttsUrl: (text, lang = 'te') => `${BASE}/ai/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}`
};
