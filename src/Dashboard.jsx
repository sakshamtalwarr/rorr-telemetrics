import {
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  Battery,
  Gauge,
  Navigation,
  Thermometer,
  Zap,
  MapPin,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
} from "lucide-react";

import Header from "./components/dashboard/Header";
import Dock from "./components/dashboard/Dock";
import MetricCard from "./components/dashboard/MetricCard";
import VehicleActivity from "./components/dashboard/VehicleActivity";
import LiveTelemetry from "./components/dashboard/LiveTelemetry";
import GeofenceController from "./components/dashboard/GeofenceController";
import LiveMap from "./components/dashboard/LiveMap";
import SignalTrace from "./components/dashboard/SignalTrace";
import SubsystemArray from "./components/dashboard/SubsystemArray";
import FaultPanel from "./components/dashboard/FaultPanel";
import RidingTrends from "./components/dashboard/RidingTrends";
import TripLogs from "./components/dashboard/TripLogs";
import TripHistory from "./components/dashboard/TripHistory";
import Alerts from "./components/dashboard/Alerts";
import ProfilePanel from "./components/dashboard/ProfilePanel";
import MaintenanceTracker from "./components/dashboard/MaintenanceTracker";
import GlassCard from "./components/common/GlassCard";
import useVehicleTelemetry from "./hooks/useVehicleTelemetry";
import { vehicleApi } from "./services/vehicleApi";

// =====================================================
// INITIAL GEOFENCE
// =====================================================

const INITIAL_GEOFENCE = {
  geofenceId: null,
  name: "My Geofence",
  lat: null,
  lng: null,
  radius: 500,
  enabled: false,
  notify: {
    entry: true,
    exit: true,
  },
};

// =====================================================
// ROUTE MAPPING
// =====================================================

const VALID_PAGES = ["overview", "telemetry", "map", "rides", "vehicle"];

