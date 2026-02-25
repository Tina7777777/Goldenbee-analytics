import '../../utils/appSetup.js';
import { mountShell } from '../../components/shell.js';
import { setHtml } from '../../utils/dom.js';

export function initAnalyticsPage() {
  mountShell({ active: 'analytics', isAdmin: false, authLabel: 'Guest' });

  setHtml(
    '#page-content',
    `
      <div class="page-card">
        <p class="mb-0">Analytics placeholder: brood frames, queen status, honey levels.</p>
      </div>
    `
  );
}

initAnalyticsPage();