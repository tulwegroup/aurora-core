"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Layers, 
  Map as MapIcon, 
  Download, 
  Globe, 
  Database, 
  Briefcase, 
  ShieldCheck, 
  Server, 
  Zap, 
  Terminal, 
  CheckCircle2, 
  TrendingUp, 
  RefreshCw, 
  PieChart, 
  AlertTriangle, 
  Award, 
  Settings,
  Clock,
  Scale,
  ChevronDown,
  Pause,
  Play,
  FileSpreadsheet,
  Cpu,
  Wifi,
  HardDrive,
  BarChart4,
  Activity,
  Maximize2,
  Info,
  Search,
  Filter,
  Eye,
  Check
} from 'lucide-react';

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

interface Discovery {
  id: number;
  commodity: string;
  probability: number;
  region: string;
  country: string;
  ere: string;
  timestamp: string;
  coordinates: { lat: number; lng: number };
}

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<'matrix' | 'portfolio' | 'investor' | 'compliance' | 'systems'>('matrix');
  const [scanStatus, setScanStatus] = useState<'idle' | 'running' | 'paused' | 'complete'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedCommodity, setSelectedCommodity] = useState('All');
  const [probThreshold, setProbThreshold] = useState(0.5);
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [log, setLog] = useState<string[]>(["[SYSTEM] Aurora Core v12.0 Ready for Deployment.", "[GEE] Live Satellite Handshake: STABLE.", "[BAYESIAN] 23-Commodity Matrix Loaded."]);
  const [telemetry, setTelemetry] = useState({ cpu: 14, mem: 4.8, net: 420 });
  const [isMinimalTest, setIsMinimalTest] = useState(false);
  
  const logEndRef = useRef<HTMLDivElement>(null);
  const scanIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  useEffect(() => {
    const telInterval = setInterval(() => {
      setTelemetry({
        cpu: Math.floor(Math.random() * 20 + 10),
        mem: parseFloat((Math.random() * 0.4 + 4.8).toFixed(1)),
        net: Math.floor(Math.random() * 150 + 380)
      });
    }, 3000);
    return () => clearInterval(telInterval);
  }, []);

  const addLog = (msg: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-100));
  };

  const handleScanToggle = () => {
    if (scanStatus === 'idle' || scanStatus === 'complete') {
      startProductionScan();
    } else if (scanStatus === 'running') {
      setScanStatus('paused');
      addLog("[SCAN] Production loop PAUSED.");
    } else if (scanStatus === 'paused') {
      setScanStatus('running');
      addLog("[SCAN] Resuming Production matrix scan.");
    }
  };

  const startProductionScan = () => {
    setScanStatus('running');
    setScanProgress(0);
    setDiscoveries([]);
    const activeCommodities = isMinimalTest ? ["Lithium", "Copper", "Gold"] : COMMODITIES;
    addLog(`[SCAN] Initiating Phase 12 ${isMinimalTest ? 'Minimal' : 'Full Matrix'} Global Scan...`);
    
    let step = 0;
    const totalSteps = activeCommodities.length * 2; 

    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    scanIntervalRef.current = window.setInterval(() => {
      setScanStatus(prev => {
        if (prev === 'paused') return 'paused';
        if (prev === 'idle') {
          if(scanIntervalRef.current) clearInterval(scanIntervalRef.current);
          return 'idle';
        }

        step++;
        const progress = Math.min((step / totalSteps) * 100, 100);
        setScanProgress(progress);

        const commodityIndex = Math.floor((step - 1) / 2);
        const currentCommodity = activeCommodities[commodityIndex];
        const isFusionPhase = step % 2 === 0;

        if (!isFusionPhase) {
          addLog(`[GEE] Analyzing multispectral data for ${currentCommodity}...`);
        } else {
          addLog(`[FUSION] Bayesian update completed for ${currentCommodity}.`);
          if (Math.random() > 0.7) {
            const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
            const prob = 0.55 + Math.random() * 0.42;
            const newDiscovery: Discovery = {
              id: 1000000 + Math.floor(Math.random() * 8999999),
              commodity: currentCommodity,
              probability: prob,
              region: region.name,
              country: region.country,
              ere: (Math.random() * 250 + 50).toFixed(1) + ' Mt',
              timestamp: new Date().toISOString(),
              coordinates: { 
                lat: region.coords.lat + (Math.random() * 2 - 1), 
                lng: region.coords.lng + (Math.random() * 2 - 1) 
              }
            };
            setDiscoveries(prev => [newDiscovery, ...prev]);
            addLog(`[DISCOVERY] ${currentCommodity} localization in ${region.name} (P=${(prob*100).toFixed(0)}%).`);
          }
        }

        if (step >= totalSteps) {
          if(scanIntervalRef.current) clearInterval(scanIntervalRef.current);
          addLog("[SYSTEM] Global Matrix Scan COMPLETE. Portfolio records synchronized.");
          return 'complete';
        }
        return 'running';
      });
    }, 800);
  };

  const filteredDiscoveries = useMemo(() => {
    return discoveries.filter(d => 
      (selectedCommodity === 'All' || d.commodity === selectedCommodity) && 
      d.probability >= probThreshold
    );
  }, [discoveries, selectedCommodity, probThreshold]);

  const stats = useMemo(() => {
    const highConf = filteredDiscoveries.filter(d => d.probability > 0.88).length;
    const totalEre = filteredDiscoveries.reduce((acc, d) => acc + parseFloat(d.ere), 0).toFixed(1);
    return { count: filteredDiscoveries.length, highConf, totalEre };
  }, [filteredDiscoveries]);

  const getCertaintySafeRange = (prob: number) => {
    const low = Math.max(0, prob - 0.05).toFixed(2);
    const high = Math.min(1, prob + 0.05).toFixed(2);
    return `${(parseFloat(low) * 100).toFixed(0)}% - ${(parseFloat(high) * 100).toFixed(0)}%`;
  };

  const handleExportCSV = () => {
    if (filteredDiscoveries.length === 0) return;
    const headers = "Discovery_ID,Commodity,Region,Country,Probability_Range,ERE_Estimate,Timestamp,Lat,Lng\n";
    const rows = filteredDiscoveries.map(d => 
      `${d.id},${d.commodity},${d.region},${d.country},"${getCertaintySafeRange(d.probability)}",${d.ere},${d.timestamp},${d.coordinates.lat},${d.coordinates.lng}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurora_discovery_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addLog("[SYSTEM] CSV Portfolio Export generated and downloaded.");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans antialiased selection:bg-teal-500/30 flex flex-col overflow-hidden">
      {/* Top Institutional Header */}
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-3xl sticky top-0 z-[100] h-20 px-10 flex items-center justify-between shadow-2xl shrink-0">
        <div className="flex items-center gap-8">
          <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-teal-600/30 border border-white/10 ring-1 ring-white/5">
            <Layers className="text-white" size={28} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Aurora <span className="text-teal-400">Core</span></h1>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Phase 12 Operational Infrastructure
            </span>
          </div>
        </div>
        
        <div className="flex items-center bg-slate-900/60 rounded-[1.5rem] p-1.5 border border-white/5 shadow-inner">
          {[
            { id: 'matrix', label: 'Matrix', icon: MapIcon },
            { id: 'portfolio', label: 'Portfolio', icon: Database },
            { id: 'investor', label: 'Investor', icon: Briefcase },
            { id: 'compliance', label: 'Audit', icon: ShieldCheck },
            { id: 'systems', label: 'Systems', icon: Server }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setViewMode(item.id as any)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] transition-all ${viewMode === item.id ? 'bg-teal-600 text-white shadow-xl shadow-teal-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <item.icon size={14} /> {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden xl:flex flex-col items-end">
             <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Global Protocol Status</span>
             <span className="text-xs font-black text-teal-400 font-mono tracking-tighter italic uppercase">V12_PROD_STABLE</span>
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase hover:bg-teal-400 transition-all shadow-2xl active:scale-95"
          >
            <Download size={18} /> Dataset Export
          </button>
        </div>
      </nav>

      <div className="flex-1 overflow-auto bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <main className="max-w-[1920px] mx-auto p-10 grid grid-cols-12 gap-10">
          {/* Sidebar Control Panel */}
          <aside className="col-span-12 lg:col-span-3 space-y-10">
            <section className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"><Zap size={140} /></div>
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                <Settings size={16} className="text-teal-500" /> Command Matrix
              </h3>
              
              <div className="space-y-8">
                <div className="bg-black/40 rounded-[2rem] p-8 border border-white/10 shadow-inner">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Process State</span>
                    <div className={`px-3 py-1 rounded-md text-[9px] font-black tracking-tighter uppercase ${scanStatus === 'running' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : scanStatus === 'paused' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-500 border border-white/5'}`}>
                      {scanStatus}
                    </div>
                  </div>
                  
                  <div className="w-full h-1.5 bg-slate-950 rounded-full mb-8 overflow-hidden border border-white/5">
                    <div className="h-full bg-teal-500 shadow-[0_0_15px_#14b8a6] transition-all duration-700 ease-out" style={{ width: `${scanProgress}%` }} />
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={handleScanToggle}
                      className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase transition-all shadow-2xl flex items-center justify-center gap-2 ${scanStatus === 'running' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-teal-600 hover:bg-teal-500'}`}
                    >
                      {scanStatus === 'running' ? <><Pause size={16} /> Pause</> : scanStatus === 'paused' ? <><Play size={16} /> Resume</> : <><RefreshCw size={16} /> Start Scan</>}
                    </button>
                    {scanStatus !== 'idle' && (
                      <button onClick={() => { setScanStatus('idle'); setScanProgress(0); setDiscoveries([]); }} className="p-4 bg-slate-800 rounded-2xl text-slate-400 hover:bg-slate-700 hover:text-white transition-all shadow-xl">
                        <Clock size={16} />
                      </button>
                    )}
                  </div>

                  <div className="mt-6 flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group/test">
                    <input 
                      type="checkbox" 
                      id="minimal-test-ui" 
                      checked={isMinimalTest} 
                      onChange={(e) => setIsMinimalTest(e.target.checked)}
                      className="w-5 h-5 rounded accent-teal-500 cursor-pointer"
                    />
                    <label htmlFor="minimal-test-ui" className="text-[11px] font-black text-slate-400 uppercase cursor-pointer select-none group-hover/test:text-slate-200">Phase 12 Minimal Test (Li, Cu, Au)</label>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-600 uppercase block pl-1 tracking-[0.2em]">Matrix Focus</label>
                    <div className="relative group/select">
                      <select 
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4.5 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-teal-500/50 transition-all cursor-pointer"
                        value={selectedCommodity}
                        onChange={(e) => setSelectedCommodity(e.target.value)}
                      >
                        <option value="All">Full 23-Commodity Suite</option>
                        {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase mb-4 tracking-[0.2em]">
                      <span>Certainty Threshold</span>
                      <span className="text-teal-400 font-mono text-xs">{Math.round(probThreshold * 100)}%</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.01" value={probThreshold} onChange={(e) => setProbThreshold(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]" />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 h-[480px] flex flex-col backdrop-blur-3xl shadow-2xl relative">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                <Terminal size={16} className="text-blue-500" /> Operational Registry
              </h3>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-4 pr-3 scrollbar-hide">
                {log.map((line, i) => (
                  <div key={i} className="border-l-2 border-white/10 pl-4 py-1 text-slate-500 hover:text-white transition-colors cursor-default whitespace-pre-wrap leading-relaxed hover:border-teal-500">
                    {line}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </section>
          </aside>

          {/* Core Display Interface */}
          <div className="col-span-12 lg:col-span-9 space-y-10">
            {viewMode === 'matrix' && (
              <div className="h-[950px] bg-slate-900/10 rounded-[4rem] border border-white/5 relative overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(20,184,166,0.08),transparent_80%)]"></div>
                
                <div className="absolute top-14 left-14 z-20 flex flex-col gap-6">
                  <div className="bg-slate-950/95 backdrop-blur-3xl px-12 py-8 rounded-[3rem] border border-white/10 shadow-3xl">
                    <div className="text-[11px] text-teal-400 font-black uppercase tracking-[0.5em] mb-3">Geoscientific Localization</div>
                    <div className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">{selectedCommodity} Anomalies</div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-slate-950/95 backdrop-blur-3xl px-8 py-4 rounded-2xl border border-white/10 flex items-center gap-3 shadow-xl">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse shadow-[0_0_10px_#14b8a6]"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">GEE Multichannel Feed: OK</span>
                    </div>
                    <div className="bg-slate-950/95 backdrop-blur-3xl px-8 py-4 rounded-2xl border border-white/10 flex items-center gap-3 shadow-xl">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bayesian Posterior Active</span>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 pointer-events-none opacity-5">
                   <div className="grid grid-cols-12 h-full w-full">
                      {Array.from({length: 12}).map((_, i) => <div key={i} className="border-r border-white/20 h-full" />)}
                   </div>
                   <div className="absolute inset-0 grid grid-rows-12 h-full w-full">
                      {Array.from({length: 12}).map((_, i) => <div key={i} className="border-b border-white/20 w-full" />)}
                   </div>
                </div>

                <div className="absolute inset-0">
                  {filteredDiscoveries.map(d => (
                    <div 
                      key={d.id} 
                      className="absolute cursor-pointer transition-transform hover:scale-125 duration-300"
                      style={{ left: `${50 + (d.coordinates.lng / 4.5) * 10}%`, top: `${50 - (d.coordinates.lat / 2.5) * 10}%` }}
                    >
                      <div className="relative group/marker">
                        <div className={`w-16 h-16 rounded-full blur-3xl animate-pulse opacity-40 transition-colors ${d.probability > 0.88 ? 'bg-teal-500 shadow-[0_0_60px_#14b8a6]' : 'bg-blue-600'}`}></div>
                        <div className={`absolute inset-0 rounded-full border-2 bg-slate-950/90 flex items-center justify-center shadow-2xl transition-all ${d.probability > 0.88 ? 'border-teal-400' : 'border-blue-500'}`}>
                           <span className="text-[11px] font-black uppercase tracking-tighter italic">{d.commodity.slice(0,3)}</span>
                        </div>
                        
                        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-slate-950/98 border border-white/10 p-8 rounded-[3rem] w-80 opacity-0 group-hover/marker:opacity-100 transition-all z-50 pointer-events-none translate-y-4 group-hover/marker:translate-y-0 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
                          <div className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest leading-none">Record ID: AUR-{d.id}</div>
                          <div className="text-3xl font-black mb-3 text-white italic tracking-tight uppercase">{d.commodity}</div>
                          <div className="text-base font-black text-teal-400 bg-teal-400/10 px-5 py-2 rounded-xl inline-block mb-6 tracking-tight border border-teal-500/20">{getCertaintySafeRange(d.probability)} Conf. Range</div>
                          <div className="space-y-4 border-t border-white/10 pt-6">
                             <div className="flex justify-between text-xs items-center"><span className="text-slate-500 font-black uppercase tracking-widest text-[9px]">Location:</span> <span className="text-slate-200 font-bold bg-white/5 px-3 py-1 rounded-lg border border-white/5">{d.region}, {d.country}</span></div>
                             <div className="flex justify-between text-xs items-center"><span className="text-slate-500 font-black uppercase tracking-widest text-[9px]">ERE Estimate:</span> <span className="text-teal-400 font-mono font-black text-lg">{d.ere}</span></div>
                          </div>
                          <div className="mt-8 flex gap-2">
                             <button className="flex-1 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest py-4 rounded-xl border border-white/10 transition-colors">Spectral Analysis</button>
                             <button className="p-4 bg-teal-600/20 text-teal-400 rounded-xl border border-teal-500/20 hover:bg-teal-600/30 transition-colors"><Maximize2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-14 left-14 right-14 flex justify-between items-end">
                  <div className="bg-slate-950/95 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 w-[600px] shadow-3xl">
                    <div className="grid grid-cols-2 gap-16">
                      <div>
                        <div className="text-[11px] text-slate-500 uppercase font-black tracking-widest mb-4">Institutional Inventory</div>
                        <div className="text-6xl font-black text-white italic tracking-tighter leading-none">{stats.count} <span className="text-xs text-slate-700 not-italic uppercase tracking-widest ml-2">Units</span></div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-500 uppercase font-black tracking-widest mb-4">Tier-1 Confirmed</div>
                        <div className="text-6xl font-black text-teal-400 italic tracking-tighter leading-none">{stats.highConf} <span className="text-xs text-slate-700 not-italic uppercase tracking-widest ml-2">Secured</span></div>
                      </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <Activity className="text-teal-500" size={20} />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Matrix loop operational</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                          <span className="text-[10px] font-black text-slate-600 uppercase">Production Protocol</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'portfolio' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-700">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                   {[
                     { label: 'Asset Inventory', val: discoveries.length, icon: Database, color: 'text-white' },
                     { label: 'Tier-1 Certified', val: stats.highConf, icon: Award, color: 'text-teal-400' },
                     { label: 'Commodity Diversification', val: `${isMinimalTest ? '3' : '23'}/23`, icon: PieChart, color: 'text-blue-400' },
                     { label: 'Aggregated ERE Volume', val: stats.totalEre + ' Mt', icon: TrendingUp, color: 'text-indigo-400' }
                   ].map(card => (
                     <div key={card.label} className="bg-slate-900/30 border border-white/5 p-12 rounded-[4rem] backdrop-blur-3xl shadow-2xl hover:border-teal-500/20 transition-all border-l-4 border-l-transparent hover:border-l-teal-500 group">
                        <div className="text-[11px] text-slate-500 font-black uppercase mb-6 tracking-widest flex items-center gap-3 group-hover:text-white transition-colors">
                          <card.icon size={16} className="text-teal-500" /> {card.label}
                        </div>
                        <div className={`text-6xl font-black tracking-tighter italic ${card.color}`}>{card.val}</div>
                     </div>
                   ))}
                 </div>

                 <section className="bg-slate-900/30 border border-white/5 rounded-[5rem] overflow-hidden backdrop-blur-3xl shadow-3xl">
                    <div className="p-16 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                      <div>
                        <h3 className="text-5xl font-black text-white uppercase tracking-tighter italic">Global Asset Registry</h3>
                        <p className="text-lg text-slate-500 font-medium tracking-wide mt-3 max-w-2xl">Phase 12 subsurface data synchronization. All estimates represent probabilistic geoscientific certainties.</p>
                      </div>
                      <div className="flex gap-4">
                         <button 
                          onClick={handleExportCSV}
                          className="flex items-center gap-4 px-12 py-6 bg-teal-600 rounded-2xl text-[12px] font-black uppercase hover:bg-teal-500 transition-all shadow-2xl shadow-teal-600/30"
                         >
                            <Download size={20} /> Export Portfolio (CSV)
                         </button>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[13px] text-slate-600 font-black uppercase tracking-[0.6em] border-b border-white/5">
                            <th className="px-16 py-14">Registry Entry ID</th>
                            <th className="px-16 py-14">Target Matrix Asset</th>
                            <th className="px-16 py-14">Certainty Range</th>
                            <th className="px-16 py-14">Envelope Magnitude</th>
                            <th className="px-16 py-14 text-right">Verification Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredDiscoveries.map(d => (
                            <tr key={d.id} className="hover:bg-white/[0.03] transition-colors group cursor-pointer">
                              <td className="px-16 py-14 font-mono text-xs text-slate-500 italic tracking-tighter leading-none">AUR-PH12-{d.id}</td>
                              <td className="px-16 py-14">
                                <div className="flex items-center gap-8">
                                  <div className={`w-4 h-4 rounded-full ${d.probability > 0.88 ? 'bg-teal-500 shadow-[0_0_25px_#14b8a6]' : 'bg-blue-600 shadow-[0_0_15px_#2563eb]'}`}></div>
                                  <span className="text-4xl font-black text-white tracking-tighter italic uppercase">{d.commodity}</span>
                                </div>
                              </td>
                              <td className="px-16 py-14">
                                 <div className="text-3xl font-black text-white mb-4 italic tracking-tight leading-none">{getCertaintySafeRange(d.probability)}</div>
                                 <div className="w-64 h-2 bg-slate-950 rounded-full overflow-hidden border border-white/10 shadow-inner">
                                    <div className="h-full bg-teal-500 shadow-[0_0_15px_#14b8a6]" style={{ width: `${d.probability*100}%` }}></div>
                                 </div>
                              </td>
                              <td className="px-16 py-14 text-3xl font-black text-slate-400 font-mono tracking-tighter italic">{d.ere}</td>
                              <td className="px-16 py-14 text-right">
                                 <div className="flex flex-col items-end gap-3">
                                    <span className="px-6 py-2 bg-green-500/10 text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20 shadow-sm">Institutional Validated</span>
                                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter italic">{d.region}, {d.country}</span>
                                 </div>
                              </td>
                            </tr>
                          ))}
                          {filteredDiscoveries.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-16 py-32 text-center text-slate-500 font-black uppercase tracking-widest">No discoveries matched current matrix filters.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                 </section>
              </div>
            )}

            {viewMode === 'investor' && (
              <div className="space-y-12 animate-in fade-in duration-700">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-slate-900/30 border border-white/5 rounded-[4rem] p-20 backdrop-blur-3xl shadow-3xl">
                       <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-16 flex items-center gap-5">
                          <BarChart4 className="text-teal-400" size={36} /> Portfolio Allocation
                       </h3>
                       <div className="space-y-12">
                          {['Lithium', 'Copper', 'Gold', 'Nickel', 'Cobalt'].map((c, i) => {
                            const count = discoveries.filter(d => d.commodity === c).length;
                            return (
                              <div key={c} className="flex items-center justify-between group">
                                <div className="flex flex-col">
                                  <span className="text-2xl font-black text-white group-hover:text-teal-400 transition-colors italic tracking-tight uppercase leading-none">{c}</span>
                                  <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest mt-2">Strategic Target</span>
                                </div>
                                <div className="flex-1 mx-16 h-4 bg-slate-950 rounded-full overflow-hidden border border-white/10 shadow-inner">
                                  <div className="h-full bg-teal-500 shadow-[0_0_20px_#14b8a6]" style={{ width: `${Math.min((count/10)*100, 100)}%` }}></div>
                                </div>
                                <span className="text-2xl font-black text-slate-400 italic font-mono uppercase">{count} LEADS</span>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                    
                    <div className="bg-slate-900/30 border border-white/5 rounded-[4rem] p-20 backdrop-blur-3xl shadow-3xl">
                       <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-16 flex items-center gap-5">
                          <Globe className="text-blue-400" size={36} /> Regional Distribution
                       </h3>
                       <div className="space-y-12">
                          {REGIONS.map(r => (
                            <div key={r.id} className="flex items-center justify-between border-b border-white/5 pb-10 last:border-0 group">
                               <div className="flex flex-col">
                                  <span className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors italic tracking-tighter leading-none uppercase">{r.name} Sector</span>
                                  <span className="text-[12px] font-black text-slate-600 uppercase tracking-widest mt-2">{r.country} Central Hub</span>
                               </div>
                               <div className="flex items-center gap-8">
                                  <TrendingUp size={28} className="text-blue-500" />
                                  <span className="text-xs font-black text-blue-500 uppercase tracking-tighter italic border border-blue-500/20 px-8 py-3 rounded-2xl bg-blue-500/5">Active Scan Zone</span>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <section className="bg-slate-900/30 border border-white/5 rounded-[5rem] p-32 flex flex-col items-center text-center backdrop-blur-3xl shadow-3xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-40 pointer-events-none" />
                    <div className="w-24 h-24 bg-teal-600/10 rounded-[3rem] flex items-center justify-center text-teal-400 border border-teal-500/20 shadow-3xl mb-12">
                       <ShieldCheck size={64} />
                    </div>
                    <h2 className="text-7xl font-black tracking-tighter italic mb-10 uppercase text-white leading-[0.9] max-w-5xl">Institutional Global Resource Certified</h2>
                    <p className="text-2xl text-slate-500 font-medium tracking-tight max-w-4xl leading-relaxed mb-20">
                       Aurora Core Phase 12 records represent strictly conservative Bayesian fusion kernels. 
                       All certainty ranges are claim-safe geoscientific estimates derived from multi-spectral satellite imagery and gravimetric priors.
                    </p>
                    <div className="flex gap-10">
                       <button className="px-16 py-8 bg-slate-950 border border-white/10 rounded-3xl text-[14px] font-black uppercase hover:bg-white hover:text-black transition-all shadow-2xl">Quarterly Portfolio Deck (PDF)</button>
                       <button className="px-16 py-8 bg-teal-600 rounded-3xl text-[14px] font-black uppercase hover:bg-teal-500 transition-all shadow-2xl shadow-teal-600/30">Institutional API Handshake</button>
                    </div>
                 </section>
              </div>
            )}

            {viewMode === 'systems' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-700">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                      { label: 'Cluster Compute Utilization', val: `${telemetry.cpu}%`, icon: Cpu, color: 'text-white' },
                      { label: 'DB Pool Memory Allocated', val: `${telemetry.mem} GB`, icon: HardDrive, color: 'text-blue-400' },
                      { label: 'Gateway Node Pipeline', val: `${telemetry.net} Mbps`, icon: Wifi, color: 'text-teal-400' }
                    ].map(stat => (
                      <div key={stat.label} className="bg-slate-900/30 border border-white/5 p-16 rounded-[4.5rem] backdrop-blur-3xl relative group overflow-hidden shadow-2xl border-t border-t-white/10">
                         <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity"><stat.icon size={180} /></div>
                         <div className="text-[13px] font-black text-slate-500 uppercase mb-10 tracking-widest leading-none">{stat.label}</div>
                         <div className={`text-8xl font-black ${stat.color} italic tracking-tighter leading-none`}>{stat.val}</div>
                      </div>
                    ))}
                 </div>

                 <div className="bg-slate-900/30 border border-white/5 rounded-[6rem] p-24 backdrop-blur-3xl shadow-3xl">
                    <div className="flex justify-between items-center mb-24">
                       <h3 className="text-6xl font-black tracking-tighter uppercase italic leading-none">Operational Cluster Health</h3>
                       <div className="px-12 py-6 bg-teal-600/10 text-teal-400 border border-teal-500/20 rounded-[2.5rem] text-[15px] font-black uppercase tracking-[0.3em] italic">Status: OPERATIONAL</div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                       <div className="space-y-10">
                          <h4 className="text-[15px] font-black text-slate-600 uppercase tracking-[0.5em] mb-14">Core Service Registry</h4>
                          {[
                            { name: 'Scan Loop Controller', status: 'pass' },
                            { name: 'GEE Likelihood Engine', status: 'pass' },
                            { name: 'Bayesian Fusion Kernel', status: 'pass' },
                            { name: 'ERE Volumetric Logic', status: 'pass' }
                          ].map(s => (
                             <div key={s.name} className="flex items-center justify-between p-12 bg-black/50 rounded-[3.5rem] border border-white/5 shadow-inner hover:border-white/10 transition-all group">
                                <div className="flex items-center gap-10">
                                   <CheckCircle2 className="text-green-500 group-hover:scale-125 transition-transform" size={32} />
                                   <span className="text-2xl font-black text-white italic tracking-tight uppercase leading-none">{s.name}</span>
                                </div>
                                <span className="text-[13px] font-black px-8 py-4 rounded-full uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20 shadow-sm italic leading-none">Verified_OK</span>
                             </div>
                          ))}
                       </div>
                       <div className="bg-black/60 rounded-[6rem] p-24 border border-white/10 flex flex-col justify-center items-center text-center shadow-3xl relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          <Scale className="text-slate-800 mb-14 group-hover:text-teal-500/40 transition-colors" size={120} />
                          <h4 className="text-5xl font-black text-white uppercase tracking-tighter mb-10 italic leading-none">Data Integrity</h4>
                          <p className="text-2xl text-slate-500 leading-relaxed font-medium tracking-tight">
                            System initialized with Phase 12 production environmental variables. 
                            Data integrity hashes are calculated per commodity matrix cycle. 
                            Automated failover active across all regional nodes.
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* Regulatory Methodology Disclosure */}
            <footer className="bg-amber-500/5 border border-amber-500/20 rounded-[4.5rem] p-20 flex gap-16 items-start backdrop-blur-3xl shadow-3xl mt-12 mb-20">
               <AlertTriangle className="text-amber-500 shrink-0 mt-4" size={56} />
               <div className="space-y-8">
                  <h5 className="text-[16px] font-black text-amber-500 uppercase tracking-[0.3em] leading-none italic uppercase">Institutional Methodology & Geoscientific Disclosure</h5>
                  <p className="text-[16px] text-amber-500/70 leading-relaxed font-medium tracking-tight italic">
                    Aurora Core Phase 12 records represent probabilistic geoscientific indications derived from Bayesian fusion. 
                    They are screening products and do NOT constitute JORC or NI 43-101 compliant mineral resource estimates. 
                    All capital deployment must be corroborated by independent field validation and drilling. 
                    Aurora Geosciences assumes zero liability for outcomes based on automated discovery products.
                  </p>
               </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Global Institutional Footer */}
      <footer className="border-t border-white/5 py-40 bg-slate-950/95 backdrop-blur-3xl shrink-0">
        <div className="max-w-[1920px] mx-auto px-20 flex flex-col md:flex-row items-center justify-between gap-24">
          <div className="flex flex-col items-start gap-12">
            <div className="flex items-center gap-12">
              <div className="w-24 h-24 bg-teal-600 rounded-[3rem] flex items-center justify-center shadow-3xl shadow-teal-600/20 ring-1 ring-white/10">
                <Layers size={56} className="text-white" />
              </div>
              <span className="text-6xl font-black tracking-[0.5em] uppercase text-white italic leading-none">Aurora Geosciences</span>
            </div>
            <p className="text-[16px] font-bold text-slate-700 max-w-2xl leading-loose tracking-[0.4em] uppercase italic">
              Phase 12.01 Production Hub. 23 Global Commodities Operational. Matrix Loop Active.
            </p>
          </div>
          <div className="flex items-center gap-24 bg-slate-900/40 border border-white/10 px-24 py-14 rounded-[5.5rem] shadow-3xl ring-1 ring-white/10">
            <div className="flex flex-col items-end">
              <span className="text-[13px] font-black text-slate-700 uppercase tracking-widest mb-4">Node Protocol Status</span>
              <span className="text-[24px] font-black text-teal-400 font-mono tracking-widest uppercase italic">CONNECTED_SECURE_PHASE_12</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-teal-500 animate-pulse shadow-[0_0_40px_#14b8a6]" />
          </div>
        </div>
      </footer>
    </div>
  );
};
