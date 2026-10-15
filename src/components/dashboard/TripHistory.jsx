import { useEffect, useRef } from "react";
import {
  MapPin,
  Timer,
  Gauge,
  Clock,
  RotateCcw,
  Navigation,
} from "lucide-react";

import GlassCard from "../common/GlassCard";
import ErrorBoundary from "../common/ErrorBoundary";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_LAT = 12.9977986667;
const DEFAULT_LNG = 77.5800862667;

export default function TripHistory({ liveData }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylineRef = useRef(null);

  const history = liveData?.history || [];
  const routeHistory = liveData?.routeHistory || [];
  const session = liveData?.session || {};

  // Compute Trip Statistics
  const tripDuration = session.startedAt
    ? Math.round(
        (new Date().getTime() - new Date(session.startedAt).getTime()) / 60000
      )
    : 0;

  const totalDistance =
    session.distanceTravelled !== null && session.distanceTravelled !== undefined
      ? session.distanceTravelled
      : 0;

  const maxSpeed = session.maxSpeed || 0;
  const minSoc = session.minSoc !== null && session.minSoc !== undefined ? session.minSoc : 100;
  const maxSoc = session.maxSoc !== null && session.maxSoc !== undefined ? session.maxSoc : 0;

  // Extract Route Coordinates
  const routeCoordinates = routeHistory
    .filter(
      (point) =>
        Number.isFinite(point.latitude) && Number.isFinite(point.longitude)
    )
    .map((point) => [point.latitude, point.longitude]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const center =
        routeCoordinates.length > 0
          ? routeCoordinates[0]
          : [DEFAULT_LAT, DEFAULT_LNG];

      const map = L.map(mapContainerRef.current, {
        center,
        zoom: routeCoordinates.length > 0 ? 14 : 13,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
        }
      ).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Update Route Polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (routeCoordinates.length > 1) {
      const polyline = L.polyline(routeCoordinates, {
        color: "#6366F1",
        weight: 4,
        opacity: 0.85,
      }).addTo(map);

      polylineRef.current = polyline;
      map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
    }

    return () => {
      // Map cleanup if container removed
    };
  }, [routeCoordinates]);

  return (
    <GlassCard variant="default" className="p-5 sm:p-6" hover={false}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-100 text-indigo-600 shadow-xs">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Current Ride Session
              </h3>
              <p className="text-xs text-slate-500">Live trip telemetry & route analysis</p>
            </div>
          </div>
        </div>

        {/* TRIP STATISTICS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              Duration
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
              {tripDuration > 0 ? `${tripDuration} min` : "0 min"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              Distance
            </p>
            <p className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">
              {totalDistance > 0 ? `${Number(totalDistance).toFixed(1)} km` : "0 km"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              Max Speed
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
              {maxSpeed > 0 ? `${maxSpeed} km/h` : "0 km/h"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              SOC Range
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
              {minSoc}% – {maxSoc}%
            </p>
          </div>
        </div>

        {/* ROUTE MAP CONTAINER */}
        <div className="h-[280px] sm:h-[320px] w-full rounded-2xl overflow-hidden border border-slate-200/80 relative shadow-inner">
          <ErrorBoundary>
            <div ref={mapContainerRef} className="w-full h-full" />
          </ErrorBoundary>
        </div>
      </div>
    </GlassCard>
  );
}