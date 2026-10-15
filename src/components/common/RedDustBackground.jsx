import { useEffect, useRef } from "react";

/**
 * Animated Volcanic Red Gradient Mesh with Floating Pixel & Dust Particles.
 * Purely reddish/crimson tones designed for the Red Oben Rorr Electric motorcycle.
 * Highly performant 60fps canvas, GPU-friendly, pointer-events: none.
 */
export default function RedDustBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId = null;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    function handleResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    }

    window.addEventListener("resize", handleResize, { passive: true });

    // Particle Count based on screen size
    const particleCount = width < 768 ? 45 : 75;
    let particles = [];

    // Red tones palette only
    const redPalette = [
      "rgba(220, 38, 38, ",  // Crimson
      "rgba(239, 68, 68, ",  // Red 500
      "rgba(185, 28, 28, ",  // Dark Red 700
      "rgba(153, 27, 27, ",  // Deep Ruby 800
      "rgba(254, 202, 202, ", // Highlight Spark (near white-pink)
    ];

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 1, // 1px to 3px
          vx: (Math.random() - 0.5) * 0.35,
          vy: -(Math.random() * 0.45 + 0.15), // Slow upward drift like heat dust/embers
          alpha: Math.random() * 0.5 + 0.15,
          colorBase: redPalette[Math.floor(Math.random() * redPalette.length)],
          oscSpeed: Math.random() * 0.02 + 0.005,
          oscOffset: Math.random() * Math.PI * 2,
        });
      }
    }

    initParticles();

    let frame = 0;
    let isVisible = true;

    function handleVisibility() {
      isVisible = !document.hidden;
      if (isVisible && !animId) {
        render();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    function render() {
      if (!isVisible) return;
      frame++;

      // 1. Draw base deep obsidian black
      ctx.fillStyle = "#060709";
      ctx.fillRect(0, 0, width, height);

      // 2. Animated Reddish Gradient Mesh (breathing ambient orbs)
      const t = frame * 0.008;

      // Primary Volcanic Red Core Orb
      const orb1X = width * 0.25 + Math.sin(t * 0.8) * 60;
      const orb1Y = height * 0.2 + Math.cos(t * 0.6) * 50;
      const grad1 = ctx.createRadialGradient(
        orb1X,
        orb1Y,
        10,
        orb1X,
        orb1Y,
        width * 0.6
      );
      grad1.addColorStop(0, "rgba(185, 28, 28, 0.22)"); // Deep Crimson
      grad1.addColorStop(0.4, "rgba(127, 29, 29, 0.10)");
      grad1.addColorStop(0.8, "rgba(69, 10, 10, 0.04)");
      grad1.addColorStop(1, "transparent");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Secondary Deep Wine/Dark Red Orb (Bottom Right)
      const orb2X = width * 0.85 + Math.cos(t * 0.7) * 70;
      const orb2Y = height * 0.8 + Math.sin(t * 0.9) * 50;
      const grad2 = ctx.createRadialGradient(
        orb2X,
        orb2Y,
        10,
        orb2X,
        orb2Y,
        width * 0.55
      );
      grad2.addColorStop(0, "rgba(220, 38, 38, 0.16)"); // Bright Ruby
      grad2.addColorStop(0.5, "rgba(80, 7, 7, 0.08)");
      grad2.addColorStop(1, "transparent");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Center subtle pulse
      const centerPulse = Math.sin(t * 1.2) * 0.03 + 0.08;
      const grad3 = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        0,
        width * 0.5,
        height * 0.5,
        width * 0.7
      );
      grad3.addColorStop(0, `rgba(153, 27, 27, ${centerPulse})`);
      grad3.addColorStop(1, "transparent");
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, width, height);

      // 3. Render Floating Pixel Dust / Embers
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx + Math.sin(frame * p.oscSpeed + p.oscOffset) * 0.25;
        p.y += p.vy;

        // Wrap around borders
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Breathing alpha
        const currentAlpha =
          p.alpha * (0.7 + 0.3 * Math.sin(frame * 0.05 + p.oscOffset));

        // Draw pixel dust (tiny sharp squares & subtle circles)
        ctx.fillStyle = `${p.colorBase}${currentAlpha.toFixed(2)})`;

        // Render as sharp pixel / small square for authentic pixel dust look
        ctx.fillRect(p.x, p.y, p.size, p.size);

        // Subtle bloom around brighter pixels
        if (p.size > 2.0 && currentAlpha > 0.4) {
          ctx.fillStyle = `rgba(239, 68, 68, ${(currentAlpha * 0.25).toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(p.x + p.size / 2, p.y + p.size / 2, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{
        transform: "translateZ(0)",
      }}
    />
  );
}
