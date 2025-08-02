const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// API client class for handling HTTP requests
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  // Set authorization token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Get authorization headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: 'Unknown Error', 
          message: `HTTP ${response.status} ${response.statusText}` 
        }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      // Return parsed JSON
      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Authentication methods
  async login(loginCode) {
    const response = await this.post('/auth/login', { loginCode });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async verifyToken() {
    try {
      const response = await this.post('/auth/verify');
      return response;
    } catch (error) {
      // If token verification fails, clear it
      this.setToken(null);
      throw error;
    }
  }

  async refreshToken() {
    try {
      const response = await this.post('/auth/refresh');
      if (response.token) {
        this.setToken(response.token);
      }
      return response;
    } catch (error) {
      // If refresh fails, clear token
      this.setToken(null);
      throw error;
    }
  }

  logout() {
    this.setToken(null);
  }

  // User methods
  async getUsers() {
    return this.get('/users');
  }

  async getStudents() {
    return this.get('/users/students');
  }

  async getUserProfile() {
    return this.get('/users/profile');
  }

  async getUserById(id) {
    return this.get(`/users/${id}`);
  }

  async createUser(userData) {
    return this.post('/users', userData);
  }

  async updateUser(id, userData) {
    return this.put(`/users/${id}`, userData);
  }

  async deleteUser(id) {
    return this.delete(`/users/${id}`);
  }

  async reactivateUser(id) {
    return this.patch(`/users/${id}/reactivate`);
  }

  // Meal entry methods
  async getMealEntries(params = {}) {
    return this.get('/meal-entries', params);
  }

  async getAllMealEntriesAdmin(params = {}) {
    return this.get('/meal-entries/admin/all', params);
  }

  async getUserMealEntries(userId, params = {}) {
    return this.get(`/meal-entries/user/${userId}`, params);
  }

  async getSpendingSummary(userId, params = {}) {
    return this.get(`/meal-entries/user/${userId}/summary`, params);
  }

  async getDishFrequency(userId, params = {}) {
    return this.get(`/meal-entries/user/${userId}/dishes`, params);
  }

  async getMealEntryById(id) {
    return this.get(`/meal-entries/${id}`);
  }

  async createMealEntry(entryData) {
    return this.post('/meal-entries', entryData);
  }

  async updateMealEntry(id, entryData) {
    return this.put(`/meal-entries/${id}`, entryData);
  }

  async deleteMealEntry(id) {
    return this.delete(`/meal-entries/${id}`);
  }

  async restoreMealEntry(id) {
    return this.patch(`/meal-entries/${id}/restore`);
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();

export default apiClient;
