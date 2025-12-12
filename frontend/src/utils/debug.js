/**
 * Debug utility for development logging
 * Automatically disabled in production builds
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const debug = {
  log: (...args) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  error: (...args) => {
    if (isDevelopment) {
      console.error('[ERROR]', ...args);
    }
  },

  warn: (...args) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },

  info: (...args) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  table: (data) => {
    if (isDevelopment) {
      console.table(data);
    }
  }
};

// For API debugging
export const logApiCall = (method, url, data = null) => {
  if (isDevelopment) {
    console.log(`[API ${method}]`, url, data || '');
  }
};

export const logApiResponse = (url, response) => {
  if (isDevelopment) {
    console.log('[API Response]', url, response);
  }
};

export const logApiError = (url, error) => {
  if (isDevelopment) {
    console.error('[API Error]', url, error.response || error);
  }
};
