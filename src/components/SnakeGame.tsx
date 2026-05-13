/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COLORS,
  GRID_HEIGHT,
  GRID_WIDTH,
  INITIAL_DIRECTION,
  INITIAL_SNAKE,
  TILE_SIZE,
  BASE_SPEED,
} from "../constants";
import { Direction, GameStatus, Point, Language } from "../types";
import { Trophy, Play, RotateCcw, Keyboard, Globe } from "lucide-react";
import { translations } from "../i18n";

const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [status, setStatus] = useState<GameStatus>("IDLE");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lang, setLang] = useState<Language>("en");

  const t = translations[lang];

  // useRef to keep track of state for the game loop without re-renders
  const stateRef = useRef({
    snake: INITIAL_SNAKE,
    food: { x: 15, y: 15 },
    direction: INITIAL_DIRECTION,
    lastUpdateTime: 0,
    isGameOver: false,
  });

  // Generate random food position
  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT),
      };
      // Check if food spawned on snake body
      const onSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  const startGame = () => {
    const startSnake = INITIAL_SNAKE;
    const startFood = generateFood(startSnake);
    setSnake(startSnake);
    setFood(startFood);
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    setScore(0);
    setStatus("PLAYING");

    stateRef.current = {
      snake: startSnake,
      food: startFood,
      direction: INITIAL_DIRECTION,
      lastUpdateTime: performance.now(),
      isGameOver: false,
    };
  };

  const gameOver = () => {
    setStatus("GAME_OVER");
    stateRef.current.isGameOver = true;
    if (score > highScore) {
      setHighScore(score);
    }
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (direction !== "DOWN") setNextDirection("UP");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (direction !== "UP") setNextDirection("DOWN");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (direction !== "RIGHT") setNextDirection("LEFT");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (direction !== "LEFT") setNextDirection("RIGHT");
          break;
        case "Enter":
        case " ":
          if (status !== "PLAYING") startGame();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, status]);

  // Sync nextDirection to direction on each tick
  useEffect(() => {
    stateRef.current.direction = nextDirection;
    setDirection(nextDirection);
  }, [nextDirection]);

  // Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const loop = (time: number) => {
      if (status !== "PLAYING") return;

      const elapsed = time - stateRef.current.lastUpdateTime;
      // Control speed: moves slower as code is executed
      if (elapsed > BASE_SPEED) {
        moveSnake();
        stateRef.current.lastUpdateTime = time;
      }

      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    const moveSnake = () => {
      const { snake: currentSnake, direction: currentDirection, food: currentFood } = stateRef.current;
      const head = currentSnake[0];
      const newHead = { ...head };

      switch (currentDirection) {
        case "UP": newHead.y -= 1; break;
        case "DOWN": newHead.y += 1; break;
        case "LEFT": newHead.x -= 1; break;
        case "RIGHT": newHead.x += 1; break;
      }

      // Wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_WIDTH ||
        newHead.y < 0 ||
        newHead.y >= GRID_HEIGHT
      ) {
        gameOver();
        return;
      }

      // Self collision
      if (currentSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        gameOver();
        return;
      }

      const newSnake = [newHead, ...currentSnake];

      // Food check
      if (newHead.x === currentFood.x && newHead.y === currentFood.y) {
        setScore((s) => s + 10);
        const nextFood = generateFood(newSnake);
        setFood(nextFood);
        stateRef.current.food = nextFood;
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
      stateRef.current.snake = newSnake;
    };

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { snake: drawSnake, food: drawFood } = stateRef.current;

      // Clear
      ctx.fillStyle = COLORS.BACKGROUND;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Grid Pattern (Subtle)
      ctx.strokeStyle = COLORS.GRID;
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= CANVAS_WIDTH; x += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Food (Retro Red Circle with Pulse shadow)
      ctx.fillStyle = COLORS.FOOD;
      ctx.shadowBlur = status === "PLAYING" ? 15 + Math.sin(performance.now() / 100) * 5 : 10;
      ctx.shadowColor = COLORS.FOOD;
      ctx.beginPath();
      ctx.arc(
        drawFood.x * TILE_SIZE + TILE_SIZE / 2,
        drawFood.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE / 3,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Snake (Square Geometric blocks)
      ctx.shadowBlur = 0;
      drawSnake.forEach((segment, i) => {
        ctx.fillStyle = i === 0 ? COLORS.SNAKE_HEAD : COLORS.SNAKE_BODY;
        
        const x = segment.x * TILE_SIZE;
        const y = segment.y * TILE_SIZE;
        const size = TILE_SIZE;
        
        ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

        // Head Eyes
        if (i === 0) {
          ctx.fillStyle = "black";
          const eyeSize = 3;
          const eyePadding = 5;
          // Simple eyes based on direction
          ctx.fillRect(x + eyePadding, y + eyePadding, eyeSize, eyeSize);
          ctx.fillRect(x + size - eyePadding - eyeSize, y + eyePadding, eyeSize, eyeSize);
        }
      });
    };

    if (status === "PLAYING") {
      animationFrameId = requestAnimationFrame(loop);
    } else {
      draw(); // Draw final state
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [status, generateFood]);

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-300 font-mono overflow-hidden border-8 border-[#1e293b]">
      {/* Header */}
      <header className="h-20 w-full border-b border-slate-800 bg-[#0f172a] flex items-center justify-between px-8 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#22c55e] rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)]">
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-white uppercase">{t.title}</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              {t.status}: <span className={status === "PLAYING" ? "text-[#22c55e]" : "text-amber-500"}>{status === "PLAYING" ? t.systemActive : t.standby}</span> | Latency: 4ms
            </p>
          </div>
        </div>
        
        <div className="flex gap-8 items-center">
          <button 
            onClick={() => setLang(l => l === "en" ? "zh" : "en")}
            className="flex items-center gap-2 px-3 py-1 border border-slate-700 bg-slate-800/50 hover:bg-slate-700 rounded text-[10px] text-slate-300 font-bold transition-colors"
          >
            <Globe size={12} />
            {t.language}
          </button>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase">{t.sessionScore}</p>
            <p className="text-2xl font-bold text-[#22c55e] tabular-nums">{score.toString().padStart(6, '0')}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase">{t.highRecord}</p>
            <p className="text-2xl font-bold text-slate-100 tabular-nums uppercase">{highScore.toString().padStart(6, '0')}</p>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Game Canvas Section */}
        <section className="flex-1 bg-black relative flex items-center justify-center border-r border-slate-800">
          {/* Grid Pattern Background */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="relative border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="block"
              style={{ width: 'min(800px, 60vw)', height: 'auto' }}
            />
            
            <div className="absolute bottom-0 right-0 p-2 text-[10px] text-slate-600 font-mono">
              RENDER_ENGINE: CANVAS_2D // {CANVAS_WIDTH}x{CANVAS_HEIGHT}
            </div>

            {/* Overlays */}
            <AnimatePresence>
              {status !== "PLAYING" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-[2px]"
                >
                  <div className="text-center p-12 border-4 border-slate-800 bg-[#0f172a] shadow-2xl max-w-md">
                    {status === "IDLE" ? (
                      <>
                        <div className="w-16 h-16 bg-[#22c55e] mx-auto mb-6 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                          <Play size={32} fill="black" stroke="black" />
                        </div>
                        <h2 className="text-3xl font-black mb-4 tracking-tighter text-white uppercase">{t.initializeGame}</h2>
                        <p className="text-slate-500 text-xs mb-8 uppercase tracking-widest leading-loose">
                          {t.neuralLinkReady}<br/>
                          {t.collisionProtocolsActive}<br/>
                          {t.pressSpaceToStart}
                        </p>
                        <button
                          onClick={startGame}
                          className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-[#22c55e] transition-colors"
                        >
                          {t.bootSequence}
                        </button>
                      </>
                    ) : (
                      <>
                        <h2 className="text-5xl font-black mb-4 text-[#ef4444] tracking-tighter italic uppercase">{t.gameOver}</h2>
                        <div className="text-slate-500 text-xs mb-8 uppercase tracking-widest">
                          {t.coreFailure} at {score} PTS
                        </div>
                        <button
                          onClick={startGame}
                          className="w-full py-4 bg-[#ef4444] text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                        >
                          {t.rebootSystem}
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="w-[300px] bg-[#0f172a] flex flex-col flex-shrink-0">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{t.componentState}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 uppercase">{t.segments}</span>
                <span className="text-[#22c55e] tabular-nums font-bold">{snake.length}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 uppercase">{t.direction}</span>
                <span className="text-[#22c55e] font-bold">{direction}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 uppercase">{t.target}</span>
                <span className="text-[#22c55e] font-bold">[{food.x}, {food.y}]</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1 mt-6 overflow-hidden">
                <motion.div 
                  className="bg-[#22c55e] h-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((score / 1000) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-600 uppercase mt-1">{t.efficiencyThreshold}</p>
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t.memoryDump}</h3>
            <div className="flex-1 bg-black/40 border border-slate-800 p-4 font-mono text-[10px] leading-relaxed text-slate-500 overflow-hidden">
              <div className="opacity-50">
                {`// SNAPSHOT_${new Date().getTime().toString(16).toUpperCase()}\n`}
                {`type Point = { x: number; y: number };\n`}
                {`\ncurrent_snake: [\n`}
                {snake.slice(0, 3).map(p => `  { x: ${p.x}, y: ${p.y} }`).join(',\n')}
                {snake.length > 3 ? '\n  ...' : ''}
                {`\n];\n`}
                {`\ncollision_check: true;\n`}
                {`render_mode: 'CANVAS';\n`}
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="h-20 bg-[#0f172a] border-t border-slate-800 flex items-center justify-between px-8 flex-shrink-0">
        <div className="flex gap-12">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase mb-2 tracking-tighter">{t.controlMapping}</span>
            <div className="flex gap-2">
              <kbd className="px-2 py-1 bg-slate-800 rounded text-[10px] border border-slate-700 text-slate-300">↑</kbd>
              <kbd className="px-2 py-1 bg-slate-800 rounded text-[10px] border border-slate-700 text-slate-300">↓</kbd>
              <kbd className="px-2 py-1 bg-slate-800 rounded text-[10px] border border-slate-700 text-slate-300">←</kbd>
              <kbd className="px-2 py-1 bg-slate-800 rounded text-[10px] border border-slate-700 text-slate-300">→</kbd>
              <kbd className="px-4 py-1 bg-slate-800 rounded text-[10px] border border-slate-700 text-slate-300 ml-2">SPACE</kbd>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase mb-1 tracking-tighter">{t.subsystem}</span>
            <span className="text-[11px] font-bold text-slate-200">TypeScript / requestAnimationFrame</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-[10px] text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span>VITE_DEV_SERVER // PORT_3000</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#22c55e]"></div>
            <span>NODE_ENV: PRODUCTION</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SnakeGame;
