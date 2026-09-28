"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundFx } from "@/util/sound";
import { LuCompass, LuPlay, LuShuffle, LuRotateCcw, LuFlag, LuSquare } from "react-icons/lu";

type PathAlgorithm = "astar" | "dijkstra" | "bfs" | "dfs";
type GridTool = "wall" | "start" | "goal";

interface GridNode {
  x: number;
  y: number;
}

const GRID_COLS = 13;
const GRID_ROWS = 7;

const ALGO_DESCRIPTIONS: Record<
  PathAlgorithm,
  { title: string; popularApps: string; nonTech: string; tech: string; badge: string }
> = {
  astar: {
    title: "A* Search",
    badge: "GPS & Game AI",
    popularApps: "Google Maps, Waze, League of Legends & StarCraft",
    nonTech:
      "When you click to move in a game, or ask Maps for directions, A* estimates the straight-line distance to the goal and moves toward it — going around obstacles instead of wandering.",
    tech: "Informed heuristic search minimizing f(n) = g(n) + h(n), where h(n) is the Manhattan distance to the goal.",
  },
  dijkstra: {
    title: "Dijkstra's Algorithm",
    badge: "Internet Routing",
    popularApps: "Internet routers (OSPF), Cloudflare & flight-search engines",
    nonTech:
      "Every time a website loads or a flight search checks layovers, Dijkstra compares the cost of every possible route through millions of connections to find the cheapest one.",
    tech: "Uniform-cost graph traversal exploring lowest cumulative edge cost g(n) via a priority queue.",
  },
  bfs: {
    title: "Breadth-First Search",
    badge: "Social Networks",
    popularApps: "LinkedIn (\"1st, 2nd, 3rd\" connections) & web crawlers",
    nonTech:
      "LinkedIn checks your direct connections first, then theirs, expanding outward one layer at a time until it finds the shortest path between two people.",
    tech: "FIFO queue, level-order traversal — guarantees the fewest hops in an unweighted graph.",
  },
  dfs: {
    title: "Depth-First Search",
    badge: "Game Trees & Solvers",
    popularApps: "Chess engines, Sudoku solvers & Git branch merging",
    nonTech:
      "A chess engine plays out one sequence of moves as deep as it can. Hit a dead end, and it backtracks to try the next branch instead.",
    tech: "LIFO stack exploration, plunging down one branch fully before backtracking.",
  },
};

const ALGO_ORDER: PathAlgorithm[] = ["astar", "dijkstra", "bfs", "dfs"];

function computePath(
  algo: PathAlgorithm,
  s: GridNode,
  g: GridNode,
  wallSet: Set<string>,
  cols: number,
  rows: number
): { path: GridNode[]; explored: GridNode[] } {
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
          heap.push({ x: nx, y: ny, cost: nextCost, priority: nextCost + heuristic, path: [...current.path, { x: nx, y: ny }] });
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
}

