const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const pageRegions = document.querySelectorAll('main, .footer');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  navLinks.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  pageRegions.forEach(region => region.removeAttribute('inert'));
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
  navLinks.classList.toggle('is-open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
  pageRegions.forEach(region => region.toggleAttribute('inert', !isOpen));
  if (!isOpen) requestAnimationFrame(() => navLinks.querySelector('a').focus());
});

navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navLinks.classList.contains('is-open')) {
    closeMenu();
    menuButton.focus();
  }
});

const mobileNavigation = window.matchMedia('(max-width: 820px)');
mobileNavigation.addEventListener('change', event => {
  if (!event.matches) closeMenu();
});

const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const sectionLinks = new Map(
  Array.from(navLinks.querySelectorAll('a[href^="#"]')).map(link => [link.hash.slice(1), link])
);
const trackedSections = Array.from(document.querySelectorAll('main section[id]'))
  .filter(section => sectionLinks.has(section.id));
let navigationFrame = 0;

function updateCurrentNavigation() {
  const marker = window.scrollY + window.innerHeight * 0.38;
  let activeId = null;

  trackedSections.forEach(section => {
    if (section.offsetTop <= marker) activeId = section.id;
  });

  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
    activeId = 'contacto';
  }

  sectionLinks.forEach((link, sectionId) => {
    const isCurrent = sectionId === activeId;
    link.classList.toggle('is-current', isCurrent);
    if (isCurrent) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });

  navigationFrame = 0;
}

function requestNavigationUpdate() {
  if (!navigationFrame) navigationFrame = requestAnimationFrame(updateCurrentNavigation);
}

updateCurrentNavigation();
window.addEventListener('scroll', requestNavigationUpdate, { passive: true });
window.addEventListener('resize', requestNavigationUpdate);

const tabs = document.querySelectorAll('[role="tab"]');
tabs.forEach(tab => {
  tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;

  tab.addEventListener('click', () => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(`panel-${item.dataset.tab}`).hidden = !selected;
    });
  });

  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (Array.from(tabs).indexOf(tab) + direction + tabs.length) % tabs.length;
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  });
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');
if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach(item => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => observer.observe(item));
}

const form = document.getElementById('formularioContacto');
const status = document.getElementById('form-status');
const submitButton = form.querySelector('button[type="submit"]');
const honeypot = form.elements.namedItem('_honey');
let formOpenedAt = performance.now();

form.addEventListener('submit', async event => {
  event.preventDefault();
  status.className = 'form-status';

  if (honeypot.value) {
    form.reset();
    status.classList.add('success');
    status.textContent = 'Mensaje enviado. Gracias.';
    return;
  }

  if (performance.now() - formOpenedAt < 1500) {
    status.classList.add('error');
    status.textContent = 'Espera un momento antes de enviar el formulario.';
    return;
  }

  status.textContent = 'Enviando mensaje…';
  submitButton.disabled = true;

  try {
    const response = await fetch('https://formsubmit.co/ajax/josehur2003@gmail.com', {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error('No se pudo enviar el formulario');
    form.reset();
    formOpenedAt = performance.now();
    status.classList.add('success');
    status.textContent = 'Mensaje enviado. Gracias, te responderé lo antes posible.';
  } catch (error) {
    status.classList.add('error');
    status.textContent = 'No se ha podido enviar. Puedes escribirme directamente por correo.';
  } finally {
    submitButton.disabled = false;
  }
});

document.getElementById('current-year').textContent = new Date().getFullYear();
