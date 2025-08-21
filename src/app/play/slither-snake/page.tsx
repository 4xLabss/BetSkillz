'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeftIcon, PlayIcon, PauseIcon, RotateCcwIcon } from 'lucide-react';
import Link from 'next/link';

interface Position {
  x: number;
  y: number;
}

interface Food {
  x: number;
  y: number;
  size: number;
  color: string;
  glow: boolean;
}

interface SnakeSegment extends Position {
  size: number;
  angle: number;
}

interface OtherSnake {
  id: string;
  segments: SnakeSegment[];
  color: string;
  name: string;
  angle?: number;
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const INITIAL_SNAKE_SIZE = 8;
const MIN_SNAKE_SIZE = 6;
const MAX_SNAKE_SIZE = 24;
const SPEED = 3;
const BOOST_SPEED = 6;
const BOOST_COST = 0.1; // Energy cost per frame when boosting
const ENERGY_REGEN = 0.05; // Energy regeneration per frame

export default function SlitherSnakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<SnakeSegment[]>([]);
  const [mousePos, setMousePos] = useState<Position>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
  const [camera, setCamera] = useState<Position>({ x: 0, y: 0 });
  const [food, setFood] = useState<Food[]>([]);
  const [otherSnakes, setOtherSnakes] = useState<OtherSnake[]>([]);
  const [score, setScore] = useState(41); // Start with score like in slither.io
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [deathCause, setDeathCause] = useState('');
  const [boosting, setBoosting] = useState(false);
  const [energy, setEnergy] = useState(1.0); // Energy for boosting (0-1)
  const [playerName, setPlayerName] = useState('Guest');
  const [gameStartTime, setGameStartTime] = useState(0);
  const [gameOfficiallyStarted, setGameOfficiallyStarted] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // World dimensions (much larger than canvas)
  const WORLD_WIDTH = 4000;
  const WORLD_HEIGHT = 3000;

  // Initialize snake in center of world
  useEffect(() => {
    const centerX = WORLD_WIDTH / 2;
    const centerY = WORLD_HEIGHT / 2;
    const initialSnake: SnakeSegment[] = [];
    
    for (let i = 0; i < 5; i++) { // Start with even shorter snake
      initialSnake.push({
        x: centerX - i * 30, // Even more spacing to prevent overlap
        y: centerY,
        size: INITIAL_SNAKE_SIZE, // Same size for all segments initially
        angle: 0
      });
    }
    console.log('Initializing snake with segments:', initialSnake);
    setSnake(initialSnake);
  }, []);

