import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/400-italic.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/be-vietnam-pro/800.css';
import './styles.css';
import { BLACK, GoGame, RULE_SETS, WHITE, opponentOf } from './go-engine.js';
import { chooseComputerMove } from './computer-player.js';
import { AI_PROVIDERS, requestAiMove } from './ai-player.js';
import { BoardView } from './board-view.js';
import { LOCALES, t, translateDocument } from './i18n.js';
import {
  DEFAULT_PREFERENCES,
  PREFERENCE_OPTIONS,
  applyPreferencesToDocument,
  loadPreferences,
  savePreferences,
} from './preferences.js';
import { renderRuleGuide } from './rules-guide.js';

const $ = (selector) => document.querySelector(selector);
const setupScreen = $('#setup-screen');
const gameScreen = $('#game-screen');
const boardContainer = $('#board-container');
const ruleSelect = $('#rule-select');
const ruleDescription = $('#rule-description');
const startButton = $('#start-game');
const toast = $('#toast');

const matchSettings = {
  boardSize: 13,
  playerColor: BLACK,
  difficulty: 'medium',
  ruleKey: 'japanese',
  opponentMode: 'local',
};

const THEME_TEXT_COLORS = Object.freeze({
  dark: '#f4f1e8',
  light: '#252b27',
  midnight: '#edf3ff',
  warm: '#fff1df',
});

let preferences = loadPreferences();
let game = null;
let boardView = null;
let humanColor = BLACK;
let computerColor = WHITE;
let computerThinking = false;
let activeAiController = null;
let gameToken = 0;
let toastTimer = null;
let confirmAction = null;
let soundEnabled = true;
let audioContext = null;

function tr(key, variables = {}) {
  return t(preferences.language, key, variables);
}

function colorName(color) {
  return tr(color === BLACK ? 'color.black' : 'color.white');
}

function difficultyName(level) {
  return tr(`difficulty.${level}`);
}

function ruleName(ruleKey) {
  return tr(`rule.${ruleKey}`);
}

function usesApiOpponent() {
  return matchSettings.opponentMode === 'ai';
}

function aiProviderName() {
  return AI_PROVIDERS[preferences.aiProvider]?.name ?? preferences.aiProvider;
}

function hasAiConfiguration() {
  return Boolean(preferences.aiApiKey && preferences.aiModel && AI_PROVIDERS[preferences.aiProvider]);
}

function cancelAiRequest() {
  activeAiController?.abort();
  activeAiController = null;
}

function aiErrorKey(error) {
  if (error?.code === 'authentication') return 'error.aiAuthentication';
  if (error?.code === 'rate-limit') return 'error.aiRateLimit';
  if (error?.code === 'timeout') return 'error.aiTimeout';
  if (error?.code === 'invalid-response' || error?.code === 'illegal-move') return 'error.aiInvalid';
  if (error?.code === 'configuration') return 'error.aiConfiguration';
  return 'error.aiNetwork';
}

function opponentLabel() {
  return usesApiOpponent() ? tr('game.ai') : tr('game.computer');
}

function formatScore(value) {
  return new Intl.NumberFormat(preferences.language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Number(value));
}

function showModal(id) {
  const modal = document.getElementById(id);
  modal.classList.add('is-visible');
  modal.setAttribute('aria-hidden', 'false');
}

function hideModal(id) {
  const modal = document.getElementById(id);
  modal.classList.remove('is-visible');
  modal.setAttribute('aria-hidden', 'true');
}

function selectRuleGuide(ruleKey) {
  const selectedRule = RULE_SETS[ruleKey] ? ruleKey : 'japanese';
  document.querySelectorAll('[data-rule-tab]').forEach((tab) => {
    const active = tab.dataset.ruleTab === selectedRule;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.textContent = ruleName(tab.dataset.ruleTab);
  });
  renderRuleGuide($('#rule-guide-content'), selectedRule, preferences.language);
  $('#rules-modal .rules-modal-card').scrollTop = 0;
}

function openRuleGuide(ruleKey = matchSettings.ruleKey) {
  selectRuleGuide(ruleKey);
  showModal('rules-modal');
}

