"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { soundFx } from "@/util/sound";
import { fireConfetti } from "@/util/confetti";
import {
  LuPlay,
  LuCopy,
  LuCheck,
  LuRotateCcw,
  LuZap,
  LuShieldCheck,
  LuCompass,
  LuGauge,
  LuDices,
  LuBug,
  LuTarget,
  LuRocket,
  LuSignalHigh,
  LuTurtle,
  LuWifiOff,
  LuTrophy,
  LuTriangleAlert,
} from "react-icons/lu";
import type { IconType } from "react-icons";

type StudioMode = "latency" | "qa" | "pathfinding" | "physics";
type PathAlgorithm = "astar" | "dijkstra" | "bfs" | "dfs";
type GridTool = "wall" | "start" | "goal";
type BenchmarkPhase = "idle" | "connecting" | "decoy" | "armed" | "result" | "toosoon" | "summary";

interface GridNode {
  x: number;
  y: number;
}

interface RoundResult {
  ms: number;
  falseStart: boolean;
}

const TOTAL_ROUNDS = 5;
const DECOY_CHANCE = 0.35;

// Fully static class-name literals so Tailwind's build-time scanner can find
// them — a dynamically interpolated `text-${color}-400` would get purged.
const LATENCY_TIERS: { max: number; label: string; icon: IconType; textClass: string; barClass: string }[] = [
  { max: 200, label: "Fiber Optic Reflexes", icon: LuZap, textClass: "text-emerald-400", barClass: "bg-emerald-500" },
  { max: 300, label: "Broadband Speed", icon: LuRocket, textClass: "text-cyan-400", barClass: "bg-cyan-500" },
  { max: 450, label: "Solid Connection", icon: LuSignalHigh, textClass: "text-blue-400", barClass: "bg-blue-500" },
  { max: 600, label: "A Bit Laggy", icon: LuTurtle, textClass: "text-amber-400", barClass: "bg-amber-500" },
  { max: Infinity, label: "Dial-Up Vibes", icon: LuWifiOff, textClass: "text-red-400", barClass: "bg-red-500" },
];

function getLatencyTier(ms: number) {
  return LATENCY_TIERS.find((t) => ms <= t.max) ?? LATENCY_TIERS[LATENCY_TIERS.length - 1];
}

const CONNECTING_LOG_LINES = [
  "Resolving host...",
  "Establishing connection...",
  "TLS handshake...",
  "Awaiting response...",
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
    nonTech: "When you click to move in League of Legends or ask Google Maps for directions, A* estimates the straight-line distance to your goal and moves toward it, going around obstacles instead of wandering.",
    tech: "Informed heuristic search minimizing f(n) = g(n) + h(n), where h(n) is the direct Manhattan distance.",
    badge: "GPS & Game AI",
  },
  dijkstra: {
    title: "Dijkstra's Shortest Path",
    popularApps: "Cisco Internet Routers (OSPF), Cloudflare & Google Flights",
    nonTech: "Every time you load a website or search flight layovers, Dijkstra checks the cost of every possible route through millions of connections to find the cheapest one.",
    tech: "Uniform-cost graph traversal exploring lowest cumulative edge cost g(n) via priority queue.",
    badge: "Internet Core & Routing",
  },
  bfs: {
    title: "Breadth-First Search (BFS)",
    popularApps: "LinkedIn ('1st, 2nd, 3rd Degrees'), Facebook & Google Web Crawler",
    nonTech: "LinkedIn checks your direct connections first (1st degree), then theirs (2nd degree), expanding outward one layer at a time until it finds the shortest path between two people.",
    tech: "FIFO queue level-order traversal, guaranteeing fewest hops in unweighted graphs.",
    badge: "Social Networks & Crawlers",
  },
  dfs: {
    title: "Depth-First Search (DFS)",
    popularApps: "Stockfish Chess AI, Sudoku Solvers & Git Branch Merging",
    nonTech: "Stockfish plays out a sequence of moves up to 15 deep, searching for checkmate. Hit a dead end, and it backtracks to try the next branch.",
    tech: "LIFO recursive stack exploration plunging down branches before backtracking.",
    badge: "Game Trees & Solvers",
  },
};

// 12 defect categories
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

// Spawns a bug strictly entering from one of the 4 arena perimeter edges.
// Bugs never spawn directly in the viewport — they can only reach it by
// crawling out through the arena boundary once a breach is active (see the
// movement loop's escape transition below).
function createBugFromEdge(): SoftwareBug {
  const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
  let x = 50;
  let y = 50;
  let vx = 0.5;
  let vy = 0.5;

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
    isViewport: false,
  };
}

// INITIALLY: Arena starts clean, bugs crawl in incrementally one-by-one!
const INITIAL_BUGS: SoftwareBug[] = [];

const ASH_PARTICLE_COUNT = 14;

