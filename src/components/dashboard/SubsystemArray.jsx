import {
  ShieldCheck,
  Key,
  Zap,
  ToggleLeft,
  Power,
  Activity,
  AlertTriangle,
  AlertOctagon,
} from "lucide-react";

import GlassCard from "../common/GlassCard";
import StatusPill from "./StatusPill";

export default function SubsystemArray({
  liveData,
}) {

  return (
    <GlassCard className="p-6 xl:col-span-2">

      <h3 className="
        text-sm
        font-bold
        flex items-center
        gap-3
        mb-6
        uppercase
        tracking-widest
        text-slate-200
      ">

        <ShieldCheck
          className="
            w-5 h-5
            text-emerald-400
          "
        />

        Subsystem Array

      </h3>


      <div className="
        grid
        grid-cols-2
        md:grid-cols-4
        gap-4
      ">

        <StatusPill
          title="Ignition"
          active={liveData.ignition}
          icon={Key}
        />

        <StatusPill
          title="Charging"
          active={liveData.chargerConnected}
          icon={Zap}
          colorClass="text-blue-400"
        />

        <StatusPill
          title="Side Stand"
          active={liveData.sideStandStatus}
          icon={ToggleLeft}
          colorClass="text-amber-400"
          danger
        />

        <StatusPill
          title="Kill Switch"
          active={liveData.killSwitchStatus}
          icon={Power}
          colorClass="text-amber-400"
          danger
        />

        <StatusPill
          title="CHG Contct"
          active={liveData.chargeContactorStatus}
          icon={Activity}
        />

        <StatusPill
          title="DIS Contct"
          active={liveData.dischargeContactorStatus}
          icon={Activity}
        />

        <StatusPill
          title="Safe Mode"
          active={liveData.safeMode}
          icon={AlertTriangle}
          colorClass="text-orange-400"
          danger
        />

        <StatusPill
          title="Immobilized"
          active={liveData.immobilize}
          icon={AlertOctagon}
          colorClass="text-red-400"
          danger
        />

      </div>

    </GlassCard>
  );
}