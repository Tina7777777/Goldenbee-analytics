import '../../utils/appSetup.js';
import { mountShell } from '../../components/shell.js';
import { setHtml } from '../../utils/dom.js';

export function initNotFoundPage() {
  mountShell({ active: '', isAdmin: false, authLabel: 'Guest' });

  setHtml(
    '#page-content',
    `
      <div class="page-card">
        <p class="mb-0">The page you requested does not exist.</p>
      </div>
    `
  );
}

initNotFoundPage();