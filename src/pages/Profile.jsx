import {
  Bike,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  Cpu,
  Zap,
  Battery,
  Gauge,
  Activity,
  Award,
  Bell,
  FileText,
  LogOut,
  ChevronRight,
  Sparkles,
  MapPin,
} from "lucide-react";

import GlassCard from "../components/common/GlassCard";
import VehicleDocsWallet, { OFFICIAL_BIKE_RC } from "../components/profile/VehicleDocsWallet";

export default function Profile({
  profile,
  liveData,
  onLogout,
  onNavigate,
}) {
  const firstName = profile?.firstName || profile?.name?.split(" ")[0] || "Saksham";
  const lastName = profile?.lastName || profile?.name?.split(" ")[1] || "Talwar";
  const fullName = `${firstName} ${lastName}`.trim();
  const mobile = profile?.mobileNumber || OFFICIAL_BIKE_RC.rc_mobile_no;
  const email = profile?.email || "saksham.talwar@gmail.com";

  const vehicle = profile?.vehicleDetails?.[0] || profile?.vehicleDetails || {};
  const vin = vehicle?.VIN || liveData?.VIN || OFFICIAL_BIKE_RC.rc_chasi_no;
  const imei = vehicle?.IMEI || liveData?.IMEI || "864201948201948";
  const vcuId = vehicle?.VCUID || liveData?.VCUID || "VCU-RR-9042";
  const regNo = OFFICIAL_BIKE_RC.rc_regn_no;
  const motorNo = OFFICIAL_BIKE_RC.rc_eng_no;

  return (
    <div className="space-y-6 fade-in-scale max-w-5xl mx-auto pb-12">
      {/* =========================================================
          HERO BANNER: RED OBEN RORR ELECTRIC
      ========================================================= */}
      <div className="clay-card-hero-red rounded-3xl p-6 sm:p-8 relative overflow-hidden text-white shadow-2xl">
        <div className="absolute -right-8 -top-8 w-64 h-64 rounded-full bg-red-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-64 h-64 rounded-full bg-black/40 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-black/40 border border-red-500/30 shadow-inner backdrop-blur-md">
                <img
                  src="/rorr-logo.png"
                  alt="OBEN RORR Logo"
                  className="h-7 sm:h-8 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-red-400/30 text-red-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                <span>Volcanic Red Edition</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
              OBEN RORR ELECTRIC
            </h1>

            <p className="text-red-100/80 text-xs sm:text-sm font-medium max-w-md">
              High-performance electric motorcycle engineered for instant torque, 
              100 km/h top velocity, and intelligent telematics.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-xl bg-black/60 text-[10px] font-mono font-bold text-white border border-red-400/40 shadow-sm">
                PLATE: {regNo}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-black/50 text-[10px] font-mono font-bold text-slate-200 border border-red-500/30">
                VIN: {vin}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-red-950/70 text-[10px] font-mono font-bold text-red-200 border border-red-500/30">
                8 kW Peak Motor
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-red-950/70 text-[10px] font-mono font-bold text-red-200 border border-red-500/30">
                4.4 kWh LFP Safe Pack
              </span>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex md:flex-col gap-3 w-full md:w-auto">
            <div className="flex-1 md:w-44 p-4 rounded-2xl bg-black/40 border border-red-500/30 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-red-200/80 tracking-wider">
                Battery State
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {liveData?.soc ?? 100}%
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">HEALTHY</span>
              </div>
            </div>

            <div className="flex-1 md:w-44 p-4 rounded-2xl bg-black/40 border border-red-500/30 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-red-200/80 tracking-wider">
                Odometer
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {liveData?.odometer ?? 1240}
                </span>
                <span className="text-xs text-red-200 font-medium">km</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN GRID: RIDER INFO + BIKE SPECIFICATIONS
      ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rider Account */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard variant="default" className="p-6">
            <div className="flex items-center gap-4 pb-6 border-b border-red-500/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 p-0.5 shadow-lg flex items-center justify-center">
                <div className="w-full h-full rounded-2xl bg-black/30 backdrop-blur-sm flex items-center justify-center text-white">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white tracking-tight">
                    {fullName}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[9px] font-bold text-red-400 uppercase">
                    Primary Rider
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: RR-RIDER-8291
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/25 border border-white/5">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <Bike className="w-4 h-4 text-red-400" />
                  <span>Registration No</span>
                </div>
                <span className="font-mono font-bold text-white tracking-wider">{regNo}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/25 border border-white/5">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <Phone className="w-4 h-4 text-red-400" />
                  <span>Phone Number</span>
                </div>
                <span className="font-mono font-bold text-slate-200">{mobile}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/25 border border-white/5">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <Mail className="w-4 h-4 text-red-400" />
                  <span>Email</span>
                </div>
                <span className="font-mono font-bold text-slate-200 truncate max-w-[160px]">{email}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/25 border border-white/5">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <Calendar className="w-4 h-4 text-red-400" />
                  <span>Registered Date</span>
                </div>
                <span className="font-mono font-bold text-slate-200">{OFFICIAL_BIKE_RC.rc_regn_dt}</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/25 border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <span className="text-[11px] font-bold uppercase text-slate-400">Registered Address</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans pl-5">
                  Uttam Nagar Indra Park, New Delhi - 110059
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/25 border border-white/5">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Emergency SOS Contact</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">Active</span>
              </div>
            </div>

            {/* Logout Button */}
            <div className="mt-6 pt-5 border-t border-red-500/10">
              <button
                type="button"
                onClick={onLogout}
                className="
                  w-full py-3 px-4 rounded-2xl
                  clay-button-danger
                  flex items-center justify-center gap-2
                  font-bold text-xs uppercase tracking-wider
                  text-white
                "
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect & Sign Out</span>
              </button>
            </div>
          </GlassCard>

          {/* Warranty & Service Card */}
          <GlassCard variant="wine" className="p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Warranty & Roadside Cover
                </h3>
                <p className="text-[11px] text-red-200/70">Official Oben Factory Protection</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-red-500/10">
                <span className="text-slate-400">Motor & Battery Warranty</span>
                <span className="font-bold text-emerald-400">3 Years / 50,000 km</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-red-500/10">
                <span className="text-slate-400">Warranty Expiry</span>
                <span className="font-mono font-bold text-amber-300">23-Sep-2027 (Active)</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-red-500/10">
                <span className="text-slate-400">Insurance Cover</span>
                <span className="font-mono font-bold text-emerald-400">ICICI Lombard (Till 2029)</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-red-500/10">
                <span className="text-slate-400">Roadside Assistance (RSA)</span>
                <span className="font-bold text-emerald-400">Active 24x7</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Next Scheduled Service</span>
                <span className="font-bold text-amber-400">Due in 3,760 km</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Red Oben Rorr Specs & Hardware Identity */}
        <div className="lg:col-span-7 space-y-6">
          {/* Performance & Powertrain Specs */}
          <GlassCard variant="default" className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Performance Specifications
                  </h3>
                  <p className="text-xs text-slate-400">Oben Rorr ARX Powertrain Architecture</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-red-500/10 border border-red-500/30 text-[10px] font-bold text-red-400">
                HAVOC READY
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Top Velocity</p>
                <p className="text-xl font-black text-white mt-1">100 <span className="text-xs text-slate-400 font-semibold">km/h</span></p>
                <p className="text-[10px] text-red-400 mt-0.5">Havoc Mode</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">0 - 40 km/h</p>
                <p className="text-xl font-black text-white mt-1">3.0 <span className="text-xs text-slate-400 font-semibold">sec</span></p>
                <p className="text-[10px] text-emerald-400 mt-0.5">Instant Torque</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">IDC Range</p>
                <p className="text-xl font-black text-white mt-1">187 <span className="text-xs text-slate-400 font-semibold">km</span></p>
                <p className="text-[10px] text-slate-400 mt-0.5">Certified Max</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Peak Motor</p>
                <p className="text-xl font-black text-white mt-1">8 <span className="text-xs text-slate-400 font-semibold">kW</span></p>
                <p className="text-[10px] text-slate-400 mt-0.5">IPMSM Mid-Drive (62 Nm)</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Battery Chem</p>
                <p className="text-xl font-black text-white mt-1">LFP</p>
                <p className="text-[10px] text-emerald-400 mt-0.5">High Thermal Safety</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Home Charge</p>
                <p className="text-xl font-black text-white mt-1">2 <span className="text-xs text-slate-400 font-semibold">hrs</span></p>
                <p className="text-[10px] text-slate-400 mt-0.5">Fast Charger</p>
              </div>
            </div>
          </GlassCard>

          {/* Vehicle Hardware Identifiers */}
          <GlassCard variant="default" className="p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Hardware & VCU Telemetry Module
                </h3>
                <p className="text-xs text-slate-400">Cryptographically paired telematics unit</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-black/30 border border-white/5 flex flex-col justify-between">
                <span className="text-slate-500 font-mono text-[10px] uppercase">Vehicle Plate</span>
                <span className="font-mono font-black text-white text-sm mt-1">{regNo}</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/30 border border-white/5 flex flex-col justify-between">
                <span className="text-slate-500 font-mono text-[10px] uppercase">Motor Serial No</span>
                <span className="font-mono font-bold text-red-300 text-sm mt-1">{motorNo}</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/30 border border-white/5 flex flex-col justify-between">
                <span className="text-slate-500 font-mono text-[10px] uppercase">Vehicle VIN</span>
                <span className="font-mono font-bold text-slate-100 text-sm mt-1">{vin}</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/30 border border-white/5 flex flex-col justify-between">
                <span className="text-slate-500 font-mono text-[10px] uppercase">VCU Serial ID</span>
                <span className="font-mono font-bold text-slate-100 text-sm mt-1">{vcuId}</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/30 border border-white/5 flex flex-col justify-between">
                <span className="text-slate-500 font-mono text-[10px] uppercase">LTE / GPS IMEI</span>
                <span className="font-mono font-bold text-slate-100 text-sm mt-1">{imei}</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/30 border border-white/5 flex flex-col justify-between">
                <span className="text-slate-500 font-mono text-[10px] uppercase">VCU Firmware</span>
                <span className="font-mono font-bold text-red-400 text-sm mt-1">v3.4.12-PROD</span>
              </div>
            </div>
          </GlassCard>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onNavigate("map")}
              className="
                p-4 rounded-3xl
                clay-card
                bg-[#13151D] border border-red-500/20
                flex items-center justify-between text-left
                hover:border-red-500/40 transition-colors
              "
            >
              <div>
                <p className="text-xs font-bold text-white">Geofence Security</p>
                <p className="text-[10px] text-slate-400">Guard boundary & GPS</p>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate("telemetry")}
              className="
                p-4 rounded-3xl
                clay-card
                bg-[#13151D] border border-red-500/20
                flex items-center justify-between text-left
                hover:border-red-500/40 transition-colors
              "
            >
              <div>
                <p className="text-xs font-bold text-white">Diagnostics</p>
                <p className="text-[10px] text-slate-400">View battery cells & temp</p>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          VEHICLE DOCUMENTS & IDENTITY WALLET (RC, DL, INSURANCE, ETC.)
      ========================================================= */}
      <VehicleDocsWallet />
    </div>
  );
}
