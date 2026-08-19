import {
  Clock,
} from "lucide-react";

import GlassCard from "../common/GlassCard";

export default function TripLogs({
  trips = [],
}) {
  return (
    <GlassCard
      className="
        p-6
        flex
        flex-col
        h-[350px]
        overflow-hidden
      "
    >
      <h3 className="
        text-sm
        font-bold
        flex
        items-center
        gap-3
        mb-6
        uppercase
        tracking-widest
        text-slate-200
      ">
        <Clock
          className="
            w-5 h-5
            text-blue-400
          "
        />
        Recent Trip Logs
      </h3>

      <div className="
        flex-1
        overflow-y-auto
        pr-2
        space-y-3
        custom-scrollbar
      ">
        {Array.isArray(trips) && trips.length > 0 ? (
          trips.map((trip, index) => {
            // Fallback safety for different data payload formats
            const rawTime = trip.startTime || trip.timestamp;
            const dateObj = rawTime ? new Date(rawTime) : new Date();
            const distance = trip.tripDistance ?? trip.totalDistance ?? 0;
            const duration = trip.sessionDurationMinutes ?? trip.totalTrips ? `${trip.totalTrips} trip(s)` : '0 min';

            return (
              <div
                key={
                  trip.id ??
                  trip.packetId ??
                  index
                }
                className="
                  bg-black/40
                  border border-white/5
                  p-4
                  rounded-2xl
                  flex flex-col
                  gap-3
                  hover:bg-white/5
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
                    <p className="
                      text-[10px]
                      text-slate-400
                      font-mono
                      tracking-wider
                      uppercase
                    ">
                      {dateObj.toLocaleDateString()}
                    </p>

                    <p className="
                      text-sm
                      font-bold
                      mt-0.5
                      text-slate-200
                    ">
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

                  <div className="
                    text-right
                  ">
                    <p className="
                      text-lg
                      font-black
                      text-indigo-400
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
              </div>
            );
          })
        ) : (
          <div className="
            h-full
            flex
            items-center
            justify-center
            text-slate-500
            font-mono
            text-sm
          ">
            No recent logs.
          </div>
        )}
      </div>
    </GlassCard>
  );
} 