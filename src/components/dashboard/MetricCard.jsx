import GlassCard from "../common/GlassCard";

export default function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  iconClass = "text-indigo-500",
  children,
  className = "",
  variant = "default",
}) {
  return (
    <GlassCard
      variant={variant}
      className={`
        p-5 sm:p-6
        flex flex-col
        justify-between
        min-h-[135px]
        rounded-3xl
        ${className}
      `}
    >
      <div className="flex justify-between items-start">
        <p
          className="
            text-[11px] sm:text-xs
            text-slate-500
            uppercase
            font-bold
            tracking-wider
          "
        >
          {title}
        </p>

        {Icon && (
          <div className="p-2 rounded-2xl bg-white/70 shadow-[0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,1)]">
            <Icon
              className={`
                w-4 h-4 sm:w-5 sm:h-5
                ${iconClass}
              `}
            />
          </div>
        )}
      </div>

      <div className="mt-2">
        <p
          className="
            text-3xl sm:text-4xl
            font-black
            tracking-tight
            text-slate-800
            line-clamp-1
          "
        >
          {value}

          {unit && (
            <span
              className="
                text-base sm:text-lg
                text-slate-500
                font-semibold
                ml-1.5
              "
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