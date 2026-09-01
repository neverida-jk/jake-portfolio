"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { soundFx } from "@/util/sound";
import {
  LuPlay,
  LuCopy,
  LuCheck,
  LuRotateCcw,
  LuZap,
  LuShieldCheck,
  LuCompass,
  LuMusic,
  LuDices,
  LuBug,
  LuTarget,
} from "react-icons/lu";

type StudioMode = "piano" | "qa" | "pathfinding" | "physics";
type PathAlgorithm = "astar" | "dijkstra" | "bfs" | "dfs";
type GridTool = "wall" | "start" | "goal";

interface GridNode {
  x: number;
  y: number;
}

interface PianoWhiteKey {
  note: string;
  freq: number;
  blackKey?: {
    note: string;
    freq: number;
  };
}

const PIANO_KEYBOARD: PianoWhiteKey[] = [
  { note: "C4", freq: 261.63, blackKey: { note: "C#4", freq: 277.18 } },
  { note: "D4", freq: 293.66, blackKey: { note: "D#4", freq: 311.13 } },
  { note: "E4", freq: 329.63 },
  { note: "F4", freq: 349.23, blackKey: { note: "F#4", freq: 369.99 } },
  { note: "G4", freq: 392.0, blackKey: { note: "G#4", freq: 415.3 } },
  { note: "A4", freq: 440.0, blackKey: { note: "A#4", freq: 466.16 } },
  { note: "B4", freq: 493.88 },
  { note: "C5", freq: 523.25, blackKey: { note: "C#5", freq: 554.37 } },
  { note: "D5", freq: 587.33, blackKey: { note: "D#5", freq: 622.25 } },
  { note: "E5", freq: 659.25 },
];

const SONG_PRESETS = [
  {
    id: "twinkle",
    title: "Twinkle Twinkle Little Star",
    notes: ["C4", "C4", "G4", "G4", "A4", "A4", "G4", "F4", "F4", "E4", "E4", "D4", "D4", "C4"],
    bpm: 240,
  },
  {
    id: "ode_to_joy",
    title: "Ode to Joy (Beethoven)",
    notes: ["E4", "E4", "F4", "G4", "G4", "F4", "E4", "D4", "C4", "C4", "D4", "E4", "E4", "D4", "D4"],
    bpm: 220,
  },
  {
    id: "happy_birthday",
    title: "Happy Birthday",
    notes: ["C4", "C4", "D4", "C4", "F4", "E4", "C4", "C4", "D4", "C4", "G4", "F4"],
    bpm: 230,
  },
];

const ALGO_DESCRIPTIONS: Record<
  PathAlgorithm,
  {
    title: string;
    popularApps: string;
    nonTech: string;
    tech: string;
    badge: string;
  }
> = {
  astar: {
    title: "A* Search (Heuristic Navigator)",
    popularApps: "Google Maps, Waze, League of Legends & StarCraft",
    nonTech: "When you click to move your champion in League of Legends or ask Google Maps for the fastest route, A* calculates your direct GPS distance to the goal and navigates around obstacles straight toward your destination with zero wasted wandering.",
    tech: "Informed heuristic search minimizing f(n) = g(n) + h(n), where h(n) is the direct Manhattan distance.",
    badge: "GPS & Game AI",
  },
  dijkstra: {
    title: "Dijkstra's Shortest Path",
    popularApps: "Cisco Internet Routers (OSPF), Cloudflare & Google Flights",
    nonTech: "How internet traffic travels around the world! Every time you open a website or search for cheap flight layovers, Dijkstra evaluates millions of fiber-optic cables or airport connections to guarantee the absolute lowest-cost, fastest path.",
    tech: "Uniform-cost graph traversal exploring lowest cumulative edge cost g(n) via priority queue.",
    badge: "Internet Core & Routing",
  },
  bfs: {
    title: "Breadth-First Search (BFS)",
    popularApps: "LinkedIn ('1st, 2nd, 3rd Degrees'), Facebook & Google Web Crawler",
    nonTech: "How LinkedIn finds who you know! It checks your direct friends first (1st degree), then friends-of-friends (2nd degree), radiating outward level-by-level to find the closest social connection with the fewest handshakes.",
    tech: "FIFO queue level-order traversal, guaranteeing fewest hops in unweighted graphs.",
    badge: "Social Networks & Crawlers",
  },
  dfs: {
    title: "Depth-First Search (DFS)",
    popularApps: "Stockfish Chess AI, Sudoku Solvers & Git Branch Merging",
    nonTech: "How Stockfish calculates chess moves! It simulates a tactical move sequence 15 moves deep into the future to hunt for checkmate. If it hits a dead end, it backtracks and tests the next branch.",
    tech: "LIFO recursive stack exploration plunging down branches before backtracking.",
    badge: "Game Trees & Solvers",
  },
};

// 12 EXPANSIVE DEFECT CATEGORIES
const BUG_CATALOG = [
  { name: "Memory Leak", icon: "🐞", priority: "P0" as const },
  { name: "XSS Injection", icon: "🪲", priority: "P0" as const },
  { name: "CSS Overflow", icon: "🐛", priority: "P2" as const },
  { name: "Null Pointer", icon: "🐜", priority: "P1" as const },
  { name: "Race Condition", icon: "🦗", priority: "P1" as const },
  { name: "Broken Auth", icon: "🕷️", priority: "P0" as const },
  { name: "Infinite Loop", icon: "🪳", priority: "P0" as const },
  { name: "API Timeout 504", icon: "🦟", priority: "P1" as const },
  { name: "DB N+1 Query", icon: "🐌", priority: "P2" as const },
  { name: "CORS Violation", icon: "🦠", priority: "P1" as const },
  { name: "Stack Overflow", icon: "🦂", priority: "P0" as const },
  { name: "Zombie Process", icon: "🐝", priority: "P2" as const },
];

interface SoftwareBug {
  id: string;
  name: string;
  icon: string;
  x: number; // percentage (0 to 100)
  y: number; // percentage (0 to 100)
  vx: number;
  vy: number;
  isSmashed: boolean;
  isSnapping?: boolean;
  priority: "P0" | "P1" | "P2";
  smashedAt?: number;
  isViewport?: boolean; // If true, crawls across user's whole browser viewport!
}

// Spawns a bug strictly entering from the 4 perimeter edges (arena or viewport)
function createBugFromEdge(isViewport: boolean = false): SoftwareBug {
  const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
  let x = 50;
  let y = 50;
  let vx = 0.5;
  let vy = 0.5;

  if (isViewport) {
    // Viewport coordinates
    if (edge === 0) {
      x = Math.floor(Math.random() * 80 + 10);
      y = 3;
      vx = (Math.random() - 0.5) * 0.8;
      vy = Math.random() * 0.4 + 0.3;
    } else if (edge === 1) {
      x = 97;
      y = Math.floor(Math.random() * 70 + 15);
      vx = -(Math.random() * 0.4 + 0.3);
      vy = (Math.random() - 0.5) * 0.8;
    } else if (edge === 2) {
      x = Math.floor(Math.random() * 80 + 10);
      y = 94;
      vx = (Math.random() - 0.5) * 0.8;
      vy = -(Math.random() * 0.4 + 0.3);
    } else {
      x = 3;
      y = Math.floor(Math.random() * 70 + 15);
      vx = Math.random() * 0.4 + 0.3;
      vy = (Math.random() - 0.5) * 0.8;
    }
  } else {
    // Arena coordinates
    if (edge === 0) {
      x = Math.floor(Math.random() * 80 + 10);
      y = 4;
      vx = (Math.random() - 0.5) * 1.0;
      vy = Math.random() * 0.5 + 0.4;
    } else if (edge === 1) {
      x = 96;
      y = Math.floor(Math.random() * 70 + 15);
      vx = -(Math.random() * 0.5 + 0.4);
      vy = (Math.random() - 0.5) * 1.0;
    } else if (edge === 2) {
      x = Math.floor(Math.random() * 80 + 10);
      y = 92;
      vx = (Math.random() - 0.5) * 1.0;
      vy = -(Math.random() * 0.5 + 0.4);
    } else {
      x = 4;
      y = Math.floor(Math.random() * 70 + 15);
      vx = Math.random() * 0.5 + 0.4;
      vy = (Math.random() - 0.5) * 1.0;
    }
  }

  const chosen = BUG_CATALOG[Math.floor(Math.random() * BUG_CATALOG.length)];
  return {
    id: `bug_${Date.now()}_${Math.random()}`,
    name: chosen.name,
    icon: chosen.icon,
    priority: chosen.priority,
    x,
    y,
    vx,
    vy,
    isSmashed: false,
    isViewport,
  };
}

// INITIALLY: Arena starts clean, bugs crawl in incrementally one-by-one!
const INITIAL_BUGS: SoftwareBug[] = [];

