import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000', // Update this to match your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Note: Removed automatic redirect on 401 to allow public access to pages
      // Pages will handle empty data gracefully when user is not authenticated
      
      // Return error message from server
      return Promise.reject(data.message || 'An error occurred');
    } else if (error.request) {
      // Request made but no response
      return Promise.reject('Network error. Please check your connection.');
    } else {
      // Error in setting up request
      return Promise.reject('An error occurred. Please try again.');
    }
  }
);

export default api;