function getPageFromHash() {
  try {
    const rawHash = window.location.hash.replace(/^#\/?/, "").toLowerCase().trim();
    if (!rawHash) return "overview";

    // Handle common aliases
    if (rawHash === "home" || rawHash === "dashboard") return "overview";
    if (rawHash === "systems" || rawHash === "diagnostic") return "telemetry";
    if (rawHash === "geofence" || rawHash === "navigation") return "map";
    if (rawHash === "trips" || rawHash === "trends" || rawHash === "history") return "rides";
    if (rawHash === "profile" || rawHash === "maintenance") return "vehicle";

    if (VALID_PAGES.includes(rawHash)) {
      return rawHash;
    }
  } catch (err) {
    console.warn("Unable to parse hash:", err);
  }
  return "overview";
}

// =====================================================
// DASHBOARD COMPONENT
// =====================================================

export default function Dashboard({ profile, onLogout }) {
  // Telemetry Hook
  const { liveData, connectionStatus } = useVehicleTelemetry();

  // Dashboard Data State
  const [alerts, setAlerts] = useState([]);
  const [trips, setTrips] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [theme, setTheme] = useState("pastel");

  // Geofence State
  const [geofence, setGeofence] = useState(INITIAL_GEOFENCE);
  const [geofenceSaving, setGeofenceSaving] = useState(false);
  const [geofenceLoading, setGeofenceLoading] = useState(false);

  // URL Hash Routing State
  const [activePage, setActivePage] = useState(() => getPageFromHash());

  // Navigate function that updates URL hash & browser history
  const navigateTo = useCallback((page) => {
    if (!VALID_PAGES.includes(page)) return;
    setActivePage(page);
    if (window.location.hash !== `#/${page}`) {
      window.location.hash = `#/${page}`;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Listen to browser hash changes (back/forward buttons)
  useEffect(() => {
    function handleHashChange() {
      const page = getPageFromHash();
      setActivePage(page);
    }

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handleHashChange);

    // Ensure hash reflects state on initial load
    if (!window.location.hash) {
      window.history.replaceState(null, "", "#/overview");
    }

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handleHashChange);
    };
  }, []);

  // Get Vehicle ID
  const vehicleId =
    profile?.vehicleDetails?.[0]?.vehicleId ||
    profile?.vehicleDetails?.vehicleId ||
    liveData?.vehicleId ||
    null;

  // Load Dashboard Data (Trips & Alerts)
  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const [tripsResponse, alertsResponse] = await Promise.all([
          vehicleApi.getTrips(),
          vehicleApi.getAlerts(),
        ]);

        if (cancelled) return;

        if (Array.isArray(tripsResponse?.data)) {
          setTrips(tripsResponse.data);
        }

        const alertData = alertsResponse?.data?.getAlertLogsByImei?.data;
        if (Array.isArray(alertData)) {
          setAlerts(alertData);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("❌ Dashboard loading failed:", error);
        }
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load Geofence from Server
  useEffect(() => {
    let cancelled = false;

    async function loadGeofence() {
      if (!vehicleId) return;

      try {
        setGeofenceLoading(true);
        const response = await vehicleApi.getGeofences(vehicleId);
        if (cancelled) return;

        const fences =
          response?.data?.getGeofences ||
          response?.getGeofences ||
          response?.data ||
          [];

        if (!Array.isArray(fences) || fences.length === 0) return;

        const serverGeofence = fences[0];
        const mappedGeofence = {
          geofenceId: serverGeofence.geofenceId || null,
          name: serverGeofence.name || "My Geofence",
          lat: Number(serverGeofence.latitude),
          lng: Number(serverGeofence.longitude),
          radius: Number(serverGeofence.radius) || 500,
          enabled: true,
          notify: {
            entry: serverGeofence.notify?.entry ?? true,
            exit: serverGeofence.notify?.exit ?? true,
          },
        };

        setGeofence(mappedGeofence);
      } catch (error) {
        if (!cancelled) {
          console.error("❌ Failed to load geofence:", error);
        }
      } finally {
        if (!cancelled) {
          setGeofenceLoading(false);
        }
      }
    }

    loadGeofence();
    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  // Geofence Handlers
  function changeGeofence(updatedGeofence) {
    if (!updatedGeofence) return;
    setGeofence((prev) => ({
      ...prev,
      ...updatedGeofence,
      notify: {
        ...prev.notify,
        ...updatedGeofence.notify,
      },
    }));
  }

  function changeGeofenceRadius(radius) {
    const numericRadius = Number(radius);
    if (!Number.isFinite(numericRadius)) return;
    setGeofence((prev) => ({
      ...prev,
      radius: numericRadius,
    }));
  }

  function changeGeofenceLocation(lat, lng) {
    const numericLat = Number(lat);
    const numericLng = Number(lng);
    if (!Number.isFinite(numericLat) || !Number.isFinite(numericLng)) return;

    setGeofence((prev) => ({
      ...prev,
      lat: numericLat,
      lng: numericLng,
    }));
  }

  function useBikeLocationForGeofence() {
    const lat = Number(liveData?.latitude);
    const lng = Number(liveData?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) {
      console.warn("GPS coordinates unavailable");
      return;
    }

    setGeofence((prev) => ({
      ...prev,
      lat,
      lng,
    }));
  }

  function toggleGeofence() {
    setGeofence((prev) => ({
      ...prev,
      enabled: !prev.enabled,
    }));
  }

  async function saveGeofence() {
    if (!geofence?.geofenceId) return;
    if (!Number.isFinite(Number(geofence.lat)) || !Number.isFinite(Number(geofence.lng))) return;
    if (!Number.isFinite(Number(geofence.radius))) return;

    try {
      setGeofenceSaving(true);
      const response = await vehicleApi.updateGeofence(geofence);
      const updatedFence = response?.data?.updateGeofence || response?.updateGeofence || null;

      if (updatedFence) {
        setGeofence((prev) => ({
          ...prev,
          name: updatedFence.name || prev.name,
          lat: Number(updatedFence.latitude) || prev.lat,
          lng: Number(updatedFence.longitude) || prev.lng,
          radius: Number(updatedFence.radius) || prev.radius,
        }));
      }
    } catch (error) {
      console.error("❌ Geofence update failed:", error);
    } finally {
      setGeofenceSaving(false);
    }
  }

  return (
    <div
      className={`
        min-h-screen w-full
        font-sans
        transition-colors duration-500
        ${theme === "pastel" ? "clay-pastel-theme" : "clay-dark-theme"}
        px-3 sm:px-6
        pt-2 sm:pt-4
        pb-28 md:pb-12
        overflow-x-hidden
        relative
      `}
      style={{
        paddingTop: "calc(0.5rem + env(safe-area-inset-top, 0px))",
      }}
    >
      {/* Ambient background clay lighting */}
      <div className="clay-ambient-glows pointer-events-none" />

      {/* Floating Header */}
      <Header
        vehicle={{
          VIN: liveData?.VIN || liveData?.vin || null,
        }}
        connectionStatus={connectionStatus}
        profile={profile}
        activePage={activePage}
        onNavigate={navigateTo}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "pastel" ? "dark" : "pastel"))}
        onProfileClick={() => navigateTo("vehicle")}
        onLogout={onLogout}
      />

      {/* Page Title & Breadcrumb Indicator */}
      <div className="max-w-[1400px] mx-auto mt-4 mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          <h2 className="text-lg sm:text-2xl font-black tracking-tight text-slate-800 capitalize">
            {activePage === "map"
              ? "Live Map & Geofence"
              : activePage === "rides"
              ? "Riding Trends & Analytics"
              : activePage === "vehicle"
              ? "Vehicle & Maintenance"
              : activePage === "telemetry"
              ? "Live Telemetry & Diagnostics"
              : "Cockpit Overview"}
          </h2>
        </div>

        <div className="text-[11px] font-mono font-semibold text-slate-500 hidden sm:block">
          URL: <span className="text-indigo-600 bg-white/70 px-2 py-0.5 rounded-lg shadow-xs">#/{activePage}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto relative z-10 mt-3">
        {/* =========================================================
            PAGE 1: OVERVIEW (Compact Cockpit, No Endless Scrolling!)
        ========================================================= */}
        {activePage === "overview" && (
          <div className="space-y-4 sm:space-y-6 fade-in-scale">
            {/* Top Metric Cards - Responsive Grid */}
            <section
              className="
                grid
                grid-cols-2
                sm:grid-cols-2
                md:grid-cols-3
                lg:grid-cols-5
                gap-3 sm:gap-4
              "
            >
              <MetricCard
                title="Velocity"
                value={liveData?.speed ?? 0}
                unit="km/h"
                icon={Gauge}
                iconClass="text-sky-500"
                variant="sky"
              />

              <MetricCard
                title="Battery SoC"
                value={liveData?.soc ?? 0}
                unit="%"
                icon={Battery}
                iconClass={liveData?.soc < 20 ? "text-rose-500" : "text-emerald-500"}
                variant="mint"
              />

              <MetricCard
                title="Est. Range"
                value={liveData?.range ?? 0}
                unit="km"
                icon={Navigation}
                iconClass="text-indigo-500"
                variant="lavender"
              />

              <MetricCard
                title="Pack Voltage"
                value={liveData?.packVoltage ?? 0}
                unit="V"
                icon={Zap}
                iconClass="text-amber-500"
                variant="butter"
              />

              <MetricCard
                title="Motor Temp"
                value={liveData?.motorTemperature ?? 0}
                unit="°C"
                icon={Thermometer}
                iconClass={liveData?.motorTemperature > 80 ? "text-rose-500" : "text-orange-500"}
                variant="peach"
                className="col-span-2 sm:col-span-1 md:col-span-1"
              />
            </section>

            {/* Overview Cockpit Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              {/* Quick Map Preview & Shortcut */}
              <div className="lg:col-span-7">
                <GlassCard variant="default" className="p-5 sm:p-6 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700 shadow-xs">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                          GPS Location & Tracking
                        </h3>
                        <p className="text-xs text-slate-500">
                          Live coordinates & geofence monitor
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigateTo("map")}
                      className="
                        clay-button
                        px-3 py-1.5 rounded-2xl
                        bg-indigo-50 hover:bg-indigo-100
                        text-indigo-700 text-xs font-bold
                        flex items-center gap-1.5
                        shadow-[0_4px_10px_rgba(99,102,241,0.12),inset_0_1px_2px_rgba(255,255,255,0.9)]
                      "
                    >
                      <span>Full Map</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Compact Map Preview Banner */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 h-48 sm:h-56 mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-sky-500/10 to-emerald-500/10 flex flex-col items-center justify-center p-4 text-center">
                      <div className="p-3 rounded-full bg-white shadow-md text-emerald-600 mb-2 animate-bounce">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-mono font-bold text-slate-700">
                        {liveData?.latitude && liveData?.longitude
                          ? `${Number(liveData.latitude).toFixed(5)}° N, ${Number(liveData.longitude).toFixed(5)}° E`
                          : "Acquiring GPS Signal..."}
                      </p>
                      <span className="text-[11px] text-slate-500 mt-1">
                        Geofence: {geofence?.enabled ? `Active (${geofence.radius}m)` : "Disabled"}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                      <span className="px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-700 shadow-sm">
                        Odometer: {liveData?.odometer ?? 0} km
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md text-[10px] font-bold text-indigo-700 shadow-sm">
                        Ignition: {liveData?.ignition ? "ON" : "OFF"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>Last packet: {liveData?.packetCreatedAt ? new Date(liveData.packetCreatedAt).toLocaleTimeString() : "Live"}</span>
                    <button
                      type="button"
                      onClick={() => navigateTo("map")}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      Configure Geofence →
                    </button>
                  </div>
                </GlassCard>
              </div>

              {/* Subsystems Snapshot */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <GlassCard variant="lavender" className="p-5 sm:p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-2xl bg-indigo-100 text-indigo-700">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        Vehicle Core Status
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateTo("telemetry")}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Details →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-2xl bg-white/80 border border-white shadow-xs flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Ignition</span>
                      <span className={`font-bold px-2 py-0.5 rounded-lg text-[10px] ${liveData?.ignition ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                        {liveData?.ignition ? "ON" : "OFF"}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/80 border border-white shadow-xs flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Charger</span>
                      <span className={`font-bold px-2 py-0.5 rounded-lg text-[10px] ${liveData?.chargerConnected ? "bg-sky-100 text-sky-700" : "bg-slate-200 text-slate-600"}`}>
                        {liveData?.chargerConnected ? "PLUGGED" : "OFF"}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/80 border border-white shadow-xs flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Side Stand</span>
                      <span className={`font-bold px-2 py-0.5 rounded-lg text-[10px] ${liveData?.sideStandStatus ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {liveData?.sideStandStatus ? "DOWN" : "UP"}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/80 border border-white shadow-xs flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Kill Switch</span>
                      <span className={`font-bold px-2 py-0.5 rounded-lg text-[10px] ${liveData?.killSwitchStatus ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {liveData?.killSwitchStatus ? "ENGAGED" : "OFF"}
                      </span>
                    </div>
                  </div>
                </GlassCard>

                {/* Quick Diagnostics Snapshot */}
                <GlassCard variant="mint" className="p-5 sm:p-6 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                        <Activity className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        Health & Maintenance
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateTo("vehicle")}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      Service Log →
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/80 border border-white">
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium">System Health</p>
                      <p className="text-sm font-bold text-slate-800">
                        {liveData?.error && liveData.error !== "No error" ? liveData.error : "All Systems Nominal"}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                      READY
                    </span>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Alerts Banner (if present) */}
            {alerts.length > 0 && (
              <div className="mt-2">
                <Alerts alerts={alerts} />
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            PAGE 2: TELEMETRY & DIAGNOSTICS
        ========================================================= */}
        {activePage === "telemetry" && (
          <div className="space-y-6 fade-in-scale">
            <LiveTelemetry
              liveData={liveData}
              connectionStatus={connectionStatus}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <SubsystemArray liveData={liveData} />
              <FaultPanel liveData={liveData} />
            </div>

            <SignalTrace history={liveData?.history || []} />
          </div>
        )}

        {/* =========================================================
            PAGE 3: LIVE MAP & GEOFENCE
        ========================================================= */}
        {activePage === "map" && (
          <div className="space-y-6 fade-in-scale">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Full Interactive Map */}
              <div className="lg:col-span-8 min-w-0">
                <LiveMap
                  onGeofenceMove={changeGeofenceLocation}
                  onUseBikeLocation={useBikeLocationForGeofence}
                  latitude={liveData?.latitude}
                  longitude={liveData?.longitude}
                  address={null}
                  geofence={geofence}
                  speed={liveData?.speed}
                  batteryVoltage={liveData?.packVoltage}
                  SOC={liveData?.soc}
                  ignitionStatus={liveData?.ignitionStatus}
                  odometer={liveData?.odometer}
                  packetCreatedAt={liveData?.packetCreatedAt}
                  history={liveData?.history || []}
                />
              </div>

              {/* Geofence Controller Sidebar */}
              <div className="lg:col-span-4 min-w-0">
                <GeofenceController
                  geofence={geofence}
                  onChange={(val) => {
                    if (typeof val === "number") changeGeofenceRadius(val);
                    else changeGeofence(val);
                  }}
                  onToggle={toggleGeofence}
                  onSave={saveGeofence}
                  onUseBikeLocation={useBikeLocationForGeofence}
                  saving={geofenceSaving || geofenceLoading}
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            PAGE 4: RIDES & ANALYTICS
        ========================================================= */}
        {activePage === "rides" && (
          <div className="space-y-6 fade-in-scale">
            <TripHistory liveData={liveData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RidingTrends />
              <TripLogs trips={trips} />
            </div>

            <VehicleActivity />
          </div>
        )}

        {/* =========================================================
            PAGE 5: VEHICLE & MAINTENANCE & PROFILE
        ========================================================= */}
        {activePage === "vehicle" && (
          <div className="space-y-6 fade-in-scale">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ProfilePanel
                profile={profile}
                liveData={liveData}
                onLogout={onLogout}
              />

              <MaintenanceTracker odometer={liveData?.odometer ?? 0} />
            </div>

            {alerts.length > 0 && (
              <Alerts alerts={alerts} />
            )}
          </div>
        )}
      </main>

      {/* Floating Bottom Dock (Mobile & Handheld Navigation) */}
      <Dock activePage={activePage} onNavigate={navigateTo} />
    </div>
  );
}