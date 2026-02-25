import '../../utils/appSetup.js';
import { mountShell } from '../../components/shell.js';
import { setHtml } from '../../utils/dom.js';

export function initAdminPage() {
  mountShell({ active: 'admin', isAdmin: true, authLabel: 'Admin' });

  setHtml(
    '#page-content',
    `
      <div class="page-card">
        <p class="mb-0">Admin panel placeholder.</p>
      </div>
    `
  );
}

initAdminPage();