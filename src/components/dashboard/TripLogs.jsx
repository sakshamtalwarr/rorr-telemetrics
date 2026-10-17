import { useState, useMemo } from "react";
import {
  Clock,
  MapPin,
  Navigation,
  ArrowUpRight,
  Zap,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  Route,
  IndianRupee,
  Gauge,
  Sparkles,
} from "lucide-react";

import GlassCard from "../common/GlassCard";
import TripDetailsModal from "./TripDetailsModal";
import {
  parseObenDate,
  formatISTTime,
  formatISTDate,
  getISTDateKey,
  formatDuration,
} from "../../utils/dateUtils";
import { getTripRouteTitle } from "../../utils/locationUtils";

export function getFilterPresets() {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0];
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const monthStart = `${year}-${month}-01`;

  return [
    {
      id: "all",
      label: "🏍️ All Recorded Rides",
      from: "2024-01-01",
      to: todayStr,
    },
    {
      id: "today",
      label: "⚡ Today",
      from: todayStr,
      to: todayStr,
    },
    {
      id: "week",
      label: "🗓️ Last 7 Days",
      from: sevenDaysAgo,
      to: todayStr,
    },
    {
      id: "month",
      label: "🗓️ This Month",
      from: monthStart,
      to: todayStr,
    },
    {
      id: "last30",
      label: "🔥 Last 30 Days",
      from: thirtyDaysAgo,
      to: todayStr,
    },
  ];
}

