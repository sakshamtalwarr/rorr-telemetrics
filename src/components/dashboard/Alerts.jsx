import { useState, useEffect } from "react";
import {
  BellRing,
  AlertTriangle,
  ShieldAlert,
  Flame,
  BatteryWarning,
  Zap,
  MapPin,
  FileText,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
  PhoneCall,
  Clock,
  Radio,
  ExternalLink,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

import GlassCard from "../common/GlassCard";

// =====================================================
// AUTHENTIC OBEN TELEMATICS ALERT TYPES & TEMPLATES
// Sourced from Oben Electric.apk Hermes Bytecode
// =====================================================

export const DEFAULT_OBEN_ALERTS = [
  {
    packetId: "alert_fall_sos_demo",
    title: "🚨 Fall / Crash Detected - Emergency SOS Triggered",
    content: "TCU 6-axis IMU detected severe vehicle tilt & sudden deceleration. Emergency contacts countdown initialized.",
    severity: "HIGH",
    subType: "FALL_DETECTION",
    category: "safety",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    isResolved: false,
    actionRequired: "SOS_COUNTDOWN",
  },
  {
    packetId: "alert_theft_movement",
    title: "⚠️ Theft Warning: Unauthorized Movement Detected",
    content: "Vehicle motion detected while Handlebar Lock & Electronic Ignition are locked at Uttam Nagar Indra Park.",
    severity: "HIGH",
    subType: "THEFT_DETECTION",
    category: "theft",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    isResolved: false,
    actionRequired: "VIEW_MAP",
  },
  {
    packetId: "alert_safe_mode_vcu",
    title: "🛡️ Safe Mode / Limp Mode Active",
    content: "Thermal threshold reached on motor controller. Top speed temporarily capped at 35 km/h to protect battery cells.",
    severity: "HIGH",
    subType: "SAFE_MODE",
    category: "system",
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    isResolved: false,
    actionRequired: "RESET_SAFE_MODE",
  },
  {
    packetId: "alert_geofence_exit",
    title: "📍 Geofence Exit: West Delhi Perimeter",
    content: "Oben Rorr exited your designated 500m Home Geofence (28.6236° N, 77.0673° E).",
    severity: "MEDIUM",
    subType: "GEOFENCE_BREACH",
    category: "geofence",
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    isResolved: true,
    actionRequired: "VIEW_MAP",
  },
  {
    packetId: "alert_charging_milestone",
    title: "⚡ Fast Charging 80% Milestone Reached",
    content: "4.4 kWh LFP battery reached 80% SoC. Onboard charger is now trickle-balancing individual cell voltages.",
    severity: "LOW",
    subType: "CHARGING_MILESTONE",
    category: "battery",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    isResolved: true,
  },
  {
    packetId: "alert_battery_low_soc",
    title: "🔋 Low Battery Warning (< 20% SoC)",
    content: "Battery level is 18%. Estimated distance to empty is 24 km. Charge soon to prevent cell under-voltage.",
    severity: "MEDIUM",
    subType: "LOW_BATTERY",
    category: "battery",
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
    isResolved: true,
  },
  {
    packetId: "alert_doc_insurance_active",
    title: "📄 Vehicle Insurance Validity Active",
    content: "ICICI Lombard Comprehensive Policy 3005/360654870/00/000 registered for DL8EV2219 is valid until 19-Sep-2029.",
    severity: "LOW",
    subType: "DOCUMENT_EXPIRY",
    category: "docs",
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    isResolved: true,
  },
];

const CATEGORIES = [
  { id: "all", label: "All Alerts" },
  { id: "safety", label: "🚨 Crash & Fall" },
  { id: "theft", label: "⚠️ Theft Guard" },
  { id: "battery", label: "⚡ Battery & Power" },
  { id: "geofence", label: "📍 Geofence" },
  { id: "docs", label: "📄 Documents" },
];

export default function Alerts({ alerts = [], onNavigate = null }) {
  const [alertList, setAlertList] = useState(() => {
    if (Array.isArray(alerts) && alerts.length > 0) return alerts;
    return DEFAULT_OBEN_ALERTS;
  });

  const [activeCategory, setActiveCategory] = useState("all");
  const [sosCountdown, setSosCountdown] = useState(null); // null or number of seconds (e.g. 30)
  const [sosDispatched, setSosDispatched] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  // Sync incoming server alerts if provided
  useEffect(() => {
    if (Array.isArray(alerts) && alerts.length > 0) {
      setAlertList((prev) => {
        const merged = [...alerts];
        DEFAULT_OBEN_ALERTS.forEach((da) => {
          if (!merged.some((m) => m.packetId === da.packetId || m.title === da.title)) {
            merged.push(da);
          }
        });
        return merged;
      });
    }
  }, [alerts]);

  // SOS Countdown Timer effect
  useEffect(() => {
    let timer = null;
    if (sosCountdown !== null && sosCountdown > 0) {
      timer = setTimeout(() => {
        setSosCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (sosCountdown === 0) {
      setSosDispatched(true);
    }
    return () => clearTimeout(timer);
  }, [sosCountdown]);

  const handleStartSosSimulation = () => {
    setSosCountdown(30);
    setSosDispatched(false);
  };

  const handleCancelSos = () => {
    setSosCountdown(null);
    setSosDispatched(false);
  };

  const handleResolveAlert = (packetId) => {
    setAlertList((prev) =>
      prev.map((a) => (a.packetId === packetId ? { ...a, isResolved: true } : a))
    );
  };

  const handleClearResolved = () => {
    setAlertList((prev) => prev.filter((a) => !a.isResolved));
  };

  const filteredAlerts = alertList.filter((alert) => {
    if (activeCategory === "all") return true;
    if (alert.category === activeCategory) return true;
    if (activeCategory === "safety" && alert.subType === "FALL_DETECTION") return true;
    if (activeCategory === "theft" && alert.subType === "THEFT_DETECTION") return true;
    if (activeCategory === "battery" && (alert.subType === "CHARGING_MILESTONE" || alert.subType === "LOW_BATTERY" || alert.subType === "SAFE_MODE")) return true;
    if (activeCategory === "geofence" && alert.subType === "GEOFENCE_BREACH") return true;
    if (activeCategory === "docs" && alert.subType === "DOCUMENT_EXPIRY") return true;
    return false;
  });

  const highSeverityCount = alertList.filter((a) => a.severity === "HIGH" && !a.isResolved).length;

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${highSeverityCount > 0 ? "bg-red-600/30 border border-red-500/50 text-red-400" : "bg-black/60 border border-white/10 text-amber-400"}`}>
              <BellRing className={`w-5 h-5 ${highSeverityCount > 0 ? "animate-bounce" : ""}`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-100">
                  Oben Active Safety & Alerts
                </h3>
                {highSeverityCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold animate-pulse">
                    {highSeverityCount} Critical
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Onboard TCU IMU gyroscope, GPS anti-theft, & battery safety monitor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Fall Detection SOS Test Button */}
            <button
              type="button"
              onClick={handleStartSosSimulation}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-red-600/30"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Simulate Crash SOS</span>
            </button>

            {alertList.some((a) => a.isResolved) && (
              <button
                type="button"
                onClick={handleClearResolved}
                className="px-2.5 py-1.5 rounded-xl bg-black/60 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-xs font-mono transition"
              >
                Clear Resolved
              </button>
            )}
          </div>
        </div>

        {/* CATEGORY FILTER CHIPS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 custom-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  shrink-0 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border
                  ${
                    isActive
                      ? "bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30 scale-102"
                      : "bg-black/50 text-slate-400 border-white/10 hover:text-white hover:border-red-500/30"
                  }
                `}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ALERTS STREAM LIST */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert, index) => {
              const isHigh = alert.severity === "HIGH";
              const isMedium = alert.severity === "MEDIUM";

              return (
                <div
                  key={alert.packetId ?? index}
                  className={`
                    p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col gap-2.5
                    ${
                      isHigh
                        ? "bg-gradient-to-r from-red-950/40 via-black/80 to-black/60 border-red-500/40 shadow-sm shadow-red-950/40"
                        : isMedium
                        ? "bg-gradient-to-r from-amber-950/25 via-black/70 to-black/60 border-amber-500/30"
                        : "bg-black/40 border-white/10 hover:border-white/20"
                    }
                    ${alert.isResolved ? "opacity-60 grayscale-[40%]" : ""}
                  `}
                >
                  {/* Left Edge Severity Indicator */}
                  <div
                    className={`
                      absolute left-0 top-0 bottom-0 w-1.5
                      ${
                        isHigh
                          ? "bg-red-500"
                          : isMedium
                          ? "bg-amber-400"
                          : "bg-emerald-500"
                      }
                    `}
                  />

                  <div className="flex items-start justify-between gap-3 pl-2">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {isHigh ? (
                          <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
                        ) : isMedium ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                          <span>{alert.title}</span>
                          {alert.isResolved && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-400 font-normal">
                              Resolved
                            </span>
                          )}
                        </h4>

                        <p className="text-xs text-slate-300/90 leading-relaxed mt-1">
                          {alert.content}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {new Date(alert.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* ACTION FOOTER */}
                  <div className="flex items-center justify-between pl-2 pt-1 border-t border-white/5 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                        {alert.subType}
                      </span>
                      <span className={`text-[9px] font-mono font-bold ${isHigh ? "text-red-400" : isMedium ? "text-amber-400" : "text-emerald-400"}`}>
                        {alert.severity} PRIORITY
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Action Triggers */}
                      {alert.subType === "FALL_DETECTION" && !alert.isResolved && (
                        <button
                          type="button"
                          onClick={handleStartSosSimulation}
                          className="px-2.5 py-1 rounded-xl bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white font-bold text-[11px] border border-red-500/40 transition active:scale-95"
                        >
                          View SOS Screen
                        </button>
                      )}

                      {(alert.subType === "THEFT_DETECTION" || alert.subType === "GEOFENCE_BREACH") && onNavigate && (
                        <button
                          type="button"
                          onClick={() => onNavigate("map")}
                          className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] flex items-center gap-1 transition"
                        >
                          <MapPin className="w-3 h-3 text-red-400" />
                          <span>Track GPS</span>
                        </button>
                      )}

                      {alert.subType === "SAFE_MODE" && (
                        <button
                          type="button"
                          onClick={() => {
                            alert("BLE Safe Mode Reset command sent to TCU.");
                            handleResolveAlert(alert.packetId);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] border border-amber-500/30 transition"
                        >
                          Reset Safe Mode
                        </button>
                      )}

                      {!alert.isResolved && (
                        <button
                          type="button"
                          onClick={() => handleResolveAlert(alert.packetId)}
                          className="text-slate-400 hover:text-slate-200 text-[10px] underline ml-1"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs p-6 text-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-500/50 mb-2" />
              <p className="text-slate-300 font-bold">No active alerts in this category.</p>
              <p className="text-[11px] text-slate-500 mt-0.5">All motorcycle sub-systems operating nominal.</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* =========================================================
          EMERGENCY FALL / CRASH DETECTION & SOS OVERLAY
          Exact replica of Oben Electric's showInAppFallAlert
      ========================================================= */}
      {sosCountdown !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-b from-red-950 via-[#120B0E] to-black border-2 border-red-500 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(239,68,68,0.7)] animate-pulse-glow flex flex-col items-center">
            
            {/* Siren Animation Icon */}
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center animate-ping absolute inset-0" />
              <div className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl relative z-10">
                <Flame className="w-10 h-10 animate-bounce" />
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-mono font-black tracking-widest uppercase mb-2">
              🚨 CRASH / FALL DETECTED
            </span>

            <h2 className="text-xl font-black text-white tracking-tight">
              Emergency SOS Initialized
            </h2>

            <p className="text-xs text-slate-300 mt-2 max-w-xs leading-relaxed">
              TCU IMU sensors recorded a vehicle fall. Unless canceled, your live GPS coordinates will be dispatched to your emergency contacts.
            </p>

            {/* Countdown Ring */}
            <div className="my-6 flex flex-col items-center justify-center">
              {!sosDispatched ? (
                <>
                  <div className="text-5xl font-black font-mono text-red-500 tracking-tighter animate-pulse">
                    00:{String(sosCountdown).padStart(2, "0")}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-widest">
                    Seconds to Emergency Dispatch
                  </span>
                </>
              ) : (
                <div className="p-4 rounded-2xl bg-red-600/20 border border-red-500 text-red-300 text-xs font-bold flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 animate-bounce" />
                  <span>SOS & GPS DISPATCHED TO CONTACTS</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleCancelSos}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wide transition-all shadow-lg shadow-emerald-600/40 active:scale-98"
              >
                I AM SAFE - CANCEL ALERT
              </button>

              {!sosDispatched && (
                <button
                  type="button"
                  onClick={() => setSosCountdown(0)}
                  className="w-full py-2.5 rounded-2xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-bold text-xs transition active:scale-98"
                >
                  DISPATCH SOS IMMEDIATELY
                </button>
              )}
            </div>

            {/* Audio Indicator */}
            <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <Volume2 className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>Playing falldetectionalertsound.mp3 (Max Volume)</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}