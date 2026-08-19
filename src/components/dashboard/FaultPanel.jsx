import {
  AlertTriangle,
} from "lucide-react";

import GlassCard from "../common/GlassCard";

export default function FaultPanel({
  liveData,
}) {

  const hasFault =
    liveData.error !== "No error" ||
    liveData.thermalSensorAlarm ||
    liveData.gasSensorFault;


  return (
    <GlassCard className="
      p-6
      flex flex-col
      justify-center
    ">

      <div className="space-y-4">

        <div
          className={`
            p-5
            rounded-2xl
            border
            backdrop-blur-md
            ${
              hasFault
                ? "bg-red-500/10 border-red-500/40"
                : "bg-emerald-500/5 border-emerald-500/20"
            }
          `}
        >

          <div className="
            flex items-center
            gap-3 mb-2
          ">

            <AlertTriangle
              className={`
                w-5 h-5
                ${
                  hasFault
                    ? "text-red-400 animate-pulse"
                    : "text-emerald-400"
                }
              `}
            />

            <p className="
              text-xs
              uppercase
              text-slate-400
              font-bold
              tracking-widest
            ">
              System Faults
            </p>

          </div>


          <p className="
            font-mono
            text-sm
            text-slate-200
          ">
            {liveData.error}
          </p>

        </div>


        <div className="
          p-5
          rounded-2xl
          border border-white/5
          bg-black/40
          flex flex-col
          gap-3
        ">

          <InfoRow
            label="Firmware"
            value={liveData.vcuFirmwareVersion}
          />

          <InfoRow
            label="VCU ID"
            value={liveData.VCUID}
          />

          <InfoRow
            label="Odometer"
            value={`${liveData.odometer} km`}
          />

        </div>

      </div>

    </GlassCard>
  );
}


function InfoRow({ label, value }) {

  return (
    <div className="
      flex
      justify-between
      items-center
      text-xs
      font-mono
      gap-4
    ">

      <span className="text-slate-500">
        {label}
      </span>

      <span className="
        text-slate-300
        text-right
        truncate
      ">
        {value}
      </span>

    </div>
  );
}