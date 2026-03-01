export function navigate(path, options = {}) {
  const { replace = false } = options;
  const method = replace ? 'replaceState' : 'pushState';

  window.history[method]({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}