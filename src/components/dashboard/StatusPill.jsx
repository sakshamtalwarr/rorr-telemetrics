export default function StatusPill({
  title,
  active,
  icon: Icon,
  colorClass = "text-emerald-400",
  danger = false,
}) {

  const activeBackground =
    danger
      ? "bg-red-500/10 border-red-500/30"
      : "bg-emerald-500/10 border-emerald-500/30";


  const activeText =
    danger
      ? "bg-red-500/20 text-red-400"
      : "bg-emerald-500/20 text-emerald-400";


  return (
    <div
      className={`
        flex items-center
        justify-between
        p-3.5
        rounded-2xl
        border
        backdrop-blur-md
        transition-all duration-300
        ${
          active
            ? activeBackground
            : "bg-black/20 border-white/5"
        }
      `}
    >

      <div className="
        flex items-center
        gap-3
      ">

        <div
          className={`
            p-2 rounded-xl
            ${
              active
                ? danger
                  ? "bg-red-500/20"
                  : "bg-emerald-500/20"
                : "bg-white/5"
            }
          `}
        >

          <Icon
            className={`
              w-4 h-4
              ${
                active
                  ? danger
                    ? "text-red-400"
                    : colorClass
                  : "text-slate-500"
              }
            `}
          />

        </div>

        <span className="
          text-sm
          font-medium
          text-slate-200
        ">
          {title}
        </span>

      </div>


      <span
        className={`
          text-xs
          font-bold
          px-2.5 py-1
          rounded-lg
          tracking-wider
          ${
            active
              ? activeText
              : "bg-black/40 text-slate-500"
          }
        `}
      >
        {active ? "ON" : "OFF"}
      </span>

    </div>
  );
}