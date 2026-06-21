// ============================================
// CUSTOM HOOK - Chess Game State Management
// ============================================

import { useState, useCallback } from 'react';
import {
  INITIAL_BOARD,
  cloneBoard,
  getLegalMoves,
  getGameStatus,
  promotePawn,
  isAlly,
} from '../utils/chessLogic';

export const useChessGame = () => {
  const [board, setBoard] = useState(() => cloneBoard(INITIAL_BOARD));
  const [turn, setTurn] = useState(true); // true = white, false = black
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing');
  const [winner, setWinner] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });

  // Select a piece and calculate valid moves
  const selectSquare = useCallback((row, col) => {
    const piece = board[row][col];

    // If already selected a valid target, this shouldn't happen (handleMove should be called)
    if (!piece || !isAlly(piece, turn)) {
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    const moves = getLegalMoves(row, col, board);
    setSelectedSquare([row, col]);
    setValidMoves(moves);
  }, [board, turn]);

  // Execute a move
  const executeMove = useCallback((fromRow, fromCol, toRow, toCol) => {
    const piece = board[fromRow][fromCol];
    const capturedPiece = board[toRow][toCol];
    const isWhiteTurn = turn;

    // Create new board state
    let newBoard = cloneBoard(board);
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;

    // Handle pawn promotion
    if (piece === 'P' && toRow === 0) {
      newBoard = promotePawn(newBoard, toRow, toCol, true);
    }
    if (piece === 'p' && toRow === 7) {
      newBoard = promotePawn(newBoard, toRow, toCol, false);
    }

    // Update captured pieces
    if (capturedPiece) {
      setCapturedPieces(prev => ({
        ...prev,
        [isWhiteTurn ? 'white' : 'black']: [...prev[isWhiteTurn ? 'white' : 'black'], capturedPiece]
      }));
    }

    // Update move history
    const files = 'abcdefgh';
    const ranks = '87654321';
    const pieceSymbols = { p: '', n: 'N', b: 'B', r: 'R', q: 'Q', k: 'K' };
    const pieceType = piece.toLowerCase();
    let notation = pieceSymbols[pieceType] || '';
    if (capturedPiece) {
      if (pieceType === 'p') notation += files[fromCol];
      notation += 'x';
    }
    notation += files[toCol] + ranks[toRow];

    setMoveHistory(prev => [...prev, {
      piece,
      from: [fromRow, fromCol],
      to: [toRow, toCol],
      notation,
      captured: capturedPiece,
      turn: isWhiteTurn ? 'white' : 'black'
    }]);

    // Switch turn
    const nextTurn = !turn;
    setTurn(nextTurn);

    // Check game status for next player
    const status = getGameStatus(newBoard, nextTurn);
    setGameStatus(status.status);
    setWinner(status.winner);

    // Update board and clear selection
    setBoard(newBoard);
    setSelectedSquare(null);
    setValidMoves([]);
  }, [board, turn]);

  // Handle square click
  const handleSquareClick = useCallback((row, col) => {
    if (gameStatus !== 'playing') return;

    // If a valid move target is clicked, execute move
    const isValidTarget = validMoves.some(([vr, vc]) => vr === row && vc === col);

    if (selectedSquare && isValidTarget) {
      executeMove(selectedSquare[0], selectedSquare[1], row, col);
      return;
    }

    // Otherwise, try to select the piece
    selectSquare(row, col);
  }, [selectedSquare, validMoves, gameStatus, executeMove, selectSquare]);

  // Reset game
  const resetGame = useCallback(() => {
    setBoard(cloneBoard(INITIAL_BOARD));
    setTurn(true);
    setSelectedSquare(null);
    setValidMoves([]);
    setGameStatus('playing');
    setWinner(null);
    setMoveHistory([]);
    setCapturedPieces({ white: [], black: [] });
  }, []);

  // Check if a square is a valid move target
  const isValidMoveTarget = useCallback((row, col) => {
    return validMoves.some(([vr, vc]) => vr === row && vc === col);
  }, [validMoves]);

  // Check if a square has a capture move
  const isValidCapture = useCallback((row, col) => {
    return validMoves.some(([vr, vc]) => vr === row && vc === col && board[vr][vc] !== null);
  }, [validMoves, board]);

  return {
    board,
    turn,
    selectedSquare,
    validMoves,
    gameStatus,
    winner,
    moveHistory,
    capturedPieces,
    handleSquareClick,
    resetGame,
    isValidMoveTarget,
    isValidCapture,
  };
};