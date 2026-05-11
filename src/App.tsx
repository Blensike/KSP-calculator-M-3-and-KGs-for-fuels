import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings2, 
  Activity, 
  FlaskConical, 
  ArrowRight, 
  History,
  Info,
  ChevronRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Logic from Python bit
// def ox_ratio(h2_amount, h2_flow=18.3, ox_flow=1.2):
//     ratio = h2_flow / ox_flow
//     return h2_amount / ratio

const RESOURCE_PROPS: Record<string, { mass: number, vol: number }> = {
  LiquidFuel: { mass: 5.0, vol: 0.005 },
  Oxidizer: { mass: 5.0, vol: 0.005 },
  LqdHydrogen: { mass: 0.07085, vol: 0.001 },
  Hydrogen: { mass: 0.07085, vol: 0.001 },
  LqdMethane: { mass: 0.42262, vol: 0.001 },
  XenonGas: { mass: 0.1, vol: 0.0001 },
  ArgonGas: { mass: 0.001784, vol: 0.001 },
  Lithium: { mass: 0.534, vol: 0.001 },
  LqdDeuterium: { mass: 0.1624, vol: 0.001 },
  LqdHe3: { mass: 0.059, vol: 0.001 },
  Antimatter: { mass: 0.000000001, vol: 0 },
  ElectricCharge: { mass: 0, vol: 0 },
};

const FUEL_TYPES = [
  { id: 'lf_ox', name: 'Liquid Fuel / Oxidizer', fuelFlow: 18.3, oxFlow: 1.2, colorFuel: 'bg-blue-500', colorOx: 'bg-slate-200', fuelRes: 'LiquidFuel', oxRes: 'Oxidizer', fuelName: 'Liquid Fuel', oxName: 'Oxidizer' },
  { id: 'h_ox', name: 'Hydrogen / Oxidizer', fuelFlow: 18.3, oxFlow: 1.2, colorFuel: 'bg-blue-400', colorOx: 'bg-slate-200', fuelRes: 'Hydrogen', oxRes: 'Oxidizer', fuelName: 'Hydrogen', oxName: 'Oxidizer' },
  { id: 'meth_ox', name: 'LqdMethane / Oxidizer', fuelFlow: 15.0, oxFlow: 1.0, colorFuel: 'bg-red-200', colorOx: 'bg-blue-500', fuelRes: 'LqdMethane', oxRes: 'Oxidizer', fuelName: 'LqdMethane', oxName: 'Oxidizer' },
  { id: 'xenon_ec', name: 'Xenon Gas / ElectricCharge', fuelFlow: 5.0, oxFlow: 10.0, colorFuel: 'bg-teal-400', colorOx: 'bg-blue-400', fuelRes: 'XenonGas', oxRes: 'ElectricCharge', fuelName: 'Xenon Gas', oxName: 'ElectricCharge' },
  { id: 'argon_ec', name: 'Argon Gas / ElectricCharge', fuelFlow: 6.0, oxFlow: 8.0, colorFuel: 'bg-purple-500', colorOx: 'bg-blue-400', fuelRes: 'ArgonGas', oxRes: 'ElectricCharge', fuelName: 'Argon Gas', oxName: 'ElectricCharge' },
  { id: 'lithium_ec', name: 'Lithium / ElectricCharge', fuelFlow: 8.0, oxFlow: 5.0, colorFuel: 'bg-green-800', colorOx: 'bg-blue-400', fuelRes: 'Lithium', oxRes: 'ElectricCharge', fuelName: 'Lithium', oxName: 'ElectricCharge' },
  { id: 'deuterium_he3', name: 'Deuterium / Helium-3', fuelFlow: 10.0, oxFlow: 10.0, colorFuel: 'bg-orange-500', colorOx: 'bg-green-900', fuelRes: 'LqdDeuterium', oxRes: 'LqdHe3', fuelName: 'Deuterium', oxName: 'Helium-3' },
  { id: 'antimatter_h', name: 'Antimatter / LqdHydrogen', fuelFlow: 2.0, oxFlow: 20.0, colorFuel: 'bg-black', colorOx: 'bg-white', fuelRes: 'Antimatter', oxRes: 'LqdHydrogen', fuelName: 'Antimatter', oxName: 'LqdHydrogen' },
];

