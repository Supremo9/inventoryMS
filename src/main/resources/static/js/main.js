/* ==========================================================
   Inventory Management System — Interactive Scripts
   ========================================================== */
(function () {
    'use strict';

    // ---------- 1. Scroll progress bar ----------
    const progressBar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = percent + '%';
    });

    // ---------- 2. Navbar shrink effect ----------
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ---------- 3. Scroll reveal (IntersectionObserver) ----------
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    // ---------- 4. Animated typing effect ----------
    const typedEl = document.getElementById('typed-text');
    if (typedEl) {
        const phrases = ['with confidence.', 'at scale.', 'without chaos.', 'efficiently.'];
        let phraseIdx = 0;
        let charIdx = 0;
        let deleting = false;

        const tick = () => {
            const phrase = phrases[phraseIdx];
            charIdx += deleting ? -1 : 1;
            typedEl.textContent = phrase.substring(0, charIdx);

            let delay = deleting ? 40 : 80;

            if (!deleting && charIdx === phrase.length) {
                delay = 1800;
                deleting = true;
            } else if (deleting && charIdx === 0) {
                deleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                delay = 400;
            }

            setTimeout(tick, delay);
        };
        tick();
    }

    // ---------- 5. Animated counters ----------
    const counters = document.querySelectorAll('[data-counter]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.counter, 10);
            const suffix = el.dataset.suffix || '';
            const duration = 1600;
            const start = performance.now();

            const step = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                // ease-out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            counterObserver.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach((c) => counterObserver.observe(c));

    // ---------- 6. FAQ accordion ----------
    document.querySelectorAll('.faq-item').forEach((item) => {
        const btn = item.querySelector('.faq-question');
        btn.addEventListener('click', () => {
            const wasOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
            if (!wasOpen) item.classList.add('open');
        });
    });

    // ---------- 7. Back-to-top button ----------
    const backToTop = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) backToTop.classList.add('show');
        else backToTop.classList.remove('show');
    });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ---------- 8. Hero parallax (subtle) ----------
    const heroContent = document.getElementById('hero-content');
    const heroSection = document.getElementById('hero');
    if (heroContent && heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            heroContent.style.transform = `translate(${x * 8}px, ${y * 8}px)`;
        });
        heroSection.addEventListener('mouseleave', () => {
            heroContent.style.transform = 'translate(0, 0)';
        });
    }
})();