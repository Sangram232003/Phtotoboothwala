/* =====================================================
   PHOTO BOOTH WALA — Main JavaScript
   Version: 1.0 | Premium Interactions & Logic
   ===================================================== */

'use strict';

/* ──────────────────────────────────────────────────────
   1. NAVBAR — scroll behavior + mobile menu
   ────────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar        = document.getElementById('navbar');
  const hamburger     = document.getElementById('hamburger-btn');
  const mobileMenu    = document.getElementById('mobile-menu');
  const mobileLinks   = document.querySelectorAll('.mobile-nav-link');

  // Scroll state
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // Hamburger toggle
  function toggleMenu(open) {
    hamburger.classList.toggle('active', open);
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    toggleMenu(!isOpen);
  });

  // Close on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on outside click
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) toggleMenu(false);
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      toggleMenu(false);
      hamburger.focus();
    }
  });
})();


/* ──────────────────────────────────────────────────────
   2. SCROLL REVEAL ANIMATION
   ────────────────────────────────────────────────────── */
(function initScrollReveal() {
  const revealElements = document.querySelectorAll('[data-reveal]');

  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Respect any CSS transition-delay set via inline style
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
})();


/* ──────────────────────────────────────────────────────
   3. ACTIVE NAV LINK — highlight on scroll
   ────────────────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, {
    threshold: 0.3
  });

  sections.forEach(section => observer.observe(section));
})();


/* ──────────────────────────────────────────────────────
   4. VIDEO MODAL
   ────────────────────────────────────────────────────── */
const videoModal = document.getElementById('video-modal');

function openVideoModal() {
  videoModal.classList.add('open');
  videoModal.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
  const closeBtn = videoModal.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeVideoModal() {
  videoModal.classList.remove('open');
  videoModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  document.getElementById('play-video-btn')?.focus();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeVideoModal();
    closePartnerModal();
    closeLightbox();
  }
});


/* ──────────────────────────────────────────────────────
   5. GALLERY FILTER + LIGHTBOX (REDESIGNED)
   ────────────────────────────────────────────────────── */

// ── Gallery Filter (new gal-filter / gal-item classes) ──
(function initNewGallery() {
  const filters = document.querySelectorAll('.gal-filter');
  const items   = document.querySelectorAll('.gal-item');
  if (!filters.length || !items.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Active state
      filters.forEach(f => {
        f.classList.remove('active');
        f.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Animate filter
      items.forEach(item => {
        const cat  = item.dataset.category;
        const show = filter === 'all' || cat === filter;
        if (show) {
          item.classList.remove('gal-hidden');
          requestAnimationFrame(() => {
            item.style.opacity   = '1';
            item.style.transform = 'scale(1)';
          });
        } else {
          item.style.opacity   = '0';
          item.style.transform = 'scale(0.96)';
          setTimeout(() => item.classList.add('gal-hidden'), 320);
        }
      });
    });
  });

  // Ensure all items start visible
  items.forEach(item => {
    item.style.transition = 'opacity 0.32s ease, transform 0.32s ease';
    item.style.opacity    = '1';
    item.style.transform  = 'scale(1)';
  });
})();

// ── Editorial Gallery Lightbox ──
const lightbox       = document.getElementById('lightbox');
const lightboxImg    = document.getElementById('lightbox-img');
const lightboxCap    = document.getElementById('lightbox-caption');
const lightboxCounter= document.getElementById('lightbox-counter');
let galImages        = [];  // populated from gal-item data-index order
let lightboxIndex    = 0;

function buildGalImages() {
  // Collect all gal-items in DOM order, ordered by data-index
  const allItems = Array.from(document.querySelectorAll('.gal-item:not(.gal-hidden)'));
  galImages = allItems.map(item => {
    const btn = item.querySelector('.gal-view-btn');
    const img = item.querySelector('.gal-img');
    return {
      src:     img ? img.src     : '',
      caption: btn ? btn.getAttribute('aria-label').replace('View: ', '') : '',
      alt:     img ? img.alt     : ''
    };
  });
}

