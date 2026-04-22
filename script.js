/* === L4B3D TITANIUM SCRIPT === */
/* Enhanced with particle effects, smooth animations, and emotional interactions */

// GOOGLE SHEET CONFIGURATION
const ORIGINAL_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRD-8tUObA46f-lYxB9f2bSvzNsPTLiDGxhmLSvRW9N5keIKlDW5J6uWiTgsgB85C_xovHxBwzNvdN0/pub?gid=1710654212&single=true&output=csv`;
const SHEET_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(ORIGINAL_URL)}`;

// Particle Effect Variables
let particles = [];
let canvas, ctx;
let currentImageIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all systems
  initCurtain();
  initUI();
  initParticles();
  
  // Page-specific initialization
  if (document.getElementById('mediaGrid')) {
    initDatabase();
  }
  
  if (document.getElementById('thoughtInput')) {
    initThoughtInterface();
  }
});

/* [1] CURTAIN TRANSITION */
function initCurtain() {
  const curtain = document.querySelector('.curtain');
  if (curtain) {
    setTimeout(() => {
      curtain.classList.add('hidden');
      setTimeout(() => {
        curtain.style.display = 'none';
      }, 800);
    }, 300);
  }
}

/* [2] UI & NAVIGATION */
function initUI() {
  const toggleBtn = document.querySelector('.toggle-btn');
  const sidePanel = document.querySelector('.side-panel');
  
  if (toggleBtn && sidePanel) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidePanel.classList.toggle('collapsed');
    });

    // Auto-collapse on mobile
    if (window.innerWidth <= 768) {
      sidePanel.classList.add('collapsed');
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        sidePanel.classList.add('collapsed');
      }
    });
  }

  // Smooth page transitions
  document.querySelectorAll('a').forEach(link => {
    if (link.href.includes(window.location.origin) && !link.href.includes('#')) {
      link.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) return;
        e.preventDefault();
        
        const curtain = document.querySelector('.curtain');
        if (curtain) {
          curtain.style.display = 'block';
          curtain.classList.remove('hidden');
        }
        
        setTimeout(() => {
          window.location.href = link.href;
        }, 500);
      });
    }
  });

  // Accordion functionality for Dark Times page
  const eraHeaders = document.querySelectorAll('.era-header');
  if (eraHeaders.length > 0) {
    eraHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const isOpen = content.classList.contains('open');
        
        // Close all others
        document.querySelectorAll('.era-content').forEach(c => {
          c.classList.remove('open');
          c.style.maxHeight = null;
        });
        
        // Open clicked one
        if (!isOpen) {
          content.classList.add('open');
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });
    });
  }

  // Scroll animations
  observeElements();
}

/* [3] PARTICLE EFFECTS */
function initParticles() {
  canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  resizeCanvas();

  window.addEventListener('resize', resizeCanvas);

  // Create particles
  for (let i = 0; i < 50; i++) {
    particles.push(createParticle());
  }

  animateParticles();
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticle() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 0.5,
    speedX: (Math.random() - 0.5) * 0.5,
    speedY: (Math.random() - 0.5) * 0.5,
    opacity: Math.random() * 0.5 + 0.2
  };
}

