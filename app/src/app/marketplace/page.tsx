import React from 'react';

export default function MarketplacePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Marketplace & Leaderboard</h1>
      <p className="text-gray-500 mb-8">Discover and download top-rated community recipes and distilled models.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white shadow p-6 rounded-lg dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Community Recipe #{i}</h3>
              <span className="text-yellow-500">★ 4.{9 - i}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">A powerful recipe for reasoning and math.</p>
            <button className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition">
              Install Recipe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