function openGalleryLightbox(dataIndex) {
  buildGalImages();
  // Find by data-index attribute
  const allItems = Array.from(document.querySelectorAll('.gal-item:not(.gal-hidden)'));
  let idx = allItems.findIndex(item => parseInt(item.dataset.index) === dataIndex);
  if (idx < 0) idx = 0;
  lightboxIndex = idx;
  showGalImage(lightboxIndex);
  lightbox.classList.add('open');
  lightbox.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
  // Focus close button for accessibility
  setTimeout(() => lightbox.querySelector('.lightbox-close')?.focus(), 100);
}

// Legacy openLightbox kept for any remaining .gallery-zoom usage
function openLightbox(btn) {
  buildGalImages();
  lightboxIndex = 0;
  showGalImage(lightboxIndex);
  lightbox.classList.add('open');
  lightbox.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
}

function showGalImage(index) {
  if (!galImages.length) return;
  const image = galImages[index];
  if (!image) return;
  lightboxImg.style.opacity = '0';
  setTimeout(() => {
    lightboxImg.src         = image.src;
    lightboxImg.alt         = image.alt || image.caption;
    if (lightboxCap)  lightboxCap.textContent    = image.caption || '';
    if (lightboxCounter) lightboxCounter.textContent = `${index + 1} / ${galImages.length}`;
    lightboxImg.style.opacity = '1';
  }, 120);
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function lightboxNav(direction) {
  if (!galImages.length) return;
  lightboxIndex = (lightboxIndex + direction + galImages.length) % galImages.length;
  showGalImage(lightboxIndex);
}

// Keyboard + lightbox image fade transition
lightboxImg && (lightboxImg.style.transition = 'opacity 0.15s ease');

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowRight') lightboxNav(1);
  if (e.key === 'ArrowLeft')  lightboxNav(-1);
  if (e.key === 'Escape')     closeLightbox();
});

// Touch swipe on lightbox
(function initLightboxSwipe() {
  let swipeStartX = 0;
  lightbox?.addEventListener('touchstart', e => {
    swipeStartX = e.touches[0].clientX;
  }, { passive: true });
  lightbox?.addEventListener('touchend', e => {
    const diff = swipeStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) lightboxNav(diff > 0 ? 1 : -1);
  });
})();


/* ──────────────────────────────────────────────────────
   6. REVIEWS CAROUSEL
   ────────────────────────────────────────────────────── */
(function initReviewsCarousel() {
  const carousel   = document.getElementById('reviews-carousel');
  const dotsWrap   = document.getElementById('carousel-dots');
  if (!carousel || !dotsWrap) return;

  const cards      = carousel.querySelectorAll('.review-card');
  const totalCards = cards.length;
  let current      = 0;
  let autoTimer    = null;
  let cardsVisible = getCardsVisible();

  function getCardsVisible() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1100) return 2;
    return 3;
  }

  const totalSlides = Math.ceil(totalCards / cardsVisible);

  // Build dots
  dotsWrap.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Review group ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    current = ((index % totalSlides) + totalSlides) % totalSlides;
    const cardWidth = cards[0]?.offsetWidth || 0;
    const gap = 20;
    carousel.style.transform = `translateX(-${current * (cardWidth + gap) * cardsVisible}px)`;
    carousel.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    cards.forEach((c, i) => {
      c.classList.toggle('active', Math.floor(i / cardsVisible) === current);
    });
    updateDots();
  }

  // Set card widths
  function setCardWidths() {
    cardsVisible = getCardsVisible();
    const container = carousel.parentElement;
    const totalGap = (cardsVisible - 1) * 20;
    const cardW = Math.floor((container.offsetWidth - totalGap) / cardsVisible);
    cards.forEach(c => c.style.minWidth = `${cardW}px`);
    goTo(current);
  }

  window.addEventListener('resize', setCardWidths, { passive: true });
  setCardWidths();

  // Auto play
  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 4500);
  }

  function stopAuto() { clearInterval(autoTimer); }

  carousel.parentElement.addEventListener('mouseenter', stopAuto);
  carousel.parentElement.addEventListener('mouseleave', startAuto);
  startAuto();

  // Touch swipe
  let touchStartX = 0;
  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(current + (diff > 0 ? 1 : -1));
    }
  });

  // Expose nav for buttons
  window.carouselNav = function(dir) { goTo(current + dir); };
})();


