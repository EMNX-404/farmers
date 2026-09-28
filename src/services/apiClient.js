const API_BASE_URL = typeof window !== 'undefined' ? '/api' : (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL ? process.env.REACT_APP_API_BASE_URL : '/api');

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getToken() {
    return localStorage.getItem('marketlink_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('marketlink_token', token);
    } else {
      localStorage.removeItem('marketlink_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.setToken(null);
          window.dispatchEvent(new Event('marketlink_auth_expired'));
        }
        const errorMsg = data.message || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      console.error(`[API Error ${options.method || 'GET'} ${endpoint}]:`, err.message);
      throw err;
    }
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    });
    const queryString = query.toString();
    const fullPath = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(fullPath, { method: 'GET' });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, { method: 'POST', body });
  }

  put(endpoint, body = {}) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  patch(endpoint, body = {}) {
    return this.request(endpoint, { method: 'PATCH', body });
  }

  delete(endpoint, body = {}) {
    return this.request(endpoint, { method: 'DELETE', body });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
