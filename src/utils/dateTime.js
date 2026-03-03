import { getLanguage } from '../i18n/i18n.js';

export function getCurrentLocale() {
  return getLanguage() === 'en' ? 'en-US' : 'bg-BG';
}

export function formatDateTime(value, options = {}) {
  const { empty = '-', dateStyle = 'medium', timeStyle = 'short' } = options;

  if (!value) {
    return empty;
  }

  return new Intl.DateTimeFormat(getCurrentLocale(), {
    dateStyle,
    timeStyle
  }).format(new Date(value));
}
