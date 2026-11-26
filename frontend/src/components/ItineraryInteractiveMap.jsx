import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCurrency } from '../context/CurrencyContext';

// Helper component to smoothly center/zoom the map when active coordinates change
function MapRecenter({ center, zoom, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate: true, duration: 0.8 });
    } else if (center) {
      map.flyTo(center, zoom || 14, { animate: true, duration: 0.8 });
    }
  }, [center, zoom, bounds, map]);
  return null;
}

// Fallback coordinate mapping for top global destinations if coordinates are missing
const DESTINATION_COORDS = {
  tokyo: [35.6762, 139.6503],
  kyoto: [35.0116, 135.7681],
  osaka: [34.6937, 135.5023],
  paris: [48.8566, 2.3522],
  london: [51.5074, -0.1278],
  'new york': [40.7128, -74.0060],
  rome: [41.9028, 12.4964],
  bali: [-8.4095, 115.1889],
  santorini: [36.3932, 25.4615],
  switzerland: [46.8182, 8.2275],
  barcelona: [41.3879, 2.1699],
  dubai: [25.2048, 55.2708],
  singapore: [1.3521, 103.8198],
  sydney: [-33.8688, 151.2093],
  amsterdam: [52.3676, 4.9041],
  florence: [43.7696, 11.2558],
  goa: [15.2993, 74.1240],
  jaipur: [26.9124, 75.7873],
};

function getDestinationDefault(destination) {
  if (!destination) return [48.8566, 2.3522]; // Default Paris
  const lower = destination.toLowerCase();
  for (const [key, coords] of Object.entries(DESTINATION_COORDS)) {
    if (lower.includes(key)) return coords;
  }
  return [48.8566, 2.3522];
}

// Custom Leaflet DivIcon with glowing numbered badge
function createNumberedIcon(number, isHovered, timeSlot) {
  let badgeColor = '#3b82f6'; // Blue
  if (timeSlot?.toLowerCase().includes('morning')) badgeColor = '#38bdf8'; // Sky cyan
  if (timeSlot?.toLowerCase().includes('afternoon')) badgeColor = '#f59e0b'; // Amber
  if (timeSlot?.toLowerCase().includes('evening')) badgeColor = '#8b5cf6'; // Violet

  const scale = isHovered ? 'scale(1.25)' : 'scale(1)';
  const shadow = isHovered ? `0 0 20px ${badgeColor}, 0 4px 10px rgba(0,0,0,0.6)` : '0 4px 12px rgba(0,0,0,0.45)';

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${badgeColor};
        color: #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 14px;
        border: 2.5px solid #ffffff;
        box-shadow: ${shadow};
        transform: ${scale};
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: pointer;
      ">
        ${number}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

export default function ItineraryInteractiveMap({
  activities = [],
  destination = '',
  hoveredIndex = null,
  onMarkerClick = null,
  activeDayNumber = 1,
}) {
  const { formatCost } = useCurrency();
  const markerRefs = useRef([]);

  // Calculate coordinates for activities (generate offsets around city center if missing)
  const defaultCityCenter = useMemo(() => getDestinationDefault(destination), [destination]);

  const stops = useMemo(() => {
    return activities.map((act, index) => {
      let lat = typeof act.latitude === 'number' ? act.latitude : null;
      let lng = typeof act.longitude === 'number' ? act.longitude : null;

      // If coordinates aren't returned by legacy items, generate structured spread points
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        const offsetLat = (index - 1) * 0.012 + (index % 2 === 0 ? 0.006 : -0.006);
        const offsetLng = (index - 1) * 0.015 + (index % 2 === 0 ? -0.005 : 0.008);
        lat = defaultCityCenter[0] + offsetLat;
        lng = defaultCityCenter[1] + offsetLng;
      }

      return {
        ...act,
        lat,
        lng,
        index,
      };
    });
  }, [activities, defaultCityCenter]);

  // Sequence of polyline points: Morning -> Afternoon -> Evening
  const polylinePositions = useMemo(() => {
    return stops.map((s) => [s.lat, s.lng]);
  }, [stops]);

  // Compute bounding box
  const bounds = useMemo(() => {
    if (polylinePositions.length === 0) return null;
    return polylinePositions;
  }, [polylinePositions]);

  // Handle fly-to when hovering activity cards
  const hoveredStop = hoveredIndex !== null && stops[hoveredIndex] ? stops[hoveredIndex] : null;
  const mapCenter = hoveredStop ? [hoveredStop.lat, hoveredStop.lng] : defaultCityCenter;

  // Auto-open marker popup on hover
  useEffect(() => {
    if (hoveredIndex !== null && markerRefs.current[hoveredIndex]) {
      markerRefs.current[hoveredIndex].openPopup();
    }
  }, [hoveredIndex]);

  return (
    <div className="interactive-map-wrapper">
      <div className="map-glass-header">
        <div className="map-badge">
          <span className="live-dot" />
          <span>Day {activeDayNumber} Route Map</span>
        </div>
        <div className="map-legend">
          <span className="legend-item"><span className="legend-dot morning" /> Morning</span>
          <span className="legend-item"><span className="legend-dot afternoon" /> Afternoon</span>
          <span className="legend-item"><span className="legend-dot evening" /> Evening</span>
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={false}
        className="leaflet-map-canvas"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter
          center={hoveredStop ? [hoveredStop.lat, hoveredStop.lng] : (polylinePositions[0] || defaultCityCenter)}
          zoom={hoveredStop ? 15 : undefined}
          bounds={hoveredStop ? null : bounds}
        />

        {/* Dashed polyline connecting sequence */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#38bdf8',
              weight: 3.5,
              opacity: 0.85,
              dashArray: '8, 8',
              lineCap: 'round',
            }}
          />
        )}

        {/* Plot numbered markers for each stop */}
        {stops.map((stop, i) => {
          const isHovered = hoveredIndex === i;
          return (
            <Marker
              key={`${stop.time_slot}-${i}`}
              position={[stop.lat, stop.lng]}
              icon={createNumberedIcon(i + 1, isHovered, stop.time_slot)}
              ref={(el) => (markerRefs.current[i] = el)}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(i);
                },
              }}
            >
              <Popup className="travel-map-popup" autoPan={false}>
                <div style={{ minWidth: '160px', padding: '0.2rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Stop #{i + 1} • {stop.time_slot || 'Activity'}
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
                    {stop.title}
                  </h4>
                  {stop.location && (
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '0.35rem' }}>
                      📍 {stop.location}
                    </div>
                  )}
                  {stop.cost_estimate && (
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', background: 'rgba(16, 185, 129, 0.12)', padding: '0.2rem 0.5rem', borderRadius: '6px', display: 'inline-block' }}>
                      Est: {formatCost(stop.cost_estimate)}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
