/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  MapPin, 
  Activity, 
  Lock, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  RefreshCw,
  Database,
  Eye,
  Github,
  ChevronRight,
  Fingerprint,
  Search,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateEncounterToken } from './lib/crypto';
import { format } from 'date-fns';

// --- Constants ---

const LOCATIONS = [
  { name: 'Central Park', lat: 40.785091, lon: -73.968285 },
  { name: 'Grand Central Station', lat: 40.752726, lon: -73.977229 },
  { name: 'Times Square', lat: 40.758896, lon: -73.985130 },
  { name: 'Metropolitan Museum', lat: 40.779437, lon: -73.963244 },
  { name: 'Brooklyn Bridge', lat: 40.706086, lon: -73.996864 },
];

// --- Types ---

interface Encounter {
  id: string;
  token: string;
  timestamp: number;
  locationName: string;
}

interface ExposureMatch {
  token: string;
  riskLevel: string;
}

// --- Components ---

const Navbar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="bg-rose-600 p-1.5 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-zinc-900 uppercase">VIRATRACE</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'check', label: 'Check Place', icon: Search },
            { id: 'travel', label: 'Travel Sim', icon: Zap },
            { id: 'simulator', label: 'Virus Simulator', icon: MapPin },
            { id: 'transparency', label: 'Privacy', icon: Lock },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                activeTab === item.id ? 'text-rose-600' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-px bg-zinc-200" />
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-700">Secured</span>
          </div>
        </div>
      </div>
    </div>
  </nav>
);

const LandingPage = ({ onStart }: { onStart: () => void }) => (
  <div className="pt-32 pb-20 px-4">
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-rose-600 uppercase bg-rose-50 rounded-full">
          Real-time Virus Tracking
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold text-zinc-900 tracking-tight mb-8 leading-tight">
          Know the Risk, <br />
          <span className="text-rose-600">Keep your Privacy.</span>
        </h1>
        <p className="text-xl text-zinc-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          ViraTrace allows you to check for virus presence in specific locations and tracks your exposure history using zero-knowledge cryptographic tokens.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-xl"
          >
            Open Dashboard <ChevronRight className="w-5 h-5" />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-900 border border-zinc-200 rounded-2xl font-bold text-lg hover:bg-zinc-50 transition-all flex items-center justify-center gap-2">
            How it works <Info className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  </div>
);

