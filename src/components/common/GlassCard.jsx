/**
 * True Hype4-style Claymorphic Card.
 * Features dual inner shadows (top-left highlight + bottom-right inflated shading)
 * with soft volumetric drop shadows in a dual-tone Red & Black / Dark Red aesthetic.
 */
export default function GlassCard({
  children,
  className = "",
  hover = true,
  variant = "default", // 'default' (carbon black), 'red' (volcanic red), 'wine' (deep dark red), 'porcelain'
}) {
  const variantClasses = {
    default: "clay-card-carbon",
    red: "clay-card-hero-red",
    wine: "clay-card-wine",
    porcelain: "clay-card-porcelain",
    // aliases for backward compatibility
    sky: "clay-card-carbon",
    mint: "clay-card-wine",
    lavender: "clay-card-carbon",
    peach: "clay-card-hero-red",
    butter: "clay-card-wine",
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
            ? "hover:-translate-y-1 hover:shadow-[0_22px_44px_-10px_rgba(0,0,0,0.9),0_0_25px_-2px_rgba(220,38,38,0.25)]"
            : ""
        }
        ${className}
      `}
    >
      {/* Subtle top specular rim */}
      <div
        className="
          absolute inset-x-0 top-0 h-8
          bg-gradient-to-b from-white/10 to-transparent
          pointer-events-none rounded-t-3xl opacity-60
        "
      />

      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
}