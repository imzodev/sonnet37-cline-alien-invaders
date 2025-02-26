'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DefenseType, DEFENSE_STATS } from '@/lib/gameTypes';

interface GameUIProps {
  score: number;
  resources: number;
  lives: number;
  waveNumber: number;
  selectedDefense: DefenseType | null;
  onSelectDefense: (type: DefenseType | null) => void;
  onPause: () => void;
  isRunning: boolean;
  difficulty?: string;
  waveName?: string;
  isBossWave?: boolean;
  enemiesRemaining?: number;
  isPaused?: boolean;
}

const GameUI: React.FC<GameUIProps> = ({
  score,
  resources,
  lives,
  waveNumber,
  selectedDefense,
  onSelectDefense,
  onPause,
  isRunning,
  difficulty = 'normal',
  waveName,
  isBossWave,
  enemiesRemaining = 0,
  isPaused = false,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Game stats */}
      <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg text-white">
        <div className="flex gap-6">
          <div>
            <span className="text-gray-400 mr-2">Score:</span>
            <span className="font-bold">{score}</span>
          </div>
          <div>
            <span className="text-gray-400 mr-2">Resources:</span>
            <span className="font-bold text-yellow-400">{resources}</span>
          </div>
          <div>
            <span className="text-gray-400 mr-2">Lives:</span>
            <span className="font-bold text-red-500">{lives}</span>
          </div>
          <div>
            <span className="text-gray-400 mr-2">Wave:</span>
            <span className="font-bold text-blue-400">{waveNumber}</span>
          </div>
          <div>
            <span className="text-gray-400 mr-2">Difficulty:</span>
            <span className="font-bold text-purple-400">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          </div>
        </div>
        <button
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md"
          onClick={onPause}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      {/* Wave information */}
      {waveName && (
        <div className={`bg-gray-800 p-4 rounded-lg text-white ${isBossWave ? 'border-2 border-red-500' : ''}`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">
                {waveName} {isBossWave && <span className="text-red-500">(Boss Wave!)</span>}
              </h3>
              <p className="text-sm text-gray-400">Enemies Remaining: {enemiesRemaining}</p>
            </div>
            {isBossWave && (
              <div className="animate-pulse">
                <span className="text-red-500 font-bold">⚠️ DANGER ⚠️</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Defense selection */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-white mb-2 font-bold">Defenses</h3>
        <div className="flex gap-4">
          {Object.values(DefenseType).map((type) => {
            const stats = DEFENSE_STATS[type];
            const isSelected = selectedDefense === type;
            const canAfford = resources >= stats.cost;

            return (
              <motion.button
                key={type}
                className={`relative p-2 rounded-md ${
                  isSelected
                    ? 'bg-blue-600'
                    : canAfford
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-700 opacity-50 cursor-not-allowed'
                }`}
                whileTap={{ scale: 0.95 }}
                onClick={() => canAfford && onSelectDefense(isSelected ? null : type)}
                disabled={!canAfford}
              >
                <div
                  className={`w-12 h-12 ${
                    type === DefenseType.BASIC_TURRET
                      ? 'bg-green-500'
                      : type === DefenseType.LASER
                      ? 'bg-blue-500'
                      : type === DefenseType.SHIELD
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                />
                <div className="text-white text-xs mt-1">{formatDefenseName(type)}</div>
                <div className="text-yellow-400 text-xs">{stats.cost}</div>
              </motion.button>
            );
          })}
        </div>
      </div>
      
      {/* Game controls */}
      <div className="bg-gray-800 p-4 rounded-lg text-white">
        <h3 className="font-bold mb-2">Controls</h3>
        <p className="text-sm">
          <span className="text-gray-400">Move:</span> Arrow Keys or A/D
        </p>
        <p className="text-sm">
          <span className="text-gray-400">Shoot:</span> Space
        </p>
        <p className="text-sm">
          <span className="text-gray-400">Repair Defense:</span> R (near defense)
        </p>
        <p className="text-sm">
          <span className="text-gray-400">Upgrade Defense:</span> U (near defense)
        </p>
      </div>
    </div>
  );
};

function formatDefenseName(type: DefenseType): string {
  return type
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default GameUI;
