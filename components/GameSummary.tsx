// components/GameSummary.tsx
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';

export interface MoveHistoryItem {
  moveNumber: number;
  san: string; 
  evaluation: number;
  classification: string;
}

interface GameSummaryProps {
  history: MoveHistoryItem[];
}

export default function GameSummary({ history }: GameSummaryProps) {
  // Calculate aggregate statistics
  const blunders = history.filter(h => h.classification === 'Blunder').length;
  const mistakes = history.filter(h => h.classification === 'Mistake').length;
  const greatMoves = history.filter(h => h.classification === 'Great Move').length;

  // Cap the evaluation at +10 and -10 so the chart does not look distorted during a forced mate
  const chartData = history.map(h => ({
    ...h,
    cappedEval: Math.max(-10, Math.min(10, h.evaluation))
  }));

  if (history.length === 0) {
    return null; // Do not render anything if the game has not started
  }

  return (
    <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Post-Game Analysis</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-red-800 text-sm font-semibold uppercase">Blunders</div>
          <div className="text-3xl font-bold text-red-600">{blunders}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-orange-800 text-sm font-semibold uppercase">Mistakes</div>
          <div className="text-3xl font-bold text-orange-600">{mistakes}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-green-800 text-sm font-semibold uppercase">Great Moves</div>
          <div className="text-3xl font-bold text-green-600">{greatMoves}</div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="moveNumber" />
            <YAxis domain={[-10, 10]} />
            <Tooltip 
              formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : '', 'Evaluation']}
              labelFormatter={(label) => `Move ${label}`}
            />
            {/* The zero line represents a perfectly equal position */}
            <ReferenceLine y={0} stroke="#000" strokeOpacity={0.2} />
            <Line 
              type="monotone" 
              dataKey="cappedEval" 
              stroke="#4f46e5" 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}