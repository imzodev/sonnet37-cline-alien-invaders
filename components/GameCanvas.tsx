'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GameState, 
  GAME_WIDTH, 
  GAME_HEIGHT,
  DefenseType,
  EnemyType,
  LANE_COUNT,
  LANE_WIDTH,
  ENEMY_STATS
} from '@/lib/gameTypes';

// Explosion effect interface
interface ExplosionEffect {
  id: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  startTime: number;
}

// Placeholder images for game entities
const IMAGES = {
  player: '/images/player.png',
  enemies: {
    [EnemyType.BASIC]: '/images/enemy-basic.png',
    [EnemyType.FAST]: '/images/enemy-fast.png',
    [EnemyType.STRONG]: '/images/enemy-strong.png',
    [EnemyType.SPECIAL]: '/images/enemy-special.png',
  },
  defenses: {
    [DefenseType.BASIC_TURRET]: '/images/defense-basic.png',
    [DefenseType.LASER]: '/images/defense-laser.png',
    [DefenseType.SHIELD]: '/images/defense-shield.png',
    [DefenseType.MISSILE]: '/images/defense-missile.png',
  },
  projectile: '/images/projectile.png',
};

interface GameCanvasProps {
  gameState: GameState;
  onCanvasClick: (x: number, y: number) => void;
  explosionEffects?: ExplosionEffect[];
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  onCanvasClick,
  explosionEffects = [] 
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const handleClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    onCanvasClick(x, y);
  };
  
  return (
    <div 
      ref={canvasRef}
      className="relative overflow-hidden"
      style={{ 
        width: GAME_WIDTH, 
        height: GAME_HEIGHT,
        background: 'linear-gradient(to bottom, #000022, #000066)',
        position: 'relative',
        boxShadow: 'inset 0 0 50px rgba(0, 0, 255, 0.5)',
      }}
      onClick={handleClick}
    >
      {/* Stars background */}
      <div className="stars-small"></div>
      <div className="stars-medium"></div>
      <div className="stars-large"></div>
      
      {/* Lane indicators */}
      {Array.from({ length: LANE_COUNT }).map((_, index) => (
        <div
          key={`lane-${index}`}
          className="absolute h-full border-r border-gray-800"
          style={{
            left: index * LANE_WIDTH,
            width: LANE_WIDTH,
            zIndex: 1
          }}
        />
      ))}
      
      {/* Player */}
      <motion.div
        className="absolute bg-blue-500"
        style={{
          width: gameState.player.width,
          height: gameState.player.height,
          top: gameState.player.y,
          zIndex: 10,
          borderTopLeftRadius: '50%',
          borderTopRightRadius: '50%',
          boxShadow: '0 0 10px 3px rgba(59, 130, 246, 0.5)',
          background: 'linear-gradient(to bottom, #3b82f6, #1d4ed8)'
        }}
        animate={{
          left: gameState.player.x,
        }}
        transition={{ type: 'tween', duration: 0.15 }}
      >
        {/* Ship cockpit */}
        <div 
          className="absolute bg-white rounded-full" 
          style={{ 
            width: '30%', 
            height: '30%', 
            left: '35%', 
            top: '20%',
            background: 'radial-gradient(circle, white, #93c5fd)'
          }}
        />
        {/* Ship thrusters */}
        <div className="absolute bottom-0 left-1/4 w-1/2 flex justify-around">
          <div className="w-1/3 h-2 bg-orange-500 rounded-b-lg" />
          <div className="w-1/3 h-2 bg-orange-500 rounded-b-lg" />
        </div>
      </motion.div>
      
      {/* Enemies */}
      {gameState.enemies.map(enemy => (
        <motion.div
          key={enemy.id}
          className={`absolute ${
            enemy.type === EnemyType.BASIC
              ? 'bg-red-500'
              : enemy.type === EnemyType.FAST
              ? 'bg-yellow-500'
              : enemy.type === EnemyType.STRONG
              ? 'bg-purple-500'
              : 'bg-green-500'
          }`}
          style={{
            width: enemy.width,
            height: enemy.height,
            left: enemy.x,
            zIndex: 5,
            borderRadius: enemy.type === EnemyType.BASIC 
              ? '0%' // Square
              : enemy.type === EnemyType.FAST
              ? '50%' // Circle
              : enemy.type === EnemyType.STRONG
              ? '10%' // Rounded square
              : '0% 50% 50% 0%', // Special shape
            boxShadow: `0 0 8px 2px ${
              enemy.type === EnemyType.BASIC
                ? 'rgba(239, 68, 68, 0.5)'
                : enemy.type === EnemyType.FAST
                ? 'rgba(234, 179, 8, 0.5)'
                : enemy.type === EnemyType.STRONG
                ? 'rgba(147, 51, 234, 0.5)'
                : 'rgba(34, 197, 94, 0.5)'
            }`,
            transform: enemy.type === EnemyType.SPECIAL ? 'rotate(45deg)' : 'none'
          }}
          animate={{
            top: enemy.y,
            scale: [1, 1.05, 1],
            opacity: enemy.health < ENEMY_STATS[enemy.type].health * 0.3 ? [0.7, 1, 0.7] : 1
          }}
          transition={{ 
            top: { type: 'tween' },
            scale: { repeat: Infinity, duration: 1, repeatType: 'reverse' },
            opacity: { repeat: Infinity, duration: 0.5, repeatType: 'reverse' }
          }}
        >
          {/* Enemy features */}
          <div className="w-full h-full relative">
            {/* Eyes */}
            <div className="absolute flex w-full justify-around" style={{ top: '25%' }}>
              <div className="bg-black rounded-full" style={{ width: '20%', height: '20%' }}></div>
              <div className="bg-black rounded-full" style={{ width: '20%', height: '20%' }}></div>
            </div>
            
            {/* Mouth */}
            <div 
              className="absolute bg-black rounded-lg" 
              style={{ 
                width: '60%', 
                height: '10%', 
                left: '20%', 
                top: '60%',
                borderRadius: enemy.type === EnemyType.STRONG ? '0' : '10px'
              }}
            ></div>
            
            {/* Health indicator */}
            <div 
              className="absolute bottom-0 left-0 h-1" 
              style={{ 
                width: `${(enemy.health / ENEMY_STATS[enemy.type].health) * 100}%`,
                backgroundColor: enemy.health < ENEMY_STATS[enemy.type].health * 0.3 
                  ? 'red' 
                  : enemy.health < ENEMY_STATS[enemy.type].health * 0.6 
                  ? 'yellow' 
                  : 'lime'
              }}
            ></div>
          </div>
        </motion.div>
      ))}
      
      {/* Defenses */}
      {gameState.defenses.map(defense => (
        <div 
          key={defense.id} 
          className="absolute" 
          style={{ 
            left: defense.x, 
            top: defense.y,
            width: defense.width,
            height: defense.height,
            zIndex: 3
          }}
        >
          <motion.div
            className={`relative w-full h-full ${
              defense.type === DefenseType.BASIC_TURRET
                ? 'bg-green-500'
                : defense.type === DefenseType.LASER
                ? 'bg-blue-500'
                : defense.type === DefenseType.SHIELD
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Health bar */}
            <div className="absolute -top-2 left-0 w-full h-1 bg-gray-700">
              <div 
                className="h-full" 
                style={{ 
                  width: `${(defense.health / defense.maxHealth) * 100}%`,
                  backgroundColor: defense.health < defense.maxHealth * 0.3 
                    ? 'red' 
                    : defense.health < defense.maxHealth * 0.6 
                    ? 'yellow' 
                    : 'green'
                }}
              />
            </div>
            
            {/* Level indicator */}
            <div className="absolute -top-6 right-0 text-xs font-bold text-white bg-gray-800 px-1 rounded">
              Lvl {defense.level}
            </div>
          </motion.div>
        </div>
      ))}
      
      {/* Projectiles */}
      {gameState.projectiles.map(projectile => (
        <motion.div
          key={projectile.id}
          className="absolute bg-yellow-400 rounded-full"
          style={{
            width: projectile.width,
            height: projectile.height,
            left: projectile.x,
            top: projectile.y,
            zIndex: 7,
            boxShadow: '0 0 5px 2px rgba(255, 255, 0, 0.5)'
          }}
          animate={{
            top: projectile.y,
          }}
          transition={{ type: 'tween', duration: 0.05 }}
        />
      ))}
      
      {/* Explosion Effects */}
      <AnimatePresence>
        {explosionEffects.map(effect => (
          <motion.div
            key={effect.id}
            className="absolute rounded-full"
            style={{
              left: effect.x - effect.size / 2,
              top: effect.y - effect.size / 2,
              zIndex: 15
            }}
            initial={{ 
              width: 0, 
              height: 0,
              opacity: 1,
              background: 'radial-gradient(circle, rgba(255,255,0,1) 0%, rgba(255,165,0,0.8) 50%, rgba(255,0,0,0.6) 100%)'
            }}
            animate={{ 
              width: effect.size, 
              height: effect.size,
              opacity: 0
            }}
            exit={{ 
              opacity: 0,
              scale: 1.5
            }}
            transition={{ 
              duration: effect.duration / 1000,
              ease: "easeOut"
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* Placement preview */}
      {gameState.selectedDefense && (
        <div
          className="absolute bg-white opacity-50 pointer-events-none"
          style={{
            width: 40,
            height: 40,
            left: 0,
            top: 0,
            transform: 'translate(-50%, -50%)',
            zIndex: 20
          }}
        />
      )}
    </div>
  );
};

export default GameCanvas;
