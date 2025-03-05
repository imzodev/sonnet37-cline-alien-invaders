// Game types and constants

// Game area dimensions
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Lane system
export const LANE_COUNT = 12;
export const LANE_WIDTH = GAME_WIDTH / LANE_COUNT;

// Player constants
export const PLAYER_WIDTH = 60;
export const PLAYER_HEIGHT = 40;
export const PLAYER_SPEED = 8;
export const PLAYER_SHOOT_COOLDOWN = 100; // ms between shots
export const PLAYER_DAMAGE = 15;
export const PLAYER_REPAIR_AMOUNT = 20; // Health repaired per action
export const PLAYER_REPAIR_COST = 50; // Resource cost to repair

// Defense upgrade constants
export const DEFENSE_UPGRADE_COST = 150; // Base cost to upgrade a defense
export const DEFENSE_UPGRADE_MULTIPLIER = 1.5; // Multiplier for stats when upgrading
export const MAX_DEFENSE_LEVEL = 3; // Maximum level a defense can be upgraded to

// Enemy types
export enum EnemyType {
  BASIC = 'basic',
  FAST = 'fast',
  STRONG = 'strong',
  SPECIAL = 'special'
}

// Defense types
export enum DefenseType {
  BASIC_TURRET = 'basicTurret',
  LASER = 'laser',
  SHIELD = 'shield',
  MISSILE = 'missile'
}

// Game entities
export interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  lane: number; // Lane number (0-indexed)
}

export interface Player extends GameObject {
  lives: number;
  resources: number;
  lastShot?: number; // Timestamp of last shot
}

export interface Enemy extends GameObject {
  type: EnemyType;
  health: number;
  speed: number;
  value: number; // Resources gained when destroyed
  damage: number; // Damage to player/defense when reaching bottom
  lastAttackTime?: number; // Timestamp of last attack on a defense
}

export interface Defense extends GameObject {
  type: DefenseType;
  level: number;
  cost: number;
  damage: number;
  range: number;
  cooldown: number;
  lastFired: number;
  health: number;
  maxHealth: number;
}

export interface Projectile extends GameObject {
  damage: number;
  speed: number;
  fromPlayer: boolean;
}

export interface PowerUp extends GameObject {
  type: string;
  duration: number; // Duration in milliseconds, 0 for instant effects
}

// Wave configuration
export interface Wave {
  number: number;
  enemies: EnemyType[];
  spawnRate: number; // Time between enemy spawns in milliseconds
  totalEnemies: number;
  name?: string; // Optional name for the wave
  bossWave?: boolean; // Whether this is a boss wave
}

// Difficulty settings
export interface DifficultySettings {
  enemyHealthMultiplier: number;
  enemySpeedMultiplier: number;
  enemyValueMultiplier: number;
  spawnRateMultiplier: number;
  baseEnemiesPerWave: number;
  enemiesIncreasePerWave: number;
}

// Predefined difficulty levels
export const DIFFICULTY_LEVELS: Record<string, DifficultySettings> = {
  easy: {
    enemyHealthMultiplier: 0.8,
    enemySpeedMultiplier: 0.8,
    enemyValueMultiplier: 1.2,
    spawnRateMultiplier: 1.2, // Slower spawn rate
    baseEnemiesPerWave: 8,
    enemiesIncreasePerWave: 3,
  },
  normal: {
    enemyHealthMultiplier: 1.0,
    enemySpeedMultiplier: 1.0,
    enemyValueMultiplier: 1.0,
    spawnRateMultiplier: 1.0,
    baseEnemiesPerWave: 10,
    enemiesIncreasePerWave: 5,
  },
  hard: {
    enemyHealthMultiplier: 1.3,
    enemySpeedMultiplier: 1.2,
    enemyValueMultiplier: 0.8,
    spawnRateMultiplier: 0.8, // Faster spawn rate
    baseEnemiesPerWave: 15,
    enemiesIncreasePerWave: 8,
  },
};

// Current difficulty setting
export let CURRENT_DIFFICULTY: DifficultySettings = { ...DIFFICULTY_LEVELS.normal };

// Set difficulty
export function setDifficulty(difficulty: string) {
  if (DIFFICULTY_LEVELS[difficulty]) {
    CURRENT_DIFFICULTY = { ...DIFFICULTY_LEVELS[difficulty] };
  }
}

