import GlassCard from "../common/GlassCard";

export default function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  iconClass = "text-indigo-400",
  children,
  className = "",
}) {

  return (
    <GlassCard
      className={`
        p-6
        flex flex-col
        justify-between
        h-[140px]
        ${className}
      `}
    >

      <div className="
        flex
        justify-between
        items-start
      ">

        <p className="
          text-xs
          text-slate-400
          uppercase
          font-bold
          tracking-widest
        ">
          {title}
        </p>

        {Icon && (
          <Icon
            className={`
              w-5 h-5
              ${iconClass}
            `}
          />
        )}

      </div>


      <div>

        <p className="
          text-4xl
          font-black
          mt-1
          text-white
        ">
          {value}

          {unit && (
            <span className="
              text-xl
              text-slate-500
              font-medium
              ml-1
            ">
              {unit}
            </span>
          )}
        </p>

        {children}

      </div>

    </GlassCard>
  );
}