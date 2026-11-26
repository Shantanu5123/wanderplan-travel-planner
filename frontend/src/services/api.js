import axios from 'axios';

// Default to relative '/api/v1' when hosted on Vercel so no env config or CORS is needed!
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout for cold start / LLM response
});

/**
 * Generate a new travel itinerary based on user input
 * @param {Object} tripData 
 * @param {string} tripData.destination
 * @param {string} tripData.start_date
 * @param {string} tripData.end_date
 * @param {string} tripData.budget
 * @param {string[]} tripData.interests
 * @param {string} tripData.travel_style
 */
export async function generateItinerary(tripData) {
  const response = await apiClient.post('/itineraries/generate', tripData);
  return response.data;
}

/**
 * AI Swap Stop: Returns a single fresh alternative activity for a stop
 */
export async function swapActivity(payload) {
  const response = await apiClient.post('/itineraries/swap-activity', payload);
  return response.data;
}

export default apiClient;
