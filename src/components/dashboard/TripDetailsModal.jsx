import { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Crosshair,
  Info,
  Battery,
  Zap,
  Gauge,
  TrendingUp,
  Smile,
  Bell,
  Lock,
  IndianRupee,
  Route,
  Share2,
} from "lucide-react";
import ErrorBoundary from "../common/ErrorBoundary";

// Custom Leaflet icons matching official Oben Electric design
const startPinIcon = L.divIcon({
  className: "oben-app-start-pin",
  html: `
    <div style="
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #10B981;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ffffff;
      "></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

const endPinIcon = L.divIcon({
  className: "oben-app-end-pin",
  html: `
    <div style="
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #2563EB;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ffffff;
      "></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

/**
 * Pixel-Perfect Replica of Oben Electric's official "Trip Details" screen
 * Based directly on decompiled (main)/tripDetails.tsx & client screenshots.
 */
export default function TripDetailsModal({
  trip,
  onClose,
  liveData = null,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylineRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);

  const [activeInfoTooltip, setActiveInfoTooltip] = useState(null);

  // Parse metrics & fallbacks
  const distance = Number(trip?.distanceKm ?? trip?.tripDistance ?? trip?.distance ?? 0);
  const durationFormatted =
    trip?.durationFormatted ||
    (trip?.durationMinutes
      ? `${String(Math.floor(trip.durationMinutes / 60)).padStart(2, "0")} hrs ${String(trip.durationMinutes % 60).padStart(2, "0")} mins`
      : "00 hrs 25 mins");

  const socConsumed = trip?.socConsumed ?? (trip?.startSoc && trip?.endSoc ? trip.startSoc - trip.endSoc : 18);
  const avgSpeed = trip?.avgSpeed ?? trip?.averageSpeed ?? 42;
  const maxSpeed = trip?.topSpeed ?? trip?.maxSpeed ?? 85;

  // Petrol vs EV Net Savings (Oben calculation formula: ~INR 2.28 saved per km)
  const netSavings = trip?.netSavings
    ? Number(trip.netSavings).toFixed(2)
    : (distance * 2.28).toFixed(2);

  // Start & End Timestamps
  const startDate = trip?.startTime ? new Date(trip.startTime) : new Date();
  const endDate = trip?.endTime ? new Date(trip.endTime) : new Date(startDate.getTime() + 25 * 60000);

  const startTimeStr = startDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase();

  const endTimeStr = endDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase();

  // Addresses
  const startAddress =
    trip?.startAddress ||
    trip?.startLocationName ||
    "Kumara Park West, Guttahalli , Bengaluru, Bangalore Division, Karnataka, India-560020";

  const endAddress =
    trip?.endAddress ||
    trip?.endLocationName ||
    "Kumara Park West, Guttahalli , Bengaluru, Bangalore Division, Karnataka, India-560020";

  // Ride tip
  const rideTip =
    trip?.rideTip ||
    "Do not over accelerate or apply harsh braking";

  // Battery & Bike status (from liveData or session trip)
  const batterySoc = liveData?.soc ?? trip?.startSoc ?? 36;
  const isIgnitionOn = liveData?.ignition ?? false;

  // Extract Route Coordinates
  const routePoints = useMemo(() => {
    if (Array.isArray(trip?.points) && trip.points.length > 0) {
      return trip.points
        .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
        .map((p) => [p.lat, p.lng]);
    }
    // Default fallback route coordinates
    return [
      [12.9978, 77.5801],
      [13.0125, 77.5862],
      [13.0358, 77.5912],
      [13.0725, 77.6045],
      [13.1152, 77.6254],
      [13.1582, 77.6582],
      [13.1986, 77.7066],
    ];
  }, [trip]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = routePoints.length > 0 ? routePoints[0] : [12.9978, 77.5801];

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(initialCenter, 13);

      // Light/Streets tile layer matching Oben's Google Maps look
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing layers
    if (polylineRef.current) map.removeLayer(polylineRef.current);
    if (startMarkerRef.current) map.removeLayer(startMarkerRef.current);
    if (endMarkerRef.current) map.removeLayer(endMarkerRef.current);

    if (routePoints.length > 1) {
      // Vibrant Solid Blue Route line matching Oben screenshot (#2563EB / #1D4ED8)
      const polyline = L.polyline(routePoints, {
        color: "#1D4ED8",
        weight: 6,
        opacity: 0.95,
        lineJoin: "round",
        lineCap: "round",
      }).addTo(map);

      polylineRef.current = polyline;

      // Start pin (Green)
      const startPoint = routePoints[0];
      const startMarker = L.marker(startPoint, { icon: startPinIcon }).addTo(map);
      startMarkerRef.current = startMarker;

      // End pin (Blue)
      const endPoint = routePoints[routePoints.length - 1];
      const endMarker = L.marker(endPoint, { icon: endPinIcon }).addTo(map);
      endMarkerRef.current = endMarker;

      try {
        const bounds = polyline.getBounds();
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } catch (err) {
        map.setView(startPoint, 13);
      }
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      // cleanup on unmount
    };
  }, [routePoints]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && polylineRef.current) {
      try {
        mapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), {
          padding: [40, 40],
          maxZoom: 15,
        });
      } catch (e) {
        if (routePoints.length > 0) {
          mapInstanceRef.current.setView(routePoints[0], 13);
        }
      }
    }
  };

  const metricCards = [
    {
      id: "distance",
      title: "DISTANCE",
      value: `${distance} km`,
      icon: Route,
      info: "Total GPS distance logged during this session.",
    },
    {
      id: "duration",
      title: "DURATION",
      value: durationFormatted,
      icon: Clock,
      info: "Active ignition time from start to park.",
    },
    {
      id: "soc",
      title: "SOC CONSUMPTION",
      value: `${socConsumed} %`,
      icon: Battery,
      info: "State of Charge consumed from battery pack.",
    },
    {
      id: "savings",
      title: "NET SAVINGS",
      value: `INR ${netSavings}`,
      icon: IndianRupee,
      info: "Money saved compared to equivalent 150cc petrol motorcycle.",
    },
    {
      id: "avgSpeed",
      title: "AVERAGE SPEED",
      value: `${avgSpeed} km/h`,
      icon: Gauge,
      info: "Mean ground speed throughout the ride.",
    },
    {
      id: "maxSpeed",
      title: "MAX SPEED",
      value: `${maxSpeed} km/h`,
      icon: Zap,
      info: "Peak instantaneous speed reached.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4">
      {/* Container simulating official mobile client viewport */}
      <div className="w-full max-w-md sm:max-w-lg min-h-screen sm:min-h-0 sm:rounded-3xl bg-[#F8FAFC] text-slate-800 shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* =========================================================
            HEADER (OBEN APP HEADER)
        ========================================================= */}
        <header className="bg-black text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-white hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            <span className="text-base font-bold tracking-tight">Trip Details</span>
          </button>

          {/* Right Status Group */}
          <div className="flex items-center gap-2">
            {/* Battery Pill */}
            <div className="flex items-center gap-1 bg-[#1E232E] border border-slate-700 px-2 py-0.5 rounded-lg text-xs font-mono font-bold text-amber-400">
              <span>{batterySoc}</span>
              <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
            </div>

            {/* Lock / Ignition State */}
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-300">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>{isIgnitionOn ? "ON" : "OFF"}</span>
            </div>

            {/* Notification Bell Badge */}
            <div className="relative p-1">
              <Bell className="w-4 h-4 text-slate-300" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold rounded-full px-1">
                99+
              </span>
            </div>
          </div>
        </header>

        {/* =========================================================
            MAP SECTION WITH FLOATING RECENTER BUTTON
        ========================================================= */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-200">
          <ErrorBoundary>
            <div ref={mapContainerRef} className="w-full h-full z-0" />
          </ErrorBoundary>

          {/* Crosshair / Recenter Button */}
          <button
            type="button"
            onClick={handleRecenter}
            title="Recenter on route"
            className="absolute top-3 right-3 z-[1000] p-2 rounded-full bg-black/80 hover:bg-black text-white shadow-lg border border-white/20 transition active:scale-90"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Map branding pill */}
          <div className="absolute bottom-2 left-2 z-[1000] px-2 py-0.5 rounded bg-white/90 text-[10px] font-bold text-slate-700 shadow-sm border border-slate-200">
            Oben Argus GPS Trace
          </div>
        </div>

        {/* =========================================================
            BODY CONTENT
        ========================================================= */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* =======================================================
              START & END ADDRESS TIMELINE
          ======================================================= */}
          <div className="space-y-3">
            {/* START CARD */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Start Time:</span>
                <strong className="text-slate-900 font-bold">{startTimeStr}</strong>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {startAddress}
              </p>
            </div>

            {/* VERTICAL DOTTED CONNECTOR */}
            <div className="flex items-center pl-6">
              <div className="border-l-2 border-dotted border-slate-300 h-4" />
            </div>

            {/* END CARD */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>End Time:</span>
                <strong className="text-slate-900 font-bold">{endTimeStr}</strong>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {endAddress}
              </p>
            </div>
          </div>

          {/* =======================================================
              TIP TO IMPROVE RIDE (AMBER OUTLINE BANNER)
          ======================================================= */}
          <div className="p-3.5 rounded-2xl bg-white border-2 border-amber-400 shadow-xs flex items-start gap-3">
            <div className="p-1 rounded-lg bg-amber-50 text-amber-600 mt-0.5">
              <Smile className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 tracking-tight">
                Tip to improve ride
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                {rideTip}
              </p>
            </div>
          </div>

          {/* =======================================================
              METRIC CARDS GRID (3 COLUMNS X 2 ROWS)
          ======================================================= */}
          <div className="grid grid-cols-3 gap-2.5">
            {metricCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between min-h-[92px] relative group"
                >
                  <div className="flex items-start justify-between">
                    <Icon className="w-4 h-4 text-slate-600" />
                    <button
                      type="button"
                      onClick={() => setActiveInfoTooltip(activeInfoTooltip === card.id ? null : card.id)}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  </div>

                  {activeInfoTooltip === card.id && (
                    <div className="absolute top-8 right-2 left-2 z-10 p-2 rounded-lg bg-slate-900 text-white text-[10px] leading-tight shadow-xl">
                      {card.info}
                    </div>
                  )}

                  <div className="mt-2">
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block truncate">
                      {card.title}
                    </span>
                    <p className="text-xs sm:text-sm font-black text-slate-900 font-mono mt-0.5 truncate">
                      {card.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-black hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