function showToast(messageKeyOrText) {
  window.clearTimeout(toastTimer);
  const key = messageKeyOrText?.startsWith?.('error.') ? messageKeyOrText : null;
  toast.textContent = key ? tr(key) : messageKeyOrText;
  toast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

function playSound(type = 'stone') {
  if (!soundEnabled) return;
  try {
    audioContext ??= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.type = type === 'capture' ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(type === 'capture' ? 230 : 145, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(type === 'capture' ? 105 : 90, audioContext.currentTime + 0.08);
    gain.gain.setValueAtTime(type === 'capture' ? 0.1 : 0.055, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.11);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.12);
  } catch {
    // Sound is optional; the game remains usable when AudioContext is unavailable.
  }
}

function replaceSelectOptions(select, values, labelKey) {
  const selected = select.value;
  select.replaceChildren(...values.map((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = tr(`${labelKey}.${value}`);
    return option;
  }));
  if (values.includes(selected)) select.value = selected;
}

function populateLanguageOptions() {
  const select = $('#settings-language');
  select.replaceChildren(...LOCALES.map(({ code, name }) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = name;
    option.lang = code;
    return option;
  }));
}

function populateLocalizedOptions() {
  replaceSelectOptions($('#settings-theme'), PREFERENCE_OPTIONS.themes, 'theme');
  replaceSelectOptions($('#settings-board-style'), PREFERENCE_OPTIONS.boardStyles, 'board');
  replaceSelectOptions($('#settings-stone-style'), PREFERENCE_OPTIONS.stoneStyles, 'stones');
  replaceSelectOptions($('#settings-font'), PREFERENCE_OPTIONS.fontFamilies, 'font');

  const providerSelect = $('#settings-ai-provider');
  const selectedProvider = providerSelect.value;
  providerSelect.replaceChildren(...Object.entries(AI_PROVIDERS).map(([value, provider]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = provider.name;
    return option;
  }));
  if (AI_PROVIDERS[selectedProvider]) providerSelect.value = selectedProvider;

  ruleSelect.querySelector('[value="japanese"]').textContent = tr('rule.option.japanese');
  ruleSelect.querySelector('[value="chinese"]').textContent = tr('rule.option.chinese');
  ruleSelect.querySelector('[value="new-zealand"]').textContent = tr('rule.option.new-zealand');
}

function updateSetupText() {
  $('#board-size-hint').textContent = tr(`board.hint${matchSettings.boardSize}`);
  $('#difficulty-hint').textContent = tr(`difficulty.${matchSettings.difficulty}Hint`);
  ruleDescription.textContent = tr(`rule.desc.${matchSettings.ruleKey}`);

  const apiMode = usesApiOpponent();
  $('#computer-difficulty-section').classList.toggle('is-hidden', apiMode);
  $('.setup-columns').classList.toggle('is-single', apiMode);
  $('#setup-runtime-label').textContent = tr(apiMode ? 'setup.online' : 'setup.local');
  $('#opponent-hint').textContent = tr(apiMode ? 'setup.aiHint' : 'setup.localHint');
  $('#setup-footnote').textContent = tr(apiMode ? 'setup.aiFootnote' : 'setup.footnote');

  const status = $('#ai-setup-status');
  status.textContent = apiMode
    ? hasAiConfiguration()
      ? tr('setup.aiConfigured', { provider: aiProviderName(), model: preferences.aiModel })
      : tr('setup.aiMissing')
    : '';
  status.classList.toggle('is-warning', apiMode && !hasAiConfiguration());
}

function syncSettingsControls() {
  $('#settings-language').value = preferences.language;
  $('#settings-theme').value = preferences.theme;
  $('#settings-board-style').value = preferences.boardStyle;
  $('#settings-stone-style').value = preferences.stoneStyle;
  $('#settings-font').value = preferences.fontFamily;
  $('#settings-ai-provider').value = preferences.aiProvider;
  $('#settings-ai-model').value = preferences.aiModel;
  $('#settings-ai-api-key').value = preferences.aiApiKey;
  $('#settings-font-size').value = String(preferences.fontSize);
  $('#settings-font-size-value').textContent = `${preferences.fontSize}px`;
  const shownColor = preferences.textColor || THEME_TEXT_COLORS[preferences.theme];
  $('#settings-text-color').value = shownColor;
  $('#settings-color-value').textContent = preferences.textColor || tr('settings.auto');
  document.querySelectorAll('[data-text-color]').forEach((button) => {
    button.classList.toggle('is-selected', button.dataset.textColor === preferences.textColor);
  });
}

