const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

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
  recommend: (payload) => request('/recommendations', { method: 'POST', body: JSON.stringify(payload) }),
  buyers: (crop = '') => request(`/buyers/requirements${crop ? `?crop=${encodeURIComponent(crop)}` : ''}`),
  postBuyer: (payload) => request('/buyers/requirements', { method: 'POST', body: JSON.stringify(payload) }),
  parseHarvest: (text) => request('/ai/parse-harvest', { method: 'POST', body: JSON.stringify({ text }) }),
  health: () => request('/health'),
  ttsUrl: (text, lang = 'te') => `${BASE}/ai/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}`
};
