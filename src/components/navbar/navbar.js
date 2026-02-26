import './navbar.css';
import { t } from '../../i18n/i18n.js';
import { setHtml } from '../../utils/dom.js';

export function renderNavbar({ active = 'home', isAdmin = false, authLabelKey = 'common.guest' } = {}) {
  const links = [
    { key: 'home', href: '/index.html', label: t('nav.home') },
    { key: 'dashboard', href: '/dashboard.html', label: t('nav.dashboard') },
    { key: 'analytics', href: '/analytics.html', label: t('nav.analytics') },
    { key: 'profile', href: '/profile.html', label: t('nav.profile') }
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

  const adminItem = isAdmin
    ? `
      <li class="nav-item">
        <a class="nav-link ${active === 'admin' ? 'active' : ''}" href="/admin.html">${t('nav.admin')}</a>
      </li>
    `
    : '';

  setHtml(
    '#navbar-slot',
    `
      <nav class="navbar navbar-expand-lg app-navbar">
        <div class="container">
          <a class="navbar-brand fw-semibold" href="/index.html">${t('app.name')}</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="mainNavbar">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              ${navItems}
              ${adminItem}
            </ul>
            <div class="d-flex align-items-center gap-2 small">
              <span class="badge text-bg-secondary">${t(authLabelKey)}</span>
              <a href="/login.html" class="link-secondary text-decoration-none">${t('nav.login')}</a>
              <span class="text-secondary">/</span>
              <a href="/register.html" class="link-secondary text-decoration-none">${t('nav.register')}</a>
            </div>
          </div>
        </div>
      </nav>
    `
  );
}