function updateGameText() {
  if (!game) return;
  const opponent = opponentLabel();
  $('#game-rule-label').textContent = ruleName(game.ruleKey);
  $('#game-level-label').textContent = usesApiOpponent()
    ? tr('game.aiLevel', { provider: aiProviderName() })
    : tr('game.computerLevel', { level: difficultyName(matchSettings.difficulty) });
  $('#game-level-label').title = usesApiOpponent() ? preferences.aiModel : '';
  $('#black-player-name').textContent = humanColor === BLACK ? tr('game.you') : opponent;
  $('#white-player-name').textContent = humanColor === WHITE ? tr('game.you') : opponent;
  $('#thinking-label').textContent = tr(usesApiOpponent() ? 'game.aiThinking' : 'game.thinking');
  boardView?.setCanvasLabel(tr('game.board'));
  renderGame();
  if ($('#result-modal').classList.contains('is-visible')) showResult();
}

function applyLanguage() {
  translateDocument(preferences.language);
  populateLocalizedOptions();
  updateSetupText();
  updateGameText();
  syncSettingsControls();
  document.querySelectorAll('[data-rule-tab]').forEach((tab) => {
    tab.textContent = ruleName(tab.dataset.ruleTab);
  });
  if ($('#rules-modal').classList.contains('is-visible')) {
    const activeRule = document.querySelector('[data-rule-tab].is-active')?.dataset.ruleTab ?? matchSettings.ruleKey;
    selectRuleGuide(activeRule);
  }
}

function applyCurrentPreferences({ languageChanged = false } = {}) {
  preferences = applyPreferencesToDocument(preferences);
  boardView?.setAppearance(preferences.boardStyle, preferences.stoneStyle);
  syncSettingsControls();
  if (languageChanged) applyLanguage();
}

function updatePreference(key, value) {
  const oldLanguage = preferences.language;
  preferences = savePreferences({ ...preferences, [key]: value });
  applyCurrentPreferences({ languageChanged: oldLanguage !== preferences.language });
  updateSetupText();
  if (game && key === 'aiProvider') updateGameText();
  const saved = $('#settings-saved');
  saved.classList.remove('is-pulsing');
  requestAnimationFrame(() => saved.classList.add('is-pulsing'));
}

function updateTextPreference(key, value) {
  preferences = savePreferences({ ...preferences, [key]: value });
  updateSetupText();
  if (game && key === 'aiModel') $('#game-level-label').title = preferences.aiModel;
  const saved = $('#settings-saved');
  saved.classList.remove('is-pulsing');
  requestAnimationFrame(() => saved.classList.add('is-pulsing'));
}

function openSettings() {
  syncSettingsControls();
  showModal('settings-modal');
}

function resetPreferences() {
  const oldLanguage = preferences.language;
  preferences = savePreferences({ ...DEFAULT_PREFERENCES });
  applyCurrentPreferences({ languageChanged: oldLanguage !== preferences.language });
  if (oldLanguage === preferences.language) applyLanguage();
}

function initializeChoices() {
  document.querySelectorAll('[data-choice-group]').forEach((group) => {
    group.addEventListener('click', (event) => {
      const button = event.target.closest('[data-value]');
      if (!button) return;
      group.querySelectorAll('[data-value]').forEach((item) => item.classList.remove('is-selected'));
      button.classList.add('is-selected');
      const key = group.dataset.choiceGroup;
      matchSettings[key] = key === 'boardSize' || key === 'playerColor'
        ? Number(button.dataset.value)
        : button.dataset.value;
      updateSetupText();
    });
  });

  ruleSelect.addEventListener('change', () => {
    matchSettings.ruleKey = ruleSelect.value;
    updateSetupText();
  });
}

function startGame() {
  if (usesApiOpponent() && !hasAiConfiguration()) {
    updateSetupText();
    openSettings();
    window.setTimeout(() => (preferences.aiApiKey ? $('#settings-ai-model') : $('#settings-ai-api-key')).focus(), 0);
    return;
  }

  cancelAiRequest();
  hideModal('result-modal');
  hideModal('confirm-modal');
  gameToken += 1;
  game = new GoGame(matchSettings.boardSize, matchSettings.ruleKey);
  humanColor = matchSettings.playerColor;
  computerColor = opponentOf(humanColor);
  computerThinking = false;

  setupScreen.classList.add('is-hidden');
  gameScreen.classList.add('is-active');
  gameScreen.setAttribute('aria-hidden', 'false');

  boardView ??= new BoardView(boardContainer);
  boardView.setSize(matchSettings.boardSize);
  boardView.setAppearance(preferences.boardStyle, preferences.stoneStyle);
  boardView.setCanvasLabel(tr('game.board'));
  boardView.onPoint = handleBoardPoint;

  $('#game-board-label').textContent = `${matchSettings.boardSize} × ${matchSettings.boardSize}`;
  $('#komi-value').textContent = game.rules.komi.toFixed(1);
  updateGameText();
  if (computerColor === BLACK) scheduleComputerTurn();
}

