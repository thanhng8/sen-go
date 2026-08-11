export const STORAGE_KEY = 'sen-go.preferences.v1';

export const DEFAULT_PREFERENCES = Object.freeze({
  theme: 'dark',
  boardStyle: 'kaya',
  stoneStyle: 'classic',
  fontFamily: 'auto',
  fontSize: 20,
  textColor: '',
  language: 'vi',
  aiProvider: 'openai',
  aiApiKey: '',
  aiModel: '',
});

export const PREFERENCE_OPTIONS = Object.freeze({
  themes: ['dark', 'light', 'midnight', 'warm'],
  boardStyles: ['kaya', 'walnut', 'bamboo', 'slate'],
  stoneStyles: ['classic', 'jade', 'ocean', 'ruby'],
  fontFamilies: ['auto', 'be-vietnam-pro', 'system', 'serif', 'monospace'],
  languages: ['vi', 'en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt', 'ru', 'ar', 'hi', 'id', 'th', 'tr'],
  aiProviders: ['openai', 'claude', 'grok', 'gemini', 'openrouter', 'ollama-cloud'],
});

const FONT_STACKS = Object.freeze({
  auto: {
    default: '"Be Vietnam Pro", "Segoe UI", Arial, sans-serif',
    zh: '"Microsoft YaHei UI", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
    ja: '"Yu Gothic UI", "Yu Gothic", Meiryo, sans-serif',
    ko: '"Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
    ar: '"Segoe UI", Tahoma, Arial, sans-serif',
    hi: '"Nirmala UI", Mangal, sans-serif',
    th: '"Leelawadee UI", Tahoma, sans-serif',
  },
  'be-vietnam-pro': '"Be Vietnam Pro", "Segoe UI", Arial, sans-serif',
  system: '"Segoe UI", Arial, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  monospace: 'Consolas, "Courier New", monospace',
});

function allowed(value, values, fallback) {
  return values.includes(value) ? value : fallback;
}

function validColor(value) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : '';
}

function savedText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function normalizePreferences(value = {}) {
  const fontSize = Number(value.fontSize);
  return {
    theme: allowed(value.theme, PREFERENCE_OPTIONS.themes, DEFAULT_PREFERENCES.theme),
    boardStyle: allowed(value.boardStyle, PREFERENCE_OPTIONS.boardStyles, DEFAULT_PREFERENCES.boardStyle),
    stoneStyle: allowed(value.stoneStyle, PREFERENCE_OPTIONS.stoneStyles, DEFAULT_PREFERENCES.stoneStyle),
    fontFamily: allowed(value.fontFamily, PREFERENCE_OPTIONS.fontFamilies, DEFAULT_PREFERENCES.fontFamily),
    fontSize: Number.isFinite(fontSize) ? Math.min(26, Math.max(16, Math.round(fontSize))) : DEFAULT_PREFERENCES.fontSize,
    textColor: validColor(value.textColor),
    language: allowed(value.language, PREFERENCE_OPTIONS.languages, DEFAULT_PREFERENCES.language),
    aiProvider: allowed(value.aiProvider, PREFERENCE_OPTIONS.aiProviders, DEFAULT_PREFERENCES.aiProvider),
    aiApiKey: savedText(value.aiApiKey, 1024),
    aiModel: savedText(value.aiModel, 200),
  };
}

export function loadPreferences(storage = globalThis.localStorage) {
  try {
    const stored = storage?.getItem(STORAGE_KEY);
    return normalizePreferences(stored ? JSON.parse(stored) : DEFAULT_PREFERENCES);
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(preferences, storage = globalThis.localStorage) {
  const normalized = normalizePreferences(preferences);
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // Storage can be unavailable in private browsing; settings still work for this session.
  }
  return normalized;
}

export function fontStackFor(fontFamily, language) {
  if (fontFamily === 'auto') return FONT_STACKS.auto[language] ?? FONT_STACKS.auto.default;
  return FONT_STACKS[fontFamily] ?? FONT_STACKS.auto.default;
}

export function directionFor(language) {
  return language === 'ar' ? 'rtl' : 'ltr';
}

export function applyPreferencesToDocument(preferences, documentRef = document) {
  const normalized = normalizePreferences(preferences);
  const root = documentRef.documentElement;
  root.dataset.theme = normalized.theme;
  root.dataset.boardStyle = normalized.boardStyle;
  root.dataset.stoneStyle = normalized.stoneStyle;
  root.lang = normalized.language;
  root.dir = directionFor(normalized.language);
  root.style.fontSize = `${normalized.fontSize}px`;
  root.style.setProperty('--font-ui', fontStackFor(normalized.fontFamily, normalized.language));
  if (normalized.textColor) root.style.setProperty('--text', normalized.textColor);
  else root.style.removeProperty('--text');

  const themeMeta = documentRef.querySelector('meta[name="theme-color"]');
  const colors = { dark: '#0d120f', light: '#ebe5d8', midnight: '#080d18', warm: '#1c120d' };
  themeMeta?.setAttribute('content', colors[normalized.theme]);
  return normalized;
}
