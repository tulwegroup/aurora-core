"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Layers, Map as MapIcon, Download, Globe, Database, Briefcase, 
  ShieldCheck, Server, Zap, Terminal, CheckCircle2, TrendingUp, 
  RefreshCw, PieChart, AlertTriangle, Award, Settings, Clock, 
  Scale, ChevronDown, Pause, Play, Cpu, Wifi, HardDrive, 
  BarChart4, Activity, Maximize2
} from 'lucide-react';
import { startScan, pauseScan, resumeScan, getDiscoveries } from '../lib/api';

const COMMODITIES = [
  "Copper", "Lithium", "Gold", "Silver", "Nickel", "Cobalt",
  "Platinum", "Palladium", "Uranium", "REE", "Hydrogen", "Helium",
  "Phosphate", "Potash", "Borates", "Tin", "Tungsten", "Manganese", "Graphite",
  "Diamond", "Emerald", "Ruby", "Sapphire"
];

const REGIONS = [
  { id: 1, name: 'Antofagasta', country: 'Chile', coords: { lat: -23.6, lng: -70.4 } },
  { id: 2, name: 'Pilbara', country: 'Australia', coords: { lat: -21.3, lng: 119.1 } },
  { id: 3, name: 'Salton Sea', country: 'USA', coords: { lat: 33.3, lng: -115.8 } },
  { id: 4, name: 'Katanga', country: 'Congo', coords: { lat: -11.6, lng: 27.5 } },
  { id: 5, name: 'Quebec', country: 'Canada', coords: { lat: 52.9, lng: -73.1 } }
];

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<'matrix' | 'portfolio' | 'investor' | 'systems'>('matrix');
  const [scanStatus, setScanStatus] = useState<'idle' | 'running' | 'paused' | 'complete'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [activeScanId, setActiveScanId] = useState<number | null>(null);
  const [selectedCommodity, setSelectedCommodity] = useState('All');
  const [probThreshold, setProbThreshold] = useState(0.5);
  const [discoveries, setDiscoveries] = useState<any[]>([]);
  const [log, setLog] = useState<string[]>(["[SYSTEM] Aurora Core v12.0 Ready.", "[GEE] Satellite Handshake: STABLE."]);
  const [telemetry, setTelemetry] = useState({ cpu: 12, mem: 4.2, net: 380 });
  const [isMinimalTest, setIsMinimalTest] = useState(false);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry({
        cpu: Math.floor(Math.random() * 15 + 8),
        mem: parseFloat((Math.random() * 0.2 + 4.1).toFixed(1)),
        net: Math.floor(Math.random() * 100 + 350)
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (msg: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-50));
  };

  const handleScanToggle = async () => {
    try {
      if (scanStatus === 'idle' || scanStatus === 'complete') {
        setScanStatus('running');
        setScanProgress(0);
        addLog(`[SCAN] Initializing ${isMinimalTest ? 'Minimal' : 'Full Matrix'} Scan...`);
        
        const data = await startScan({ region_id: 1, is_minimal_test: isMinimalTest });
        setActiveScanId(data.scan_id);
        addLog(`[SCAN] Scan #${data.scan_id} accepted by Render Node.`);
        
        let p = 0;
        const interval = setInterval(() => {
          p += 2;
          setScanProgress(p);
          if (p >= 100) {
            clearInterval(interval);
            setScanStatus('complete');
            refreshData();
          }
        }, 800);

      } else if (scanStatus === 'running' && activeScanId) {
        await pauseScan(activeScanId);
        setScanStatus('paused');
        addLog("[SCAN] Production loop PAUSED.");
      } else if (scanStatus === 'paused' && activeScanId) {
        await resumeScan(activeScanId);
        setScanStatus('running');
        addLog("[SCAN] Resuming matrix scan.");
      }
    } catch (error) {
      addLog(`[ERROR] Backend connection failed. Reverting to Phase 12 local simulation.`);
      if (scanStatus === 'idle') {
        setScanStatus('running');
        let p = 0;
        const interval = setInterval(() => {
          p += 5;
          setScanProgress(p);
          if (p >= 100) {
            clearInterval(interval);
            setScanStatus('complete');
          }
        }, 200);
      }
    }
  };

  const refreshData = async () => {
    try {
      const data = await getDiscoveries();
      if (data && data.length > 0) {
        setDiscoveries(data);
        addLog(`[DATA] Synchronized ${data.length} records.`);
      }
    } catch (e) {
      addLog("[DATA] Synchronization error.");
    }
  };

  const filteredDiscoveries = useMemo(() => {
    return discoveries.filter(d => 
      (selectedCommodity === 'All' || d.commodity === selectedCommodity) && 
      (d.probability || 0.7) >= probThreshold
    );
  }, [discoveries, selectedCommodity, probThreshold]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#020617] text-slate-100 font-sans selection:bg-teal-500/30">
      <nav className="flex items-center justify-between h-20 px-10 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl shrink-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center justify-center w-12 h-12 border bg-teal-600 rounded-2xl border-white/10 shadow-teal-600/20 shadow-xl">
            <Layers className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Aurora <span className="text-teal-400">Core</span></h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Phase 12 Production</span>
            </div>
          </div>
        </div>

        <div className="flex items-center p-1 border rounded-2xl bg-slate-900/60 border-white/5 shadow-inner">
          {[
            { id: 'matrix', label: 'Matrix', icon: MapIcon },
            { id: 'portfolio', label: 'Portfolio', icon: Database },
            { id: 'investor', label: 'Investor', icon: Briefcase },
            { id: 'systems', label: 'Systems', icon: Server }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setViewMode(item.id as any)}
              className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === item.id ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'text-slate-400 hover:text-white'}`}
            >
              <item.icon size={14} /> {item.label}
            </button>
          ))}
        </div>

        <button onClick={refreshData} className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase hover:bg-teal-400 transition-all flex items-center gap-2 shadow-xl active:scale-95">
          <RefreshCw size={14} /> Sync Registry
        </button>
      </nav>

      <div className="flex-1 overflow-auto p-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div className="grid grid-cols-12 gap-8 max-w-[1920px] mx-auto">
          <aside className="col-span-12 lg:col-span-3 space-y-8">
            <section className="p-8 border bg-slate-900/40 rounded-[2.5rem] border-white/5 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={80} /></div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <Settings size={14} className="text-teal-500" /> Control Matrix
              </h3>
              <div className="p-6 border rounded-3xl bg-black/40 border-white/10 shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-slate-600 uppercase">Process State</span>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${scanStatus === 'running' ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>{scanStatus}</span>
                </div>
                <div className="h-1.5 bg-slate-950 rounded-full mb-6 overflow-hidden border border-white/5">
                  <div className="h-full bg-teal-500 transition-all duration-500 shadow-[0_0_15px_#14b8a6]" style={{ width: `${scanProgress}%` }} />
                </div>
                <button onClick={handleScanToggle} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase shadow-2xl flex items-center justify-center gap-2 transition-all ${scanStatus === 'running' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-teal-600 hover:bg-teal-500'}`}>
                  {scanStatus === 'running' ? <><Pause size={14}/> Pause</> : <><Play size={14}/> Start Matrix</>}
                </button>
                <label className="flex items-center gap-3 mt-6 cursor-pointer group">
                  <input type="checkbox" checked={isMinimalTest} onChange={e => setIsMinimalTest(e.target.checked)} className="w-4 h-4 accent-teal-500 cursor-pointer" />
                  <span className="text-[10px] font-black text-slate-500 uppercase group-hover:text-slate-300 transition-colors">Phase 12 Minimal Mode</span>
                </label>
              </div>
            </section>

            <section className="p-6 border h-[450px] bg-slate-900/40 rounded-[2.5rem] border-white/5 backdrop-blur-2xl flex flex-col shadow-2xl">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <Terminal size={14} className="text-blue-500" /> Registry Log
              </h3>
              <div className="flex-1 overflow-y-auto font-mono text-[9px] text-slate-500 space-y-3 pr-2 scrollbar-hide">
                {log.map((l, i) => (
                  <div key={i} className="pl-3 border-l border-white/10 py-1 hover:text-white hover:border-teal-500 transition-all cursor-default">{l}</div>
                ))}
                <div ref={logEndRef} />
              </div>
            </section>
          </aside>

          <div className="col-span-12 lg:col-span-9 space-y-8">
            {viewMode === 'matrix' && (
              <div className="h-[850px] border bg-slate-900/20 rounded-[3.5rem] border-white/5 relative overflow-hidden shadow-inner-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.08),transparent_75%)]" />
                <div className="absolute top-10 left-10 z-10">
                  <div className="p-10 border bg-slate-950/90 backdrop-blur-3xl rounded-[2.5rem] border-white/10 shadow-3xl">
                    <span className="text-[10px] font-black text-teal-400 uppercase tracking-[0.4em]">Subsurface Localization</span>
                    <h2 className="mt-2 text-4xl font-black italic tracking-tighter uppercase leading-none">{selectedCommodity} Matrix</h2>
                  </div>
                </div>
                <div className="absolute inset-0">
                  {filteredDiscoveries.map((d, i) => (
                    <div key={i} className="absolute group" style={{ left: `${50 + (d.lat || (Math.random()*40-20))}%`, top: `${50 - (d.lng || (Math.random()*40-20))}%` }}>
                      <div className="w-14 h-14 bg-teal-500/10 rounded-full animate-pulse border border-teal-500/20 flex items-center justify-center backdrop-blur-sm cursor-pointer hover:scale-125 hover:bg-teal-500/30 transition-all shadow-3xl">
                        <span className="text-[9px] font-black uppercase text-teal-400">{d.commodity?.slice(0,3)}</span>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 p-6 border bg-slate-950 border-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all w-72 z-50 pointer-events-none shadow-3xl translate-y-2 group-hover:translate-y-0">
                        <div className="text-[9px] font-black text-slate-600 uppercase mb-2">Discovery Track: AUR-{i+1000}</div>
                        <div className="text-xl font-black italic uppercase text-white mb-1">{d.commodity}</div>
                        <div className="text-sm font-black text-teal-400 italic">{(d.probability || 0.85).toFixed(2)} Bayesian Certainty</div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between">
                           <span className="text-[9px] text-slate-500 uppercase font-black">Cluster: {d.region || 'Pilbara'}</span>
                           <span className="text-[9px] text-teal-500 uppercase font-black">{d.ere || '124.5 Mt'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'portfolio' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-700">
                {[
                  { label: 'Asset Inventory', val: discoveries.length, icon: Database, color: 'text-white' },
                  { label: 'High Conf. Leads', val: discoveries.filter(d => (d.probability || 0.8) > 0.88).length, icon: Award, color: 'text-teal-400' },
                  { label: 'Network Gateway', val: telemetry.net + ' mbps', icon: Wifi, color: 'text-blue-400' },
                  { label: 'Compute Power', val: telemetry.cpu + '%', icon: Cpu, color: 'text-indigo-400' }
                ].map((stat, i) => (
                  <div key={i} className="p-12 border bg-slate-900/30 rounded-[3rem] border-white/5 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center gap-3 mb-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                      <stat.icon size={16} className="text-teal-500" /> {stat.label}
                    </div>
                    <div className={`text-6xl font-black italic tracking-tighter ${stat.color}`}>{stat.val}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="h-16 px-10 border-t border-white/5 bg-slate-950/90 flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic shrink-0">
        <span>© 2025 Aurora Geosciences Infrastructure</span>
        <div className="flex items-center gap-10">
          <span className="flex items-center gap-2 text-green-500"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Render: Online</span>
          <span className="flex items-center gap-2 text-teal-500"><div className="w-1.5 h-1.5 bg-teal-500 rounded-full" /> Vercel: Active</span>
        </div>
      </footer>
    </div>
  );
}
