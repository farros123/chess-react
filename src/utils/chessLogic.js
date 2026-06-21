// ============================================
// CHESS GAME LOGIC - Pure functions
// ============================================

export const PIECES = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
};

export const INITIAL_BOARD = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

// Helper functions
export const isWhite = (piece) => piece && piece === piece.toUpperCase();
export const isBlack = (piece) => piece && piece === piece.toLowerCase();
export const isAlly = (piece, isWhiteTurn) => isWhiteTurn ? isWhite(piece) : isBlack(piece);
export const isEnemy = (piece, isWhiteTurn) => isWhiteTurn ? isBlack(piece) : isWhite(piece);
export const getPieceType = (piece) => piece ? piece.toLowerCase() : null;

// Clone board deeply
export const cloneBoard = (board) => board.map(row => [...row]);

// Check if position is valid
export const isValidPosition = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

// Get all possible moves for a piece (without checking king safety)
export const getRawMoves = (r, c, board) => {
  const piece = board[r][c];
  if (!piece) return [];

  const white = isWhite(piece);
  const type = getPieceType(piece);
  const moves = [];

  const addMove = (nr, nc) => {
    if (!isValidPosition(nr, nc)) return false;
    if (isAlly(board[nr][nc], white)) return false;
    moves.push([nr, nc]);
    return !board[nr][nc]; // return true if empty (can continue sliding)
  };

  const slide = (dr, dc) => {
    for (let i = 1; i < 8; i++) {
      if (!addMove(r + dr * i, c + dc * i)) break;
    }
  };

  switch (type) {
    case 'p': {
      const dir = white ? -1 : 1;
      const startRow = white ? 6 : 1;

      // Forward move
      if (!board[r + dir]?.[c]) {
        moves.push([r + dir, c]);
        // Double move from start
        if (r === startRow && !board[r + 2 * dir]?.[c]) {
          moves.push([r + 2 * dir, c]);
        }
      }

      // Diagonal captures
      [-1, 1].forEach(dc => {
        if (isEnemy(board[r + dir]?.[c + dc], white)) {
          moves.push([r + dir, c + dc]);
        }
      });
      break;
    }

    case 'r':
      slide(1, 0); slide(-1, 0); slide(0, 1); slide(0, -1);
      break;

    case 'b':
      slide(1, 1); slide(1, -1); slide(-1, 1); slide(-1, -1);
      break;

    case 'q':
      slide(1, 0); slide(-1, 0); slide(0, 1); slide(0, -1);
      slide(1, 1); slide(1, -1); slide(-1, 1); slide(-1, -1);
      break;

    case 'n':
      [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]
        .forEach(([dr, dc]) => addMove(r + dr, c + dc));
      break;

    case 'k':
      [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
        .forEach(([dr, dc]) => addMove(r + dr, c + dc));
      break;

    default:
      break;
  }

  return moves;
};

// Check if king is in check
export const inCheck = (board, isWhiteKing) => {
  const kingPiece = isWhiteKing ? 'K' : 'k';
  let kr = -1, kc = -1;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === kingPiece) {
        kr = r;
        kc = c;
        break;
      }
    }
    if (kr !== -1) break;
  }

  if (kr === -1) return true;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (isEnemy(board[r][c], isWhiteKing)) {
        const moves = getRawMoves(r, c, board);
        if (moves.some(([mr, mc]) => mr === kr && mc === kc)) {
          return true;
        }
      }
    }
  }

  return false;
};

// Get legal moves (filtered to prevent moving into check)
export const getLegalMoves = (r, c, board) => {
  const piece = board[r][c];
  if (!piece) return [];

  const white = isWhite(piece);
  const rawMoves = getRawMoves(r, c, board);

  return rawMoves.filter(([nr, nc]) => {
    const newBoard = cloneBoard(board);
    newBoard[nr][nc] = piece;
    newBoard[r][c] = null;
    return !inCheck(newBoard, white);
  });
};

// Check if player has any legal moves
export const hasLegalMoves = (board, isWhiteTurn) => {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (isAlly(board[r][c], isWhiteTurn) && getLegalMoves(r, c, board).length > 0) {
        return true;
      }
    }
  }
  return false;
};

// Check game status
export const getGameStatus = (board, isWhiteTurn) => {
  const check = inCheck(board, isWhiteTurn);
  const legal = hasLegalMoves(board, isWhiteTurn);

  if (!legal && check) {
    return { status: 'checkmate', winner: isWhiteTurn ? 'black' : 'white' };
  }
  if (!legal) {
    return { status: 'stalemate', winner: null };
  }
  if (check) {
    return { status: 'check', winner: null };
  }
  return { status: 'playing', winner: null };
};

// Handle pawn promotion
export const promotePawn = (board, row, col, isWhiteTurn) => {
  const newBoard = cloneBoard(board);
  newBoard[row][col] = isWhiteTurn ? 'Q' : 'q';
  return newBoard;
};