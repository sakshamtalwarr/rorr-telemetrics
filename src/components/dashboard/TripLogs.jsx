import { useState } from "react";
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
} from "lucide-react";

import GlassCard from "../common/GlassCard";
import TripDetailsModal from "./TripDetailsModal";

const FILTER_PRESETS = [
  {
    id: "daily",
    label: "⚡ Daily / Today",
    from: "2026-10-16",
    to: "2026-10-18",
  },
  {
    id: "weekly",
    label: "📅 Weekly",
    from: "2026-10-10",
    to: "2026-10-18",
  },
  {
    id: "monthly",
    label: "🗓️ Monthly",
    from: "2026-09-20",
    to: "2026-10-18",
  },
  {
    id: "sept_oct",
    label: "🌟 30 Sep & 1 Oct",
    from: "2026-09-28",
    to: "2026-10-02",
  },
  {
    id: "all",
    label: "All Sessions",
    from: "2024-09-01",
    to: "2026-10-18",
  },
];

export default function TripLogs({
  trips = [],
  onSelectTrip,
  tripFilter = null,
  onFilterChange = null,
  liveData = null,
}) {
  const [selectedSessionForModal, setSelectedSessionForModal] = useState(null);
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
    <>
      <GlassCard
        className="
          p-6
          flex
          flex-col
          h-auto min-h-[100px]
          overflow-hidden
        "
      >
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="
              text-sm
              font-bold
              flex
              items-center
              gap-2.5
              uppercase
              tracking-widest
              text-slate-200
            ">
              <Clock className="w-5 h-5 text-red-500" />
              <span>Trip Sessions & Ride History</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tap any session card to view the official Oben Electric trip breakdown & map trace
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-black/60 border border-white/10 text-red-400 font-bold">
              {trips.length} Sessions
            </span>
            {onFilterChange && (
              <button
                type="button"
                onClick={() => setShowCustomDates((s) => !s)}
                className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-slate-300 hover:text-white text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-red-400" />
                <span>{showCustomDates ? "Hide Range" : "Day-Wise Filter"}</span>
              </button>
            )}
          </div>
        </div>

        {/* FILTER PRESETS BAR (DAILY, WEEKLY, MONTHLY, SAKSHAM RIDES, ALL) */}
        {onFilterChange && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 custom-scrollbar">
            {FILTER_PRESETS.map((p) => {
              const isActive = tripFilter?.preset === p.id || (tripFilter?.from === p.from && tripFilter?.to === p.to);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetClick(p)}
                  className={`
                    shrink-0 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border
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
              className="px-3.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all active:scale-95 shadow-sm"
            >
              Filter Day-Wise
            </button>
          </form>
        )}

        {/* SESSIONS LIST */}
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
              const distance = Number(trip.distanceKm ?? trip.tripDistance ?? trip.totalDistance ?? trip.distance ?? 0);
              const duration = trip.durationFormatted || (trip.durationMinutes ? `${trip.durationMinutes} min` : (trip.duration ? `${trip.duration} min` : '20 min'));
              const title = trip.title || (trip.startLocationName && trip.endLocationName ? `${trip.startLocationName} ➔ ${trip.endLocationName}` : `Trip Session #${index + 1}`);
              const topSpeed = trip.topSpeed || trip.maxSpeed || trip.speed || trip.averageSpeed;
              const socConsumed = trip.socConsumed ?? (trip.startSoc && trip.endSoc ? trip.startSoc - trip.endSoc : undefined);

              return (
                <div
                  key={
                    trip.tripId ??
                    trip.id ??
                    trip.packetId ??
                    index
                  }
                  onClick={() => setSelectedSessionForModal(trip)}
                  className="
                    bg-black/50 hover:bg-red-950/25
                    border border-red-500/15 hover:border-red-500/40
                    p-4
                    rounded-2xl
                    flex flex-col
                    gap-3
                    cursor-pointer
                    transition-all
                    active:scale-[0.99]
                    group
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
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse group-hover:scale-125 transition-transform" />
                        <p className="
                          text-xs sm:text-sm
                          font-bold
                          text-slate-100 group-hover:text-white
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
                        {dateObj.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" })} •{" "}
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
                        text-lg sm:text-xl
                        font-black
                        text-red-400
                        font-mono
                      ">
                        {distance}
                        {" km"}
                      </p>

                      <p className="
                        text-[10px]
                        text-slate-400
                        font-mono
                      ">
                        {duration}
                      </p>
                    </div>
                  </div>

                  {/* METRICS ROW & ACTION BUTTONS */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                      {topSpeed && (
                        <span>Top: <strong className="text-amber-400">{topSpeed} km/h</strong></span>
                      )}
                      {socConsumed !== undefined && (
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-red-400" />
                          <span>-{socConsumed}% SOC</span>
                        </span>
                      )}
                      {trip.netSavings && (
                        <span className="hidden sm:inline text-emerald-400">
                          ₹{trip.netSavings} saved
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
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
                          bg-white/10 hover:bg-white/20
                          text-white
                          text-[11px] font-bold
                          transition-all
                        "
                      >
                        <span>Trip Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {onSelectTrip && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTrip(trip);
                          }}
                          className="
                            hidden sm:flex items-center gap-1
                            px-2.5 py-1
                            rounded-xl
                            bg-red-600/30 hover:bg-red-600
                            text-red-300 hover:text-white
                            border border-red-500/40
                            text-[11px] font-bold
                            transition-all
                          "
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Route Map</span>
                        </button>
                      )}
                    </div>
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
              <Navigation className="w-8 h-8 text-red-500/40 mb-2 animate-bounce-subtle" />
              <p className="text-slate-300 font-bold">No sessions found for this filter.</p>
              <p className="text-xs text-slate-500 mt-1">Switch to "Monthly" or "🌟 30 Sep & 1 Oct" to view recorded rides.</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* POPUP MODAL: OFFICIAL OBEN TRIP DETAILS SCREEN */}
      {selectedSessionForModal && (
        <TripDetailsModal
          trip={selectedSessionForModal}
          onClose={() => setSelectedSessionForModal(null)}
          liveData={liveData}
        />
      )}
    </>
  );
}