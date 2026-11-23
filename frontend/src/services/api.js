import axios from 'axios';

// Ensure no trailing slashes on API_BASE_URL
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
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

export default apiClient;
