import { setHtml } from '../utils/dom.js';

export function renderNavbar({ active = 'home', isAdmin = false, authLabel = 'Guest' } = {}) {
  const links = [
    { key: 'home', href: '/index.html', label: 'Home' },
    { key: 'dashboard', href: '/dashboard.html', label: 'Dashboard' },
    { key: 'analytics', href: '/analytics.html', label: 'Analytics' },
    { key: 'profile', href: '/profile.html', label: 'Profile' }
  ];

  const navItems = links
    .map(
      ({ key, href, label }) => `
        <li class="nav-item">
          <a class="nav-link ${active === key ? 'active' : ''}" href="${href}">${label}</a>
        </li>
      `
    )
    .join('');

  const adminItem = `
    <li class="nav-item ${isAdmin ? '' : 'd-none'}" id="admin-nav-item">
      <a class="nav-link ${active === 'admin' ? 'active' : ''}" href="/admin.html">Admin</a>
    </li>
  `;

  setHtml(
    '#app-navbar',
    `
      <nav class="navbar navbar-expand-lg border-bottom bg-body-tertiary">
        <div class="container">
          <a class="navbar-brand fw-semibold" href="/index.html">GoldenBee Analytics</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="mainNavbar">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              ${navItems}
              ${adminItem}
            </ul>
            <div class="d-flex align-items-center gap-2 small">
              <span class="badge text-bg-secondary">${authLabel}</span>
              <a href="/login.html" class="link-secondary text-decoration-none">Login</a>
              <span class="text-secondary">/</span>
              <a href="/register.html" class="link-secondary text-decoration-none">Register</a>
            </div>
          </div>
        </div>
      </nav>
    `
  );
}