// MCU-style ash: fine gray dust drifting upward and outward, with the
// occasional glowing ember catching the light — not a symmetric sparkle
// burst. Offsets are derived from the index (not Math.random()) so they
// stay stable across re-renders instead of jittering mid-animation.
function AshParticles({ scale = 1 }: { scale?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(ASH_PARTICLE_COUNT)].map((_, i) => {
        const angle = (i / ASH_PARTICLE_COUNT) * Math.PI * 2 + (i % 2 === 0 ? 0.35 : -0.25);
        const spread = 14 + (i % 5) * 5;
        const dx = Math.cos(angle) * spread * scale;
        const dy = -(26 + (i % 4) * 11) * scale - Math.abs(Math.sin(angle)) * 10 * scale;
        const isEmber = i % 3 === 0;
        const size = (isEmber ? 2 : 1.5) * scale;

        return (
          <span
            key={i}
            className={`absolute rounded-full animate-ash-drift ${
              isEmber ? "bg-amber-400 shadow-[0_0_6px_#f59e0b]" : "bg-zinc-400/90 shadow-[0_0_3px_rgba(161,161,170,0.6)]"
            }`}
            style={{
              width: `${size * 0.4}rem`,
              height: `${size * 0.4}rem`,
              left: `${(i % 3) * 10 - 10}px`,
              top: `${Math.floor(i / 3) * -10 - 4}px`,
              animationDelay: `${(i % 6) * 45}ms`,
              ...({ "--ash-dx": `${dx}px`, "--ash-dy": `${dy}px` } as React.CSSProperties),
            }}
          />
        );
      })}
    </div>
  );
}

