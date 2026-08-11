export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;

export const RULE_SETS = Object.freeze({
  japanese: Object.freeze({
    key: 'japanese',
    name: 'Luật Nhật Bản',
    scoring: 'territory',
    komi: 6.5,
    ko: 'simple',
    allowSuicide: false,
    description: 'Điểm = lãnh thổ trống + số quân bắt được. Áp dụng Ko đơn và không cho phép tự sát.',
  }),
  chinese: Object.freeze({
    key: 'chinese',
    name: 'Luật Trung Quốc',
    scoring: 'area',
    komi: 7.5,
    ko: 'superko',
    allowSuicide: false,
    description: 'Điểm = quân còn trên bàn + lãnh thổ trống. Áp dụng siêu Ko theo vị trí và không cho phép tự sát.',
  }),
  'new-zealand': Object.freeze({
    key: 'new-zealand',
    name: 'Luật New Zealand',
    scoring: 'area',
    komi: 7,
    ko: 'superko',
    allowSuicide: true,
    description: 'Điểm = quân còn trên bàn + lãnh thổ trống. Áp dụng siêu Ko theo vị trí và cho phép tự sát.',
  }),
});

export function opponentOf(color) {
  return color === BLACK ? WHITE : BLACK;
}

function neighborsOf(index, size) {
  const row = Math.floor(index / size);
  const col = index % size;
  const neighbors = [];
  if (row > 0) neighbors.push(index - size);
  if (row < size - 1) neighbors.push(index + size);
  if (col > 0) neighbors.push(index - 1);
  if (col < size - 1) neighbors.push(index + 1);
  return neighbors;
}

export function collectGroup(board, size, startIndex) {
  const color = board[startIndex];
  if (color === EMPTY) return { stones: [], liberties: [] };

  const stones = [];
  const liberties = new Set();
  const visited = new Set([startIndex]);
  const stack = [startIndex];

  while (stack.length) {
    const index = stack.pop();
    stones.push(index);
    for (const neighbor of neighborsOf(index, size)) {
      if (board[neighbor] === EMPTY) liberties.add(neighbor);
      else if (board[neighbor] === color && !visited.has(neighbor)) {
        visited.add(neighbor);
        stack.push(neighbor);
      }
    }
  }

  return { stones, liberties: [...liberties] };
}

export function boardHash(board) {
  return Array.from(board).join('');
}

export function simulateBoardMove(board, size, color, row, col, options = {}) {
  const { allowSuicide = false } = options;
  if (row < 0 || row >= size || col < 0 || col >= size) {
    return { ok: false, reasonCode: 'outOfBounds', reason: 'Nước đi nằm ngoài bàn cờ.' };
  }

  const index = row * size + col;
  if (board[index] !== EMPTY) return { ok: false, reasonCode: 'occupied', reason: 'Giao điểm này đã có quân.' };

  const nextBoard = board.slice();
  const opponent = opponentOf(color);
  nextBoard[index] = color;

  let captured = 0;
  const checkedOpponentStones = new Set();
  for (const neighbor of neighborsOf(index, size)) {
    if (nextBoard[neighbor] !== opponent || checkedOpponentStones.has(neighbor)) continue;
    const group = collectGroup(nextBoard, size, neighbor);
    group.stones.forEach((stone) => checkedOpponentStones.add(stone));
    if (group.liberties.length === 0) {
      captured += group.stones.length;
      group.stones.forEach((stone) => {
        nextBoard[stone] = EMPTY;
      });
    }
  }

  const ownGroup = collectGroup(nextBoard, size, index);
  let selfCaptured = 0;
  if (ownGroup.liberties.length === 0) {
    if (!allowSuicide) return { ok: false, reasonCode: 'suicide', reason: 'Luật đang chọn không cho phép nước tự sát.' };
    selfCaptured = ownGroup.stones.length;
    ownGroup.stones.forEach((stone) => {
      nextBoard[stone] = EMPTY;
    });
  }

  const survivingGroup = nextBoard[index] === color
    ? collectGroup(nextBoard, size, index)
    : { stones: [], liberties: [] };

  return {
    ok: true,
    board: nextBoard,
    row,
    col,
    index,
    color,
    captured,
    selfCaptured,
    liberties: survivingGroup.liberties.length,
    groupSize: survivingGroup.stones.length,
    hash: boardHash(nextBoard),
  };
}

