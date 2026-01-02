const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500';

class AdminApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  getAdminToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  }

  async request(endpoint, options = {}) {
    const token = this.getAdminToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      let data = null;
      let responseText = '';
      
      try {
        responseText = await response.text();
      } catch (readError) {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }
        return {};
      }

      if (responseText && isJson) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.warn('Failed to parse JSON response:', parseError);
        }
      }

      if (!response.ok) {
        let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
        
        if (data && typeof data === 'object') {
          errorMessage = data.message || data.error || data.data?.message || errorMessage;
        } else if (responseText) {
          errorMessage = responseText.length > 200 ? responseText.substring(0, 200) + '...' : responseText;
        }
        
        const error = new Error(errorMessage);
        error.status = response.status;
        error.statusText = response.statusText;
        throw error;
      }

      return data !== null ? data : {};
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Network error: Could not connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const adminApi = new AdminApiClient();
