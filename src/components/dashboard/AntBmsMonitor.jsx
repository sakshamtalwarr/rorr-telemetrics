import { useState } from "react";
import {
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Zap,
  Battery,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronDown,
  Info,
} from "lucide-react";

import GlassCard from "../common/GlassCard";
import useAntBms from "../../hooks/useAntBms";

export default function AntBmsMonitor() {
  const {
    status,
    deviceName,
    bmsData,
    errorMessage,
    isSupported,
    connect,
    disconnect,
    toggleDemo,
  } = useAntBms();

  const [showAllDevices, setShowAllDevices] = useState(false);

  const isConnected = status === "connected" || status === "demo";
  const isDemo = status === "demo";

  // Calculate cell bar fill percentage (LFP standard 3.0V to 3.65V)
  function getCellPercentage(volts) {
    const min = 3.0;
    const max = 3.65;
    const pct = ((volts - min) / (max - min)) * 100;
    return Math.min(100, Math.max(8, pct));
  }

  return (
    <GlassCard variant="default" className="p-5 sm:p-7 space-y-6">
      {/* =========================================================
          HEADER: ANT BMS BLE STATUS & PAIRING CONTROLS
      ========================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-red-500/15">
        <div className="flex items-center gap-3">
          <div
            className={`
              w-12 h-12 rounded-2xl flex items-center justify-center
              shadow-md transition-colors
              ${
                isConnected
                  ? "bg-red-600 text-white shadow-[0_0_16px_rgba(220,38,38,0.5)]"
                  : "bg-black/50 text-slate-400 border border-white/10"
              }
            `}
          >
            {isConnected ? (
              <BluetoothConnected className="w-6 h-6 animate-pulse" />
            ) : (
              <Bluetooth className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                ANT BMS Smart Battery Interface
              </h3>
              <span
                className={`
                  px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border
                  ${
                    isConnected
                      ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-400"
                      : "bg-red-950/40 border-red-500/30 text-red-400"
                  }
                `}
              >
                {status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {deviceName || "Direct Bluetooth Low Energy telemetry receiver"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {!isConnected ? (
            <>
              <button
                type="button"
                onClick={() => connect(showAllDevices)}
                disabled={status === "connecting"}
                className="
                  clay-button-danger
                  flex-1 sm:flex-none
                  px-4 py-2.5 rounded-2xl
                  text-xs font-bold text-white
                  flex items-center justify-center gap-2
                  shadow-[0_4px_12px_rgba(220,38,38,0.4)]
                "
              >
                <Bluetooth className="w-4 h-4" />
                <span>{status === "connecting" ? "Pairing..." : "Connect ANT BMS"}</span>
              </button>

              <button
                type="button"
                onClick={toggleDemo}
                className="
                  clay-button
                  px-3 py-2.5 rounded-2xl
                  bg-[#1A1D28] hover:bg-[#222636]
                  text-xs font-bold text-slate-300
                  border border-white/10
                  flex items-center gap-1.5
                "
                title="Test with simulated 20S Pack data"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Pack</span>
              </button>
            </>
          ) : (
            <>
              {isDemo && (
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
                  Demo Simulation
                </span>
              )}
              <button
                type="button"
                onClick={disconnect}
                className="
                  clay-button
                  px-4 py-2 rounded-2xl
                  bg-black/60 hover:bg-black/80
                  text-xs font-bold text-red-400
                  border border-red-500/30
                  flex items-center gap-1.5
                "
              >
                <BluetoothOff className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error or Browser Warning Notification */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!isSupported && (
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Note: On iPhone (Safari), Web Bluetooth requires the free <strong>Bluefy browser</strong> or native app. 
            On Android (Pixel 7) and PC/Mac, it works natively in Chrome!
          </span>
        </div>
      )}

      {/* =========================================================
          KEY STATS ROW (DUALTONE CLAYMETRICS)
      ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-black/40 border border-red-500/20 shadow-inner">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Pack Voltage
          </span>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">
            {bmsData.totalVoltage} <span className="text-xs text-slate-400 font-semibold">V</span>
          </p>
          <span className="text-[10px] text-red-400 font-mono mt-0.5 block">
            {bmsData.cellCount}S Pack
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-red-500/20 shadow-inner">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Real-Time Current
          </span>
          <p
            className={`text-xl sm:text-2xl font-black mt-1 ${
              bmsData.current > 0
                ? "text-emerald-400"
                : bmsData.current < 0
                ? "text-red-400"
                : "text-slate-300"
            }`}
          >
            {bmsData.current > 0 ? `+${bmsData.current}` : bmsData.current}{" "}
            <span className="text-xs font-semibold">A</span>
          </p>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
            {bmsData.current > 0 ? "Charging" : bmsData.current < 0 ? "Discharging" : "Idle"}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-red-500/20 shadow-inner">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Power Flow
          </span>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">
            {(Math.abs(bmsData.powerWatts) / 1000).toFixed(2)}{" "}
            <span className="text-xs text-slate-400 font-semibold">kW</span>
          </p>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
            {Math.abs(bmsData.powerWatts)} Watts
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-red-500/20 shadow-inner">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Cell Delta
          </span>
          <p
            className={`text-xl sm:text-2xl font-black mt-1 ${
              bmsData.deltaMv < 30
                ? "text-emerald-400"
                : bmsData.deltaMv < 60
                ? "text-amber-400"
                : "text-red-400"
            }`}
          >
            {bmsData.deltaMv}{" "}
            <span className="text-xs font-semibold text-slate-400">mV</span>
          </p>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
            {bmsData.deltaMv < 30 ? "Balanced" : "Balancing Req."}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-red-500/20 shadow-inner">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            MOSFET Temp
          </span>
          <p
            className={`text-xl sm:text-2xl font-black mt-1 ${
              bmsData.mosTemp > 65 ? "text-red-400" : "text-white"
            }`}
          >
            {bmsData.mosTemp}°{" "}
            <span className="text-xs font-semibold text-slate-400">C</span>
          </p>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
            Power Switch MOS
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-red-500/20 shadow-inner">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Remaining Ah
          </span>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">
            {bmsData.remainingAh}{" "}
            <span className="text-xs font-semibold text-slate-400">Ah</span>
          </p>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
            of {bmsData.totalAh} Ah
          </span>
        </div>
      </div>

      {/* =========================================================
          INDIVIDUAL CELL VOLTAGE MATRIX (20S PACK)
      ========================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-400" />
            <h4 className="font-bold text-white text-sm">
              Individual Cell Voltages ({bmsData.cells.length}S Configuration)
            </h4>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Highest: C{bmsData.maxIndex} ({bmsData.maxCell}V)
            </span>
            <span className="flex items-center gap-1.5 text-sky-300">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Lowest: C{bmsData.minIndex} ({bmsData.minCell}V)
            </span>
          </div>
        </div>

        {/* Cell Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-2.5">
          {bmsData.cells.map((volts, index) => {
            const cellNumber = index + 1;
            const isHighest = cellNumber === bmsData.maxIndex;
            const isLowest = cellNumber === bmsData.minIndex;
            const fillPct = getCellPercentage(volts);

            return (
              <div
                key={cellNumber}
                className={`
                  p-2.5 rounded-2xl
                  border transition-all
                  ${
                    isHighest
                      ? "bg-amber-950/30 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                      : isLowest
                      ? "bg-sky-950/30 border-sky-500/50 shadow-[0_0_12px_rgba(14,165,233,0.2)]"
                      : "bg-[#0E1017] border-white/5 hover:border-red-500/30"
                  }
                `}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span className="font-bold">C{cellNumber}</span>
                  {isHighest && (
                    <span className="text-[8px] font-bold text-amber-400 uppercase">MAX</span>
                  )}
                  {isLowest && (
                    <span className="text-[8px] font-bold text-sky-400 uppercase">MIN</span>
                  )}
                </div>

                <div className="text-xs sm:text-sm font-mono font-black text-white">
                  {volts.toFixed(3)}V
                </div>

                {/* Voltage Level Bar */}
                <div className="w-full bg-black/60 rounded-full h-1.5 mt-2 overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHighest
                        ? "bg-amber-400"
                        : isLowest
                        ? "bg-sky-400"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          BMS HARDWARE SWITCHES & SAFETY FLAGS
      ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-slate-300">Charge MOSFET</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
              bmsData.chargeMosfet
                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                : "bg-red-950/60 text-red-400 border border-red-500/30"
            }`}
          >
            {bmsData.chargeMosfet ? "ENABLED" : "DISABLED"}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-slate-300">Discharge MOSFET</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
              bmsData.dischargeMosfet
                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                : "bg-red-950/60 text-red-400 border border-red-500/30"
            }`}
          >
            {bmsData.dischargeMosfet ? "ENABLED" : "DISABLED"}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-slate-300">Battery Probes</span>
          </div>
          <span className="font-mono text-xs font-bold text-slate-200">
            T1: {bmsData.temp1}°C | T2: {bmsData.temp2}°C
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
