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
      
      // Read response body once
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      let data = null;
      let responseText = '';
      
      // Read response as text first (can only be read once)
      try {
        responseText = await response.text();
      } catch (readError) {
        // If we can't read the response
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }
        return {};
      }

      // Try to parse as JSON if content type suggests it
      if (responseText && isJson) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          // If JSON parsing fails, data remains null
          console.warn('Failed to parse JSON response:', parseError);
        }
      }

      // Handle error responses
      if (!response.ok) {
        let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
        
        if (data && typeof data === 'object') {
          errorMessage = data.message || data.error || data.data?.message || errorMessage;
        } else if (responseText) {
          // Use response text if we couldn't parse JSON
          errorMessage = responseText.length > 200 ? responseText.substring(0, 200) + '...' : responseText;
        }
        
        const error = new Error(errorMessage);
        error.status = response.status;
        error.statusText = response.statusText;
        throw error;
      }

      // Return parsed data for successful responses
      return data !== null ? data : {};
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