// Custom wave templates
export const WAVE_TEMPLATES: Record<string, Partial<Wave>> = {
  basicWave: {
    name: "Basic Attack",
    enemies: Array(10).fill(EnemyType.BASIC),
    spawnRate: 2000,
  },
  fastWave: {
    name: "Speed Rush",
    enemies: Array(15).fill(EnemyType.FAST),
    spawnRate: 1000,
  },
  strongWave: {
    name: "Heavy Assault",
    enemies: Array(8).fill(EnemyType.STRONG),
    spawnRate: 3000,
  },
  mixedWave: {
    name: "Mixed Forces",
    enemies: [
      ...Array(5).fill(EnemyType.BASIC),
      ...Array(5).fill(EnemyType.FAST),
      ...Array(3).fill(EnemyType.STRONG),
    ],
    spawnRate: 1500,
  },
  bossWave: {
    name: "Boss Encounter",
    enemies: [
      ...Array(5).fill(EnemyType.BASIC),
      ...Array(3).fill(EnemyType.FAST),
      ...Array(1).fill(EnemyType.SPECIAL),
      ...Array(2).fill(EnemyType.STRONG),
    ],
    spawnRate: 2000,
    bossWave: true,
  },
};

// Wave generator function
export function generateWave(waveNumber: number): Wave {
  // Every 5th wave is a boss wave
  const isBossWave = waveNumber % 5 === 0;
  
  // Use a template for boss waves
  if (isBossWave) {
    return {
      ...WAVE_TEMPLATES.bossWave,
      number: waveNumber,
      totalEnemies: WAVE_TEMPLATES.bossWave.enemies?.length || 0,
      spawnRate: 1500 * CURRENT_DIFFICULTY.spawnRateMultiplier, // Ensure spawn rate is set for boss waves
    } as Wave;
  }
  
  // For regular waves, generate based on difficulty settings
  const { 
    baseEnemiesPerWave, 
    enemiesIncreasePerWave,
    spawnRateMultiplier
  } = CURRENT_DIFFICULTY;
  
  const totalEnemies = baseEnemiesPerWave + (waveNumber - 1) * enemiesIncreasePerWave;
  
  // Determine enemy types based on wave number
  const enemies: EnemyType[] = [];
  
  // Always include basic enemies
  const basicCount = Math.max(Math.floor(totalEnemies * 0.6), 1);
  for (let i = 0; i < basicCount; i++) {
    enemies.push(EnemyType.BASIC);
  }
  
  // Add fast enemies from wave 2
  if (waveNumber >= 2) {
    const fastCount = Math.max(Math.floor(totalEnemies * 0.2), 1);
    for (let i = 0; i < fastCount; i++) {
      enemies.push(EnemyType.FAST);
    }
  }
  
  // Add strong enemies from wave 3
  if (waveNumber >= 3) {
    const strongCount = Math.max(Math.floor(totalEnemies * 0.15), 1);
    for (let i = 0; i < strongCount; i++) {
      enemies.push(EnemyType.STRONG);
    }
  }
  
  // Add special enemies from wave 5
  if (waveNumber >= 5) {
    const specialCount = Math.max(Math.floor(totalEnemies * 0.05), 1);
    for (let i = 0; i < specialCount; i++) {
      enemies.push(EnemyType.SPECIAL);
    }
  }
  
  // Shuffle the enemies array for variety
  for (let i = enemies.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [enemies[i], enemies[j]] = [enemies[j], enemies[i]];
  }
  
  // Create wave name
  let waveName = `Wave ${waveNumber}`;
  if (waveNumber % 10 === 0) {
    waveName = `Mega Boss Wave ${waveNumber}`;
  } else if (waveNumber % 5 === 0) {
    waveName = `Boss Wave ${waveNumber}`;
  } else if (waveNumber % 3 === 0) {
    waveName = `Advanced Wave ${waveNumber}`;
  }
  
  // Create the wave object
  return {
    number: waveNumber,
    enemies,
    spawnRate: 2000 * spawnRateMultiplier, // Base spawn rate adjusted by difficulty
    totalEnemies: enemies.length,
    name: waveName,
    bossWave: isBossWave,
  };
}