/* ──────────────────────────────────────────────────────
   7. FAQ ACCORDION
   ────────────────────────────────────────────────────── */
(function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others (accordion behavior)
      faqItems.forEach(i => {
        const b = i.querySelector('.faq-question');
        const a = i.querySelector('.faq-answer');
        b.setAttribute('aria-expanded', 'false');
        a.classList.remove('open');
      });

      // Toggle current
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });
})();


/* ──────────────────────────────────────────────────────
   8. AVAILABILITY CHECKER
   ────────────────────────────────────────────────────── */
(function initAvailabilityChecker() {
  const form        = document.getElementById('avail-form');
  const checkBtn    = document.getElementById('check-avail-btn');
  const btnText     = checkBtn?.querySelector('.btn-text');
  const btnLoader   = checkBtn?.querySelector('.btn-loader');
  const resultOK    = document.getElementById('avail-result-available');
  const resultEnq   = document.getElementById('avail-result-enquiry');

  if (!form) return;

  // Validation helper
  function validateField(input, errorId, message) {
    const errorEl = document.getElementById(errorId);
    if (!input.value.trim()) {
      input.classList.add('error');
      input.classList.remove('valid');
      if (errorEl) errorEl.textContent = message;
      return false;
    }
    input.classList.remove('error');
    input.classList.add('valid');
    if (errorEl) errorEl.textContent = '';
    return true;
  }

  function validatePhone(input) {
    const errorEl = document.getElementById('contact-phone-error');
    const phone = input.value.trim();
    const phonePattern = /^[6-9]\d{9}$/;
    if (!phone) {
      input.classList.add('error');
      if (errorEl) errorEl.textContent = 'Please enter your WhatsApp number.';
      return false;
    }
    if (!phonePattern.test(phone.replace(/[\s\-\+]/g, ''))) {
      input.classList.add('error');
      if (errorEl) errorEl.textContent = 'Please enter a valid 10-digit mobile number.';
      return false;
    }
    input.classList.remove('error');
    input.classList.add('valid');
    if (errorEl) errorEl.textContent = '';
    return true;
  }

  let bookedDatesList = [];

  // Set min attribute on date input to today
  const dateInputEl = document.getElementById('event-date');
  const todayStr = new Date().toISOString().split('T')[0];
  if (dateInputEl) {
    dateInputEl.setAttribute('min', todayStr);
  }

  async function fetchBookedDates() {
    try {
      const res = await fetch('/api/availability/booked-dates');
      const data = await res.json();
      if (data.success && Array.isArray(data.bookedDates)) {
        bookedDatesList = data.bookedDates;
        // Re-validate if date is currently selected
        if (dateInputEl && dateInputEl.value) {
          validateDate(dateInputEl);
        }
      }
    } catch (err) {
      console.warn('Could not fetch booked dates list:', err);
    }
  }

  // Fetch booked dates on page load
  fetchBookedDates();

  function validateDate(input) {
    if (!input) return false;
    const errorEl = document.getElementById('event-date-error');
    const hintEl  = document.getElementById('date-availability-hint');
    const val     = input.value;

    if (!val) {
      input.classList.add('error');
      input.classList.remove('valid');
      if (errorEl) errorEl.textContent = 'Please select your event date.';
      if (hintEl) hintEl.innerHTML = '<span style="color:#A0A0A0;">🟢 Select your date. Booked dates will be blocked automatically.</span>';
      return false;
    }

    if (val < todayStr) {
      input.classList.add('error');
      input.classList.remove('valid');
      if (errorEl) errorEl.textContent = 'Event date cannot be in the past. Please select a future date.';
      if (hintEl) hintEl.innerHTML = '<span style="color:#FF4D4D;">🔴 Date cannot be in the past.</span>';
      return false;
    }

    if (bookedDatesList.includes(val)) {
      input.classList.add('error');
      input.classList.remove('valid');
      if (errorEl) errorEl.textContent = 'Sorry! This date has already been booked. Please select another available date.';
      if (hintEl) hintEl.innerHTML = `<span style="color:#FF4D4D; font-weight:bold;">🔴 Date ${val} is BOOKED / UNAVAILABLE.</span>`;
      return false;
    }

    input.classList.remove('error');
    input.classList.add('valid');
    if (errorEl) errorEl.textContent = '';
    if (hintEl) hintEl.innerHTML = `<span style="color:#00E676; font-weight:bold;">🟢 Date ${val} is AVAILABLE!</span>`;
    return true;
  }

  function validateEmail(input) {
    if (!input) return true;
    const val = input.value.trim();
    const errorEl = document.getElementById('contact-email-error');
    if (!val) {
      input.classList.add('error');
      if (errorEl) errorEl.textContent = 'Email address is required.';
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      input.classList.add('error');
      if (errorEl) errorEl.textContent = 'Please enter a valid email address.';
      return false;
    }
    input.classList.remove('error');
    input.classList.add('valid');
    if (errorEl) errorEl.textContent = '';
    return true;
  }

  // Live validation on blur/input
  document.getElementById('event-date')?.addEventListener('change', (e) => validateDate(e.target));
  document.getElementById('event-date')?.addEventListener('input', (e) => validateDate(e.target));
  document.getElementById('event-type')?.addEventListener('change', (e) => validateField(e.target, 'event-type-error', 'Please select your event type.'));
  document.getElementById('event-city')?.addEventListener('input', (e) => validateField(e.target, 'event-city-error', 'Please enter your city.'));
  document.getElementById('contact-name')?.addEventListener('input', (e) => validateField(e.target, 'contact-name-error', 'Please enter your name.'));
  document.getElementById('contact-email')?.addEventListener('input', (e) => validateEmail(e.target));
  document.getElementById('contact-phone')?.addEventListener('input', (e) => validatePhone(e.target));

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput     = document.getElementById('contact-name');
    const emailInput    = document.getElementById('contact-email');
    const phoneInput    = document.getElementById('contact-phone');
    const dateInput     = document.getElementById('event-date');
    const timeInput     = document.getElementById('event-time');
    const typeInput     = document.getElementById('event-type');
    const cityInput     = document.getElementById('event-city');
    const pkgInput      = document.getElementById('event-package');
    const durationInput = document.getElementById('event-duration');
    const msgInput      = document.getElementById('event-message');

    // Validate all fields
    const v1 = validateField(nameInput, 'contact-name-error', 'Please enter your name.');
    const v2 = validateEmail(emailInput);
    const v3 = validatePhone(phoneInput);
    const v4 = validateDate(dateInput);
    const v5 = validateField(typeInput, 'event-type-error', 'Please select your event type.');
    const v6 = validateField(cityInput, 'event-city-error', 'Please enter your city.');

    if (!v1 || !v2 || !v3 || !v4 || !v5 || !v6) return;

    // Show loading state & disable button (Double submission protection)
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline-flex';
    checkBtn.disabled = true;

    // Hide previous results
    resultOK.style.display = 'none';
    resultEnq.style.display = 'none';

    const payload = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      event_date: dateInput.value,
      event_time: timeInput ? timeInput.value.trim() : '',
      event_type: typeInput.options[typeInput.selectedIndex]?.text || typeInput.value,
      city: cityInput.value.trim(),
      package_name: pkgInput ? pkgInput.value : '',
      duration: durationInput ? durationInput.value.trim() : '',
      message: msgInput ? msgInput.value.trim() : ''
    };

    fetch('/api/bookings/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(async res => {
      const data = await res.json();
      if (btnText) btnText.style.display = 'inline';
      if (btnLoader) btnLoader.style.display = 'none';
      checkBtn.disabled = false;

      if (res.status === 409 || data.error === 'DATE_UNAVAILABLE') {
        // Refresh booked dates
        fetchBookedDates();
        const errEl = document.getElementById('event-date-error');
        if (errEl) errEl.textContent = data.message || 'Sorry! This date has already been booked. Please select another available date.';
        dateInput.classList.add('error');
        dateInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      if (data.success) {
        // Update local booked dates list
        fetchBookedDates();

        const bookingRef = data.bookingId || data.booking_ref || 'PBW-BOOKING';
        resultOK.style.display = 'block';
        resultOK.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const titleEl = resultOK.querySelector('h3');
        const descEl  = resultOK.querySelector('p');

        if (titleEl) titleEl.textContent = `🎉 Booking Request Submitted! (#${bookingRef})`;
        if (descEl) {
          descEl.innerHTML = `
            <strong>Thank you, ${escapeHtml(payload.name)}!</strong><br>
            ${data.message}<br>
            <span style="color: var(--gold); font-size: 0.9rem; display: block; margin-top: 8px;">
              📩 Please check your inbox and spam/junk folder for your booking confirmation email.
            </span>
          `;
        }

        const waMsg = encodeURIComponent(
          `Hi Photo Booth Wala! 🎉\n\nI just submitted booking request #${bookingRef}:\n\n` +
          `📅 Date: ${payload.event_date}\n🎉 Event: ${payload.event_type}\n📍 City: ${payload.city}\n👤 Name: ${payload.name}\n📱 Phone: ${payload.phone}\n✉️ Email: ${payload.email}\n📦 Package: ${payload.package_name}\n\n` +
          `Please confirm my booking. Thank you!`
        );

        resultOK.querySelectorAll('a[href*="wa.me"]').forEach(link => {
          link.href = `https://wa.me/[WHATSAPP_NUMBER]?text=${waMsg}`;
        });
      } else {
        alert(data.message || 'Error submitting booking.');
      }
    })
    .catch(err => {
      if (btnText) btnText.style.display = 'inline';
      if (btnLoader) btnLoader.style.display = 'none';
      checkBtn.disabled = false;
      resultEnq.style.display = 'block';
    });
  });
})();