const LocationChecker = () => {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0].name);
  const [status, setStatus] = useState<'idle' | 'checking' | 'safe' | 'danger'>('idle');
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const handleCheck = async () => {
    setStatus('checking');
    
    const loc = LOCATIONS.find(l => l.name === selectedLocation)!;
    const now = Date.now();
    const token = generateEncounterToken(loc.lat, loc.lon, now);
    
    try {
      const res = await fetch('/api/tokens/infected');
      const infected: { token: string }[] = await res.json();
      
      const isMatch = infected.some(i => i.token === token);
      
      setTimeout(() => {
        setStatus(isMatch ? 'danger' : 'safe');
        setLastCheck(format(now, 'HH:mm:ss'));
      }, 1000);
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-rose-100 rounded-xl">
            <Search className="w-6 h-6 text-rose-600" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900">Place Checker</h2>
        </div>
        
        <p className="text-zinc-600 mb-8">
          Select a location to check if any virus exposure has been reported there in the last 15 minutes.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">Select Location</label>
            <select 
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setStatus('idle');
              }}
              className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none font-medium"
            >
              {LOCATIONS.map(l => <option key={l.name}>{l.name}</option>)}
            </select>
          </div>

          <button 
            onClick={handleCheck}
            disabled={status === 'checking'}
            className="w-full py-5 bg-rose-600 text-white rounded-2xl font-bold text-lg hover:bg-rose-700 transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
          >
            {status === 'checking' ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                Querying PSI Database...
              </>
            ) : (
              <>
                <Zap className="w-6 h-6" />
                Check for Virus Presence
              </>
            )}
          </button>

          <AnimatePresence mode="wait">
            {status !== 'idle' && status !== 'checking' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-8 rounded-3xl border-2 text-center ${
                  status === 'danger' 
                    ? 'bg-red-50 border-red-200 text-red-900' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex justify-center mb-4">
                  {status === 'danger' ? (
                    <AlertTriangle className="w-12 h-12 text-red-600" />
                  ) : (
                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {status === 'danger' ? 'Virus Detected!' : 'Place is Clear'}
                </h3>
                <p className="opacity-70 text-sm">
                  Last checked at {lastCheck} for {selectedLocation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const VirusSimulator = () => {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0].name);
  const [isSimulating, setIsSimulating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const fetchStats = async () => {
    const res = await fetch('/api/stats');
    const data = await res.json();
    setHistory(data.recentLogs);
  };

  useEffect(() => { fetchStats(); }, []);

  const handleSimulateVirus = async () => {
    setIsSimulating(true);
    const loc = LOCATIONS.find(l => l.name === selectedLocation)!;
    
    // Generate tokens for the current time and the last 3 time buckets (45 mins)
    const now = Date.now();
    const tokens = [
      generateEncounterToken(loc.lat, loc.lon, now),
      generateEncounterToken(loc.lat, loc.lon, now - 900000),
      generateEncounterToken(loc.lat, loc.lon, now - 1800000),
    ];

    await fetch('/api/admin/publish-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokens, riskLevel: 'HIGH' })
    });

    setTimeout(() => {
      setIsSimulating(false);
      fetchStats();
    }, 1000);
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-2xl mx-auto">
      <div className="bg-zinc-900 p-8 rounded-[2rem] text-white shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-rose-500 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold">Virus Simulator</h2>
        </div>
        
        <p className="text-zinc-400 mb-8">
          Mark a location as an "Infected Hotspot". This simulates a confirmed case reporting their presence at this location.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wider">Target Location</label>
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-medium text-white"
            >
              {LOCATIONS.map(l => <option key={l.name} className="bg-zinc-900">{l.name}</option>)}
            </select>
          </div>

          <button 
            onClick={handleSimulateVirus}
            disabled={isSimulating}
            className="w-full py-5 bg-rose-600 text-white rounded-2xl font-bold text-lg hover:bg-rose-700 transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                Publishing Infected Tokens...
              </>
            ) : (
              <>
                <Zap className="w-6 h-6" />
                Mark as Infected Hotspot
              </>
            )}
          </button>

          <div className="mt-8">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Recent Simulation Logs</h4>
            <div className="space-y-2">
              {history.map((log, i) => (
                <div key={i} className="text-xs text-zinc-400 flex justify-between p-3 bg-white/5 rounded-xl">
                  <span>{log.event}</span>
                  <span>{format(log.timestamp, 'HH:mm:ss')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TravelSimulator = ({ onVisit }: { onVisit: (e: Encounter) => void }) => {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0].name);
  const [isTraveling, setIsTraveling] = useState(false);
  const [threatLevel, setThreatLevel] = useState<'none' | 'low' | 'high'>('none');

  const handleVisit = async () => {
    setIsTraveling(true);
    setThreatLevel('none');
    
    const loc = LOCATIONS.find(l => l.name === selectedLocation)!;
    const now = Date.now();
    const token = generateEncounterToken(loc.lat, loc.lon, now);
    
    // 1. Log the encounter locally
    const encounter: Encounter = {
      id: Math.random().toString(36).substring(7),
      token,
      timestamp: now,
      locationName: selectedLocation
    };
    
    // 2. Check for immediate threat (Proximity Detection)
    try {
      const res = await fetch('/api/tokens/infected');
      const infected: { token: string }[] = await res.json();
      const isMatch = infected.some(i => i.token === token);
      
      setTimeout(() => {
        onVisit(encounter);
        setThreatLevel(isMatch ? 'high' : 'none');
        setIsTraveling(false);
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsTraveling(false);
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-rose-100 rounded-xl">
            <MapPin className="w-6 h-6 text-rose-600" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900">Travel Simulator</h2>
        </div>
        
        <p className="text-zinc-600 mb-8">
          "Go" to a location to test the proximity-based threat detector. This will log a private encounter and immediately check for local virus presence.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">Destination</label>
            <select 
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setThreatLevel('none');
              }}
              className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none font-medium"
            >
              {LOCATIONS.map(l => <option key={l.name}>{l.name}</option>)}
            </select>
          </div>

          <button 
            onClick={handleVisit}
            disabled={isTraveling}
            className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
          >
            {isTraveling ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                Traveling to {selectedLocation}...
              </>
            ) : (
              <>
                <ChevronRight className="w-6 h-6" />
                Visit Location
              </>
            )}
          </button>

          <AnimatePresence>
            {threatLevel === 'high' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-red-600 text-white rounded-3xl shadow-xl flex items-center gap-4"
              >
                <div className="p-3 bg-white/20 rounded-2xl">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">PROXIMITY ALERT!</h4>
                  <p className="text-sm text-red-100">Confirmed virus presence detected at your current location.</p>
                </div>
              </motion.div>
            )}
            {threatLevel === 'none' && !isTraveling && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-3xl flex items-center gap-4"
              >
                <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Area Secure</h4>
                  <p className="text-sm opacity-70">No immediate threats detected in your proximity.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ encounters, matches, onCheck }: { encounters: Encounter[], matches: ExposureMatch[], onCheck: () => void }) => {
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    await new Promise(r => setTimeout(r, 1500));
    onCheck();
    setChecking(false);
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className={`p-8 rounded-[2rem] border-2 transition-all ${
            matches.length > 0 
              ? 'bg-red-50 border-red-100' 
              : 'bg-rose-50 border-rose-100'
          }`}>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-2">
                  {matches.length > 0 ? 'Exposure Detected' : 'Your Path is Clear'}
                </h2>
                <p className="text-zinc-600">
                  Last cross-check: {format(new Date(), 'MMM d, HH:mm')}
                </p>
              </div>
              <div className={`p-4 rounded-2xl ${matches.length > 0 ? 'bg-red-500' : 'bg-rose-600'} shadow-lg`}>
                {matches.length > 0 ? <AlertTriangle className="w-8 h-8 text-white" /> : <CheckCircle className="w-8 h-8 text-white" />}
              </div>
            </div>

            <button 
              onClick={handleCheck}
              disabled={checking}
              className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'Syncing...' : 'Sync & Check History'}
            </button>
          </div>

          <div className="bg-white border border-zinc-200 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-900">Your Recent Locations</h3>
              <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-bold uppercase tracking-wider">
                Private Log
              </span>
            </div>
            <div className="divide-y divide-zinc-50">
              {encounters.length === 0 ? (
                <div className="p-12 text-center text-zinc-500">
                  No locations logged yet.
                </div>
              ) : (
                encounters.map((e) => (
                  <div key={e.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">{e.locationName}</p>
                        <p className="text-sm text-zinc-500">{format(e.timestamp, 'MMM d, HH:mm')}</p>
                      </div>
                    </div>
                    <code className="text-[10px] bg-zinc-100 px-2 py-1 rounded text-zinc-400 font-mono">
                      {e.token.substring(0, 12)}...
                    </code>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-zinc-900 p-8 rounded-[2rem] text-white shadow-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-400" />
              Privacy Stats
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-zinc-400 text-xs mb-1">Logged Places</p>
                  <p className="text-2xl font-bold">{encounters.length}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-zinc-400 text-xs mb-1">Exposures</p>
                  <p className="text-2xl font-bold text-red-400">{matches.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TransparencyPage = () => (
  <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
    <h2 className="text-4xl font-extrabold text-zinc-900 mb-8">How ViraTrace Protects You</h2>
    <div className="space-y-12">
      <section>
        <h3 className="text-2xl font-bold mb-4">1. Spatiotemporal Hashing</h3>
        <p className="text-zinc-600 leading-relaxed">
          We never store your GPS coordinates. Instead, we convert your location and time into a "token". This token is a one-way hash (SHA-256). It's like turning your location into a secret code that only matches if someone else was at the exact same place at the same time.
        </p>
      </section>
      <section>
        <h3 className="text-2xl font-bold mb-4">2. Private Set Intersection</h3>
        <p className="text-zinc-600 leading-relaxed">
          The server only knows about "infected tokens". Your device downloads these tokens and checks them against your own local history. The server never knows which tokens you have or where you've been.
        </p>
      </section>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [matches, setMatches] = useState<ExposureMatch[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('viratrace_encounters');
    if (saved) setEncounters(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('viratrace_encounters', JSON.stringify(encounters));
  }, [encounters]);

  const addEncounter = (e: Encounter) => {
    setEncounters(prev => [e, ...prev].slice(0, 100));
  };

  const checkExposure = useCallback(async () => {
    try {
      const res = await fetch('/api/tokens/infected');
      const infectedTokens: { token: string, risk_level: string }[] = await res.json();
      const localTokens = encounters.map(e => e.token);
      const newMatches: ExposureMatch[] = [];
      infectedTokens.forEach(infected => {
        if (localTokens.includes(infected.token)) {
          newMatches.push({ token: infected.token, riskLevel: infected.risk_level });
        }
      });
      setMatches(newMatches);
    } catch (err) {
      console.error(err);
    }
  }, [encounters]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 font-sans selection:bg-rose-100 selection:text-rose-900">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'landing' && <LandingPage onStart={() => setActiveTab('dashboard')} />}
            {activeTab === 'dashboard' && <Dashboard encounters={encounters} matches={matches} onCheck={checkExposure} />}
            {activeTab === 'check' && <LocationChecker />}
            {activeTab === 'travel' && <TravelSimulator onVisit={addEncounter} />}
            {activeTab === 'simulator' && <VirusSimulator />}
            {activeTab === 'transparency' && <TransparencyPage />}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="py-12 border-t border-zinc-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-rose-600" />
            <span className="font-bold text-zinc-900 uppercase">VIRATRACE</span>
          </div>
          <p className="text-zinc-500 text-sm">© 2026 ViraTrace Privacy Research.</p>
        </div>
      </footer>
    </div>
  );
}