  // Generate random food
  const generateFood = useCallback((): Food => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#ff9ff3', '#54a0ff'];
    const isSpecial = Math.random() < 0.1; // 10% chance for special food
    return {
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * WORLD_HEIGHT,
      size: isSpecial ? 8 : 4,
      color: isSpecial ? '#ffd700' : colors[Math.floor(Math.random() * colors.length)],
      glow: isSpecial
    };
  }, []);

  // Generate other snakes (AI) - spawn away from center
  const generateOtherSnakes = useCallback((): OtherSnake[] => {
    const names = ['SnakeMaster', 'SlitherKing', 'VenomViper', 'CobraCommander', 'PythonPro', 'AnacondaAce'];
    const colors = ['#e74c3c', '#3498db', '#9b59b6', '#f39c12', '#2ecc71', '#34495e'];
    const snakes: OtherSnake[] = [];
    const centerX = WORLD_WIDTH / 2;
    const centerY = WORLD_HEIGHT / 2;

    for (let i = 0; i < 8; i++) {
      const segments: SnakeSegment[] = [];
      // Spawn away from the center where player spawns
      let startX, startY;
      do {
        startX = Math.random() * WORLD_WIDTH;
        startY = Math.random() * WORLD_HEIGHT;
      } while (
        Math.abs(startX - centerX) < 200 && 
        Math.abs(startY - centerY) < 200
      );
      
      const length = 5 + Math.floor(Math.random() * 15);
      
      for (let j = 0; j < length; j++) {
        segments.push({
          x: startX - j * 15, // Increase spacing between segments
          y: startY,
          size: Math.max(MIN_SNAKE_SIZE, INITIAL_SNAKE_SIZE - j * 0.2),
          angle: 0
        });
      }

      snakes.push({
        id: `ai-${i}`,
        segments,
        color: colors[i % colors.length],
        name: names[i % names.length],
        angle: Math.random() * Math.PI * 2 // Random initial angle
      });
    }

    return snakes;
  }, []);

  // Initialize food and other snakes
  useEffect(() => {
    const initialFood = Array.from({ length: 200 }, generateFood);
    setFood(initialFood);
    setOtherSnakes(generateOtherSnakes());
  }, [generateFood, generateOtherSnakes]);

  // Handle mouse movement and boost
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    const handleMouseDown = () => {
      if (energy > 0.1) setBoosting(true);
    };
    
    const handleMouseUp = () => setBoosting(false);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (energy > 0.1) setBoosting(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setBoosting(false);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [energy]);

  // Update other snakes AI with better behavior
  useEffect(() => {
    if (!gameRunning) return;

    const updateAI = () => {
      setOtherSnakes(currentSnakes => 
        currentSnakes.filter(aiSnake => {
          // Check if AI snake collided with player
          const head = aiSnake.segments[0];
          
          // Check collision with player snake body (not head-to-head)
          const playerCollision = snake.slice(1).some((playerSegment: SnakeSegment) => {
            const dx = head.x - playerSegment.x;
            const dy = head.y - playerSegment.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < (head.size + playerSegment.size) * 0.8;
          });

          if (playerCollision) {
            // Drop food where snake died
            const segmentCount = aiSnake.segments.length;
            for (let i = 0; i < segmentCount; i++) {
              const segment = aiSnake.segments[i];
              const newFood = generateFood();
              newFood.x = segment.x + (Math.random() - 0.5) * 30;
              newFood.y = segment.y + (Math.random() - 0.5) * 30;
              setFood(currentFood => [...currentFood, newFood]);
            }
            return false; // Remove this snake
          }

          return true; // Keep this snake
        }).map(aiSnake => {
          const head = aiSnake.segments[0];
          
          // Simple AI: move towards nearest food or away from other snakes
          let targetAngle = aiSnake.angle || Math.random() * Math.PI * 2;
          
          // Find nearest food
          let nearestFood: Food | null = null;
          let nearestDistance = Infinity;
          food.forEach(foodItem => {
            const dx = foodItem.x - head.x;
            const dy = foodItem.y - head.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < nearestDistance && distance < 100) {
              nearestDistance = distance;
              nearestFood = foodItem;
            }
          });

          if (nearestFood) {
            const dx = (nearestFood as Food).x - head.x;
            const dy = (nearestFood as Food).y - head.y;
            targetAngle = Math.atan2(dy, dx);
          }

          // Smooth angle transition
          const currentAngle = aiSnake.angle || 0;
          let angleDiff = targetAngle - currentAngle;
          while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
          while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
          
          const newAngle = currentAngle + angleDiff * 0.1; // Smooth turning
          const speed = 2;
          
          const newHead = {
            x: head.x + Math.cos(newAngle) * speed,
            y: head.y + Math.sin(newAngle) * speed,
            size: head.size,
            angle: newAngle
          };

          // Keep snakes in world bounds
          newHead.x = Math.max(50, Math.min(WORLD_WIDTH - 50, newHead.x));
          newHead.y = Math.max(50, Math.min(WORLD_HEIGHT - 50, newHead.y));

          // Update segments with proper following
          const newSegments = [newHead];
          for (let i = 1; i < aiSnake.segments.length; i++) {
            const prevSegment = newSegments[i - 1];
            const currentSegment = aiSnake.segments[i];
            const dx = prevSegment.x - currentSegment.x;
            const dy = prevSegment.y - currentSegment.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const targetDistance = 12;
            
            if (distance > targetDistance) {
              const ratio = targetDistance / distance;
              newSegments.push({
                x: prevSegment.x - dx * ratio,
                y: prevSegment.y - dy * ratio,
                size: currentSegment.size,
                angle: Math.atan2(dy, dx)
              });
            } else {
              newSegments.push(currentSegment);
            }
          }
          
          return {
            ...aiSnake,
            segments: newSegments,
            angle: newAngle
          };
        })
      );
    };

    const interval = setInterval(updateAI, 50); // More frequent updates
    return () => clearInterval(interval);
  }, [gameRunning, food]);

  // Main game loop
  useEffect(() => {
    if (!gameRunning) return;

    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (deltaTime > 16) { // Limit to ~60fps
        setSnake(currentSnake => {
          if (currentSnake.length === 0) return currentSnake;

          const head = currentSnake[0];
          const canvas = canvasRef.current;
          if (!canvas) return currentSnake;

          // Calculate world position of mouse
          const worldMouseX = mousePos.x + camera.x - CANVAS_WIDTH / 2;
          const worldMouseY = mousePos.y + camera.y - CANVAS_HEIGHT / 2;
          
          // Calculate angle to mouse
          const dx = worldMouseX - head.x;
          const dy = worldMouseY - head.y;
          const angle = Math.atan2(dy, dx);
          
          const currentSpeed = boosting && energy > 0 ? BOOST_SPEED : SPEED;

          // Calculate head size based on snake length with max limit
          const baseSize = INITIAL_SNAKE_SIZE;
          const growthBonus = Math.floor(currentSnake.length / 5) * 0.5; // Grow every 5 segments
          const headSize = Math.min(MAX_SNAKE_SIZE, baseSize + growthBonus);

          // Move head towards mouse
          const newHead: SnakeSegment = {
            x: head.x + Math.cos(angle) * currentSpeed,
            y: head.y + Math.sin(angle) * currentSpeed,
            size: headSize,
            angle: angle
          };

          // Keep snake in world bounds
          newHead.x = Math.max(head.size, Math.min(WORLD_WIDTH - head.size, newHead.x));
          newHead.y = Math.max(head.size, Math.min(WORLD_HEIGHT - head.size, newHead.y));

          // Check collision with other snakes (only after game officially starts and 3 seconds)
          const gameTime = Date.now() - gameStartTime;
          const collidedSnake = gameOfficiallyStarted && gameTime > 3000 && gameStartTime > 0 ? otherSnakes.find(otherSnake => {
            return otherSnake.segments.some((segment, index) => {
              if (index === 0) return false; // Skip head-to-head collision
              const dx = newHead.x - segment.x;
              const dy = newHead.y - segment.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const minDistance = (newHead.size + segment.size) * 0.8; // Slightly smaller collision radius
              return distance < minDistance;
            });
          }) : null;

          // Check collision with own body (completely disabled until game officially starts and 5 seconds pass)
          const selfCollision = gameOfficiallyStarted && gameTime > 5000 && gameStartTime > 0 && currentSnake.length > 15 && currentSnake.slice(10).some(segment => {
            const dx = newHead.x - segment.x;
            const dy = newHead.y - segment.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = (newHead.size + segment.size) * 0.5; // Very lenient collision
            console.log('Checking self collision:', {
              gameTime,
              gameStartTime,
              gameTimeValid: gameTime > 5000,
              gameStartTimeValid: gameStartTime > 0,
              snakeLength: currentSnake.length,
              snakeLengthValid: currentSnake.length > 15,
              distance,
              minDistance,
              collision: distance < minDistance
            });
            return distance < minDistance;
          });

          console.log('Collision check result:', {
            gameTime,
            gameStartTime,
            gameRunning,
            gameOfficiallyStarted,
            snakeLength: currentSnake.length,
            collidedSnake: !!collidedSnake,
            selfCollision: !!selfCollision
          });

          // If collision detected, trigger game over
          if (collidedSnake) {
            console.log('Collision with other snake:', collidedSnake.name);
            setDeathCause(`Ran into ${collidedSnake.name}`);
            setGameOver(true);
            setGameRunning(false);
            return currentSnake; // Don't update snake position
          } else if (selfCollision) {
            console.log('Self collision detected:', {
              gameTime,
              gameStartTime,
              snakeLength: currentSnake.length,
              segments: currentSnake.map(s => ({ x: s.x, y: s.y, size: s.size }))
            });
            setDeathCause('Ran into yourself');
            setGameOver(true);
            setGameRunning(false);
            return currentSnake; // Don't update snake position
          }

          // Update camera to follow snake
          setCamera({
            x: newHead.x,
            y: newHead.y
          });

          // Update snake segments with proper spacing
          const newSnake = [newHead];
          let currentPos = newHead;
          
          for (let i = 1; i < currentSnake.length; i++) {
            const prevSegment = currentSnake[i];
            const dx = currentPos.x - prevSegment.x;
            const dy = currentPos.y - prevSegment.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const targetDistance = 18; // Fixed distance between segments
            
            if (distance > targetDistance) {
              const ratio = targetDistance / distance;
              currentPos = {
                x: currentPos.x - dx * (1 - ratio),
                y: currentPos.y - dy * (1 - ratio),
                size: INITIAL_SNAKE_SIZE, // Keep consistent size
                angle: Math.atan2(dy, dx)
              };
            } else {
              currentPos = {
                ...prevSegment,
                size: INITIAL_SNAKE_SIZE // Ensure consistent size
              };
            }
            
            newSnake.push(currentPos);
          }

          return newSnake;
        });

        // Update energy
        setEnergy(currentEnergy => {
          if (boosting && currentEnergy > 0) {
            return Math.max(0, currentEnergy - BOOST_COST * (deltaTime / 16));
          } else if (!boosting && currentEnergy < 1) {
            return Math.min(1, currentEnergy + ENERGY_REGEN * (deltaTime / 16));
          }
          return currentEnergy;
        });

        // Stop boosting if out of energy
        if (energy <= 0) {
          setBoosting(false);
        }
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameRunning, gameOver, mousePos, camera, boosting, energy, otherSnakes, gameStartTime]);

  // Check food collision
  useEffect(() => {
    if (!gameRunning || snake.length === 0) return;

    const checkCollisions = () => {
      const head = snake[0];
      
      setFood(currentFood => {
        const newFood = [...currentFood];
        
        for (let i = newFood.length - 1; i >= 0; i--) {
          const foodItem = newFood[i];
          const dx = head.x - foodItem.x;
          const dy = head.y - foodItem.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < head.size + foodItem.size) {
            // Eat food
            const points = foodItem.glow ? 5 : 1;
            setScore(prev => prev + points);
            
            // Grow snake
            setSnake(currentSnake => {
              const newSnake = [...currentSnake];
              const tail = newSnake[newSnake.length - 1];
              for (let j = 0; j < points; j++) {
                newSnake.push({
                  x: tail.x,
                  y: tail.y,
                  size: Math.max(MIN_SNAKE_SIZE, tail.size - 0.1),
                  angle: tail.angle || 0
                });
              }
              return newSnake;
            });

            // Replace eaten food
            newFood[i] = generateFood();
          }
        }

        return newFood;
      });
    };

    const interval = setInterval(checkCollisions, 16);
    return () => clearInterval(interval);
  }, [snake, gameRunning, generateFood]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background like slither.io
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Calculate visible area
    const visibleX = camera.x - CANVAS_WIDTH / 2;
    const visibleY = camera.y - CANVAS_HEIGHT / 2;

    // Draw grid pattern
    ctx.strokeStyle = '#636e72';
    ctx.lineWidth = 0.5;
    const gridSize = 50;
    
    for (let x = -gridSize; x < CANVAS_WIDTH + gridSize; x += gridSize) {
      const worldX = x + (visibleX % gridSize);
      ctx.beginPath();
      ctx.moveTo(worldX, 0);
      ctx.lineTo(worldX, CANVAS_HEIGHT);
      ctx.stroke();
    }
    
    for (let y = -gridSize; y < CANVAS_HEIGHT + gridSize; y += gridSize) {
      const worldY = y + (visibleY % gridSize);
      ctx.beginPath();
      ctx.moveTo(0, worldY);
      ctx.lineTo(CANVAS_WIDTH, worldY);
      ctx.stroke();
    }

    // Draw food
    food.forEach(f => {
      const screenX = f.x - visibleX;
      const screenY = f.y - visibleY;
      
      if (screenX > -20 && screenX < CANVAS_WIDTH + 20 && 
          screenY > -20 && screenY < CANVAS_HEIGHT + 20) {
        
        if (f.glow) {
          // Glowing effect for special food
          ctx.shadowColor = f.color;
          ctx.shadowBlur = 15;
        }
        
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, f.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
      }
    });

    // Draw other snakes
    otherSnakes.forEach(otherSnake => {
      otherSnake.segments.forEach((segment, index) => {
        const screenX = segment.x - visibleX;
        const screenY = segment.y - visibleY;
        
        if (screenX > -50 && screenX < CANVAS_WIDTH + 50 && 
            screenY > -50 && screenY < CANVAS_HEIGHT + 50) {
          
          // Snake body
          ctx.fillStyle = index === 0 ? otherSnake.color : `${otherSnake.color}cc`;
          ctx.beginPath();
          ctx.arc(screenX, screenY, segment.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Border
          ctx.strokeStyle = '#2d3436';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Eyes on head
          if (index === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(screenX - 3, screenY - 3, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(screenX + 3, screenY - 3, 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(screenX - 3, screenY - 3, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(screenX + 3, screenY - 3, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
    });

    // Draw player snake
    snake.forEach((segment, index) => {
      const screenX = segment.x - visibleX;
      const screenY = segment.y - visibleY;
      
      // Snake body with gradient
      const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, segment.size);
      gradient.addColorStop(0, index === 0 ? '#00b894' : '#00a085');
      gradient.addColorStop(1, index === 0 ? '#00a085' : '#008f72');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screenX, screenY, segment.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Border
      ctx.strokeStyle = '#2d3436';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Eyes on head
      if (index === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(screenX - 4, screenY - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(screenX + 4, screenY - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(screenX - 4, screenY - 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(screenX + 4, screenY - 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

  }, [snake, food, otherSnakes, camera]);

  const startGame = () => {
    setGameRunning(true);
    setGameOver(false);
    setGameStartTime(Date.now());
    setGameOfficiallyStarted(true);
    lastTimeRef.current = performance.now();
  };

  const pauseGame = () => {
    setGameRunning(false);
  };

  const resetGame = () => {
    // Reset to initial state
    const centerX = WORLD_WIDTH / 2;
    const centerY = WORLD_HEIGHT / 2;
    const initialSnake: SnakeSegment[] = [];
    
    for (let i = 0; i < 5; i++) { // Start with even shorter snake
      initialSnake.push({
        x: centerX - i * 30, // Even more spacing to prevent overlap
        y: centerY,
        size: INITIAL_SNAKE_SIZE, // Same size for all segments initially
        angle: 0
      });
    }
    
    setSnake(initialSnake);
    setScore(41);
    setGameRunning(false);
    setGameOver(false);
    setDeathCause('');
    setGameStartTime(0);
    setGameOfficiallyStarted(false);
    setBoosting(false);
    setEnergy(1.0);
    setCamera({ x: centerX, y: centerY });
    
    // Generate new food
    const newFood = Array.from({ length: 200 }, generateFood);
    setFood(newFood);
    setOtherSnakes(generateOtherSnakes());
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            href="/games" 
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Games</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Slither.io</h1>
          </div>
          
          <div className="text-right">
            <div className="text-xl font-bold text-white">Length: {snake.length}</div>
            <div className="text-sm text-gray-400">Score: {score}</div>
          </div>
        </div>

        {/* Game Container */}
        <div className="bg-black rounded-lg p-2 mx-auto" style={{ width: 'fit-content' }}>
          <div className="relative">
            {/* HUD Elements */}
            <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 rounded p-2">
              <div className="text-white text-sm">
                <div>{playerName}</div>
                <div>Length: {snake.length}</div>
              </div>
            </div>

            {/* Energy Bar */}
            <div className="absolute bottom-4 left-4 z-10">
              <div className="w-32 h-2 bg-gray-700 rounded">
                <div 
                  className="h-full bg-yellow-400 rounded transition-all duration-100"
                  style={{ width: `${energy * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">Boost Energy</div>
            </div>

            {/* Leaderboard */}
            <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 rounded p-2 min-w-[150px]">
              <div className="text-white text-xs">
                <div className="font-bold mb-1">Leaderboard</div>
                <div className="text-yellow-400">1. SlitherKing - 2,847</div>
                <div className="text-gray-300">2. SnakeMaster - 1,923</div>
                <div className="text-orange-400">3. VenomViper - 1,456</div>
                <div className="text-white">4. {playerName} - {score}</div>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="rounded"
              style={{ display: 'block', cursor: 'crosshair' }}
            />
            
            {/* Game Overlay */}
            {(!gameRunning && !gameOver) && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded">
                <div className="text-center">
                  <h2 className="text-4xl font-bold text-white mb-4">slither.io</h2>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-gray-800 text-white px-4 py-2 rounded mb-4 text-center"
                    maxLength={15}
                  />
                  <br />
                  <button
                    onClick={startGame}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-medium text-xl transition-colors duration-200 flex items-center space-x-2 mx-auto"
                  >
                    <PlayIcon className="h-6 w-6" />
                    <span>Play</span>
                  </button>
                  <div className="text-gray-400 text-sm mt-4">
                    Move your mouse to control • Click or hold SPACE to boost
                  </div>
                </div>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
                  {deathCause && (
                    <p className="text-lg text-red-400 mb-2">{deathCause}</p>
                  )}
                  <p className="text-xl text-white mb-2">Your final length was {snake.length}</p>
                  <p className="text-lg text-gray-400 mb-6">Score: {score}</p>
                  <button
                    onClick={resetGame}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto"
                  >
                    <RotateCcwIcon className="h-5 w-5" />
                    <span>Play Again</span>
                  </button>
                </div>
              </div>
            )}

            {/* Boost indicator */}
            {boosting && gameRunning && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="text-yellow-400 text-lg font-bold animate-pulse">
                  BOOST!
                </div>
              </div>
            )}
          </div>

          {/* Game Controls */}
          <div className="mt-4 flex justify-center space-x-4">
            {gameRunning ? (
              <button
                onClick={pauseGame}
                className="bg-gray-700 text-white px-4 py-2 rounded font-medium hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2"
              >
                <PauseIcon className="h-4 w-4" />
                <span>Pause</span>
              </button>
            ) : !gameOver && (
              <button
                onClick={startGame}
                className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <PlayIcon className="h-4 w-4" />
                <span>Resume</span>
              </button>
            )}
            
            <button
              onClick={resetGame}
              className="bg-gray-600 text-white px-4 py-2 rounded font-medium hover:bg-gray-500 transition-colors duration-200 flex items-center space-x-2"
            >
              <RotateCcwIcon className="h-4 w-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
