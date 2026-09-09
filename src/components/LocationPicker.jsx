import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair } from 'lucide-react';

const pinIcon = L.divIcon({
  className: 'penyaluran-map-pin',
  html: `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 24 14 24s14-13.5 14-24c0-7.73-6.27-14-14-14z" fill="#db2777" stroke="white" stroke-width="1.5"/>
    <circle cx="14" cy="14" r="5.5" fill="white"/>
  </svg>`,
  iconSize: [28, 38],
  iconAnchor: [14, 38],
  popupAnchor: [0, -34]
});

const DEFAULT_CENTER = [-6.9147, 107.6098]; // Bandung

// Click-to-place single-point map picker — used to capture a donor's titik
// koordinat so donor-distribution maps have real lat/lng to plot later.
const LocationPicker = ({ lat, lng, onChange, height = '220px' }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const hasPoint = typeof lat === 'number' && typeof lng === 'number';
    const map = L.map(containerRef.current, {
      center: hasPoint ? [lat, lng] : DEFAULT_CENTER,
      zoom: hasPoint ? 15 : 12,
      scrollWheelZoom: false
    });
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    if (hasPoint) {
      markerRef.current = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);
      markerRef.current.on('dragend', () => {
        const pos = markerRef.current.getLatLng();
        onChangeRef.current?.(pos.lat, pos.lng);
      });
    }

    map.on('click', (e) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([clickLat, clickLng]);
      } else {
        markerRef.current = L.marker([clickLat, clickLng], { icon: pinIcon, draggable: true }).addTo(map);
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current.getLatLng();
          onChangeRef.current?.(pos.lat, pos.lng);
        });
      }
      onChangeRef.current?.(clickLat, clickLng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Keep the marker in sync if lat/lng change from outside (e.g. selecting a
  // different donor, or the "Gunakan Lokasi Saya" button).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);
      markerRef.current.on('dragend', () => {
        const pos = markerRef.current.getLatLng();
        onChangeRef.current?.(pos.lat, pos.lng);
      });
    }
    map.setView([lat, lng], Math.max(map.getZoom(), 15));
  }, [lat, lng]);

  useEffect(() => {
    const timer = setTimeout(() => mapRef.current?.invalidateSize(), 200);
    return () => clearTimeout(timer);
  });

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => onChangeRef.current?.(pos.coords.latitude, pos.coords.longitude),
      () => alert('Tidak dapat mengambil lokasi saat ini. Klik langsung pada peta untuk menandai titik koordinat.')
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef} className="map-container" style={{ height, borderRadius: '8px', border: '1px solid var(--border-color)' }} />
      <button
        type="button"
        onClick={useMyLocation}
        title="Gunakan lokasi saya"
        style={{
          position: 'absolute', top: '8px', right: '8px', zIndex: 1000,
          background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px',
          padding: '6px', cursor: 'pointer', display: 'flex', boxShadow: 'var(--shadow-sm)'
        }}
      >
        <Crosshair size={16} color="#db2777" />
      </button>
      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
        {typeof lat === 'number' && typeof lng === 'number'
          ? `Titik: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
          : 'Klik pada peta untuk menandai titik koordinat donatur'}
      </div>
    </div>
  );
};

export default LocationPicker;
