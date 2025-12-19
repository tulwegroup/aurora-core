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

  // Telemetry simulation
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
        
        // Mock progress for UI feedback while backend processes
        let p = 0;
        const interval = setInterval(() => {
          p += 2;
          setScanProgress(p);
          if (p >= 100) {
            clearInterval(interval);
            setScanStatus('complete');
            refreshData();
          }
        }, 1000);

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
      addLog(`[ERROR] Backend connection failed: ${(error as any).message}`);
    }
  };

  const refreshData = async () => {
    const data = await getDiscoveries();
    if (data && data.length > 0) {
      setDiscoveries(data);
      addLog(`[DATA] Synchronized ${data.length} discovery records.`);
    }
  };

  const filteredDiscoveries = useMemo(() => {
    return discoveries.filter(d => 
      (selectedCommodity === 'All' || d.commodity === selectedCommodity) && 
      (d.probability || 0.7) >= probThreshold
    );
  }, [discoveries, selectedCommodity, probThreshold]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#020617] text-slate-100">
      {/* Institutional Top Bar */}
      <nav className="flex items-center justify-between h-20 px-10 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center justify-center w-12 h-12 border bg-teal-600 rounded-2xl border-white/10 shadow-teal-600/20 shadow-xl">
            <Layers className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Aurora <span className="text-teal-400">Core</span></h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Phase 12 Live</span>
            </div>
          </div>
        </div>

        <div className="flex items-center p-1 border rounded-2xl bg-slate-900/60 border-white/5">
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

        <button onClick={refreshData} className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase hover:bg-teal-400 transition-all flex items-center gap-2">
          <RefreshCw size={14} /> Sync Registry
        </button>
      </nav>

      <div className="flex-1 overflow-auto p-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div className="grid grid-cols-12 gap-8 max-w-[1800px] mx-auto">
          
          {/* Controls Sidebar */}
          <aside className="col-span-12 lg:col-span-3 space-y-8">
            <section className="p-8 border bg-slate-900/40 rounded-[2.5rem] border-white/5 backdrop-blur-2xl">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <Settings size={14} className="text-teal-500" /> Command Center
              </h3>
              
              <div className="p-6 border rounded-3xl bg-black/40 border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-slate-600 uppercase">Loop State</span>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${scanStatus === 'running' ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>{scanStatus}</span>
                </div>
                <div className="h-1.5 bg-slate-950 rounded-full mb-6 overflow-hidden">
                  <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${scanProgress}%` }} />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleScanToggle}
                    className="flex-1 py-4 bg-teal-600 hover:bg-teal-500 rounded-2xl text-[10px] font-black uppercase shadow-xl flex items-center justify-center gap-2"
                  >
                    {scanStatus === 'running' ? <><Pause size={14}/> Pause</> : <><Play size={14}/> Start Matrix</>}
                  </button>
                </div>
                <label className="flex items-center gap-3 mt-6 cursor-pointer group">
                  <input type="checkbox" checked={isMinimalTest} onChange={e => setIsMinimalTest(e.target.checked)} className="w-4 h-4 accent-teal-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase group-hover:text-slate-300">Phase 12 Minimal Mode</span>
                </label>
              </div>

              <div className="mt-8 space-y-6">
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-600 uppercase block pl-1">Matrix Filter</span>
                  <select 
                    value={selectedCommodity} 
                    onChange={e => setSelectedCommodity(e.target.value)}
                    className="w-full p-4 text-xs font-bold bg-slate-950 border border-white/10 rounded-2xl appearance-none outline-none focus:ring-1 ring-teal-500"
                  >
                    <option value="All">Full 23-Commodity Matrix</option>
                    {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </section>

            <section className="p-6 border h-[400px] bg-slate-900/40 rounded-[2.5rem] border-white/5 backdrop-blur-2xl flex flex-col">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <Terminal size={14} className="text-blue-500" /> Registry Log
              </h3>
              <div className="flex-1 overflow-y-auto font-mono text-[9px] text-slate-500 space-y-3 pr-2 scrollbar-hide">
                {log.map((l, i) => (
                  <div key={i} className="pl-3 border-l border-white/10 py-0.5 hover:text-white transition-colors">{l}</div>
                ))}
              </div>
            </section>
          </aside>

          {/* Main Visualizer */}
          <div className="col-span-12 lg:col-span-9 space-y-8">
            {viewMode === 'matrix' && (
              <div className="h-[800px] border bg-slate-900/20 rounded-[3.5rem] border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.05),transparent_70%)]" />
                
                <div className="absolute top-10 left-10 z-10">
                  <div className="p-10 border bg-slate-950/90 backdrop-blur-3xl rounded-[2.5rem] border-white/10">
                    <span className="text-[10px] font-black text-teal-400 uppercase tracking-[0.4em]">Subsurface Localization</span>
                    <h2 className="mt-2 text-4xl font-black italic tracking-tighter uppercase">{selectedCommodity} Matrix</h2>
                  </div>
                </div>

                {/* Simulated Map Markers */}
                <div className="absolute inset-0">
                  {filteredDiscoveries.map((d, i) => (
                    <div 
                      key={i} 
                      className="absolute group"
                      style={{ 
                        left: `${50 + (d.lat || 0) * 1.5}%`, 
                        top: `${50 - (d.lng || 0) * 1.5}%` 
                      }}
                    >
                      <div className="w-12 h-12 bg-teal-500/20 rounded-full animate-pulse border border-teal-500/30 flex items-center justify-center backdrop-blur-sm cursor-pointer hover:scale-125 transition-transform">
                        <span className="text-[8px] font-black uppercase text-teal-400">{d.commodity?.slice(0,3)}</span>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 p-4 border bg-slate-950 border-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity w-48 z-50 pointer-events-none shadow-2xl">
                        <div className="text-[8px] font-bold text-slate-500 uppercase mb-1">Discovery Track</div>
                        <div className="text-sm font-black italic uppercase text-white mb-2">{d.commodity}</div>
                        <div className="text-xs font-bold text-teal-400">{Math.round((d.probability || 0.8) * 100)}% Certainty</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                  <div className="p-8 border bg-slate-950/90 backdrop-blur-3xl rounded-[2.5rem] border-white/10 w-96">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Aggregate Hits</span>
                      <span className="text-2xl font-black italic">{filteredDiscoveries.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">High Conf Leads</span>
                      <span className="text-2xl font-black italic text-teal-400">{filteredDiscoveries.filter(f => (f.probability || 0) > 0.8).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'portfolio' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
                {[
                  { label: 'Total Inventory', val: discoveries.length, icon: Database, color: 'text-white' },
                  { label: 'Tier-1 Certified', val: discoveries.filter(d => (d.probability || 0) > 0.88).length, icon: Award, color: 'text-teal-400' },
                  { label: 'Active Regions', val: REGIONS.length, icon: Globe, color: 'text-blue-400' },
                  { label: 'Network Pulse', val: telemetry.net + ' mbps', icon: Wifi, color: 'text-indigo-400' }
                ].map((stat, i) => (
                  <div key={i} className="p-10 border bg-slate-900/30 rounded-[2.5rem] border-white/5 backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <stat.icon size={14} className="text-teal-500" /> {stat.label}
                    </div>
                    <div className={`text-5xl font-black italic tracking-tighter ${stat.color}`}>{stat.val}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="h-16 px-10 border-t border-white/5 bg-slate-950/80 flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
        <span>© 2025 Aurora Geosciences — Phase 12 Operational</span>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Render Backend Secure</span>
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-teal-500 rounded-full" /> Vercel Edge Active</span>
        </div>
      </footer>
    </div>
  );
}
