import { setHtml } from '../utils/dom.js';

export function renderFooter() {
  setHtml(
    '#app-footer',
    `
      <footer class="border-top mt-auto">
        <div class="container py-3 d-flex justify-content-between align-items-center small text-secondary">
          <span>© ${new Date().getFullYear()} GoldenBee Analytics</span>
          <span>Capstone multi-page starter</span>
        </div>
      </footer>
    `
  );
}