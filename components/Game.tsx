'use client';

import React, { useState, useEffect } from 'react';
import { useGameLogic } from '@/lib/useGameLogic';
import GameCanvas from './GameCanvas';
import { DefenseType, DEFENSE_STATS, setDifficulty } from '@/lib/gameTypes';
import { GameOverModal, WaveCompletedModal } from './GameModals';
import Leaderboard from './Leaderboard';
import { AnimatePresence } from 'framer-motion';
import StartScreen from './StartScreen';
import Score from './Score';
import MobileBottomBar from './MobileBottomBar';

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
        <StartScreen
          userName={userName}
          setUserName={setUserName}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          onStartGame={handleStartGame}
          onShowLeaderboard={handleShowLeaderboard}
        />
      ) : (
        <div className="w-full max-w-6xl">
          <Score 
            score={gameState.score}
            resources={gameState.player.resources}
            lives={gameState.player.lives}
            paused={gameState.paused}
            pauseGame={pauseGame}
          />
          {/* Main game container with sidebar layout - desktop version remains unchanged */}
          <div className="hidden md:flex md:flex-row gap-4">
            {/* Left side - Game info and controls */}
            <div className="w-full md:w-64 lg:w-80 order-1">
              
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
                    <span className="bg-gray-700 px-2 py-1 rounded mx-2 font-mono">U</span>: Upgrade |
                    <span className="bg-gray-700 px-2 py-1 rounded ml-2 font-mono">P</span>: Pause
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
            <MobileBottomBar 
              gameState={gameState}
              selectDefense={selectDefense}
            />
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