function animateParticles() {
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    // Update position
    p.x += p.speedX;
    p.y += p.speedY;

    // Wrap around edges
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    // Draw particle
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`;
    ctx.fill();
  });

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 120) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 * (1 - distance / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animateParticles);
}

/* [4] DATABASE LOGIC */
async function initDatabase() {
  const grid = document.getElementById('mediaGrid');
  
  try {
    const response = await fetch(SHEET_URL);
    
    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }

    const text = await response.text();
    const data = csvToJson(text);

    grid.innerHTML = '';
    
    if (data.length === 0) {
      grid.innerHTML = '<p class="loading-text">No data found in the archives.</p>';
      return;
    }

    // Render media cards
    data.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'media-card fade-in';
      card.style.animationDelay = `${index * 0.05}s`;
      
      const poster = item.Poster || 'https://placehold.co/400x600?text=VOID';
      
      card.innerHTML = `
        <img src="${poster}" class="media-poster" loading="lazy" alt="${item.Title || 'Unknown'}">
        <div class="media-info">
          <h3 class="media-title">${item.Title || 'Unknown'}</h3>
          <span class="media-year">${item.Year || '----'}</span>
        </div>
      `;
      
      card.onclick = () => openModal(item);
      grid.appendChild(card);
    });

  } catch (error) {
    console.error("Database Error:", error);
    grid.innerHTML = `
      <div class="loading-container" style="grid-column: 1/-1;">
        <div style="text-align: center; color: #ff0000; border: 1px solid #ff0000; padding: 2rem; background: rgba(0,0,0,0.8); border-radius: 4px;">
          <h3>CONNECTION FAILURE</h3>
          <p>${error.message}</p>
          <p style="color: #888; margin-top: 1rem; font-size: 0.9rem;">Using proxy bypass. Please try again later.</p>
        </div>
      </div>
    `;
  }
}

function csvToJson(csv) {
  const lines = csv.trim().split(/\r\n|\n/);
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    
    const obj = {};
    headers.forEach((header, index) => {
      let val = currentLine[index] || '';
      val = val.trim().replace(/^"|"$/g, '').replace(/""/g, '"');
      obj[header] = val;
    });
    result.push(obj);
  }
  return result;
}

/* [5] MODAL SYSTEM */
function openModal(item) {
  const modal = document.getElementById('mediaModal');
  const title = document.getElementById('mTitle');
  
  title.innerText = item.Title || "Unknown";
  title.setAttribute('data-text', item.Title || "Unknown");
  document.getElementById('mYear').innerText = item.Year || "N/A";
  document.getElementById('mDesc').innerText = item.Description || "No description available.";

  const swiper = document.getElementById('modalSwiper');
  swiper.innerHTML = '';
  
  // Collect all images
  let images = [];
  if (item.Poster) images.push(item.Poster);
  
  Object.keys(item).forEach(key => {
    if (key.toLowerCase().includes('image') && item[key]) {
      images.push(item[key]);
    }
  });

  // Render images
  images.forEach((url, i) => {
    const img = document.createElement('img');
    img.src = url;
    img.className = `modal-swiper-img ${i === 0 ? 'active' : ''}`;
    img.alt = `${item.Title} - Image ${i + 1}`;
    swiper.appendChild(img);
  });

  // Add navigation if multiple images
  if (images.length > 1) {
    const controls = document.createElement('div');
    controls.className = 'swiper-controls';
    controls.innerHTML = `
      <button class="swiper-nav prev" onclick="prevImage()">‹</button>
      <button class="swiper-nav next" onclick="nextImage()">›</button>
    `;
    swiper.appendChild(controls);
  }

  currentImageIndex = 0;
  modal.classList.add('active');
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('mediaModal');
  modal.classList.remove('active');
  
  // Re-enable body scroll
  document.body.style.overflow = '';
  
  if (modal.interval) {
    clearInterval(modal.interval);
  }
}

function nextImage() {
  const images = document.querySelectorAll('.modal-swiper-img');
  if (images.length <= 1) return;
  
  images[currentImageIndex].classList.remove('active');
  currentImageIndex = (currentImageIndex + 1) % images.length;
  images[currentImageIndex].classList.add('active');
}

function prevImage() {
  const images = document.querySelectorAll('.modal-swiper-img');
  if (images.length <= 1) return;
  
  images[currentImageIndex].classList.remove('active');
  currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
  images[currentImageIndex].classList.add('active');
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});

/* [6] THOUGHT INTERFACE */
function initThoughtInterface() {
  const input = document.getElementById('thoughtInput');
  if (!input) return;

  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      const thought = input.value.trim();
      if (thought === "") return;

      const originalPlaceholder = input.placeholder;
      
      // Visual feedback
      input.value = "UPLOADING TO THE VOID...";
      input.style.color = "#ff00ff";
      input.disabled = true;
      
      setTimeout(() => {
        input.value = "";
        input.placeholder = "THOUGHT CAPTURED.";
        input.style.color = "#00ffff";
        input.disabled = false;
        
        // Create floating thought particle
        createThoughtParticle(thought);
      }, 1000);

      setTimeout(() => {
        input.placeholder = originalPlaceholder;
      }, 3000);
    }
  });
}

function createThoughtParticle(text) {
  const particle = document.createElement('div');
  particle.style.cssText = `
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: #00ffff;
    font-size: 0.9rem;
    opacity: 1;
    pointer-events: none;
    z-index: 9999;
    text-shadow: 0 0 10px #00ffff;
    max-width: 200px;
    text-align: center;
  `;
  particle.textContent = text.substring(0, 50) + (text.length > 50 ? '...' : '');
  document.body.appendChild(particle);

  // Animate
  let opacity = 1;
  let y = 0;
  const interval = setInterval(() => {
    y -= 2;
    opacity -= 0.02;
    particle.style.transform = `translate(-50%, calc(-50% + ${y}px))`;
    particle.style.opacity = opacity;

    if (opacity <= 0) {
      clearInterval(interval);
      document.body.removeChild(particle);
    }
  }, 30);
}

/* [7] SCROLL ANIMATIONS */
function observeElements() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1
  });

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });
}

/* [8] UTILITY FUNCTIONS */
function goHome() {
  const curtain = document.querySelector('.curtain');
  if (curtain) {
    curtain.style.display = 'block';
    curtain.classList.remove('hidden');
  }
  setTimeout(() => {
    window.location.href = "index.html";
  }, 500);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Performance: Reduce animations on low-power devices
if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
  document.body.classList.add('reduced-motion');
}

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
  konamiCode.push(e.key);
  konamiCode = konamiCode.slice(-10);
  
  if (konamiCode.join('') === konamiSequence.join('')) {
    activateEasterEgg();
  }
});

function activateEasterEgg() {
  // Create glitch effect
  document.body.style.animation = 'glitch-1 0.3s infinite';
  setTimeout(() => {
    document.body.style.animation = '';
    
    // Show message
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid #fcee0a;
      padding: 3rem;
      text-align: center;
      z-index: 99999;
      color: #fcee0a;
      font-size: 1.5rem;
      box-shadow: 0 0 50px rgba(252, 238, 10, 0.5);
    `;
    message.innerHTML = `
      <h2 style="margin: 0 0 1rem 0; font-size: 2rem;">YOU FOUND IT</h2>
      <p style="margin: 0;">Welcome to the deepest layer of the river.</p>
      <p style="margin-top: 1rem; font-size: 1rem; color: #00ffff;">- l4b3d</p>
    `;
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.style.transition = 'opacity 1s';
      message.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(message);
      }, 1000);
    }, 3000);
  }, 1500);
}

// Console message for curious developers
console.log('%c l4b3d_UNIVERSE ', 'background: #000; color: #00ffff; font-size: 20px; padding: 10px; font-family: monospace;');
console.log('%c Welcome to the river, traveler. ', 'color: #fcee0a; font-size: 14px; font-family: monospace;');
console.log('%c This sanctuary was built with emotion, not just code. ', 'color: #888; font-size: 12px; font-family: monospace;');
