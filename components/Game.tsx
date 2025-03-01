'use client';

import React, { useState, useEffect } from 'react';
import { useGameLogic } from '@/lib/useGameLogic';
import GameCanvas from './GameCanvas';
import { DefenseType, DEFENSE_STATS, DIFFICULTY_LEVELS, setDifficulty } from '@/lib/gameTypes';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
          {/* Main game container with sidebar layout - desktop version remains unchanged */}
          <div className="hidden md:flex md:flex-row gap-4">
            {/* Left side - Game info and controls */}
            <div className="w-full md:w-64 lg:w-80 order-1">
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
            <div className="w-full md:flex-1 order-2">
              <div className="border border-gray-700/50 rounded-lg overflow-hidden shadow-2xl">
                <GameCanvas 
                  gameState={gameState} 
                  onCanvasClick={handleCanvasClick}
                  explosionEffects={explosionEffects}
                />
              </div>
            </div>
          </div>

          {/* MOBILE VERSION - Complete redesign with bottom drawer and minimalistic UI */}
          <div className="flex flex-col md:hidden">
            {/* Mobile Top Bar */}
            <div className="flex justify-between items-center bg-gray-900/90 p-2 rounded-t-lg border-b border-gray-700 backdrop-blur-sm mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white">Score: <span className="text-blue-400">{gameState.score}</span></span>
              </div>
              <div className="flex space-x-2">
                <div className="bg-gray-800 px-2 py-1 rounded-md flex items-center">
                  <span className="text-yellow-400 font-bold">{gameState.player.resources}</span>
                  <span className="text-yellow-600 ml-1">💰</span>
                </div>
                <div className="bg-gray-800 px-2 py-1 rounded-md flex items-center">
                  <span className="text-red-500 font-bold">{gameState.player.lives}</span>
                  <span className="text-red-600 ml-1">❤️</span>
                </div>
                <button
                  className="bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center"
                  onClick={pauseGame}
                >
                  {gameState.paused ? 
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-400">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                    : 
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                      <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                    </svg>
                  }
                </button>
              </div>
            </div>
            
            {/* Mobile Game Canvas Container */}
            <div className="relative">
              <div className="border border-gray-700/50 rounded-lg overflow-hidden shadow-2xl">
                <GameCanvas 
                  gameState={gameState} 
                  onCanvasClick={handleCanvasClick}
                  explosionEffects={explosionEffects}
                />
              </div>
              
              {/* Wave info pill - floating over the game */}
              <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-white text-sm flex items-center space-x-2 ${
                gameState.currentWave.bossWave ? 'bg-red-900/80 border border-red-500/50' : 'bg-gray-800/80 border border-gray-700/50'
              }`}>
                <span className="font-bold">Wave {gameState.waveNumber}</span>
                {gameState.currentWave.bossWave && (
                  <span className="text-red-400 animate-pulse">BOSS</span>
                )}
              </div>

              {/* Removed the touch controls from here - they will be at the bottom */}
            </div>
            
            {/* Mobile Bottom Bar - Always visible with essential controls */}
            <div className="bg-gray-900/90 p-3 rounded-b-lg border-t border-gray-700 backdrop-blur-sm mt-2">
              {/* Defense selection as horizontal scrollable bar */}
              <div className="flex overflow-x-auto pb-2 hide-scrollbar">
                {Object.values(DefenseType).map((type, index) => {
                  const stats = DEFENSE_STATS[type];
                  const isSelected = gameState.selectedDefense === type;
                  const canAfford = gameState.player.resources >= stats.cost;
                  const keyNumber = index + 1;

                  return (
                    <button
                      key={type}
                      className={`relative p-2 rounded-lg transition-all flex-shrink-0 mr-2 w-16 ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg transform scale-105'
                          : canAfford
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-800 opacity-50 cursor-not-allowed'
                      } border ${isSelected ? 'border-blue-400' : 'border-gray-600'}`}
                      onClick={() => {
                        if (!canAfford) return;
                        
                        // For mobile, directly place the defense at player position when tapped
                        // This makes it easier to play on mobile without having to select then place
                        if (window.innerWidth < 768) {
                          // First select the defense
                          selectDefense(type);
                          
                          // Then simulate pressing the corresponding number key to place it
                          const keyNumber = (index + 1).toString();
                          const event = new KeyboardEvent('keydown', { key: keyNumber });
                          window.dispatchEvent(event);
                          
                          // Then release the key
                          setTimeout(() => {
                            const releaseEvent = new KeyboardEvent('keyup', { key: keyNumber });
                            window.dispatchEvent(releaseEvent);
                          }, 100);
                        } else {
                          // On desktop, just toggle selection as before
                          selectDefense(isSelected ? null : type);
                        }
                      }}
                      disabled={!canAfford}
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-md ${
                            type === DefenseType.BASIC_TURRET
                              ? 'bg-green-500'
                              : type === DefenseType.LASER
                              ? 'bg-blue-500'
                              : type === DefenseType.SHIELD
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          } mb-1`}
                        />
                        <div className="text-xs text-white font-medium">({keyNumber})</div>
                        <div className="text-yellow-400 text-xs mt-1 bg-gray-900/50 px-2 py-1 rounded-full inline-block">{stats.cost}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mobile touch controls */}
              <div className="flex justify-between items-center mt-3">
                {/* Left movement button */}
                <button 
                  className="w-16 h-16 bg-blue-500/40 rounded-full flex items-center justify-center border-2 border-blue-400/60 backdrop-blur-sm"
                  onTouchStart={() => {
                    // Simulate left arrow key press
                    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
                    window.dispatchEvent(event);
                  }}
                  onTouchEnd={() => {
                    // Simulate key release
                    const event = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
                    window.dispatchEvent(event);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Shoot button */}
                <button 
                  className="w-20 h-20 bg-red-500/40 rounded-full flex items-center justify-center border-2 border-red-400/60 backdrop-blur-sm"
                  onTouchStart={() => {
                    // Simulate spacebar press
                    const event = new KeyboardEvent('keydown', { key: ' ' });
                    window.dispatchEvent(event);
                  }}
                  onTouchEnd={() => {
                    // Simulate key release
                    const event = new KeyboardEvent('keyup', { key: ' ' });
                    window.dispatchEvent(event);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>

                {/* Right movement button */}
                <button 
                  className="w-16 h-16 bg-blue-500/40 rounded-full flex items-center justify-center border-2 border-blue-400/60 backdrop-blur-sm"
                  onTouchStart={() => {
                    // Simulate right arrow key press
                    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
                    window.dispatchEvent(event);
                  }}
                  onTouchEnd={() => {
                    // Simulate key release
                    const event = new KeyboardEvent('keyup', { key: 'ArrowRight' });
                    window.dispatchEvent(event);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Mobile action buttons for repair and upgrade */}
              <div className="flex justify-center gap-4 mt-3">
                <button
                  className="flex-1 bg-green-600/80 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                  onClick={() => {
                    // Simulate pressing the R key
                    const event = new KeyboardEvent('keydown', { key: 'r' });
                    window.dispatchEvent(event);
                    
                    // Release the key
                    setTimeout(() => {
                      const releaseEvent = new KeyboardEvent('keyup', { key: 'r' });
                      window.dispatchEvent(releaseEvent);
                    }, 100);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Repair
                </button>
                
                <button
                  className="flex-1 bg-purple-600/80 hover:bg-purple-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                  onClick={() => {
                    // Simulate pressing the U key
                    const event = new KeyboardEvent('keydown', { key: 'u' });
                    window.dispatchEvent(event);
                    
                    // Release the key
                    setTimeout(() => {
                      const releaseEvent = new KeyboardEvent('keyup', { key: 'u' });
                      window.dispatchEvent(releaseEvent);
                    }, 100);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Upgrade
                </button>
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

      {/* Add global CSS for hiding scrollbars while preserving functionality */}
      <style jsx global>{`
        .hide-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  );
};

export default Game;