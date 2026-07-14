// components/AdvicePanel.tsx
import React from 'react';

interface AdvicePanelProps {
  advice: string;
  isLoading: boolean;
}

export default function AdvicePanel({ advice, isLoading }: AdvicePanelProps) {
  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="bg-indigo-600 text-white p-4 font-bold flex items-center gap-2">
        <span>🤖</span>
        <h2>AI Coach (โค้ชหมากรุก)</h2>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">โค้ชกำลังวิเคราะห์ตาเดินของคุณ...</p>
          </div>
        ) : advice ? (
          <div className="prose prose-sm text-gray-800 leading-relaxed">
            <p>{advice}</p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 italic text-center">
            เดินหมากตาแรกของคุณ<br/>เพื่อรับคำแนะนำจากโค้ชได้เลยครับ!
          </div>
        )}
      </div>
    </div>
  );
}