import React, { useState } from 'react';
import { PIECES } from '../utils/chessLogic';

const GameInfo = ({
  turn,
  gameStatus,
  winner,
  moveHistory,
  capturedPieces,
  onReset,
  gameMode,
  aiLevel,
  isAIThinking,
  onStartGame,
}) => {
  const [showAILevels, setShowAILevels] = useState(false);

  const getStatusMessage = () => {
    switch (gameStatus) {
      case 'checkmate':
        return `🏆 Skakmat! ${winner === 'white' ? 'Putih' : 'Hitam'} menang!`;
      case 'stalemate':
        return '🤝 Stalemate! Permainan seri.';
      case 'check':
        return '⚠️ Skak!';
      default:
        return '';
    }
  };

  const getTurnLabel = () => {
    if (gameMode === 'ai') {
      return turn ? 'Putih (Kamu) ♔' : 'Hitam (AI) ♚';
    }
    return turn ? 'Putih ♔' : 'Hitam ♚';
  };

  const getMaterialValue = (pieces) => {
    const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    return pieces.reduce((sum, p) => sum + (values[p.toLowerCase()] || 0), 0);
  };

  const whiteAdvantage = getMaterialValue(capturedPieces.white) - getMaterialValue(capturedPieces.black);

  const getLevelLabel = (level) => {
    switch (level) {
      case 1: return '🟢 Pemula';
      case 2: return '🟡 Menengah';
      case 3: return '🔴 Sulit';
      default: return '';
    }
  };

  const getLevelDescription = (level) => {
    switch (level) {
      case 1: return 'Langkah acak';
      case 2: return 'Berpikir 2 langkah';
      case 3: return 'Berpikir 3 langkah';
      default: return '';
    }
  };

  // ---- Game Mode Selection Screen ----
  if (!gameMode) {
    return (
      <div className="flex flex-col gap-4 w-full lg:w-72">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
          <h2 className="text-white font-bold text-lg mb-1 text-center">🎮 Pilih Mode</h2>
          <p className="text-gray-400 text-xs text-center mb-4">Pilih cara bermain</p>

          {/* PvP Button */}
          <button
            onClick={() => onStartGame('pvp')}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mb-3 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
          >
            <span className="text-lg">👥</span>
            <span>2 Pemain (PvP)</span>
          </button>

          {/* VS AI Button */}
          {!showAILevels ? (
            <button
              onClick={() => setShowAILevels(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
            >
              <span className="text-lg">🤖</span>
              <span>Lawan AI</span>
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-300 text-xs font-semibold mb-2 text-center">Pilih Level AI:</p>
              {[1, 2, 3].map(level => (
                <button
                  key={level}
                  onClick={() => onStartGame('ai', level)}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white py-2.5 px-4 rounded-lg text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between"
                >
                  <span className="font-semibold">{getLevelLabel(level)}</span>
                  <span className="text-white/50 text-xs">{getLevelDescription(level)}</span>
                </button>
              ))}
              <button
                onClick={() => setShowAILevels(false)}
                className="w-full text-gray-400 hover:text-gray-300 text-xs py-1 transition-colors"
              >
                ← Kembali
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- In-Game UI ----
  return (
    <div className="flex flex-col gap-4 w-full lg:w-64">
      {/* Mode & Turn Display */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        {/* Game mode badge */}
        <div className="flex items-center justify-center mb-3">
          <span className="bg-white/10 text-gray-300 text-xs px-3 py-1 rounded-full border border-white/10 font-medium">
            {gameMode === 'ai' ? `🤖 vs AI ${getLevelLabel(aiLevel)}` : '👥 2 Pemain'}
          </span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300 text-sm font-medium">Giliran:</span>
          <span className={`font-bold text-lg ${turn ? 'text-white' : 'text-gray-400'}`}>
            {getTurnLabel()}
          </span>
        </div>

        {/* AI Thinking Indicator */}
        {isAIThinking && (
          <div className="text-center py-2 px-3 rounded-lg text-sm bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
            <span>🤖 AI sedang berpikir...</span>
          </div>
        )}

        {/* Status */}
        {gameStatus !== 'playing' && (
          <div className={`text-center py-2 px-3 rounded-lg font-semibold text-sm ${gameStatus === 'checkmate'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
            {getStatusMessage()}
          </div>
        )}

        {gameStatus === 'check' && (
          <div className="text-center py-2 px-3 rounded-lg font-semibold text-sm bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
            {getStatusMessage()}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <button
          onClick={onReset}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          🔄 Main Ulang
        </button>
      </div>

      {/* Captured Pieces - White */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white border border-gray-400"></div>
            <span className="text-white text-sm font-semibold">
              {gameMode === 'ai' ? 'Putih (Kamu)' : 'Putih'}
            </span>
          </div>
          {whiteAdvantage > 0 && (
            <span className="text-emerald-400 text-xs font-bold">+{whiteAdvantage}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1 min-h-[1.5rem]">
          {capturedPieces.white.map((p, i) => (
            <span key={i} className="text-lg opacity-80">{PIECES[p]}</span>
          ))}
          {capturedPieces.white.length === 0 && (
            <span className="text-white/30 text-xs italic">Belum ada</span>
          )}
        </div>
      </div>

      {/* Captured Pieces - Black */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-900 border border-gray-600"></div>
            <span className="text-white text-sm font-semibold">
              {gameMode === 'ai' ? 'Hitam (AI)' : 'Hitam'}
            </span>
          </div>
          {whiteAdvantage < 0 && (
            <span className="text-emerald-400 text-xs font-bold">+{Math.abs(whiteAdvantage)}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1 min-h-[1.5rem]">
          {capturedPieces.black.map((p, i) => (
            <span key={i} className="text-lg opacity-80">{PIECES[p]}</span>
          ))}
          {capturedPieces.black.length === 0 && (
            <span className="text-white/30 text-xs italic">Belum ada</span>
          )}
        </div>
      </div>

      {/* Move History */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex-1 max-h-[300px] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold text-sm">📜 Riwayat</h3>
          <span className="text-white/50 text-xs">{moveHistory.length} langkah</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {moveHistory.length === 0 ? (
            <p className="text-white/30 text-xs text-center py-4 italic">Belum ada langkah</p>
          ) : (
            moveHistory.map((move, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors text-xs"
              >
                <span className="text-white/40 w-6 text-right font-mono">
                  {Math.floor(index / 2) + 1}.
                </span>
                <span className="text-amber-200 font-mono">{move.notation}</span>
                {move.captured && <span className="text-red-400">✕</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(GameInfo);