function returnToSetup(force = false) {
  if (!force && game && !game.gameOver && game.moveNumber > 0) {
    openConfirmation({
      title: tr('confirm.leaveTitle'),
      copy: tr('confirm.leaveCopy'),
      acceptLabel: tr('confirm.leaveAccept'),
      action: () => returnToSetup(true),
    });
    return;
  }
  cancelAiRequest();
  gameToken += 1;
  computerThinking = false;
  boardView?.setInteractive(false);
  gameScreen.classList.remove('is-active');
  gameScreen.setAttribute('aria-hidden', 'true');
  setupScreen.classList.remove('is-hidden');
  hideModal('result-modal');
  hideModal('confirm-modal');
}

function canHumanPlay() {
  return game && !game.gameOver && !computerThinking && game.currentPlayer === humanColor;
}

function handleBoardPoint(row, col) {
  if (!canHumanPlay()) return;
  const move = game.play(row, col);
  if (!move.ok) {
    showToast(move.reasonCode ? `error.${move.reasonCode}` : move.reason);
    return;
  }
  playSound(move.captured > 0 ? 'capture' : 'stone');
  renderGame(row * game.size + col);
  if (game.gameOver) showResult();
  else scheduleComputerTurn();
}

function handlePass() {
  if (!canHumanPlay()) return;
  game.pass();
  playSound('stone');
  renderGame();
  if (game.gameOver) showResult();
  else scheduleComputerTurn();
}

function playOpponentAction(decision) {
  if (decision?.action === 'move') {
    const result = game.play(decision.row, decision.col);
    if (result.ok) {
      playSound(result.captured > 0 ? 'capture' : 'stone');
      return decision.row * game.size + decision.col;
    }
  }
  game.pass();
  playSound('stone');
  return null;
}

function scheduleComputerTurn() {
  if (!game || game.gameOver || game.currentPlayer !== computerColor) return;
  computerThinking = true;
  const token = gameToken;
  renderGame();

  if (!usesApiOpponent()) {
    window.setTimeout(() => {
      if (token !== gameToken || !game || game.gameOver || game.currentPlayer !== computerColor) return;
      const move = chooseComputerMove(game, matchSettings.difficulty);
      const animateIndex = playOpponentAction(move ? { action: 'move', ...move } : { action: 'pass' });
      computerThinking = false;
      renderGame(animateIndex);
      if (game.gameOver) showResult();
    }, matchSettings.difficulty === 'hard' ? 620 : 430);
    return;
  }

  cancelAiRequest();
  const controller = new AbortController();
  activeAiController = controller;
  requestAiMove(game, {
    provider: preferences.aiProvider,
    apiKey: preferences.aiApiKey,
    model: preferences.aiModel,
  }, { signal: controller.signal, timeoutMs: 30000 })
    .then((decision) => {
      if (token !== gameToken || !game || game.gameOver || game.currentPlayer !== computerColor) return;
      const animateIndex = playOpponentAction(decision);
      computerThinking = false;
      renderGame(animateIndex);
      if (game.gameOver) showResult();
    })
    .catch((error) => {
      if (token !== gameToken || error?.code === 'cancelled' || !game || game.gameOver || game.currentPlayer !== computerColor) return;
      const fallback = chooseComputerMove(game, 'medium');
      const animateIndex = playOpponentAction(fallback ? { action: 'move', ...fallback } : { action: 'pass' });
      computerThinking = false;
      renderGame(animateIndex);
      showToast(`${tr(aiErrorKey(error))} ${tr('error.aiFallback')}`);
      if (game.gameOver) showResult();
    })
    .finally(() => {
      if (activeAiController === controller) activeAiController = null;
    });
}

function handleUndo() {
  if (!game || game.gameOver || game.history.length <= 1) return;
  cancelAiRequest();
  gameToken += 1;
  let steps = 1;
  if (!computerThinking && game.currentPlayer === humanColor) steps = Math.min(2, game.history.length - 1);
  computerThinking = false;
  game.undo(steps);
  renderGame();
  if (game.currentPlayer === computerColor) scheduleComputerTurn();
}

