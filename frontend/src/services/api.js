import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
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
