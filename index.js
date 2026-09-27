// ── CURSOR ──────────────────────────────
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = -100, my = -100, rx = -100, ry = -100;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

function animCursor() {
    if (cursor) { cursor.style.left = mx - 4 + 'px'; cursor.style.top = my - 4 + 'px'; }
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    if (ring) { ring.style.left = rx - 16 + 'px'; ring.style.top = ry - 16 + 'px'; }
    requestAnimationFrame(animCursor);
}
animCursor();

// ── PARTICLES ───────────────────────────
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
const COLORS = ['rgba(201,169,110,', 'rgba(232,196,196,', 'rgba(245,240,235,'];

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 6 + 8;
        this.speedY = -(Math.random() * 0.4 + 0.1);
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.life = 0;
        this.maxLife = Math.random() * 300 + 200;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life++;
        const ratio = this.life / this.maxLife;
        const fade = ratio < 0.1 ? ratio * 10 : ratio > 0.9 ? (1 - ratio) * 10 : 1;
        this.currentOpacity = this.opacity * fade;
        if (this.life >= this.maxLife || this.y < -10) this.reset();
    }
    draw() {
        ctx.font = `${this.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = this.color + this.currentOpacity + ')';
        ctx.fillText('♡', this.x, this.y);
    }
}

for (let i = 0; i < 80; i++) {
    const p = new Particle();
    p.life = Math.random() * p.maxLife;
    particles.push(p);
}

function animParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animParticles);
}
animParticles();

// ── MUSIC ────────────────────────────────
const musicBtn = document.getElementById('musicBtn');
const bgMusic = document.getElementById('bgMusic');
let musicPlaying = false;

musicBtn.addEventListener('click', () => {
    if (musicPlaying) {
        bgMusic.pause();
        musicBtn.textContent = '♪';
        musicPlaying = false;
    } else {
        bgMusic.play().catch(() => { });
        musicBtn.textContent = '■';
        musicPlaying = true;
    }
});

// ── SCROLL ANIMATIONS ───────────────────
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
    });
}, { threshold: 0.15 });

document.querySelectorAll('.gallery-item, .quote-card, .portrait-item').forEach(el => observer.observe(el));

// Final section
const finalObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            document.getElementById('finalImgWrap').classList.add('visible');
            document.getElementById('finalTitle').classList.add('visible');
            document.getElementById('starsWrap').classList.add('visible');
            document.getElementById('finalMsg').classList.add('visible');
            document.getElementById('finalSig').classList.add('visible');
        }
    });
}, { threshold: 0.2 });

finalObs.observe(document.querySelector('.final-section'));

// Gallery items stagger
document.querySelectorAll('.gallery-item').forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 0.1 + 's';
});

// ── LIGHTBOX ────────────────────────────
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const imgSrcs = Array.from({ length: 20 }, (_, i) => `foto${i + 1}.jpg`);
let currentIdx = 0;

function openLightbox(idx) {
    currentIdx = idx;
    lightboxImg.src = imgSrcs[idx];
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
}

document.querySelectorAll('.gallery-item, .portrait-item').forEach(el => {
    el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.index || 0);
        openLightbox(idx);
    });
});

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxPrev').addEventListener('click', () => {
    currentIdx = (currentIdx - 1 + imgSrcs.length) % imgSrcs.length;
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
        lightboxImg.src = imgSrcs[currentIdx];
        lightboxImg.style.opacity = '1';
    }, 150);
});
document.getElementById('lightboxNext').addEventListener('click', () => {
    currentIdx = (currentIdx + 1) % imgSrcs.length;
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
        lightboxImg.src = imgSrcs[currentIdx];
        lightboxImg.style.opacity = '1';
    }, 150);
});
lightboxImg.style.transition = 'opacity 0.15s ease';
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') document.getElementById('lightboxPrev').click();
    if (e.key === 'ArrowRight') document.getElementById('lightboxNext').click();
});

// ── TOUCH SWIPE LIGHTBOX ─────────────────
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
lightbox.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
        if (diff > 0) document.getElementById('lightboxNext').click();
        else document.getElementById('lightboxPrev').click();
    }
});

// ── PARALLAX HERO ────────────────────────
window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const heroImg = document.querySelector('.hero-img-wrap');
    if (heroImg) heroImg.style.transform = `translateY(${y * 0.15}px)`;
});