export default function TechnicalExpertiseSection() {
  const [activeMode, setActiveMode] = useState<StudioMode>("latency");
  const [copiedCode, setCopiedCode] = useState(false);

  // -----------------------------------------------------------------
  // 1. LATENCY BENCHMARK STATE (human reaction-time / "ping" test)
  // -----------------------------------------------------------------
  const [phase, setPhase] = useState<BenchmarkPhase>("idle");
  const [results, setResults] = useState<RoundResult[]>([]);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const [connectingLines, setConnectingLines] = useState<string[]>([]);
  const [bestEver, setBestEver] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const armTimeRef = useRef(0);
  const bestEverRef = useRef<number | null>(null);
  const benchmarkTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lineIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
  const snapTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const qaStartRef = useRef<number>(Date.now());
  const lastSpawnAtRef = useRef<number>(0);
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

  // Load the persisted best score once on mount — mirrored into a ref so the
  // record-check effect below can compare/update synchronously without
  // re-reading localStorage (see the note on that effect for why).
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("jake_portfolio_latency_best") : null;
    const storedNum = stored ? parseInt(stored, 10) : null;
    bestEverRef.current = storedNum;
    setBestEver(storedNum);
  }, []);

  const scheduleBenchmarkTimer = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    benchmarkTimeoutsRef.current.push(id);
  }, []);

  // Starts one round: streams a fake connection log, waits a random delay
  // (occasionally firing a brief decoy flash first), then arms the stage.
  const startRound = useCallback(() => {
    setPhase("connecting");
    setConnectingLines([]);
    setLastMs(null);

    let lineIdx = 0;
    lineIntervalRef.current = setInterval(() => {
      if (lineIdx >= CONNECTING_LOG_LINES.length) {
        if (lineIntervalRef.current) clearInterval(lineIntervalRef.current);
        return;
      }
      setConnectingLines((prev) => [...prev, CONNECTING_LOG_LINES[lineIdx]]);
      lineIdx++;
    }, 350);

    const waitMs = 1200 + Math.random() * 2300;
    if (Math.random() < DECOY_CHANCE) {
      const decoyAt = waitMs * (0.35 + Math.random() * 0.3);
      scheduleBenchmarkTimer(() => {
        soundFx.playClick(500);
        setPhase("decoy");
        scheduleBenchmarkTimer(() => setPhase("connecting"), 260);
      }, decoyAt);
    }

    scheduleBenchmarkTimer(() => {
      if (lineIntervalRef.current) clearInterval(lineIntervalRef.current);
      armTimeRef.current = performance.now();
      soundFx.playSuccess();
      setPhase("armed");
    }, waitMs);
  }, [scheduleBenchmarkTimer]);

  const handleStartBenchmark = useCallback(() => {
    soundFx.playClick(900);
    benchmarkTimeoutsRef.current.forEach(clearTimeout);
    benchmarkTimeoutsRef.current = [];
    setResults([]);
    setIsNewRecord(false);
    startRound();
  }, [startRound]);

  // The whole stage is the click target during connecting/decoy/armed.
  const handleStageClick = useCallback(() => {
    if (phase === "connecting" || phase === "decoy") {
      benchmarkTimeoutsRef.current.forEach(clearTimeout);
      benchmarkTimeoutsRef.current = [];
      if (lineIntervalRef.current) clearInterval(lineIntervalRef.current);
      soundFx.playClick(200);
      setPhase("toosoon");
      setResults((prev) => [...prev, { ms: 999, falseStart: true }]);
      return;
    }
    if (phase === "armed") {
      const ms = Math.max(1, Math.round(performance.now() - armTimeRef.current));
      soundFx.playSuccess();
      setLastMs(ms);
      setPhase("result");
      setResults((prev) => [...prev, { ms, falseStart: false }]);
    }
  }, [phase]);

  // Auto-advances to the next round (or the summary) a beat after a result
  // lands, so the player doesn't have to click an extra "next" button.
  useEffect(() => {
    if (activeMode !== "latency") return;
    if (phase !== "result" && phase !== "toosoon") return;
    const isLastRound = results.length >= TOTAL_ROUNDS;
    const t = setTimeout(() => {
      if (isLastRound) setPhase("summary");
      else startRound();
    }, 1500);
    return () => clearTimeout(t);
  }, [activeMode, phase, results.length, startRound]);

  // Checks/updates the persisted best score once the run finishes. Compares
  // against bestEverRef (updated synchronously here) rather than re-reading
  // localStorage, so a React Strict Mode double-invocation of this effect
  // body sees its own update on the second pass and no-ops instead of
  // flip-flopping isNewRecord back to false.
  useEffect(() => {
    if (activeMode !== "latency" || phase !== "summary") return;
    const valid = results.filter((r) => !r.falseStart);
    if (valid.length === 0) return;
    const avg = Math.round(valid.reduce((sum, r) => sum + r.ms, 0) / valid.length);

    if (bestEverRef.current === null || avg < bestEverRef.current) {
      bestEverRef.current = avg;
      localStorage.setItem("jake_portfolio_latency_best", String(avg));
      setBestEver(avg);
      setIsNewRecord(true);
      soundFx.playSuccess();
      if (avg < 250) fireConfetti();
    }
  }, [activeMode, phase, results]);

  useEffect(() => {
    return () => {
      snapTimeoutsRef.current.forEach(clearTimeout);
      benchmarkTimeoutsRef.current.forEach(clearTimeout);
      if (lineIntervalRef.current) clearInterval(lineIntervalRef.current);
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
        return [createBugFromEdge()];
      });
      spawnedCount = 1;
    }, 250);

    // Subsequent initial bugs enter one-by-one every 950ms.
    // spawnedCount is incremented HERE, in the plain interval callback, not
    // inside the setBugs updater — React Strict Mode double-invokes updater
    // functions in dev to catch impurities, and a side effect like this one
    // living inside the updater would fire twice per real tick, reaching the
    // cap in half the ticks it should. The updater itself stays a pure
    // function of prev, safe to double-invoke.
    const incrementalTimer = setInterval(() => {
      if (spawnedCount >= maxInitialBugs) {
        clearInterval(incrementalTimer);
        return;
      }
      spawnedCount++;

      setBugs((prev) => {
        const aliveArena = prev.filter((b) => !b.isViewport && !b.isSmashed && !b.isSnapping);
        if (aliveArena.length >= maxInitialBugs) return prev;
        return [...prev, createBugFromEdge()];
      });
    }, 950);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(incrementalTimer);
    };
  }, [activeMode, hasBeenSnapped]);

  // -----------------------------------------------------------------
  // VIEWPORT BREACH TIMER: AFTER 7s PLAYING, BUGS ESCAPE TO VIEWPORT!
  // Keeps time pressure part of the experience — breach also triggers
  // early if the player smashes 2 bugs first (see smashSingleBug).
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
      setBugs((prev) => {
        let viewportCount = prev.filter((b) => b.isViewport && !b.isSmashed && !b.isSnapping).length;
        // Ramps alongside the arena spawn cap so escaped bugs also build up
        // pressure over time. Deliberately generous — the mess IS the joke —
        // still bounded so a 30fps map() over the array never has to work.
        const viewportCap = Math.min(28, 8 + Math.floor((Date.now() - qaStartRef.current) / 8000));

        return prev.map((b) => {
          // Bugs keep crawling while the gauntlet ascends. Only once the
          // SNAP itself lands do they freeze in place — a dramatic held
          // beat before the dissipation cascade begins.
          if (b.isSmashed || b.isSnapping || gauntletPhase === "snapping" || gauntletPhase === "fading") return b;

          let nx = b.x + b.vx;
          let ny = b.y + b.vy;
          let nvx = b.vx;
          let nvy = b.vy;
          let nIsViewport = b.isViewport;

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
            const hitLeft = nx <= 3;
            const hitRight = nx >= 97;
            const hitTop = ny <= 14;
            const hitBottom = ny >= 88;

            // Once breached, a bug hitting the arena wall may escape into
            // the full viewport instead of bouncing back — it never spawns
            // there, it only ever crawls out through the arena boundary.
            const rect = arenaRef.current?.getBoundingClientRect();
            if (
              (hitLeft || hitRight || hitTop || hitBottom) &&
              viewportBreachActive &&
              rect &&
              viewportCount < viewportCap &&
              Math.random() < 0.35
            ) {
              const absX = rect.left + (nx / 100) * rect.width;
              const absY = rect.top + (ny / 100) * rect.height;
              nx = Math.min(98, Math.max(2, (absX / window.innerWidth) * 100));
              ny = Math.min(95, Math.max(3, (absY / window.innerHeight) * 100));
              nIsViewport = true;
              viewportCount++;
            } else {
              if (hitLeft) {
                nx = 3;
                nvx = Math.abs(nvx);
              } else if (hitRight) {
                nx = 97;
                nvx = -Math.abs(nvx);
              }

              if (hitTop) {
                ny = 14;
                nvy = Math.abs(nvy);
              } else if (hitBottom) {
                ny = 88;
                nvy = -Math.abs(nvy);
              }
            }
          }

          // Random direction shifts
          if (Math.random() < 0.04) {
            const speed = Math.sqrt(nvx * nvx + nvy * nvy) || 0.5;
            const angle = Math.random() * Math.PI * 2;
            nvx = Math.cos(angle) * speed;
            nvy = Math.sin(angle) * speed;
          }

          return { ...b, x: nx, y: ny, vx: nvx, vy: nvy, isViewport: nIsViewport };
        });
      });
    }, 30);

    // Continuous Edge-Crawling Spawner (Paces at most ONE bug per cycle).
    // Bugs only ever spawn from the arena edges — they can later escape into
    // the viewport via the movement loop above, but never spawn there directly.
    // Pressure ramps up the longer the player survives: the spawn interval
    // shrinks and the arena cap rises, both on a floor/ceiling so the DOM
    // and 30fps movement loop never have to handle more than a handful of
    // extra bugs — plenty of "more crawling" without slowing the app.
    //
    // The time-gate check AND the lastSpawnAtRef mutation both live here, in
    // the plain interval callback — not inside the setBugs updater. React
    // Strict Mode double-invokes updater functions in dev to catch impure
    // reducers; a ref mutation living inside the updater gets applied by the
    // first (discarded) invocation, so the second invocation immediately
    // sees "just spawned" and silently no-ops — every tick becomes a dud.
    const edgeSpawnInterval = setInterval(() => {
      if (gauntletPhase !== "hidden" || hasBeenSnapped) return;

      const elapsedMs = Date.now() - qaStartRef.current;
      const spawnInterval = Math.max(650, 2200 - (elapsedMs / 1000) * 55); // 2200ms -> 650ms floor over ~30s

      if (Date.now() - lastSpawnAtRef.current < spawnInterval) return;
      lastSpawnAtRef.current = Date.now();

      const arenaCap = Math.min(11, 7 + Math.floor(elapsedMs / 12000)); // +1 every 12s, capped at 11

      setBugs((prev) => {
        const aliveArena = prev.filter((b) => !b.isViewport && !b.isSmashed && !b.isSnapping);
        const now = Date.now();
        const cleaned = prev.filter((b) => !b.isSmashed || !b.smashedAt || now - b.smashedAt < 2000);
        if (aliveArena.length >= arenaCap) return cleaned;
        return [...cleaned, createBugFromEdge()];
      });
    }, 500);

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

    setBugs((prev) => {
      const mapped = prev.map((b) => (b.id === id ? { ...b, isSmashed: true, smashedAt: Date.now() } : b));
      // Whac-a-mole pressure: smashing a bug immediately spawns a
      // replacement, so the arena can never actually clear — capped well
      // above the passive ramp's ceiling so it can't grow unbounded if the
      // player smashes very fast.
      const aliveArena = mapped.filter((b) => !b.isViewport && !b.isSmashed && !b.isSnapping);
      if (aliveArena.length < 16) {
        return [...mapped, createBugFromEdge()];
      }
      return mapped;
    });
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

  // Every Infinity Snap timer is tracked so a reset (Reset button, or
  // leaving the QA studio for another mode) can cancel whatever's still
  // pending — otherwise a still-running sequence keeps firing setState
  // calls in the background and resurrects stale state after the reset.
  const scheduleSnapTimer = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    snapTimeoutsRef.current.push(id);
  }, []);

  // Step 1: raises the gauntlet and WAITS — the snap itself is no longer
  // automatic. It only fires once the player taps the gauntlet (see
  // handleGauntletTap), so the drama is player-triggered, not a timer.
  const handleLaunchGauntlet = useCallback(() => {
    const aliveBugs = bugs.filter((b) => !b.isSmashed && !b.isSnapping);
    if (aliveBugs.length === 0) {
      soundFx.playClick(400);
      return;
    }

    setGauntletPhase("appearing");
    soundFx.playClick(500);
  }, [bugs]);

  // Step 2: the player taps the raised gauntlet — THIS triggers the actual
  // snap (sound + shockwave), then the freeze beat and staggered dissipation.
  const handleGauntletTap = useCallback(() => {
    if (gauntletPhase !== "appearing") return;

    const aliveBugs = bugs.filter((b) => !b.isSmashed && !b.isSnapping);
    if (aliveBugs.length === 0) {
      setGauntletPhase("hidden");
      return;
    }

    const DISSIPATE_START = 700; // held freeze-frame AFTER the tap-triggered snap, before any bug reacts
    const STAGGER_MS = 320; // bug-by-bug cascade, slow and dramatic — not all at once
    const FADE_DURATION = 1800; // matches each bug's CSS transition-all duration-[1800ms]

    // The SNAP! (Click sound & full-screen shockwave) — landed by the tap.
    setGauntletPhase("snapping");
    playThanosSnapSound();

    // Bugs dissipate ONE BY ONE, staggered — the cascade only starts once
    // the snap itself has fully landed.
    aliveBugs.forEach((bug, i) => {
      scheduleSnapTimer(() => {
        soundFx.playClick(700 + i * 15);
        setBugs((prev) =>
          prev.map((b) => (b.id === bug.id ? { ...b, isSnapping: true } : b))
        );
      }, DISSIPATE_START + i * STAGGER_MS);
    });

    const lastDissipateAt = DISSIPATE_START + (aliveBugs.length - 1) * STAGGER_MS;

    // Gauntlet fades into stardust once the cascade is underway
    scheduleSnapTimer(() => {
      setGauntletPhase("fading");
    }, DISSIPATE_START + 300);

    // Finalize purge once the LAST bug has finished dissipating — NO MORE RESPAWN!
    scheduleSnapTimer(() => {
      setGauntletPhase("hidden");
      soundFx.playSuccess();
      setHasBeenSnapped(true);
      setBugs((prev) =>
        prev.map((b) => (b.isSnapping ? { ...b, isSmashed: true, isSnapping: false, smashedAt: Date.now() } : b))
      );
      setSmashedCount((c) => c + aliveBugs.length);
    }, lastDissipateAt + FADE_DURATION + 200);
  }, [bugs, gauntletPhase, playThanosSnapSound, scheduleSnapTimer]);

  // Full reset of all QA simulation state — used both by the explicit
  // "Reset" button and automatically whenever the player leaves the QA
  // studio, so switching to Load Test/Maze/Physics and back always re-simulates
  // fresh instead of resuming stale bugs, count, or breach state.
  const resetBugSimulation = useCallback(() => {
    // Cancel any still-pending Infinity Snap timers so a sequence started
    // right before the reset can't fire later and resurrect stale state.
    snapTimeoutsRef.current.forEach(clearTimeout);
    snapTimeoutsRef.current = [];

    setBugs([]); // Start empty so bugs crawl in incrementally one-by-one!
    setSmashedCount(0);
    setHasBeenSnapped(false);
    setViewportBreachActive(false);
    setGauntletPhase("hidden");
    setSplats([]);
    setViewportSplats([]);

    // Restart the pressure clock — spawn rate ramps back up from scratch.
    qaStartRef.current = Date.now();
    lastSpawnAtRef.current = 0;
  }, []);

  const handleResetBugSimulation = () => {
    soundFx.playClick(900);
    resetBugSimulation();
  };

  // Leaving the QA studio for another mode resets the simulation, so it
  // never keeps crawling/counting in the background of Load Test or Maze.
  useEffect(() => {
    if (activeMode === "qa") return;
    resetBugSimulation();
  }, [activeMode, resetBugSimulation]);

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
    if (activeMode === "latency") {
      return `// TypeScript: Human Latency Benchmark
async function measureRoundTrip(): Promise<number> {
  await simulateNetworkDelay(1200, 3500);

  const sentAt = performance.now();
  await waitForUserClick(); // the "response" — a human reflex

  const roundTripMs = performance.now() - sentAt;
  return Math.round(roundTripMs);
}

// A click before the response arrives is a false start.
function classify(ms: number): string {
  if (ms < 200) return "Fiber Optic Reflexes";
  if (ms < 300) return "Broadband Speed";
  if (ms < 450) return "Solid Connection";
  if (ms < 600) return "A Bit Laggy";
  return "Dial-Up Vibes";
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
  // viewportBreachActive only means an escape is now ELIGIBLE to happen —
  // it's probabilistic per arena-wall hit, so "escaped" messaging must key
  // off an actual escaped bug existing, not just breach eligibility.
  const hasEscapedBugs = bugs.some((b) => b.isViewport && !b.isSmashed && !b.isSnapping);
  // "Idle" QA state (purged / no bugs yet) is only meaningful while the QA
  // studio is actually active — this must never leak into the shared Master
  // Run Action button's label/style on the other studio tabs.
  const qaIsIdle = activeMode === "qa" && (hasBeenSnapped || activeBugsCount === 0);
  // Once the arena gets crowded, glow the gauntlet button to signal "it's
  // time to click this" instead of leaving the player to notice on their own.
  const shouldGlowGauntlet =
    activeMode === "qa" && !qaIsIdle && gauntletPhase === "hidden" && activeBugsCount >= 10;
  const latencyIsRunning = activeMode === "latency" && phase !== "idle" && phase !== "summary";
  // One shared "which round is this" number for both the sidebar and the
  // stage — computing it separately in two places let them disagree (one
  // showing the round in progress, the other the round just completed).
  const latencyRoundDisplay =
    phase === "result" || phase === "toosoon"
      ? results.length
      : Math.min(results.length + 1, TOTAL_ROUNDS);

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
        {/* Studio 1: Latency Benchmark */}
        <button
          onClick={() => {
            soundFx.playClick(900);
            setActiveMode("latency");
          }}
          className={`p-3 rounded-2xl flex items-center gap-2.5 transition-all text-left cursor-pointer border ${
            activeMode === "latency"
              ? "bg-zinc-800/90 border-emerald-500/50 shadow-md scale-[1.01]"
              : "bg-zinc-950/70 border-white/[0.06] hover:bg-zinc-900 text-zinc-400"
          }`}
        >
          <LuGauge
            className={`w-4 h-4 shrink-0 ${
              activeMode === "latency" ? "text-emerald-400" : "text-zinc-500"
            }`}
          />
          <div className="min-w-0">
            <div className="text-xs font-rubik font-semibold text-white truncate">
              Latency Benchmark
            </div>
            <div className="text-[10px] font-mono text-cyan-400 truncate">
              Human Ping Test
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

      {/* Main Studio Workspace: Code on Left (5 cols) vs Live Visual Stage on Right (7 cols).
          On mobile these stack — but the Live Stage (the actual interactive
          demo) is reordered ABOVE the code panel there, since scrolling past
          a code snippet before reaching the fun part is worse on a phone
          than on a wide desktop layout where both sit side by side. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Code & Controls (5 cols) */}
        <div className="order-2 lg:order-none lg:col-span-5 glass-panel rounded-3xl p-5 border border-white/[0.1] bg-[#070709] flex flex-col justify-between space-y-4">
          <div>
            {/* Window Chrome */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                <span className="text-xs font-mono text-zinc-400 font-medium ml-1">
                  {activeMode === "latency" && "latency_benchmark.ts"}
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
            {/* 1. LATENCY BENCHMARK PROGRESS & TIER LEGEND */}
            {activeMode === "latency" && (
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">
                    {phase === "idle"
                      ? "Ready to benchmark"
                      : phase === "summary"
                      ? "Benchmark complete"
                      : `Round ${latencyRoundDisplay}/${TOTAL_ROUNDS}`}
                  </span>
                  {bestEver !== null && (
                    <span className="text-amber-300 font-bold flex items-center gap-1">
                      <LuTrophy className="w-3 h-3" /> Best: {bestEver}ms
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {LATENCY_TIERS.map((tier) => (
                    <div
                      key={tier.label}
                      className="p-1.5 rounded-lg bg-zinc-900 flex items-center justify-between text-[11px]"
                    >
                      <span className={`font-bold flex items-center gap-1.5 ${tier.textClass}`}>
                        <tier.icon className="w-3.5 h-3.5 shrink-0" /> {tier.label}
                      </span>
                      <span className="text-zinc-500">
                        {tier.max === Infinity ? "600ms+" : `< ${tier.max}ms`}
                      </span>
                    </div>
                  ))}
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
            {activeMode === "qa" && (
              <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">
                A playful take on QA backlog pressure — defects multiply the longer they run wild, smashable by hand or purged all at once with the Infinity Gauntlet.
              </p>
            )}
            {activeMode === "latency" && (
              <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">
                A human &quot;ping test&quot; — wait for the signal, click the instant it flashes. Click too early and it&apos;s a false start.
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (activeMode === "latency") {
                    if (phase === "idle" || phase === "summary") handleStartBenchmark();
                  } else if (activeMode === "qa") {
                    if (qaIsIdle) {
                      handleResetBugSimulation();
                    } else {
                      handleLaunchGauntlet();
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
                disabled={isSolving || (gauntletPhase !== "hidden" && !hasBeenSnapped) || latencyIsRunning}
                className={`flex-1 py-3 rounded-2xl font-rubik text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl active:scale-98 ${
                  isSolving
                    ? "bg-emerald-600 text-white cursor-wait"
                    : gauntletPhase !== "hidden"
                    ? "bg-amber-500 text-zinc-950 cursor-wait animate-pulse"
                    : qaIsIdle
                    ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/[0.1]"
                    : latencyIsRunning
                    ? "bg-zinc-800 text-zinc-400 cursor-wait border border-white/[0.1]"
                    : shouldGlowGauntlet
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-zinc-950 ring-2 ring-amber-300/80 animate-gauntlet-glow"
                    : "bg-emerald-400 hover:bg-emerald-300 text-zinc-950 shadow-emerald-500/25"
                }`}
              >
                {isSolving ? (
                  <>
                    <LuRotateCcw className="w-4 h-4 animate-spin" />
                    <span>Tracing Search Wavefront...</span>
                  </>
                ) : gauntletPhase === "appearing" ? (
                  <>
                    <LuRotateCcw className="w-4 h-4 animate-pulse" />
                    <span>Tap the Gauntlet to Snap! ⚡</span>
                  </>
                ) : gauntletPhase !== "hidden" ? (
                  <>
                    <LuRotateCcw className="w-4 h-4 animate-spin" />
                    <span>Executing Viewport Infinity Snap...</span>
                  </>
                ) : latencyIsRunning ? (
                  <>
                    <LuRotateCcw className="w-4 h-4 animate-spin" />
                    <span>Watch the Stage...</span>
                  </>
                ) : qaIsIdle ? (
                  <>
                    <LuRotateCcw className="w-4 h-4 text-emerald-400" />
                    <span>Reset &amp; Re-simulate Bugs ↻</span>
                  </>
                ) : (
                  <>
                    <LuPlay className="w-4 h-4 fill-current" />
                    <span>
                      {activeMode === "latency" && (phase === "summary" ? "Run Again ↻" : "Run Benchmark")}
                      {activeMode === "qa" && "Raise the Infinity Gauntlet"}
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
        <div className="order-1 lg:order-none lg:col-span-7 glass-panel rounded-3xl border border-white/[0.1] shadow-2xl bg-[#060608] flex flex-col justify-between overflow-hidden relative min-h-[410px]">
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
            {/* 1. LATENCY BENCHMARK STAGE — human "ping test" reflex game */}
            {activeMode === "latency" && (
              <div
                onClick={handleStageClick}
                className={`relative w-full h-[350px] sm:h-[370px] rounded-2xl border shadow-inner overflow-hidden flex flex-col items-center justify-center p-3.5 transition-colors duration-150 select-none ${
                  phase === "armed"
                    ? "bg-emerald-400 border-emerald-300 cursor-pointer"
                    : phase === "decoy"
                    ? "bg-amber-500/90 border-amber-400 cursor-pointer"
                    : phase === "toosoon"
                    ? "bg-red-950 border-red-500/40"
                    : "bg-gradient-to-b from-zinc-950 via-[#09090d] to-zinc-900 border-white/[0.08]"
                } ${phase === "connecting" ? "cursor-pointer" : ""}`}
              >
                {phase === "idle" && (
                  <div className="text-center space-y-2">
                    <LuGauge className="w-10 h-10 text-zinc-600 mx-auto" />
                    <p className="text-sm font-rubik text-zinc-400">
                      Press &quot;Run Benchmark&quot; to start
                    </p>
                    <p className="text-xs font-mono text-zinc-600">
                      5 rounds &bull; click the instant it turns green
                    </p>
                  </div>
                )}

                {(phase === "connecting" || phase === "decoy") && (
                  <div className="w-full max-w-sm space-y-2">
                    <div className="flex items-center gap-2 justify-center mb-3">
                      <span
                        className={`w-2 h-2 rounded-full animate-pulse ${
                          phase === "decoy" ? "bg-zinc-950" : "bg-amber-400"
                        }`}
                      />
                      <span
                        className={`text-xs font-mono ${
                          phase === "decoy" ? "text-zinc-950 font-bold" : "text-zinc-400"
                        }`}
                      >
                        {phase === "decoy" ? "Not yet" : "Connecting..."}
                      </span>
                    </div>
                    {phase === "connecting" && (
                      <div className="font-mono text-[11px] text-zinc-500 space-y-1 text-center">
                        {connectingLines.map((line, i) => (
                          <p key={i} className="animate-fade-in-fast">
                            {line}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {phase === "armed" && (
                  <p className="text-3xl sm:text-4xl font-rubik font-black text-zinc-950 tracking-tight">
                    CLICK NOW!
                  </p>
                )}

                {(phase === "result" || phase === "toosoon") && (
                  <div className="text-center space-y-2">
                    {phase === "toosoon" ? (
                      <>
                        <p className="text-2xl font-rubik font-bold text-red-400 flex items-center justify-center gap-2">
                          <LuTriangleAlert className="w-6 h-6" /> Too Soon!
                        </p>
                        <p className="text-xs font-mono text-red-300/70">Connection Refused (429)</p>
                      </>
                    ) : (
                      lastMs !== null &&
                      (() => {
                        const tier = getLatencyTier(lastMs);
                        return (
                          <>
                            <p className={`text-4xl font-rubik font-black ${tier.textClass}`}>{lastMs}ms</p>
                            <p
                              className={`text-sm font-mono font-bold flex items-center justify-center gap-1.5 ${tier.textClass}`}
                            >
                              <tier.icon className="w-4 h-4" /> {tier.label}
                            </p>
                          </>
                        );
                      })()
                    )}
                    <p className="text-[10px] font-mono text-zinc-600">
                      Round {latencyRoundDisplay}/{TOTAL_ROUNDS} &bull; next round starting...
                    </p>
                  </div>
                )}

                {phase === "summary" &&
                  (() => {
                    const valid = results.filter((r) => !r.falseStart);
                    const avg = valid.length
                      ? Math.round(valid.reduce((s, r) => s + r.ms, 0) / valid.length)
                      : 0;
                    const best = valid.length ? Math.min(...valid.map((r) => r.ms)) : 0;
                    const tier = getLatencyTier(avg);
                    return (
                      <div className="w-full max-w-sm text-center space-y-3">
                        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                          Benchmark Complete
                        </p>
                        <p className={`text-5xl font-rubik font-black ${tier.textClass}`}>{avg}ms</p>
                        <p className={`text-sm font-mono font-bold flex items-center justify-center gap-1.5 ${tier.textClass}`}>
                          <tier.icon className="w-4 h-4" /> {tier.label}
                        </p>

                        {isNewRecord && (
                          <p className="text-xs font-mono font-bold text-amber-300 animate-pulse flex items-center justify-center gap-1.5">
                            <LuTrophy className="w-3.5 h-3.5" /> New Personal Best!
                          </p>
                        )}

                        <div className="flex items-end justify-center gap-1.5 h-14 pt-2">
                          {results.map((r, i) => {
                            const t = r.falseStart ? null : getLatencyTier(r.ms);
                            const heightPct = r.falseStart ? 100 : Math.min(100, (r.ms / 700) * 100);
                            return (
                              <div key={i} className="flex flex-col items-center gap-1 w-6">
                                <div className="w-full h-10 bg-zinc-800 rounded-sm overflow-hidden flex flex-col justify-end">
                                  <div
                                    className={`w-full ${r.falseStart ? "bg-red-600" : t!.barClass}`}
                                    style={{ height: `${heightPct}%` }}
                                  />
                                </div>
                                <span className="text-[9px] font-mono text-zinc-600">
                                  {r.falseStart ? "✗" : r.ms}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <p className="text-[10px] font-mono text-zinc-600">
                          Best this run: {best}ms &bull; Click &quot;Run Again&quot; to retry
                        </p>
                      </div>
                    );
                  })()}
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

                    {hasEscapedBugs && !hasBeenSnapped && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-lg bg-amber-950/90 border border-amber-500/40 text-amber-300 font-bold animate-pulse text-[10px]">
                        ⚠️ On the Loose!
                      </span>
                    )}

                    <span
                      className={`px-2.5 py-1 rounded-xl border shadow font-bold ${
                        hasBeenSnapped || activeBugsCount === 0
                          ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                          : "bg-amber-950/80 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {hasBeenSnapped || activeBugsCount === 0 ? "100% Defect-Free" : "Crawling"}
                    </span>
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
                        className={`transition-all duration-[1800ms] ${
                          bug.isSnapping
                            ? "scale-75 opacity-0 blur-[3px] -translate-y-14 grayscale contrast-125 brightness-[0.55] pointer-events-none"
                            : bug.isSmashed
                            ? "scale-75 opacity-70 pointer-events-none"
                            : "hover:scale-125 active:scale-95"
                        }`}
                      >
                        {/* Dissipating Ash Particles */}
                        {bug.isSnapping && <AshParticles />}

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
                    <div className="flex items-center justify-center text-[11px] font-mono text-zinc-400 bg-black/60 backdrop-blur px-3 py-1.5 rounded-xl border border-emerald-500/30">
                      <span className="text-zinc-400">Click &apos;Reset ↻&apos; anytime to re-simulate</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 bg-black/60 backdrop-blur px-3 py-1.5 rounded-xl border border-white/[0.04]">
                      <span className="flex items-center gap-1.5">
                        <LuTarget className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                        {hasEscapedBugs
                          ? "Containment breached — bugs are loose on your screen."
                          : "Smash bugs in the arena. Wait too long and they escape."}
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
                  title="Hover over the canvas to push particles"
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
                  className={`transition-all duration-[1800ms] ${
                    bug.isSnapping
                      ? "scale-75 opacity-0 blur-[3px] -translate-y-16 grayscale contrast-125 brightness-[0.55] pointer-events-none"
                      : bug.isSmashed
                      ? "scale-75 opacity-70 pointer-events-none"
                      : "hover:scale-125 active:scale-95"
                  }`}
                >
                  {/* Dissipating Ash Particles */}
                  {bug.isSnapping && <AshParticles scale={1.3} />}

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
            onClick={gauntletPhase === "appearing" ? handleGauntletTap : undefined}
            title={gauntletPhase === "appearing" ? "Tap to SNAP!" : undefined}
            className={`relative z-10 flex flex-col items-center justify-center transition-all duration-700 ${
              gauntletPhase === "appearing"
                ? "scale-115 opacity-100 filter drop-shadow-[0_0_60px_rgba(234,179,8,0.9)] pointer-events-auto cursor-pointer animate-pulse hover:scale-125 active:scale-105"
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
              {gauntletPhase === "snapping"
                ? "⚡ THE SNAP ⚡"
                : gauntletPhase === "appearing"
                ? "👆 Tap to SNAP!"
                : "Infinity Gauntlet"}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
