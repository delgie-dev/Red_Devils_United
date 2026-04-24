// ============================
// HAMBURGER MENU
// ============================
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });
  document.addEventListener('click', e => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    }
  });
}

// ============================
// NAVBAR SCROLL
// ============================
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ============================
// SCROLL PROGRESS BAR
// ============================
const scrollBar = document.getElementById('scrollProgress');
if (scrollBar) {
  window.addEventListener('scroll', () => {
    const scrollTop    = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollBar.style.width = scrollHeight > 0 ? (scrollTop / scrollHeight * 100) + '%' : '0%';
  }, { passive: true });
}

// ============================
// BACK TO TOP
// ============================
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============================
// SCROLL REVEAL
// ============================
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const parent = entry.target.parentElement;
    const sibs   = Array.from(parent.querySelectorAll('.reveal:not(.visible)'));
    const delay  = Math.min(sibs.indexOf(entry.target) * 90, 380);
    setTimeout(() => entry.target.classList.add('visible'), delay);
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => revealObs.observe(el));

// ============================
// ANIMATED COUNTERS
// ============================
function animateCounter(el) {
  const text     = el.textContent.trim();
  // Parse formats: 20, 1,878, £80m, 74,310
  const raw      = text.replace(/[£,m]/g, '');
  const num      = parseFloat(raw);
  if (isNaN(num)) return;

  const hasPound = text.includes('£');
  const hasMil   = text.includes('m');
  const hasComma = text.includes(',') && !hasPound;

  const duration  = 1800;
  const startTime = performance.now();

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const fmt = (v) => {
    if (hasPound && hasMil) return '£' + Math.round(v) + 'm';
    if (hasComma) return Math.round(v).toLocaleString();
    return Math.round(v).toString();
  };

  const tick = (now) => {
    const pct     = Math.min((now - startTime) / duration, 1);
    el.textContent = fmt(num * easeOut(pct));
    if (pct < 1) requestAnimationFrame(tick);
    else el.textContent = text; // restore exact original
  };

  requestAnimationFrame(tick);
}

const counterEls = document.querySelectorAll('.stat-number');
if (counterEls.length) {
  const cObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        cObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counterEls.forEach(el => cObs.observe(el));
}

// ============================
// PARALLAX HERO
// ============================
const heroBgImg = document.querySelector('.hero-bg-img');
if (heroBgImg) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight * 1.5) {
          heroBgImg.style.transform = `translateY(${scrolled * 0.28}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ============================
// PROGRESS BARS
// ============================
const fills = document.querySelectorAll('.progress-fill');
if (fills.length) {
  const fillObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => { entry.target.style.width = entry.target.dataset.width; }, 400);
        fillObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(el => fillObs.observe(el));
}

// ============================
// ANTHEM LYRICS SYNC
// (YouTube IFrame API)
// ============================
const lyricsBox    = document.getElementById('lyricsBox');
const anthemFill   = document.getElementById('anthemFill');
const anthemTime   = document.getElementById('anthemTime');
const anthemDurat  = document.getElementById('anthemDuration');

if (lyricsBox) {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);

  let player;
  let syncInterval = null;
  const lyricLines = document.querySelectorAll('.lyric-line');

  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player('ytAnthem', {
      events: { onStateChange: onPlayerStateChange, onReady: onPlayerReady }
    });
  };

  function onPlayerReady() {
    setTimeout(() => {
      const dur = player.getDuration();
      if (anthemDurat && dur) anthemDurat.textContent = formatTime(dur);
    }, 1000);
  }

  function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      syncInterval = setInterval(syncLyrics, 200);
    } else {
      clearInterval(syncInterval);
      if (event.data === YT.PlayerState.ENDED) {
        lyricLines.forEach(l => { l.classList.remove('active'); l.classList.add('past'); });
      }
    }
  }

  function syncLyrics() {
    if (!player || typeof player.getCurrentTime !== 'function') return;
    const current  = player.getCurrentTime();
    const duration = player.getDuration();

    if (anthemTime)  anthemTime.textContent  = formatTime(current);
    if (anthemDurat) anthemDurat.textContent = formatTime(duration);
    if (anthemFill && duration > 0) {
      anthemFill.style.width = ((current / duration) * 100) + '%';
    }

    let activeLine = null;
    lyricLines.forEach((line, i) => {
      const lineTime = parseFloat(line.dataset.time);
      const nextTime = lyricLines[i + 1] ? parseFloat(lyricLines[i + 1].dataset.time) : Infinity;
      if (current >= lineTime && current < nextTime) {
        activeLine = line;
        line.classList.add('active');
        line.classList.remove('past');
      } else if (current >= lineTime) {
        line.classList.remove('active');
        line.classList.add('past');
      } else {
        line.classList.remove('active', 'past');
      }
    });

    if (activeLine && lyricsBox) {
      const scrollTarget = activeLine.offsetTop - lyricsBox.clientHeight / 2 + activeLine.clientHeight / 2;
      lyricsBox.scrollTo({ top: scrollTarget, behavior: 'smooth' });
    }
  }

  const anthemBar = document.getElementById('anthemBar');
  if (anthemBar) {
    anthemBar.addEventListener('click', e => {
      if (!player || typeof player.getDuration !== 'function') return;
      const rect = anthemBar.getBoundingClientRect();
      const pct  = (e.clientX - rect.left) / rect.width;
      player.seekTo(pct * player.getDuration(), true);
    });
  }

  lyricLines.forEach(line => {
    line.addEventListener('click', () => {
      if (!player || typeof player.seekTo !== 'function') return;
      player.seekTo(parseFloat(line.dataset.time), true);
      player.playVideo();
    });
    line.style.cursor = 'pointer';
    line.title = 'Click to jump here';
  });
}

// ============================
// UTILITY: FORMAT TIME
// ============================
function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}
