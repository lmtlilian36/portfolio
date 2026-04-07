document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let particles = [];
  let orbs = [];
  let mouse = { x: null, y: null, active: false };

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createScene();
  }

  function createScene() {
    const particleCount = Math.max(28, Math.min(54, Math.floor(width / 32)));
    const orbCount = 6;

    particles = [];
    orbs = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2.4 + 1,
        alpha: Math.random() * 0.22 + 0.06,
        pulse: Math.random() * Math.PI * 2
      });
    }

    for (let i = 0; i < orbCount; i++) {
      orbs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 40 + 28,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14,
        alpha: Math.random() * 0.06 + 0.025,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function drawBaseGlow() {
    const g1 = ctx.createRadialGradient(width * 0.15, height * 0.18, 0, width * 0.15, height * 0.18, width * 0.22);
    g1.addColorStop(0, "rgba(31,92,58,0.10)");
    g1.addColorStop(1, "rgba(31,92,58,0)");

    const g2 = ctx.createRadialGradient(width * 0.82, height * 0.78, 0, width * 0.82, height * 0.78, width * 0.2);
    g2.addColorStop(0, "rgba(45,111,71,0.08)");
    g2.addColorStop(1, "rgba(45,111,71,0)");

    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, width, height);
  }

  function updateParticles() {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140 && dist > 0) {
          p.x -= (dx / dist) * 0.15;
          p.y -= (dy / dist) * 0.15;
        }
      }

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;
    }
  }

  function updateOrbs() {
    for (const orb of orbs) {
      orb.x += orb.vx;
      orb.y += orb.vy;

      if (orb.x < -80) orb.x = width + 80;
      if (orb.x > width + 80) orb.x = -80;
      if (orb.y < -80) orb.y = height + 80;
      if (orb.y > height + 80) orb.y = -80;
    }
  }

  function drawOrbs(time) {
    for (const orb of orbs) {
      const radius = orb.r + Math.sin(time * 0.001 + orb.pulse) * 8;
      const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, radius);
      gradient.addColorStop(0, `rgba(31,92,58,${orb.alpha})`);
      gradient.addColorStop(1, "rgba(31,92,58,0)");

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(orb.x, orb.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawParticles(time) {
    for (const p of particles) {
      const radius = p.r + Math.sin(time * 0.002 + p.pulse) * 0.5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(31,92,58,${p.alpha})`;
      ctx.fill();
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 135) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(31,92,58,${0.06 * (1 - dist / 135)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    if (mouse.active) {
      for (const p of particles) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(31,92,58,${0.09 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function animate(time = 0) {
    ctx.clearRect(0, 0, width, height);
    drawBaseGlow();

    if (!reducedMotion) {
      updateOrbs();
      updateParticles();
      drawOrbs(time);
      drawConnections();
    }

    drawParticles(time);
    requestAnimationFrame(animate);
  }

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  window.addEventListener("resize", resizeCanvas);

  resizeCanvas();
  animate();
});document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let particles = [];
  let orbs = [];
  let mouse = { x: null, y: null, active: false };

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createScene();
  }

  function createScene() {
    const particleCount = Math.max(28, Math.min(54, Math.floor(width / 32)));
    const orbCount = 6;

    particles = [];
    orbs = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2.4 + 1,
        alpha: Math.random() * 0.28 + 0.08,
        pulse: Math.random() * Math.PI * 2
      });
    }

    for (let i = 0; i < orbCount; i++) {
      orbs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 40 + 28,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14,
        alpha: Math.random() * 0.08 + 0.03,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function drawBaseGlow() {
    const g1 = ctx.createRadialGradient(width * 0.15, height * 0.18, 0, width * 0.15, height * 0.18, width * 0.22);
    g1.addColorStop(0, "rgba(167,239,85,0.12)");
    g1.addColorStop(1, "rgba(167,239,85,0)");

    const g2 = ctx.createRadialGradient(width * 0.82, height * 0.78, 0, width * 0.82, height * 0.78, width * 0.2);
    g2.addColorStop(0, "rgba(121,200,58,0.10)");
    g2.addColorStop(1, "rgba(121,200,58,0)");

    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, width, height);
  }

  function updateParticles() {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140 && dist > 0) {
          p.x -= (dx / dist) * 0.15;
          p.y -= (dy / dist) * 0.15;
        }
      }

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;
    }
  }

  function updateOrbs() {
    for (const orb of orbs) {
      orb.x += orb.vx;
      orb.y += orb.vy;

      if (orb.x < -80) orb.x = width + 80;
      if (orb.x > width + 80) orb.x = -80;
      if (orb.y < -80) orb.y = height + 80;
      if (orb.y > height + 80) orb.y = -80;
    }
  }

  function drawOrbs(time) {
    for (const orb of orbs) {
      const radius = orb.r + Math.sin(time * 0.001 + orb.pulse) * 8;
      const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, radius);
      gradient.addColorStop(0, `rgba(167,239,85,${orb.alpha})`);
      gradient.addColorStop(1, "rgba(167,239,85,0)");

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(orb.x, orb.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawParticles(time) {
    for (const p of particles) {
      const radius = p.r + Math.sin(time * 0.002 + p.pulse) * 0.5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167,239,85,${p.alpha})`;
      ctx.fill();
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 135) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(167,239,85,${0.07 * (1 - dist / 135)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    if (mouse.active) {
      for (const p of particles) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(167,239,85,${0.10 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function animate(time = 0) {
    ctx.clearRect(0, 0, width, height);
    drawBaseGlow();

    if (!reducedMotion) {
      updateOrbs();
      updateParticles();
      drawOrbs(time);
      drawConnections();
    }

    drawParticles(time);
    requestAnimationFrame(animate);
  }

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  window.addEventListener("resize", resizeCanvas);

  resizeCanvas();
  animate();
});
