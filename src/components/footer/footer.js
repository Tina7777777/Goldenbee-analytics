import './footer.css';
import { setHtml } from '../../utils/dom.js';

export function renderFooter() {
  setHtml(
    '#footer-slot',
    `
      <footer class="app-footer mt-auto">
        <div class="container py-3 d-flex justify-content-center align-items-center small text-secondary">
          <span>© ${new Date().getFullYear()} GoldenBee Analytics</span>
        </div>
      </footer>
    `
  );
}