/* ──────────────────────────────────────────────────────
   9. PARTNER MODAL
   ────────────────────────────────────────────────────── */
const partnerModal = document.getElementById('partner-modal');

function openPartnerModal() {
  partnerModal.classList.add('open');
  partnerModal.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
  const firstInput = partnerModal.querySelector('input');
  if (firstInput) firstInput.focus();
}

function closePartnerModal() {
  partnerModal.classList.remove('open');
  partnerModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function submitPartnerForm(e) {
  e.preventDefault();
  const form         = document.getElementById('partner-form');
  const successMsg   = document.getElementById('partner-form-success');
  const nameInput    = document.getElementById('partner-name');
  const phoneInput   = document.getElementById('partner-phone');
  const typeInput    = document.getElementById('partner-type');

  if (!nameInput.value.trim() || !phoneInput.value.trim() || !typeInput.value) {
    alert('Please fill in all required fields.');
    return;
  }

  // Build WhatsApp message for partner enquiry
  const name      = nameInput.value.trim();
  const phone     = phoneInput.value.trim();
  const type      = typeInput.options[typeInput.selectedIndex]?.text || typeInput.value;
  const city      = document.getElementById('partner-city')?.value.trim() || '';
  const message   = document.getElementById('partner-message')?.value.trim() || '';

  const waMsg = encodeURIComponent(
    `Hi! I'd like to become a Photo Booth Wala Partner! 🤝\n\n` +
    `👤 Name: ${name}\n📱 Phone: ${phone}\n🏢 Business: ${type}\n📍 City: ${city}\n\n` +
    `${message ? `Message: ${message}\n\n` : ''}` +
    `Please share the partner program details. Thank you!`
  );

  // Show success and update WA link
  form.style.display = 'none';
  successMsg.style.display = 'block';
  const waLink = successMsg.querySelector('a[href*="wa.me"]');
  if (waLink) waLink.href = `https://wa.me/[WHATSAPP_NUMBER]?text=${waMsg}`;
}


/* ──────────────────────────────────────────────────────
   10. SMOOTH SCROLL for anchor links
   ────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const navHeight = document.getElementById('navbar')?.offsetHeight || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


/* ──────────────────────────────────────────────────────
   11. SET MINIMUM DATE (today) for date input
   ────────────────────────────────────────────────────── */
(function setMinDate() {
  const dateInput = document.getElementById('event-date');
  if (!dateInput) return;
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
})();


/* ──────────────────────────────────────────────────────
   12. ACTIVE NAV LINK STYLE INJECTION
   ────────────────────────────────────────────────────── */
(function injectNavLinkActiveStyle() {
  const style = document.createElement('style');
  style.textContent = `.nav-link.active { color: var(--gold) !important; }`;
  document.head.appendChild(style);
})();


/* ──────────────────────────────────────────────────────
   13. PERFORMANCE — Image lazy load fallback
   ────────────────────────────────────────────────────── */
if ('loading' in HTMLImageElement.prototype) {
  // Browser supports native lazy loading — nothing extra needed
} else {
  // Fallback for older browsers
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  const lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.getAttribute('data-src') || img.src;
        lazyObserver.unobserve(img);
      }
    });
  });
  lazyImages.forEach(img => lazyObserver.observe(img));
}


