var PROFILE = {
  skills: ['HTML', 'CSS', 'JavaScript', 'Python', 'Java', 'Streamlit', 'Claude API', 'UI/UX design'],
  links: [
    { label: 'GitHub', url: 'https://github.com/a12dityApal' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/YOUR-USERNAME' },
    { label: 'Email', url: 'mailto:your-email@example.com' }
  ]
};

function $(sel) {
  return document.querySelector(sel);
}

function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

$('#skills').innerHTML = PROFILE.skills.map(function (s) {
  return '<li>' + escapeHtml(s) + '</li>';
}).join('');

$('#links').innerHTML = PROFILE.links.map(function (l) {
  return '<a href="' + l.url + '" target="_blank" rel="noopener">' + escapeHtml(l.label) + '</a>';
}).join('');

$('#year-line').textContent = '\u00A9 ' + new Date().getFullYear() + ' Aditya. Built with Node.js, Express and MongoDB.';

function loadProjects() {
  var box = $('#project-list');
  fetch('/api/projects')
    .then(function (res) {
      if (!res.ok) throw new Error('load failed');
      return res.json();
    })
    .then(function (projects) {
      box.innerHTML = projects.map(function (p) {
        var tags = (p.tags || []).map(function (t) {
          return '<li>' + escapeHtml(t) + '</li>';
        }).join('');
        var live = p.live ? '<a href="' + encodeURI(p.live) + '" target="_blank" rel="noopener">Live site</a>' : '';
        var repo = p.repo ? '<a href="' + encodeURI(p.repo) + '" target="_blank" rel="noopener">Source code</a>' : '';
        return '<article class="project">' +
          '<h3>' + escapeHtml(p.title) + '</h3>' +
          '<p>' + escapeHtml(p.description) + '</p>' +
          '<ul class="tags">' + tags + '</ul>' +
          '<div class="project-links">' + live + repo + '</div>' +
          '</article>';
      }).join('');
    })
    .catch(function () {
      box.innerHTML = '<p class="status error">Could not load projects. Refresh the page to try again.</p>';
    });
}

$('#contact-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var form = e.target;
  var status = $('#form-status');
  var btn = form.querySelector('button');
  status.className = 'status';
  status.textContent = 'Sending...';
  btn.disabled = true;

  fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(new FormData(form)))
  })
    .then(function (res) {
      return res.json().then(function (body) {
        if (!res.ok) throw new Error(body.error || 'Something went wrong.');
        status.className = 'status ok';
        status.textContent = 'Message sent. I will reply by email.';
        form.reset();
      });
    })
    .catch(function (err) {
      status.className = 'status error';
      status.textContent = err.message;
    })
    .then(function () {
      btn.disabled = false;
    });
});

loadProjects();
