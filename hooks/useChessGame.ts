import { useState, useCallback } from 'react';
import { Chess, Move } from 'chess.js';

export function useChessGame() {
  // Initialize a new chess game
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [lastMove, setLastMove] = useState<Move | null>(null);

  const makeMove = useCallback((moveInfo: { from: string; to: string; promotion?: string }) => {
    try {
      // Create a copy of the game to mutate (React requires new references for state updates)
      const gameCopy = new Chess(game.fen());
      
      // Attempt the move. If invalid, chess.js will throw an error or return null.
      const result = gameCopy.move(moveInfo);

      if (result) {
        setGame(gameCopy);
        setFen(gameCopy.fen());
        setLastMove(result);
        return true; // Move was successful
      }
    } catch (error) {
      return false; // Move was invalid
    }
    return false;
  }, [game]);

  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setLastMove(null);
  }, []);

  return { game, fen, lastMove, makeMove, resetGame };
}