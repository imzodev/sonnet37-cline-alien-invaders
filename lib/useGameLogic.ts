import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  GameState, 
  createInitialGameState, 
  EnemyType, 
  DefenseType,
  ENEMY_STATS,
  DEFENSE_STATS,
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_SPEED,
  PLAYER_SHOOT_COOLDOWN,
  PLAYER_DAMAGE,
  PLAYER_REPAIR_AMOUNT,
  PLAYER_REPAIR_COST,
  DEFENSE_UPGRADE_COST,
  DEFENSE_UPGRADE_MULTIPLIER,
  MAX_DEFENSE_LEVEL,
  generateWave,
  Enemy,
  Defense,
  Projectile,
  LANE_COUNT,
  LANE_WIDTH
} from './gameTypes';

// Sound effects
import { Howl } from 'howler';

// We'll define these sounds later
const SOUNDS = {
  shoot: null as Howl | null,
  explosion: null as Howl | null,
  placeDefense: null as Howl | null,
  enemyHit: null as Howl | null,
  gameOver: null as Howl | null,
  waveComplete: null as Howl | null,
};

// Interface for explosion effects
interface ExplosionEffect {
  id: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  startTime: number;
}

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [isRunning, setIsRunning] = useState(false);
  const [lastTime, setLastTime] = useState(0);
  const [enemySpawnTimer, setEnemySpawnTimer] = useState(0);
  const [waveCompleted, setWaveCompleted] = useState(false);
  const [userName, setUserName] = useState('');
  const [lastLaneChangeTime, setLastLaneChangeTime] = useState(0);
  const [explosionEffects, setExplosionEffects] = useState<ExplosionEffect[]>([]);
  const LANE_CHANGE_DELAY = 150; // ms between lane changes when holding key
  
  // Initialize userName from localStorage if available
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      const savedUserName = localStorage.getItem('cline_username');
      if (savedUserName) {
        setUserName(savedUserName);
      }
    }
  }, []);

  const gameLoopRef = useRef<number | null>(null);
  const keysPressed = useRef(new Set<string>());
  
  // Initialize sounds
  useEffect(() => {
    // We'll implement this later when we have sound files
    // SOUNDS.shoot = new Howl({ src: ['/sounds/shoot.mp3'] });
    // SOUNDS.explosion = new Howl({ src: ['/sounds/explosion.mp3'] });
    // SOUNDS.placeDefense = new Howl({ src: ['/sounds/place.mp3'] });
    // SOUNDS.enemyHit = new Howl({ src: ['/sounds/hit.mp3'] });
    // SOUNDS.gameOver = new Howl({ src: ['/sounds/gameover.mp3'] });
    // SOUNDS.waveComplete = new Howl({ src: ['/sounds/wave-complete.mp3'] });
  }, []);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // For spacebar, we want to handle repeat events to enable rapid fire
      if (key === ' ') {
        // If it's a repeat event, we still want to add it to enable rapid fire
        keysPressed.current.add(key);
        
        // Prevent default behavior (scrolling) when pressing space
        e.preventDefault();
      } else {
        // For other keys, only add if it's not already pressed
        if (!keysPressed.current.has(key)) {
          keysPressed.current.add(key);
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Place defense at player's position
  const placeDefenseAtPlayerPosition = useCallback((type: DefenseType) => {
    const defenseStats = DEFENSE_STATS[type];
    const cost = defenseStats.cost;
    
    // Check if player has enough resources
    if (gameState.player.resources < cost) return;
    
    // Calculate the center position of the player's lane
    const laneCenter = gameState.player.lane * LANE_WIDTH + LANE_WIDTH / 2;
    
    // Adjust position to center the defense in the lane
    const defenseWidth = defenseStats.width;
    const defenseHeight = defenseStats.height;
    const adjustedX = laneCenter - defenseWidth / 2;
    const adjustedY = Math.max(0, Math.min(gameState.player.y - defenseHeight / 2, GAME_HEIGHT - defenseHeight));
    
    // Check for overlap with other defenses
    const isOverlapping = gameState.defenses.some(defense => {
      return (
        adjustedX < defense.x + defense.width &&
        adjustedX + defenseWidth > defense.x &&
        adjustedY < defense.y + defense.height &&
        adjustedY + defenseHeight > defense.y
      );
    });
    
    if (isOverlapping) return;
    
    // Create new defense
    const newDefense: Defense = {
      id: uuidv4(),
      x: adjustedX,
      y: adjustedY,
      width: defenseWidth,
      height: defenseHeight,
      active: true,
      lane: gameState.player.lane,
      type,
      level: 1,
      cost,
      damage: defenseStats.damage,
      range: defenseStats.range,
      cooldown: defenseStats.cooldown,
      lastFired: 0,
      health: defenseStats.health,
      maxHealth: defenseStats.maxHealth,
    };
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      defenses: [...prev.defenses, newDefense],
      player: {
        ...prev.player,
        resources: prev.player.resources - cost,
      },
    }));
    
    // Play sound
    // SOUNDS.placeDefense?.play();
  }, [gameState.player, gameState.defenses]);
  
  // Define gameLoop function before startGame so it can be referenced
  const gameLoop = useCallback((currentTime: number) => {
    // Don't run the game loop if the game is over
    if (gameState.gameOver) {
      return;
    }
    
    if (lastTime === 0) {
      setLastTime(currentTime);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    
    const deltaTime = currentTime - lastTime;
    
    // Skip game logic if paused
    if (!gameState.paused) {
      // Move player
      movePlayer(deltaTime, currentTime);
      
      // Check for player shooting
      if (keysPressed.current.has(' ')) {
        playerShoot(currentTime);
        // Temporarily remove the spacebar key to allow for rapid fire when pressing quickly
        // It will be re-added on the next keydown event
        keysPressed.current.delete(' ');
      }
      
      // Check for defense selection via number keys
      if (keysPressed.current.has('1')) {
        // Place Basic Turret at player's position
        placeDefenseAtPlayerPosition(DefenseType.BASIC_TURRET);
        keysPressed.current.delete('1'); // Prevent continuous placement
      }
      
      if (keysPressed.current.has('2')) {
        // Place Laser at player's position
        placeDefenseAtPlayerPosition(DefenseType.LASER);
        keysPressed.current.delete('2'); // Prevent continuous placement
      }
      
      if (keysPressed.current.has('3')) {
        // Place Shield at player's position
        placeDefenseAtPlayerPosition(DefenseType.SHIELD);
        keysPressed.current.delete('3'); // Prevent continuous placement
      }
      
      if (keysPressed.current.has('4')) {
        // Place Missile at player's position
        placeDefenseAtPlayerPosition(DefenseType.MISSILE);
        keysPressed.current.delete('4'); // Prevent continuous placement
      }
      
      // Check for repair action
      if (keysPressed.current.has('r')) {
        const defenseToRepair = findClosestDefenseToRepair();
        if (defenseToRepair) {
          repairDefense(defenseToRepair.id);
        }
      }
      
      // Check for upgrade action
      if (keysPressed.current.has('u')) {
        const defenseToUpgrade = findClosestDefenseToUpgrade();
        if (defenseToUpgrade) {
          upgradeDefense(defenseToUpgrade.id);
        }
      }
      
      // Spawn enemies
      setEnemySpawnTimer(prev => {
        // Force enemy spawning if we have enemies in the wave but none on screen
        if ((prev <= 0 || (gameState.enemies.length === 0 && gameState.currentWave.enemies.length > 0)) 
            && gameState.currentWave.enemies.length > 0) {
          spawnEnemy();
          return gameState.currentWave.spawnRate;
        }
        return prev - deltaTime;
      });
      
      // Move enemies
      moveEnemies(deltaTime);
      
      // Fire defenses
      fireDefenses(currentTime);
      
      // Move projectiles
      moveProjectiles(deltaTime, currentTime);
      
      // Update explosion effects
      setExplosionEffects(prev => 
        prev.filter(effect => currentTime - effect.startTime < effect.duration)
      );
      
      // Check for wave completion
      if (gameState.currentWave.enemies.length === 0 && gameState.enemies.length === 0 && !waveCompleted) {
        console.log('Wave completed detected in game loop!');
        setWaveCompleted(true);
      }
      
      // Check game over
      if (gameState.gameOver) {
        endGame();
        return;
      }
    }
    
    setLastTime(currentTime);
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [
    lastTime, 
    gameState, 
    waveCompleted,
    placeDefenseAtPlayerPosition
  ]);
  
  // Start game
  const startGame = useCallback(() => {
    try {
      // Cancel any existing game loop
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      
      // Create initial game state with an enemy already spawned
      const initialState = createInitialGameState();
      
      // Explicitly set gameOver to false
      initialState.gameOver = false;
      
      // Set the new game state
      setGameState(initialState);
      
      // Ensure the game is running
      setIsRunning(true);
      
      // Reset timers to start immediately
      setLastTime(0);
      setWaveCompleted(false);
      setEnemySpawnTimer(0); // Initialize enemy spawn timer to 0 to trigger immediate spawning
      setLastLaneChangeTime(0); // Reset lane change time to allow immediate movement
      
      console.log('Game started with initial enemy! gameOver:', initialState.gameOver);
      
      // Wait a frame before starting the game loop to ensure all state is updated
      setTimeout(() => {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }, 0);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }, [gameLoop]);
  
  // Pause game
  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      paused: !prev.paused
    }));
    // Don't toggle isRunning - we want the game loop to continue running
    // but it will check gameState.paused to determine if it should update game state
    setLastTime(0); // Reset the time delta on pause/unpause
  }, []);
  
  // End game
  const endGame = useCallback(() => {
    // Cancel the game loop
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    setIsRunning(false);
    setGameState(prev => ({
      ...prev,
      gameOver: true,
    }));
    // SOUNDS.gameOver?.play();
    
    console.log('Game ended, gameLoop cancelled');
  }, []);
  
  // Select defense
  const selectDefense = useCallback((type: DefenseType | null) => {
    setGameState(prev => ({ ...prev, selectedDefense: type }));
  }, []);
  
  // Place defense
  const placeDefense = useCallback((x: number, y: number) => {
    if (!gameState.selectedDefense) return;
    
    const defenseStats = DEFENSE_STATS[gameState.selectedDefense];
    const cost = defenseStats.cost;
    
    // Check if player has enough resources
    if (gameState.player.resources < cost) return;
    
    // Determine which lane was clicked
    const lane = Math.floor(x / LANE_WIDTH);
    
    // Calculate the center position of the lane
    const laneCenter = lane * LANE_WIDTH + LANE_WIDTH / 2;
    
    // Adjust position to center the defense in the lane
    const defenseWidth = defenseStats.width;
    const defenseHeight = defenseStats.height;
    const adjustedX = laneCenter - defenseWidth / 2;
    const adjustedY = Math.max(0, Math.min(y - defenseHeight / 2, GAME_HEIGHT - defenseHeight));
    
    // Check for overlap with other defenses
    const isOverlapping = gameState.defenses.some(defense => {
      return (
        adjustedX < defense.x + defense.width &&
        adjustedX + defenseWidth > defense.x &&
        adjustedY < defense.y + defense.height &&
        adjustedY + defenseHeight > defense.y
      );
    });
    
    if (isOverlapping) return;
    
    // Create new defense
    const newDefense: Defense = {
      id: uuidv4(),
      x: adjustedX,
      y: adjustedY,
      width: defenseWidth,
      height: defenseHeight,
      active: true,
      lane: lane,
      type: gameState.selectedDefense,
      level: 1,
      cost,
      damage: defenseStats.damage,
      range: defenseStats.range,
      cooldown: defenseStats.cooldown,
      lastFired: 0,
      health: defenseStats.health,
      maxHealth: defenseStats.maxHealth,
    };
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      defenses: [...prev.defenses, newDefense],
      player: {
        ...prev.player,
        resources: prev.player.resources - cost,
      },
    }));
    
    // Play sound
    // SOUNDS.placeDefense?.play();
  }, [gameState.selectedDefense, gameState.player.resources, gameState.defenses]);
  
  // Player shooting
  const playerShoot = useCallback((currentTime: number) => {
    setGameState(prev => {
      const { player, projectiles } = prev;
      
      // Check if player can shoot (cooldown)
      if (player.lastShot && currentTime - player.lastShot < PLAYER_SHOOT_COOLDOWN) {
        return prev;
      }
      
      // Create new projectile centered in the player's lane
      const projectile: Projectile = {
        id: uuidv4(),
        x: player.lane * LANE_WIDTH + (LANE_WIDTH / 2) - 2.5, // Center the projectile in the lane
        y: player.y, // Start at the player's position
        width: 5,
        height: 10,
        active: true,
        lane: player.lane,
        damage: PLAYER_DAMAGE,
        speed: -12, // Negative speed to move upward
        fromPlayer: true,
      };
      
      // Play sound
      // SOUNDS.shoot?.play();
      
      return {
        ...prev,
        projectiles: [...projectiles, projectile],
        player: {
          ...player,
          lastShot: currentTime,
        },
      };
    });
  }, []);
  
  // Repair defense
  const repairDefense = useCallback((defenseId: string) => {
    setGameState(prev => {
      const { defenses, player } = prev;
      
      // Check if player has enough resources
      if (player.resources < PLAYER_REPAIR_COST) {
        return prev;
      }
      
      // Find the defense to repair
      const defenseIndex = defenses.findIndex(d => d.id === defenseId);
      if (defenseIndex === -1) return prev;
      
      const defense = defenses[defenseIndex];
      
      // Check if defense is already at max health
      if (defense.health >= defense.maxHealth) {
        return prev;
      }
      
      // Calculate new health (don't exceed max health)
      const newHealth = Math.min(defense.health + PLAYER_REPAIR_AMOUNT, defense.maxHealth);
      
      // Create updated defenses array
      const newDefenses = [...defenses];
      newDefenses[defenseIndex] = {
        ...defense,
        health: newHealth,
      };
      
      return {
        ...prev,
        defenses: newDefenses,
        player: {
          ...player,
          resources: player.resources - PLAYER_REPAIR_COST,
        },
      };
    });
  }, []);
  
  // Upgrade defense
  const upgradeDefense = useCallback((defenseId: string) => {
    setGameState(prev => {
      const { defenses, player } = prev;
      
      // Find the defense to upgrade
      const defenseIndex = defenses.findIndex(d => d.id === defenseId);
      if (defenseIndex === -1) return prev;
      
      const defense = defenses[defenseIndex];
      
      // Check if defense is already at max level
      if (defense.level >= MAX_DEFENSE_LEVEL) {
        return prev;
      }
      
      // Calculate upgrade cost (increases with level)
      const upgradeCost = DEFENSE_UPGRADE_COST * defense.level;
      
      // Check if player has enough resources
      if (player.resources < upgradeCost) {
        return prev;
      }
      
      // Calculate upgraded stats
      const newLevel = defense.level + 1;
      const damageMultiplier = Math.pow(DEFENSE_UPGRADE_MULTIPLIER, newLevel - 1);
      const rangeMultiplier = Math.pow(1.2, newLevel - 1); // Smaller increase for range
      const cooldownMultiplier = Math.pow(0.8, newLevel - 1); // Cooldown decreases with level
      
      // Create updated defense
      const upgradedDefense: Defense = {
        ...defense,
        level: newLevel,
        damage: Math.round(DEFENSE_STATS[defense.type].damage * damageMultiplier),
        range: Math.round(DEFENSE_STATS[defense.type].range * rangeMultiplier),
        cooldown: Math.round(DEFENSE_STATS[defense.type].cooldown * cooldownMultiplier),
        maxHealth: Math.round(DEFENSE_STATS[defense.type].maxHealth * damageMultiplier),
        health: Math.round(DEFENSE_STATS[defense.type].maxHealth * damageMultiplier), // Fully heal on upgrade
      };
      
      // Create updated defenses array
      const newDefenses = [...defenses];
      newDefenses[defenseIndex] = upgradedDefense;
      
      return {
        ...prev,
        defenses: newDefenses,
        player: {
          ...player,
          resources: player.resources - upgradeCost,
        },
      };
    });
  }, []);
  
  // Find closest defense to repair or upgrade
  const findClosestDefenseToRepair = useCallback(() => {
    const { player, defenses } = gameState;
    
    // Find defenses that need repair
    const damagedDefenses = defenses.filter(defense => 
      defense.active && defense.health < defense.maxHealth
    );
    
    if (damagedDefenses.length === 0) return null;
    
    // Find the closest one to the player
    let closestDefense = null;
    let closestDistance = Infinity;
    
    for (const defense of damagedDefenses) {
      const dx = defense.x + defense.width / 2 - (player.x + player.width / 2);
      const dy = defense.y + defense.height / 2 - (player.y + player.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < closestDistance) {
        closestDefense = defense;
        closestDistance = distance;
      }
    }
    
    // Only repair if player is close enough (within 100 pixels)
    return closestDistance < 100 ? closestDefense : null;
  }, [gameState.player, gameState.defenses]);
  
  // Find closest defense to upgrade
  const findClosestDefenseToUpgrade = useCallback(() => {
    const { player, defenses } = gameState;
    
    // Find defenses that can be upgraded
    const upgradableDefenses = defenses.filter(defense => 
      defense.active && defense.level < MAX_DEFENSE_LEVEL
    );
    
    if (upgradableDefenses.length === 0) return null;
    
    // Find the closest one to the player
    let closestDefense = null;
    let closestDistance = Infinity;
    
    for (const defense of upgradableDefenses) {
      const dx = defense.x + defense.width / 2 - (player.x + player.width / 2);
      const dy = defense.y + defense.height / 2 - (player.y + player.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < closestDistance) {
        closestDefense = defense;
        closestDistance = distance;
      }
    }
    
    // Only upgrade if player is close enough (within 100 pixels)
    return closestDistance < 100 ? closestDefense : null;
  }, [gameState.player, gameState.defenses]);
  
  // Move player
  const movePlayer = useCallback((deltaTime: number, currentTime: number) => {
    // Check if enough time has passed since the last lane change
    // Skip this check if lastLaneChangeTime is 0 (first movement)
    if (lastLaneChangeTime !== 0 && currentTime - lastLaneChangeTime < LANE_CHANGE_DELAY) {
      return; // Skip this movement update
    }
    
    setGameState(prev => {
      const { player } = prev;
      let newLane = player.lane;
      
      // Track if we need to move
      let shouldMove = false;
      
      // Debug log to see what keys are pressed
      console.log('Keys pressed:', Array.from(keysPressed.current));
      
      // Check for left movement (case insensitive)
      if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) {
        if (newLane > 0) {
          newLane -= 1;
          shouldMove = true;
        }
      }
      
      // Check for right movement (case insensitive)
      if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) {
        if (newLane < LANE_COUNT - 1) {
          newLane += 1;
          shouldMove = true;
        }
      }
      
      // Only update if we actually changed lanes
      if (!shouldMove) return prev;
      
      // Update the last lane change time
      setLastLaneChangeTime(currentTime);
      
      // Calculate new x position based on lane
      const targetX = newLane * LANE_WIDTH + (LANE_WIDTH - player.width) / 2;
      
      return {
        ...prev,
        player: {
          ...player,
          lane: newLane,
          x: targetX,
        },
      };
    });
  }, [lastLaneChangeTime]);
  
  // Spawn enemies
  const spawnEnemy = useCallback(() => {
    if (gameState.currentWave.enemies.length === 0) {
      if (gameState.enemies.length === 0) {
        console.log('Wave completed! Triggering wave completion modal.');
        setWaveCompleted(true);
      }
      return;
    }
    
    const enemyType = gameState.currentWave.enemies[0];
    const enemyStats = ENEMY_STATS[enemyType];
    
    // Choose a random lane for the enemy
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const x = lane * LANE_WIDTH + (LANE_WIDTH - enemyStats.width) / 2;
    
    const newEnemy: Enemy = {
      id: uuidv4(),
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
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      enemies: [...prev.enemies, newEnemy],
      currentWave: {
        ...prev.currentWave,
        enemies: prev.currentWave.enemies.slice(1),
      },
    }));
  }, [gameState.currentWave.enemies, gameState.enemies.length]);
  
  // Move enemies
  const moveEnemies = useCallback((deltaTime: number) => {
    setGameState(prev => {
      const { enemies, player, defenses } = prev;
      let newEnemies = [...enemies];
      let newLives = player.lives;
      let newDefenses = [...defenses];
      
      // Process each enemy
      newEnemies = newEnemies.map(enemy => {
        if (!enemy.active) return enemy;
        
        // Move enemy down
        const newY = enemy.y + enemy.speed * (deltaTime / 16);
        
        // Keep enemy centered in its lane
        const laneCenter = enemy.lane * LANE_WIDTH + (LANE_WIDTH - enemy.width) / 2;
        
        // Check if enemy reached bottom
        if (newY > GAME_HEIGHT) {
          // Damage player
          newLives -= enemy.damage;
          
          // Deactivate enemy
          return { ...enemy, active: false };
        }
        
        // Check collision with defenses
        for (let i = 0; i < newDefenses.length; i++) {
          const defense = newDefenses[i];
          if (!defense.active) continue;
          
          // Check if in same lane
          const defenseLane = Math.floor((defense.x + defense.width / 2) / LANE_WIDTH);
          if (defenseLane !== enemy.lane) continue;
          
          // Check collision
          if (
            laneCenter < defense.x + defense.width &&
            laneCenter + enemy.width > defense.x &&
            newY < defense.y + defense.height &&
            newY + enemy.height > defense.y
          ) {
            // Damage defense
            newDefenses[i] = {
              ...defense,
              health: defense.health - enemy.damage,
            };
            
            // Check if defense is destroyed
            if (newDefenses[i].health <= 0) {
              newDefenses[i] = { ...newDefenses[i], active: false };
            }
            
            // Deactivate enemy
            return { ...enemy, active: false };
          }
        }
        
        return { ...enemy, y: newY, x: laneCenter };
      });
      
      // Filter out inactive enemies
      newEnemies = newEnemies.filter(enemy => enemy.active);
      
      // Filter out inactive defenses
      newDefenses = newDefenses.filter(defense => defense.active);
      
      // Check game over
      const gameOver = newLives <= 0;
      
      return {
        ...prev,
        enemies: newEnemies,
        defenses: newDefenses,
        player: {
          ...prev.player,
          lives: newLives,
        },
        gameOver,
      };
    });
  }, []);
  
  // Fire defenses
  const fireDefenses = useCallback((currentTime: number) => {
    setGameState(prev => {
      const { defenses, enemies } = prev;
      let newProjectiles = [...prev.projectiles];
      
      // Process each defense
      const newDefenses = defenses.map(defense => {
        if (!defense.active) return defense;
        
        // Check cooldown
        if (currentTime - defense.lastFired < defense.cooldown) {
          return defense;
        }
        
        // Find closest enemy in range
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        // Determine which lane this defense is in
        const defenseLane = Math.floor((defense.x + defense.width / 2) / LANE_WIDTH);
        
        // Find enemies in the same lane
        for (const enemy of enemies) {
          if (!enemy.active) continue;
          
          // Only target enemies in the same lane
          if (enemy.lane !== defenseLane) continue;
          
          // Calculate distance
          const dx = enemy.x + enemy.width / 2 - (defense.x + defense.width / 2);
          const dy = enemy.y + enemy.height / 2 - (defense.y + defense.height / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Check if in range and closer than current closest
          if (distance <= defense.range && distance < closestDistance && enemy.y < defense.y) {
            closestEnemy = enemy;
            closestDistance = distance;
          }
        }
        
        // If no enemy in range, do nothing
        if (!closestEnemy) {
          return defense;
        }
        
        // Fire projectile
        const projectile: Projectile = {
          id: uuidv4(),
          x: defense.x + defense.width / 2 - 2.5, // Center the projectile
          y: defense.y,
          width: 5,
          height: 10,
          active: true,
          lane: defenseLane,
          damage: defense.damage,
          speed: -10, // Negative speed to move upward
          fromPlayer: true,
        };
        
        newProjectiles.push(projectile);
        
        // Play sound
        // SOUNDS.shoot?.play();
        
        return {
          ...defense,
          lastFired: currentTime,
        };
      });
      
      return {
        ...prev,
        defenses: newDefenses,
        projectiles: newProjectiles,
      };
    });
  }, []);
  
  // Move projectiles
  const moveProjectiles = useCallback((deltaTime: number, currentTime: number) => {
    setGameState(prev => {
      const { projectiles, enemies, player } = prev;
      let newProjectiles = [...projectiles];
      let newEnemies = [...enemies];
      let newScore = prev.score;
      let newResources = player.resources;
      
      newProjectiles = newProjectiles.map(projectile => {
        if (!projectile.active) return projectile;
        
        // Move projectile (player projectiles move up, enemy projectiles move down)
        const newY = projectile.y + projectile.speed * (deltaTime / 16);
        
        // Check if projectile is out of bounds
        if (newY < 0 || newY > GAME_HEIGHT) {
          return { ...projectile, active: false };
        }
        
        // Check for collisions with enemies
        if (projectile.fromPlayer) {
          for (let i = 0; i < newEnemies.length; i++) {
            const enemy = newEnemies[i];
            if (!enemy.active) continue;
            
            // Only check enemies in the same lane
            if (enemy.lane !== projectile.lane) continue;
            
            // Check collision
            if (
              projectile.x < enemy.x + enemy.width &&
              projectile.x + projectile.width > enemy.x &&
              newY < enemy.y + enemy.height &&
              newY + projectile.height > enemy.y
            ) {
              // Hit enemy
              newEnemies[i] = {
                ...enemy,
                health: enemy.health - projectile.damage,
              };
              
              // Create explosion effect
              const hitX = enemy.x + enemy.width / 2;
              const hitY = enemy.y + enemy.height / 2;
              
              // Add explosion effect
              setExplosionEffects(prev => [
                ...prev,
                {
                  id: uuidv4(),
                  x: hitX,
                  y: hitY,
                  size: enemy.width,
                  duration: 500, // 500ms
                  startTime: currentTime,
                }
              ]);
              
              // Play sound
              // SOUNDS.enemyHit?.play();
              
              // Check if enemy is destroyed
              if (newEnemies[i].health <= 0) {
                newEnemies[i] = { ...newEnemies[i], active: false };
                newScore += enemy.value;
                newResources += enemy.value;
                
                // Create bigger explosion for destroyed enemy
                setExplosionEffects(prev => [
                  ...prev,
                  {
                    id: uuidv4(),
                    x: hitX,
                    y: hitY,
                    size: enemy.width * 2,
                    duration: 800, // 800ms
                    startTime: currentTime,
                  }
                ]);
                
                // Play sound
                // SOUNDS.explosion?.play();
              }
              
              return { ...projectile, active: false };
            }
          }
        }
        
        return { ...projectile, y: newY };
      });
      
      // Filter out inactive projectiles
      newProjectiles = newProjectiles.filter(projectile => projectile.active);
      
      // Filter out inactive enemies
      newEnemies = newEnemies.filter(enemy => enemy.active);
      
      return {
        ...prev,
        projectiles: newProjectiles,
        enemies: newEnemies,
        score: newScore,
        player: {
          ...prev.player,
          resources: newResources,
        },
      };
    });
  }, []);
  
  // Start next wave
  const startNextWave = useCallback(() => {
    setGameState(prev => {
      const nextWaveNumber = prev.waveNumber + 1;
      return {
        ...prev,
        currentWave: generateWave(nextWaveNumber),
        waveNumber: nextWaveNumber,
      };
    });
    setWaveCompleted(false);
    setEnemySpawnTimer(0); // Reset enemy spawn timer to start spawning immediately
    // SOUNDS.waveComplete?.play();
  }, []);
  
  // Game loop
  useEffect(() => {
    if (!isRunning) {
      // Cancel any existing animation frame when paused
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [isRunning, gameLoop]);
  
  return {
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
    setGameState,
  };
}
