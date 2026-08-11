import {
  BLACK,
  EMPTY,
  WHITE,
  collectGroup,
  opponentOf,
  simulateBoardMove,
} from './go-engine.js';

const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function countStones(board) {
  let count = 0;
  for (const value of board) if (value !== EMPTY) count += 1;
  return count;
}

function adjacentIndexes(row, col, size) {
  const indexes = [];
  for (const [dr, dc] of DIRECTIONS) {
    const nextRow = row + dr;
    const nextCol = col + dc;
    if (nextRow >= 0 && nextRow < size && nextCol >= 0 && nextCol < size) {
      indexes.push(nextRow * size + nextCol);
    }
  }
  return indexes;
}

function positionalPreference(row, col, size, progress) {
  const edgeDistance = Math.min(row, col, size - 1 - row, size - 1 - col);
  const center = (size - 1) / 2;
  const centerDistance = Math.hypot(row - center, col - center) / Math.max(1, center);
  let score = 0;

  if (edgeDistance === 0) score -= progress < 0.65 ? 6 : 1.5;
  else if (edgeDistance === 1) score += size <= 9 ? 1.5 : 3;
  else if (edgeDistance === 2) score += size >= 13 ? 3.5 : 1;

  if (progress < 0.2) score += (1 - centerDistance) * (size <= 9 ? 4 : 1.5);
  return score;
}

function tacticalScore(game, move, color) {
  const { board, size } = game;
  const opponent = opponentOf(color);
  const progress = countStones(board) / board.length;
  const beforeNeighbors = adjacentIndexes(move.row, move.col, size);
  const friendlyGroups = new Set();
  const threatenedGroups = new Set();

  for (const index of beforeNeighbors) {
    if (board[index] === color) {
      const group = collectGroup(board, size, index);
      friendlyGroups.add(group.stones[0]);
      if (group.liberties.length === 1) threatenedGroups.add(group.stones[0]);
    }
  }

  let score = 0;
  score += move.captured * 22;
  score += move.liberties * 1.9;
  score += Math.min(move.groupSize, 6) * 0.65;
  score += Math.max(0, friendlyGroups.size - 1) * 4;
  score += threatenedGroups.size * 7;
  score += positionalPreference(move.row, move.col, size, progress);

  if (move.liberties === 1 && move.captured === 0) score -= 15;
  if (move.selfCaptured > 0) score -= 30 + move.selfCaptured * 8;

  const checked = new Set();
  for (const index of beforeNeighbors) {
    if (move.board[index] !== opponent || checked.has(index)) continue;
    const group = collectGroup(move.board, size, index);
    group.stones.forEach((stone) => checked.add(stone));
    if (group.liberties.length === 1) score += 7 + Math.min(group.stones.length, 5);
  }

  return score;
}

function boardHealth(board, size, color) {
  const seen = new Set();
  let value = 0;

  for (let index = 0; index < board.length; index += 1) {
    const stone = board[index];
    if (stone === EMPTY || seen.has(index)) continue;
    const group = collectGroup(board, size, index);
    group.stones.forEach((point) => seen.add(point));
    const sign = stone === color ? 1 : -1;
    value += sign * group.stones.length * 0.7;
    value += sign * Math.min(group.liberties.length, 6) * 0.55;
    if (group.liberties.length === 1) value -= sign * (5 + group.stones.length * 1.2);
  }
  return value;
}

function scoreCandidates(game, color) {
  const candidates = [];
  for (let row = 0; row < game.size; row += 1) {
    for (let col = 0; col < game.size; col += 1) {
      const move = game.previewMove(row, col, color);
      if (!move.ok) continue;
      candidates.push({
        ...move,
        score: tacticalScore(game, move, color),
      });
    }
  }
  return candidates;
}

function chooseEasy(candidates) {
  const captures = candidates.filter((candidate) => candidate.captured > 0);
  if (captures.length && Math.random() < 0.7) return randomItem(captures);

  const safe = candidates.filter((candidate) => candidate.liberties > 1 && candidate.selfCaptured === 0);
  const pool = safe.length ? safe : candidates;
  return randomItem(pool);
}

function chooseMedium(candidates) {
  const ranked = [...candidates].sort((a, b) => b.score - a.score);
  const poolSize = Math.min(ranked.length, Math.max(3, Math.ceil(ranked.length * 0.06)));
  const pool = ranked.slice(0, poolSize);
  const weights = pool.map((_, index) => Math.pow(pool.length - index, 2));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = Math.random() * total;
  for (let index = 0; index < pool.length; index += 1) {
    roll -= weights[index];
    if (roll <= 0) return pool[index];
  }
  return pool[0];
}

function opponentReplyValue(candidate, game, color) {
  const opponent = opponentOf(color);
  const replies = [];
  const size = game.size;
  const relevant = new Set();

  for (let index = 0; index < candidate.board.length; index += 1) {
    if (candidate.board[index] === EMPTY) continue;
    const row = Math.floor(index / size);
    const col = index % size;
    for (const neighbor of adjacentIndexes(row, col, size)) {
      if (candidate.board[neighbor] === EMPTY) relevant.add(neighbor);
    }
  }

  const points = relevant.size > 0
    ? [...relevant]
    : Array.from({ length: candidate.board.length }, (_, index) => index);
  for (const index of points) {
    if (candidate.board[index] !== EMPTY) continue;
    const row = Math.floor(index / size);
    const col = index % size;
    const reply = simulateBoardMove(candidate.board, size, opponent, row, col, game.rules);
    if (!reply.ok) continue;
    const immediate = reply.captured * 24 + reply.liberties * 1.5;
    replies.push(immediate + boardHealth(reply.board, size, opponent) * 0.35);
  }

  if (!replies.length) return 0;
  replies.sort((a, b) => b - a);
  return replies[0];
}

function chooseHard(candidates, game, color) {
  const shortlist = [...candidates]
    .sort((a, b) => b.score - a.score)
    .slice(0, game.size === 19 ? 14 : 20);

  let best = null;
  for (const candidate of shortlist) {
    const replyPenalty = opponentReplyValue(candidate, game, color);
    const health = boardHealth(candidate.board, game.size, color);
    const value = candidate.score + health * 0.8 - replyPenalty * 0.62 + Math.random() * 0.4;
    if (!best || value > best.value) best = { ...candidate, value };
  }
  return best;
}

function shouldPass(game, candidate, difficulty) {
  if (!candidate) return true;
  const progress = countStones(game.board) / game.board.length;
  const opponentJustPassed = game.lastAction?.type === 'pass';
  if (!opponentJustPassed) return false;

  const threshold = difficulty === 'hard' ? 0.28 : difficulty === 'medium' ? 0.36 : 0.48;
  const noUrgentTactic = candidate.captured === 0 && candidate.score < 7;
  return progress >= threshold && noUrgentTactic;
}

/**
 * Chọn nước đi bằng thuật toán cục bộ. Không gọi mạng, mô hình học máy hay dịch vụ ngoài.
 */
export function chooseComputerMove(game, difficulty = 'medium') {
  const color = game.currentPlayer;
  if (color !== BLACK && color !== WHITE) return null;
  const candidates = scoreCandidates(game, color);
  if (!candidates.length) return null;

  let choice;
  if (difficulty === 'easy') choice = chooseEasy(candidates);
  else if (difficulty === 'hard') choice = chooseHard(candidates, game, color);
  else choice = chooseMedium(candidates);

  return shouldPass(game, choice, difficulty) ? null : { row: choice.row, col: choice.col };
}
