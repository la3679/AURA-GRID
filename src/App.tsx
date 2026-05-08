import React, { useState, useEffect, useMemo } from 'react';
import { useStore, CharacterType, LANE_CONFIG } from './engine';
import { motion, AnimatePresence } from 'motion/react';
import { getCommentary } from './services/CommentaryEngine';
import { 
  Terminal, 
  Dices, 
  Zap, 
  Activity, 
  Cpu, 
  Play,
  RotateCcw
} from 'lucide-react';

// --- HELPERS ---

const findValidMoves = (roll: number, positions: number[]): Record<number, number> | null => {
  let remaining = roll;
  const moves: Record<number, number> = {};
  
  // Greedy search from high to low
  for (let i = 5; i >= 0; i--) {
    const laneValue = i + 1;
    const config = LANE_CONFIG[i];
    const availableSteps = config.steps - positions[i];
    if (availableSteps <= 0) continue;
    
    const count = Math.min(Math.floor(remaining / laneValue), availableSteps);
    if (count > 0) {
      moves[i] = count;
      remaining -= count * laneValue;
    }
  }
  
  return remaining === 0 ? moves : null;
};

// --- COMPONENTS ---

const Marker = ({ type, color, size = "w-8 h-8", glow = true, isOpponent = false }: { type: CharacterType, color: string, size?: string, glow?: boolean, isOpponent?: boolean }) => {
  const styles = { 
    borderColor: color, 
    boxShadow: glow && !isOpponent ? `0 0 10px ${color}` : 'none',
    backgroundColor: isOpponent ? 'transparent' : `${color}22`,
    opacity: isOpponent ? 0.6 : 1
  };
  
  const shapeClass = isOpponent ? 'scale-75' : '';

  if (type === 'TITAN') return (
    <div style={styles} className={`${size} ${shapeClass} border-2 flex items-center justify-center p-1`}>
      <div style={{ backgroundColor: color }} className="w-full h-full" />
    </div>
  );
  
  if (type === 'WRAITH') return (
    <div style={styles} className={`${size} ${shapeClass} border-2 rotate-45 flex items-center justify-center overflow-hidden`}>
       <div style={{ backgroundColor: color }} className="w-3/4 h-3/4 opacity-80" />
    </div>
  );
  
  return (
    <div style={{ ...styles, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} className={`${size} ${shapeClass} border-2 flex items-center justify-center overflow-hidden`}>
       <div style={{ backgroundColor: color }} className="w-full h-full opacity-40 translate-y-1/4" />
    </div>
  );
};

const Lane = ({ index, p1, p2, selectionCount, onSelect }: any) => {
  const p1Pos = p1.positions[index];
  const p2Pos = p2.positions[index];
  const laneValue = index + 1;
  const config = LANE_CONFIG[index];

  return (
    <div 
      onClick={() => onSelect(index)}
      className={`glass-slab flex flex-grow flex-col justify-between items-center py-4 cursor-pointer group transition-all duration-300
        ${selectionCount > 0 ? 'bg-aura-cyan/10 ring-1 ring-aura-cyan/30' : 'hover:bg-white/5 opacity-40 hover:opacity-100'}`}
    >
      <div className="flex flex-col items-center">
        <div className={`stat-label ${selectionCount > 0 ? 'aura-cyan-text font-bold' : ''}`}>
          {selectionCount > 0 ? `+${selectionCount}` : `LVL_${laneValue}`}
        </div>
        <div className="text-[6px] opacity-20 font-mono text-center">DOTS_{config.steps}</div>
      </div>
      
      <div className="flex-1 flex flex-col-reverse gap-0 justify-start py-2 w-full px-2 relative">
        <div className="absolute left-1/2 top-4 bottom-4 w-[1px] bg-white/10 -translate-x-1/2 -z-10" />

        {Array.from({ length: config.steps + 1 }).map((_, pos) => (
          <div key={pos} className="relative h-6 w-full flex items-center justify-center">
            <div className={`w-1 h-1 rounded-full ${
              pos === 0 ? 'bg-white/40' : pos === config.steps ? 'bg-aura-cyan' : 'bg-white/10'
            }`} />

            <AnimatePresence mode="popLayout">
              {p1Pos === pos && (
                <motion.div 
                  key={`p1-marker-${index}-${pos}`}
                  className="absolute"
                  layoutId={`p1-${index}`} 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  transition={{ type: 'spring', damping: 25 }}
                >
                  <Marker type={p1.character} color={p1.auraColor} size="w-5 h-5" />
                </motion.div>
              )}
              {p2Pos === pos && (
                <motion.div 
                  key={`p2-marker-${index}-${pos}`}
                  className="absolute"
                  layoutId={`p2-${index}`} 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  transition={{ type: 'spring', damping: 25 }}
                >
                  <Marker type={p2.character} color={p2.auraColor} size="w-4 h-4" isOpponent />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="stat-label text-white/20 group-hover:text-white/40">VALUE_{laneValue}</div>
    </div>
  );
};



const Lobby = () => {
  const initialize = useStore(state => state.initialize);
  const [config, setConfig] = useState({ 
    callsign: 'ARCHITECT', 
    character: 'TITAN' as CharacterType, 
    color: '#00f3ff' 
  });

  return (
    <motion.div 
      key="lobby-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-3xl bg-black/80"
    >
      <div className="w-full max-w-lg hud-panel p-8 space-y-10 border-aura-cyan/40 shadow-[0_0_50px_rgba(0,243,255,0.1)]">
        <div className="flex justify-between items-center">
           <div>
              <span className="stat-label text-aura-cyan">System Init</span>
              <h1 className="text-4xl font-black italic tracking-tighter aura-cyan-text">AURA_GRID</h1>
           </div>
           <Cpu className="text-aura-cyan animate-pulse" size={32} />
        </div>

        <div className="space-y-6">
           <div className="space-y-2">
              <label className="stat-label">Neural Identity</label>
              <input 
                value={config.callsign}
                onChange={e => setConfig({...config, callsign: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 12)})}
                className="w-full bg-white/5 border-b border-aura-cyan p-3 text-2xl font-bold outline-none italic placeholder:opacity-20"
                placeholder="ENTER_ID"
              />
           </div>

           <div className="grid grid-cols-3 gap-3">
              {(['TITAN', 'WRAITH', 'PRISM'] as CharacterType[]).map(type => (
                <button 
                  key={type}
                  onClick={() => setConfig({...config, character: type})}
                  className={`p-4 border-l-2 flex flex-col items-center gap-2 transition-all
                    ${config.character === type ? 'border-aura-cyan bg-aura-cyan/10 aura-cyan-text' : 'border-white/10 opacity-30 hover:opacity-100'}`}
                >
                  <Marker type={type} color={config.character === type ? config.color : "#fff"} glow={config.character === type} size="w-8 h-8" />
                  <span className="stat-label text-[7px]">{type}</span>
                </button>
              ))}
           </div>

           <div className="flex justify-between items-center bg-white/5 p-4 border border-white/5">
              <span className="stat-label">Aura Frequency</span>
              <div className="flex gap-2">
                 {['#00f3ff', '#ff0055', '#a855f7', '#f27d26'].map(c => (
                   <button 
                     key={c}
                     onClick={() => setConfig({...config, color: c})}
                     className={`w-8 h-8 transition-transform ${config.color === c ? 'scale-125 border-2 border-white' : 'opacity-40 hover:opacity-100'}`}
                     style={{ backgroundColor: c }}
                   />
                 ))}
              </div>
           </div>
        </div>

        <button 
          onClick={() => initialize(config, { callsign: 'EXO_ECHO', character: 'WRAITH', auraColor: '#f27d26' })}
          className="w-full py-5 bg-aura-cyan text-black font-black text-xl tracking-[8px] hover:brightness-110 transition-all uppercase"
        >
          Initialize_Link
        </button>
      </div>
    </motion.div>
  );
};

// --- MAIN APP ---

export default function App() {
  const { status, turn, roll, p1, p2, winner, logs, setRoll, executeMove, skipTurn } = useStore();
  const [selectedMoves, setSelectedMoves] = useState<Record<number, number>>({});
  const [isRolling, setIsRolling] = useState(false);

  // AI Logic
  useEffect(() => {
    if (turn === 'p2' && status === 'PLAYING' && roll === null && !isRolling) {
      let cancelled = false;
      const runAI = async () => {
        await new Promise(r => setTimeout(r, 600));
        if (cancelled) return;
        
        setIsRolling(true);
        await new Promise(r => setTimeout(r, 400));
        if (cancelled) return;
        
        const val = Math.floor(Math.random() * 6) + 1;
        setRoll(val);
        setIsRolling(false);
        
        await new Promise(r => setTimeout(r, 600));
        if (cancelled) return;
        
        const moves = findValidMoves(val, p2.positions);
        if (moves) {
          executeMove(moves);
        } else {
          skipTurn();
        }
      };
      runAI();
      return () => { cancelled = true; };
    }
  }, [turn, status, roll]);

  // AI Commentary Logic
  const latestLog = logs[0];
  const addLog = useStore(state => state.addLog);
  
  useEffect(() => {
    if (latestLog && latestLog.type === 'event') {
      const triggerAI = async () => {
        const line = await getCommentary(latestLog.msg, p1, p2);
        if (line) {
          addLog(line, 'ai');
        }
      };
      triggerAI();
    }
  }, [latestLog?.id]);

  const toggleLane = (idx: number) => {
    if (roll === null || turn !== 'p1') return;
    const laneValue = idx + 1;
    const config = LANE_CONFIG[idx];
    const currentPos = p1.positions[idx];
    const currentSel = selectedMoves[idx] || 0;
    
    // Check if lane is already finished in future moves
    if (currentPos + currentSel >= config.steps) {
      const next = { ...selectedMoves };
      delete next[idx];
      setSelectedMoves(next);
      return;
    }

    const currentSum = Object.entries(selectedMoves).reduce((sum, [i, count]) => sum + (parseInt(i) + 1) * count, 0);
    if (currentSum + laneValue <= roll) {
      setSelectedMoves({ ...selectedMoves, [idx]: currentSel + 1 });
    } else {
      const next = { ...selectedMoves };
      delete next[idx];
      setSelectedMoves(next);
    }
  };

  const currentSelectionSum = useMemo(() => 
    Object.entries(selectedMoves).reduce((sum, [idx, count]) => sum + (parseInt(idx) + 1) * count, 0)
  , [selectedMoves]);

  const handleManualRoll = () => {
    if (isRolling) return;
    setIsRolling(true);
    setTimeout(() => {
      const val = Math.floor(Math.random() * 6) + 1;
      setRoll(val);
      setIsRolling(false);
      setSelectedMoves({});
      
      // Auto-skip if no moves possible
      const possible = findValidMoves(val, p1.positions);
      if (!possible) {
        setTimeout(skipTurn, 1000);
      }
    }, 400);
  };

  return (
    <div className="w-full h-screen neo-noir-bg p-6 flex flex-col gap-6 overflow-hidden select-none relative font-sans text-neo-gray">
      <AnimatePresence>
        {status === 'LOBBY' && <Lobby />}
      </AnimatePresence>

      <header className="flex justify-between items-center border-b border-white/10 pb-4">
        <div className="flex flex-col">
          <span className="stat-label opacity-40">Grid_Protocol</span>
          <h1 className="text-2xl font-black italic tracking-tighter aura-cyan-text">SPLIT_OS</h1>
        </div>
        <div className="flex gap-8 items-center">
          <div className="text-right">
             <span className="stat-label">Session_Time</span>
             <div className="text-xs font-mono opacity-80 uppercase">00:00:24:RC</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-left">
             <span className="stat-label">Current_Actor</span>
              <div className={`text-sm font-bold uppercase tracking-widest ${turn === 'p1' ? 'aura-cyan-text' : 'text-aura-orange'}`}>
                {turn === 'p1' ? p1.callsign : p2.callsign}
              </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex gap-4 min-h-0">
        {/* Lanes */}
        <div className="flex-grow flex gap-2">
           {[0,1,2,3,4,5].map(i => (
             <Lane 
               key={i} 
               index={i} 
               p1={p1} 
               p2={p2} 
               selectionCount={selectedMoves[i] || 0}
               onSelect={toggleLane} 
             />
           ))}
        </div>

        {/* Sidebar */}
        <aside className="w-72 flex flex-col gap-4">
          <div className="hud-panel p-4 flex-grow flex flex-col min-h-0 relative bg-black/40">
             <div className="absolute top-0 right-0 p-2 text-[8px] opacity-20">EVENT_STREAM</div>
             <h3 className="stat-label mb-3 text-aura-cyan">Process Logs</h3>
             <div className="flex-1 overflow-y-auto space-y-2 pr-2 font-mono text-[9px] scrollbar-hide">
                {logs.map((log) => (
                  <div key={log.id} className={`flex gap-2 p-1 border-l-2 ${
                    log.type === 'sys' ? 'border-aura-cyan/20 text-aura-cyan' : log.type === 'ai' ? 'border-aura-orange/20 text-aura-orange' : 'border-white/5 text-white/50'
                  }`}>
                    <span className="opacity-30 shrink-0">[{log.id.split('-')[1]?.slice(0,4) || '...'}]</span>
                    <span className="line-clamp-2">{log.msg}</span>
                  </div>
                ))}
             </div>
             <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black to-transparent pointer-events-none" />
          </div>

          <div className="hud-panel p-5 h-64 flex flex-col justify-between border-aura-cyan/20">
             <div className="flex justify-between items-center">
                <h3 className="stat-label text-aura-cyan">Partition Logic</h3>
                <Activity size={14} className="text-aura-cyan opacity-40" />
             </div>
             
             {turn === 'p1' && status === 'PLAYING' ? (
               <div className="space-y-4 flex flex-col h-full justify-end pt-4">
                  {!roll ? (
                    <button 
                      disabled={isRolling}
                      onClick={handleManualRoll}
                      className="w-full py-4 border-2 border-aura-cyan aura-cyan-text font-black text-xs tracking-[5px] hover:bg-aura-cyan hover:text-neo-bg transition-all flex items-center justify-center gap-3 uppercase"
                    >
                      <Dices size={16} className={isRolling ? 'animate-spin' : ''} /> 
                      {isRolling ? 'Syncing...' : 'Roll_Dice'}
                    </button>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center gap-4 bg-white/5 p-3">
                        <div className="w-12 h-12 border-2 border-aura-cyan flex items-center justify-center text-3xl font-black aura-cyan-text">
                          {roll}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="text-[9px] opacity-40 uppercase mb-1">Sum: {currentSelectionSum} / {roll}</div>
                          <div className="h-1 bg-white/10 w-full rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-aura-cyan transition-all duration-300" 
                               style={{ width: `${Math.min(1, currentSelectionSum / roll) * 100}%` }} 
                             />
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        disabled={currentSelectionSum !== roll}
                        onClick={() => {
                          executeMove(selectedMoves);
                          setSelectedMoves({});
                        }}
                        className="w-full py-4 bg-neo-gray text-neo-bg font-black text-xs tracking-[6px] hover:bg-aura-cyan transition-all disabled:opacity-20 uppercase shadow-[0_5px_15px_rgba(0,0,0,0.4)]"
                      >
                        Execute_Split
                      </button>
                    </div>
                  )}
               </div>
             ) : (
               <div className="flex-grow flex flex-col items-center justify-center text-center py-4">
                  <div className="w-10 h-10 border border-white/5 rounded-full flex items-center justify-center animate-spin-slow">
                     <RotateCcw size={18} className="text-aura-orange opacity-60" />
                  </div>
                  <div className="stat-label mt-3 italic opacity-40">NEURAL_CALCULATION_IN_PROGRESS</div>
               </div>
             )}
          </div>
        </aside>
      </main>

      <footer className="grid grid-cols-4 gap-4 h-14 min-h-[3.5rem]">
        <StatusTile iconColor="bg-green-500" label="Link" value="STABLE" />
        <StatusTile iconColor="bg-aura-cyan" label="Latency" value="12ms" />
        <StatusTile iconColor="bg-aura-orange" label="Engine" value="SPLIT_v2" />
        <div className="hud-panel px-4 flex flex-col justify-center gap-1 opacity-60">
           <div className="stat-label">Progress</div>
           <div className="flex gap-px h-1.5 w-full">
             {p1.positions.map((p, i) => (
                <div key={`p1-prog-${i}`} className={`flex-1 ${p === LANE_CONFIG[i].steps ? 'bg-aura-cyan' : 'bg-white/10'}`} />
             ))}
             <div className="w-[2px]" />
             {p2.positions.map((p, i) => (
                <div key={`p2-prog-${i}`} className={`flex-1 ${p === LANE_CONFIG[i].steps ? 'bg-aura-orange' : 'bg-white/10'}`} />
             ))}
           </div>
        </div>
      </footer>

      {/* Victory Overlay */}
      <AnimatePresence>
        {status === 'VICTORY' && (
          <motion.div 
            key="victory-screen"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-6"
          >
             <div className="max-w-xl w-full hud-panel p-12 border-aura-cyan text-center space-y-10 bg-black/40 shadow-[0_0_100px_rgba(0,243,255,0.2)]">
                <div className="stat-label text-aura-cyan tracking-[12px]">Transmission_End</div>
                <h2 className="text-7xl font-bold tracking-tighter aura-cyan-text italic">
                  {winner === 'p1' ? 'GRID_CLEARED' : 'NEURAL_PURGE'}
                </h2>
                <div className="text-sm font-mono text-white/30 uppercase tracking-[0.5em] leading-relaxed">
                  The sequence has reached its terminal state. <br/> Access for {winner === 'p1' ? p1.callsign : p2.callsign} verified.
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-5 border border-aura-cyan aura-cyan-text text-sm font-black tracking-[10px] hover:bg-aura-cyan hover:text-black transition-all uppercase"
                >
                  Reconnect
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Effects */}
      <div className="fixed inset-0 pointer-events-none z-[1000] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,100,255,0.06))] bg-[length:100%_3px,2px_100%]" />
      <div className="fixed inset-0 pointer-events-none z-[1000] bg-[radial-gradient(circle_at_center,transparent_20%,black_100%)] opacity-30" />
    </div>
  );
}

function StatusTile({ iconColor, label, value }: any) {
  return (
    <div className="hud-panel px-4 flex items-center gap-3">
      <div className={`w-1.5 h-1.5 rounded-full ${iconColor} shadow-[0_0_5px_currentColor]`} />
      <div>
        <div className="stat-label !opacity-30">{label}</div>
        <div className="text-[10px] font-bold tracking-widest">{value}</div>
      </div>
    </div>
  );
}