export default function TechnicalExpertiseSection() {
  const [selectedAlgo, setSelectedAlgo] = useState<PathAlgorithm>("astar");
  const [activeTool, setActiveTool] = useState<GridTool>("wall");
  const [startNode, setStartNode] = useState<GridNode>({ x: 1, y: 1 });
  const [goalNode, setGoalNode] = useState<GridNode>({ x: GRID_COLS - 2, y: GRID_ROWS - 2 });
  const [walls, setWalls] = useState<GridNode[]>([
    { x: 4, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 },
    { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 }, { x: 8, y: 6 },
  ]);
  const [visitedNodes, setVisitedNodes] = useState<GridNode[]>([]);
  const [shortestPath, setShortestPath] = useState<GridNode[]>([]);
  const [isSolving, setIsSolving] = useState(false);
  const [stats, setStats] = useState<{ explored: number; pathLength: number; ms: number; found: boolean } | null>(null);

  const info = ALGO_DESCRIPTIONS[selectedAlgo];

  const clearRun = useCallback(() => {
    setVisitedNodes([]);
    setShortestPath([]);
    setStats(null);
  }, []);

  const handleShuffleMaze = useCallback(() => {
    soundFx.playClick(850);
    clearRun();
    const newWalls: GridNode[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if ((c === startNode.x && r === startNode.y) || (c === goalNode.x && r === goalNode.y)) continue;
        if (Math.random() < 0.26) newWalls.push({ x: c, y: r });
      }
    }
    setWalls(newWalls);
  }, [clearRun, startNode, goalNode]);

  const handleClearWalls = useCallback(() => {
    soundFx.playClick(700);
    clearRun();
    setWalls([]);
  }, [clearRun]);

  const handleGridCellClick = (x: number, y: number) => {
    soundFx.playClick(900);
    clearRun();

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
      setWalls((prev) =>
        prev.some((w) => w.x === x && w.y === y) ? prev.filter((w) => !(w.x === x && w.y === y)) : [...prev, { x, y }]
      );
    }
  };

  const handleSolve = useCallback(() => {
    soundFx.playClick(950);
    setIsSolving(true);
    setVisitedNodes([]);
    setShortestPath([]);

    const wallSet = new Set(walls.map((w) => `${w.x},${w.y}`));
    const t0 = performance.now();
    const { path, explored } = computePath(selectedAlgo, startNode, goalNode, wallSet, GRID_COLS, GRID_ROWS);
    const duration = Math.max(0.02, Math.round((performance.now() - t0) * 100) / 100);

    setStats({ explored: explored.length, pathLength: path.length, ms: duration, found: path.length > 0 });

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
  }, [walls, selectedAlgo, startNode, goalNode]);

  const isVisited = (x: number, y: number) => visitedNodes.some((n) => n.x === x && n.y === y);
  const isOnPath = (x: number, y: number) => shortestPath.some((n) => n.x === x && n.y === y);
  const isWall = (x: number, y: number) => walls.some((w) => w.x === x && w.y === y);

  return (
    <section id="skills" className="reveal-item px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold font-rubik text-zinc-100 tracking-tight">
            Pathfinding, Visualized
          </h2>
        </div>
        <span className="text-xs font-mono text-zinc-500">Interactive Demo</span>
      </div>

      {/* Algorithm Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {ALGO_ORDER.map((algo) => {
          const isSelected = algo === selectedAlgo;
          return (
            <motion.button
              key={algo}
              onClick={() => {
                soundFx.playClick(900);
                setSelectedAlgo(algo);
                clearRun();
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`p-3 rounded-2xl flex items-center gap-2.5 text-left cursor-pointer border ${
                isSelected
                  ? "bg-zinc-800/90 border-emerald-500/50 shadow-md"
                  : "bg-zinc-950/70 border-white/[0.06] hover:bg-zinc-900 text-zinc-400"
              }`}
            >
              <LuCompass className={`w-4 h-4 shrink-0 ${isSelected ? "text-emerald-400" : "text-zinc-500"}`} />
              <div className="min-w-0">
                <div className="text-xs font-rubik font-semibold text-white truncate">
                  {ALGO_DESCRIPTIONS[algo].title}
                </div>
                <div className="text-[10px] font-mono text-emerald-400 truncate">
                  {ALGO_DESCRIPTIONS[algo].badge}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Grid & Controls (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-5 border border-white/[0.1] bg-[#070709] flex flex-col gap-3.5">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "wall" as GridTool, label: "Wall", icon: <LuSquare className="w-3.5 h-3.5" /> },
                { id: "start" as GridTool, label: "Start", icon: <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> },
                { id: "goal" as GridTool, label: "Goal", icon: <LuFlag className="w-3.5 h-3.5" /> },
              ]
            ).map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  soundFx.playClick(800);
                  setActiveTool(tool.id);
                }}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px] font-mono border transition-colors cursor-pointer ${
                  activeTool === tool.id
                    ? "bg-zinc-800 border-white/[0.2] text-white"
                    : "bg-zinc-900/60 border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tool.icon}
                <span>{tool.label}</span>
              </button>
            ))}

            <div className="flex-1" />

            <button
              onClick={handleShuffleMaze}
              title="Randomize walls"
              className="p-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-white/[0.06] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <LuShuffle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClearWalls}
              title="Clear walls"
              className="p-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-white/[0.06] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <LuRotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid */}
          <div
            className="grid gap-[2px] w-full select-none"
            style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: GRID_ROWS }).map((_, y) =>
              Array.from({ length: GRID_COLS }).map((_, x) => {
                const isStart = startNode.x === x && startNode.y === y;
                const isGoal = goalNode.x === x && goalNode.y === y;
                const wall = isWall(x, y);
                const onPath = isOnPath(x, y);
                const visited = isVisited(x, y);

                return (
                  <motion.button
                    key={`${x}-${y}`}
                    onClick={() => handleGridCellClick(x, y)}
                    animate={onPath ? { scale: [0.6, 1] } : { scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`aspect-square rounded-[3px] cursor-pointer ${
                      isStart
                        ? "bg-emerald-400"
                        : isGoal
                        ? "bg-amber-400"
                        : wall
                        ? "bg-zinc-700"
                        : onPath
                        ? "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]"
                        : visited
                        ? "bg-emerald-900/50"
                        : "bg-zinc-900 hover:bg-zinc-800 transition-colors duration-150"
                    }`}
                  />
                );
              })
            )}
          </div>

          {/* Solve + Stats */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <motion.button
              onClick={handleSolve}
              disabled={isSolving}
              whileHover={{ scale: isSolving ? 1 : 1.03 }}
              whileTap={{ scale: isSolving ? 1 : 0.96 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="px-4 py-2 rounded-full bg-white text-zinc-950 font-rubik font-medium text-xs hover:bg-zinc-200 shadow-md flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LuPlay className="w-3.5 h-3.5" />
              <span>{isSolving ? "Solving..." : "Solve"}</span>
            </motion.button>

            {stats && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-[11px] font-mono text-zinc-400"
              >
                <span>
                  Explored <span className="text-emerald-400 font-semibold">{stats.explored}</span>
                </span>
                <span>
                  Path <span className="text-emerald-400 font-semibold">{stats.found ? stats.pathLength : "—"}</span>
                </span>
                <span>
                  Time <span className="text-emerald-400 font-semibold">{stats.ms}ms</span>
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Explanation Panel (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-white/[0.1] shadow-2xl bg-gradient-to-br from-zinc-900/95 via-zinc-900/60 to-zinc-950/95 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedAlgo}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-3.5"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-1">
                  {info.badge}
                </span>
                <h3 className="font-rubik font-bold text-lg sm:text-xl text-white">{info.title}</h3>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
                  Where you&apos;ve seen it
                </span>
                <p className="text-xs text-zinc-300 font-rubik leading-relaxed">{info.popularApps}</p>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 font-rubik leading-relaxed">{info.nonTech}</p>

              <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/[0.06]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
                  Under the hood
                </span>
                <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">{info.tech}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
