import React from 'react';
import { motion } from 'framer-motion';
import { DIFFICULTY_LEVELS } from '@/lib/gameTypes';

interface StartScreenProps {
  userName: string;
  setUserName: (name: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  onStartGame: () => void;
  onShowLeaderboard: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({
  userName,
  setUserName,
  selectedDifficulty,
  setSelectedDifficulty,
  onStartGame,
  onShowLeaderboard,
}) => {
  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 max-w-md w-full border border-gray-700 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
          Sonnet 37 - Cline
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mb-6"></div>
        <p className="text-gray-300 mb-8 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
          Defend against waves of alien invaders by placing defenses and controlling your ship!
        </p>
      </motion.div>
      
      <motion.div 
        className="mb-6"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-gray-300 mb-2 font-medium">Enter Your Name:</label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Commander"
          className="w-full px-4 py-3 rounded-lg bg-gray-700/70 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          maxLength={20}
        />
      </motion.div>
      
      <motion.div 
        className="mb-8"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <label className="block text-gray-300 mb-3 font-medium">Select Difficulty:</label>
        <div className="grid grid-cols-3 gap-3">
          {Object.keys(DIFFICULTY_LEVELS).map(difficulty => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`py-3 px-4 rounded-lg font-medium transition-all ${
                selectedDifficulty === difficulty
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105 transform'
                  : 'bg-gray-700/80 text-gray-200 hover:bg-gray-600/80'
              }`}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>
      
      <motion.div 
        className="flex flex-col gap-4"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={onStartGame}
          className={`bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-lg transition-all text-lg font-medium shadow-lg flex items-center justify-center ${
            !userName.trim() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!userName.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Start Game
        </button>
        <button
          onClick={onShowLeaderboard}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg transition-all font-medium shadow-lg flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
          View Leaderboard
        </button>
      </motion.div>
    </motion.div>
  );
};

export default StartScreen;
