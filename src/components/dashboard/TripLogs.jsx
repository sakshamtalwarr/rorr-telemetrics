import { useState } from "react";
import {
  Clock,
  MapPin,
  Navigation,
  ArrowUpRight,
  Zap,
  Calendar,
  Filter,
} from "lucide-react";

import GlassCard from "../common/GlassCard";

const DATE_PRESETS = [
  {
    id: "sept_oct",
    label: "🌟 30 Sep & 1 Oct",
    from: "2026-09-28",
    to: "2026-10-02",
  },
  {
    id: "month",
    label: "📅 Late Sep – Today",
    from: "2026-09-20",
    to: "2026-10-18",
  },
  {
    id: "week",
    label: "📅 This Week",
    from: "2026-10-12",
    to: "2026-10-18",
  },
  {
    id: "all",
    label: "📅 All Time",
    from: "2024-09-01",
    to: "2026-10-18",
  },
];

export default function TripLogs({
  trips = [],
  onSelectTrip,
  tripFilter = null,
  onFilterChange = null,
}) {
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [customFrom, setCustomFrom] = useState(tripFilter?.from || "2026-09-25");
  const [customTo, setCustomTo] = useState(tripFilter?.to || "2026-10-18");

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

  return (
    <GlassCard
      className="
        p-6
        flex
        flex-col
        h-auto min-h-[100px]
        overflow-hidden
      "
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h3 className="
          text-sm
          font-bold
          flex
          items-center
          gap-3
          uppercase
          tracking-widest
          text-slate-200
        ">
          <Clock className="w-5 h-5 text-red-400" />
          Recent Trip Logs
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400">
            {trips.length} Rides Found
          </span>
          {onFilterChange && (
            <button
              type="button"
              onClick={() => setShowCustomDates((s) => !s)}
              className="px-2 py-0.5 rounded-lg bg-black/60 border border-white/10 text-slate-300 hover:text-white text-[10px] font-mono font-bold flex items-center gap-1"
            >
              <Calendar className="w-3 h-3 text-red-400" />
              <span>{showCustomDates ? "Hide Dates" : "Filter Dates"}</span>
            </button>
          )}
        </div>
      </div>

      {/* DATE PRESETS BAR */}
      {onFilterChange && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 custom-scrollbar">
          {DATE_PRESETS.map((p) => {
            const isActive = tripFilter?.from === p.from && tripFilter?.to === p.to;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetClick(p)}
                className={`
                  shrink-0 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all border
                  ${isActive
                    ? "bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30"
                    : "bg-black/50 text-slate-400 border-white/10 hover:text-white hover:border-red-500/30"}
                `}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      )}

      {/* CUSTOM DATE RANGE FORM */}
      {showCustomDates && onFilterChange && (
        <form onSubmit={applyCustomDates} className="mb-4 p-3 rounded-xl bg-black/70 border border-red-500/25 flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase">From:</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="bg-black/80 border border-white/15 rounded-lg px-2 py-1 text-white text-xs font-mono focus:border-red-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase">To:</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="bg-black/80 border border-white/15 rounded-lg px-2 py-1 text-white text-xs font-mono focus:border-red-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all active:scale-95"
          >
            Apply Filter
          </button>
        </form>
      )}

      <div className="
        flex-1
        overflow-y-auto
        pr-2
        space-y-3
        custom-scrollbar
      ">
        {Array.isArray(trips) && trips.length > 0 ? (
          trips.map((trip, index) => {
            const rawTime = trip.startTime || trip.timestamp || trip.createdAt || trip.startedAt;
            const dateObj = rawTime ? new Date(rawTime) : new Date();
            const distance = trip.distanceKm ?? trip.tripDistance ?? trip.totalDistance ?? trip.distance ?? 0;
            const duration = trip.durationMinutes ? `${trip.durationMinutes} min` : (trip.duration ? `${trip.duration} min` : (trip.sessionDurationMinutes ? `${trip.sessionDurationMinutes} min` : (trip.totalTrips ? `${trip.totalTrips} trip(s)` : '15 min')));
            const title = trip.title || (trip.startLocationName && trip.endLocationName ? `${trip.startLocationName} ➔ ${trip.endLocationName}` : `Trip #${index + 1}`);
            const topSpeed = trip.topSpeed || trip.maxSpeed || trip.speed || trip.averageSpeed;

            return (
              <div
                key={
                  trip.tripId ??
                  trip.id ??
                  trip.packetId ??
                  index
                }
                className="
                  bg-black/50
                  border border-red-500/15
                  p-4
                  rounded-2xl
                  flex flex-col
                  gap-3
                  hover:bg-red-950/20
                  transition-colors
                "
              >
                <div className="
                  flex
                  justify-between
                  items-start
                  border-b
                  border-white/10
                  pb-3
                ">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <p className="
                        text-xs
                        font-bold
                        text-slate-200
                        line-clamp-1
                      ">
                        {title}
                      </p>
                    </div>

                    <p className="
                      text-[10px]
                      text-slate-400
                      font-mono
                      mt-1
                    ">
                      {dateObj.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} •{" "}
                      {trip.startTime && trip.endTime ? (
                        <>
                          {new Date(trip.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {" - "}
                          {new Date(trip.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </>
                      ) : (
                        dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      )}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="
                      text-lg
                      font-black
                      text-red-400
                      font-mono
                    ">
                      {distance}
                      {" km"}
                    </p>

                    <p className="
                      text-[10px]
                      text-slate-500
                      font-mono
                    ">
                      {duration}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                    {topSpeed && (
                      <span>Max: <strong className="text-amber-400">{topSpeed} km/h</strong></span>
                    )}
                    {trip.socConsumed !== undefined && (
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-red-400" />
                        <span>-{trip.socConsumed}% SOC</span>
                      </span>
                    )}
                  </div>

                  {onSelectTrip && (
                    <button
                      type="button"
                      onClick={() => onSelectTrip(trip)}
                      className="
                        flex items-center gap-1.5
                        px-3 py-1.5
                        rounded-xl
                        bg-red-600/30 hover:bg-red-600
                        text-red-300 hover:text-white
                        border border-red-500/40
                        text-xs font-bold
                        transition-all
                        active:scale-95
                      "
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>View Route on Map</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="
            h-full
            flex
            flex-col
            items-center
            justify-center
            text-slate-500
            font-mono
            text-sm
            p-8
          ">
            <Navigation className="w-8 h-8 text-red-500/40 mb-2" />
            <p>No recent logs recorded yet.</p>
            <p className="text-xs text-slate-600 mt-1">Start riding your Oben Rorr to auto-log trips.</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}