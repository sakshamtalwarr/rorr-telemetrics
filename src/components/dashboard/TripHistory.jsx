import { useEffect, useRef, useState, useMemo } from "react";
import {
  MapPin,
  Timer,
  Gauge,
  Clock,
  Navigation,
  TrendingUp,
  Zap,
  Activity,
  Layers,
  BarChart3,
  Sparkles,
} from "lucide-react";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

import GlassCard from "../common/GlassCard";
import ErrorBoundary from "../common/ErrorBoundary";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  parseObenDate,
  formatISTTime,
  formatISTDate,
} from "../../utils/dateUtils";
import { fetchRoadRoute } from "../../services/roadRouteService";
import { getTripRouteTitle } from "../../utils/locationUtils";
import { tripTracker } from "../../services/tripTrackerService";

const DEFAULT_LAT = 28.6139;
const DEFAULT_LNG = 77.2090;

export default function TripHistory({
  liveData,
  trips = [],
  onSelectTrip,
  tripFilter = null,
  onFilterChange = null,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylineRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);

  const [activeGraphMode, setActiveGraphMode] = useState("trips"); // "trips" | "live"
  const [selectedPreviewTrip, setSelectedPreviewTrip] = useState(() => (trips.length > 0 ? trips[0] : null));

  // Asynchronously fetch cloud GPS breadcrumbs for the selected preview trip
  const [cloudPoints, setCloudPoints] = useState(null);
  const [loadingCloudPath, setLoadingCloudPath] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setCloudPoints(null);

    if (!selectedPreviewTrip) return;

    if (Array.isArray(selectedPreviewTrip.points) && selectedPreviewTrip.points.length >= 2) {
      setCloudPoints(selectedPreviewTrip.points);
      return;
    }

    const tripId = selectedPreviewTrip.tripId || selectedPreviewTrip.id || selectedPreviewTrip._id;
    if (tripId) {
      setLoadingCloudPath(true);
      tripTracker
        .fetchAndNormalizeCloudTripPath(tripId)
        .then((pts) => {
          if (!cancelled) {
            setLoadingCloudPath(false);
            if (pts && pts.length >= 2) {
              setCloudPoints(pts);
            }
          }
        })
        .catch(() => {
          if (!cancelled) setLoadingCloudPath(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [selectedPreviewTrip]);

  useEffect(() => {
    if (!selectedPreviewTrip && trips.length > 0) {
      setSelectedPreviewTrip(trips[0]);
    }
  }, [trips, selectedPreviewTrip]);

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
  const minSoc =
    session.minSoc !== null && session.minSoc !== undefined
      ? session.minSoc
      : liveData?.soc || 0;
  const maxSoc =
    session.maxSoc !== null && session.maxSoc !== undefined
      ? session.maxSoc
      : liveData?.soc || 0;

  // Extract Route Coordinates (prioritizing real vehicle GPS breadcrumbs)
  const routeCoordinates = useMemo(() => {
    const rawList = cloudPoints || selectedPreviewTrip?.points;
    if (Array.isArray(rawList) && rawList.length >= 2) {
      const valid = rawList
        .map((p) => {
          let lat = Number(p.lat ?? p.latitude);
          let lng = Number(p.lng ?? p.longitude ?? p.lon);
          if (lat > 60 && lng < 40) {
            const temp = lat;
            lat = lng;
            lng = temp;
          }
          return [lat, lng];
        })
        .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0);

      if (valid.length >= 2) return valid;
    }

    let sLat = Number(selectedPreviewTrip?.startLatitude ?? selectedPreviewTrip?.startLocation?.coordinates?.[1]);
    let sLng = Number(selectedPreviewTrip?.startLongitude ?? selectedPreviewTrip?.startLocation?.coordinates?.[0]);
    let eLat = Number(selectedPreviewTrip?.endLatitude ?? selectedPreviewTrip?.endLocation?.coordinates?.[1]);
    let eLng = Number(selectedPreviewTrip?.endLongitude ?? selectedPreviewTrip?.endLocation?.coordinates?.[0]);

    if (sLat > 60 && sLng < 40) { const t = sLat; sLat = sLng; sLng = t; }
    if (eLat > 60 && eLng < 40) { const t = eLat; eLat = eLng; eLng = t; }

    if (Number.isFinite(sLat) && Number.isFinite(sLng) && sLat !== 0 && sLng !== 0) {
      if (Number.isFinite(eLat) && Number.isFinite(eLng) && eLat !== 0 && eLng !== 0) {
        return [[sLat, sLng], [eLat, eLng]];
      }
      return [[sLat, sLng]];
    }

    return routeHistory
      .filter(
        (point) =>
          Number.isFinite(point.latitude) && Number.isFinite(point.longitude) && point.latitude !== 0 && point.longitude !== 0
      )
      .map((point) => {
        let lat = Number(point.latitude);
        let lng = Number(point.longitude);
        if (lat > 60 && lng < 40) { const t = lat; lat = lng; lng = t; }
        return [lat, lng];
      });
  }, [selectedPreviewTrip, cloudPoints, routeHistory]);

  // Road snapping only when sparse endpoints exist without full breadcrumbs
  const [roadRoute, setRoadRoute] = useState([]);

  useEffect(() => {
    let cancelled = false;

    // 1. If we have real dense breadcrumbs, use them directly!
    if (routeCoordinates.length > 2) {
      setRoadRoute(routeCoordinates);
      return;
    }

    // 2. If only start & end points exist
    if (routeCoordinates.length === 2) {
      const [sLat, sLng] = routeCoordinates[0];
      const [eLat, eLng] = routeCoordinates[1];

      if (
        Number.isFinite(sLat) &&
        Number.isFinite(sLng) &&
        Number.isFinite(eLat) &&
        Number.isFinite(eLng) &&
        sLat !== 0 &&
        sLng !== 0 &&
        eLat !== 0 &&
        eLng !== 0
      ) {
        fetchRoadRoute(sLat, sLng, eLat, eLng).then((snapped) => {
          if (!cancelled && snapped && snapped.length > 0) {
            setRoadRoute(snapped);
          }
        });
        return;
      }
    }

    setRoadRoute([]);

    return () => {
      cancelled = true;
    };
  }, [routeCoordinates]);

  const activePath = roadRoute.length > 0 ? roadRoute : routeCoordinates;

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      if (mapContainerRef.current && mapContainerRef.current._leaflet_id) {
        delete mapContainerRef.current._leaflet_id;
      }

      const defaultCenter = [
        Number(liveData?.latitude) || DEFAULT_LAT,
        Number(liveData?.longitude) || DEFAULT_LNG,
      ];
      const center = activePath.length > 0 ? activePath[0] : defaultCenter;

      const map = L.map(mapContainerRef.current, {
        center,
        zoom: activePath.length > 0 ? 14 : 12,
        zoomControl: true,
        attributionControl: false,
        maxZoom: 18,
      });

      // 100% Free, Zero API Key, Zero Watermark Esri Dark Canvas
      // maxNativeZoom: 16 prevents Esri from returning "Map data not yet available" placeholder tiles
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        {
          maxNativeZoom: 16,
          maxZoom: 18,
          attribution: "© Esri, HERE, Garmin, © OpenStreetMap contributors",
        }
      ).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove previous markers & route polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
    if (startMarkerRef.current) {
      startMarkerRef.current.remove();
      startMarkerRef.current = null;
    }
    if (endMarkerRef.current) {
      endMarkerRef.current.remove();
      endMarkerRef.current = null;
    }

    if (activePath.length > 1) {
      const polyline = L.polyline(activePath, {
        color: "#EF4444", // Volcanic Red route following actual roads
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      polylineRef.current = polyline;

      // Start pin
      const startP = activePath[0];
      const startM = L.circleMarker(startP, {
        radius: 7,
        fillColor: "#10B981",
        color: "#FFFFFF",
        weight: 2,
        fillOpacity: 1,
      }).addTo(map);
      startM.bindTooltip("🟢 Origin", { permanent: false, direction: "top" });
      startMarkerRef.current = startM;

      // Finish pin
      const endP = activePath[activePath.length - 1];
      const endM = L.circleMarker(endP, {
        radius: 7,
        fillColor: "#EF4444",
        color: "#FFFFFF",
        weight: 2,
        fillOpacity: 1,
      }).addTo(map);
      endM.bindTooltip("🏁 Destination", { permanent: false, direction: "top" });
      endMarkerRef.current = endM;

      try {
        map.fitBounds(polyline.getBounds(), {
          padding: [30, 30],
          maxZoom: 16,
        });
      } catch (err) {
        map.setView(startP, 13);
      }
    } else if (activePath.length === 1) {
      map.setView(activePath[0], 14);
    }

    // Force map to recalculate container size to eliminate grey screen
    const refreshMap = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize(false);
      }
    };

    const timers = [
      setTimeout(refreshMap, 50),
      setTimeout(refreshMap, 150),
      setTimeout(refreshMap, 400),
      setTimeout(refreshMap, 900),
    ];

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined" && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(refreshMap);
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      timers.forEach(clearTimeout);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [activePath]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Parse REAL trip records from Oben API into formatted graph points
  const realTripChartData = useMemo(() => {
    if (!Array.isArray(trips) || trips.length === 0) {
      return [];
    }

    return trips
      .slice(0, 15) // Recent 15 trips
      .reverse()
      .map((t, idx) => {
        const rawTime = t.tripStartTime || t.startTime || t.timestamp || t.createdAt;
        const dateObj = parseObenDate(rawTime);
        const dist = Number(t.tripDistance ?? t.totalDistance ?? 0);
        const topSpeed = Number(t.maxSpeed ?? t.topSpeed ?? 0);
        const avgSpd = Number(t.avgSpeed ?? t.averageSpeed ?? (dist > 0 && t.sessionDurationMinutes ? (dist / (t.sessionDurationMinutes / 60)) : 0));
        const duration = Number(t.sessionDurationMinutes ?? t.duration ?? 0);

        return {
          id: t.id || idx,
          dateLabel: formatISTDate(dateObj, {
            month: "short",
            day: "numeric",
          }),
          timeLabel: formatISTTime(dateObj),
          distanceKm: Number(dist.toFixed(1)),
          maxSpeedKmh: Math.round(topSpeed),
          avgSpeedKmh: Math.round(avgSpd),
          durationMin: Math.round(duration),
        };
      });
  }, [trips]);

  // Real rolling telemetry history graph data (from live packets)
  const realRollingChartData = useMemo(() => {
    if (!Array.isArray(history) || history.length === 0) {
      return [];
    }

    return history.slice(-30).map((h, idx) => {
      const time = h.timestamp
        ? new Date(h.timestamp).toLocaleTimeString([], {
            minute: "2-digit",
            second: "2-digit",
          })
        : `#${idx}`;

      return {
        time,
        speed: h.speed || 0,
        soc: h.soc || 0,
        packVoltage: Number((h.packVoltage || 0).toFixed(1)),
      };
    });
  }, [history]);

  return (
    <GlassCard variant="default" className="p-5 sm:p-7 space-y-6" hover={false}>
      {/* Header and Mode Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-red-500/15">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            <TrendingUp className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-black text-white text-base sm:text-lg tracking-tight">
              Ride Telemetry & Pattern Analysis
            </h3>
            <p className="text-xs text-slate-400">
              Real vehicle trip patterns, speed curves & GPS route recording
            </p>
          </div>
        </div>

        {/* Graph Mode Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-red-500/20">
          <button
            type="button"
            onClick={() => setActiveGraphMode("trips")}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-bold transition-all
              ${
                activeGraphMode === "trips"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }
            `}
          >
            Recent Trips ({realTripChartData.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveGraphMode("live")}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-bold transition-all
              ${
                activeGraphMode === "live"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }
            `}
          >
            Rolling Trace ({realRollingChartData.length})
          </button>
        </div>
      </div>

      {/* TRIP METRICS OVERVIEW TILES (DUALTONE VOLCANIC CLAY) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F1017] border border-red-500/20 shadow-inner">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            <Clock className="w-3.5 h-3.5 text-red-400" />
            <span>Session Duration</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-1.5 font-mono">
            {tripDuration > 0 ? `${tripDuration} min` : "0 min"}
          </p>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
            Active ignition timer
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1017] border border-red-500/20 shadow-inner">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            <Navigation className="w-3.5 h-3.5 text-red-400" />
            <span>Session Distance</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-red-400 mt-1.5 font-mono">
            {totalDistance > 0 ? `${Number(totalDistance).toFixed(1)} km` : "0.0 km"}
          </p>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
            Trip odometer
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1017] border border-red-500/20 shadow-inner">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            <Gauge className="w-3.5 h-3.5 text-red-400" />
            <span>Max Speed</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-1.5 font-mono">
            {maxSpeed > 0 ? `${maxSpeed} km/h` : "0 km/h"}
          </p>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
            Top speed recorded
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1017] border border-red-500/20 shadow-inner">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            <Zap className="w-3.5 h-3.5 text-red-400" />
            <span>Battery SOC Range</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1.5 font-mono">
            {minSoc}% – {maxSoc}%
          </p>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
            Pack discharge span
          </span>
        </div>
      </div>

      {/* REAL DATA INTERACTIVE GRAPH */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#090A0F] border border-red-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-red-400" />
            <h4 className="font-bold text-white text-sm">
              {activeGraphMode === "trips"
                ? "Recent Ride Patterns: Distance (km) & Speeds (km/h)"
                : "Live Rolling Speed (km/h) & Battery Voltage (V)"}
            </h4>
          </div>
          <span className="text-[10px] font-mono text-red-300 font-bold px-2 py-0.5 rounded-full bg-red-950/60 border border-red-500/30">
            REAL TELEMETRY
          </span>
        </div>

        <div className="h-[260px] sm:h-[300px] w-full">
          {activeGraphMode === "trips" ? (
            realTripChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={realTripChartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#25161A" />
                  <XAxis
                    dataKey="dateLabel"
                    stroke="#64748B"
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#EF4444"
                    tick={{ fontSize: 10, fill: "#EF4444" }}
                    unit=" km"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#F59E0B"
                    tick={{ fontSize: 10, fill: "#F59E0B" }}
                    unit=" km/h"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0D0E15",
                      borderColor: "rgba(220,38,38,0.4)",
                      borderRadius: "12px",
                      color: "#FFF",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="distanceKm"
                    name="Distance (km)"
                    stroke="#DC2626"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#distGrad)"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="maxSpeedKmh"
                    name="Top Speed (km/h)"
                    fill="#F59E0B"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgSpeedKmh"
                    name="Avg Speed (km/h)"
                    stroke="#38BDF8"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-black/40 rounded-xl border border-white/5">
                <Navigation className="w-8 h-8 text-red-500/60 mb-2" />
                <p className="text-sm font-bold text-slate-300">
                  Awaiting Recorded Trips from Oben Cloud
                </p>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Once your Oben Rorr completes rides, trip logs and pattern curves will render here automatically.
                </p>
              </div>
            )
          ) : realRollingChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={realRollingChartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#25161A" />
                <XAxis
                  dataKey="time"
                  stroke="#64748B"
                  tick={{ fontSize: 10, fill: "#94A3B8" }}
                />
                <YAxis
                  stroke="#EF4444"
                  tick={{ fontSize: 10, fill: "#EF4444" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0D0E15",
                    borderColor: "rgba(220,38,38,0.4)",
                    borderRadius: "12px",
                    color: "#FFF",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                />
                <Line
                  type="monotone"
                  dataKey="speed"
                  name="Speed (km/h)"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="packVoltage"
                  name="Pack Voltage (V)"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-black/40 rounded-xl border border-white/5">
              <Activity className="w-8 h-8 text-red-500/60 mb-2 animate-pulse" />
              <p className="text-sm font-bold text-slate-300">
                Awaiting Live Telemetry Stream
              </p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Real-time rolling points accumulate as telemetry packets are received from your bike.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* GPS ROUTE TRAIL MAP */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-400" />
            <h4 className="font-bold text-white text-sm">
              Session Route GPS Trace
            </h4>
            {selectedPreviewTrip && (
              <span className="text-xs font-mono text-red-400 font-bold px-2 py-0.5 rounded-md bg-red-950/60 border border-red-500/30">
                {getTripRouteTitle(selectedPreviewTrip)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              {loadingCloudPath ? "Fetching GPS points..." : `${activePath.length} GPS Points Recorded`}
            </span>
            {onSelectTrip && selectedPreviewTrip && (
              <button
                type="button"
                onClick={() => onSelectTrip(selectedPreviewTrip)}
                className="px-2.5 py-1 rounded-xl bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
              >
                <span>Open Full Map</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>

        {/* TRIP SELECTOR CHIPS */}
        {Array.isArray(trips) && trips.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {trips.slice(0, 8).map((t, idx) => {
              const isSelected = selectedPreviewTrip?.tripId === t.tripId || (!selectedPreviewTrip && idx === 0);
              const label = getTripRouteTitle(t);

              return (
                <button
                  key={t.tripId || idx}
                  type="button"
                  onClick={() => setSelectedPreviewTrip(t)}
                  className={`
                    shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border flex items-center gap-1.5
                    ${isSelected
                      ? "bg-red-600 text-white border-red-500 shadow-sm"
                      : "bg-black/60 text-slate-400 border-white/10 hover:text-white hover:border-red-500/30"}
                  `}
                >
                  <span className="line-clamp-1 max-w-[140px] sm:max-w-[180px]">{label}</span>
                  <span className="font-mono text-[9px] opacity-80">{t.distanceKm || t.tripDistance || 0} km</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="h-[260px] sm:h-[300px] w-full rounded-2xl overflow-hidden border border-red-500/20 relative shadow-inner bg-[#0B0C12]">
          <ErrorBoundary>
            <div ref={mapContainerRef} className="w-full h-full" />
          </ErrorBoundary>
        </div>
      </div>
    </GlassCard>
  );
}