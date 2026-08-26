import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  MapPin,
  Navigation,
  Compass,
  Clock,
  ShieldAlert,
  ExternalLink,
  Layers,
  Hospital,
  Activity,
  CheckCircle2
} from 'lucide-react';
import L from 'leaflet';

export default function RealGpsMapModal({ alert, patient, onClose }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const patientMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  const [mapType, setMapType] = useState('road'); // 'road' or 'satellite'
  const [lastUpdatedSec, setLastUpdatedSec] = useState(4);
  const [gpsData, setGpsData] = useState({
    patientId: patient?.id || alert?.patientId || 'PX-10482',
    emergencyId: alert?.id || 'SOS-001',
    patientName: patient?.name || alert?.patientName || 'Rajesh Kumar',
    lat: 28.6139,
    lng: 77.2090,
    hospitalLat: 28.5955,
    hospitalLng: 77.3210,
    address: '24 MG Road, Sector 18, Noida, Uttar Pradesh 201301',
    accuracy: 8,
    timestamp: '10:47:21 AM',
    locationStatus: 'simulated'
  });

  // Calculate Haversine Distance in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const distanceKm = calculateDistance(
    gpsData.lat,
    gpsData.lng,
    gpsData.hospitalLat,
    gpsData.hospitalLng
  );

  // Timer simulation for last updated seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdatedSec(prev => (prev >= 12 ? 2 : prev + 2));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create Map Instance
      const map = L.map(mapContainerRef.current, {
        center: [gpsData.lat, gpsData.lng],
        zoom: 14,
        zoomControl: true
      });

      // Tile Layer (OpenStreetMap Real Road Map)
      const tileLayer = L.tileLayer(
        mapType === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors | MedX Telemetry'
        }
      ).addTo(map);

      // Custom Red Patient SOS Marker
      const patientIcon = L.divIcon({
        className: 'custom-patient-marker',
        html: `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -100%);
          ">
            <div style="
              background: #f43f5e;
              color: white;
              font-weight: 800;
              font-size: 10px;
              padding: 2px 8px;
              border-radius: 9999px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.3);
              white-space: nowrap;
              border: 1.5px solid white;
              margin-bottom: 2px;
            ">
              🔴 ${gpsData.patientName} (SOS ACTIVE)
            </div>
            <div style="
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #rose-600;
              border: 3px solid white;
              box-shadow: 0 0 0 4px rgba(244,63,94,0.4);
              background-color: #f43f5e;
            "></div>
          </div>
        `,
        iconSize: [0, 0]
      });

      const patientMarker = L.marker([gpsData.lat, gpsData.lng], { icon: patientIcon })
        .addTo(map)
        .bindPopup(`<b>🔴 ${gpsData.patientName}</b><br/>Status: SOS ACTIVE<br/>Location: ER-2 Corridor`);

      patientMarkerRef.current = patientMarker;

      // Custom Blue Hospital Marker
      const hospitalIcon = L.divIcon({
        className: 'custom-hospital-marker',
        html: `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -100%);
          ">
            <div style="
              background: #0284c7;
              color: white;
              font-weight: 800;
              font-size: 10px;
              padding: 2px 8px;
              border-radius: 9999px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.3);
              white-space: nowrap;
              border: 1.5px solid white;
              margin-bottom: 2px;
            ">
              🏥 MedX Super Speciality Hospital
            </div>
            <div style="
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #0284c7;
              border: 3px solid white;
              box-shadow: 0 0 0 4px rgba(2,132,199,0.4);
            "></div>
          </div>
        `,
        iconSize: [0, 0]
      });

      L.marker([gpsData.hospitalLat, gpsData.hospitalLng], { icon: hospitalIcon })
        .addTo(map)
        .bindPopup('<b>🏥 MedX Hospital Base</b><br/>Trauma Center & Emergency Bay');

      // Emergency Responder Marker (Ambulance / Duty Nurse)
      const responderIcon = L.divIcon({
        className: 'custom-responder-marker',
        html: `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -100%);
          ">
            <div style="
              background: #059669;
              color: white;
              font-weight: 800;
              font-size: 9px;
              padding: 2px 6px;
              border-radius: 9999px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.3);
              white-space: nowrap;
              border: 1.5px solid white;
              margin-bottom: 2px;
            ">
              🚑 Nurse Priya (Responder)
            </div>
            <div style="
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: #059669;
              border: 2px solid white;
            "></div>
          </div>
        `,
        iconSize: [0, 0]
      });

      L.marker([28.6040, 77.2650], { icon: responderIcon }).addTo(map);

      // Route Line Patient -> Hospital
      const polyline = L.polyline(
        [
          [gpsData.lat, gpsData.lng],
          [28.6040, 77.2650],
          [gpsData.hospitalLat, gpsData.hospitalLng]
        ],
        { color: '#0284c7', weight: 4, opacity: 0.8, dashArray: '8, 8' }
      ).addTo(map);

      polylineRef.current = polyline;
      mapInstanceRef.current = map;
    }
  }, [gpsData]);

  // Recenter Map on Patient
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([gpsData.lat, gpsData.lng], 15, {
        duration: 1.2
      });
    }
  };

  // Open External Directions (Google Maps)
  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${gpsData.lat},${gpsData.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md animate-pulse">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>📍 LIVE PATIENT GPS TRACKING</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-slate-950">
                  🟡 SIMULATED GPS
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Patient: <strong className="text-white">{gpsData.patientName}</strong> • ID: {gpsData.patientId} • Alert ID: {gpsData.emergencyId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* REAL INTERACTIVE LEAFLET MAP CONTAINER */}
        <div className="relative w-full h-[360px] bg-slate-200">
          <div ref={mapContainerRef} className="w-full h-full z-10"></div>

          {/* Map Controls Floating Overlay */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-300 shadow-md">
            <button
              onClick={() => setMapType('road')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                mapType === 'road' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Road Map
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                mapType === 'satellite' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Floating Action Button: Recenter & Directions */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
            <button
              onClick={handleRecenter}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold shadow-md backdrop-blur-md transition-colors"
            >
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Recenter on Patient</span>
            </button>
            <button
              onClick={handleGetDirections}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>↗ Get Directions</span>
            </button>
          </div>
        </div>

        {/* LOCATION METRICS & WRITTEN ADDRESS PANEL */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Written Address & GPS Coordinates */}
            <div className="md:col-span-7 p-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <span className="font-extrabold text-slate-900 block text-xs uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Resolved Physical Address</span>
              </span>
              <p className="text-slate-800 font-bold text-sm">{gpsData.address}</p>
              
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                <span className="text-slate-500">GPS Coordinates: <strong className="text-slate-900 font-mono font-bold">{gpsData.lat}° N, {gpsData.lng}° E</strong></span>
                <span className="text-slate-500">Accuracy: <strong className="text-emerald-700 font-bold">~{gpsData.accuracy} meters</strong></span>
              </div>
            </div>

            {/* Live Status & Distance to Hospital */}
            <div className="md:col-span-5 p-4 bg-white rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-800">Telemetry Status</span>
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-900 border border-amber-300">
                  🟡 SIMULATED GPS
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2 bg-sky-50 rounded-xl border border-sky-100">
                  <span className="text-[10px] font-medium text-slate-500 block">Distance to Hospital</span>
                  <span className="text-base font-black text-sky-950">{distanceKm} km</span>
                </div>
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-medium text-slate-500 block">Hospital Arrival ETA</span>
                  <span className="text-base font-black text-emerald-950">14 min <span className="text-[10px] text-slate-500 font-medium">(10:57 AM)</span></span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 text-center font-mono">
                Updated {lastUpdatedSec} seconds ago ({gpsData.timestamp})
              </div>
            </div>

          </div>

          {/* Footer Close Button */}
          <div className="pt-2 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Close Map
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
