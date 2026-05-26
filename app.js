/* ==========================================================================
   SACRED GEOGRAPHY - INTERACTIVE BEHAVIORS
   Tony Harding Book Marketing Site
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     1. 3D Book Cover Tilt Effect
     ========================================== */
  const heroVisual = document.querySelector('.hero-visual');
  const book3D = document.getElementById('book-3d-element');
  const bookShadow = document.querySelector('.book-shadow');

  if (heroVisual && book3D) {
    heroVisual.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      // Calculate mouse coordinates relative to the hero visual container
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate center of the container
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate offsets from center (-1 to 1 range)
      const offsetX = (x - centerX) / centerX;
      const offsetY = (y - centerY) / centerY;
      
      // Map offsets to rotation angles (limit rotation to keep it natural)
      // Max Y rotation: -40 to 0 degrees (default is -20)
      // Max X rotation: 0 to 20 degrees (default is 10)
      const rotateY = -20 + (offsetX * 20);
      const rotateX = 10 - (offsetY * 15);
      
      // Rotate the book
      book3D.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      
      // Adjust book shadow based on rotation
      if (bookShadow) {
        const shadowShiftX = offsetX * -15;
        const shadowShiftY = offsetY * 5;
        const shadowScale = 1 - (Math.abs(offsetY) * 0.05);
        bookShadow.style.transform = `translateX(${shadowShiftX}px) translateY(${shadowShiftY}px) scale(${shadowScale})`;
      }
    });

    // Reset position smoothly when mouse leaves
    heroVisual.addEventListener('mouseleave', () => {
      book3D.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
      book3D.style.transform = 'rotateY(-20deg) rotateX(10deg)';
      
      if (bookShadow) {
        bookShadow.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
        bookShadow.style.transform = 'none';
      }
      
      // Remove the reset transition after animation completes so it tilts instantly again
      setTimeout(() => {
        book3D.style.transition = 'none';
        if (bookShadow) bookShadow.style.transition = 'none';
      }, 800);
    });
  }


  /* ==========================================
     2. Chapter Excerpt Tab Switcher
     ========================================== */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const excerpts = document.querySelectorAll('.chapter-excerpt');

  if (tabBtns.length > 0 && excerpts.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetChapter = btn.getAttribute('data-chapter');

        // Deactivate all tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        // Activate current tab
        btn.classList.add('active');

        // Fade out active excerpt, then switch and fade in the target
        const currentActiveExcerpt = document.querySelector('.chapter-excerpt.active');
        
        if (currentActiveExcerpt) {
          currentActiveExcerpt.style.opacity = '0';
          
          setTimeout(() => {
            currentActiveExcerpt.classList.remove('active');
            currentActiveExcerpt.setAttribute('aria-hidden', 'true');
            
            const targetExcerpt = document.getElementById(`excerpt-${targetChapter}`);
            if (targetExcerpt) {
              targetExcerpt.classList.add('active');
              targetExcerpt.setAttribute('aria-hidden', 'false');
              // Trigger reflow for transition
              targetExcerpt.offsetHeight;
              targetExcerpt.style.opacity = '1';
            }
          }, 300); // Match CSS transition duration
        }
      });
    });
  }


  /* ==========================================
     3. Captioned Gallery Lightbox Modal
     ========================================== */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption-text');
  const closeBtn = document.getElementById('lightbox-close-btn');
  const prevBtn = document.getElementById('lightbox-prev-btn');
  const nextBtn = document.getElementById('lightbox-next-btn');

  let currentGalleryIndex = 0;
  const galleryData = [];

  // Populate gallery data array
  galleryItems.forEach((item, index) => {
    galleryData.push({
      src: item.getAttribute('data-src'),
      caption: item.getAttribute('data-caption'),
      title: item.querySelector('h4').textContent
    });

    item.addEventListener('click', () => {
      openLightbox(index);
    });
  });

  function openLightbox(index) {
    if (!lightbox || !lightboxImg || !lightboxCaption) return;
    
    currentGalleryIndex = index;
    const item = galleryData[currentGalleryIndex];
    
    lightboxImg.src = item.src;
    lightboxImg.alt = item.title;
    lightboxCaption.textContent = item.caption;
    
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Lock page scroll
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Unlock page scroll
  }

  function navigateLightbox(direction) {
    currentGalleryIndex += direction;
    
    // Wrap around index
    if (currentGalleryIndex >= galleryData.length) {
      currentGalleryIndex = 0;
    } else if (currentGalleryIndex < 0) {
      currentGalleryIndex = galleryData.length - 1;
    }
    
    const item = galleryData[currentGalleryIndex];
    
    // Smooth transition between images inside lightbox
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
      lightboxImg.src = item.src;
      lightboxImg.alt = item.title;
      lightboxCaption.textContent = item.caption;
      lightboxImg.style.opacity = '1';
    }, 150);
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', () => navigateLightbox(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigateLightbox(1));

  // Close when clicking background mask
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      navigateLightbox(-1);
    } else if (e.key === 'ArrowRight') {
      navigateLightbox(1);
    }
  });


  /* ==========================================
     4. Header Shrink on Scroll
     ========================================== */
  const header = document.getElementById('main-header');
  
  window.addEventListener('scroll', () => {
    if (!header) return;
    if (window.scrollY > 50) {
      header.classList.add('shrink');
    } else {
      header.classList.remove('shrink');
    }
  });


  /* ==========================================
     5. Scroll Reveal IntersectionObserver
     ========================================== */
  const revealElements = document.querySelectorAll('.scroll-reveal');

  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          observer.unobserve(entry.target); // Stop observing once revealed
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before element enters screen
    });

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });
  } else {
    // Fallback for older browsers: show elements immediately
    revealElements.forEach(element => {
      element.classList.add('reveal-active');
    });
  }
});
