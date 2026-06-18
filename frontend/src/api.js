const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';
const TOKEN_KEY = 'pooja_sweets_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    setToken(null);
    window.dispatchEvent(new Event('auth:logout'));
  }
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const api = {
  login: (pin) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ pin }) }),

  getMe: () => request('/auth/me'),

  updateSettings: (body) =>
    request('/auth/settings', { method: 'PUT', body: JSON.stringify(body) }),

  changePin: (old_pin, new_pin) =>
    request('/auth/change-pin', {
      method: 'PUT',
      body: JSON.stringify({ old_pin, new_pin }),
    }),

  getStaff: (active = true) =>
    request(`/staff${active ? '' : '?active=false'}`),

  addStaff: (body) =>
    request('/staff', { method: 'POST', body: JSON.stringify(body) }),

  updateStaff: (id, body) =>
    request(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  deleteStaff: (id) =>
    request(`/staff/${id}`, { method: 'DELETE' }),

  getToday: (date) =>
    request(`/payments/today${date ? `?date=${date}` : ''}`),

  togglePayment: (staff_id, date, note = '') =>
    request('/payments/toggle', {
      method: 'POST',
      body: JSON.stringify({ staff_id, date, note }),
    }),

  markAll: (date, paid = true) =>
    request('/payments/mark-all', {
      method: 'POST',
      body: JSON.stringify({ date, paid }),
    }),

  getHistory: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/payments/history${q ? `?${q}` : ''}`);
  },

  getDates: () => request('/payments/dates'),

  getWhatsAppReminder: (date) =>
    request(`/reminders/whatsapp${date ? `?date=${date}` : ''}`),
  
  getStaffWhatsApp: (staff_id, date) =>
    request(`/reminders/whatsapp?staff_id=${staff_id}${date ? `&date=${date}` : ''}`),

  getSalary: (month) =>
    request(`/salary${month ? `?month=${month}` : ''}`),

  addAdvance: (body) =>
    request('/advances', { method: 'POST', body: JSON.stringify(body) }),

  deleteAdvance: (id) =>
    request(`/advances/${id}`, { method: 'DELETE' }),

  markSalaryPaid: (staff_id, month, note = '') =>
    request('/salary/mark-paid', {
      method: 'POST',
      body: JSON.stringify({ staff_id, month, note }),
    }),

  unmarkSalaryPaid: (staff_id, month) =>
    request('/salary/unmark', {
      method: 'POST',
      body: JSON.stringify({ staff_id, month }),
    }),
};

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatMonth(monthStr) {
  const [y, m] = monthStr.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function currentMonth() {
  return todayISO().slice(0, 7);
}

export function shiftMonth(monthStr, delta) {
  const [y, m] = monthStr.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function isToday(dateStr) {
  return dateStr === todayISO();
}

export function openWhatsApp(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}
