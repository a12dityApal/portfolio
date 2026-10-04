const PROFILE = {
  skills: ['HTML', 'CSS', 'JavaScript', 'Python', 'Java', 'Streamlit', 'Claude API', 'UI/UX design'],
  links: [
    { label: 'GitHub', url: 'https://github.com/a12dityApal' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/YOUR-USERNAME' },
    { label: 'Email', url: 'mailto:your-email@example.com' },
  ],
};

const $ = (sel) => document.querySelector(sel);

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

$('#skills').innerHTML = PROFILE.skills.map((s) => <li>${escapeHtml(s)}</li>).join('');
$('#links').innerHTML = PROFILE.links.map((l) => <a href="${l.url}" target="_blank" rel="noopener">${escapeHtml(l.label)}</a>).join('');
$('#year-line').textContent = © ${new Date().getFullYear()} Aditya. Built with Node.js, Express and MongoDB.;

async function loadProjects() {
  const box = $('#project-list');
  try {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error();
    const projects = await res.json();
    box.innerHTML = projects.map((p) => `
      <article class="project">
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.description)}</p>
        <ul class="tags">${(p.tags || []).map((t) => <li>${escapeHtml(t)}</li>).join('')}</ul>
        <div class="project-links">
          ${p.live ? <a href="${encodeURI(p.live)}" target="_blank" rel="noopener">Live site</a> : ''}
          ${p.repo ? <a href="${encodeURI(p.repo)}" target="_blank" rel="noopener">Source code</a> : ''}
        </div>
      </article>`).join('');
  } catch {
    box.innerHTML = '<p class="status error">Could not load projects. Refresh the page to try again.</p>';
  }
}

$('#contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const status = $('#form-status');
  const btn = form.querySelector('button');
  status.className = 'status';
  status.textContent = 'Sending...';
  btn.disabled = true;
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || 'Something went wrong.');
    status.className = 'status ok';
    status.textContent = 'Message sent. I will reply by email.';
    form.reset();
  } catch (err) {
    status.className = 'status error';
    status.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
});

loadProjects();
