/**
 * Claymorphic Card component with soft 3D bevels, dual shadows,
 * and pastel theme support. Drops directly into existing components
 * without breaking signatures.
 */
export default function GlassCard({
  children,
  className = "",
  hover = true,
  variant = "default", // 'default' (cloud white), 'lavender', 'mint', 'peach', 'sky', 'butter'
}) {
  const variantClasses = {
    default: "clay-card-default",
    lavender: "clay-card-lavender",
    mint: "clay-card-mint",
    peach: "clay-card-peach",
    sky: "clay-card-sky",
    butter: "clay-card-butter",
    plain: "clay-card-plain",
  };

  const selectedVariant = variantClasses[variant] || variantClasses.default;

  return (
    <div
      className={`
        clay-card
        relative overflow-hidden
        rounded-3xl
        transition-all duration-300 ease-out
        ${selectedVariant}
        ${
          hover
            ? "hover:-translate-y-1 hover:shadow-[0_20px_35px_-8px_rgba(100,116,139,0.18),0_8px_16px_-4px_rgba(100,116,139,0.1)]"
            : ""
        }
        ${className}
      `}
    >
      {/* Soft clay top specular glaze */}
      <div
        className="
          absolute inset-x-0 top-0 h-10
          bg-gradient-to-b from-white/60 to-transparent
          pointer-events-none rounded-t-3xl opacity-80
        "
      />

      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
}