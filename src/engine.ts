import { create } from 'zustand';

export type CharacterType = 'TITAN' | 'WRAITH' | 'PRISM';

export interface PlayerState {
  id: 'p1' | 'p2';
  callsign: string;
  character: CharacterType;
  auraColor: string;
  positions: number[]; 
}

export const LANE_CONFIG = [
  { cost: 1, steps: 10 },
  { cost: 2, steps: 6 },
  { cost: 3, steps: 4 },
  { cost: 4, steps: 3 },
  { cost: 5, steps: 3 },
  { cost: 6, steps: 2 },
];

export interface LogEntry {
  id: string;
  msg: string;
  type: 'sys' | 'ai' | 'event';
}

export interface GameState {
  status: 'LOBBY' | 'PLAYING' | 'VICTORY';
  turn: 'p1' | 'p2';
  roll: number | null;
  p1: PlayerState;
  p2: PlayerState;
  winner: 'p1' | 'p2' | null;
  logs: LogEntry[];
  
  // Actions
  initialize: (p1: Partial<PlayerState>, p2: Partial<PlayerState>) => void;
  setRoll: (n: number) => void;
  executeMove: (moves: Record<number, number>) => void; 
  addLog: (msg: string, type?: 'sys' | 'ai' | 'event') => void;
  reset: () => void;
  skipTurn: () => void;
}

const createLog = (msg: string, type: 'sys' | 'ai' | 'event'): LogEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  msg,
  type
});

export const useStore = create<GameState>((set, get) => ({
  status: 'LOBBY',
  turn: 'p1',
  roll: null,
  winner: null,
  logs: [],
  p1: { id: 'p1', callsign: 'USER', character: 'TITAN', auraColor: '#00f3ff', positions: [0,0,0,0,0,0] },
  p2: { id: 'p2', callsign: 'EXO_ECHO', character: 'WRAITH', auraColor: '#f27d26', positions: [0,0,0,0,0,0] },

  initialize: (p1S, p2S) => set({
    status: 'PLAYING',
    p1: { ...get().p1, ...p1S, positions: [0,0,0,0,0,0] },
    p2: { ...get().p2, ...p2S, positions: [0,0,0,0,0,0] },
    logs: [createLog('SYSTEM_INITIALIZED: NEURAL_LINK_STABLE', 'sys')]
  }),

  setRoll: (n) => set({ roll: n }),

  executeMove: (moves) => {
    const { turn, p1, p2, roll } = get();
    if (!roll) return;

    const isP1 = turn === 'p1';
    const current = isP1 ? p1 : p2;
    const opponent = isP1 ? p2 : p1;
    
    let nextPositions = [...current.positions];
    let nextOpponentPositions = [...opponent.positions];
    let totalValue = 0;
    let events: string[] = [];

    Object.entries(moves).forEach(([idxStr, count]) => {
      const idx = parseInt(idxStr);
      const laneValue = idx + 1;
      totalValue += (laneValue * count);
      
      const config = LANE_CONFIG[idx];
      
      for (let i = 0; i < count; i++) {
        if (nextPositions[idx] < config.steps) {
          nextPositions[idx] += 1;
          
          if (nextPositions[idx] === nextOpponentPositions[idx] && nextPositions[idx] < config.steps) {
            nextOpponentPositions[idx] = 0;
            events.push(`BUMP_L${laneValue}`);
          }
        }
      }
    });

    if (totalValue !== roll) return;

    const finishedCount = nextPositions.filter((p, i) => p === LANE_CONFIG[i].steps).length;
    const isWin = finishedCount >= 3;

    const logMsg = `${current.callsign}: [${events.length > 0 ? events.join(', ') : 'MOVE_SYNC'}]`;

    set({
      p1: isP1 ? { ...p1, positions: nextPositions } : { ...p1, positions: nextOpponentPositions },
      p2: !isP1 ? { ...p2, positions: nextPositions } : { ...p2, positions: nextOpponentPositions },
      turn: isP1 ? 'p2' : 'p1',
      roll: null,
      winner: isWin ? (isP1 ? 'p1' : 'p2') : null,
      status: isWin ? 'VICTORY' : 'PLAYING',
      logs: [createLog(logMsg, 'event'), ...get().logs].slice(0, 15)
    });
  },

  skipTurn: () => {
    const { turn, p1, p2 } = get();
    const current = turn === 'p1' ? p1 : p2;
    set({
      turn: turn === 'p1' ? 'p2' : 'p1',
      roll: null,
      logs: [createLog(`${current.callsign}: PASS (NO_MOVE)`, 'sys'), ...get().logs].slice(0, 15)
    });
  },

  addLog: (msg, type = 'sys') => set(s => ({ logs: [createLog(msg, type), ...s.logs].slice(0, 15) })),

  reset: () => set({
    status: 'LOBBY',
    turn: 'p1',
    winner: null,
    roll: null,
    p1: { ...get().p1, positions: [0,0,0,0,0,0] },
    p2: { ...get().p2, positions: [0,0,0,0,0,0] },
    logs: []
  })
}));
