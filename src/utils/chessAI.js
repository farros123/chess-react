// ============================================
// CHESS AI ENGINE - Minimax with Alpha-Beta
// ============================================

import {
  cloneBoard,
  getLegalMoves,
  isWhite,
  isBlack,
  getPieceType,
  inCheck,
} from './chessLogic';

// ---- Piece values (in centipawns) ----
const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// ---- Piece-Square Tables ----
// Tables are from WHITE's perspective (row 0 = rank 8, row 7 = rank 1).
// For Black pieces, we mirror vertically.

const PST_PAWN = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [ 5,  5, 10, 25, 25, 10,  5,  5],
  [ 0,  0,  0, 20, 20,  0,  0,  0],
  [ 5, -5,-10,  0,  0,-10, -5,  5],
  [ 5, 10, 10,-20,-20, 10, 10,  5],
  [ 0,  0,  0,  0,  0,  0,  0,  0],
];

const PST_KNIGHT = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50],
];

const PST_BISHOP = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20],
];

const PST_ROOK = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [ 5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [ 0,  0,  0,  5,  5,  0,  0,  0],
];

const PST_QUEEN = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [  0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20],
];

const PST_KING = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [ 20, 30, 10,  0,  0, 10, 30, 20],
];

const PST = {
  p: PST_PAWN,
  n: PST_KNIGHT,
  b: PST_BISHOP,
  r: PST_ROOK,
  q: PST_QUEEN,
  k: PST_KING,
};

// ---- Board Evaluation ----
// Positive = White advantage, Negative = Black advantage
// AI plays Black and tries to MINIMIZE the score.

const evaluateBoard = (board) => {
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const type = getPieceType(piece);
      const value = PIECE_VALUES[type] || 0;
      const pst = PST[type];

      if (isWhite(piece)) {
        // White: positive, use table as-is (table is from White POV)
        score += value;
        if (pst) score += pst[r][c];
      } else if (isBlack(piece)) {
        // Black: negative, mirror table vertically
        score -= value;
        if (pst) score -= pst[7 - r][c];
      }
    }
  }

  return score;
};

// ---- Get all legal moves for a color ----
const getAllMoves = (board, isWhiteTurn) => {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      if (isWhiteTurn && !isWhite(piece)) continue;
      if (!isWhiteTurn && !isBlack(piece)) continue;

      const legalMoves = getLegalMoves(r, c, board);
      for (const [tr, tc] of legalMoves) {
        moves.push({ from: [r, c], to: [tr, tc] });
      }
    }
  }
  return moves;
};

// ---- Apply a move to get a new board ----
const applyMove = (board, from, to) => {
  const newBoard = cloneBoard(board);
  const piece = newBoard[from[0]][from[1]];
  newBoard[to[0]][to[1]] = piece;
  newBoard[from[0]][from[1]] = null;

  // Handle pawn promotion (auto-queen)
  if (piece === 'p' && to[0] === 7) {
    newBoard[to[0]][to[1]] = 'q';
  }
  if (piece === 'P' && to[0] === 0) {
    newBoard[to[0]][to[1]] = 'Q';
  }

  return newBoard;
};

// ---- Minimax with Alpha-Beta Pruning ----
// isMaximizing = true → White's turn (wants to maximize score)
// isMaximizing = false → Black's turn (wants to minimize score)

const minimax = (board, depth, alpha, beta, isMaximizing) => {
  const isWhiteTurn = isMaximizing;
  const moves = getAllMoves(board, isWhiteTurn);

  // Terminal or depth 0
  if (depth === 0 || moves.length === 0) {
    if (moves.length === 0) {
      // Checkmate or stalemate
      if (inCheck(board, isWhiteTurn)) {
        // Checkmate: the current player lost
        return isMaximizing ? -99999 + (3 - depth) : 99999 - (3 - depth);
      }
      // Stalemate
      return 0;
    }
    return evaluateBoard(board);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = applyMove(board, move.from, move.to);
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = applyMove(board, move.from, move.to);
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

// ---- Move ordering for better alpha-beta performance ----
const orderMoves = (board, moves) => {
  return moves.map(move => {
    let score = 0;
    const target = board[move.to[0]][move.to[1]];
    if (target) {
      // Prioritize captures: MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
      const victimValue = PIECE_VALUES[getPieceType(target)] || 0;
      const attackerValue = PIECE_VALUES[getPieceType(board[move.from[0]][move.from[1]])] || 0;
      score = victimValue * 10 - attackerValue;
    }
    return { ...move, score };
  }).sort((a, b) => b.score - a.score);
};

// ---- Main AI Entry Point ----
// AI plays as Black (isWhiteTurn = false)
// Returns { from: [r, c], to: [r, c] } or null if no moves

export const getAIMove = (board, level = 1) => {
  const moves = getAllMoves(board, false); // Black's legal moves

  if (moves.length === 0) return null;

  // Level 1: Random move
  if (level === 1) {
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
  }

  // Level 2: Minimax depth 2
  // Level 3: Minimax depth 3 with move ordering
  const depth = level === 2 ? 2 : 3;
  const orderedMoves = level === 3 ? orderMoves(board, moves) : moves;

  let bestMove = null;
  let bestScore = Infinity; // Black minimizes

  for (const move of orderedMoves) {
    const newBoard = applyMove(board, move.from, move.to);
    // After Black moves, it's White's turn → isMaximizing = true
    const score = minimax(newBoard, depth - 1, -Infinity, Infinity, true);

    if (score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  // Level 2: add slight randomness among similarly-scored moves
  if (level === 2) {
    const threshold = 50;
    const goodMoves = orderedMoves.filter(move => {
      const newBoard = applyMove(board, move.from, move.to);
      const score = minimax(newBoard, depth - 1, -Infinity, Infinity, true);
      return score <= bestScore + threshold;
    });
    if (goodMoves.length > 1) {
      return goodMoves[Math.floor(Math.random() * goodMoves.length)];
    }
  }

  return bestMove;
};
