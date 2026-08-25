import React from 'react';

export default function EvaluationPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Evaluation Suite</h1>
      <p className="text-gray-500 mb-8">Compare model performance against benchmarks and chat side-by-side.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow p-6 rounded-lg dark:bg-zinc-900">
          <h2 className="text-xl font-semibold mb-4">Benchmark Scores</h2>
          <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 rounded">
            <span className="text-gray-400">Radar Chart Placeholder</span>
          </div>
        </div>
        
        <div className="bg-white shadow p-6 rounded-lg dark:bg-zinc-900">
          <h2 className="text-xl font-semibold mb-4">Side-by-Side Chat</h2>
          <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 rounded">
             <span className="text-gray-400">Chat Comparison Placeholder</span>
          </div>
        </div>
      </div>
    </div>
  );
}
