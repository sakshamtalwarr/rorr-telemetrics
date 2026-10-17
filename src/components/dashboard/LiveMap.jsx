import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  MapPin,
  LocateFixed,
  Maximize2,
  Battery,
  Gauge,
  Zap,
  Navigation,
  Route,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  X,
  Play,
  Leaf,
} from "lucide-react";

import GlassCard from "../common/GlassCard";
import ErrorBoundary from "../common/ErrorBoundary";

// =====================================================
// DEFAULT LOCATION (Uttam Nagar, West Delhi default)
// =====================================================

const DEFAULT_LAT = 28.6236;
const DEFAULT_LNG = 77.0673;

// =====================================================
// CUSTOM LEAFLET DIV ICONS
// =====================================================

const bikeIcon = L.divIcon({
  className: "oben-bike-marker",
  html: `
    <div style="
      width:48px;
      height:48px;
      border-radius:50%;
      background: radial-gradient(circle, rgba(239,68,68,0.45) 0%, rgba(220,38,38,0.22) 45%, rgba(220,38,38,0.04) 70%);
      border: 2px solid #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 16px rgba(239,68,68,0.9), 0 0 32px rgba(220,38,38,0.5), inset 0 0 15px rgba(239,68,68,0.35);
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    ">
      <div style="
        width:32px;
        height:32px;
        border-radius:50%;
        background:#0F1017;
        display:flex;
        align-items:center;
        justify-content:center;
        border:1px solid rgba(239,68,68,0.5);
      ">
        <span style="font-size:18px; line-height:1;">🏍️</span>
      </div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -25],
});

const startPointIcon = L.divIcon({
  className: "oben-start-pin",
  html: `
    <div style="
      width:36px;
      height:36px;
      border-radius:50%;
      background: rgba(16,185,129,0.25);
      border: 2px solid #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 18px rgba(16,185,129,0.8);
      cursor: pointer;
    ">
      <div style="
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: #064e3b;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 900;
        color: #34d399;
        border: 1px solid #10b981;
      ">
        A
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

const endPointIcon = L.divIcon({
  className: "oben-end-pin",
  html: `
    <div style="
      width:36px;
      height:36px;
      border-radius:50%;
      background: rgba(239,68,68,0.25);
      border: 2px solid #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 18px rgba(239,68,68,0.8);
      cursor: pointer;
    ">
      <div style="
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: #7f1d1d;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
      ">
        🏁
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

const geofenceIcon = L.divIcon({
  className: "geofence-center-marker",
  html: `
    <div style="
      width:32px;
      height:32px;
      border-radius:50%;
      background:rgba(244,63,94,0.18);
      border:2px solid #fb7185;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 0 18px rgba(244,63,94,0.65);
      cursor:grab;
    ">
      <span style="font-size:15px; line-height:1;">📍</span>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// =====================================================
// LIVE MAP COMPONENT WITH TRIP TRACKER & ROUTE VIEWER
// =====================================================

export default function LiveMap({
  latitude,
  longitude,
  address,
  geofence,
  onGeofenceMove,
  onUseBikeLocation,
  speed,
  batteryVoltage,
  SOC,
  ignitionStatus,
  odometer,
  packetCreatedAt,
  history = [],
  trips = [],
  selectedTrip = null,
  onSelectTrip = null,
  activeTrip = null,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const geofenceCircleRef = useRef(null);
  const geofenceMarkerRef = useRef(null);
  const trailRef = useRef(null);
  const routePolylineRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const liveTripPolylineRef = useRef(null);
  const fullscreenRef = useRef(null);

  // Active view mode: "live" (live bike & geofence) vs "routes" (trip playback & route lines)
  const [viewMode, setViewMode] = useState(() => (selectedTrip ? "routes" : "live"));
  const [internalSelectedTrip, setInternalSelectedTrip] = useState(selectedTrip);

  useEffect(() => {
    if (selectedTrip) {
      setInternalSelectedTrip(selectedTrip);
      setViewMode("routes");
    }
  }, [selectedTrip]);

  const currentTripToDisplay = internalSelectedTrip || (trips.length > 0 ? trips[0] : null);

  // Valid Position Check
  const validPosition =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude !== 0 &&
    longitude !== 0;

  const initialLat = validPosition ? latitude : DEFAULT_LAT;
  const initialLng = validPosition ? longitude : DEFAULT_LNG;

  // ===================================================
  // LEAFLET MAP INITIALIZATION
  // ===================================================

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: validPosition ? 15 : 13,
      zoomControl: true,
      attributionControl: true,
    });

    // 100% Free OpenStreetMap Stealth Dark Tile Layer
    const osmDarkLayer = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
        minZoom: 3,
        className: "osm-dark-tiles",
      }
    ).addTo(map);

    const osmStandardLayer = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
        minZoom: 3,
      }
    );

    const topoLayer = L.tileLayer(
      "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      {
        attribution: "© OpenTopoMap contributors",
        subdomains: "abc",
        maxZoom: 17,
        minZoom: 3,
      }
    );

    L.control
      .layers(
        {
          "🌑 Stealth Dark (OSM)": osmDarkLayer,
          "🌐 OpenStreetMap Standard": osmStandardLayer,
          "🏔️ OpenTopoMap (Terrain)": topoLayer,
        },
        null,
        { collapsed: true, position: "topright" }
      )
      .addTo(map);

    L.control.scale({ imperial: false, position: "bottomright" }).addTo(map);

    // Vehicle Bike Marker
    const marker = L.marker([initialLat, initialLng], {
      icon: bikeIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    marker.bindPopup(`
      <div style="font-family:sans-serif; color:#fff; background:#0B0C11; padding:10px; border-radius:12px; border:1px solid #ef4444;">
        <strong style="color:#ef4444; font-size:13px;">🏍️ OBEN RORR (ELECTRIC RED)</strong>
        <div style="margin-top:6px; font-size:11px; color:#cbd5e1; line-height:1.5;">
          Speed: <b>${speed ?? 0} km/h</b><br/>
          Battery: <b>${SOC ?? 0}%</b> (${batteryVoltage ?? 0}V)<br/>
          Ignition: <b>${ignitionStatus ? "ON" : "OFF"}</b>
        </div>
      </div>
    `);
    markerRef.current = marker;

    // Accuracy Circle
    const accuracyCircle = L.circle([initialLat, initialLng], {
      radius: 35,
      color: "#ef4444",
      weight: 1,
      fillColor: "#ef4444",
      fillOpacity: 0.08,
      interactive: false,
    }).addTo(map);
    accuracyCircleRef.current = accuracyCircle;

    // Live Rolling Trail Polyline
    const trail = L.polyline([], {
      color: "#ef4444",
      weight: 4,
      opacity: 0.8,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);
    trailRef.current = trail;

    mapRef.current = map;

    // Auto-fit observer
    const refreshMap = () => mapRef.current?.invalidateSize(false);
    const timers = [
      setTimeout(refreshMap, 100),
      setTimeout(refreshMap, 400),
      setTimeout(refreshMap, 1000),
    ];

    let observer = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(refreshMap);
      observer.observe(mapContainerRef.current);
    }

    return () => {
      timers.forEach(clearTimeout);
      if (observer) observer.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ===================================================
  // UPDATE LIVE BIKE POSITION
  // ===================================================

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !validPosition) return;

    const pos = [latitude, longitude];
    markerRef.current.setLatLng(pos);
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setLatLng(pos);
    }

    markerRef.current.setPopupContent(`
      <div style="font-family:sans-serif; color:#fff; background:#0B0C11; padding:10px; border-radius:12px; border:1px solid #ef4444;">
        <strong style="color:#ef4444; font-size:13px;">🏍️ OBEN RORR (ELECTRIC RED)</strong>
        <div style="margin-top:6px; font-size:11px; color:#cbd5e1; line-height:1.5;">
          Speed: <b>${speed ?? 0} km/h</b><br/>
          Battery: <b>${SOC ?? 0}%</b> (${batteryVoltage ?? 0}V)<br/>
          Ignition: <b>${ignitionStatus ? "ON" : "OFF"}</b><br/>
          Odometer: <b>${odometer ?? 0} km</b>
        </div>
      </div>
    `);

    // Only pan if in live view mode
    if (viewMode === "live") {
      mapRef.current.panTo(pos, { animate: true, duration: 0.5 });
    }
  }, [latitude, longitude, validPosition, speed, SOC, batteryVoltage, ignitionStatus, odometer, viewMode]);

  // ===================================================
  // GEOFENCE RENDERING
  // ===================================================

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (
      typeof geofence?.lat === "number" &&
      typeof geofence?.lng === "number" &&
      geofence?.enabled
    ) {
      const gPos = [geofence.lat, geofence.lng];

      // Geofence Circle
      if (!geofenceCircleRef.current) {
        geofenceCircleRef.current = L.circle(gPos, {
          radius: Number(geofence.radius) || 500,
          color: "#f43f5e",
          weight: 2,
          fillColor: "#f43f5e",
          fillOpacity: 0.12,
          dashArray: "6, 6",
        }).addTo(map);
      } else {
        geofenceCircleRef.current.setLatLng(gPos);
        geofenceCircleRef.current.setRadius(Number(geofence.radius) || 500);
      }

      // Geofence Center Pin
      if (!geofenceMarkerRef.current) {
        const gm = L.marker(gPos, { icon: geofenceIcon, draggable: true }).addTo(map);
        gm.bindTooltip("Drag pin to relocate geofence", { direction: "top", offset: [0, -16] });
        gm.on("dragend", (e) => {
          const p = e.target.getLatLng();
          if (onGeofenceMove) onGeofenceMove(p.lat, p.lng);
        });
        geofenceMarkerRef.current = gm;
      } else {
        geofenceMarkerRef.current.setLatLng(gPos);
      }
    } else {
      if (geofenceCircleRef.current) {
        geofenceCircleRef.current.remove();
        geofenceCircleRef.current = null;
      }
      if (geofenceMarkerRef.current) {
        geofenceMarkerRef.current.remove();
        geofenceMarkerRef.current = null;
      }
    }
  }, [geofence?.lat, geofence?.lng, geofence?.radius, geofence?.enabled, onGeofenceMove]);

  // ===================================================
  // ROUTE-WISE TRIP PATH RENDERING (SELECTED TRIP)
  // ===================================================

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear previous route layers
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }
    if (startMarkerRef.current) {
      startMarkerRef.current.remove();
      startMarkerRef.current = null;
    }
    if (endMarkerRef.current) {
      endMarkerRef.current.remove();
      endMarkerRef.current = null;
    }

    if (viewMode !== "routes" || !currentTripToDisplay) return;

    const points = currentTripToDisplay.points || [];
    if (!Array.isArray(points) || points.length < 2) return;

    const coords = points
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
      .map((p) => [p.lat, p.lng]);

    if (coords.length < 2) return;

    // 1. Draw Glowing Volcanic Red Route Polyline
    const polyline = L.polyline(coords, {
      color: "#EF4444",
      weight: 5,
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);
    routePolylineRef.current = polyline;

    // 2. Add Start Marker (Point A)
    const startPoint = coords[0];
    const startMarker = L.marker(startPoint, {
      icon: startPointIcon,
      zIndexOffset: 900,
    }).addTo(map);

    startMarker.bindPopup(`
      <div style="font-family:sans-serif; color:#fff; background:#0B0C11; padding:8px 12px; border-radius:10px; border:1px solid #10b981;">
        <span style="color:#10b981; font-weight:bold; font-size:12px;">🟢 START POINT</span>
        <div style="font-size:11px; color:#cbd5e1; margin-top:4px;">
          ${currentTripToDisplay.startLocationName || "Origin"}<br/>
          Time: <b>${currentTripToDisplay.startTime ? new Date(currentTripToDisplay.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}</b><br/>
          Start SOC: <b>${currentTripToDisplay.startSoc ?? "--"}%</b>
        </div>
      </div>
    `);
    startMarkerRef.current = startMarker;

    // 3. Add Destination Marker (Point B / Finish)
    const endPoint = coords[coords.length - 1];
    const endMarker = L.marker(endPoint, {
      icon: endPointIcon,
      zIndexOffset: 950,
    }).addTo(map);

    endMarker.bindPopup(`
      <div style="font-family:sans-serif; color:#fff; background:#0B0C11; padding:8px 12px; border-radius:10px; border:1px solid #ef4444;">
        <span style="color:#ef4444; font-weight:bold; font-size:12px;">🏁 DESTINATION</span>
        <div style="font-size:11px; color:#cbd5e1; margin-top:4px;">
          ${currentTripToDisplay.endLocationName || "Destination"}<br/>
          Distance: <b>${currentTripToDisplay.distanceKm || currentTripToDisplay.tripDistance || 0} km</b><br/>
          Duration: <b>${currentTripToDisplay.durationMinutes || currentTripToDisplay.sessionDurationMinutes || 0} min</b><br/>
          Top Speed: <b>${currentTripToDisplay.topSpeed || currentTripToDisplay.maxSpeed || 0} km/h</b>
        </div>
      </div>
    `);
    endMarkerRef.current = endMarker;

    // 4. Smoothly Zoom & Fit Bounds to show full route from Point A to Point B
    try {
      map.fitBounds(polyline.getBounds(), {
        padding: [60, 60],
        maxZoom: 16,
      });
    } catch (e) {
      console.warn("Could not fitBounds to route:", e);
    }
  }, [viewMode, currentTripToDisplay]);

  // ===================================================
  // ACTIVE ONGOING TRIP REAL-TIME TRAIL
  // ===================================================

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (liveTripPolylineRef.current) {
      liveTripPolylineRef.current.remove();
      liveTripPolylineRef.current = null;
    }

    if (activeTrip && Array.isArray(activeTrip.points) && activeTrip.points.length > 1) {
      const coords = activeTrip.points
        .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
        .map((p) => [p.lat, p.lng]);

      if (coords.length > 1) {
        const liveLine = L.polyline(coords, {
          color: "#F59E0B",
          weight: 4,
          dashArray: "6, 8",
          opacity: 0.9,
        }).addTo(map);
        liveTripPolylineRef.current = liveLine;
      }
    }
  }, [activeTrip]);

  // ===================================================
  // CONTROLS & ACTIONS
  // ===================================================

  const centerOnBike = useCallback(() => {
    if (!mapRef.current || !validPosition) return;
    mapRef.current.setView([latitude, longitude], 16, { animate: true });
    setViewMode("live");
  }, [latitude, longitude, validPosition]);

  const locateUserDevice = useCallback(() => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        mapRef.current.setView([lat, lng], 16, { animate: true });
      },
      (err) => console.warn("User geolocation denied:", err),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!fullscreenRef.current) return;
    if (!document.fullscreenElement) {
      fullscreenRef.current.requestFullscreen().catch((err) => console.warn(err));
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
    }
  }, []);

  const selectTripAndFocus = (t) => {
    setInternalSelectedTrip(t);
    setViewMode("routes");
    if (onSelectTrip) onSelectTrip(t);
  };

  return (
    <GlassCard className="flex flex-col p-2 w-full min-h-[520px]" hover={false}>
      <div
        ref={fullscreenRef}
        className="relative flex flex-col h-[540px] sm:h-[620px] lg:h-[700px] w-full bg-[#0b0f14] rounded-2xl overflow-hidden"
      >
        {/* =================================================
            TOP HEADER CONTROL BAR
        ================================================= */}
        <div className="relative z-[2000] px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 bg-black/80 backdrop-blur-xl border-b border-red-500/20">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 bg-red-600/20 rounded-xl border border-red-500/30 text-red-400 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm font-bold text-white truncate">
                  {viewMode === "routes" && currentTripToDisplay
                    ? (currentTripToDisplay.title || `${currentTripToDisplay.startLocationName || "Origin"} ➔ ${currentTripToDisplay.endLocationName || "Destination"}`)
                    : (address || "Live Motorcycle Position")}
                </p>
                {activeTrip && (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-mono font-bold animate-pulse shrink-0">
                    RECORDING RIDE
                  </span>
                )}
              </div>
              <p className="text-[9px] sm:text-[10px] font-mono text-slate-400">
                {viewMode === "routes" && currentTripToDisplay
                  ? `${currentTripToDisplay.distanceKm || 0} km • ${currentTripToDisplay.durationMinutes || 0} min • Top: ${currentTripToDisplay.topSpeed || 0} km/h`
                  : (validPosition ? `${latitude.toFixed(6)}° N, ${longitude.toFixed(6)}° E` : "Awaiting GPS Satellites...")}
              </p>
            </div>
          </div>

          {/* VIEW MODE TOGGLE BUTTONS */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="p-1 rounded-xl bg-black/60 border border-white/10 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("live")}
                className={`
                  px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5
                  ${viewMode === "live"
                    ? "bg-red-600 text-white shadow-md shadow-red-600/40"
                    : "text-slate-400 hover:text-white hover:bg-white/5"}
                `}
              >
                <span className={`w-2 h-2 rounded-full ${viewMode === "live" ? "bg-white animate-pulse" : "bg-red-500"}`} />
                <span className="hidden sm:inline">Live Bike</span>
                <span className="sm:hidden">Live</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("routes")}
                className={`
                  px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5
                  ${viewMode === "routes"
                    ? "bg-red-600 text-white shadow-md shadow-red-600/40"
                    : "text-slate-400 hover:text-white hover:bg-white/5"}
                `}
              >
                <Route className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Route Trips</span>
                <span className="sm:hidden">Trips</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[9px]">
                  {trips.length}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={centerOnBike}
              disabled={!validPosition}
              title="Center on bike"
              className="p-2 rounded-xl border border-white/10 bg-black/40 text-slate-300 hover:text-white hover:border-red-500/40 transition disabled:opacity-30"
            >
              <LocateFixed className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              title="Fullscreen"
              className="p-2 rounded-xl border border-white/10 bg-black/40 text-slate-300 hover:text-white hover:border-red-500/40 transition"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =================================================
            MAP CONTAINER
        ================================================= */}
        <div className="relative flex-1 min-h-[420px] w-full h-full">
          <ErrorBoundary>
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0 min-h-[420px]" />
          </ErrorBoundary>

          {/* =================================================
              ACTIVE ONGOING RIDE NOTIFICATION BANNER
          ================================================= */}
          {activeTrip && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 rounded-2xl bg-gradient-to-r from-red-950 via-black to-red-950 border border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center gap-3 backdrop-blur-xl animate-bounce-subtle">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <span className="text-red-400">LOGGING TRIP:</span>
                <span>{activeTrip.distanceKm || 0} km</span>
                <span className="text-slate-400">•</span>
                <span>Top: {activeTrip.topSpeed || 0} km/h</span>
              </div>
            </div>
          )}

          {/* =================================================
              LIVE HUD METRICS (WHEN IN LIVE MODE)
          ================================================= */}
          {viewMode === "live" && (
            <>
              {/* SPEED & BATTERY GAUGE (TOP LEFT) */}
              <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
                <div className="px-3.5 py-2 rounded-2xl border border-red-500/20 bg-black/80 backdrop-blur-xl shadow-lg">
                  <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    <Gauge className="w-3.5 h-3.5 text-red-400" />
                    <span>Speed</span>
                  </div>
                  <div className="text-xl font-black font-mono text-white mt-0.5">
                    {speed ?? 0} <span className="text-xs text-red-400 font-normal">km/h</span>
                  </div>
                </div>

                <div className="px-3.5 py-2 rounded-2xl border border-emerald-500/20 bg-black/80 backdrop-blur-xl shadow-lg">
                  <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Battery</span>
                  </div>
                  <div className="text-xl font-black font-mono text-white mt-0.5">
                    {SOC ?? 0}%
                  </div>
                </div>
              </div>

              {/* IGNITION STATUS (TOP RIGHT) */}
              <div className="absolute top-3 right-3 z-[1000] px-3.5 py-2 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-lg">
                <div className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">
                  Bike State
                </div>
                <div className={`text-xs font-bold font-mono mt-0.5 flex items-center gap-1.5 ${ignitionStatus ? "text-emerald-400" : "text-slate-400"}`}>
                  <span className={`w-2 h-2 rounded-full ${ignitionStatus ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                  {ignitionStatus ? "IGNITION ON" : "PARKED"}
                </div>
              </div>

              {/* TELEMETRY FOOTER (BOTTOM LEFT) */}
              <div className="absolute left-3 bottom-3 z-[1000] flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-2xl border border-white/10 bg-black/85 backdrop-blur-xl text-slate-300 text-[10px] font-mono shadow-lg">
                <div className="flex items-center gap-1 text-slate-400">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{batteryVoltage ?? 0}V</span>
                </div>
                <div className="h-3 w-px bg-white/20" />
                <div>Odo: <strong className="text-white">{odometer ?? 0} km</strong></div>
              </div>
            </>
          )}

          {/* =================================================
              TRIP ROUTE SELECTOR & HUD (WHEN IN ROUTES MODE)
          ================================================= */}
          {viewMode === "routes" && (
            <div className="absolute inset-x-3 bottom-3 z-[1000] flex flex-col gap-2">
              {/* TRIP SELECTOR PILLS */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {trips.map((t, idx) => {
                  const isSelected = currentTripToDisplay?.tripId === t.tripId || (!currentTripToDisplay && idx === 0);
                  const title = t.title || (t.startLocationName && t.endLocationName ? `${t.startLocationName} ➔ ${t.endLocationName}` : `Trip #${idx + 1}`);

                  return (
                    <button
                      key={t.tripId || idx}
                      type="button"
                      onClick={() => selectTripAndFocus(t)}
                      className={`
                        shrink-0 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2
                        ${isSelected
                          ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/40 scale-102"
                          : "bg-black/80 text-slate-300 border-white/10 hover:border-red-500/40 hover:text-white"}
                      `}
                    >
                      <Route className="w-3.5 h-3.5" />
                      <span className="line-clamp-1 max-w-[160px] sm:max-w-[220px]">{title}</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-black/40 text-[10px] font-mono">
                        {t.distanceKm || t.tripDistance || 0} km
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* DETAILED ROUTE HUD OVERLAY CARD */}
              {currentTripToDisplay && (
                <div className="p-3 sm:p-4 rounded-2xl bg-black/90 border border-red-500/30 backdrop-blur-2xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {currentTripToDisplay.startLocationName || "Start Location"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {currentTripToDisplay.endLocationName || "Destination"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-mono text-slate-400">
                      <span>{currentTripToDisplay.startTime ? new Date(currentTripToDisplay.startTime).toLocaleDateString([], { month: "short", day: "numeric" }) : "Recorded Trip"}</span>
                      <span>•</span>
                      <span>{currentTripToDisplay.durationMinutes || currentTripToDisplay.sessionDurationMinutes || 15} minutes duration</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                    <div className="text-center px-2">
                      <span className="text-[9px] text-slate-500 uppercase block font-mono">DISTANCE</span>
                      <span className="text-sm sm:text-base font-black font-mono text-red-400">
                        {currentTripToDisplay.distanceKm || currentTripToDisplay.tripDistance || 0} km
                      </span>
                    </div>

                    <div className="text-center px-2">
                      <span className="text-[9px] text-slate-500 uppercase block font-mono">TOP SPEED</span>
                      <span className="text-sm sm:text-base font-black font-mono text-amber-400">
                        {currentTripToDisplay.topSpeed || currentTripToDisplay.maxSpeed || 0} km/h
                      </span>
                    </div>

                    <div className="text-center px-2">
                      <span className="text-[9px] text-slate-500 uppercase block font-mono">AVG SPEED</span>
                      <span className="text-sm sm:text-base font-black font-mono text-sky-400">
                        {currentTripToDisplay.avgSpeed || currentTripToDisplay.averageSpeed || 0} km/h
                      </span>
                    </div>

                    {currentTripToDisplay.socConsumed !== undefined && (
                      <div className="text-center px-2">
                        <span className="text-[9px] text-slate-500 uppercase block font-mono">BATTERY</span>
                        <span className="text-sm sm:text-base font-black font-mono text-emerald-400">
                          -{currentTripToDisplay.socConsumed}%
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setViewMode("live")}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
                    >
                      Back to Live
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}