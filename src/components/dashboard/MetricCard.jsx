import GlassCard from "../common/GlassCard";

export default function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  iconClass = "text-red-400",
  children,
  className = "",
  variant = "default",
}) {
  const isHeroRed = variant === "red";

  return (
    <GlassCard
      variant={variant}
      className={`
        p-5 sm:p-6
        flex flex-col
        justify-between
        min-h-[140px]
        rounded-3xl
        ${className}
      `}
    >
      <div className="flex justify-between items-start">
        <p
          className={`
            text-[11px] sm:text-xs
            uppercase font-bold tracking-wider
            ${isHeroRed ? "text-red-100/90" : "text-slate-400"}
          `}
        >
          {title}
        </p>

        {Icon && (
          <div
            className={`
              p-2 rounded-2xl
              ${
                isHeroRed
                  ? "bg-black/30 border border-white/20 text-white"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }
              shadow-inner
            `}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
      </div>

      <div className="mt-2">
        <p
          className={`
            text-3xl sm:text-4xl
            font-black
            tracking-tight
            line-clamp-1
            ${isHeroRed ? "text-white drop-shadow-sm" : "text-slate-100"}
          `}
        >
          {value}

          {unit && (
            <span
              className={`
                text-base sm:text-lg
                font-semibold
                ml-1.5
                ${isHeroRed ? "text-red-200" : "text-slate-400"}
              `}
            >
              {unit}
            </span>
          )}
        </p>

        {children}
      </div>
    </GlassCard>
  );
}