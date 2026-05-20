/* ==============================================
   ALTAGENIX — CORE INTERACTIVITY
   Powered by Lenis (Smooth Scroll) & Custom Canvas DNA
   ============================================== */

// Ensure script runs
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  console.log('Sanaré Research Institute script initializing...');

  /* 1. INITIALIZE LENIS (SMOOTH SCROLL) */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    smoothWheel: true,
    orientation: 'vertical',
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  /* 2. NAVBAR SCROLL EFFECT */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  /* 3. MOBILE MENU */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.transform = '';
      }
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(s => s.style.transform = '');
      });
    });
  }

  /* 4. CANVAS DNA ANIMATION ENGINE */
  function drawDNA(canvasId, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let w, h;
    const {
      primaryColor = '#a77359',
      secondaryColor = '#8c5c46',
      amplitude = 50,
      period = 0.01,
      speed = 0.02,
      basePairs = 18
    } = options;

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    let t = 0;
    function animate() {
      ctx.clearRect(0, 0, w, h);
      
      const centerY = h / 2;
      const step = w / (basePairs + 1);

      // Base Pairs (Rungs)
      for (let i = 1; i <= basePairs; i++) {
        const x = i * step;
        const y1 = centerY + Math.sin(t + x * period) * amplitude;
        const y2 = centerY + Math.sin(t + x * period + Math.PI) * amplitude;

        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.strokeStyle = 'rgba(167, 115, 89, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Nodes
        ctx.beginPath();
        ctx.arc(x, y1, 5, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y2, 5, 0, Math.PI * 2);
        ctx.fillStyle = secondaryColor;
        ctx.fill();
      }

      // Strands
      const drawStrand = (offset, color) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3.5;
        for (let x = 0; x <= w; x += 2) {
          const y = centerY + Math.sin(t + x * period + offset) * amplitude;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      drawStrand(0, primaryColor);
      drawStrand(Math.PI, secondaryColor);

      t += speed;
      requestAnimationFrame(animate);
    }
    animate();
  }

  drawDNA('dnaCanvas', {
    amplitude: 280,
    speed: 0.015,
    period: 0.003,
    basePairs: 12,
    primaryColor: '#a77359',
    secondaryColor: '#8c5c46'
  });
  drawDNA('showreelCanvas', { amplitude: 160, speed: 0.03, period: 0.01, primaryColor: '#a77359', secondaryColor: '#8c5c46', basePairs: 28 });

  /* 5. REVEAL & COUNTER OBSERVER */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains('reveal')) {
          entry.target.classList.add('visible');
        }
        if (entry.target.hasAttribute('data-target')) {
          animateCounter(entry.target);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal, [data-target]').forEach(el => observer.observe(el));

  /* 6. COUNTER LOGIC */
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 2500;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      
      const current = Math.floor(ease * target);
      el.innerText = formatStat(current, target);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.innerText = formatStat(target, target);
      }
    }
    requestAnimationFrame(update);
  }

  function formatStat(n, target) {
    if (target >= 1000000000) return (n / 1000000000).toFixed(1).replace('.0', '') + 'B+';
    if (target >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M+';
    if (target >= 1000) return Math.round(n / 1000) + 'K+';
    if (target === 99) return n + '%';
    return n + '+';
  }

  /* 7. FAQ ACCORDION */
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      // Close others
      document.querySelectorAll('.faq-item').forEach(other => {
        other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-answer').style.maxHeight = '0';
      });
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* 8. FORM HANDLING */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('.btn-submit');
      const originalText = btn.innerText;
      btn.innerText = 'ENVIANDO...';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerText = 'ENVIADO ✓';
        btn.style.background = '#22c55e';
        btn.style.color = '#fdfbf7';
        contactForm.reset();
        setTimeout(() => {
          btn.innerText = originalText;
          btn.style.background = '';
          btn.style.color = '';
          btn.disabled = false;
        }, 3000);
      }, 1500);
    });
  }

  /* 9. CURSOR GLOW */
  if (window.matchMedia('(pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.style.cssText = `position:fixed;width:400px;height:400px;border-radius:50%;
      background:radial-gradient(circle,rgba(167, 115, 89,0.08) 0%,transparent 70%);
      pointer-events:none;z-index:999;transform:translate(-50%,-50%);top:0;left:0;`;
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive: true });
  }
}