/* ──────────────────────────────────────────────────────
   14. HERO CTA — WhatsApp prefilled message
   ────────────────────────────────────────────────────── */
(function prefillHeroWhatsApp() {
  const heroWABtn = document.getElementById('hero-whatsapp-btn');
  if (heroWABtn) {
    const msg = encodeURIComponent(
      `Hi Photo Booth Wala! 🎉\n\nI visited your website and I'm interested in booking a Photo Booth for my event.\n\nCould you please share package details and check availability for my date? Thank you!`
    );
    heroWABtn.href = `https://wa.me/[WHATSAPP_NUMBER]?text=${msg}`;
  }
})();


/* ──────────────────────────────────────────────────────
   15. MOBILE STICKY CTA — hide when footer visible
   ────────────────────────────────────────────────────── */
(function initMobileStickyVisibility() {
  const stickyCTA = document.getElementById('mobile-sticky-cta');
  const footer = document.querySelector('.footer');
  if (!stickyCTA || !footer) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      stickyCTA.style.opacity = entry.isIntersecting ? '0' : '1';
      stickyCTA.style.pointerEvents = entry.isIntersecting ? 'none' : 'all';
    });
  }, { threshold: 0.1 });

  obs.observe(footer);
})();


/* ──────────────────────────────────────────────────────
   16. COUNTER ANIMATION (for trust badge "500+ Events")
   ────────────────────────────────────────────────────── */
