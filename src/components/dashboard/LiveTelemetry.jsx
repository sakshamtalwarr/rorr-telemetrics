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


function State({
  label,
  value,
  ok = true,
  warning = false,
}) {
  return (
    <div
      className="
        rounded-xl
        border border-white/5
        bg-black/25
        px-3 py-2.5
      "
    >
      <div
        className="
          flex items-center gap-2
          text-[7px]
          font-bold
          uppercase
          tracking-widest
          text-slate-600
        "
      >
        <span
          className={`
            h-1.5 w-1.5 rounded-full
            ${
              warning
                ? "bg-amber-400"
                : ok
                  ? "bg-emerald-400"
                  : "bg-red-400"
            }
          `}
        />

        {label}
      </div>

      <div
        className={`
          mt-1.5
          text-[10px]
          font-bold
          ${
            warning
              ? "text-amber-400"
              : ok
                ? "text-emerald-400"
                : "text-red-400"
          }
        `}
      >
        {value}
      </div>
    </div>
  );
}


function InfoRow({
  label,
  value,
}) {
  return (
    <div
      className="
        flex items-center
        justify-between
        gap-4
        border-b border-white/[0.03]
        py-2
        last:border-0
      "
    >
      <span
        className="
          text-[8px]
          font-bold
          uppercase
          tracking-widest
          text-slate-600
        "
      >
        {label}
      </span>

      <span
        className="
          max-w-[65%]
          truncate
          text-right
          text-[9px]
          font-mono
          text-slate-300
        "
      >
        {value || "--"}
      </span>
    </div>
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


  return (
    <GlassCard
      className="p-5"
      hover={false}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex flex-col
          gap-3
          border-b border-white/5
          pb-4
          md:flex-row
          md:items-center
          md:justify-between
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              rounded-lg
              bg-indigo-500/10
              p-2
            "
          >
            <Radio
              className="
                h-4 w-4
                text-indigo-400
              "
            />
          </div>

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
              className="
                mt-0.5
                text-[8px]
                font-mono
                tracking-widest
                text-slate-600
              "
            >
              LIVE TELEMATICS SYSTEM STATE
            </p>
          </div>

        </div>


        <div
          className="
            flex items-center gap-2
            rounded-full
            border border-white/5
            bg-black/30
            px-3 py-1.5
          "
        >

          <span
            className={`
              h-1.5 w-1.5
              rounded-full
              ${
                isActive
                  ? "animate-pulse bg-emerald-400"
                  : "bg-amber-400"
              }
            `}
          />

          <span
            className="
              text-[8px]
              font-bold
              uppercase
              tracking-widest
              text-slate-400
            "
          >
            {connectionStatus}
          </span>

        </div>

      </div>


      {/* =================================================
          VEHICLE STATE
      ================================================= */}

      <section className="mt-5">

        <SectionTitle
          icon={Activity}
          title="Vehicle State"
        />

        <div
          className="
            mt-3
            grid
            grid-cols-2
            gap-2
            sm:grid-cols-4
          "
        >

          <State
            label="Operating Mode"
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
            warning={liveData?.ignition}
          />

          <State
            label="Charger"
            value={
              liveData?.chargerConnected
                ? "CONNECTED"
                : "DISCONNECTED"
            }
            ok={!liveData?.chargerConnected}
            warning={liveData?.chargerConnected}
          />

          <State
            label="Side Stand"
            value={
              liveData?.sideStandStatus
                ? "DOWN"
                : "UP"
            }
            ok={!liveData?.sideStandStatus}
            warning={liveData?.sideStandStatus}
          />

          <State
            label="Kill Switch"
            value={
              liveData?.killSwitchStatus
                ? "ACTIVE"
                : "NORMAL"
            }
            ok={!liveData?.killSwitchStatus}
            warning={liveData?.killSwitchStatus}
          />

          <State
            label="Safe Mode"
            value={
              liveData?.safeMode
                ? "ACTIVE"
                : "OFF"
            }
            ok={!liveData?.safeMode}
            warning={liveData?.safeMode}
          />

          <State
            label="Immobilizer"
            value={
              liveData?.immobilize
                ? "ACTIVE"
                : "OFF"
            }
            ok={!liveData?.immobilize}
            warning={liveData?.immobilize}
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

        <SectionTitle
          icon={Zap}
          title="Electrical & Sensor Status"
        />

        <div
          className="
            mt-3
            grid
            grid-cols-2
            gap-2
            sm:grid-cols-4
          "
        >

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

        <SectionTitle
          icon={
            hasError
              ? Shield
              : Cpu
          }
          title="System Health"
        />

        <div
          className="
            mt-3
            grid
            grid-cols-1
            gap-3
            lg:grid-cols-2
          "
        >

          {/* ERROR */}

          <div
            className={`
              rounded-xl
              border
              p-4
              ${
                hasError || hasSensorFault
                  ? "border-red-500/30 bg-red-500/[0.05]"
                  : "border-emerald-500/20 bg-emerald-500/[0.04]"
              }
            `}
          >

            <div
              className="
                flex items-center gap-2
              "
            >

              <Shield
                className={`
                  h-4 w-4
                  ${
                    hasError || hasSensorFault
                      ? "text-red-400"
                      : "text-emerald-400"
                  }
                `}
              />

              <span
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-widest
                  text-slate-400
                "
              >
                System Faults
              </span>

            </div>

            <p
              className={`
                mt-2
                text-xs
                font-bold
                ${
                  hasError || hasSensorFault
                    ? "text-red-400"
                    : "text-emerald-400"
                }
              `}
            >
              {hasError
                ? liveData.error
                : hasSensorFault
                  ? "Sensor fault detected"
                  : "No active faults"}
            </p>

          </div>


          {/* SESSION */}

          <div
            className="
              rounded-xl
              border border-white/5
              bg-black/20
              p-4
            "
          >

            <div
              className="
                flex items-center gap-2
              "
            >

              <Gauge
                className="
                  h-4 w-4
                  text-indigo-400
                "
              />

              <span
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-widest
                  text-slate-400
                "
              >
                Current Session
              </span>

            </div>

            <div
              className="
                mt-3
                grid grid-cols-3
                gap-3
              "
            >

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
                value={
                  session.telemetryPackets || 0
                }
              />

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          TELEMETRY PIPELINE
      ================================================= */}

      <section className="mt-6">

        <SectionTitle
          icon={Timer}
          title="Telemetry Pipeline"
        />

        <div
          className="
            mt-3
            grid
            grid-cols-1
            gap-2
            md:grid-cols-3
          "
        >

          <PipelineItem
            label="PACKET CREATED"
            value={
              formatTime(
                liveData?.packetCreatedAt
              )
            }
            sub={
              formatDate(
                liveData?.packetCreatedAt
              )
            }
          />

          <PipelineItem
            label="FLINK RECEIVED"
            value={
              formatTime(
                liveData?.flinkReceivedAt
              )
            }
            sub={
              formatDate(
                liveData?.flinkReceivedAt
              )
            }
          />

          <PipelineItem
            label="MONGO RECEIVED"
            value={
              formatTime(
                liveData?.mongoReceivedAt
              )
            }
            sub={
              latency === null ||
              latency === undefined
                ? "Latency unavailable"
                : `${latency} ms pipeline delay`
            }
          />

        </div>

      </section>


      {/* =================================================
          VEHICLE INFORMATION
      ================================================= */}

      <section className="mt-6">

        <SectionTitle
          icon={Cpu}
          title="Vehicle Information"
        />

        <div
          className="
            mt-3
            grid
            grid-cols-1
            gap-x-6
            rounded-xl
            border border-white/5
            bg-black/20
            px-4
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >

          <InfoRow
            label="VIN"
            value={liveData?.VIN}
          />

          <InfoRow
            label="IMEI"
            value={liveData?.IMEI}
          />

          <InfoRow
            label="VCUID"
            value={liveData?.VCUID}
          />

          <InfoRow
            label="VCU Firmware"
            value={
              liveData?.vcuFirmwareVersion
            }
          />

          <InfoRow
            label="Odometer"
            value={
              `${liveData?.odometer ?? 0} km`
            }
          />

          <InfoRow
            label="Latitude"
            value={
              liveData?.latitude
                ? liveData.latitude.toFixed(6)
                : "--"
            }
          />

          <InfoRow
            label="Longitude"
            value={
              liveData?.longitude
                ? liveData.longitude.toFixed(6)
                : "--"
            }
          />

          <InfoRow
            label="Last Update"
            value={
              formatTime(
                liveData?.lastUpdate
              )
            }
          />

        </div>

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div
        className="
          mt-5
          flex
          items-center
          justify-between
          border-t border-white/5
          pt-4
        "
      >

        <span
          className="
            text-[7px]
            font-mono
            uppercase
            tracking-widest
            text-slate-700
          "
        >
          RORR TELEMATICS
        </span>

        <span
          className="
            text-[7px]
            font-mono
            text-slate-700
          "
        >
          LAST TELEMETRY:{" "}
          {formatTime(
            liveData?.lastUpdate
          )}
        </span>

      </div>

    </GlassCard>
  );
}