function openConfirmation({ title, copy, acceptLabel, action, icon = '?' }) {
  $('#confirm-title').textContent = title;
  $('#confirm-copy').textContent = copy;
  $('#confirm-accept').textContent = acceptLabel;
  $('#confirm-icon').textContent = icon;
  confirmAction = action;
  showModal('confirm-modal');
}

function requestFinish() {
  if (!canHumanPlay()) return;
  openConfirmation({
    title: tr('confirm.finishTitle'),
    copy: tr('confirm.finishCopy'),
    acceptLabel: tr('confirm.finishAccept'),
    icon: '∑',
    action: () => {
      gameToken += 1;
      game.finish();
      renderGame();
      showResult();
    },
  });
}

function requestResign() {
  if (!canHumanPlay()) return;
  openConfirmation({
    title: tr('confirm.resignTitle'),
    copy: tr(usesApiOpponent() ? 'confirm.resignAiCopy' : 'confirm.resignCopy'),
    acceptLabel: tr('confirm.resignAccept'),
    icon: '⚑',
    action: () => {
      gameToken += 1;
      game.resign(humanColor);
      renderGame();
      showResult();
    },
  });
}

function renderGame(animateIndex = null) {
  if (!game || !boardView) return;
  boardView.sync(game.board, game.lastMove, animateIndex);
  const current = game.currentPlayer;
  const humanTurn = canHumanPlay();
  boardView.setInteractive(humanTurn, humanColor, (row, col) => game.previewMove(row, col).ok);

  const isCurrentHuman = current === humanColor;
  $('#current-stone').className = `large-stone large-stone-${current === BLACK ? 'black' : 'white'}`;
  $('#current-player-name').textContent = game.gameOver ? tr('game.ended') : isCurrentHuman ? tr('game.you') : opponentLabel();
  $('#turn-status').textContent = game.gameOver
    ? tr('game.viewResult')
    : `${colorName(current)} · ${isCurrentHuman ? tr('game.choosePoint') : tr('game.selecting')}`;
  $('#thinking-indicator').classList.toggle('is-visible', computerThinking);
  $('#thinking-indicator').setAttribute('aria-hidden', String(!computerThinking));

  $('#black-captures').textContent = game.captures[BLACK];
  $('#white-captures').textContent = game.captures[WHITE];
  $('#move-number').textContent = game.moveNumber;
  $('#pass-count').textContent = `${game.consecutivePasses} / 2`;

  const boardMessageStone = $('#board-message .turn-stone');
  boardMessageStone.className = `turn-stone turn-stone-${current === BLACK ? 'black' : 'white'}`;
  $('#board-message-text').textContent = game.gameOver
    ? tr('game.ended')
    : computerThinking
      ? tr(usesApiOpponent() ? 'game.aiThinking' : 'game.thinking')
      : isCurrentHuman
        ? tr('game.yourTurn')
        : tr(usesApiOpponent() ? 'game.aiTurn' : 'game.computerTurn');

  $('#pass-button').disabled = !humanTurn;
  $('#finish-button').disabled = !humanTurn;
  $('#resign-button').disabled = !humanTurn;
  const onlyComputerOpening = humanColor === WHITE && game.moveNumber === 1 && game.currentPlayer === humanColor;
  $('#undo-button').disabled = game.gameOver || game.history.length <= 1 || onlyComputerOpening;
}

function showResult() {
  if (!game?.result) return;
  const result = game.result;
  const isDraw = result.winner === 0;
  const humanWon = result.winner === humanColor;
  $('#result-title').textContent = isDraw
    ? tr('result.draw')
    : humanWon
      ? tr('result.win')
      : tr(usesApiOpponent() ? 'result.loseAi' : 'result.lose');
  $('#result-subtitle').textContent = isDraw
    ? tr('result.drawSubtitle')
    : humanWon
      ? tr('result.winSubtitle')
      : tr('result.loseSubtitle');
  $('#result-emblem span').className = isDraw ? 'is-draw' : result.winner === WHITE ? 'is-white' : 'is-black';

  const scoreBox = $('#result-score');
  if (result.reason === 'resign') {
    scoreBox.style.display = 'none';
    $('#result-detail').textContent = tr('result.resigned', {
      resigned: colorName(result.resigned),
      winner: colorName(result.winner),
    });
  } else {
    scoreBox.style.display = 'grid';
    $('#result-black-score').textContent = formatScore(result.black);
    $('#result-white-score').textContent = formatScore(result.white);
    const scoring = tr(game.rules.scoring === 'territory' ? 'scoring.territory' : 'scoring.area');
    $('#result-detail').textContent = isDraw
      ? tr('result.drawDetail', { score: formatScore(result.black), scoring })
      : tr('result.winDetail', { winner: colorName(result.winner), margin: formatScore(result.margin), scoring });
  }
  showModal('result-modal');
}

