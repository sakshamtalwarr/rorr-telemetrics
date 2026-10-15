import {
  Bike,
  Activity,
  User,
  LogOut,
  Gauge,
  MapPin,
  TrendingUp,
  Wrench,
  Sun,
  Moon,
} from "lucide-react";

export default function Header({
  vehicle,
  connectionStatus,
  profile,
  onProfileClick,
  onLogout,
  activePage = "overview",
  onNavigate = () => {},
  theme = "pastel",
  onToggleTheme = () => {},
}) {
  const connected =
    connectionStatus === "Telemetry Active" ||
    connectionStatus === "Connected";

  const firstName =
    profile?.firstName ||
    profile?.name ||
    "Profile";

  const navLinks = [
    { id: "overview", label: "Overview", icon: Gauge },
    { id: "telemetry", label: "Telemetry", icon: Activity },
    { id: "map", label: "Map & Fence", icon: MapPin },
    { id: "rides", label: "Rides", icon: TrendingUp },
    { id: "vehicle", label: "Vehicle", icon: Wrench },
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
              bg-gradient-to-br from-indigo-500 to-indigo-600
              p-2 sm:p-2.5
              flex items-center justify-center
              shadow-[0_4px_10px_rgba(79,70,229,0.3),inset_0_1px_2px_rgba(255,255,255,0.6)]
              active:scale-95 transition-transform
            "
          >
            <Bike className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1
                onClick={() => onNavigate("overview")}
                className="
                  cursor-pointer
                  text-base sm:text-xl font-extrabold tracking-tight
                  bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800
                  bg-clip-text text-transparent truncate
                "
              >
                OBEN RORR
              </h1>

              <span
                className="
                  hidden sm:inline-flex items-center px-2 py-0.5
                  rounded-full text-[10px] font-mono font-bold
                  bg-indigo-50 text-indigo-700 border border-indigo-200/70
                  shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]
                "
              >
                EV-X
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="hidden xs:inline text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                VIN:
              </span>
              <span className="truncate max-w-[110px] sm:max-w-[160px] text-[9px] font-mono font-semibold text-slate-600">
                {vehicle?.VIN || "AUTHENTICATING..."}
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            DESKTOP NAVIGATION (Hidden on mobile, uses dock)
        ================================================= */}
        <nav
          aria-label="Main Navigation"
          className="
            hidden md:flex items-center
            p-1 rounded-2xl
            bg-slate-100/80 border border-slate-200/70
            shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]
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
                      ? "bg-white text-indigo-600 shadow-[0_4px_12px_rgba(99,102,241,0.18),inset_0_1px_2px_rgba(255,255,255,1)] scale-[1.02]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }
                `}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* =================================================
            RIGHT SIDE CONTROLS
        ================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* THEME TOGGLE */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === "pastel" ? "Switch to Twilight Clay" : "Switch to Pastel Clay"}
            className="
              clay-button
              p-2 rounded-2xl
              bg-white/80 border border-white
              text-slate-600 hover:text-indigo-600
              shadow-[0_4px_10px_rgba(100,116,139,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)]
              active:scale-95 transition-all
            "
          >
            {theme === "pastel" ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-400" />
            )}
          </button>

          {/* CONNECTION STATUS */}
          <div
            className={`
              flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl
              border text-[9px] sm:text-[10px] font-bold tracking-wider uppercase
              shadow-[0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.8)]
              transition-colors duration-300
              ${
                connected
                  ? "bg-emerald-50 border-emerald-200/80 text-emerald-700"
                  : "bg-amber-50 border-amber-200/80 text-amber-700"
              }
            `}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`
                  animate-ping absolute inline-flex h-full w-full rounded-full opacity-75
                  ${connected ? "bg-emerald-400" : "bg-amber-400"}
                `}
              />
              <span
                className={`
                  relative inline-flex rounded-full h-2 w-2
                  ${connected ? "bg-emerald-500" : "bg-amber-500"}
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
            onClick={() => {
              if (onProfileClick) onProfileClick();
              else onNavigate("vehicle");
            }}
            className="
              clay-button
              rounded-2xl
              bg-indigo-50 border border-indigo-200/80
              px-2.5 sm:px-3 py-1.5
              flex items-center gap-1.5
              text-indigo-700 font-bold
              shadow-[0_4px_10px_rgba(99,102,241,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)]
              active:scale-95 transition-all
            "
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white shadow-xs">
              <User className="h-3 w-3" />
            </div>
            <span className="hidden sm:inline text-xs truncate max-w-[80px]">
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
              bg-rose-50 border border-rose-200/80
              p-2 sm:px-2.5 sm:py-1.5
              flex items-center gap-1.5
              text-rose-600 font-bold
              shadow-[0_4px_10px_rgba(244,63,94,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)]
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