// =====================================================
// SECTION TITLE
// =====================================================

function SectionTitle({
  icon: Icon,
  title,
}) {
  return (
    <div
      className="
        flex items-center gap-2
      "
    >

      <Icon
        className="
          h-3.5 w-3.5
          text-indigo-400
        "
      />

      <span
        className="
          text-[9px]
          font-bold
          uppercase
          tracking-widest
          text-slate-400
        "
      >
        {title}
      </span>

    </div>
  );
}


// =====================================================
// PIPELINE ITEM
// =====================================================

function PipelineItem({
  label,
  value,
  sub,
}) {
  return (
    <div
      className="
        rounded-xl
        border border-white/5
        bg-black/20
        px-4 py-3
      "
    >

      <div
        className="
          text-[7px]
          font-bold
          uppercase
          tracking-widest
          text-slate-600
        "
      >
        {label}
      </div>

      <div
        className="
          mt-1.5
          text-sm
          font-black
          text-slate-300
        "
      >
        {value}
      </div>

      <div
        className="
          mt-0.5
          text-[7px]
          font-mono
          text-slate-600
        "
      >
        {sub}
      </div>

    </div>
  );
}


// =====================================================
// MINI STAT
// =====================================================

function MiniStat({
  label,
  value,
}) {
  return (
    <div>

      <div
        className="
          text-[7px]
          font-bold
          tracking-widest
          text-slate-700
        "
      >
        {label}
      </div>

      <div
        className="
          mt-1
          text-xs
          font-black
          text-slate-300
        "
      >
        {value}
      </div>

    </div>
  );
}