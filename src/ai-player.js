import { BLACK, EMPTY, WHITE } from './go-engine.js';

export const AI_PROVIDERS = Object.freeze({
  openai: Object.freeze({ name: 'OpenAI', endpoint: 'https://api.openai.com/v1/chat/completions', protocol: 'openai' }),
  claude: Object.freeze({ name: 'Claude', endpoint: 'https://api.anthropic.com/v1/messages', protocol: 'claude' }),
  grok: Object.freeze({ name: 'Grok', endpoint: 'https://api.x.ai/v1/chat/completions', protocol: 'openai' }),
  gemini: Object.freeze({ name: 'Gemini', endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent', protocol: 'gemini' }),
  openrouter: Object.freeze({ name: 'OpenRouter', endpoint: 'https://openrouter.ai/api/v1/chat/completions', protocol: 'openai' }),
  'ollama-cloud': Object.freeze({ name: 'Ollama Cloud', endpoint: 'https://ollama.com/api/chat', protocol: 'ollama' }),
});

export class AiGatewayError extends Error {
  constructor(message, code = 'request', status = 0) {
    super(message);
    this.name = 'AiGatewayError';
    this.code = code;
    this.status = status;
  }
}

function colorId(color) {
  return color === BLACK ? 'black' : color === WHITE ? 'white' : 'empty';
}

function boardRows(game) {
  const symbols = { [EMPTY]: '.', [BLACK]: 'B', [WHITE]: 'W' };
  return Array.from({ length: game.size }, (_, row) => Array.from(
    game.board.slice(row * game.size, (row + 1) * game.size),
    (point) => symbols[point],
  ).join(''));
}

function serializeAction(action) {
  if (!action) return null;
  if (action.type === 'move') return { type: 'move', row: action.row, col: action.col, color: colorId(action.color) };
  if (action.type === 'pass') return { type: 'pass', color: colorId(action.color) };
  return { type: action.type };
}

export function buildGamePayload(game, aiColor = game.currentPlayer) {
  const legalActions = game.getLegalMoves(aiColor).map(({ row, col }) => ({ type: 'move', row, col }));
  legalActions.push({ type: 'pass' });

  return {
    game: 'Go',
    aliases: ['Cờ vây', 'Weiqi', 'Baduk'],
    boardSize: game.size,
    aiColor: colorId(aiColor),
    currentTurn: colorId(game.currentPlayer),
    coordinateSystem: {
      indexBase: 0,
      row: 'top-to-bottom',
      col: 'left-to-right',
    },
    rules: {
      id: game.ruleKey,
      scoring: game.rules.scoring,
      komi: game.rules.komi,
      ko: game.rules.ko,
      suicideAllowed: game.rules.allowSuicide,
      endAfterConsecutivePasses: 2,
    },
    boardLegend: { '.': 'empty', B: 'black', W: 'white' },
    board: boardRows(game),
    capturesByColor: {
      black: game.captures[BLACK],
      white: game.captures[WHITE],
    },
    moveNumber: game.moveNumber,
    consecutivePasses: game.consecutivePasses,
    recentActions: game.history
      .slice(Math.max(1, game.history.length - 24))
      .map(({ lastAction }) => serializeAction(lastAction))
      .filter(Boolean),
    legalActions,
  };
}

function buildPrompts(payload) {
  const system = [
    'You are the AI opponent in an active game of Go (also called Weiqi, Baduk, or Cờ vây).',
    `You play ${payload.aiColor}. The local game engine is the only rules authority.`,
    'Study the board and the exact rule profile in the supplied JSON, then choose the strongest strategic action.',
    'Choose exactly one item from legalActions. Never invent a coordinate and never change the board yourself.',
    'Rows and columns are zero-based. Row increases top-to-bottom; col increases left-to-right.',
    'Return JSON only: {"action":"move","row":INTEGER,"col":INTEGER} or {"action":"pass"}.',
    'Do not wrap the JSON in Markdown and do not add commentary.',
  ].join('\n');
  const user = `Choose your next move from this authoritative game state:\n${JSON.stringify(payload)}`;
  return { system, user };
}

function contentToText(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.map((part) => {
    if (typeof part === 'string') return part;
    return part?.text ?? part?.content ?? '';
  }).join('');
}

export function buildGatewayRequest(providerKey, apiKey, model, prompts) {
  const provider = AI_PROVIDERS[providerKey];
  if (!provider) throw new AiGatewayError('Unsupported AI gateway.', 'configuration');
  const cleanKey = String(apiKey ?? '').trim();
  const cleanModel = String(model ?? '').trim();
  if (!cleanKey || !cleanModel) throw new AiGatewayError('API key and model are required.', 'configuration');

  const headers = { 'Content-Type': 'application/json' };
  let url = provider.endpoint;
  let body;

  if (provider.protocol === 'openai') {
    headers.Authorization = `Bearer ${cleanKey}`;
    body = {
      model: cleanModel,
      messages: [
        { role: 'system', content: prompts.system },
        { role: 'user', content: prompts.user },
      ],
    };
  } else if (provider.protocol === 'claude') {
    headers['x-api-key'] = cleanKey;
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
    body = {
      model: cleanModel,
      max_tokens: 200,
      system: prompts.system,
      messages: [{ role: 'user', content: prompts.user }],
    };
  } else if (provider.protocol === 'gemini') {
    const modelPath = cleanModel.replace(/^models\//, '');
    url = provider.endpoint.replace('{model}', encodeURIComponent(modelPath));
    headers['x-goog-api-key'] = cleanKey;
    body = {
      systemInstruction: { parts: [{ text: prompts.system }] },
      contents: [{ role: 'user', parts: [{ text: prompts.user }] }],
      generationConfig: { responseMimeType: 'application/json' },
    };
  } else {
    headers.Authorization = `Bearer ${cleanKey}`;
    body = {
      model: cleanModel,
      stream: false,
      format: 'json',
      messages: [
        { role: 'system', content: prompts.system },
        { role: 'user', content: prompts.user },
      ],
    };
  }

  return { url, options: { method: 'POST', headers, body: JSON.stringify(body) }, protocol: provider.protocol };
}

function responseText(protocol, data) {
  if (protocol === 'openai') return contentToText(data?.choices?.[0]?.message?.content);
  if (protocol === 'claude') return contentToText(data?.content);
  if (protocol === 'gemini') return contentToText(data?.candidates?.[0]?.content?.parts);
  return contentToText(data?.message?.content ?? data?.response);
}

function extractJson(text) {
  const source = String(text ?? '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const start = source.indexOf('{');
  const end = source.lastIndexOf('}');
  if (start < 0 || end < start) throw new AiGatewayError('AI response does not contain JSON.', 'invalid-response');
  try {
    return JSON.parse(source.slice(start, end + 1));
  } catch {
    throw new AiGatewayError('AI response contains invalid JSON.', 'invalid-response');
  }
}

export function parseAiDecision(text, legalActions) {
  const parsed = extractJson(text);
  const decision = typeof parsed.action === 'object' && parsed.action ? parsed.action : parsed;
  const action = typeof parsed.action === 'string' ? parsed.action.toLowerCase() : String(decision.type ?? '').toLowerCase();

  if (action === 'pass') return { action: 'pass' };
  if (action !== 'move') throw new AiGatewayError('AI response has an unsupported action.', 'invalid-response');

  const row = Number.isInteger(decision.row) ? decision.row : decision.y;
  const col = Number.isInteger(decision.col) ? decision.col : decision.x;
  if (!Number.isInteger(row) || !Number.isInteger(col)) {
    throw new AiGatewayError('AI response has invalid coordinates.', 'invalid-response');
  }

  const legal = legalActions.some((item) => item.type === 'move' && item.row === row && item.col === col);
  if (!legal) throw new AiGatewayError('AI selected a move outside legalActions.', 'illegal-move');
  return { action: 'move', row, col };
}

async function readGatewayResponse(response, protocol) {
  let data;
  try {
    data = await response.json();
  } catch {
    throw new AiGatewayError('AI gateway returned a non-JSON response.', 'invalid-response', response.status);
  }

  if (!response.ok) {
    const message = data?.error?.message ?? data?.message ?? data?.error ?? `HTTP ${response.status}`;
    const code = response.status === 401 || response.status === 403
      ? 'authentication'
      : response.status === 429
        ? 'rate-limit'
        : 'request';
    throw new AiGatewayError(String(message), code, response.status);
  }

  const text = responseText(protocol, data);
  if (!text) throw new AiGatewayError('AI gateway returned an empty response.', 'invalid-response', response.status);
  return text;
}

export async function requestAiMove(game, config, options = {}) {
  const { fetchImpl = globalThis.fetch, signal, timeoutMs = 30000 } = options;
  if (typeof fetchImpl !== 'function') throw new AiGatewayError('Fetch API is unavailable.', 'configuration');
  const payload = buildGamePayload(game, game.currentPlayer);
  const prompts = buildPrompts(payload);
  const request = buildGatewayRequest(config.provider, config.apiKey, config.model, prompts);
  const controller = new AbortController();
  let timedOut = false;
  const abortFromCaller = () => controller.abort(signal?.reason);
  if (signal?.aborted) abortFromCaller();
  else signal?.addEventListener('abort', abortFromCaller, { once: true });
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetchImpl(request.url, { ...request.options, signal: controller.signal });
    const text = await readGatewayResponse(response, request.protocol);
    return parseAiDecision(text, payload.legalActions);
  } catch (error) {
    if (timedOut) throw new AiGatewayError('AI request timed out.', 'timeout');
    if (signal?.aborted || error?.name === 'AbortError') throw new AiGatewayError('AI request was cancelled.', 'cancelled');
    if (error instanceof AiGatewayError) throw error;
    throw new AiGatewayError(error?.message || 'Could not reach the AI gateway.', 'network');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}
