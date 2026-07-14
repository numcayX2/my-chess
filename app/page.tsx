"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { useChessGame } from '../hooks/useChessGame';
import { useStockfish } from '../hooks/useStockfish';
import EvalBar from '../components/EvalBar';
import AdvicePanel from '../components/AdvicePanel';
import { calculateEvalDelta, classifyMove } from '../lib/moveClassifier';
import GameSummary, { MoveHistoryItem } from '../components/GameSummary';

export default function ChessCoachApp() {
  const { game, fen, lastMove, makeMove } = useChessGame();
  const { evaluation, isMate, bestMove, isCalculating, analyzePosition } = useStockfish();
  const [moveHistory, setMoveHistory] = useState<MoveHistoryItem[]>([]);
  const [coachAdvice, setCoachAdvice] = useState<string>('');
  const [isCoachLoading, setIsCoachLoading] = useState<boolean>(false);
  
  // Track the evaluation before the move was made. Standard starting eval is roughly +0.2.
  const prevEvalRef = useRef<number>(0.2);

  useEffect(() => {
    analyzePosition(fen);
  }, [fen, analyzePosition]);

  useEffect(() => {
    async function fetchAdvice() {
      // Ensure calculation is done and we have valid data
      if (isCalculating || !lastMove || evaluation === null) return;

      // game.turn() returns the color to move NEXT. 
      // So the color that JUST moved is the opposite.
      const colorThatMoved = game.turn() === 'w' ? 'b' : 'w';
      
      const delta = calculateEvalDelta({
        evalBefore: prevEvalRef.current,
        evalAfter: evaluation,
        colorThatMoved
      });

      const moveClassification = classifyMove(delta);
      
      setMoveHistory(prev => [
        ...prev,
        {
          moveNumber: prev.length + 1,
          san: lastMove.san,
          evaluation: evaluation,
          classification: moveClassification
        }
      ]);

      setIsCoachLoading(true);
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fen,
            lastMove: lastMove.san,
            evaluationDelta: delta,
            moveClassification,
            bestMove
          }),
        });
        
        const data = await response.json();
        setCoachAdvice(data.advice);
        
        // Update the previous evaluation reference for the next turn
        prevEvalRef.current = evaluation;
        
      } catch (error) {
        console.error('Error fetching advice', error);
      } finally {
        setIsCoachLoading(false);
      }
    }

    fetchAdvice();
  }, [isCalculating, fen, lastMove, evaluation, bestMove, game]);

  function onDrop(sourceSquare: string, targetSquare: string) {
    return makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', 
    });
  }

  return (
    <div className="flex h-screen bg-gray-100 p-8">
      <div className="flex-none mr-8">
        <EvalBar evaluation={evaluation} isMate={isMate} />
      </div>

      <div className="flex-grow max-w-2xl flex items-center justify-center">
        <div className="w-full shadow-2xl rounded-sm overflow-hidden">
          <Chessboard {...({ position: fen, onPieceDrop: onDrop } as any)} />
        </div>
      </div>

      <div className="flex-none w-96 ml-8">
        <AdvicePanel advice={coachAdvice} isLoading={isCoachLoading} />
      </div>
    </div>
  );
}