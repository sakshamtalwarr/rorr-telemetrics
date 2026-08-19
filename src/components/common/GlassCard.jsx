export default function GlassCard({
  children,
  className = "",
  hover = true,
}) {

  return (
    <div
      className={`
        relative overflow-hidden rounded-3xl
        bg-white/5 backdrop-blur-xl
        border border-white/10
        shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.4)]
        ${
          hover
            ? "hover:bg-white/10 hover:border-white/20 hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
            : ""
        }
        transition-all duration-500 ease-out
        ${className}
      `}
    >

      <div
        className="
          absolute inset-0
          bg-gradient-to-br
          from-white/5
          to-transparent
          opacity-0
          hover:opacity-100
          transition-opacity
          duration-500
          pointer-events-none
        "
      />

      <div className="relative z-10 h-full w-full">
        {children}
      </div>

    </div>
  );
}