function cloneResult(result) {
  return result ? { ...result, territory: result.territory ? { ...result.territory } : undefined } : null;
}

export class GoGame {
  constructor(size = 13, ruleKey = 'japanese') {
    if (!Number.isInteger(size) || size < 2) throw new Error('Kích thước bàn cờ không hợp lệ.');
    if (!RULE_SETS[ruleKey]) throw new Error('Bộ luật không được hỗ trợ.');

    this.size = size;
    this.ruleKey = ruleKey;
    this.rules = RULE_SETS[ruleKey];
    this.board = new Int8Array(size * size);
    this.currentPlayer = BLACK;
    this.captures = { [BLACK]: 0, [WHITE]: 0 };
    this.consecutivePasses = 0;
    this.moveNumber = 0;
    this.lastMove = null;
    this.lastAction = null;
    this.gameOver = false;
    this.result = null;
    this.history = [];
    this.#saveSnapshot();
  }

  previewMove(row, col, color = this.currentPlayer) {
    if (this.gameOver) return { ok: false, reasonCode: 'gameOver', reason: 'Ván đấu đã kết thúc.' };
    const move = simulateBoardMove(this.board, this.size, color, row, col, this.rules);
    if (!move.ok) return move;

    if (this.rules.ko === 'simple' && this.history.length >= 2) {
      const previousPosition = this.history[this.history.length - 2].hash;
      if (move.hash === previousPosition) return { ok: false, reasonCode: 'ko', reason: 'Nước đi vi phạm luật Ko.' };
    }

    if (this.rules.ko === 'superko' && this.history.some((state) => state.hash === move.hash)) {
      return { ok: false, reasonCode: 'superko', reason: 'Nước đi lặp lại một thế cờ cũ (siêu Ko).' };
    }

    return move;
  }

  play(row, col) {
    const move = this.previewMove(row, col);
    if (!move.ok) return move;

    this.board = move.board;
    this.captures[this.currentPlayer] += move.captured;
    this.captures[opponentOf(this.currentPlayer)] += move.selfCaptured;
    this.lastMove = move.selfCaptured > 0 ? null : { row, col, color: this.currentPlayer };
    this.lastAction = { type: 'move', row, col, color: this.currentPlayer };
    this.currentPlayer = opponentOf(this.currentPlayer);
    this.consecutivePasses = 0;
    this.moveNumber += 1;
    this.#saveSnapshot();
    return move;
  }

  pass() {
    if (this.gameOver) return { ok: false, reasonCode: 'gameOver', reason: 'Ván đấu đã kết thúc.' };
    const passingColor = this.currentPlayer;
    this.consecutivePasses += 1;
    this.moveNumber += 1;
    this.lastMove = null;
    this.lastAction = { type: 'pass', color: passingColor };
    this.currentPlayer = opponentOf(this.currentPlayer);

    if (this.consecutivePasses >= 2) {
      this.gameOver = true;
      this.result = { ...this.score(), reason: 'passes' };
    }

    this.#saveSnapshot();
    return { ok: true, color: passingColor, gameOver: this.gameOver };
  }

  finish() {
    if (this.gameOver) return this.result;
    this.gameOver = true;
    this.lastAction = { type: 'finish' };
    this.result = { ...this.score(), reason: 'manual' };
    this.#saveSnapshot();
    return this.result;
  }

