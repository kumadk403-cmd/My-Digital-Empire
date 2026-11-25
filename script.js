/**
 * MY DIGITAL UNIVERSE - Self-Adjusting UI & Interactive Carousel Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNav();
  renderSelfAdjustingProjects();
  initLightbox();
});

/* 1. THEME TOGGLE (LIGHT / DARK) */
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
  });
}

/* 2. MOBILE NAVIGATION */
function initMobileNav() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');

  hamburgerBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });
}

/* 3. SELF-GENERATING / DATA-DRIVEN RENDERER */
function renderSelfAdjustingProjects() {
  const container = document.getElementById('projectsContainer');
  if (!container || typeof PROJECTS_DATA === 'undefined') return;

  // Update hero stats dynamically based on dataset length
  document.getElementById('statProjectCount').textContent = PROJECTS_DATA.length;
  let totalScreenshots = 0;
  PROJECTS_DATA.forEach(p => totalScreenshots += (p.screenshots ? p.screenshots.length : 0));
  document.getElementById('statScreenshotCount').textContent = totalScreenshots;

  container.innerHTML = '';

  PROJECTS_DATA.forEach((project, index) => {
    const card = document.createElement('article');
    card.className = 'glass-card project-card';
    card.id = project.id;

    // Generate slides HTML
    let slidesHtml = '';
    let indicatorsHtml = '';

    project.screenshots.forEach((screen, i) => {
      slidesHtml += `
        <div class="carousel-slide" data-index="${i}">
          <img src="${screen.url}" alt="${screen.caption}" loading="lazy" class="lightbox-trigger" data-full="${screen.url}" data-caption="${screen.caption}" />
          <div class="slide-caption-bar">
            <span>${screen.caption}</span>
            <span style="font-size:0.75rem; opacity:0.8;">${i + 1} / ${project.screenshots.length}</span>
          </div>
        </div>
      `;
      indicatorsHtml += `<span class="indicator-dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></span>`;
    });

    // Generate tag elements
    const tagsHtml = project.tags.map(t => `<span class="tag-item">${t}</span>`).join('');

    card.innerHTML = `
      <div class="project-gallery-wrapper">
        <div class="carousel-track-container" id="carousel-track-${index}">
          <div class="carousel-track" style="transform: translateX(0%);">
            ${slidesHtml}
          </div>
        </div>
        
        ${project.screenshots.length > 1 ? `
          <button class="carousel-btn prev-btn" aria-label="Previous Screenshot">&lsaquo;</button>
          <button class="carousel-btn next-btn" aria-label="Next Screenshot">&rsaquo;</button>
          <div class="carousel-indicators">
            ${indicatorsHtml}
          </div>
        ` : ''}
      </div>

      <div class="project-info">
        <div class="project-badge-pill">${project.badge}</div>
        <h3 class="project-title">${project.title}</h3>
        <p class="project-desc">${project.description}</p>
        
        <div class="project-tags">
          ${tagsHtml}
        </div>

        <div class="project-actions">
          <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="btn btn-gold">
            <span>VISIT WEBSITE</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
          </a>
        </div>
      </div>
    `;

    container.appendChild(card);
    setupCarousel(card, project.screenshots.length);
  });
}

/* 4. CAROUSEL ENGINE (AUTOROTATE + SWIPE + TOUCH + MOUSE DRAG) */
function setupCarousel(cardElement, totalSlides) {
  if (totalSlides <= 1) return;

  const track = cardElement.querySelector('.carousel-track');
  const trackContainer = cardElement.querySelector('.carousel-track-container');
  const prevBtn = cardElement.querySelector('.prev-btn');
  const nextBtn = cardElement.querySelector('.next-btn');
  const dots = cardElement.querySelectorAll('.indicator-dot');

  let currentIndex = 0;
  let autoRotateTimer = null;
  let isDragging = false;
  let startX = 0;

  function updateSlide(index) {
    currentIndex = (index + totalSlides) % totalSlides;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function startAutoRotate() {
    stopAutoRotate();
    autoRotateTimer = setInterval(() => {
      updateSlide(currentIndex + 1);
    }, 4500);
  }

  function stopAutoRotate() {
    if (autoRotateTimer) clearInterval(autoRotateTimer);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAutoRotate();
      updateSlide(currentIndex - 1);
      startAutoRotate();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAutoRotate();
      updateSlide(currentIndex + 1);
      startAutoRotate();
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      stopAutoRotate();
      updateSlide(i);
      startAutoRotate();
    });
  });

  trackContainer.addEventListener('touchstart', touchStart, { passive: true });
  trackContainer.addEventListener('touchend', touchEnd);
  trackContainer.addEventListener('touchmove', touchMove, { passive: true });

  trackContainer.addEventListener('mousedown', touchStart);
  trackContainer.addEventListener('mouseup', touchEnd);
  trackContainer.addEventListener('mouseleave', touchEnd);
  trackContainer.addEventListener('mousemove', touchMove);

  function touchStart(e) {
    stopAutoRotate();
    isDragging = true;
    startX = getPositionX(e);
  }

  function touchMove(e) {
    if (!isDragging) return;
    const currentPosition = getPositionX(e);
    const diff = currentPosition - startX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        updateSlide(currentIndex + 1);
      } else {
        updateSlide(currentIndex - 1);
      }
      isDragging = false;
      startAutoRotate();
    }
  }

  function touchEnd() {
    isDragging = false;
    startAutoRotate();
  }

  function getPositionX(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
  }

  cardElement.addEventListener('mouseenter', stopAutoRotate);
  cardElement.addEventListener('mouseleave', startAutoRotate);

  startAutoRotate();
}

/* 5. LIGHTBOX MODAL FOR FULLSCREEN SCREENSHOT PREVIEW */
function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const modalCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('lightbox-trigger')) {
      modalImg.src = e.target.getAttribute('data-full');
      modalCaption.textContent = e.target.getAttribute('data-caption');
      modal.classList.add('active');
    }
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}
