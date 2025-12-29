const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500';

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  async getToken() {
    if (typeof window !== 'undefined') {
      try {
        // First, try to get fresh token from Firebase Auth
        const { auth } = await import('@/config/firebase');
        const user = auth.currentUser;
        
        if (user) {
          // Get fresh token (this will auto-refresh if expired)
          const freshToken = await user.getIdToken(true); // Force refresh
          // Update stored token
          localStorage.setItem('firebase_token', freshToken);
          return freshToken;
        }
        
        // Fallback to stored token if no current user
        const tempToken = localStorage.getItem('firebase_token');
        if (tempToken) {
          return tempToken;
        }
      } catch (error) {
        console.error('Error getting token:', error);
        // Fallback to stored token
        const tempToken = localStorage.getItem('firebase_token');
        if (tempToken) {
          return tempToken;
        }
      }
    }
    return null;
  }

  async request(endpoint, options = {}) {
    const token = await this.getToken();
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...options.headers,
    };

    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If not JSON, get text for error message
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || `Request failed: ${response.status} ${response.statusText}`);
      }

      return data;
    } catch (error) {
      // Re-throw with more context if it's a network error
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
    const isFormData = data instanceof FormData;
    const headers = {
      ...options.headers,
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    return this.request(endpoint, {
      ...options,
      headers,
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
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

export const api = new ApiClient();
