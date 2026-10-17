import {
  Clock,
  MapPin,
  Navigation,
  ArrowUpRight,
  Zap,
} from "lucide-react";

import GlassCard from "../common/GlassCard";

export default function TripLogs({
  trips = [],
  onSelectTrip,
}) {
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
      <div className="flex items-center justify-between mb-6">
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
        <span className="text-[10px] font-mono text-slate-400">
          {trips.length} Recorded Rides
        </span>
      </div>

      <div className="
        flex-1
        overflow-y-auto
        pr-2
        space-y-3
        custom-scrollbar
      ">
        {Array.isArray(trips) && trips.length > 0 ? (
          trips.map((trip, index) => {
            const rawTime = trip.startTime || trip.timestamp;
            const dateObj = rawTime ? new Date(rawTime) : new Date();
            const distance = trip.distanceKm ?? trip.tripDistance ?? trip.totalDistance ?? 0;
            const duration = trip.durationMinutes ? `${trip.durationMinutes} min` : (trip.sessionDurationMinutes ? `${trip.sessionDurationMinutes} min` : (trip.totalTrips ? `${trip.totalTrips} trip(s)` : '15 min'));
            const title = trip.title || (trip.startLocationName && trip.endLocationName ? `${trip.startLocationName} ➔ ${trip.endLocationName}` : `Trip #${index + 1}`);
            const topSpeed = trip.topSpeed || trip.maxSpeed;

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