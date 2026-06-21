// ============================================
// CHESS BOARD COMPONENT - Main board display
// ============================================

import React from 'react';
import Square from './Square';

const ChessBoard = ({ 
  board, 
  selectedSquare, 
  validMoves,
  lastMove,
  checkSquare,
  onSquareClick,
  isValidMoveTarget,
  isValidCapture
}) => {
  return (
    <div className="w-full aspect-square border-2 border-gray-800 rounded-lg overflow-hidden shadow-2xl">
      <div className="flex flex-wrap w-full h-full">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isSelected = selectedSquare && 
              selectedSquare[0] === rowIndex && 
              selectedSquare[1] === colIndex;

            const isValidMove = isValidMoveTarget(rowIndex, colIndex);
            const isCapture = isValidCapture(rowIndex, colIndex);

            const isLastMove = lastMove && (
              (lastMove.from[0] === rowIndex && lastMove.from[1] === colIndex) ||
              (lastMove.to[0] === rowIndex && lastMove.to[1] === colIndex)
            );

            const isCheck = checkSquare && 
              checkSquare[0] === rowIndex && 
              checkSquare[1] === colIndex;

            return (
              <Square
                key={`${rowIndex}-${colIndex}`}
                row={rowIndex}
                col={colIndex}
                piece={piece}
                isSelected={isSelected}
                isValidMove={isValidMove}
                isCapture={isCapture}
                isLastMove={isLastMove}
                isCheck={isCheck}
                onClick={() => onSquareClick(rowIndex, colIndex)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default React.memo(ChessBoard);