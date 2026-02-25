import '../../utils/appSetup.js';
import { mountShell } from '../../components/shell.js';
import { getQueryParam, setHtml } from '../../utils/dom.js';

export function initApiaryPage() {
  mountShell({ active: 'dashboard', isAdmin: false, authLabel: 'Guest' });

  const apiaryId = getQueryParam('id') ?? 'missing';

  setHtml(
    '#page-content',
    `
      <div class="page-card">
        <p class="mb-0">Apiary details placeholder. Query param <strong>id</strong>: ${apiaryId}</p>
      </div>
    `
  );
}

initApiaryPage();