(function initCounterAnimation() {
  const badge = document.querySelector('.badge-num');
  if (!badge) return;

  const target = parseInt(badge.textContent, 10) || 500;
  let started  = false;

  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      let count = 0;
      const step = Math.ceil(target / 50);
      const timer = setInterval(() => {
        count = Math.min(count + step, target);
        badge.textContent = count + '+';
        if (count >= target) clearInterval(timer);
      }, 30);
    }
  }, { threshold: 0.5 });

  obs.observe(badge);
})();


/* ──────────────────────────────────────────────────────
   17. INTERSECTION-BASED STAGGER for cards
   ────────────────────────────────────────────────────── */
(function initCardStagger() {
  const staggerGroups = [
    '.events-grid',
    '.benefits-grid',
    '.packages-grid',
    '.process-timeline',
    '.gallery-masonry',
    '.reviews-carousel',
  ];

  staggerGroups.forEach(selector => {
    const parent = document.querySelector(selector);
    if (!parent) return;
    const children = parent.querySelectorAll('[data-reveal]');
    children.forEach((child, i) => {
      // Only set delay if not already set via inline style
      if (!child.style.getPropertyValue('--card-delay')) {
        child.style.setProperty('--card-delay', `${i * 0.08}s`);
      }
      child.style.transitionDelay = child.style.getPropertyValue('--card-delay');
    });
  });
})();


