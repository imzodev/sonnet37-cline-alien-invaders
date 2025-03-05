import React from 'react';
import { DefenseType, DEFENSE_STATS } from '@/lib/gameTypes';

interface GameInfoProps {
  gameState: any; // Replace with actual type
  pauseGame: () => void;
  selectDefense: (defenseType: DefenseType | null) => void;
}

const GameInfo: React.FC<GameInfoProps> = ({ gameState, pauseGame, selectDefense }) => {
  // Helper function to format defense names
  const formatDefenseName = (type: DefenseType): string => {
    return type
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
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
            <span className="bg-gray-700 px-2 py-1 rounded mx-2 font-mono">U</span>: Upgrade |
            <span className="bg-gray-700 px-2 py-1 rounded ml-2 font-mono">P</span>: Pause
          </div>
        </div>
      </div>
    </div>
          
  );
};

export default GameInfo;
