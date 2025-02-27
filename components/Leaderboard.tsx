'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getTopScores, Score } from '@/lib/supabase';

interface LeaderboardProps {
  onClose: () => void;
}

// Difficulty levels for tabs
const DIFFICULTY_LEVELS = ['easy', 'normal', 'hard'];

const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('normal'); // Default to normal difficulty

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        const topScores = await getTopScores(10, activeTab); // Pass the active difficulty
        setScores(topScores);
      } catch (err) {
        console.error('Error fetching scores:', err);
        setError('Failed to load leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [activeTab]); // Re-fetch when tab changes

  // Function to render rank with emojis for top 3
  const renderRank = (index: number) => {
    switch (index) {
      case 0:
        return <span role="img" aria-label="Gold Medal">🥇</span>;
      case 1:
        return <span role="img" aria-label="Silver Medal">🥈</span>;
      case 2:
        return <span role="img" aria-label="Bronze Medal">🥉</span>;
      default:
        return index + 1;
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      key="leaderboardModal"
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Difficulty tabs */}
        <div className="flex mb-4 border-b border-gray-700">
          {DIFFICULTY_LEVELS.map((difficulty) => (
            <button
              key={difficulty}
              className={`px-4 py-2 text-sm font-medium capitalize ${
                activeTab === difficulty
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab(difficulty)}
            >
              {difficulty}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-400">Loading scores...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : scores.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No scores yet for {activeTab} difficulty. Be the first to play!
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-300">Rank</th>
                  <th className="px-4 py-2 text-left text-gray-300">Player</th>
                  <th className="px-4 py-2 text-right text-gray-300">Score</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  <motion.tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'
                    } hover:bg-gray-700`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="px-4 py-3 text-gray-300">{renderRank(index)}</td>
                    <td className="px-4 py-3 text-white font-medium">
                      {score.user_name}
                    </td>
                    <td className="px-4 py-3 text-right text-yellow-400 font-bold">
                      {score.score.toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Leaderboard;
