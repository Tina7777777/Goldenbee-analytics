import '../../utils/appSetup.js';
import { mountShell } from '../../components/shell.js';
import { setHtml } from '../../utils/dom.js';

export function initDashboardPage() {
  mountShell({ active: 'dashboard', isAdmin: false, authLabel: 'Guest' });

  setHtml(
    '#page-content',
    `
      <div class="page-card">
        <p class="mb-0">Dashboard placeholder: apiaries, hives, latest inspections.</p>
      </div>
    `
  );
}

initDashboardPage();