// Create a specific wave using a template
export function createWaveFromTemplate(waveNumber: number, templateName: string): Wave {
  const template = WAVE_TEMPLATES[templateName];
  if (!template) {
    return generateWave(waveNumber);
  }
  
  return {
    number: waveNumber,
    enemies: template.enemies || [],
    spawnRate: template.spawnRate || 2000,
    totalEnemies: template.enemies?.length || 0,
    name: template.name || `Wave ${waveNumber}`,
    bossWave: template.bossWave || false,
  };
}

// Game state
export interface GameState {
  player: Player;
  enemies: Enemy[];
  defenses: Defense[];
  projectiles: Projectile[];
  powerUps: PowerUp[];
  currentWave: Wave;
  waveNumber: number;
  score: number;
  gameOver: boolean;
  paused: boolean;
  selectedDefense: DefenseType | null;
}

// Defense costs and stats
export const DEFENSE_STATS = {
  [DefenseType.BASIC_TURRET]: {
    cost: 100,
    damage: 10,
    range: 150,
    cooldown: 800,
    width: 40,
    height: 40,
    health: 100,
    maxHealth: 100,
  },
  [DefenseType.LASER]: {
    cost: 200,
    damage: 5, // Per frame
    range: 200,
    cooldown: 300, // Increased to 300ms to reduce firing rate
    width: 40,
    height: 60,
    health: 80,
    maxHealth: 80,
  },
  [DefenseType.SHIELD]: {
    cost: 150,
    damage: 0,
    range: 0,
    cooldown: 0,
    width: 80,
    height: 20,
    health: 200,
    maxHealth: 200,
  },
  [DefenseType.MISSILE]: {
    cost: 300,
    damage: 50,
    range: 300,
    cooldown: 3000,
    width: 30,
    height: 50,
    health: 120,
    maxHealth: 120,
  },
};

// Enemy stats
export const ENEMY_STATS = {
  [EnemyType.BASIC]: {
    health: 30,
    speed: 1,
    value: 10,
    damage: 10, // Increased from 1 to 10
    width: 40,
    height: 40,
  },
  [EnemyType.FAST]: {
    health: 20,
    speed: 2,
    value: 15,
    damage: 8, // Increased from 1 to 8
    width: 30,
    height: 30,
  },
  [EnemyType.STRONG]: {
    health: 100,
    speed: 0.5,
    value: 25,
    damage: 20, // Increased from 2 to 20
    width: 50,
    height: 50,
  },
  [EnemyType.SPECIAL]: {
    health: 50,
    speed: 1.5,
    value: 30,
    damage: 15, // Increased from 3 to 15
    width: 45,
    height: 45,
  },
};

// Initial game state
export function createInitialGameState(): GameState {
  // Generate the first wave with proper spawn rate
  const firstWave = generateWave(1);
  
  // Ensure the spawn rate is set
  if (!firstWave.spawnRate) {
    firstWave.spawnRate = 2000 * CURRENT_DIFFICULTY.spawnRateMultiplier;
  }
  
  // Create an initial enemy to start the game with
  const enemyType = firstWave.enemies.length > 0 ? firstWave.enemies[0] : EnemyType.BASIC;
  const enemyStats = ENEMY_STATS[enemyType];
  
  // Choose a random lane for the enemy
  const lane = Math.floor(Math.random() * LANE_COUNT);
  const x = lane * LANE_WIDTH + (LANE_WIDTH - enemyStats.width) / 2;
  
  const initialEnemy = {
    id: 'initial-enemy',
    x,
    y: -enemyStats.height, // Start above the screen
    width: enemyStats.width,
    height: enemyStats.height,
    active: true,
    lane,
    type: enemyType,
    health: enemyStats.health,
    speed: enemyStats.speed,
    value: enemyStats.value,
    damage: enemyStats.damage,
  };
  
  // Remove the first enemy from the wave since we're adding it directly
  const updatedWave = {
    ...firstWave,
    enemies: firstWave.enemies.slice(1),
  };
  
  return {
    player: {
      id: 'player',
      x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: GAME_HEIGHT - PLAYER_HEIGHT - 20,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      active: true,
      lane: Math.floor(LANE_COUNT / 2), // Start player in middle lane
      lives: 3,
      resources: 200, // Starting resources
    },
    enemies: [initialEnemy],
    defenses: [],
    projectiles: [],
    powerUps: [],
    currentWave: updatedWave,
    waveNumber: 1,
    score: 0,
    gameOver: false,
    paused: false,
    selectedDefense: null,
  };
}
