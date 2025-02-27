'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveScore } from '@/lib/supabase';

interface GameOverModalProps {
  score: number;
  onRestart: () => void;
  onMainMenu: () => void;
  difficulty?: string;
  userName?: string;
  setUserName?: (name: string) => void;
  onShowLeaderboard?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  onRestart,
  onMainMenu,
  difficulty = 'normal',
  userName = '',
  setUserName = () => {},
  onShowLeaderboard = () => {},
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localUserName, setLocalUserName] = useState(userName);
  const autoSaveAttemptedRef = useRef(false);

  useEffect(() => {
    if (userName) {
      setLocalUserName(userName);
    }
  }, [userName]);

  useEffect(() => {
    if (autoSaveAttemptedRef.current) {
      return;
    }

    const autoSaveScore = async () => {
      if (userName && !saved && !isSaving) {
        try {
          autoSaveAttemptedRef.current = true;
          console.log(`Auto-saving score for ${userName}: ${score}`);
          setIsSaving(true);
          const result = await saveScore(userName, score, difficulty);
          setSaved(true);
          console.log(`Score auto-save result:`, result);
        } catch (err) {
          console.error('Error auto-saving score:', err);
        } finally {
          setIsSaving(false);
        }
      }
    };

    if (userName && !saved && !isSaving && userName === localUserName) {
      autoSaveScore();
    }
  }, []);

  const handleSaveScore = async () => {
    if (saved || isSaving) {
      return;
    }
    
    if (!localUserName.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      setIsSaving(true);
      autoSaveAttemptedRef.current = true;
      const result = await saveScore(localUserName, score, difficulty);
      setSaved(true);
      if (setUserName) {
        setUserName(localUserName);
      }
      console.log(`Score manual save result:`, result);
    } catch (err) {
      console.error('Error saving score:', err);
      setError('Failed to save score. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = () => {
    console.log('Play Again button clicked');
    onRestart();
  };

  const handleViewLeaderboard = () => {
    console.log('View Leaderboard button clicked');
    onShowLeaderboard();
  };

  const handleMainMenu = () => {
    console.log('Main Menu button clicked');
    onMainMenu();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      key="gameOverModal"
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 w-full max-w-md border border-gray-700 shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="text-center">
          <motion.h2 
            className="text-3xl font-bold text-white mb-2"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Game Over
          </motion.h2>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="mb-6"
          >
            <p className="text-gray-300 mb-2">Your final score:</p>
            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 mb-4">
              {score.toLocaleString()}
            </p>
            
            <div className="inline-block px-4 py-1 bg-purple-900/50 rounded-full mb-6">
              <p className="text-purple-300">
                Difficulty: <span className="font-bold text-purple-200">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {!saved ? (
            <div className="mb-6">
              {userName ? (
                <div className="text-center mb-4">
                  <p className="text-gray-300">
                    Saving score for <span className="font-bold text-blue-400">{userName}</span>...
                  </p>
                </div>
              ) : (
                <>
                  <label className="block text-gray-300 mb-2">Enter your name to save score:</label>
                  <input
                    type="text"
                    value={localUserName}
                    onChange={(e) => setLocalUserName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Your name"
                    maxLength={20}
                  />
                  {error && (
                    <p className="text-red-400 mt-2 text-sm">{error}</p>
                  )}
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handleSaveScore}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg transition-all disabled:opacity-50 font-medium shadow-lg"
                    >
                      {isSaving ? 'Saving...' : 'Save Score'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="mb-6 text-center">
              <div className="inline-block px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-lg mb-4">
                <p className="text-green-400">Score saved successfully!</p>
              </div>
              {userName && (
                <p className="text-gray-300 text-center mb-4">
                  Player: <span className="font-bold text-blue-400">{userName}</span>
                </p>
              )}
            </div>
          )}
        </motion.div>

        <motion.div 
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={handleRestart}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg transition-colors font-medium shadow-lg flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Play Again
          </button>
          
          <button
            onClick={handleViewLeaderboard}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg transition-colors font-medium shadow-lg flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
            Leaderboard
          </button>
          
          <button
            onClick={handleMainMenu}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-lg transition-colors font-medium shadow-lg col-span-1 sm:col-span-2 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Main Menu
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

interface WaveCompletedModalProps {
  waveNumber: number;
  onNextWave: () => void;
}

export const WaveCompletedModal: React.FC<WaveCompletedModalProps> = ({
  waveNumber,
  onNextWave,
}) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      key="waveCompletedModal"
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 w-full max-w-md border border-gray-700 shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
            Wave {waveNumber} Completed!
          </h2>
          
          <div className="px-4 py-4 bg-blue-900/20 border border-blue-500/20 rounded-lg mb-6">
            <p className="text-blue-300">
              Get ready for the next wave of enemies.
            </p>
          </div>
          
          <motion.div 
            className="text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={onNextWave}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg transition-all font-medium shadow-lg flex items-center justify-center mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start Next Wave
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};