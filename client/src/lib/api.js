// API client supporting auth tokens and full endpoint coverage
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:4000/api';
  }
  return 'https://mandi-mitra-nbtv.onrender.com/api';
};

const BASE = getBaseUrl();

async function request(path, options = {}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('mm_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }
  return data;
}

export const api = {
  // Existing endpoints
  markets: () => request('/markets'),
  commodities: () => request('/markets/commodities'),
  recommend: (payload) => request('/recommendations', { method: 'POST', body: JSON.stringify(payload) }),
  buyers: (crop = '') => request(`/buyers/requirements${crop ? `?crop=${encodeURIComponent(crop)}` : ''}`),
  verifyBuyer: (payload) => request('/buyers/verify', { method: 'POST', body: JSON.stringify(payload) }),
  postBuyer: (payload) => request('/buyers/requirements', { method: 'POST', body: JSON.stringify(payload) }),
  parseHarvest: (text) => request('/ai/parse-harvest', { method: 'POST', body: JSON.stringify({ text }) }),
  health: () => request('/health'),
  ttsUrl: (text, lang = 'te') => `${BASE}/ai/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}`,

  // Authentication endpoints
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Mandi Official endpoints
  getOfficialMe: () => request('/official/me'),
  applyOfficial: (payload) => request('/official/apply', { method: 'POST', body: JSON.stringify(payload) }),
  getAssignedMarkets: () => request('/official/assigned-markets'),

  // Price Submissions & Public Price endpoints
  getPrices: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.commodity) qs.append('commodity', params.commodity);
    if (params.market) qs.append('market', params.market);
    if (params.district) qs.append('district', params.district);
    if (params.state) qs.append('state', params.state);
    if (params.date) qs.append('date', params.date);
    const query = qs.toString();
    return request(`/prices${query ? `?${query}` : ''}`);
  },
  getPriceSummary: () => request('/prices/summary'),
  getPriceHistory: (commodity = 'Tomato', marketId = '') => {
    const qs = new URLSearchParams({ commodity });
    if (marketId) qs.append('marketId', marketId);
    return request(`/prices/history?${qs.toString()}`);
  },
  submitPrice: (payload) => request('/prices/submissions', { method: 'POST', body: JSON.stringify(payload) }),
  getMySubmissions: () => request('/prices/my-submissions'),
  getSubmissionById: (id) => request(`/prices/submissions/${id}`),
  updateSubmission: (id, payload) => request(`/prices/submissions/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // Administration endpoints
  getAdminDashboard: () => request('/admin/dashboard'),
  getAdminOfficials: (status = '') => request(`/admin/officials${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  updateOfficialStatus: (id, payload) => request(`/admin/officials/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
  assignMarketsToOfficial: (id, payload) => request(`/admin/officials/${id}/assign-markets`, { method: 'PATCH', body: JSON.stringify(payload) }),
  getAdminPrices: (status = 'PENDING_REVIEW') => request(`/admin/prices${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  reviewPriceSubmission: (id, payload) => request(`/admin/prices/${id}/review`, { method: 'POST', body: JSON.stringify(payload) }),
  getAdminAuditLogs: (limit = 50) => request(`/admin/audit-logs?limit=${limit}`),
  getAdminCommodities: () => request('/admin/commodities'),
  createCommodity: (payload) =>
    request('/admin/commodities', { method: 'POST', body: JSON.stringify(payload) })
      .catch(() => request('/markets/commodities', { method: 'POST', body: JSON.stringify(payload) })),
  toggleCommodity: (id, active) => request(`/admin/commodities/${id}/toggle`, { method: 'PATCH', body: JSON.stringify({ active }) }),
  getAdminMarkets: () => request('/admin/markets')
};
