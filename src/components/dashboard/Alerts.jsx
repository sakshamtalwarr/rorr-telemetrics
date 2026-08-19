import {
  BellRing,
} from "lucide-react";

import GlassCard from "../common/GlassCard";


export default function Alerts({
  alerts,
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

        <BellRing
          className="
            w-5 h-5
            text-amber-400
          "
        />

        System Alerts

      </h3>


      <div className="
        flex-1
        overflow-y-auto
        pr-2
        space-y-3
        custom-scrollbar
      ">

        {alerts.length > 0 ? (

          alerts.map((alert, index) => {

            const high =
              alert.severity === "HIGH";


            return (
              <div
                key={
                  alert.packetId ??
                  index
                }
                className="
                  bg-black/40
                  border border-white/5
                  p-4
                  rounded-2xl
                  flex flex-col
                  gap-2
                  relative
                  overflow-hidden
                  hover:bg-white/5
                  transition-colors
                "
              >

                <div
                  className={`
                    absolute
                    left-0
                    top-0
                    bottom-0
                    w-1
                    ${
                      high
                        ? "bg-red-500"
                        : "bg-emerald-500"
                    }
                  `}
                />


                <div className="
                  flex
                  justify-between
                  items-start
                  pl-2
                ">

                  <p className="
                    text-sm
                    font-bold
                    text-slate-200
                  ">
                    {alert.title}
                  </p>


                  <span className="
                    text-[10px]
                    text-slate-500
                    font-mono
                    whitespace-nowrap
                    ml-2
                  ">

                    {new Date(
                      alert.createdAt
                    ).toLocaleDateString()}

                  </span>

                </div>


                <p className="
                  text-xs
                  text-slate-400
                  leading-relaxed
                  pl-2
                ">
                  {alert.content}
                </p>


                <div className="
                  flex
                  gap-2
                  mt-1
                  pl-2
                ">

                  <span className="
                    text-[9px]
                    uppercase
                    font-bold
                    tracking-widest
                    bg-white/5
                    px-2
                    py-0.5
                    rounded
                    text-slate-400
                    border
                    border-white/10
                  ">
                    {alert.subType}
                  </span>

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
            No active alerts.
          </div>

        )}

      </div>

    </GlassCard>
  );
}