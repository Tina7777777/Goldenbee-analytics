export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function setHtml(selector, markup, parent = document) {
  const element = qs(selector, parent);
  if (!element) {
    return null;
  }

  element.innerHTML = markup;
  return element;
}

export function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}