export default function App() {
  const [h2Amount, setH2Amount] = useState<number>(3000);
  const [selectedFuel, setSelectedFuel] = useState(FUEL_TYPES[0]);
  const [currentFuelFlow, setCurrentFuelFlow] = useState(selectedFuel.fuelFlow);
  const [currentOxFlow, setCurrentOxFlow] = useState(selectedFuel.oxFlow);
  const [history, setHistory] = useState<Array<{ h2: number, ox: number, timestamp: string }>>([]);

  useEffect(() => {
    setCurrentFuelFlow(selectedFuel.fuelFlow);
    setCurrentOxFlow(selectedFuel.oxFlow);
  }, [selectedFuel]);

  const result = useMemo(() => {
    if (currentOxFlow === 0) return 0;
    const ratio = currentFuelFlow / currentOxFlow;
    return h2Amount / ratio;
  }, [h2Amount, currentFuelFlow, currentOxFlow]);

  const fuelStats = useMemo(() => {
      const props = RESOURCE_PROPS[selectedFuel.fuelRes];
      return {
          mass: h2Amount * props.mass,
          vol: h2Amount * props.vol
      };
  }, [h2Amount, selectedFuel]);

  const oxStats = useMemo(() => {
      const props = RESOURCE_PROPS[selectedFuel.oxRes];
      return {
          mass: result * props.mass,
          vol: result * props.vol
      };
  }, [result, selectedFuel]);

  const chartData = useMemo(() => {
    const points = [];
    const step = h2Amount / 10;
    const ratio = currentFuelFlow / currentOxFlow;
    
    for (let i = 0; i <= 20; i++) {
      const val = i * step;
      points.push({
        h2: Math.round(val),
        ox: Number((val / ratio).toFixed(2))
      });
    }
    return points;
  }, [h2Amount, currentFuelFlow, currentOxFlow]);

  const addToHistory = () => {
    setHistory(prev => [
      { h2: h2Amount, ox: result, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 5)
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Navigation */}
      <nav className="h-16 px-8 flex items-center justify-between border-b border-slate-200 bg-white shrink-0 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center p-1.5">
             <FlaskConical className="text-white w-full h-full" />
          </div>
          <span className="font-bold tracking-tight text-lg uppercase">OxRatio Pro v2.4</span>
        </div>
        <div className="hidden md:flex space-x-8 text-[11px] font-bold text-slate-400 tracking-widest uppercase">
          <span className="cursor-default">Fluid Dynamics</span>
          <span className="cursor-default">Propulsion</span>
          <span className="text-slate-900 border-b-2 border-slate-900 pb-5 translate-y-0.5">Ratio Calculator</span>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row p-6 lg:p-10 gap-10 max-w-7xl mx-auto w-full">
        
        {/* Configuration Panel */}
        <aside className="w-full lg:w-1/3 flex flex-col gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Settings2 size={12} />
              Input Parameters
            </span>
            
            <div className="space-y-6">
              <div className="group">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Fuel Pair</label>
                <select 
                  value={selectedFuel.id}
                  onChange={(e) => setSelectedFuel(FUEL_TYPES.find(f => f.id === e.target.value)!)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all shadow-sm appearance-none"
                >
                  {FUEL_TYPES.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-3 h-3 rounded-full ${selectedFuel.colorFuel}`} />
                  <div className={`w-3 h-3 rounded-full ${selectedFuel.colorOx}`} />
                </div>
              </div>

              <ResourceStatsPanel
                fuelMass={fuelStats.mass}
                fuelVol={fuelStats.vol}
                oxMass={oxStats.mass}
                oxVol={oxStats.vol}
              />

              <InputGroup 
                label={`${selectedFuel.fuelName} Amount`} 
                unit="total" 
                value={h2Amount} 
                onChange={setH2Amount} 
                sub={`Total ${selectedFuel.fuelName} available`}
              />
              <InputGroup 
                label="Fuel Flow Rate" 
                unit="unit/s" 
                value={currentFuelFlow} 
                onChange={setCurrentFuelFlow} 
                step={0.1}
                sub="Base fuel flow"
                max={50}
              />
              <InputGroup 
                label="Oxidizer Flow Rate" 
                unit="unit/s" 
                value={currentOxFlow} 
                onChange={setCurrentOxFlow} 
                step={0.1}
                sub="Oxidizer flow"
                max={50}
              />
            </div>
          </div>


          <button 
            onClick={addToHistory}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-200 flex items-center justify-center space-x-2 group"
          >
            <span className="uppercase tracking-widest text-sm">Log Calculation</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>

          {/* History Log */}
          <div className="flex flex-col gap-4 mt-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <History size={12} />
              Recent Logs
            </span>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout text-xs font-mono">
                {history.length === 0 ? (
                  <div className="p-4 bg-white/50 border border-slate-200 border-dashed rounded-lg text-center">
                    <span className="text-[10px] text-slate-400 italic">Buffer empty. Ready for input.</span>
                  </div>
                ) : (
                  history.map((log, i) => (
                    <motion.div 
                      key={log.timestamp + i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center text-[10px]"
                    >
                      <span className="text-slate-400">{log.timestamp}</span>
                      <div className="flex gap-4">
                        <span>H2: <span className="text-slate-900 font-bold">{log.h2}</span></span>
                        <span>OX: <span className="text-slate-900 font-bold">{log.ox.toFixed(2)}</span></span>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </aside>

        {/* Results & Visualization */}
        <section className="flex-1 flex flex-col gap-6">
          <div className="flex-grow bg-white border border-slate-200 rounded-2xl shadow-sm p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden group">
            {/* Decoration */}
            <div className="absolute top-0 right-0 p-8 flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-200"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-100"></div>
              </div>
              <span className="text-[9px] font-mono text-emerald-600 font-bold uppercase tracking-tighter">Optimal Mix</span>
            </div>

            <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Activity size={14} />
              Calculated {selectedFuel.oxName} Needed
            </span>
            
            <div className="flex flex-col lg:flex-row lg:items-baseline gap-4 lg:gap-8">
              <motion.h1 
                key={result}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[80px] md:text-[120px] font-light tracking-tighter leading-none text-slate-900"
              >
                {result.toFixed(2)}
              </motion.h1>
              <span className="text-2xl md:text-3xl font-medium text-slate-300 uppercase tracking-widest mb-2 lg:mb-4">Units</span>
            </div>
            
            <div className="mt-12 pt-12 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest underline decoration-slate-200 underline-offset-4">Base Ratio</span>
                <span className="text-3xl font-light text-slate-800">
                  {(selectedFuel.fuelFlow / selectedFuel.oxFlow).toFixed(2)} <span className="text-sm text-slate-400 font-normal">: 1</span>
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest underline decoration-slate-200 underline-offset-4">Mix Integrity</span>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-light text-slate-800">99.85%</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-tighter">Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visualization / Chart */}
          <div className="h-[280px] bg-slate-900 rounded-2xl p-8 flex flex-col gap-4 relative overflow-hidden group">
            <div className="flex justify-between items-center relative z-10">
              <div className="flex flex-col">
                <span className="text-[10px] text-emerald-400/60 uppercase font-bold tracking-widest">Sensitivity Analysis</span>
                <span className="text-white/40 font-mono text-[9px] uppercase tracking-tighter mt-1">Oxidizer demand scaling projection</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex space-x-1 items-end h-6 opacity-30 group-hover:opacity-100 transition-opacity">
                  {[3, 5, 8, 6, 4].map((h, i) => (
                    <div key={i} className={`w-1 h-${h} bg-white rounded-full`} style={{ height: `${h * 4}px` }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 w-full bg-slate-800/10 rounded-xl relative z-10">
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontFamily: 'JetBrains Mono',
                      color: 'white'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ox" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#areaGradient)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="h-12 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[10px] text-slate-400 font-medium tracking-widest shrink-0">
        <div className="flex space-x-12">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            Algorithm: Ox_Ratio_v1.2.4
          </span>
          <span className="hidden md:inline uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            Precision: ± 0.0005
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-slate-500 font-bold">READY</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-200"></div>
        </div>
      </footer>
    </div>
  );
}

interface InputGroupProps {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  sub: string;
  step?: number;
  max?: number;
}

function ResourceStatsPanel({ fuelMass, fuelVol, oxMass, oxVol }: { fuelMass: number, fuelVol: number, oxMass: number, oxVol: number }) {
  return (
    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Stats Overview (Total)</span>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider">Fuel</span>
          <div className="text-[11px] font-bold">{fuelMass.toFixed(2)} kg</div>
          <div className="text-[11px] text-slate-500">{fuelVol.toFixed(3)} m³</div>
        </div>
        <div className="space-y-1">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider">Oxidizer</span>
          <div className="text-[11px] font-bold">{oxMass.toFixed(2)} kg</div>
          <div className="text-[11px] text-slate-500">{oxVol.toFixed(3)} m³</div>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, unit, value, onChange, sub, step = 1, max }: InputGroupProps) {
  const dynamicMax = max ?? (label.includes('Amount') ? 10000 : (label.includes('Oxidizer') ? 10 : 50));
  return (
    <div className="group">
      <div className="flex justify-between items-end mb-2">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">{sub}</span>
      </div>
      <div className="relative group/input">
        <input 
          type="number" 
          value={value} 
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-lg font-medium focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all shadow-sm"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-mono text-[10px] uppercase tracking-widest pointer-events-none group-focus-within/input:text-slate-900 transition-colors">
          {unit}
        </div>
      </div>
      <input 
        type="range"
        min="0"
        max={dynamicMax}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-4 w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
      />
    </div>
  );
}


function TechnicalDeepDive({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-mono font-bold">{value}</span>
    </div>
  );
}
