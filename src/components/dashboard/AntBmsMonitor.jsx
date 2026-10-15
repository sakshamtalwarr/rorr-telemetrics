import { useState } from "react";
import {
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Zap,
  Battery,
  Thermometer,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronDown,
  Info,
  Clock,
  Timer,
  Cpu,
  Repeat,
  Flame,
  Activity,
  CheckCircle2,
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
    if (!volts || volts <= 0) return 0;
    const min = 3.0;
    const max = 3.65;
    const pct = ((volts - min) / (max - min)) * 100;
    return Math.min(100, Math.max(8, pct));
  }

  // Active protections and warnings
  const warningsList = bmsData?.warnings || [];
  const protectionsList = bmsData?.protections || [];

  return (
    <GlassCard variant="default" className="p-5 sm:p-7 space-y-6" hover={false}>
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
                  ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)]"
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
                ANT Smart BMS Live Interface
              </h3>
              <span
                className={`
                  px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border
                  ${
                    isConnected
                      ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
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
                  flex-1 sm:flex-none px-4 py-2 rounded-xl
                  bg-red-600 hover:bg-red-500 text-white
                  font-bold text-xs tracking-wide
                  transition-all shadow-md active:scale-95
                  disabled:opacity-50 flex items-center justify-center gap-2
                "
              >
                <Bluetooth className="w-4 h-4" />
                <span>{status === "connecting" ? "Pairing..." : "Pair ANT BMS"}</span>
              </button>

              <button
                type="button"
                onClick={toggleDemo}
                className="
                  px-3 py-2 rounded-xl
                  bg-black/40 hover:bg-white/5 border border-red-500/30
                  text-red-300 font-bold text-xs
                  transition-all active:scale-95 flex items-center gap-1.5
                "
                title="Preview simulated 20S battery telemetry"
              >
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>Simulate Demo</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={disconnect}
                className="
                  px-4 py-2 rounded-xl
                  bg-black/60 hover:bg-red-950/40 border border-red-500/30
                  text-red-400 hover:text-red-300
                  font-bold text-xs transition-all active:scale-95 flex items-center gap-2
                "
              >
                <BluetoothOff className="w-4 h-4" />
                <span>{isDemo ? "Stop Demo" : "Disconnect"}</span>
              </button>

              {isDemo && (
                <button
                  type="button"
                  onClick={toggleDemo}
                  className="
                    px-3 py-2 rounded-xl bg-red-600/30 border border-red-500/40
                    text-red-300 text-xs font-bold transition-all active:scale-95
                  "
                >
                  <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                  Jitter Stream
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* =========================================================
          TOP SECTION: BATTERY STATUS, MOS SWITCHES & CHARGE PREDICTION
      ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Battery Mode & MOS Switch Matrix */}
        <div className="lg:col-span-8 p-4 sm:p-5 rounded-2xl bg-[#0F1017] border border-red-500/20 shadow-inner flex flex-col justify-between gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
            {/* Battery Mode Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Battery Status:
              </span>
              <span
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-black uppercase border
                  ${
                    bmsData.batteryStatus === "CHG"
                      ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                      : bmsData.batteryStatus === "DISCHG"
                      ? "bg-red-950/60 border-red-500/40 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                      : "bg-black/50 border-white/10 text-slate-400"
                  }
                `}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    bmsData.batteryStatus === "CHG"
                      ? "bg-emerald-400 animate-pulse"
                      : bmsData.batteryStatus === "DISCHG"
                      ? "bg-red-400"
                      : "bg-slate-500"
                  }`}
                />
                {isConnected ? bmsData.batteryStatus : "DISCONNECTED"}
              </span>
            </div>

            {/* MOS Switch Indicators */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    bmsData.chargeMos ? "bg-emerald-400" : "bg-slate-600"
                  }`}
                />
                <span className="text-slate-400">CHGMOS:</span>
                <span className={bmsData.chargeMos ? "text-emerald-400 font-bold" : "text-slate-500"}>
                  {bmsData.chargeMos ? "Open" : "Close"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    bmsData.dischargeMos ? "bg-emerald-400" : "bg-slate-600"
                  }`}
                />
                <span className="text-slate-400">DisMOS:</span>
                <span className={bmsData.dischargeMos ? "text-emerald-400 font-bold" : "text-slate-500"}>
                  {bmsData.dischargeMos ? "Open" : "Close"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    bmsData.balanceStatus ? "bg-purple-400 animate-pulse" : "bg-slate-600"
                  }`}
                />
                <span className="text-slate-400">Balancing:</span>
                <span className={bmsData.balanceStatus ? "text-purple-400 font-bold" : "text-slate-500"}>
                  {bmsData.balanceStatus ? "Active" : "Close"}
                </span>
              </div>
            </div>
          </div>

          {/* Charge Timers & Capacities */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                Total Pack Rating
              </span>
              <p className="text-base sm:text-lg font-black text-white font-mono mt-0.5">
                {bmsData.totalAh} <span className="text-xs font-semibold text-slate-400">AH</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                Remain Capacity
              </span>
              <p className="text-base sm:text-lg font-black text-amber-400 font-mono mt-0.5">
                {bmsData.remainingAh} <span className="text-xs font-semibold text-amber-300">AH</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                CHG Duration
              </span>
              <p className="text-sm sm:text-base font-black text-slate-200 font-mono mt-0.5">
                {bmsData.chargeDuration || "--"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                Time Remaining
              </span>
              <p className="text-sm sm:text-base font-black text-emerald-400 font-mono mt-0.5">
                {bmsData.chargeRemaining || "--"}
              </p>
            </div>
          </div>
        </div>

        {/* Right: SOC Circular Dial Gauge */}
        <div className="lg:col-span-4 p-4 sm:p-5 rounded-2xl bg-[#0F1017] border border-red-500/20 shadow-inner flex flex-col items-center justify-center text-center">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Background Track */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                className="text-black/60"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * bmsData.soc) / 100}
                strokeLinecap="round"
                className="text-red-500 transition-all duration-700 ease-out"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                {bmsData.soc}%
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Pack SOC
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 mt-2">
            Remaining: {bmsData.remainingAh} / {bmsData.totalAh} Ah
          </span>
        </div>
      </div>

      {/* =========================================================
          ELECTRICAL CORE MATRIX: 8 CRITICAL BMS METRICS (APP MATCH)
      ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
        {/* 1. PackV */}
        <div className="p-3.5 rounded-2xl bg-[#0E1018] border border-red-500/20 shadow-inner">
          <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>PackV</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-white font-mono mt-1">
            {bmsData.packVoltage} <span className="text-xs font-semibold text-slate-400">V</span>
          </p>
          <span className="text-[9px] text-slate-500 font-mono block">Pack Voltage</span>
        </div>

        {/* 2. Current */}
        <div className="p-3.5 rounded-2xl bg-[#0E1018] border border-red-500/20 shadow-inner">
          <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span>Current</span>
          </div>
          <p
            className={`text-lg sm:text-xl font-black font-mono mt-1 ${
              bmsData.current < 0
                ? "text-teal-400"
                : bmsData.current > 0
                ? "text-red-400"
                : "text-slate-300"
            }`}
          >
            {bmsData.current > 0 ? `+${bmsData.current}` : bmsData.current}{" "}
            <span className="text-xs font-semibold">A</span>
          </p>
          <span className="text-[9px] text-slate-500 font-mono block">
            {bmsData.current < 0 ? "Charging" : bmsData.current > 0 ? "Discharge" : "Idle"}
          </span>
        </div>

        {/* 3. Power */}
        <div className="p-3.5 rounded-2xl bg-[#0E1018] border border-red-500/20 shadow-inner">
          <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Power</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-white font-mono mt-1">
            {bmsData.powerWatts} <span className="text-xs font-semibold text-slate-400">W</span>
          </p>
          <span className="text-[9px] text-slate-500 font-mono block">
            {(Math.abs(bmsData.powerWatts) / 1000).toFixed(2)} kW Flow
          </span>
        </div>

        {/* 4. MaxunitV */}
        <div className="p-3.5 rounded-2xl bg-[#0E1018] border border-red-500/20 shadow-inner">
          <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span>MaxunitV</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-rose-400 font-mono mt-1">
            {bmsData.maxCell} <span className="text-xs font-semibold">V</span>
          </p>
          <span className="text-[9px] text-slate-500 font-mono block">
            Cell C{bmsData.maxIndex || 0}
          </span>
        </div>

        {/* 5. MinunitV */}
        <div className="p-3.5 rounded-2xl bg-[#0E1018] border border-red-500/20 shadow-inner">
          <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>MinunitV</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-amber-400 font-mono mt-1">
            {bmsData.minCell} <span className="text-xs font-semibold">V</span>
          </p>
          <span className="text-[9px] text-slate-500 font-mono block">
            Cell C{bmsData.minIndex || 0}
          </span>
        </div>

        {/* 6. AvgunitV */}
        <div className="p-3.5 rounded-2xl bg-[#0E1018] border border-red-500/20 shadow-inner">
          <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>AvgunitV</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-emerald-400 font-mono mt-1">
            {bmsData.avgCell} <span className="text-xs font-semibold">V</span>
          </p>
          <span className="text-[9px] text-slate-500 font-mono block">Pack Average</span>
        </div>

        {/* 7. unitVDiff */}
        <div className="p-3.5 rounded-2xl bg-[#0E1018] border border-red-500/20 shadow-inner">
          <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>unitVDiff</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-purple-400 font-mono mt-1">
            {bmsData.deltaV} <span className="text-xs font-semibold">V</span>
          </p>
          <span className="text-[9px] text-slate-500 font-mono block">
            {bmsData.deltaMv} mV Delta
          </span>
        </div>

        {/* 8. TotalCycle */}
        <div className="p-3.5 rounded-2xl bg-[#0E1018] border border-red-500/20 shadow-inner">
          <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
            <Repeat className="w-3.5 h-3.5 text-cyan-400" />
            <span>TotalCycle</span>
          </div>
          <p className="text-sm sm:text-base font-black text-cyan-300 font-mono mt-1.5 truncate">
            {bmsData.totalCycleAh}
          </p>
          <span className="text-[9px] text-slate-500 font-mono block">Throughput AH</span>
        </div>
      </div>

      {/* =========================================================
          PROTECTION & WARNING INFO FEEDS (APP MATCH)
      ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Protection Info */}
        <div className="p-4 rounded-2xl bg-[#0E1018] border border-red-500/20 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ProtectInfo
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              {protectionsList.length === 0 ? "Normal Operation" : `${protectionsList.length} Triggered`}
            </span>
          </div>

          <div className="min-h-[60px] flex flex-wrap items-center gap-2">
            {protectionsList.length > 0 ? (
              protectionsList.map((p, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono font-bold flex items-center gap-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  {p}
                </span>
              ))
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>All hardware protection parameters within safe factory thresholds.</span>
              </div>
            )}
          </div>
        </div>

        {/* Warning Info */}
        <div className="p-4 rounded-2xl bg-[#0E1018] border border-red-500/20 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              WarningInfo
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-400">
              {warningsList.length} Active Notice{warningsList.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="min-h-[60px] flex flex-wrap items-center gap-2">
            {warningsList.length > 0 ? (
              warningsList.map((w, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {w}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 py-1">
                No active BMS warnings or operational notices.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          6-ZONE THERMAL ARRAY (MOS, BALANCE, T1, T2, T3, T4)
      ========================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1017] border border-red-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-red-400" />
            <h4 className="font-bold text-white text-sm">
              6-Zone Multi-Probe Thermal Matrix
            </h4>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Active Hardware Probes
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          {/* MOS */}
          <div className="p-3 rounded-2xl bg-black/40 border border-red-500/20">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              MOS Temp
            </span>
            <p className="text-xl font-black text-sky-400 font-mono mt-1">
              {bmsData.mosTemp}°<span className="text-xs font-semibold text-slate-400">C</span>
            </p>
            <span className="text-[9px] text-slate-500 font-mono block">Power Switches</span>
          </div>

          {/* Balance Temp */}
          <div className="p-3 rounded-2xl bg-black/40 border border-red-500/20">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Balance Temp
            </span>
            <p className="text-xl font-black text-sky-400 font-mono mt-1">
              {bmsData.balanceTemp}°<span className="text-xs font-semibold text-slate-400">C</span>
            </p>
            <span className="text-[9px] text-slate-500 font-mono block">Bleed Circuit</span>
          </div>

          {/* T1 */}
          <div className="p-3 rounded-2xl bg-black/40 border border-red-500/20">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Probe T1
            </span>
            <p className="text-xl font-black text-sky-400 font-mono mt-1">
              {bmsData.temp1}°<span className="text-xs font-semibold text-slate-400">C</span>
            </p>
            <span className="text-[9px] text-slate-500 font-mono block">Pack Zone A</span>
          </div>

          {/* T2 */}
          <div className="p-3 rounded-2xl bg-black/40 border border-red-500/20">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Probe T2
            </span>
            <p className="text-xl font-black text-sky-400 font-mono mt-1">
              {bmsData.temp2}°<span className="text-xs font-semibold text-slate-400">C</span>
            </p>
            <span className="text-[9px] text-slate-500 font-mono block">Pack Zone B</span>
          </div>

          {/* T3 */}
          <div className="p-3 rounded-2xl bg-black/40 border border-red-500/20">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Probe T3
            </span>
            <p className="text-xl font-black text-sky-400 font-mono mt-1">
              {bmsData.temp3}°<span className="text-xs font-semibold text-slate-400">C</span>
            </p>
            <span className="text-[9px] text-slate-500 font-mono block">Pack Zone C</span>
          </div>

          {/* T4 */}
          <div className="p-3 rounded-2xl bg-black/40 border border-red-500/20">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Probe T4
            </span>
            <p className="text-xl font-black text-sky-400 font-mono mt-1">
              {bmsData.temp4}°<span className="text-xs font-semibold text-slate-400">C</span>
            </p>
            <span className="text-[9px] text-slate-500 font-mono block">Pack Zone D</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          INDIVIDUAL CELL VOLTAGE MATRIX (UnitV - 20S PACK)
      ========================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-red-400" />
            <h4 className="font-bold text-white text-sm">
              UnitV Individual Cell Matrix ({bmsData.cells.length}S LFP Configuration)
            </h4>
          </div>

          {isConnected ? (
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
          ) : (
            <div className="text-xs font-mono text-slate-500">
              Disconnected • All cells set to 0.000V
            </div>
          )}
        </div>

        {/* 2-Column / 4-Column Responsive Grid styled with IC Chip Icons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-2.5">
          {bmsData.cells.map((volts, index) => {
            const cellNumber = index + 1;
            const isHighest = isConnected && cellNumber === bmsData.maxIndex && volts > 0;
            const isLowest = isConnected && cellNumber === bmsData.minIndex && volts > 0;
            const fillPct = getCellPercentage(volts);

            return (
              <div
                key={cellNumber}
                className={`
                  p-2.5 rounded-2xl border transition-all
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
                  <div className="flex items-center gap-1">
                    <Cpu className={`w-3 h-3 ${isHighest ? "text-amber-400" : isLowest ? "text-sky-400" : "text-emerald-400"}`} />
                    <span className="font-bold">{cellNumber}</span>
                  </div>
                  {isHighest && (
                    <span className="text-[8px] font-bold text-amber-400 uppercase">MAX</span>
                  )}
                  {isLowest && (
                    <span className="text-[8px] font-bold text-sky-400 uppercase">MIN</span>
                  )}
                </div>

                <div
                  className={`text-xs sm:text-sm font-mono font-black ${
                    isHighest
                      ? "text-amber-300"
                      : isLowest
                      ? "text-sky-300"
                      : "text-white"
                  }`}
                >
                  {volts.toFixed(3)} V
                </div>

                {/* Voltage Fill Bar */}
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
    </GlassCard>
  );
}
