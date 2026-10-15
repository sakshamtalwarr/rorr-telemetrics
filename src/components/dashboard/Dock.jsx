import {
  Gauge,
  Activity,
  MapPin,
  TrendingUp,
  Wrench,
} from "lucide-react";

/**
 * Floating Clay Dock for mobile & handheld devices (iPhone, Pixel 7, Android).
 * Features tactile claymorphic pills, pastel accents, and haptic-friendly tap areas.
 */
export default function Dock({
  activePage,
  onNavigate,
}) {
  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: Gauge,
      pastelClass: "from-sky-100 to-indigo-100 text-sky-600 border-sky-200",
      activeText: "text-sky-700",
      glowColor: "bg-sky-400",
    },
    {
      id: "telemetry",
      label: "Telemetry",
      icon: Activity,
      pastelClass: "from-indigo-100 to-purple-100 text-indigo-600 border-indigo-200",
      activeText: "text-indigo-700",
      glowColor: "bg-indigo-400",
    },
    {
      id: "map",
      label: "Live Map",
      icon: MapPin,
      pastelClass: "from-emerald-100 to-teal-100 text-emerald-600 border-emerald-200",
      activeText: "text-emerald-700",
      glowColor: "bg-emerald-400",
    },
    {
      id: "rides",
      label: "Rides",
      icon: TrendingUp,
      pastelClass: "from-amber-100 to-rose-100 text-amber-600 border-amber-200",
      activeText: "text-amber-700",
      glowColor: "bg-amber-400",
    },
    {
      id: "vehicle",
      label: "Vehicle",
      icon: Wrench,
      pastelClass: "from-purple-100 to-pink-100 text-purple-600 border-purple-200",
      activeText: "text-purple-700",
      glowColor: "bg-purple-400",
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="
        fixed bottom-3 left-3 right-3
        z-50 mx-auto max-w-md
        md:hidden
        pointer-events-auto
      "
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div
        className="
          clay-dock
          px-2 py-2 sm:px-3 sm:py-2.5
          flex items-center justify-around gap-1
          rounded-3xl
          border border-white/80
          backdrop-blur-2xl
        "
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`
                relative flex flex-col items-center justify-center
                flex-1 py-1.5 px-1 sm:px-2 rounded-2xl
                transition-all duration-300 ease-out
                touch-manipulation select-none
                ${
                  isActive
                    ? `
                      clay-active-dock-pill
                      bg-white
                      shadow-[0_8px_16px_-4px_rgba(100,116,139,0.2),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.05)]
                      scale-105
                      ${item.activeText}
                    `
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/40 active:scale-95"
                }
              `}
            >
              <div
                className={`
                  relative flex items-center justify-center
                  w-8 h-8 rounded-xl transition-all duration-300
                  ${
                    isActive
                      ? `bg-gradient-to-br ${item.pastelClass} shadow-sm`
                      : "bg-transparent"
                  }
                `}
              >
                <Icon
                  className={`
                    w-4 h-4 transition-transform duration-300
                    ${isActive ? "scale-110" : "scale-100"}
                  `}
                />
              </div>

              <span
                className={`
                  text-[10px] tracking-tight mt-0.5 font-bold transition-all
                  ${isActive ? "font-extrabold" : "font-medium"}
                `}
              >
                {item.label}
              </span>

              {isActive && (
                <span
                  className={`
                    absolute -bottom-0.5 w-1 h-1 rounded-full ${item.glowColor}
                    shadow-[0_0_6px_currentColor]
                  `}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