/* ──────────────────────────────────────────────────────
   18. LOGO FALLBACK — copy logo to images folder on load
   ────────────────────────────────────────────────────── */
// Note: The logo.png should be placed manually in the images/ folder by the owner.
// All img tags with src="images/logo.png" have onerror fallbacks to display text.

console.log(
  '%c📸 PHOTO BOOTH WALA',
  'font-size: 1.2rem; font-weight: bold; color: #D4AF37; background: #111; padding: 8px 16px; border-radius: 4px; border: 1px solid #D4AF37;'
);
console.log('%cMemories Printed, Smiles Delivered.', 'color: #C8C8C8;');
console.log('%c📞 Replace all [PLACEHOLDER] values with your actual business details!', 'color: #EF4444; font-weight: bold;');

/* ──────────────────────────────────────────────────────
   19. CITY SELECTOR — "WHERE WE SERVE" interactive clicks
   ────────────────────────────────────────────────────── */
(function initCitySelector() {
  const cityElements = document.querySelectorAll('[data-city]');
  const cityInput = document.getElementById('event-city');
  const availSection = document.getElementById('availability');

  if (!cityElements.length) return;

  cityElements.forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const selectedCity = el.getAttribute('data-city') || el.dataset.city;
      if (!selectedCity) return;

      // 1. Highlight all items matching this city (pill + map node)
      document.querySelectorAll('[data-city]').forEach(c => c.classList.remove('active'));
      document.querySelectorAll(`[data-city="${CSS.escape(selectedCity)}"]`).forEach(c => c.classList.add('active'));

      // 2. Pre-fill Availability form city field
      if (cityInput) {
        cityInput.value = selectedCity;
        cityInput.classList.remove('error');
        cityInput.classList.add('valid');
        const errorEl = document.getElementById('event-city-error');
        if (errorEl) errorEl.textContent = '';

        // Add a visual flash on the input
        cityInput.style.transition = 'all 0.3s ease';
        cityInput.style.borderColor = 'var(--gold)';
        cityInput.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.6)';
        setTimeout(() => {
          cityInput.style.boxShadow = '';
        }, 1500);
      }

      // 3. Smooth scroll down to availability section
      if (availSection) {
        availSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

/* ──────────────────────────────────────────────────────
   20. PUBLIC SETTINGS — Sync Instagram & Settings from API/DB
   ────────────────────────────────────────────────────── */
(function initPublicSettings() {
  const DEFAULT_INSTA_URL = 'https://www.instagram.com/photo_boothwala?igsh=eHd2OGdjbGJrdHRn';

  function applyInstaUrl(url) {
    const finalUrl = url || DEFAULT_INSTA_URL;
    document.querySelectorAll('a[href*="instagram.com"], a#gallery-instagram-btn, a#final-insta-btn').forEach(link => {
      link.href = finalUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });
  }

  // Apply default immediately
  applyInstaUrl(DEFAULT_INSTA_URL);

  fetch('/api/settings/public')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.data) {
        const val = data.data.instagram;
        if (val && typeof val === 'string' && !val.includes('[INSTAGRAM')) {
          let instaUrl = val;
          if (!instaUrl.startsWith('http')) {
            instaUrl = `https://www.instagram.com/${instaUrl.replace(/^@/, '')}`;
          }
          applyInstaUrl(instaUrl);
        }
      }
    })
    .catch(() => {
      applyInstaUrl(DEFAULT_INSTA_URL);
    });
})();
