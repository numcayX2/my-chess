// components/EvalBar.tsx
import React from 'react';

interface EvalBarProps {
  evaluation: number | null; // ค่าคะแนนเป็นเบี้ย (Pawns) เช่น +1.5, -0.8
  isMate: boolean; // มีการบังคับรุกฆาตหรือไม่
}

export default function EvalBar({ evaluation, isMate }: EvalBarProps) {
  // คำนวณความสูงของแถบสีขาว (0 ถึง 100%)
  // สมมติว่าคะแนน +5 ถือว่าขาวชนะขาด (100%), -5 คือดำชนะขาด (0%)
  let whitePercentage = 50; 

  if (isMate) {
    whitePercentage = evaluation && evaluation > 0 ? 100 : 0;
  } else if (evaluation !== null) {
    // แปลงคะแนนให้อยู่ในขอบเขต 0-100% โดยใช้สูตรแบบง่าย
    const cappedEval = Math.max(-5, Math.min(5, evaluation));
    whitePercentage = 50 + (cappedEval * 10);
  }

  return (
    <div className="w-8 h-[600px] bg-gray-800 rounded-md overflow-hidden flex flex-col justify-end border border-gray-600 relative">
      {/* แถบสีขาว */}
      <div 
        className="w-full bg-white transition-all duration-500 ease-in-out"
        style={{ height: `${whitePercentage}%` }}
      />
      
      {/* ตัวเลขแสดงคะแนน */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`text-xs font-bold ${whitePercentage > 50 ? 'text-gray-800' : 'text-white'}`}>
          {isMate ? `M${Math.abs(evaluation || 0)}` : (evaluation !== null ? Math.abs(evaluation).toFixed(1) : '0.0')}
        </span>
      </div>
    </div>
  );
}