import { bg } from './bg.js';
import { en } from './en.js';

const STORAGE_KEY = 'gba_lang';
const DEFAULT_LANGUAGE = 'bg';

const dictionaries = {
  bg,
  en
};

let currentLanguage = DEFAULT_LANGUAGE;

function getNestedValue(source, key) {
  return key.split('.').reduce((accumulator, part) => accumulator?.[part], source);
}

export function setLanguage(language) {
  if (!dictionaries[language]) {
    return currentLanguage;
  }

  currentLanguage = language;
  localStorage.setItem(STORAGE_KEY, language);
  return currentLanguage;
}

export function getLanguage() {
  return currentLanguage;
}

export function initI18n() {
  const storedLanguage = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
  setLanguage(storedLanguage);
}

export function t(key) {
  const activeDictionary = dictionaries[currentLanguage] || dictionaries[DEFAULT_LANGUAGE];
  const translated = getNestedValue(activeDictionary, key);

  if (translated !== undefined) {
    return translated;
  }

  const fallback = getNestedValue(dictionaries[DEFAULT_LANGUAGE], key);

  if (fallback !== undefined) {
    console.warn(`[i18n] Missing key "${key}" for language "${currentLanguage}". Falling back to "${DEFAULT_LANGUAGE}".`);
    return fallback;
  }

  console.warn(`[i18n] Missing key "${key}" in both "${currentLanguage}" and "${DEFAULT_LANGUAGE}".`);
  return key;
}