export default function TripLogs({
  trips = [],
  onSelectTrip,
  tripFilter = null,
  onFilterChange = null,
  liveData = null,
}) {
  const [selectedSessionForModal, setSelectedSessionForModal] = useState(null);
  const [showCustomDates, setShowCustomDates] = useState(false);
  const presets = useMemo(() => getFilterPresets(), []);

  const [customFrom, setCustomFrom] = useState(tripFilter?.from || presets[2].from);
  const [customTo, setCustomTo] = useState(tripFilter?.to || presets[0].to);

  const handlePresetClick = (preset) => {
    if (onFilterChange) {
      onFilterChange({
        preset: preset.id,
        from: preset.from,
        to: preset.to,
        label: preset.label,
      });
    }
  };

  const applyCustomDates = (e) => {
    e.preventDefault();
    if (onFilterChange && customFrom && customTo) {
      onFilterChange({
        preset: "custom",
        from: customFrom,
        to: customTo,
        label: `${customFrom} to ${customTo}`,
      });
    }
  };

  // Group trips systematically by Indian Standard Time Date
  const groupedTrips = useMemo(() => {
    if (!Array.isArray(trips) || trips.length === 0) return {};

    const groups = {};

    trips.forEach((trip) => {
      const raw =
        trip.tripStartTime ||
        trip.startTime ||
        trip.timestamp ||
        trip.createdAt ||
        trip.startedAt;

      const dateKey = getISTDateKey(raw);
      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateKey,
          label: formatISTDate(raw, { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
          trips: [],
          totalDistance: 0,
          totalDurationMins: 0,
          totalSavings: 0,
        };
      }

      groups[dateKey].trips.push(trip);

      const dist = Number(
        trip.tripDistance ??
        trip.distanceKm ??
        trip.totalDistance ??
        trip.distance ??
        0
      );
      groups[dateKey].totalDistance += dist;

      const dur = Number(
        trip.sessionDurationMinutes ??
        trip.durationMinutes ??
        trip.duration ??
        0
      );
      groups[dateKey].totalDurationMins += dur;

      const savings = Number(trip.netSavings ?? (dist * 2.28));
      groups[dateKey].totalSavings += savings;
    });

    // Sort trips within each group newest first
    Object.keys(groups).forEach((key) => {
      groups[key].trips.sort((a, b) => {
        const tA = parseObenDate(a.tripStartTime || a.startTime || a.timestamp).getTime();
        const tB = parseObenDate(b.tripStartTime || b.startTime || b.timestamp).getTime();
        return tB - tA;
      });
    });

    return groups;
  }, [trips]);

  // Sorted date keys descending
  const sortedDateKeys = useMemo(() => {
    return Object.keys(groupedTrips).sort((a, b) => (a < b ? 1 : -1));
  }, [groupedTrips]);

  return (
    <>
      <GlassCard
        className="
          p-5 sm:p-6
          flex
          flex-col
          h-auto min-h-[100px]
          overflow-hidden
        "
      >
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span>Riding Sessions & Trip Logs</span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tap any ride to view the official Oben Electric trip breakdown & GPS route trace
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-black/60 border border-red-500/30 text-red-400 font-bold">
              {trips.length} Rides Logged
            </span>
            {onFilterChange && (
              <button
                type="button"
                onClick={() => setShowCustomDates((s) => !s)}
                className="px-3 py-1 rounded-xl bg-black/60 border border-white/10 hover:border-red-500/40 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-red-400" />
                <span>{showCustomDates ? "Hide Custom" : "Day-Wise Picker"}</span>
              </button>
            )}
          </div>
        </div>

        {/* FILTER PRESETS BAR */}
        {onFilterChange && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 custom-scrollbar">
            {presets.map((p) => {
              const isActive =
                tripFilter?.preset === p.id ||
                (tripFilter?.from === p.from && tripFilter?.to === p.to);

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetClick(p)}
                  className={`
                    shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border
                    ${isActive
                      ? "bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30 scale-102"
                      : "bg-black/50 text-slate-400 border-white/10 hover:text-white hover:border-red-500/30"}
                  `}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        )}

        {/* CUSTOM DAY-WISE DATE RANGE FORM */}
        {showCustomDates && onFilterChange && (
          <form
            onSubmit={applyCustomDates}
            className="mb-4 p-3.5 rounded-2xl bg-black/70 border border-red-500/30 flex flex-wrap items-center gap-3 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">From:</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="bg-black/90 border border-white/15 rounded-xl px-2.5 py-1.5 text-white text-xs font-mono focus:border-red-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">To:</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="bg-black/90 border border-white/15 rounded-xl px-2.5 py-1.5 text-white text-xs font-mono focus:border-red-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all active:scale-95 shadow-md shadow-red-600/30"
            >
              Filter Day-Wise
            </button>
          </form>
        )}

        {/* SESSIONS LIST GROUPED SYSTEMATICALLY BY DATE */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 custom-scrollbar max-h-[700px]">
          {sortedDateKeys.length > 0 ? (
            sortedDateKeys.map((dateKey) => {
              const group = groupedTrips[dateKey];

              return (
                <div key={dateKey} className="space-y-3">
                  {/* DATE GROUP HEADER */}
                  <div className="sticky top-0 z-10 py-1.5 px-3 rounded-xl bg-gradient-to-r from-red-950/80 via-black/90 to-red-950/50 border border-red-500/30 backdrop-blur-md flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs font-bold text-white tracking-wide">
                        {group.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
                      <span className="text-red-400 font-bold">{group.trips.length} Trips</span>
                      <span>•</span>
                      <span className="text-white font-bold">{Number(group.totalDistance).toFixed(1)} km</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">₹{group.totalSavings.toFixed(1)} saved</span>
                    </div>
                  </div>

                  {/* CARDS UNDER THIS DATE */}
                  <div className="space-y-2.5">
                    {group.trips.map((trip, idx) => {
                      const rawStart = trip.tripStartTime || trip.startTime || trip.timestamp || trip.createdAt;
                      const rawEnd = trip.tripEndTime || trip.endTime;
                      const startTimeStr = formatISTTime(rawStart);
                      const endTimeStr = rawEnd ? formatISTTime(rawEnd) : null;

                      const distance = Number(
                        trip.tripDistance ??
                        trip.distanceKm ??
                        trip.totalDistance ??
                        trip.distance ??
                        0
                      );

                      const durationMinutes = Number(
                        trip.sessionDurationMinutes ??
                        trip.durationMinutes ??
                        trip.duration ??
                        0
                      );
                      const durationStr = formatDuration(durationMinutes);

                      const topSpeed = Number(trip.maxSpeed ?? trip.topSpeed ?? trip.averageSpeed ?? 0);
                      const avgSpeed = Number(trip.avgSpeed ?? trip.averageSpeed ?? 0);

                      const socConsumed =
                        trip.socConsumption ??
                        trip.socConsumed ??
                        (trip.startSOC !== undefined && trip.endSOC !== undefined
                          ? trip.startSOC - trip.endSOC
                          : undefined);

                      const netSavings = trip.netSavings ?? (distance * 2.28).toFixed(2);

                      return (
                        <div
                          key={trip.tripId ?? trip.id ?? trip._id ?? idx}
                          onClick={() => setSelectedSessionForModal(trip)}
                          className="
                            bg-black/50 hover:bg-red-950/25
                            border border-red-500/15 hover:border-red-500/40
                            p-3.5 sm:p-4
                            rounded-2xl
                            flex flex-col
                            gap-2.5
                            cursor-pointer
                            transition-all
                            active:scale-[0.99]
                            group
                          "
                        >
                          {/* TOP ROW: TITLE & DISTANCE */}
                          <div className="flex justify-between items-start gap-2 border-b border-white/5 pb-2.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse group-hover:scale-125 transition-transform" />
                                <p className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-white line-clamp-1">
                                  {getTripRouteTitle(trip)}
                                </p>
                              </div>

                              <p className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-red-400" />
                                <span>{startTimeStr}</span>
                                {endTimeStr && (
                                  <>
                                    <span>→</span>
                                    <span>{endTimeStr}</span>
                                  </>
                                )}
                                <span className="text-slate-500">({durationStr})</span>
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <p className="text-base sm:text-lg font-black text-red-400 font-mono">
                                {distance > 0 ? distance.toFixed(1) : "0.0"} km
                              </p>
                              <p className="text-[10px] text-emerald-400 font-mono font-bold">
                                ₹{netSavings} saved
                              </p>
                            </div>
                          </div>

                          {/* METRICS ROW */}
                          <div className="flex items-center justify-between text-xs pt-0.5">
                            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                              {topSpeed > 0 && (
                                <span>Top: <strong className="text-amber-400">{topSpeed} km/h</strong></span>
                              )}
                              {avgSpeed > 0 && (
                                <span className="hidden sm:inline">Avg: <strong className="text-slate-300">{avgSpeed} km/h</strong></span>
                              )}
                              {socConsumed !== undefined && (
                                <span className="flex items-center gap-1 text-red-300 font-bold">
                                  <Zap className="w-3 h-3 text-red-400" />
                                  <span>-{socConsumed}% SOC</span>
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSessionForModal(trip);
                              }}
                              className="
                                flex items-center gap-1
                                px-2.5 py-1
                                rounded-xl
                                bg-red-600/20 hover:bg-red-600
                                border border-red-500/30
                                text-red-200 hover:text-white
                                text-[11px] font-bold
                                transition-all
                              "
                            >
                              <span>Trip Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 px-4 text-center rounded-2xl bg-black/40 border border-white/5 space-y-3">
              <Clock className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-slate-300">
                No trips found for selected filter range
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try switching to "All Recorded Rides" or adjusting the date range to see your telemetry data.
              </p>
              {onFilterChange && (
                <button
                  type="button"
                  onClick={() => handlePresetClick(presets[0])}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-md shadow-red-600/30"
                >
                  Show All Recorded Rides
                </button>
              )}
            </div>
          )}
        </div>
      </GlassCard>

      {/* TRIP DETAILS MODAL REPLICA */}
      {selectedSessionForModal && (
        <TripDetailsModal
          trip={selectedSessionForModal}
          onClose={() => setSelectedSessionForModal(null)}
          liveData={liveData}
          onOpenFullMap={onSelectTrip}
        />
      )}
    </>
  );
}