export default function TechnicalExpertiseSection() {
  const [activeMode, setActiveMode] = useState<StudioMode>("piano");
  const [copiedCode, setCopiedCode] = useState(false);

  // -----------------------------------------------------------------
  // 1. PLAYABLE PIANO STATE
  // -----------------------------------------------------------------
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState("twinkle");
  const songTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // -----------------------------------------------------------------
  // 2. GAMIFIED QA BUG SMASHER WITH VIEWPORT INFINITY GAUNTLET
  // -----------------------------------------------------------------
  const [bugs, setBugs] = useState<SoftwareBug[]>(INITIAL_BUGS);
  const [smashedCount, setSmashedCount] = useState<number>(0);
  const [gauntletPhase, setGauntletPhase] = useState<"hidden" | "appearing" | "snapping" | "fading">("hidden");
  const [hasBeenSnapped, setHasBeenSnapped] = useState<boolean>(false);
  const [viewportBreachActive, setViewportBreachActive] = useState<boolean>(false);
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHoveringArena, setIsHoveringArena] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [splats, setSplats] = useState<{ id: string; x: number; y: number }[]>([]);
  const [viewportSplats, setViewportSplats] = useState<{ id: string; x: number; y: number }[]>([]);

  // -----------------------------------------------------------------
  // 3. PATHFINDING STATE (Fixed Height Container, Dynamic Grid)
  // -----------------------------------------------------------------
  const [gridDensity, setGridDensity] = useState<"coarse" | "standard" | "dense">("standard");
  const gridDims = {
    coarse: { cols: 9, rows: 5 },
    standard: { cols: 13, rows: 7 },
    dense: { cols: 17, rows: 9 },
  }[gridDensity];

  const [selectedAlgo, setSelectedAlgo] = useState<PathAlgorithm>("astar");
  const [activeTool, setActiveTool] = useState<GridTool>("wall");
  const [startNode, setStartNode] = useState<GridNode>({ x: 1, y: 1 });
  const [goalNode, setGoalNode] = useState<GridNode>({ x: 11, y: 5 });
  const [walls, setWalls] = useState<GridNode[]>([
    { x: 4, y: 0 },
    { x: 4, y: 1 },
    { x: 4, y: 2 },
    { x: 4, y: 3 },
    { x: 8, y: 3 },
    { x: 8, y: 4 },
    { x: 8, y: 5 },
    { x: 8, y: 6 },
  ]);
  const [visitedNodes, setVisitedNodes] = useState<GridNode[]>([]);
  const [shortestPath, setShortestPath] = useState<GridNode[]>([]);
  const [isSolving, setIsSolving] = useState(false);
  const [algoStats, setAlgoStats] = useState({
    exploredCount: 24,
    pathLength: 15,
    durationMs: 0.04,
    found: true,
  });
  const pathAnimationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // -----------------------------------------------------------------
  // 4. CANVAS VECTOR PHYSICS STATE
  // -----------------------------------------------------------------
  const [particleCount, setParticleCount] = useState<number>(50);
  const [physicsForceMode, setPhysicsForceMode] = useState<"scatter" | "vortex" | "gravity">("scatter");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<
    { x: number; y: number; vx: number; vy: number; radius: number; color: string }[]
  >([]);
  const animFrameRef = useRef<number | null>(null);

  // -----------------------------------------------------------------
  // PERSISTENT SINGLE AUDIO CONTEXT
  // -----------------------------------------------------------------
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playPianoNote = useCallback(
    (freq: number, noteName: string) => {
      setActiveKeys((prev) => new Set(prev).add(noteName));
      setTimeout(() => {
        setActiveKeys((prev) => {
          const next = new Set(prev);
          next.delete(noteName);
          return next;
        });
      }, 200);

      try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch {
        soundFx.playSuccess();
      }
    },
    [getAudioContext]
  );

  const handleAutoPlaySong = useCallback(() => {
    if (songTimerRef.current) clearInterval(songTimerRef.current);

    const song = SONG_PRESETS.find((s) => s.id === selectedSongId) || SONG_PRESETS[0];
    setIsPlayingSong(true);
    let noteIdx = 0;

    const interval = setInterval(() => {
      if (noteIdx < song.notes.length) {
        const noteName = song.notes[noteIdx];
        let foundFreq = 440;
        for (const item of PIANO_KEYBOARD) {
          if (item.note === noteName) foundFreq = item.freq;
          else if (item.blackKey && item.blackKey.note === noteName) foundFreq = item.blackKey.freq;
        }
        playPianoNote(foundFreq, noteName);
        noteIdx++;
      } else {
        clearInterval(interval);
        setIsPlayingSong(false);
      }
    }, song.bpm);

    songTimerRef.current = interval;
  }, [playPianoNote, selectedSongId]);

  const handleStopSong = useCallback(() => {
    if (songTimerRef.current) clearInterval(songTimerRef.current);
    setIsPlayingSong(false);
    setActiveKeys(new Set());
  }, []);

  useEffect(() => {
    return () => {
      if (songTimerRef.current) clearInterval(songTimerRef.current);
    };
  }, []);

  // -----------------------------------------------------------------
  // INCREMENTAL EDGE ENTRANCE: BUGS CRAWL IN ONE-BY-ONE UPON VIEWING ARENA!
  // -----------------------------------------------------------------
  useEffect(() => {
    if (activeMode !== "qa" || hasBeenSnapped) return;

    let spawnedCount = 0;
    const maxInitialBugs = 6;

    // Bug 1 crawls in almost immediately (250ms)
    const firstTimeout = setTimeout(() => {
      setBugs((prev) => {
        const aliveArena = prev.filter((b) => !b.isViewport && !b.isSmashed);
        if (aliveArena.length > 0) return prev;
        return [createBugFromEdge(false)];
      });
      spawnedCount = 1;
    }, 250);

    // Subsequent initial bugs enter one-by-one every 950ms
    const incrementalTimer = setInterval(() => {
      if (spawnedCount >= maxInitialBugs) {
        clearInterval(incrementalTimer);
        return;
      }

      setBugs((prev) => {
        const aliveArena = prev.filter((b) => !b.isViewport && !b.isSmashed && !b.isSnapping);
        if (aliveArena.length >= maxInitialBugs) return prev;
        spawnedCount++;
        return [...prev, createBugFromEdge(false)];
      });
    }, 950);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(incrementalTimer);
    };
  }, [activeMode, hasBeenSnapped]);

  // -----------------------------------------------------------------
  // VIEWPORT BREACH TIMER: AFTER 7s PLAYING, BUGS ESCAPE TO VIEWPORT!
  // -----------------------------------------------------------------
  useEffect(() => {
    if (activeMode !== "qa" || hasBeenSnapped) return;

    const breachTimer = setTimeout(() => {
      setViewportBreachActive(true);
    }, 7000);

    return () => clearTimeout(breachTimer);
  }, [activeMode, hasBeenSnapped]);

  // -----------------------------------------------------------------
  // QA BUG MOVEMENT & EDGE CRAWLING LOOP (ARENA + VIEWPORT)
  // -----------------------------------------------------------------
  useEffect(() => {
    if (activeMode !== "qa") return;

    // Movement loop at ~30 FPS
    const moveInterval = setInterval(() => {
      setBugs((prev) =>
        prev.map((b) => {
          if (b.isSmashed || b.isSnapping) return b;

          let nx = b.x + b.vx;
          let ny = b.y + b.vy;
          let nvx = b.vx;
          let nvy = b.vy;

          if (b.isViewport) {
            // Viewport boundaries
            if (nx <= 2) {
              nx = 2;
              nvx = Math.abs(nvx);
            } else if (nx >= 98) {
              nx = 98;
              nvx = -Math.abs(nvx);
            }

            if (ny <= 3) {
              ny = 3;
              nvy = Math.abs(nvy);
            } else if (ny >= 95) {
              ny = 95;
              nvy = -Math.abs(nvy);
            }
          } else {
            // Arena boundaries
            if (nx <= 3) {
              nx = 3;
              nvx = Math.abs(nvx);
            } else if (nx >= 97) {
              nx = 97;
              nvx = -Math.abs(nvx);
            }

            if (ny <= 14) {
              ny = 14;
              nvy = Math.abs(nvy);
            } else if (ny >= 88) {
              ny = 88;
              nvy = -Math.abs(nvy);
            }
          }

          // Random direction shifts
          if (Math.random() < 0.04) {
            const speed = Math.sqrt(nvx * nvx + nvy * nvy) || 0.5;
            const angle = Math.random() * Math.PI * 2;
            nvx = Math.cos(angle) * speed;
            nvy = Math.sin(angle) * speed;
          }

          return { ...b, x: nx, y: ny, vx: nvx, vy: nvy };
        })
      );
    }, 30);

    // Continuous Edge-Crawling Spawner (Paces at most ONE bug per cycle)
    const edgeSpawnInterval = setInterval(() => {
      setBugs((prev) => {
        if (gauntletPhase !== "hidden" || hasBeenSnapped) return prev;

        const aliveArena = prev.filter((b) => !b.isViewport && !b.isSmashed && !b.isSnapping);
        const aliveViewport = prev.filter((b) => b.isViewport && !b.isSmashed && !b.isSnapping);

        // Incrementally add ONLY ONE bug at a time
        let newBug: SoftwareBug | null = null;
        if (viewportBreachActive && aliveViewport.length < 4 && Math.random() < 0.45) {
          newBug = createBugFromEdge(true);
        } else if (aliveArena.length < 7) {
          newBug = createBugFromEdge(false);
        }

        const now = Date.now();
        const cleaned = prev.filter((b) => !b.isSmashed || !b.smashedAt || now - b.smashedAt < 2000);
        return newBug ? [...cleaned, newBug] : cleaned;
      });
    }, 2000);

    return () => {
      clearInterval(moveInterval);
      clearInterval(edgeSpawnInterval);
    };
  }, [activeMode, gauntletPhase, hasBeenSnapped, viewportBreachActive]);

  // -----------------------------------------------------------------
  // QA BUG SMASHER & FULL-VIEWPORT INFINITY GAUNTLET SNAP
  // -----------------------------------------------------------------
  const smashSingleBug = (id: string, clickX?: number, clickY?: number, isViewport?: boolean) => {
    soundFx.playClick(950);
    soundFx.playSuccess();

    // Smashed 2 bugs early? Breach containment into the viewport!
    if (smashedCount + 1 >= 2) {
      setViewportBreachActive(true);
    }

    setBugs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isSmashed: true, smashedAt: Date.now() } : b))
    );
    setSmashedCount((c) => c + 1);

    if (clickX !== undefined && clickY !== undefined) {
      const splatId = `splat_${Date.now()}_${Math.random()}`;
      if (isViewport) {
        setViewportSplats((prev) => [...prev, { id: splatId, x: clickX, y: clickY }]);
        setTimeout(() => {
          setViewportSplats((prev) => prev.filter((s) => s.id !== splatId));
        }, 1000);
      } else {
        setSplats((prev) => [...prev, { id: splatId, x: clickX, y: clickY }]);
        setTimeout(() => {
          setSplats((prev) => prev.filter((s) => s.id !== splatId));
        }, 1000);
      }
    }
  };

  const playThanosSnapSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // 1. Sharp Acoustic Snap Click
      const oscSnap = ctx.createOscillator();
      const gainSnap = ctx.createGain();
      oscSnap.type = "triangle";
      oscSnap.frequency.setValueAtTime(1900, now);
      oscSnap.frequency.exponentialRampToValueAtTime(110, now + 0.09);

      gainSnap.gain.setValueAtTime(0.4, now);
      gainSnap.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      oscSnap.connect(gainSnap);
      gainSnap.connect(ctx.destination);
      oscSnap.start(now);
      oscSnap.stop(now + 0.09);

      // 2. Heavy Bass & Cosmic Energy Rumble
      const oscHum = ctx.createOscillator();
      const gainHum = ctx.createGain();
      oscHum.type = "sine";
      oscHum.frequency.setValueAtTime(320, now + 0.04);
      oscHum.frequency.exponentialRampToValueAtTime(1200, now + 1.2);

      gainHum.gain.setValueAtTime(0.001, now);
      gainHum.gain.linearRampToValueAtTime(0.25, now + 0.2);
      gainHum.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      oscHum.connect(gainHum);
      gainHum.connect(ctx.destination);
      oscHum.start(now + 0.04);
      oscHum.stop(now + 1.4);
    } catch {
      soundFx.playSuccess();
    }
  }, [getAudioContext]);

  // FULL-VIEWPORT CINEMATIC SEQUENCE WITH SUSPENSE DELAY BEFORE DISSIPATION
  const handleThanosSnapSequence = useCallback(() => {
    const aliveBugs = bugs.filter((b) => !b.isSmashed && !b.isSnapping);
    if (aliveBugs.length === 0) {
      soundFx.playClick(400);
      return;
    }

    setHasBeenSnapped(true);

    // Phase 1 (t = 0ms): Infinity Gauntlet ascends slowly in the center of the viewport
    setGauntletPhase("appearing");
    soundFx.playClick(500);

    // Phase 2 (t = 1200ms): Gauntlet SNAPS! (Click sound & full-screen shockwave)
    setTimeout(() => {
      setGauntletPhase("snapping");
      playThanosSnapSound();

      // Phase 3 (t = 1200ms + 550ms = 1750ms): AFTER THE SNAP, SUSPENSE DELAY -> DISSIPATION WAVE!
      setTimeout(() => {
        setBugs((prev) =>
          prev.map((b) => (!b.isSmashed ? { ...b, isSnapping: true } : b))
        );
      }, 550);
    }, 1200);

    // Phase 4 (t = 2900ms): Gauntlet fades into stardust across viewport
    setTimeout(() => {
      setGauntletPhase("fading");
    }, 2900);

    // Phase 5 (t = 3900ms): Finalize purge - NO MORE RESPAWN!
    setTimeout(() => {
      setGauntletPhase("hidden");
      soundFx.playSuccess();
      setBugs((prev) =>
        prev.map((b) => (b.isSnapping ? { ...b, isSmashed: true, isSnapping: false, smashedAt: Date.now() } : b))
      );
      setSmashedCount((c) => c + aliveBugs.length);
    }, 3900);
  }, [bugs, playThanosSnapSound]);

  // Restart / Re-simulate fresh bugs on user request
  const handleResetBugSimulation = () => {
    soundFx.playClick(900);
    setHasBeenSnapped(false);
    setViewportBreachActive(false);
    setGauntletPhase("hidden");
    setBugs([]); // Start empty so bugs crawl in incrementally one-by-one!
  };

  // -----------------------------------------------------------------
  // RANDOM MAZE GENERATION & PATHFINDING
  // -----------------------------------------------------------------
  const generateRandomMaze = useCallback(() => {
    soundFx.playClick(850);
    setVisitedNodes([]);
    setShortestPath([]);

    const { cols, rows } = gridDims;
    const newWalls: GridNode[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((c === startNode.x && r === startNode.y) || (c === goalNode.x && r === goalNode.y)) {
          continue;
        }
        if (Math.random() < 0.28) {
          newWalls.push({ x: c, y: r });
        }
      }
    }
    setWalls(newWalls);
  }, [gridDims, goalNode.x, goalNode.y, startNode.x, startNode.y]);

  const handleGridDensityChange = (density: "coarse" | "standard" | "dense") => {
    soundFx.playClick(900);
    setGridDensity(density);
    setVisitedNodes([]);
    setShortestPath([]);

    const targetCols = density === "coarse" ? 9 : density === "standard" ? 13 : 17;
    const targetRows = density === "coarse" ? 5 : density === "standard" ? 7 : 9;

    setStartNode({ x: 0, y: 0 });
    setGoalNode({ x: targetCols - 1, y: targetRows - 1 });
    setWalls([]);
  };

  const computePath = useCallback(
    (algo: PathAlgorithm, s: GridNode, g: GridNode, wList: GridNode[], cols: number, rows: number) => {
      const wallSet = new Set(wList.map((w) => `${w.x},${w.y}`));
      const dirs = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ];
      const explored: GridNode[] = [];

      if (algo === "astar") {
        const heap: { x: number; y: number; cost: number; priority: number; path: GridNode[] }[] = [
          { x: s.x, y: s.y, cost: 0, priority: Math.abs(s.x - g.x) + Math.abs(s.y - g.y), path: [s] },
        ];
        const visited = new Set<string>([`${s.x},${s.y}`]);

        while (heap.length > 0) {
          heap.sort((a, b) => a.priority - b.priority);
          const current = heap.shift()!;
          if (current.x === g.x && current.y === g.y) return { path: current.path, explored };

          for (const [dx, dy] of dirs) {
            const nx = current.x + dx;
            const ny = current.y + dy;
            const key = `${nx},${ny}`;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !wallSet.has(key) && !visited.has(key)) {
              visited.add(key);
              explored.push({ x: nx, y: ny });
              const nextCost = current.cost + 1;
              const heuristic = Math.abs(nx - g.x) + Math.abs(ny - g.y);
              heap.push({
                x: nx,
                y: ny,
                cost: nextCost,
                priority: nextCost + heuristic,
                path: [...current.path, { x: nx, y: ny }],
              });
            }
          }
        }
      } else if (algo === "bfs" || algo === "dijkstra") {
        const queue: [number, number, GridNode[]][] = [[s.x, s.y, [s]]];
        const visited = new Set<string>([`${s.x},${s.y}`]);

        while (queue.length > 0) {
          const [cx, cy, path] = queue.shift()!;
          if (cx === g.x && cy === g.y) return { path, explored };

          for (const [dx, dy] of dirs) {
            const nx = cx + dx;
            const ny = cy + dy;
            const key = `${nx},${ny}`;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !wallSet.has(key) && !visited.has(key)) {
              visited.add(key);
              explored.push({ x: nx, y: ny });
              queue.push([nx, ny, [...path, { x: nx, y: ny }]]);
            }
          }
        }
      } else if (algo === "dfs") {
        const stack: [number, number, GridNode[]][] = [[s.x, s.y, [s]]];
        const visited = new Set<string>([`${s.x},${s.y}`]);

        while (stack.length > 0) {
          const [cx, cy, path] = stack.pop()!;
          if (cx === g.x && cy === g.y) return { path, explored };

          for (const [dx, dy] of dirs) {
            const nx = cx + dx;
            const ny = cy + dy;
            const key = `${nx},${ny}`;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !wallSet.has(key) && !visited.has(key)) {
              visited.add(key);
              explored.push({ x: nx, y: ny });
              stack.push([nx, ny, [...path, { x: nx, y: ny }]]);
            }
          }
        }
      }

      return { path: [], explored };
    },
    []
  );

  const runSequentialPathfinder = useCallback(() => {
    if (pathAnimationTimerRef.current) clearInterval(pathAnimationTimerRef.current);

    soundFx.playClick(950);
    setIsSolving(true);
    setVisitedNodes([]);
    setShortestPath([]);

    const { cols, rows } = gridDims;
    const t0 = performance.now();
    const { path, explored } = computePath(selectedAlgo, startNode, goalNode, walls, cols, rows);
    const duration = Math.max(0.02, parseFloat((performance.now() - t0).toFixed(3)));

    setAlgoStats({
      exploredCount: explored.length,
      pathLength: path.length,
      durationMs: duration,
      found: path.length > 0,
    });

    let exploreIndex = 0;
    const exploreInterval = setInterval(() => {
      if (exploreIndex < explored.length) {
        setVisitedNodes(explored.slice(0, exploreIndex + 2));
        exploreIndex += 2;
        if (exploreIndex % 6 === 0) soundFx.playKey();
      } else {
        clearInterval(exploreInterval);

        if (path.length > 0) {
          let pathIndex = 0;
          const pathInterval = setInterval(() => {
            if (pathIndex <= path.length) {
              setShortestPath(path.slice(0, pathIndex));
              pathIndex++;
            } else {
              clearInterval(pathInterval);
              setIsSolving(false);
              soundFx.playSuccess();
            }
          }, 35);
        } else {
          setIsSolving(false);
          soundFx.playClick(450);
        }
      }
    }, 20);

    pathAnimationTimerRef.current = exploreInterval;
  }, [computePath, goalNode, gridDims, selectedAlgo, startNode, walls]);

  const handleGridCellClick = (x: number, y: number) => {
    soundFx.playClick(900);
    setVisitedNodes([]);
    setShortestPath([]);

    if (activeTool === "start") {
      if (x === goalNode.x && y === goalNode.y) return;
      setWalls((prev) => prev.filter((w) => !(w.x === x && w.y === y)));
      setStartNode({ x, y });
    } else if (activeTool === "goal") {
      if (x === startNode.x && y === startNode.y) return;
      setWalls((prev) => prev.filter((w) => !(w.x === x && w.y === y)));
      setGoalNode({ x, y });
    } else {
      if ((x === startNode.x && y === startNode.y) || (x === goalNode.x && y === goalNode.y)) return;
      setWalls((prev) => {
        const exists = prev.some((w) => w.x === x && w.y === y);
        if (exists) return prev.filter((w) => !(w.x === x && w.y === y));
        return [...prev, { x, y }];
      });
    }
  };

  // -----------------------------------------------------------------
  // CANVAS PHYSICS ENGINE (JavaScript ES2024)
  // -----------------------------------------------------------------
  useEffect(() => {
    if (activeMode !== "physics") {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 400;
    canvas.height = rect.height || 220;

    const arr = [];
    for (let i = 0; i < particleCount; i++) {
      arr.push({
        x: Math.random() * (canvas.width - 20) + 10,
        y: Math.random() * (canvas.height - 20) + 10,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        radius: Math.random() * 2.5 + 2,
        color: "#10b981",
      });
    }
    particlesRef.current = arr;

    let running = true;
    const render = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const list = particlesRef.current;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (let i = 0; i < list.length; i++) {
        const p = list[i];

        if (physicsForceMode === "vortex") {
          const dx = p.x - cx;
          const dy = p.y - cy;
          const angle = Math.atan2(dy, dx);
          p.vx += -Math.sin(angle) * 0.22;
          p.vy += Math.cos(angle) * 0.22;
          p.vx *= 0.98;
          p.vy *= 0.98;
        } else if (physicsForceMode === "gravity") {
          p.vy += 0.12;
          if (p.y >= canvas.height - p.radius) {
            p.y = canvas.height - p.radius;
            p.vy *= -0.85;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= p.radius) {
          p.x = p.radius;
          p.vx *= -1;
        } else if (p.x >= canvas.width - p.radius) {
          p.x = canvas.width - p.radius;
          p.vx *= -1;
        }
        if (p.y <= p.radius) {
          p.y = p.radius;
          p.vy *= -1;
        } else if (p.y >= canvas.height - p.radius && physicsForceMode !== "gravity") {
          p.y = canvas.height - p.radius;
          p.vy *= -1;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();

        for (let j = i + 1; j < list.length; j++) {
          const p2 = list[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 44) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.8 - dist / 44})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeMode, particleCount, physicsForceMode]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    particlesRef.current.forEach((p) => {
      const dist = Math.hypot(p.x - mx, p.y - my);
      if (dist < 50) {
        const angle = Math.atan2(p.y - my, p.x - mx);
        p.vx += Math.cos(angle) * 2;
        p.vy += Math.sin(angle) * 2;
      }
    });
  };

  // -----------------------------------------------------------------
  // DYNAMIC MULTI-LANGUAGE CODE GENERATOR
  // -----------------------------------------------------------------
  const getDynamicCodeSnippet = () => {
    if (activeMode === "piano") {
      return `// TypeScript: Interactive Web Audio Synthesizer Piano
import { useEffect } from "react";

// Persistent Web Audio context handles rapid polyphonic playing
export function playPianoNote(frequency: number = 440.0) {
  const ctx = getSharedAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(); // Zero latency acoustic audio synthesis!
}`;
    }

    if (activeMode === "qa") {
      return `# Python 3.12: Enterprise QA Infinity Snap Defect Purge
import pytest

@pytest.mark.qa_automation
def test_purge_all_application_bugs(qa_war_room):
    # Edge crawling defects across 12 software categories
    active_defects = qa_war_room.scan_unhandled_defects()
    
    # Trigger Full-Viewport Infinity Gauntlet Snap to dissipate defects into ash
    for bug in active_defects:
        resolution = bug.dissipate_into_particles()
        assert resolution == "VERIFIED_PURGED"
        
    assert qa_war_room.active_bug_count == 0, "Zero bugs in production!"`;
    }

    if (activeMode === "pathfinding") {
      return `# Python 3.12: Graph Pathfinding (${selectedAlgo.toUpperCase()} Algorithm)
import heapq

def solve_grid_path(start: tuple, goal: tuple, walls: set, dims: tuple) -> list:
    cols, rows = dims
    heap = [(0, 0, start, [start])]
    costs = {start: 0}

    while heap:
        _, cost, cur, path = heapq.heappop(heap)
        if cur == goal:
            return path  # Optimal path found!

        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            nxt = (cur[0] + dx, cur[1] + dy)
            if 0 <= nxt[0] < cols and 0 <= nxt[1] < rows and nxt not in walls:
                if nxt not in costs or cost + 1 < costs[nxt]:
                    costs[nxt] = cost + 1
                    h = abs(nxt[0] - goal[0]) + abs(nxt[1] - goal[1]) # Manhattan heuristic
                    heapq.heappush(heap, (cost + 1 + h, cost + 1, nxt, path + [nxt]))
    return []`;
    }

    return `// JavaScript (ES2024): 60 FPS HTML5 Canvas Vector Physics
class ParticleEngine {
  constructor(count = ${particleCount}, mode = "${physicsForceMode}") {
    this.particles = Array.from({ length: count }, () => new VectorParticle());
    this.forceMode = mode;
  }

  step() {
    this.particles.forEach(p => {
      if (this.forceMode === "vortex") p.applyOrbitalVelocity();
      if (this.forceMode === "gravity") p.applyGravity(0.12);
      p.updatePositionAndBounce();
    });
    this.renderProximityMesh();
  }
}`;
  };

  const handleCopyCode = () => {
    soundFx.playSuccess();
    navigator.clipboard.writeText(getDynamicCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const activeBugsCount = bugs.filter((b) => !b.isSmashed && !b.isSnapping).length;

  return (
    <section id="skills" className="reveal-item px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold font-rubik text-zinc-100 tracking-tight">
            Creative Engineering Lab
          </h2>
        </div>
        <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Interactive Runtime
        </span>
      </div>

      {/* 4 Multi-Stack Engineering Studios */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {/* Studio 1: Playable Piano */}
        <button
          onClick={() => {
            soundFx.playClick(900);
            setActiveMode("piano");
          }}
          className={`p-3 rounded-2xl flex items-center gap-2.5 transition-all text-left cursor-pointer border ${
            activeMode === "piano"
              ? "bg-zinc-800/90 border-emerald-500/50 shadow-md scale-[1.01]"
              : "bg-zinc-950/70 border-white/[0.06] hover:bg-zinc-900 text-zinc-400"
          }`}
        >
          <LuMusic
            className={`w-4 h-4 shrink-0 ${
              activeMode === "piano" ? "text-emerald-400" : "text-zinc-500"
            }`}
          />
          <div className="min-w-0">
            <div className="text-xs font-rubik font-semibold text-white truncate">
              Playable Piano
            </div>
            <div className="text-[10px] font-mono text-cyan-400 truncate">
              Web Audio Synth
            </div>
          </div>
        </button>

        {/* Studio 2: Gamified QA Bug Smasher */}
        <button
          onClick={() => {
            soundFx.playClick(900);
            setActiveMode("qa");
          }}
          className={`p-3 rounded-2xl flex items-center gap-2.5 transition-all text-left cursor-pointer border ${
            activeMode === "qa"
              ? "bg-zinc-800/90 border-emerald-500/50 shadow-md scale-[1.01]"
              : "bg-zinc-950/70 border-white/[0.06] hover:bg-zinc-900 text-zinc-400"
          }`}
        >
          <LuBug
            className={`w-4 h-4 shrink-0 ${
              activeMode === "qa" ? "text-emerald-400" : "text-zinc-500"
            }`}
          />
          <div className="min-w-0">
            <div className="text-xs font-rubik font-semibold text-white truncate">
              QA Bug Smasher
            </div>
            <div className="text-[10px] font-mono text-emerald-400 truncate">
              Defect Hunter Arcade
            </div>
          </div>
        </button>

        {/* Studio 3: Maze Pathfinding */}
        <button
          onClick={() => {
            soundFx.playClick(900);
            setActiveMode("pathfinding");
          }}
          className={`p-3 rounded-2xl flex items-center gap-2.5 transition-all text-left cursor-pointer border ${
            activeMode === "pathfinding"
              ? "bg-zinc-800/90 border-emerald-500/50 shadow-md scale-[1.01]"
              : "bg-zinc-950/70 border-white/[0.06] hover:bg-zinc-900 text-zinc-400"
          }`}
        >
          <LuCompass
            className={`w-4 h-4 shrink-0 ${
              activeMode === "pathfinding" ? "text-emerald-400" : "text-zinc-500"
            }`}
          />
          <div className="min-w-0">
            <div className="text-xs font-rubik font-semibold text-white truncate">
              Maze Pathfinding
            </div>
            <div className="text-[10px] font-mono text-emerald-400 truncate">
              Python 3 &bull; A*, BFS
            </div>
          </div>
        </button>

        {/* Studio 4: Canvas Physics */}
        <button
          onClick={() => {
            soundFx.playClick(900);
            setActiveMode("physics");
          }}
          className={`p-3 rounded-2xl flex items-center gap-2.5 transition-all text-left cursor-pointer border ${
            activeMode === "physics"
              ? "bg-zinc-800/90 border-emerald-500/50 shadow-md scale-[1.01]"
              : "bg-zinc-950/70 border-white/[0.06] hover:bg-zinc-900 text-zinc-400"
          }`}
        >
          <LuZap
            className={`w-4 h-4 shrink-0 ${
              activeMode === "physics" ? "text-emerald-400" : "text-zinc-500"
            }`}
          />
          <div className="min-w-0">
            <div className="text-xs font-rubik font-semibold text-white truncate">
              Canvas Physics
            </div>
            <div className="text-[10px] font-mono text-yellow-400 truncate">
              JavaScript &bull; 60 FPS
            </div>
          </div>
        </button>
      </div>

      {/* Main Studio Workspace: Code on Left (5 cols) vs Live Visual Stage on Right (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Code & Controls (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-5 border border-white/[0.1] bg-[#070709] flex flex-col justify-between space-y-4">
          <div>
            {/* Window Chrome */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                <span className="text-xs font-mono text-zinc-400 font-medium ml-1">
                  {activeMode === "piano" && "piano_synthesizer.ts"}
                  {activeMode === "qa" && "test_bug_hunter.py"}
                  {activeMode === "pathfinding" && "graph_pathfinder.py"}
                  {activeMode === "physics" && "physics_vectors.js"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    activeMode === "pathfinding" || activeMode === "qa"
                      ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/30"
                      : activeMode === "physics"
                      ? "bg-yellow-950/80 text-yellow-300 border-yellow-500/30"
                      : "bg-cyan-950/80 text-cyan-300 border-cyan-500/30"
                  }`}
                >
                  {activeMode === "pathfinding" || activeMode === "qa"
                    ? "Python 3"
                    : activeMode === "physics"
                    ? "JavaScript"
                    : "TypeScript"}
                </span>

                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-white/[0.06] text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy code"
                >
                  {copiedCode ? (
                    <LuCheck className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <LuCopy className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[11px]">{copiedCode ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Dynamic Code Viewer */}
            <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-white/[0.06] font-mono text-[11px] text-zinc-300 leading-relaxed overflow-x-auto max-h-[190px] scrollbar-hide">
              <pre>
                <code>{getDynamicCodeSnippet()}</code>
              </pre>
            </div>
          </div>

          {/* Interactive Parameters Strip */}
          <div className="space-y-3 pt-3 border-t border-white/[0.06]">
            {/* 1. PIANO CONTROLS */}
            {activeMode === "piano" && (
              <div className="space-y-2.5 text-xs font-mono">
                <span className="text-zinc-400 block">Select Song Preset to Auto-Play:</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {SONG_PRESETS.map((song) => (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick(900);
                        setSelectedSongId(song.id);
                      }}
                      className={`p-2 rounded-xl text-left text-[11px] font-mono transition-all cursor-pointer flex items-center justify-between ${
                        selectedSongId === song.id
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                          : "bg-zinc-900 text-zinc-400 hover:bg-zinc-850"
                      }`}
                    >
                      <span className="truncate">{song.title}</span>
                      <span className="text-[10px] opacity-75">{song.notes.length} notes</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. QA BUG SMASHER TELEMETRY HUD */}
            {activeMode === "qa" && (
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-bold">Defect Telemetry:</span>
                    <span
                      className={`px-2 py-0.5 rounded border font-bold ${
                        hasBeenSnapped || activeBugsCount === 0
                          ? "bg-emerald-950 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-950/80 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {hasBeenSnapped || activeBugsCount === 0
                        ? "0 Bugs Alive"
                        : viewportBreachActive
                        ? `${activeBugsCount} Crawling (Breached to Viewport!)`
                        : `${activeBugsCount} Crawling in Arena`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-300">
                    <span>Purged by Smasher / Gauntlet:</span>
                    <span className="text-emerald-400 font-bold font-mono">{smashedCount} defects eliminated</span>
                  </div>

                  <p className="text-[11px] text-zinc-400 font-rubik leading-relaxed">
                    {viewportBreachActive
                      ? "⚠️ Containment breach! Bugs have escaped into your browser viewport! Smash them anywhere, or launch the Viewport Infinity Snap!"
                      : "Defects crawl inside the arena. Play and smash them with your hammer—beware, after playing they might escape onto your screen!"}
                  </p>
                </div>
              </div>
            )}

            {/* 3. PATHFINDING CONTROLS */}
            {activeMode === "pathfinding" && (
              <div className="space-y-2.5 text-xs font-mono">
                {/* Algorithm Selector */}
                <div>
                  <span className="text-zinc-400 block mb-1">Graph Search Algorithm:</span>
                  <div className="grid grid-cols-4 gap-1">
                    {(["astar", "dijkstra", "bfs", "dfs"] as PathAlgorithm[]).map((algo) => (
                      <button
                        key={algo}
                        type="button"
                        onClick={() => {
                          soundFx.playClick(900);
                          setSelectedAlgo(algo);
                          setVisitedNodes([]);
                          setShortestPath([]);
                        }}
                        className={`py-1 px-1 rounded-lg text-center text-[10px] font-mono uppercase cursor-pointer transition-all ${
                          selectedAlgo === algo
                            ? "bg-emerald-400 text-zinc-950 font-bold shadow-sm"
                            : "bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white"
                        }`}
                      >
                        {algo === "astar" ? "A*" : algo.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid Density Selector */}
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-zinc-400">Resolution:</span>
                  <div className="flex items-center gap-1">
                    {(["coarse", "standard", "dense"] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleGridDensityChange(d)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase cursor-pointer ${
                          gridDensity === d
                            ? "bg-white text-zinc-950 font-bold"
                            : "bg-zinc-900 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Random Maze Button */}
                <div className="flex items-center justify-between pt-0.5">
                  <button
                    type="button"
                    onClick={generateRandomMaze}
                    className="py-1.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <LuDices className="w-3.5 h-3.5 text-emerald-400" />
                    <span>🎲 Random Walls</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveTool("start")}
                      className={`p-1 rounded text-[10px] ${
                        activeTool === "start" ? "bg-emerald-500 text-zinc-950 font-bold" : "bg-zinc-900 text-zinc-400"
                      }`}
                      title="Set Start"
                    >
                      Start
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTool("goal")}
                      className={`p-1 rounded text-[10px] ${
                        activeTool === "goal" ? "bg-red-500 text-white font-bold" : "bg-zinc-900 text-zinc-400"
                      }`}
                      title="Set Goal"
                    >
                      Goal
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTool("wall")}
                      className={`p-1 rounded text-[10px] ${
                        activeTool === "wall" ? "bg-zinc-600 text-white font-bold" : "bg-zinc-900 text-zinc-400"
                      }`}
                      title="Draw Wall"
                    >
                      Wall
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. PHYSICS CONTROLS */}
            {activeMode === "physics" && (
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Particle Density:</span>
                  <span className="text-emerald-400 font-bold">{particleCount} units</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={particleCount}
                  onChange={(e) => setParticleCount(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-zinc-400">Force Dynamic:</span>
                  <div className="flex items-center gap-1.5">
                    {(["scatter", "vortex", "gravity"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPhysicsForceMode(mode)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer uppercase ${
                          physicsForceMode === mode
                            ? "bg-emerald-400 text-zinc-950 font-bold"
                            : "bg-zinc-900 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Master Run Action */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (activeMode === "piano") {
                    if (isPlayingSong) handleStopSong();
                    else handleAutoPlaySong();
                  } else if (activeMode === "qa") {
                    if (hasBeenSnapped || activeBugsCount === 0) {
                      handleResetBugSimulation();
                    } else {
                      handleThanosSnapSequence();
                    }
                  } else if (activeMode === "pathfinding") {
                    runSequentialPathfinder();
                  } else if (activeMode === "physics") {
                    soundFx.playSuccess();
                    particlesRef.current.forEach((p) => {
                      p.vx = (Math.random() - 0.5) * 8;
                      p.vy = (Math.random() - 0.5) * 8;
                    });
                  }
                }}
                disabled={isSolving || (gauntletPhase !== "hidden" && !hasBeenSnapped)}
                className={`flex-1 py-3 rounded-2xl font-rubik text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl active:scale-98 ${
                  isSolving
                    ? "bg-emerald-600 text-white cursor-wait"
                    : gauntletPhase !== "hidden"
                    ? "bg-amber-500 text-zinc-950 cursor-wait animate-pulse"
                    : hasBeenSnapped || activeBugsCount === 0
                    ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/[0.1]"
                    : isPlayingSong
                    ? "bg-amber-500 hover:bg-amber-400 text-zinc-950"
                    : "bg-emerald-400 hover:bg-emerald-300 text-zinc-950 shadow-emerald-500/25"
                }`}
              >
                {isSolving ? (
                  <>
                    <LuRotateCcw className="w-4 h-4 animate-spin" />
                    <span>Tracing Search Wavefront...</span>
                  </>
                ) : gauntletPhase !== "hidden" ? (
                  <>
                    <LuRotateCcw className="w-4 h-4 animate-spin" />
                    <span>Executing Viewport Infinity Snap...</span>
                  </>
                ) : isPlayingSong ? (
                  <>
                    <LuRotateCcw className="w-4 h-4 animate-spin" />
                    <span>Stop Auto-Play ⏹</span>
                  </>
                ) : hasBeenSnapped || activeBugsCount === 0 ? (
                  <>
                    <LuRotateCcw className="w-4 h-4 text-emerald-400" />
                    <span>Reset &amp; Re-simulate Bugs ↻</span>
                  </>
                ) : (
                  <>
                    <LuPlay className="w-4 h-4 fill-current" />
                    <span>
                      {activeMode === "piano" && "Auto-Play Song on Piano ♫"}
                      {activeMode === "qa" && "Launch QA Automation Bot (Infinity Snap)"}
                      {activeMode === "pathfinding" && "Solve Maze Sequentially"}
                      {activeMode === "physics" && "Run Physics Impulse"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: LIVING VISUAL STAGE (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl border border-white/[0.1] shadow-2xl bg-[#060608] flex flex-col justify-between overflow-hidden relative min-h-[410px]">
          {/* Stage Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-zinc-950 border-b border-white/[0.08] text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">Live Visual Stage</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              Hardware Interactive Computing
            </span>
          </div>

          {/* STAGE WORKSPACE */}
          <div className="flex-1 p-3 sm:p-4 flex flex-col justify-center relative overflow-hidden">
            {/* 1. PLAYABLE PIANO STAGE (Fixed, Non-Shifting, Fast Polyphony) */}
            {activeMode === "piano" && (
              <div className="space-y-4 p-4 rounded-2xl bg-zinc-950/90 border border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-rubik font-bold text-white text-base">
                      Interactive Web Audio Piano
                    </h4>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      Click any key to play notes, or hit Auto-Play above!
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                    {activeKeys.size > 0
                      ? `Active: ${Array.from(activeKeys).join(", ")}`
                      : "Ready to Play"}
                  </span>
                </div>

                {/* THE PIANO KEYBOARD - FIXED NON-SHIFTING GEOMETRY */}
                <div className="w-full h-36 bg-black/90 p-2 rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden flex justify-center">
                  <div className="flex w-full h-full relative select-none">
                    {PIANO_KEYBOARD.map((item) => {
                      const isWhiteActive = activeKeys.has(item.note);
                      const hasBlack = !!item.blackKey;
                      const isBlackActive = hasBlack && activeKeys.has(item.blackKey!.note);

                      return (
                        <div key={item.note} className="relative flex-1 h-full">
                          {/* White Key */}
                          <button
                            type="button"
                            onClick={() => playPianoNote(item.freq, item.note)}
                            className={`w-full h-full rounded-b-xl border border-zinc-400/30 transition-colors duration-75 flex flex-col justify-end items-center pb-2 cursor-pointer outline-none focus:outline-none ${
                              isWhiteActive
                                ? "bg-emerald-400 text-zinc-950 font-bold shadow-inner"
                                : "bg-gradient-to-b from-zinc-100 to-zinc-300 hover:from-white hover:to-zinc-200 text-zinc-800 font-mono shadow-md"
                            }`}
                          >
                            <span className="text-[10px] font-bold opacity-75">{item.note}</span>
                          </button>

                          {/* Black Key */}
                          {hasBlack && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playPianoNote(item.blackKey!.freq, item.blackKey!.note);
                              }}
                              className={`absolute top-0 -right-[30%] w-[60%] h-[60%] rounded-b-lg border border-black z-20 transition-colors duration-75 flex flex-col justify-end items-center pb-1 cursor-pointer outline-none focus:outline-none ${
                                isBlackActive
                                  ? "bg-emerald-400 text-zinc-950 font-bold shadow-inner"
                                  : "bg-gradient-to-b from-zinc-900 to-black hover:from-zinc-800 hover:to-zinc-950 text-white/80 shadow-2xl"
                              }`}
                            >
                              <span className="text-[7px] font-bold opacity-80">
                                {item.blackKey!.note.replace("#", "♯")}
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-xs text-zinc-400 font-rubik text-center">
                  Synthesized via browser&apos;s native Web Audio API oscillators. Pure mathematical sound waves!
                </p>
              </div>
            )}

            {/* 2. FULL-STAGE QA BUG SMASHER ARCADE */}
            {activeMode === "qa" && (
              <div
                ref={arenaRef}
                onMouseEnter={() => setIsHoveringArena(true)}
                onMouseLeave={() => {
                  setIsHoveringArena(false);
                  setIsMouseDown(false);
                }}
                onMouseMove={(e) => {
                  const rect = arenaRef.current?.getBoundingClientRect();
                  if (rect) {
                    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                  }
                }}
                onMouseDown={() => setIsMouseDown(true)}
                onMouseUp={() => setIsMouseDown(false)}
                className="relative w-full h-[350px] sm:h-[370px] rounded-2xl bg-gradient-to-b from-zinc-950 via-[#09090d] to-zinc-900 border border-white/[0.08] shadow-inner overflow-hidden select-none cursor-crosshair sm:cursor-none flex flex-col justify-between p-3.5"
              >
                {/* HUD Header inside Stage */}
                <div className="flex items-center justify-between z-30 pointer-events-auto">
                  <div className="flex items-center gap-2">
                    <LuShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="font-rubik font-bold text-white text-sm sm:text-base">
                      Enterprise QA: Defect Smasher Arena
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2.5 py-1 rounded-xl bg-zinc-900/90 text-zinc-300 border border-white/[0.08] shadow">
                      Smashed: <strong className="text-emerald-400">{smashedCount}</strong>
                    </span>

                    {viewportBreachActive && !hasBeenSnapped && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-lg bg-amber-950/90 border border-amber-500/40 text-amber-300 font-bold animate-pulse text-[10px]">
                        ⚠️ Escaped to Viewport!
                      </span>
                    )}

                    <span
                      className={`px-2.5 py-1 rounded-xl border shadow font-bold ${
                        hasBeenSnapped || activeBugsCount === 0
                          ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                          : "bg-amber-950/80 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {hasBeenSnapped || activeBugsCount === 0 ? "100% Defect-Free" : `${activeBugsCount} Crawling`}
                    </span>

                    {/* Reset Button when purged */}
                    {hasBeenSnapped && (
                      <button
                        type="button"
                        onClick={handleResetBugSimulation}
                        className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs flex items-center gap-1 border border-white/[0.1] shadow cursor-pointer transition-colors"
                        title="Restart bug simulation"
                      >
                        <LuRotateCcw className="w-3 h-3 text-emerald-400" />
                        <span>Reset ↻</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Subtle code matrix watermark */}
                <div className="absolute inset-0 p-4 opacity-10 font-mono text-[9px] text-zinc-400 pointer-events-none overflow-hidden">
                  <code>
                    def test_render(): assert memory &lt; 50MB assert status == 200 # QA Defense Grid Active
                  </code>
                </div>

                {/* Local Arena Smashed Particle Splats */}
                {splats.map((s) => (
                  <div
                    key={s.id}
                    style={{ left: s.x, top: s.y }}
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-40 text-emerald-400 font-mono font-bold text-xs animate-ping"
                  >
                    💥 SMASH!
                  </div>
                ))}

                {/* PC Custom Hammer Smasher Cursor (Inside Local Arena) */}
                {isHoveringArena && gauntletPhase === "hidden" && (
                  <div
                    className="pointer-events-none absolute z-50 select-none transition-transform duration-75 hidden sm:block"
                    style={{
                      left: mousePos.x,
                      top: mousePos.y,
                      transform: `translate(-15%, -85%) ${
                        isMouseDown ? "rotate(-42deg) scale(0.92)" : "rotate(0deg)"
                      }`,
                      transformOrigin: "bottom right",
                    }}
                  >
                    <span className="text-3xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)] block">
                      🔨
                    </span>
                  </div>
                )}

                {/* Active, Dissipating, or Smashed Bugs (Local Arena Bugs) */}
                {bugs
                  .filter((b) => !b.isViewport)
                  .map((bug) => (
                    <div
                      key={bug.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!bug.isSmashed && !bug.isSnapping) {
                          const rect = arenaRef.current?.getBoundingClientRect();
                          const cx = rect ? e.clientX - rect.left : mousePos.x;
                          const cy = rect ? e.clientY - rect.top : mousePos.y;
                          smashSingleBug(bug.id, cx, cy, false);
                        }
                      }}
                      style={{ left: `${bug.x}%`, top: `${bug.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 select-none p-2 rounded-full cursor-pointer transition-none z-20"
                      title={bug.isSmashed ? "Fixed!" : `Smash ${bug.name}!`}
                    >
                      {/* Inner Bug Element (Animates on snap / smash) */}
                      <div
                        className={`transition-all duration-1000 ${
                          bug.isSnapping
                            ? "scale-150 opacity-0 blur-sm -translate-y-12 brightness-200 pointer-events-none"
                            : bug.isSmashed
                            ? "scale-75 opacity-70 pointer-events-none"
                            : "hover:scale-125 active:scale-95"
                        }`}
                      >
                        {/* Dissipating Dust Particles */}
                        {bug.isSnapping && (
                          <div className="absolute inset-0 pointer-events-none">
                            {[...Array(8)].map((_, i) => (
                              <span
                                key={i}
                                className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ping"
                                style={{
                                  left: `${(i % 3) * 12 - 6}px`,
                                  top: `${Math.floor(i / 3) * -12 - 4}px`,
                                  animationDuration: `${0.4 + i * 0.1}s`,
                                }}
                              />
                            ))}
                          </div>
                        )}

                        {bug.isSmashed ? (
                          <div className="flex items-center gap-1 bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[9px] font-mono shadow-md font-bold">
                            <LuCheck className="w-3 h-3" />
                            <span>FIXED</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center group">
                            <span className="text-2xl filter drop-shadow-[0_2px_8px_rgba(239,68,68,0.6)] animate-pulse">
                              {bug.icon}
                            </span>
                            <span className="text-[9px] font-mono font-bold bg-red-950/85 text-red-300 px-1.5 py-0.5 rounded border border-red-500/40 whitespace-nowrap shadow-sm mt-0.5">
                              {bug.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                {/* Stage Bottom Footer */}
                <div className="z-30 pointer-events-none">
                  {gauntletPhase !== "hidden" ? (
                    <div className="flex items-center justify-center text-[10px] font-mono text-amber-300 bg-black/80 backdrop-blur px-3 py-1.5 rounded-xl border border-amber-500/40">
                      <span>Full-Viewport Infinity Snap in progress...</span>
                    </div>
                  ) : hasBeenSnapped || activeBugsCount === 0 ? (
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 bg-black/60 backdrop-blur px-3 py-1.5 rounded-xl border border-emerald-500/30">
                      <span className="text-emerald-400 font-bold">✓ 100% Release Verified • All Defects Purged</span>
                      <span className="text-zinc-400">Click &apos;Reset ↻&apos; anytime to re-simulate</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 bg-black/60 backdrop-blur px-3 py-1.5 rounded-xl border border-white/[0.04]">
                      <span className="flex items-center gap-1.5">
                        <LuTarget className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                        {viewportBreachActive
                          ? "Containment breached! Bugs are crawling across your browser screen!"
                          : "Smash bugs in the arena—play longer and watch what happens!"}
                      </span>
                      <span className="text-emerald-400 font-bold">{activeBugsCount} crawling</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. MAZE PATHFINDING STAGE */}
            {activeMode === "pathfinding" && (
              <div className="space-y-3">
                {/* Popular App Explanation Box */}
                <div className="p-3 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-xs font-rubik font-bold text-white flex items-center gap-1.5">
                      <span className="text-emerald-400 font-mono">Algorithm:</span>
                      {ALGO_DESCRIPTIONS[selectedAlgo].title}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      {ALGO_DESCRIPTIONS[selectedAlgo].badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-1 rounded-lg border border-cyan-500/20">
                    <span className="font-bold text-white shrink-0">Real Apps:</span>
                    <span className="truncate font-semibold">{ALGO_DESCRIPTIONS[selectedAlgo].popularApps}</span>
                  </div>

                  <p className="text-[11px] text-zinc-300 font-rubik leading-relaxed">
                    {ALGO_DESCRIPTIONS[selectedAlgo].nonTech}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    CS Theory: {ALGO_DESCRIPTIONS[selectedAlgo].tech}
                  </p>
                </div>

                {/* Fixed Container Height Maze */}
                <div className="h-[200px] w-full p-2 rounded-2xl bg-zinc-950/90 border border-white/[0.06] flex items-center justify-center">
                  <div
                    className="grid gap-1 select-none w-full h-full"
                    style={{
                      gridTemplateColumns: `repeat(${gridDims.cols}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${gridDims.rows}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: gridDims.rows }).map((_, r) =>
                      Array.from({ length: gridDims.cols }).map((_, c) => {
                        const isStart = c === startNode.x && r === startNode.y;
                        const isGoal = c === goalNode.x && r === goalNode.y;
                        const isWall = walls.some((w) => w.x === c && w.y === r);
                        const isPath = shortestPath.some((p) => p.x === c && p.y === r);
                        const isExplored = visitedNodes.some((v) => v.x === c && v.y === r);

                        let bgClass = "bg-zinc-900/80 hover:bg-zinc-800";
                        if (isStart) bgClass = "bg-emerald-500 text-zinc-950 font-bold shadow-lg ring-2 ring-white/50";
                        else if (isGoal) bgClass = "bg-red-500 text-white font-bold shadow-lg ring-2 ring-white/50";
                        else if (isWall) bgClass = "bg-zinc-700 border-zinc-600 scale-95";
                        else if (isPath) bgClass = "bg-emerald-400 shadow-md scale-105 animate-pulse text-zinc-950 font-bold";
                        else if (isExplored) bgClass = "bg-cyan-950/80 border border-cyan-500/30";

                        return (
                          <div
                            key={`${c}-${r}`}
                            onClick={() => handleGridCellClick(c, r)}
                            className={`rounded-md cursor-pointer flex items-center justify-center text-[10px] font-mono transition-all duration-100 ${bgClass}`}
                            title={`Tile (${c}, ${r}) - Tool: ${activeTool}`}
                          >
                            {isStart ? "S" : isGoal ? "G" : isPath ? "•" : ""}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500" /> Start</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500" /> Goal</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-zinc-700" /> Wall</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-400" /> Shortest Path</span>
                  </div>
                  <span className="text-emerald-400">
                    Steps: {shortestPath.length || algoStats.pathLength} &bull; Explored: {visitedNodes.length || algoStats.exploredCount}
                  </span>
                </div>
              </div>
            )}

            {/* 4. CANVAS PHYSICS STAGE */}
            {activeMode === "physics" && (
              <div className="w-full h-full flex flex-col justify-between space-y-3">
                <canvas
                  ref={canvasRef}
                  onMouseMove={handleCanvasMouseMove}
                  className="w-full h-[230px] rounded-2xl bg-zinc-950/90 border border-white/[0.06] cursor-crosshair shadow-inner"
                  title="Hover your cursor over the canvas to push particles!"
                />
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Hover cursor over canvas to repel particles</span>
                  <span className="text-yellow-400 font-bold">JavaScript &bull; 60 FPS Vectors</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 5. PLAYFUL FULL-VIEWPORT CRAWLING BUGS (Emerges after playing!)  */}
      {/* ================================================================= */}
      {activeMode === "qa" && viewportBreachActive && (
        <div className="fixed inset-0 pointer-events-none z-[9980] overflow-hidden">
          {bugs
            .filter((b) => b.isViewport)
            .map((bug) => (
              <div
                key={bug.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!bug.isSmashed && !bug.isSnapping) {
                    smashSingleBug(bug.id, e.clientX, e.clientY, true);
                  }
                }}
                style={{ left: `${bug.x}vw`, top: `${bug.y}vh` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 select-none p-2 rounded-full cursor-pointer pointer-events-auto transition-none"
                title={bug.isSmashed ? "Fixed!" : `Smash rogue ${bug.name}!`}
              >
                {/* Inner Bug Element (Animates on snap / smash) */}
                <div
                  className={`transition-all duration-1000 ${
                    bug.isSnapping
                      ? "scale-150 opacity-0 blur-sm -translate-y-14 brightness-200 pointer-events-none"
                      : bug.isSmashed
                      ? "scale-75 opacity-70 pointer-events-none"
                      : "hover:scale-125 active:scale-95"
                  }`}
                >
                  {/* Dissipation Particles */}
                  {bug.isSnapping && (
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(8)].map((_, i) => (
                        <span
                          key={i}
                          className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] animate-ping"
                          style={{
                            left: `${(i % 3) * 14 - 7}px`,
                            top: `${Math.floor(i / 3) * -14 - 6}px`,
                            animationDuration: `${0.4 + i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {bug.isSmashed ? (
                    <div className="flex items-center gap-1 bg-emerald-950/95 text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded-full text-[9px] font-mono shadow-xl font-bold backdrop-blur-md">
                      <LuCheck className="w-3 h-3" />
                      <span>FIXED</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center group">
                      <span className="text-2xl filter drop-shadow-[0_2px_12px_rgba(239,68,68,0.8)] animate-pulse">
                        {bug.icon}
                      </span>
                      <span className="text-[9px] font-mono font-bold bg-black/85 text-red-300 px-1.5 py-0.5 rounded border border-red-500/50 whitespace-nowrap shadow-lg mt-0.5 backdrop-blur-sm">
                        {bug.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

          {/* Viewport Smashed Particle Splats */}
          {viewportSplats.map((s) => (
            <div
              key={s.id}
              style={{ left: s.x, top: s.y }}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-[9985] text-emerald-400 font-mono font-bold text-sm animate-ping drop-shadow-[0_0_10px_#10b981]"
            >
              💥 SMASH!
            </div>
          ))}
        </div>
      )}

      {/* ================================================================= */}
      {/* 6. CINEMATIC FULL-VIEWPORT INFINITY GAUNTLET OVERLAY */}
      {/* ================================================================= */}
      {gauntletPhase !== "hidden" && (
        <div className="fixed inset-0 z-[99999] pointer-events-none flex items-center justify-center overflow-hidden">
          {/* Deep cinematic space vignette across the entire browser viewport */}
          <div
            className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-1000 ${
              gauntletPhase === "appearing" || gauntletPhase === "snapping"
                ? "opacity-100"
                : "opacity-0"
            }`}
          />

          {/* Full Viewport Cosmic Shockwave Ring on Snap */}
          {gauntletPhase === "snapping" && (
            <div className="absolute w-[180vw] h-[180vw] max-w-[1600px] max-h-[1600px] rounded-full border-4 border-amber-300 shadow-[0_0_120px_#f59e0b] animate-ping duration-1000 pointer-events-none" />
          )}

          <div
            className={`relative z-10 flex flex-col items-center justify-center transition-all duration-700 ${
              gauntletPhase === "appearing"
                ? "scale-115 opacity-100 filter drop-shadow-[0_0_60px_rgba(234,179,8,0.9)]"
                : gauntletPhase === "snapping"
                ? "scale-140 opacity-100 filter brightness-150 drop-shadow-[0_0_100px_rgba(245,158,11,1)]"
                : "scale-90 opacity-0 filter blur-xl"
            }`}
          >
            {/* Colossal High-Fidelity Golden Infinity Gauntlet SVG */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56">
              <svg viewBox="0 0 120 120" className="w-full h-full filter drop-shadow-[0_12px_32px_rgba(0,0,0,0.95)]">
                <defs>
                  <linearGradient id="vpGoldShine" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fffbeb" />
                    <stop offset="30%" stopColor="#fde047" />
                    <stop offset="70%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>
                  <linearGradient id="vpGoldPlate" x1="20%" y1="0%" x2="80%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#92400e" />
                  </linearGradient>
                  <radialGradient id="vpMindStoneGrad">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="30%" stopColor="#fef08a" />
                    <stop offset="70%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#ca8a04" />
                  </radialGradient>
                  <radialGradient id="vpPowerStoneGrad">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="40%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#7e22ce" />
                  </radialGradient>
                  <radialGradient id="vpSpaceStoneGrad">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="40%" stopColor="#67e8f9" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </radialGradient>
                  <radialGradient id="vpRealityStoneGrad">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="40%" stopColor="#f87171" />
                    <stop offset="100%" stopColor="#b91c1c" />
                  </radialGradient>
                  <radialGradient id="vpSoulStoneGrad">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="40%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#c2410c" />
                  </radialGradient>
                  <radialGradient id="vpTimeStoneGrad">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="40%" stopColor="#4ade80" />
                    <stop offset="100%" stopColor="#15803d" />
                  </radialGradient>
                </defs>

                {/* Forearm Bracer and Armor Segment */}
                <path
                  d="M38 112 L34 82 C34 78 37 74 41 74 L79 74 C83 74 86 78 86 82 L82 112 Z"
                  fill="url(#vpGoldPlate)"
                  stroke="#78350f"
                  strokeWidth="2"
                />
                {/* Bracer Nordic Inlay Lines */}
                <path d="M44 80 L76 80 M42 92 L78 92 M40 104 L80 104" stroke="#78350f" strokeWidth="1.5" opacity="0.6" />

                {/* Palm & Back-of-Hand Plate */}
                <path
                  d="M34 78 L32 52 C32 46 36 42 42 42 L78 42 C84 42 88 46 88 52 L86 78 Z"
                  fill="url(#vpGoldShine)"
                  stroke="#78350f"
                  strokeWidth="2"
                />

                {/* 4 Articulated Knuckle Guards */}
                <rect x="36" y="38" width="10" height="12" rx="3" fill="url(#vpGoldPlate)" stroke="#78350f" strokeWidth="1.5" />
                <rect x="49" y="34" width="10" height="14" rx="3" fill="url(#vpGoldPlate)" stroke="#78350f" strokeWidth="1.5" />
                <rect x="62" y="36" width="10" height="13" rx="3" fill="url(#vpGoldPlate)" stroke="#78350f" strokeWidth="1.5" />
                <rect x="75" y="40" width="9" height="11" rx="3" fill="url(#vpGoldPlate)" stroke="#78350f" strokeWidth="1.5" />

                {/* Thumb Plating */}
                <path
                  d="M33 64 L20 54 C17 51 18 46 22 45 L30 46 L34 54 Z"
                  fill="url(#vpGoldShine)"
                  stroke="#78350f"
                  strokeWidth="2"
                />

                {/* 6 Radiant Infinity Stones Embedded in Armor */}
                <circle cx="41" cy="44" r="3.2" fill="url(#vpPowerStoneGrad)" stroke="#f3e8ff" strokeWidth="0.8" filter="drop-shadow(0 0 8px #c084fc)" />
                <circle cx="54" cy="41" r="3.4" fill="url(#vpSpaceStoneGrad)" stroke="#e0f2fe" strokeWidth="0.8" filter="drop-shadow(0 0 8px #38bdf8)" />
                <circle cx="67" cy="42.5" r="3.2" fill="url(#vpRealityStoneGrad)" stroke="#fee2e2" strokeWidth="0.8" filter="drop-shadow(0 0 8px #ef4444)" />
                <circle cx="79.5" cy="45.5" r="2.8" fill="url(#vpSoulStoneGrad)" stroke="#ffedd5" strokeWidth="0.8" filter="drop-shadow(0 0 8px #f97316)" />
                <circle cx="25" cy="49" r="3.0" fill="url(#vpTimeStoneGrad)" stroke="#dcfce7" strokeWidth="0.8" filter="drop-shadow(0 0 8px #22c55e)" />

                {/* Mind Stone (Large Center Jewel) */}
                <ellipse cx="60" cy="60" rx="7" ry="8.5" fill="url(#vpMindStoneGrad)" stroke="#fff" strokeWidth="1.2" filter="drop-shadow(0 0 16px #facc15)" />
                <polygon points="60,53 65,58 60,67 55,58" fill="#ffffff" opacity="0.6" />
              </svg>
            </div>

            <span className="text-xs sm:text-sm font-mono font-bold text-amber-300 tracking-widest uppercase bg-black/90 px-4 py-1.5 rounded-full border border-amber-500/50 mt-2 shadow-2xl backdrop-blur-md">
              {gauntletPhase === "snapping" ? "⚡ THE SNAP ⚡" : "Infinity Gauntlet"}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
