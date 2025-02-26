'use client';

import React, { useState, useEffect } from 'react';
import { useGameLogic } from '@/lib/useGameLogic';
import GameCanvas from './GameCanvas';
import { DefenseType, DEFENSE_STATS, DIFFICULTY_LEVELS, setDifficulty } from '@/lib/gameTypes';
import GameUI from './GameUI';
import { GameOverModal, WaveCompletedModal } from './GameModals';
import Leaderboard from './Leaderboard';
import { AnimatePresence, motion } from 'framer-motion';

const Game: React.FC = () => {
  const { 
    gameState, 
    isRunning, 
    waveCompleted,
    userName,
    setUserName,
    startGame, 
    pauseGame, 
    endGame, 
    selectDefense, 
    placeDefense,
    startNextWave,
    explosionEffects,
    setGameState
  } = useGameLogic();
  
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('normal');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  
  const handleCanvasClick = (x: number, y: number) => {
    if (gameState.selectedDefense) {
      placeDefense(x, y);
    }
  };
  
  // Apply difficulty setting
  useEffect(() => {
    setDifficulty(selectedDifficulty);
  }, [selectedDifficulty]);

  // Load username from localStorage on initial load
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      const savedUserName = localStorage.getItem('cline_username');
      if (savedUserName) {
        setUserName(savedUserName);
        console.log('Username loaded from localStorage:', savedUserName);
      }
    }
  }, [setUserName]);

  // Save username to localStorage whenever it changes
  useEffect(() => {
    if (userName && typeof window !== 'undefined') {
      localStorage.setItem('cline_username', userName);
      console.log('Username saved to localStorage:', userName);
    }
  }, [userName]);

  // Debug username changes
  useEffect(() => {
    console.log('Current username in Game component:', userName);
  }, [userName]);

  const handleStartGame = () => {
    setShowStartScreen(false);
    startGame();
  };

  const handleRestartGame = () => {
    console.log('Restart game requested');
    
    // First, make sure we're not showing the leaderboard
    setShowLeaderboard(false);
    
    // Increment the modal key to force unmounting
    setModalKey(prev => prev + 1);
    
    // Request a restart with a slight delay to ensure the modal is gone
    setTimeout(() => {
      // Force the game state to reset
      setGameState(prevState => ({
        ...prevState,
        gameOver: false
      }));
      
      // Then start the game again after another short delay
      setTimeout(() => {
        startGame();
        console.log('Game restarted with complete reset');
      }, 50);
    }, 50);
  };

  const handleShowLeaderboard = () => {
    // Make sure the leaderboard is visible
    setShowLeaderboard(true);
    console.log('Showing leaderboard');
  };

  const handleCloseLeaderboard = () => {
    setShowLeaderboard(false);
    console.log('Hiding leaderboard');
  };

  // Helper function to format defense names
  const formatDefenseName = (type: DefenseType): string => {
    return type
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      {showStartScreen ? (
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
              onClick={handleStartGame}
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
              onClick={handleShowLeaderboard}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg transition-all font-medium shadow-lg flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              View Leaderboard
            </button>
          </motion.div>
        </motion.div>
      ) : (
        <div className="w-full max-w-6xl">
          {/* Main game container with sidebar layout */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left side - Game info and controls */}
            <div className="w-full md:w-64 lg:w-80 order-1 md:order-1">
              {/* Game stats */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 mb-3 border border-gray-700/50 shadow-lg">
                <div className="flex flex-col text-white">
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-bold text-xl">Score: <span className="text-blue-400">{gameState.score}</span></div>
                    <button
                      className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md text-sm transition-colors"
                      onClick={pauseGame}
                    >
                      {gameState.paused ? 'Resume' : 'Pause'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-700/50 p-2 rounded-lg">
                      <span className="text-gray-400">Resources:</span>
                      <span className="font-bold text-yellow-400 ml-1">{gameState.player.resources}</span>
                    </div>
                    <div className="bg-gray-700/50 p-2 rounded-lg">
                      <span className="text-gray-400">Lives:</span>
                      <span className="font-bold text-red-500 ml-1">{gameState.player.lives}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Wave information */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 mb-3 border border-gray-700/50 shadow-lg">
                <div className={`${gameState.currentWave.bossWave ? 'border-l-4 border-red-500 pl-2' : ''}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white text-lg">Wave {gameState.waveNumber}</h3>
                    {gameState.currentWave.bossWave && (
                      <span className="text-red-500 font-bold text-sm px-2 py-1 bg-red-900/30 rounded-full animate-pulse">BOSS</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 mt-1">
                    {gameState.currentWave.name}
                  </p>
                  <p className="text-sm text-gray-400 mt-2 bg-gray-700/30 px-2 py-1 rounded inline-block">
                    Enemies: {gameState.currentWave.enemies.length + gameState.enemies.length}
                  </p>
                </div>
              </div>
              
              {/* Defense selection */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 mb-3 border border-gray-700/50 shadow-lg">
                <h3 className="text-white font-bold mb-3 text-lg">Defenses (1-4)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(DefenseType).map((type, index) => {
                    const stats = DEFENSE_STATS[type];
                    const isSelected = gameState.selectedDefense === type;
                    const canAfford = gameState.player.resources >= stats.cost;
                    const keyNumber = index + 1;

                    return (
                      <button
                        key={type}
                        className={`relative p-3 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg transform scale-105'
                            : canAfford
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-800 opacity-50 cursor-not-allowed'
                        } border ${isSelected ? 'border-blue-400' : 'border-gray-600'}`}
                        onClick={() => canAfford && selectDefense(isSelected ? null : type)}
                        disabled={!canAfford}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-8 h-8 rounded-md ${
                              type === DefenseType.BASIC_TURRET
                                ? 'bg-green-500'
                                : type === DefenseType.LASER
                                ? 'bg-blue-500'
                                : type === DefenseType.SHIELD
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                          />
                          <div className="text-xs text-white bg-gray-900 px-2 py-1 rounded-full font-bold">{keyNumber}</div>
                        </div>
                        <div className="text-white text-xs mt-2 font-medium">{formatDefenseName(type)}</div>
                        <div className="text-yellow-400 text-xs mt-1 bg-gray-900/50 px-2 py-1 rounded-full inline-block">{stats.cost}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Controls help */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 text-gray-300 text-sm border border-gray-700/50 shadow-lg">
                <h3 className="text-white font-bold mb-2 text-lg">Controls</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="bg-gray-700 px-2 py-1 rounded mr-2 font-mono">←→</span> or 
                    <span className="bg-gray-700 px-2 py-1 rounded mx-2 font-mono">A/D</span>: Move ship
                  </div>
                  <div className="flex items-center">
                    <span className="bg-gray-700 px-2 py-1 rounded mr-2 font-mono">SPACE</span>: Shoot
                  </div>
                  <div className="flex items-center">
                    <span className="bg-gray-700 px-2 py-1 rounded mr-2 font-mono">1-4</span>: Place defenses
                  </div>
                  <div className="flex items-center">
                    <span className="bg-gray-700 px-2 py-1 rounded mr-2 font-mono">R</span>: Repair | 
                    <span className="bg-gray-700 px-2 py-1 rounded mx-2 font-mono">U</span>: Upgrade
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Game canvas */}
            <div className="w-full md:flex-1 order-2 md:order-2">
              <div className="border border-gray-700/50 rounded-lg overflow-hidden shadow-2xl">
                <GameCanvas 
                  gameState={gameState} 
                  onCanvasClick={handleCanvasClick}
                  explosionEffects={explosionEffects}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {gameState.gameOver && !showStartScreen && (
          <GameOverModal
            key={`gameOverModal-${modalKey}`}
            score={gameState.score}
            onRestart={handleRestartGame}
            onMainMenu={() => setShowStartScreen(true)}
            onShowLeaderboard={handleShowLeaderboard}
            difficulty={selectedDifficulty}
            userName={userName}
            setUserName={setUserName}
          />
        )}
        
        {waveCompleted && !gameState.gameOver && !showStartScreen && (
          <WaveCompletedModal
            key="waveCompletedModal"
            waveNumber={gameState.waveNumber}
            onNextWave={startNextWave}
          />
        )}
        
        {showLeaderboard && (
          <Leaderboard 
            key="leaderboardModal"
            onClose={handleCloseLeaderboard} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Game;