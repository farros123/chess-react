// ============================================
// APP COMPONENT - Main application
// ============================================

import React, { useMemo } from 'react';
import { useChessGame } from './hooks/useChessGame';
import ChessBoard from './components/ChessBoard';
import GameInfo from './components/GameInfo';

function App() {
  const {
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
  } = useChessGame();

  // Calculate last move for highlighting
  const lastMove = useMemo(() => {
    if (moveHistory.length === 0) return null;
    const last = moveHistory[moveHistory.length - 1];
    return { from: last.from, to: last.to };
  }, [moveHistory]);

  // Calculate check square (king position when in check)
  const checkSquare = useMemo(() => {
    if (gameStatus !== 'check' && gameStatus !== 'checkmate') return null;
    const kingPiece = turn ? 'K' : 'k';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] === kingPiece) {
          return [r, c];
        }
      }
    }
    return null;
  }, [board, turn, gameStatus]);

  return (
    <div className="min-h-screen bg-chess-bg flex flex-col items-center justify-center p-4">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-gray-100 drop-shadow-lg">
          ♟️ Game Catur
        </h1>
        <p className="text-gray-400 text-sm mt-1">
        </p>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-5xl flex flex-col lg:flex-row gap-6 items-start justify-center">
        {/* Game Info Panel - Left */}
        <GameInfo
          turn={turn}
          gameStatus={gameStatus}
          winner={winner}
          moveHistory={moveHistory}
          capturedPieces={capturedPieces}
          onReset={resetGame}
        />

        {/* Chess Board - Center */}
        <div className="w-full max-w-[560px] flex-shrink-0">
          {/* Player indicator - top (Black) */}
          <div className="flex items-center justify-between mb-2 px-1">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${!turn
              ? 'bg-yellow-500/20 border border-yellow-500/40'
              : 'bg-white/5 border border-white/10'
              }`}>
              <div className="w-3 h-3 rounded-full bg-gray-800 border border-gray-600"></div>
              <span className="text-gray-300 text-sm font-semibold">Hitam ♚</span>
            </div>
            {gameStatus === 'checkmate' && winner === 'black' && (
              <span className="text-emerald-400 font-bold text-sm animate-pulse">🏆 Pemenang!</span>
            )}
          </div>

          {/* The Board */}
          <ChessBoard
            board={board}
            selectedSquare={selectedSquare}
            validMoves={validMoves}
            lastMove={lastMove}
            checkSquare={checkSquare}
            onSquareClick={handleSquareClick}
            isValidMoveTarget={isValidMoveTarget}
            isValidCapture={isValidCapture}
          />

          {/* Player indicator - bottom (White) */}
          <div className="flex items-center justify-between mt-2 px-1">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${turn
              ? 'bg-yellow-500/20 border border-yellow-500/40'
              : 'bg-white/5 border border-white/10'
              }`}>
              <div className="w-3 h-3 rounded-full bg-white border border-gray-400"></div>
              <span className="text-gray-300 text-sm font-semibold">Putih ♔</span>
            </div>
            {gameStatus === 'checkmate' && winner === 'white' && (
              <span className="text-emerald-400 font-bold text-sm animate-pulse">🏆 Pemenang!</span>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center">
        <p className="text-gray-600 text-xs">
          Dibuat dengan React & Tailwind CSS • Fitur: Skakmat, Stalemate, Promosi Pion
        </p>
      </footer>
    </div>
  );
}

export default App;