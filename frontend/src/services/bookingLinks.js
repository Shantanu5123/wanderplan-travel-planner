/**
 * Clean URL builders for external travel actions (Google Maps, Google Flights, Booking.com)
 * No paid booking APIs required.
 */

/**
 * Builds Google Maps search URL with exact coordinates or encoded name + destination
 */
export function buildGoogleMapsUrl(activity, destination = '') {
  if (typeof activity.latitude === 'number' && typeof activity.longitude === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${activity.latitude},${activity.longitude}`;
  }
  const queryParts = [activity.title, activity.location, destination].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryParts)}`;
}

/**
 * Builds Google Flights deep search link pre-filled with destination
 */
export function buildGoogleFlightsUrl(destination = '') {
  const query = encodeURIComponent(`Flights to ${destination}`);
  return `https://www.google.com/travel/flights?q=${query}`;
}

/**
 * Builds Booking.com hotel search deep link pre-filled with destination and travel dates
 */
export function buildBookingHotelsUrl(destination = '', startDate = '', endDate = '') {
  let url = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`;
  if (startDate && startDate.includes('-')) {
    const [checkinYear, checkinMonth, checkinDay] = startDate.split('-');
    url += `&checkin_year=${checkinYear}&checkin_month=${checkinMonth}&checkin_monthday=${checkinDay}`;
  }
  if (endDate && endDate.includes('-')) {
    const [checkoutYear, checkoutMonth, checkoutDay] = endDate.split('-');
    url += `&checkout_year=${checkoutYear}&checkout_month=${checkoutMonth}&checkout_monthday=${checkoutDay}`;
  }
  return url;
}

/**
 * Builds Google Hotels search deep link pre-filled with destination
 */
export function buildGoogleHotelsUrl(destination = '') {
  const query = encodeURIComponent(`Hotels in ${destination}`);
  return `https://www.google.com/travel/hotels?q=${query}`;
}
