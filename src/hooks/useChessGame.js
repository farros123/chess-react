// ============================================
// CUSTOM HOOK - Chess Game State Management
// ============================================

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  INITIAL_BOARD,
  cloneBoard,
  getLegalMoves,
  getGameStatus,
  promotePawn,
  isAlly,
} from '../utils/chessLogic';
import { getAIMove } from '../utils/chessAI';

export const useChessGame = () => {
  const [board, setBoard] = useState(() => cloneBoard(INITIAL_BOARD));
  const [turn, setTurn] = useState(true); // true = white, false = black
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing');
  const [winner, setWinner] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });

  // AI-related state
  const [gameMode, setGameMode] = useState(null); // null = menu, 'pvp' | 'ai'
  const [aiLevel, setAiLevel] = useState(1);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const aiTimeoutRef = useRef(null);

  // Select a piece and calculate valid moves
  const selectSquare = useCallback((row, col) => {
    const piece = board[row][col];

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
    // Block clicks when game is over
    if (gameStatus === 'checkmate' || gameStatus === 'stalemate') return;

    // Block clicks during AI's turn
    if (gameMode === 'ai' && !turn) return;
    if (isAIThinking) return;

    // If a valid move target is clicked, execute move
    const isValidTarget = validMoves.some(([vr, vc]) => vr === row && vc === col);

    if (selectedSquare && isValidTarget) {
      executeMove(selectedSquare[0], selectedSquare[1], row, col);
      return;
    }

    // Otherwise, try to select the piece
    selectSquare(row, col);
  }, [selectedSquare, validMoves, gameStatus, gameMode, turn, isAIThinking, executeMove, selectSquare]);

  // AI auto-move effect
  useEffect(() => {
    // Only trigger when it's Black's turn, AI mode, and game is still ongoing
    if (gameMode !== 'ai') return;
    if (turn) return; // Not Black's turn
    if (gameStatus === 'checkmate' || gameStatus === 'stalemate') return;

    setIsAIThinking(true);

    // Small delay to make AI feel more natural
    const delay = aiLevel === 1 ? 300 : aiLevel === 2 ? 500 : 800;

    aiTimeoutRef.current = setTimeout(() => {
      const move = getAIMove(board, aiLevel);

      if (move) {
        // We need to directly execute the move on the current board
        const piece = board[move.from[0]][move.from[1]];
        const capturedPiece = board[move.to[0]][move.to[1]];

        let newBoard = cloneBoard(board);
        newBoard[move.to[0]][move.to[1]] = piece;
        newBoard[move.from[0]][move.from[1]] = null;

        // Pawn promotion
        if (piece === 'p' && move.to[0] === 7) {
          newBoard = promotePawn(newBoard, move.to[0], move.to[1], false);
        }

        // Update captured pieces
        if (capturedPiece) {
          setCapturedPieces(prev => ({
            ...prev,
            black: [...prev.black, capturedPiece]
          }));
        }

        // Move notation
        const files = 'abcdefgh';
        const ranks = '87654321';
        const pieceSymbols = { p: '', n: 'N', b: 'B', r: 'R', q: 'Q', k: 'K' };
        const pieceType = piece.toLowerCase();
        let notation = pieceSymbols[pieceType] || '';
        if (capturedPiece) {
          if (pieceType === 'p') notation += files[move.from[1]];
          notation += 'x';
        }
        notation += files[move.to[1]] + ranks[move.to[0]];

        setMoveHistory(prev => [...prev, {
          piece,
          from: move.from,
          to: move.to,
          notation,
          captured: capturedPiece,
          turn: 'black'
        }]);

        // Switch to White's turn
        setTurn(true);

        const status = getGameStatus(newBoard, true);
        setGameStatus(status.status);
        setWinner(status.winner);

        setBoard(newBoard);
      }

      setIsAIThinking(false);
    }, delay);

    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, gameMode, gameStatus, board, aiLevel]);

  // Start a new game with specified mode
  const startGame = useCallback((mode, level = 1) => {
    setBoard(cloneBoard(INITIAL_BOARD));
    setTurn(true);
    setSelectedSquare(null);
    setValidMoves([]);
    setGameStatus('playing');
    setWinner(null);
    setMoveHistory([]);
    setCapturedPieces({ white: [], black: [] });
    setGameMode(mode);
    setAiLevel(level);
    setIsAIThinking(false);
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }
  }, []);

  // Reset game (back to menu)
  const resetGame = useCallback(() => {
    setBoard(cloneBoard(INITIAL_BOARD));
    setTurn(true);
    setSelectedSquare(null);
    setValidMoves([]);
    setGameStatus('playing');
    setWinner(null);
    setMoveHistory([]);
    setCapturedPieces({ white: [], black: [] });
    setGameMode(null);
    setAiLevel(1);
    setIsAIThinking(false);
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }
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
    gameMode,
    aiLevel,
    isAIThinking,
    handleSquareClick,
    resetGame,
    startGame,
    isValidMoveTarget,
    isValidCapture,
  };
};