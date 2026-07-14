import { useState, useEffect, useRef, useCallback } from 'react';

interface StockfishResponse {
  bestMove: string | null;
  evaluation: number | null; // Centipawns หรือ Mate
  isMate: boolean;
}

export function useStockfish(depth: number = 15) {
  const workerRef = useRef<Worker | null>(null);
  const [engineState, setEngineState] = useState<StockfishResponse>({
    bestMove: null,
    evaluation: null,
    isMate: false,
  });
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  useEffect(() => {
    // กำหนดพาธไปยังไฟล์ stockfish.js ในโฟลเดอร์ public
    workerRef.current = new Worker('/stockfish/stockfish.js');

    workerRef.current.onmessage = (event: MessageEvent) => {
      const message: string = event.data;

      // ดึงข้อมูล Evaluation
      if (message.startsWith('info depth') && message.includes('score')) {
        const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
        if (scoreMatch) {
          const type = scoreMatch[1];
          const value = parseInt(scoreMatch[2], 10);
          
          setEngineState(prev => ({
            ...prev,
            evaluation: type === 'cp' ? value / 100 : value,
            isMate: type === 'mate'
          }));
        }
      }

      // ดึงข้อมูล Best Move
      if (message.startsWith('bestmove')) {
        const moveMatch = message.split(' ')[1];
        setEngineState(prev => ({
          ...prev,
          bestMove: moveMatch
        }));
        setIsCalculating(false);
      }
    };

    // ส่งคำสั่งเริ่มต้นให้ Engine พร้อมทำงาน
    workerRef.current.postMessage('uci');
    workerRef.current.postMessage('isready');

    // Cleanup function: ปิด Worker เมื่อ Component ถูก Unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage('quit');
        workerRef.current.terminate();
      }
    };
  }, []);

  const analyzePosition = useCallback((fen: string) => {
    if (workerRef.current) {
      setIsCalculating(true);
      workerRef.current.postMessage(`position fen ${fen}`);
      workerRef.current.postMessage(`go depth ${depth}`);
    }
  }, [depth]);

  return { ...engineState, isCalculating, analyzePosition };
}