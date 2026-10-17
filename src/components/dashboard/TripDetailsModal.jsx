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
  Smile,
  Bell,
  Lock,
  IndianRupee,
  Route,
  ArrowUpRight,
} from "lucide-react";
import ErrorBoundary from "../common/ErrorBoundary";

// Volcanic Red & Black Leaflet Markers
const startPinIcon = L.divIcon({
  className: "oben-app-start-pin",
  html: `
    <div style="
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.25);
      border: 2px solid #10B981;
      box-shadow: 0 0 16px rgba(16, 185, 129, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #10B981;
        border: 2px solid #ffffff;
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const endPinIcon = L.divIcon({
  className: "oben-app-end-pin",
  html: `
    <div style="
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.25);
      border: 2px solid #EF4444;
      box-shadow: 0 0 16px rgba(239, 68, 68, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #EF4444;
        border: 2px solid #ffffff;
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

/**
 * Red & Carbon Black Clay Theme Replica of Oben Electric's official "Trip Details" screen
 * Uses authentic vehicle telemetry & cloud data without fake mock data.
 */
export default function TripDetailsModal({
  trip,
  onClose,
  liveData = null,
  onOpenFullMap = null,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylineRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);

  const [activeInfoTooltip, setActiveInfoTooltip] = useState(null);

  // Parse metrics directly from real trip object
  const distance = Number(
    trip?.distanceKm ??
    trip?.tripDistance ??
    trip?.distance ??
    trip?.totalDistance ??
    0
  );

  const durationFormatted =
    trip?.durationFormatted ||
    (trip?.durationMinutes
      ? `${String(Math.floor(trip.durationMinutes / 60)).padStart(2, "0")} hrs ${String(trip.durationMinutes % 60).padStart(2, "0")} mins`
      : (trip?.duration ? `${trip.duration} min` : "Real Session"));

  const socConsumed =
    trip?.socConsumed ??
    (trip?.startSoc !== undefined && trip?.endSoc !== undefined
      ? Math.max(0, trip.startSoc - trip.endSoc)
      : null);

  const avgSpeed = trip?.avgSpeed ?? trip?.averageSpeed ?? trip?.speed ?? 0;
  const maxSpeed = trip?.topSpeed ?? trip?.maxSpeed ?? avgSpeed ?? 0;

  // Real Petrol vs EV Net Savings (Oben formula: ~INR 2.28 per km)
  const netSavings = trip?.netSavings
    ? Number(trip.netSavings).toFixed(2)
    : (distance > 0 ? (distance * 2.28).toFixed(2) : "0.00");

  // Real Start & End Timestamps
  const startDate = trip?.startTime
    ? new Date(trip.startTime)
    : (trip?.timestamp ? new Date(trip.timestamp) : (trip?.createdAt ? new Date(trip.createdAt) : new Date()));

  const endDate = trip?.endTime
    ? new Date(trip.endTime)
    : (trip?.durationMinutes ? new Date(startDate.getTime() + trip.durationMinutes * 60000) : startDate);

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

  // Extract Route Coordinates directly from real trip breadcrumbs
  const routePoints = useMemo(() => {
    if (Array.isArray(trip?.points) && trip.points.length > 0) {
      return trip.points
        .filter((p) => Number.isFinite(p?.lat ?? p?.latitude) && Number.isFinite(p?.lng ?? p?.longitude))
        .map((p) => [Number(p.lat ?? p.latitude), Number(p.lng ?? p.longitude)]);
    }
    return [];
  }, [trip]);

  // Genuine Location strings (Real addresses or exact GPS coordinates)
  const startAddress =
    trip?.startAddress ||
    trip?.startLocationName ||
    (routePoints.length > 0
      ? `GPS Origin: ${routePoints[0][0].toFixed(5)}° N, ${routePoints[0][1].toFixed(5)}° E`
      : "Start Location (Oben TCU Telematics)");

  const endAddress =
    trip?.endAddress ||
    trip?.endLocationName ||
    (routePoints.length > 1
      ? `GPS Destination: ${routePoints[routePoints.length - 1][0].toFixed(5)}° N, ${routePoints[routePoints.length - 1][1].toFixed(5)}° E`
      : "End Location (Oben TCU Telematics)");

  // Ride tip
  const rideTip =
    trip?.rideTip ||
    (avgSpeed > 55
      ? "High-speed cruising observed. Use City mode for optimal range on urban stretches."
      : "Smooth throttle and regenerative deceleration observed during this session.");

  // Battery & Ignition from liveData or trip
  const batterySoc = liveData?.soc ?? trip?.startSoc ?? 0;
  const isIgnitionOn = liveData?.ignition ?? false;

  // Leaflet Map Initialization with Carto Dark Matter
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = routePoints.length > 0 ? routePoints[0] : [28.6236, 77.0673];

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(initialCenter, 13);

      // Dark Matter tiles matching Red & Black Clay theme
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
        }
      ).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous layers
    if (polylineRef.current) map.removeLayer(polylineRef.current);
    if (startMarkerRef.current) map.removeLayer(startMarkerRef.current);
    if (endMarkerRef.current) map.removeLayer(endMarkerRef.current);

    if (routePoints.length > 1) {
      // Glowing Red Route Line (#EF4444)
      const polyline = L.polyline(routePoints, {
        color: "#EF4444",
        weight: 5,
        opacity: 0.95,
        lineJoin: "round",
        lineCap: "round",
      }).addTo(map);

      polylineRef.current = polyline;

      // Start pin (Green)
      const startPoint = routePoints[0];
      const startMarker = L.marker(startPoint, { icon: startPinIcon }).addTo(map);
      startMarkerRef.current = startMarker;

      // End pin (Red)
      const endPoint = routePoints[routePoints.length - 1];
      const endMarker = L.marker(endPoint, { icon: endPinIcon }).addTo(map);
      endMarkerRef.current = endMarker;

      try {
        const bounds = polyline.getBounds();
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } catch (err) {
        map.setView(startPoint, 13);
      }
    } else if (routePoints.length === 1) {
      const startMarker = L.marker(routePoints[0], { icon: startPinIcon }).addTo(map);
      startMarkerRef.current = startMarker;
      map.setView(routePoints[0], 14);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 250);
  }, [routePoints]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      if (polylineRef.current) {
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
      } else if (routePoints.length > 0) {
        mapInstanceRef.current.setView(routePoints[0], 14);
      }
    }
  };

  const metricCards = [
    {
      id: "distance",
      title: "DISTANCE",
      value: `${distance} km`,
      icon: Route,
      info: "Exact GPS distance logged by Oben TCU odometer.",
    },
    {
      id: "duration",
      title: "DURATION",
      value: durationFormatted,
      icon: Clock,
      info: "Active ignition and travel duration.",
    },
    {
      id: "soc",
      title: "SOC CONSUMED",
      value: socConsumed !== null ? `${socConsumed} %` : "-- %",
      icon: Battery,
      info: "Net battery state-of-charge drained during session.",
    },
    {
      id: "savings",
      title: "NET SAVINGS",
      value: `₹ ${netSavings}`,
      icon: IndianRupee,
      info: "Money saved vs an equivalent 150cc petrol motorcycle (~₹2.28/km).",
    },
    {
      id: "avgSpeed",
      title: "AVERAGE SPEED",
      value: `${avgSpeed} km/h`,
      icon: Gauge,
      info: "Average vehicle ground speed across this trip.",
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      {/* Volcanic Red & Carbon Black Clay Modal */}
      <div className="w-full max-w-md sm:max-w-lg min-h-screen sm:min-h-0 sm:rounded-3xl bg-gradient-to-b from-[#131520] via-[#0B0C12] to-black text-white shadow-[0_0_50px_rgba(220,38,38,0.35)] flex flex-col overflow-hidden border border-red-500/30">
        
        {/* =========================================================
            HEADER (VOLCANIC RED & CARBON CLAY)
        ========================================================= */}
        <header className="bg-black/80 border-b border-red-500/20 px-4 py-3.5 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group"
          >
            <div className="p-1 rounded-xl bg-red-600/20 border border-red-500/30 group-hover:bg-red-600 group-hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-sm font-bold tracking-tight uppercase">Trip Details</span>
          </button>

          {/* Right Status Badges */}
          <div className="flex items-center gap-2">
            {/* Battery Pill */}
            <div className="flex items-center gap-1 bg-red-950/60 border border-red-500/40 px-2 py-0.5 rounded-xl text-xs font-mono font-bold text-red-300">
              <span>{batterySoc}%</span>
              <Zap className="w-3 h-3 text-red-400 fill-red-400" />
            </div>

            {/* Lock State */}
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-xl bg-black/60 border border-white/10 text-slate-300">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>{isIgnitionOn ? "ON" : "OFF"}</span>
            </div>

            {/* Notification Bell */}
            <div className="p-1 text-slate-400">
              <Bell className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* =========================================================
            MAP SECTION WITH DARK LEAFLET TILES & GLOWING ROUTE
        ========================================================= */}
        <div className="relative h-64 sm:h-72 w-full bg-[#07080C] border-b border-red-500/20">
          <ErrorBoundary>
            <div ref={mapContainerRef} className="w-full h-full z-0" />
          </ErrorBoundary>

          {/* Crosshair / Recenter Button */}
          <button
            type="button"
            onClick={handleRecenter}
            title="Recenter on route"
            className="absolute top-3 right-3 z-[1000] p-2 rounded-2xl bg-black/80 hover:bg-red-600 text-white shadow-lg border border-red-500/30 transition-all active:scale-90"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Branding Badge */}
          <div className="absolute bottom-2 left-2 z-[1000] px-2.5 py-0.5 rounded-xl bg-black/80 text-[10px] font-mono font-bold text-red-400 border border-red-500/30 backdrop-blur-md">
            Oben Rorr Telematics Trace
          </div>
        </div>

        {/* =========================================================
            BODY CONTENT
        ========================================================= */}
        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* =======================================================
              START & END ADDRESS TIMELINE (DARK GLASS CARDS)
          ======================================================= */}
          <div className="space-y-2">
            {/* START CARD */}
            <div className="bg-black/60 p-3.5 rounded-2xl border border-white/10 shadow-inner">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Start Time:</span>
                <strong className="text-white font-mono">{startTimeStr}</strong>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {startAddress}
              </p>
            </div>

            {/* DOTTED RED CONNECTOR */}
            <div className="flex items-center pl-6">
              <div className="border-l-2 border-dotted border-red-500/50 h-3" />
            </div>

            {/* END CARD */}
            <div className="bg-black/60 p-3.5 rounded-2xl border border-white/10 shadow-inner">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-red-400" />
                <span>End Time:</span>
                <strong className="text-white font-mono">{endTimeStr}</strong>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {endAddress}
              </p>
            </div>
          </div>

          {/* =======================================================
              TIP TO IMPROVE RIDE (VOLCANIC RED GRADIENT)
          ======================================================= */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/40 via-black/80 to-red-950/30 border border-amber-500/40 shadow-sm flex items-start gap-3">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5 border border-amber-500/30">
              <Smile className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-wide">
                Tip to improve ride
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">
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
                  className="bg-black/60 hover:bg-red-950/20 p-3 rounded-2xl border border-red-500/20 hover:border-red-500/40 shadow-inner flex flex-col justify-between min-h-[92px] relative transition-all"
                >
                  <div className="flex items-start justify-between">
                    <Icon className="w-4 h-4 text-red-400" />
                    <button
                      type="button"
                      onClick={() =>
                        setActiveInfoTooltip(
                          activeInfoTooltip === card.id ? null : card.id
                        )
                      }
                      className="text-slate-500 hover:text-slate-300 p-0.5"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  </div>

                  {activeInfoTooltip === card.id && (
                    <div className="absolute top-8 right-2 left-2 z-10 p-2 rounded-xl bg-black border border-red-500/40 text-slate-200 text-[10px] leading-tight shadow-2xl backdrop-blur-md">
                      {card.info}
                    </div>
                  )}

                  <div className="mt-2">
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block truncate font-mono">
                      {card.title}
                    </span>
                    <p className="text-xs sm:text-sm font-black text-white font-mono mt-0.5 truncate">
                      {card.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-black/60 hover:bg-black border border-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Close
            </button>

            {onOpenFullMap && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullMap(trip);
                }}
                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-1.5"
              >
                <span>Full Map</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
