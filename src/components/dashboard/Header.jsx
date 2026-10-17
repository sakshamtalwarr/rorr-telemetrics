import {
  Bike,
  Activity,
  Zap,
  User,
  LogOut,
  Gauge,
  MapPin,
  TrendingUp,
  Sun,
  Moon,
  Bell,
} from "lucide-react";

export default function Header({
  vehicle,
  connectionStatus,
  profile,
  onProfileClick,
  onLogout,
  activePage = "overview",
  onNavigate = () => {},
  theme = "dark",
  onToggleTheme = () => {},
}) {
  const connected =
    connectionStatus === "Telemetry Active" ||
    connectionStatus === "Connected";

  const firstName =
    profile?.firstName ||
    profile?.name?.split(" ")[0] ||
    "Rider";

  const navLinks = [
    { id: "overview", label: "Cockpit", icon: Gauge },
    { id: "rides", label: "Rides & Logs", icon: TrendingUp },
    { id: "map", label: "Live Map", icon: MapPin },
    { id: "alerts", label: "Safety & SOS", icon: Bell },
    { id: "bms", label: "ANT BMS", icon: Zap },
    { id: "telemetry", label: "Diagnostics", icon: Activity },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <header
      className="
        sticky top-2 sm:top-4 z-40
        w-full max-w-[1400px] mx-auto
        transition-all duration-300
      "
    >
      <div
        className="
          clay-header
          rounded-2xl sm:rounded-3xl
          px-3 sm:px-5 py-2.5 sm:py-3
          flex items-center justify-between
          gap-2 sm:gap-4
          backdrop-blur-xl
        "
      >
        {/* =================================================
            LOGO + VEHICLE INFO
        ================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div
            onClick={() => onNavigate("overview")}
            className="
              cursor-pointer
              rounded-2xl
              bg-[#13151D] border border-red-500/30
              px-2.5 py-1.5 sm:px-3 sm:py-1.5
              flex items-center justify-center
              shadow-[0_4px_12px_rgba(220,38,38,0.35),inset_0_1px_2px_rgba(255,255,255,0.2)]
              active:scale-95 transition-transform
            "
          >
            <img
              src="/rorr-logo.png"
              alt="Oben Rorr Logo"
              className="h-6 sm:h-7 w-auto object-contain drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1
                onClick={() => onNavigate("overview")}
                className="
                  cursor-pointer
                  text-base sm:text-xl font-black tracking-tight
                  text-white truncate
                "
              >
                OBEN RORR
              </h1>

              <span
                className="
                  inline-flex items-center px-2 py-0.5
                  rounded-full text-[9px] font-mono font-bold
                  bg-red-500/20 text-red-400 border border-red-500/30
                  shadow-xs
                "
              >
                RED EDITION
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="hidden xs:inline text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                VIN:
              </span>
              <span className="truncate max-w-[110px] sm:max-w-[170px] text-[9px] font-mono font-semibold text-slate-400">
                {vehicle?.VIN || "AUTHENTICATING..."}
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            DESKTOP NAVIGATION (DUAL-TONE CLAY PILLS)
        ================================================= */}
        <nav
          aria-label="Main Navigation"
          className="
            hidden md:flex items-center
            p-1 rounded-2xl
            bg-black/50 border border-white/5
            shadow-inner
          "
        >
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePage === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onNavigate(tab.id)}
                className={`
                  flex items-center gap-2 px-3.5 py-1.5 rounded-xl
                  text-xs font-bold tracking-tight transition-all duration-200
                  ${
                    isActive
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_4px_12px_rgba(220,38,38,0.4),inset_0_1px_2px_rgba(255,255,255,0.4)] scale-[1.02]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* =================================================
            RIGHT SIDE CONTROLS
        ================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* NOTIFICATION BELL */}
          <button
            type="button"
            onClick={() => onNavigate("overview")}
            title="System Alerts & Active Safety"
            className="
              clay-button
              p-2 rounded-2xl
              bg-black/40 border border-white/10
              text-slate-300 hover:text-red-400
              relative
              active:scale-95 transition-all
            "
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
            </span>
          </button>

          {/* THEME TOGGLE */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === "dark" ? "Switch to Red & Porcelain" : "Switch to Red & Black"}
            className="
              clay-button
              p-2 rounded-2xl
              bg-black/40 border border-white/10
              text-slate-300 hover:text-red-400
              active:scale-95 transition-all
            "
          >
            {theme === "dark" ? (
              <Moon className="h-4 w-4 text-red-400" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
          </button>

          {/* CONNECTION STATUS */}
          <div
            className={`
              flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl
              border text-[9px] sm:text-[10px] font-bold tracking-wider uppercase
              transition-colors duration-300
              ${
                connected
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                  : "bg-red-950/40 border-red-500/30 text-red-400"
              }
            `}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`
                  animate-ping absolute inline-flex h-full w-full rounded-full opacity-75
                  ${connected ? "bg-emerald-400" : "bg-red-400"}
                `}
              />
              <span
                className={`
                  relative inline-flex rounded-full h-2 w-2
                  ${connected ? "bg-emerald-500" : "bg-red-500"}
                `}
              />
            </span>
            <span className="hidden sm:inline">
              {connectionStatus || "Telemetry Active"}
            </span>
          </div>

          {/* PROFILE BUTTON */}
          <button
            type="button"
            onClick={() => onNavigate("profile")}
            className={`
              clay-button
              rounded-2xl
              px-2.5 sm:px-3 py-1.5
              flex items-center gap-1.5
              font-bold text-xs
              active:scale-95 transition-all
              ${
                activePage === "profile"
                  ? "bg-red-600 text-white border border-red-500 shadow-[0_4px_12px_rgba(220,38,38,0.4)]"
                  : "bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20"
              }
            `}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow-xs">
              <User className="h-3 w-3" />
            </div>
            <span className="hidden sm:inline truncate max-w-[80px]">
              {firstName}
            </span>
          </button>

          {/* LOGOUT BUTTON */}
          <button
            type="button"
            onClick={onLogout}
            title="Log out"
            className="
              clay-button
              rounded-2xl
              bg-black/40 border border-white/10
              p-2 sm:px-2.5 sm:py-1.5
              flex items-center gap-1.5
              text-slate-400 hover:text-red-400 hover:border-red-500/40
              active:scale-95 transition-all
            "
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
}