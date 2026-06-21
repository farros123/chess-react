// ============================================
// SQUARE COMPONENT - Individual chess square
// ============================================

import React from 'react';
import { PIECES } from '../utils/chessLogic';

const Square = ({ 
  row, 
  col, 
  piece, 
  isSelected, 
  isValidMove, 
  isCapture,
  isLastMove,
  isCheck,
  onClick 
}) => {
  // Determine square color (light/dark)
  const isLight = (row + col) % 2 === 0;

  // Build className dynamically
  const getClassName = () => {
    const classes = ['square'];

    classes.push(isLight ? 'square-light' : 'square-dark');

    if (isSelected) {
      classes.push('square-selected');
    }

    if (isValidMove) {
      if (isCapture) {
        classes.push('valid-capture-ring');
      } else {
        classes.push('valid-move-dot');
      }
    }

    if (isLastMove) {
      classes.push('ring-2 ring-yellow-400 ring-inset');
    }

    if (isCheck) {
      classes.push('animate-pulse bg-red-500/40');
    }

    return classes.join(' ');
  };

  return (
    <div 
      className={getClassName()}
      onClick={onClick}
      role="button"
      aria-label={`Square ${String.fromCharCode(97 + col)}${8 - row}`}
    >
      {piece && (
        <span className="piece">
          {PIECES[piece]}
        </span>
      )}
    </div>
  );
};

export default React.memo(Square);