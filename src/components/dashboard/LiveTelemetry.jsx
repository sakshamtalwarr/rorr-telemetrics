import {
  Activity,
  BatteryCharging,
  Cpu,
  Gauge,
  Radio,
  Shield,
  Thermometer,
  Timer,
  Zap,
} from "lucide-react";


import GlassCard from "../common/GlassCard";


function formatTime(value) {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}


function formatDate(value) {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function getFaultClass(hasError, hasSensorFault) {
  if (hasError || hasSensorFault) {
    return hasError ? "text-red-400" : "text-emerald-400";
  }
  return "text-slate-400";
}


function State({
  label,
  value,
  ok,
  warning,
}) {
  // Determine style objects
  const labelClasses = {
    ok: "text-slate-500",
    warning: "text-slate-400 bg-amber-500",
    error: "text-slate-400 bg-red-500",
  }[warning ? "warning" : ok ? "ok" : "error"];

  const statusClasses = {
    ok: "bg-emerald-500 border-white/5",
    warning: "bg-amber-500 border-white/5",
    error: "bg-red-500 border-red-500/20",
  }[warning ? "warning" : ok ? "ok" : "error"];

  return (

    <div
      className="
        rounded-xl
        border border-white/5
        bg-black/25
        p-3
      "
    >

      <div
        className="
          flex items-center gap-2
          text-xs
          font-bold
          uppercase
          tracking-wider
        "
      >
        <span className={statusClasses} />

        {label}
      </div>

      <div className="mt-1 text-sm font-bold">
        {value}
      </div>

    </div>
  );
}


function MiniStat({
  label,
  value,
}) {

  return (

    <>
      <div
        className="
          text-xs
          font-bold
          uppercase
          tracking-wider
          text-slate-400
        "
      >
        {label}
      </div>

      <div
        className="
          mt-1
          text-xs
          font-medium
          text-slate-300
        "
      >
        {value}
      </div>
    </>
  );
}


export default function LiveTelemetry({
  liveData,
  connectionStatus,
}) {

  const isActive =
    connectionStatus === "Telemetry Active";

  const hasError =
    liveData?.error &&
    liveData.error !== "No error";

  const hasSensorFault =
    liveData?.gasSensorFault ||
    liveData?.thermalSensorAlarm;


  const session =
    liveData?.session || {};

  const latency =
    liveData?.telemetryLatency;


  // Pre-compute fault class
  const faultClass = getFaultClass(hasError, hasSensorFault);


  return (

    <GlassCard
      className="p-6"
      hover={false}
    >



      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex flex-col
          gap-4
          border-b border-white/5
          pb-4
          md:flex-row
          md:items-center
          md:justify-between
        "
      >



        <div className="flex items-center gap-3">

          <Radio
            className="h-4 w-4 text-indigo-400"
          />

          <div>
            <h3
              className="
                text-sm
                font-bold
                uppercase
                tracking-widest
                text-slate-200
              "
            >
              Vehicle Diagnostics
            </h3>

            <p
              className="mt-0.5 text-[8px] font-mono tracking-widest text-slate-600"
            >
              LIVE TELEMATICS SYSTEM STATE
            </p>
          </div>

        </div>


        <div
          className="flex items-center gap-2 rounded-full bg-black/30 border border-white/5 px-3 py-1.5"
        >



          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse bg-emerald-500"
          />

          <span
            className="text-[8px] font-bold uppercase tracking-widest text-slate-400"
          >
            {connectionStatus}
          </span>

        </div>

      </div>


      {/* =================================================
          VEHICLE STATE
      ================================================= */}

      <section className="mt-6">

        <h4
          className="
            text-sm
            font-bold
            uppercase
            tracking-widest
            text-slate-400
            mb-3
            border-b border-white/5
            pb-2
          "
        >
          Vehicle State
        </h4>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

          <State
            label="Mode"
            value={liveData?.mode || "UNKNOWN"}
            ok
          />

          <State
            label="Ignition"
            value={
              liveData?.ignition
                ? "ON"
                : "OFF"
            }
            ok={!liveData?.ignition}
          />

          <State
            label="Charger"
            value={
              liveData?.chargerConnected
                ? "CONNECTED"
                : "DISCONNECTED"
            }
            ok={!liveData?.chargerConnected}
          />

          <State
            label="Side Stand"
            value={
              liveData?.sideStandStatus
                ? "DOWN"
                : "UP"
            }
            ok={!liveData?.sideStandStatus}
          />

          <State
            label="Kill Switch"
            value={
              liveData?.killSwitchStatus
                ? "ACTIVE"
                : "NORMAL"
            }
            ok={!liveData?.killSwitchStatus}
          />

          <State
            label="Safe Mode"
            value={
              liveData?.safeMode
                ? "ACTIVE"
                : "OFF"
            }
            ok={!liveData?.safeMode}
          />

          <State
            label="Immobilizer"
            value={
              liveData?.immobilize
                ? "ACTIVE"
                : "OFF"
            }
            ok={!liveData?.immobilize}
          />

          <State
            label="Discharge"
            value={
              liveData?.dischargeContactorStatus
                ? "ON"
                : "OFF"
            }
            ok
          />

        </div>

      </section>


      {/* =================================================
          CONTACTORS + SENSORS
      ================================================= */}

      <section className="mt-6">

        <h4
          className="
            text-sm
            font-bold
            uppercase
            tracking-widest
            text-slate-400
            mb-3
            border-b border-white/5
            pb-2
          "
        >
          Electrical & Sensor Status
        </h4>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

          <State
            label="Charge Contactor"
            value={
              liveData?.chargeContactorStatus
                ? "ON"
                : "OFF"
            }
            ok
          />

          <State
            label="Discharge Contactor"
            value={
              liveData?.dischargeContactorStatus
                ? "ON"
                : "OFF"
            }
            ok
          />

          <State
            label="Gas Sensor"
            value={
              liveData?.gasSensorFault
                ? "FAULT"
                : "NORMAL"
            }
            ok={!liveData?.gasSensorFault}
          />

          <State
            label="Thermal Sensor"
            value={
              liveData?.thermalSensorAlarm
                ? "ALARM"
                : "NORMAL"
            }
            ok={!liveData?.thermalSensorAlarm}
          />

        </div>

      </section>


      {/* =================================================
          SYSTEM HEALTH
      ================================================= */}

      <section className="mt-6">

        <div
          className="
            rounded-xl
            border border-white/5
            bg-black/20
            p-4
            mb-4
          "
        >

          <div className="flex items-center gap-2">

            <Shield
              className="h-3.5 w-3.5 text-red-400"
            />

            <span
              className="text-xs font-bold uppercase tracking-widest text-slate-400"
            >
              System Faults
            </span>

          </div>

          <p
            className={faultClass}
          >
            ${
              hasError
                ? liveData.error
                : hasSensorFault
                  ? "Sensor fault detected"
                  : "No active faults"
            }
          </p>

        </div>

        {/* SESSION */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          <MiniStat
            label="MAX SPEED"
            value={
              `${Number(
                session.maxSpeed || 0
              ).toFixed(0)} km/h`
            }
          />

          <MiniStat
            label="DISTANCE"
            value={
              `${Number(
                session.distanceTravelled || 0
              ).toFixed(1)} km`
            }
          />

          <MiniStat
            label="PACKETS"
            value={session.telemetryPackets || 0}
          />

        </div>

      </section>


      {/* =================================================
          TELEMETRY PIPELINE
      ================================================= */}

      <section className="mt-6">

        <h4
          className="
            text-sm
            font-bold
            uppercase
            tracking-widest
            text-slate-400
            mb-3
            border-b border-white/5
            pb-2
          "
        >
          Telemetry Pipeline
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          <div
            className="rounded-xl border border-white/5 bg-black/20 p-3"
          >



            <div className="flex items-center gap-2">
              <Radio className="h-3 w-3 text-indigo-400" />
              <span
                className="text-xs text-slate-400 font-bold uppercase tracking-widest"
              >
                PACKET CREATED
              </span>
            </div>

            <div className="mt-1 text-xs text-slate-500">
              {formatTime(liveData?.packetCreatedAt)} -
              {formatDate(liveData?.packetCreatedAt)}
            </div>

          </div>

          <div
            className="rounded-xl border border-white/5 bg-black/20 p-3"
          >



            <div className="flex items-center gap-2">
              <Radio className="h-3 w-3 text-indigo-400" />
              <span
                className="text-xs text-slate-400 font-bold uppercase tracking-widest"
              >
                FLINK RECEIVED
              </span>
            </div>

            <div className="mt-1 text-xs text-slate-500">
              {formatTime(liveData?.flinkReceivedAt)} -
              {formatDate(liveData?.flinkReceivedAt)}
            </div>

          </div>

          <div
            className="rounded-xl border border-white/5 bg-black/20 p-3"
          >



            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3 text-indigo-400" />
              <span
                className="text-xs text-slate-400 font-bold uppercase tracking-widest"
              >
                PIPELINE LATENCY
              </span>
            </div>

            {latency !== null && latency !== undefined ? (
              <div className="mt-1 text-xs text-slate-500">
                {latency} ms pipeline delay
              </div>
            ) : (
              <div className="mt-1 text-xs text-slate-500">
                Latency unavailable
              </div>
            )}

          </div>

        </div>

      </section>


      {/* =================================================
          VEHICLE INFORMATION
      ================================================= */}

      <section className="mt-6">

        <h4
          className="
            text-sm
            font-bold
            uppercase
            tracking-widest
            text-slate-400
            mb-3
            border-b border-white/5
            pb-2
          "
        >
          Vehicle Information
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <div className="space-y-3">

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">VIN</p>
              <p className="text-lg font-medium text-white">{liveData?.VIN || "—"}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">IMEI</p>
              <p className="text-lg font-medium text-white">{liveData?.IMEI || "—"}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">VCUID</p>
              <p className="text-lg font-medium text-white">{liveData?.VCUID || "—"}</p>
            </div>

          </div>

          <div className="space-y-3">

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">VCU Firmware</p>
              <p className="text-lg font-medium text-white">{liveData?.vcuFirmwareVersion || "—"}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Odometer</p>
              <p className="text-lg font-medium text-white">
                {liveData?.odometer ?? 0} km
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div
        className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between"
      >



        <span
          className="text-xs font-mono uppercase tracking-widest text-slate-500"
        >
          RORR TELEMATICS
        </span>

        <span
          className="text-xs font-mono text-slate-500"
        >
          LAST UPDATE:{" "}
          {formatTime(liveData?.lastUpdate)}
        </span>

      </div>

    </GlassCard>
  );
}