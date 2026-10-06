const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api')
  .replace(/\/+$/, '');
const TOKEN_KEY = 'ems.accessToken';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function readAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveAccessToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = readAccessToken();

  if (options.body !== undefined) headers.set('Content-Type', 'application/json');
  if (token && path !== '/auth/login') headers.set('Authorization', `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError('The EMS service could not be reached. Check that the API is running and try again.');
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    if (response.status === 401 && token && path !== '/auth/login') {
      window.dispatchEvent(new Event('ems:unauthorized'));
    }
    throw new ApiError(payload?.message || `The request failed (${response.status}).`, response.status);
  }

  return payload;
}
