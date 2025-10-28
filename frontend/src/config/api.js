export const API_CONFIG = {
  BASE_URL: 'https://api.scripture.api.bible/v1',
  API_KEY: process.env.REACT_APP_BIBLE_API_KEY,
};

export const getApiHeaders = () => ({
  'api-key': API_CONFIG.API_KEY,
});