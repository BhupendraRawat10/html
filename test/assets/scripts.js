/* small helper for nav toggle + form */
document.addEventListener('DOMContentLoaded', () => {
  // set current year in footers
  document.querySelectorAll('[id^="year"]').forEach(el => el.textContent = new Date().getFullYear());

  // nav toggle
  const toggles = document.querySelectorAll('.nav-toggle');
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const nav = document.getElementById(btn.getAttribute('aria-controls'));
      if (nav) nav.classList.toggle('open');
    });
  });

  // simple contact form validation + mailto fallback
  const form = document.getElementById('contactForm');
  if (form) {
    const msgEl = document.getElementById('formMsg');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) {
        msgEl.textContent = 'Please fill out all fields.';
        msgEl.style.color = 'crimson';
        return;
      }

      // For prototype: open mail client (production would POST to API)
      const subject = encodeURIComponent(`NSBLPA contact from ${name}`);
      const body = encodeURIComponent(message + '\n\n' + 'Contact email: ' + email);
      window.location.href = `mailto:hello@nsblpa.com?subject=${subject}&body=${body}`;
      msgEl.textContent = 'Opening your email client...';
      msgEl.style.color = '';
    });
  }
});