function bindSettings() {
  $('#settings-open-setup').addEventListener('click', openSettings);
  $('#settings-open-game').addEventListener('click', openSettings);
  $('#settings-done').addEventListener('click', () => hideModal('settings-modal'));
  $('#settings-reset').addEventListener('click', resetPreferences);

  const selectBindings = [
    ['#settings-language', 'language'],
    ['#settings-theme', 'theme'],
    ['#settings-board-style', 'boardStyle'],
    ['#settings-stone-style', 'stoneStyle'],
    ['#settings-font', 'fontFamily'],
    ['#settings-ai-provider', 'aiProvider'],
  ];
  selectBindings.forEach(([selector, key]) => {
    $(selector).addEventListener('change', (event) => updatePreference(key, event.target.value));
  });
  $('#settings-ai-model').addEventListener('input', (event) => updateTextPreference('aiModel', event.target.value));
  $('#settings-ai-api-key').addEventListener('input', (event) => updateTextPreference('aiApiKey', event.target.value));
  $('#settings-font-size').addEventListener('input', (event) => updatePreference('fontSize', Number(event.target.value)));
  $('#settings-text-color').addEventListener('input', (event) => updatePreference('textColor', event.target.value));
  document.querySelectorAll('[data-text-color]').forEach((button) => {
    button.addEventListener('click', () => updatePreference('textColor', button.dataset.textColor));
  });
}

function bindControls() {
  startButton.addEventListener('click', startGame);
  $('#back-to-setup').addEventListener('click', () => returnToSetup());
  $('#pass-button').addEventListener('click', handlePass);
  $('#undo-button').addEventListener('click', handleUndo);
  $('#finish-button').addEventListener('click', requestFinish);
  $('#resign-button').addEventListener('click', requestResign);
  $('#rules-info-button').addEventListener('click', () => openRuleGuide(matchSettings.ruleKey));
  $('#game-rule-guide').addEventListener('click', () => openRuleGuide(game?.ruleKey ?? matchSettings.ruleKey));
  document.querySelectorAll('[data-rule-tab]').forEach((tab) => {
    tab.addEventListener('click', () => selectRuleGuide(tab.dataset.ruleTab));
  });
  $('#confirm-cancel').addEventListener('click', () => hideModal('confirm-modal'));
  $('#confirm-accept').addEventListener('click', () => {
    hideModal('confirm-modal');
    const action = confirmAction;
    confirmAction = null;
    action?.();
  });
  $('#rematch-button').addEventListener('click', startGame);
  $('#change-setup-button').addEventListener('click', () => returnToSetup(true));
  $('#sound-toggle').addEventListener('click', (event) => {
    soundEnabled = !soundEnabled;
    event.currentTarget.classList.toggle('is-muted', !soundEnabled);
  });

  document.querySelectorAll('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', () => hideModal(button.dataset.closeModal));
  });
  document.querySelectorAll('.modal-backdrop').forEach((modal) => {
    modal.addEventListener('pointerdown', (event) => {
      if (event.target === modal && modal.id !== 'result-modal') hideModal(modal.id);
    });
  });

  document.addEventListener('keydown', (event) => {
    const visibleModal = document.querySelector('.modal-backdrop.is-visible');
    if (visibleModal) {
      if (event.key === 'Escape' && visibleModal.id !== 'result-modal') hideModal(visibleModal.id);
      return;
    }
    if (event.key.toLowerCase() === 'p') handlePass();
    if (event.key.toLowerCase() === 'u') handleUndo();
    if (event.key === 'Escape' && gameScreen.classList.contains('is-active')) returnToSetup();
  });
}

preferences = applyPreferencesToDocument(preferences);
populateLanguageOptions();
populateLocalizedOptions();
translateDocument(preferences.language);
initializeChoices();
bindSettings();
bindControls();
applyLanguage();
