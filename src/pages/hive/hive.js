import '../../utils/appSetup.js';
import { mountShell } from '../../components/shell.js';
import { getQueryParam, setHtml } from '../../utils/dom.js';

export function initHivePage() {
  mountShell({ active: 'dashboard', isAdmin: false, authLabel: 'Guest' });

  const hiveId = getQueryParam('id') ?? 'missing';

  setHtml(
    '#page-content',
    `
      <div class="page-card">
        <p class="mb-0">Hive details placeholder. Query param <strong>id</strong>: ${hiveId}</p>
      </div>
    `
  );
}

initHivePage();