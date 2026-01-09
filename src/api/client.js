import axios from 'axios';

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API error:', error.response?.data || error.message);

    // Handle specific error cases
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      if (status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else if (status === 404) {
        throw new Error(data?.error?.message || 'Resource not found');
      } else if (status >= 500) {
        throw new Error('Server error. Please try again later.');
      }

      throw new Error(data?.error?.message || 'An error occurred');
    } else if (error.request) {
      // Request was made but no response
      throw new Error('Unable to connect to server. Please check your connection.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

// Block API
export const blockAPI = {
  // Get all blocks
  getAll: async () => {
    return await api.get('/blocks');
  },

  // Get single block
  getById: async (id) => {
    return await api.get(`/blocks/${id}`);
  },

  // Create new block
  create: async (blockData) => {
    return await api.post('/blocks', blockData);
  },

  // Update block
  update: async (id, updates) => {
    return await api.put(`/blocks/${id}`, updates);
  },

  // Delete block
  delete: async (id) => {
    return await api.delete(`/blocks/${id}`);
  },
};

// Connection API
export const connectionAPI = {
  // Get all connections
  getAll: async () => {
    return await api.get('/connections');
  },

  // Get single connection
  getById: async (id) => {
    return await api.get(`/connections/${id}`);
  },

  // Create new connection
  create: async (connectionData) => {
    return await api.post('/connections', connectionData);
  },

  // Delete connection
  delete: async (id) => {
    return await api.delete(`/connections/${id}`);
  },
};

// Analysis API
export const analysisAPI = {
  // Full canvas analysis
  analyzeCanvas: async () => {
    return await api.post('/analysis/canvas');
  },

  // Find similar blocks
  findSimilar: async (blockId, limit = 5, threshold = 0.7) => {
    return await api.get(`/analysis/similar/${blockId}`, {
      params: { limit, threshold },
    });
  },

  // Search by text
  searchByText: async (query, limit = 10) => {
    return await api.post('/analysis/search', { query, limit });
  },

  // Auto-suggest for block
  autoSuggest: async (blockId) => {
    return await api.get(`/analysis/auto-suggest/${blockId}`);
  },
};

export default api;