  resign(color = this.currentPlayer) {
    if (this.gameOver) return this.result;
    const winner = opponentOf(color);
    this.gameOver = true;
    this.lastAction = { type: 'resign', color };
    this.result = {
      reason: 'resign',
      winner,
      margin: null,
      black: null,
      white: null,
      resigned: color,
    };
    this.#saveSnapshot();
    return this.result;
  }

  undo(steps = 1) {
    const available = this.history.length - 1;
    const count = Math.min(Math.max(1, steps), available);
    if (count <= 0) return false;
    this.history.splice(this.history.length - count, count);
    this.#restoreSnapshot(this.history[this.history.length - 1]);
    return true;
  }

  getLegalMoves(color = this.currentPlayer) {
    if (this.gameOver) return [];
    const moves = [];
    for (let row = 0; row < this.size; row += 1) {
      for (let col = 0; col < this.size; col += 1) {
        const preview = this.previewMove(row, col, color);
        if (preview.ok) moves.push(preview);
      }
    }
    return moves;
  }

  score() {
    const territory = this.#calculateTerritory();
    let blackStones = 0;
    let whiteStones = 0;
    for (const point of this.board) {
      if (point === BLACK) blackStones += 1;
      else if (point === WHITE) whiteStones += 1;
    }

    const black = this.rules.scoring === 'territory'
      ? territory[BLACK] + this.captures[BLACK]
      : territory[BLACK] + blackStones;
    const whiteBase = this.rules.scoring === 'territory'
      ? territory[WHITE] + this.captures[WHITE]
      : territory[WHITE] + whiteStones;
    const white = whiteBase + this.rules.komi;
    const winner = black === white ? EMPTY : black > white ? BLACK : WHITE;

    return {
      black,
      white,
      winner,
      margin: Math.abs(black - white),
      territory: { black: territory[BLACK], white: territory[WHITE] },
      stones: { black: blackStones, white: whiteStones },
      captures: { black: this.captures[BLACK], white: this.captures[WHITE] },
      scoring: this.rules.scoring,
      komi: this.rules.komi,
    };
  }

  #calculateTerritory() {
    const territory = { [BLACK]: 0, [WHITE]: 0 };
    const visited = new Set();

    for (let start = 0; start < this.board.length; start += 1) {
      if (this.board[start] !== EMPTY || visited.has(start)) continue;
      const region = [];
      const borders = new Set();
      const stack = [start];
      visited.add(start);

      while (stack.length) {
        const index = stack.pop();
        region.push(index);
        for (const neighbor of neighborsOf(index, this.size)) {
          const value = this.board[neighbor];
          if (value === EMPTY && !visited.has(neighbor)) {
            visited.add(neighbor);
            stack.push(neighbor);
          } else if (value !== EMPTY) borders.add(value);
        }
      }

      if (borders.size === 1) territory[[...borders][0]] += region.length;
    }

    return territory;
  }

  #saveSnapshot() {
    this.history.push({
      board: this.board.slice(),
      hash: boardHash(this.board),
      currentPlayer: this.currentPlayer,
      captures: { ...this.captures },
      consecutivePasses: this.consecutivePasses,
      moveNumber: this.moveNumber,
      lastMove: this.lastMove ? { ...this.lastMove } : null,
      lastAction: this.lastAction ? { ...this.lastAction } : null,
      gameOver: this.gameOver,
      result: cloneResult(this.result),
    });
  }

  #restoreSnapshot(snapshot) {
    this.board = snapshot.board.slice();
    this.currentPlayer = snapshot.currentPlayer;
    this.captures = { ...snapshot.captures };
    this.consecutivePasses = snapshot.consecutivePasses;
    this.moveNumber = snapshot.moveNumber;
    this.lastMove = snapshot.lastMove ? { ...snapshot.lastMove } : null;
    this.lastAction = snapshot.lastAction ? { ...snapshot.lastAction } : null;
    this.gameOver = snapshot.gameOver;
    this.result = cloneResult(snapshot.result);
  }
}
