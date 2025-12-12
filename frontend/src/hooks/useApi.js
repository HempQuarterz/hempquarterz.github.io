import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { logApiCall, logApiResponse, logApiError } from '../utils/debug';

/**
 * Custom hook for API calls with loading, error states, and AbortController
 *
 * @param {Function} apiFunction - Async function that makes the API call
 * @param {boolean} immediate - Whether to execute immediately on mount
 * @returns {Object} { data, loading, error, execute, reset }
 */
export const useApi = (apiFunction, immediate = false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    // Create AbortController for cleanup
    const abortController = new AbortController();

    try {
      const result = await apiFunction(...args, { signal: abortController.signal });
      setData(result);
      setLoading(false);
      return result;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
        setLoading(false);
      }
      throw err;
    }

    // Cleanup function
    return () => {
      abortController.abort();
    };
  }, [apiFunction]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, loading, error, execute, reset };
};

/**
 * Hook for fetching Bible data with FUMS tracking
 *
 * @param {string} url - API endpoint URL
 * @param {Object} headers - Request headers
 * @param {boolean} immediate - Whether to execute immediately
 * @returns {Object} { data, loading, error, execute, reset }
 */
export const useBibleApi = (url, headers = {}, immediate = false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (customUrl = url, customHeaders = headers) => {
    setLoading(true);
    setError(null);

    const abortController = new AbortController();

    try {
      logApiCall('GET', customUrl);

      const response = await axios.get(customUrl, {
        headers: customHeaders,
        signal: abortController.signal
      });

      logApiResponse(customUrl, response.data);

      // FUMS tracking
      if (response.data.meta && response.data.meta.fumsId && window._BAPI) {
        window._BAPI.t(response.data.meta.fumsId);
      }

      setData(response.data.data);
      setLoading(false);
      return response.data.data;
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        logApiError(customUrl, err);
        setError(err);
        setLoading(false);
      }
      throw err;
    }

    return () => {
      abortController.abort();
    };
  }, [url, headers]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate && url) {
      execute();
    }
  }, [immediate, url, execute]);

  return { data, loading, error, execute, reset };
};

/**
 * Hook for retrying failed API calls
 *
 * @param {Function} apiCall - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Object} { retry, retrying, retryCount }
 */
export const useRetry = (apiCall, maxRetries = 3) => {
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(async (...args) => {
    setRetrying(true);
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        setRetryCount(i + 1);
        const result = await apiCall(...args);
        setRetrying(false);
        setRetryCount(0);
        return result;
      } catch (err) {
        lastError = err;
        if (i < maxRetries - 1) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }

    setRetrying(false);
    throw lastError;
  }, [apiCall, maxRetries]);

  return { retry, retrying, retryCount };
};
