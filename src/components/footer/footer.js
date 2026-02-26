import './footer.css';
import { t } from '../../i18n/i18n.js';
import { setHtml } from '../../utils/dom.js';

export function renderFooter() {
  setHtml(
    '#footer-slot',
    `
      <footer class="app-footer mt-auto">
        <div class="container py-3 d-flex justify-content-between align-items-center small text-secondary">
          <span>© ${new Date().getFullYear()} ${t('app.name')}</span>
          <span>${t('footer.tagline')}</span>
        </div>
      </footer>
    `
  );
}