import {
  Gauge,
  Activity,
  Zap,
  MapPin,
  TrendingUp,
  User,
  Bell,
} from "lucide-react";

/**
 * Dual-Tone Red & Black Floating Clay Dock for mobile & handheld devices.
 * Designed for the Red Oben Rorr Electric motorcycle.
 */
export default function Dock({
  activePage,
  onNavigate,
}) {
  const navItems = [
    {
      id: "overview",
      label: "Cockpit",
      icon: Gauge,
    },
    {
      id: "rides",
      label: "Rides",
      icon: TrendingUp,
    },
    {
      id: "map",
      label: "Map",
      icon: MapPin,
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: Bell,
    },
    {
      id: "bms",
      label: "BMS",
      icon: Zap,
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
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
                transition-all duration-200 ease-out
                touch-manipulation select-none
                ${
                  isActive
                    ? `
                      clay-active-dock-pill
                      bg-gradient-to-b from-red-600 to-red-700
                      text-white
                      shadow-[0_8px_20px_-2px_rgba(220,38,38,0.5),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.4)]
                      scale-105
                    `
                    : "text-slate-400 hover:text-white hover:bg-white/5 active:scale-95"
                }
              `}
            >
              <div className="relative flex items-center justify-center w-7 h-7">
                <Icon
                  className={`
                    w-4 h-4 transition-transform duration-200
                    ${isActive ? "scale-110 text-white" : "text-slate-400"}
                  `}
                />
              </div>

              <span
                className={`
                  text-[10px] tracking-tight mt-0.5 transition-all
                  ${isActive ? "font-black text-white" : "font-medium text-slate-400"}
                `}
              >
                {item.label}
              </span>

              {isActive && (
                <span
                  className="
                    absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-white
                    shadow-[0_0_8px_rgba(255,255,255,0.9)]
                  "
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
