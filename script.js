/**
 * SHAASTRA 2026 - Interactive Components
 * Strict Vanilla JS Implementation
 */

document.addEventListener('DOMContentLoaded', () => {
  initLetterReveal();
  initParticleConstellation();
  initMorphingNav();
  initMagneticButton();
  initCursorSpotlight();
});

/* 1. Staggered Letter Reveal for Hero Headline */
function initLetterReveal() {
  const title = document.getElementById('hero-title');
  const text = 'SHAASTRA';
  // WHY: Injecting isolated spans with per-letter transition-delays allows GPU-accelerated
  // CSS cubic-bezier transitions to orchestrate a fluid wave without layout recalculation.
  title.innerHTML = text.split('').map((char, i) => 
    `<span class="reveal-char" style="transition-delay: ${i * 65}ms">${char}</span>`
  ).join('');

  requestAnimationFrame(() => {
    setTimeout(() => title.classList.add('revealed'), 80);
  });
}

/* 2. Component 1: Lightweight 2D Particle Constellation */
function initParticleConstellation() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  let width, height, dpr;
  let particles = [];
  const PARTICLE_COUNT = 140;
  const CONNECT_RADIUS = 105;
  const mouse = { x: -1000, y: -1000, active: false };
  let animationFrameId = null;

  // WHY: Cap DPR at 2 to balance retina crispness against excessive fill-rate overhead on mobile.
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      // Sluggish organic drift velocities
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = -(Math.random() * 0.4 + 0.15);
      this.baseRadius = Math.random() * 1.5 + 0.75;
      this.alpha = Math.random() * 0.45 + 0.25;
    }
    update() {
      if (prefersReduced) return; // Freeze velocity if user requested reduced motion

      // Cursor physics: repel when close, faint gravity well slightly further out
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 130 && dist > 0) {
        const force = (130 - dist) / 130;
        this.x -= (dx / dist) * force * 3.5;
        this.y -= (dy / dist) * force * 3.5;
      } else if (dist < 230 && dist >= 130) {
        const pull = (230 - dist) / 230;
        this.x += (dx / dist) * pull * 0.3;
        this.y += (dy / dist) * pull * 0.3;
      }

      this.x += this.vx;
      this.y += this.vy;

      // Wrap around bounds seamlessly
      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;
      if (this.y < -10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(244, 246, 250, ${this.alpha})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  // WHY: Single animation frame render loop with distance-squared line connections.
  // Using distSq avoids expensive Math.sqrt() inside the nested O(N^2) constellation check.
  function render() {
    ctx.clearRect(0, 0, width, height);
    const maxDistSq = CONNECT_RADIUS * CONNECT_RADIUS;

    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      p1.update();
      p1.draw();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const proximity = 1 - Math.sqrt(distSq) / CONNECT_RADIUS;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(165, 173, 184, ${proximity * 0.18})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }

    if (!prefersReduced) {
      animationFrameId = requestAnimationFrame(render);
    }
  }

  window.addEventListener('resize', () => {
    resize();
    if (prefersReduced) render();
  });

  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('pointerleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
    mouse.active = false;
  });

  // WHY: Pause compute immediately when the browser tab loses focus to save client battery/GPU cycles.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrameId);
    } else if (!prefersReduced) {
      animationFrameId = requestAnimationFrame(render);
    }
  });

  init();
  render();
}

/* 3. Component 2: Morphing Sticky Nav & Sliding Intersection Indicator */
function initMorphingNav() {
  const pill = document.getElementById('nav-pill');
  const navLinks = document.querySelectorAll('.nav-link');
  const indicator = document.getElementById('nav-indicator');
  const mobileToggle = document.getElementById('mobile-toggle');

  let lastScrollY = window.scrollY;

  // WHY: Use offsetLeft/offsetWidth relative to #nav-links (its relative offset parent).
  // This avoids viewport math and ensures smooth GPU-accelerated translateX tracking.
  function positionIndicator(linkEl) {
    if (!linkEl || !indicator) return;
    indicator.style.transform = `translateX(${linkEl.offsetLeft}px)`;
    indicator.style.width = `${linkEl.offsetWidth}px`;
    indicator.style.opacity = '1';
  }

  function getActiveLink() {
    return document.querySelector('.nav-link.active') || navLinks[0];
  }

  // Initial positioning & recalibration after Google Fonts load
  positionIndicator(getActiveLink());
  if (document.fonts) {
    document.fonts.ready.then(() => positionIndicator(getActiveLink()));
  }

  // Reposition on window resize and after nav-pill morph transition settles
  window.addEventListener('resize', () => positionIndicator(getActiveLink()));
  pill.addEventListener('transitionend', () => positionIndicator(getActiveLink()));

  // WHY: Track delta scroll direction to auto-hide when reading down, but instantly reveal on scroll up.
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Morph pill into compact liquid-chrome capsule on scroll
    if (currentScrollY > 40) {
      pill.classList.add('scrolled');
    } else {
      pill.classList.remove('scrolled');
    }

    // Scroll down: hide; Scroll up: reveal
    if (currentScrollY > 200 && currentScrollY > lastScrollY) {
      pill.classList.add('nav-hidden');
    } else {
      pill.classList.remove('nav-hidden');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });

  // WHY: IntersectionObserver detects active section without heavy scroll-poll overhead.
  // rootMargin balances threshold detection centered around the reading viewport.
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const isMatch = link.dataset.section === id;
          link.classList.toggle('active', isMatch);
          if (isMatch) positionIndicator(link);
        });
      }
    });
  }, {
    rootMargin: '-20% 0px -55% 0px',
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));

  // Smooth click scroll + instant indicator gliding
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          positionIndicator(link);
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
      pill.classList.remove('menu-open');
      if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Mobile menu expand toggle
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = pill.classList.toggle('menu-open');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }
}

/* 4. Magnetic CTA Button */
function initMagneticButton() {
  const btn = document.getElementById('magnetic-btn');
  if (!btn || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // WHY: Interpolating button center against cursor coords gives physical mass feedback without lag.
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.35;
    const deltaY = (e.clientY - centerY) * 0.35;
    btn.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate3d(0px, 0px, 0)';
  });
}

/* 5. Subtle Ambient Cursor Spotlight */
function initCursorSpotlight() {
  const spotlight = document.getElementById('cursor-spotlight');
  if (!spotlight) return;

  window.addEventListener('pointermove', (e) => {
    spotlight.style.setProperty('--spot-x', `${e.clientX}px`);
    spotlight.style.setProperty('--spot-y', `${e.clientY}px`);
  }, { passive: true });
}
