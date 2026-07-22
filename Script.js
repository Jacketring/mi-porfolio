const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  navLinks.classList.remove('is-open');
  document.body.classList.remove('menu-open');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
  navLinks.classList.toggle('is-open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', window.scrollY > 24), { passive: true });

const tabs = document.querySelectorAll('[role="tab"]');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-selected', String(selected));
      document.getElementById(`panel-${item.dataset.tab}`).hidden = !selected;
    });
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

form.addEventListener('submit', async event => {
  event.preventDefault();
  status.className = 'form-status';
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
