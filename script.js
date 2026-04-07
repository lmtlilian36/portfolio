document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let particles = [];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createParticles();
  }

  function createParticles() {
    const count = Math.max(18, Math.min(36, Math.floor(width / 55)));
    particles = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.2 + 0.8,
        baseR: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        alpha: Math.random() * 0.35 + 0.08,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function drawBackgroundGlow() {
    const gradient1 = ctx.createRadialGradient(width * 0.18, height * 0.2, 0, width * 0.18, height * 0.2, width * 0.22);
    gradient1.addColorStop(0, "rgba(166,239,87,0.10)");
    gradient1.addColorStop(1, "rgba(166,239,87,0)");

    const gradient2 = ctx.createRadialGradient(width * 0.82, height * 0.75, 0, width * 0.82, height * 0.75, width * 0.18);
    gradient2.addColorStop(0, "rgba(127,207,57,0.08)");
    gradient2.addColorStop(1, "rgba(127,207,57,0)");

    ctx.fillStyle = gradient1;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = gradient2;
    ctx.fillRect(0, 0, width, height);
  }

  function drawParticle(p, time) {
    const pulseSize = Math.sin(time * 0.0012 + p.pulse) * 0.35;
    const radius = p.baseR + pulseSize;

    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(166,239,87,${p.alpha})`;
    ctx.fill();
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(166,239,87,${0.05 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function updateParticles() {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;
    }
  }

  function animate(time) {
    ctx.clearRect(0, 0, width, height);
    drawBackgroundGlow();

    if (!prefersReducedMotion) {
      updateParticles();
      connectParticles();
    }

    for (const p of particles) {
      drawParticle(p, time || 0);
    }

    requestAnimationFrame(animate);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  animate();
});
