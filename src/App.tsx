import { useState, useEffect } from 'react';
import { WaveGeneratorConfig } from './types';
import { useAudioEngine } from './hooks/useAudioEngine';
import { WaveCanvas } from './components/WaveCanvas';
import { ControlPanel } from './components/ControlPanel';
import { InformationSection } from './components/InformationSection';
import { Zap, HelpCircle, Thermometer, Wind, RefreshCw, BarChart2, ShieldCheck, Sun } from 'lucide-react';

export default function App() {
  // Initial default lab state configuration
  const [config, setConfig] = useState<WaveGeneratorConfig>({
    frequency: 7429,
    harmonicMode: 'sub_10', // comfortable initial value (742.9 Hz)
    waveform: 'sine',
    volume: 0.02,         // extremely safe initial volume percentage
    isPlaying: false,
    lfoFrequency: 3.5,
    lfoDepth: 80,
    pulsingRate: 0,
    radiationIntensity: 6.0,
    currentDensity: 8.42,
    polarizationAngle: 180,
    quantumDrift: 15,
    colorTheme: 'cyan-purple',
  });

  // Additional lab environment simulation attributes
  const [humidity, setHumidity] = useState<number>(45); // 0% to 100%
  const [electrodeGap, setElectrodeGap] = useState<number>(3.5); // 0.5 cm to 10 cm
  const [dielectricFactor, setDielectricFactor] = useState<number>(1.006); // Calculated
  const [schumannAlignment, setSchumannAlignment] = useState<number>(0);

  // Initialize and run audio engine
  const { getActiveFrequency } = useAudioEngine(config);
  const activeFreq = getActiveFrequency();

  // Dynamic calculations based on active frequency/climate attributes
  useEffect(() => {
    // Relative permittivity calculator based on dynamic humidity inputs
    const baseAirRel = 1.0005;
    const calcDielectric = baseAirRel + (humidity * 0.00012) + (config.radiationIntensity * 0.0005);
    setDielectricFactor(parseFloat(calcDielectric.toFixed(5)));

    // Schumann harmonics matching formula (Fundamental resonance = 7.83Hz)
    const schumannFund = 7.83;
    const alignmentRatio = 100 - Math.min(100, Math.abs(((activeFreq) % schumannFund) / schumannFund) * 100);
    setSchumannAlignment(parseFloat(alignmentRatio.toFixed(1)));
  }, [config.frequency, config.harmonicMode, config.radiationIntensity, humidity, activeFreq]);

  // Adjust config helper
  const handleUpdateConfig = (newConfig: Partial<WaveGeneratorConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  return (
    <div className="min-h-screen text-slate-300 p-4 sm:p-6 lg:p-8 flex flex-col justify-between max-w-7xl mx-auto font-sans bg-[#09090b]">
      
      {/* 1. HEADER SECTION & LAB STATUS */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5 gap-4 bg-[#010409]/60 p-4 rounded-xl backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-cyan-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-transform hover:scale-105">
            <Zap className="w-5 h-5 text-black animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white uppercase flex items-center">
              Usnotopical Wave Lab <span className="text-cyan-500 ml-2 font-mono text-sm uppercase">v4.2</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Focused synthesis & analysis of radiational electromagnetic waves, specialized on carrier frequency 7429 Hz.
            </p>
          </div>
        </div>

        {/* Sleek Live Lab Diagnostics Tag */}
        <div className="flex space-x-6 items-center text-xs font-mono self-start md:self-auto bg-[#0a0f1d]/40 border border-slate-800/80 p-3 rounded-lg">
          <div className="flex flex-col items-end">
            <span className="text-slate-500 text-[9px] uppercase tracking-wider">SIGNAL STATE</span>
            <span className={`font-bold ${config.isPlaying ? 'text-cyan-400' : 'text-slate-400'}`}>
              {config.isPlaying ? 'PHASE-LOCKED' : 'STANDBY'}
            </span>
          </div>
          <div className="flex flex-col items-end border-l border-slate-800 pl-6">
            <span className="text-slate-500 text-[9px] uppercase tracking-wider">LATENCY</span>
            <span className="text-white font-medium">0.42ms</span>
          </div>
          <div className="flex flex-col items-end border-l border-slate-800 pl-6">
            <span className="text-slate-500 text-[9px] uppercase tracking-wider">UPTIME</span>
            <span className="text-white font-medium">142:08:44</span>
          </div>
        </div>
      </header>

      {/* 2. ATMOSPHERIC CHAMBER CLIMATE CONTROL METRICS */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        
        {/* WIDGET I: HUMIDITY INDUCTOR */}
        <div className="bg-slate-900/50 p-4 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center space-x-1.5">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>Chamber Humidity</span>
            </span>
          </div>
          <p className="text-xl font-semibold text-white mt-1">
            {humidity} <span className="text-xs text-slate-400">rH</span>
          </p>
          <input
            id="slider-humidity-env"
            type="range"
            min="5"
            max="95"
            value={humidity}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setHumidity(val);
              // Moisture increases molecular scattering, adding trace quantum jitter (phase noise)
              handleUpdateConfig({ quantumDrift: Math.round(val * 0.7 + 10) });
            }}
            className="w-full accent-cyan-500 h-1 bg-slate-800 rounded cursor-pointer appearance-none mt-2"
          />
        </div>

        {/* WIDGET II: ELECTRODE CONTACT GAP */}
        <div className="bg-slate-900/50 p-4 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center space-x-1.5">
              <Thermometer className="w-3.5 h-3.5 text-purple-400" />
              <span>Electrode Spark Gap</span>
            </span>
          </div>
          <p className="text-xl font-semibold text-white mt-1">
            {electrodeGap} <span className="text-xs text-slate-400">cm</span>
          </p>
          <input
            id="slider-electrode-gap"
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={electrodeGap}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setElectrodeGap(val);
              // Decreasing the electrode gap increases calculated discharge density directly!
              const mappedDensity = parseFloat((15.4 / val).toFixed(2));
              handleUpdateConfig({ currentDensity: mappedDensity });
            }}
            className="w-full accent-purple-400 h-1 bg-slate-800 rounded cursor-pointer appearance-none mt-2"
          />
        </div>

        {/* WIDGET III: DIELECTRIC MULTIPLIER */}
        <div className="bg-slate-900/50 p-4 border border-slate-800 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center space-x-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Permittivity Coefficient (ε)</span>
          </span>
          <p className="text-xl font-semibold text-white mt-1">
            {dielectricFactor} <span className="text-xs text-slate-500">ε</span>
          </p>
          <span className="text-[9px] font-mono text-slate-500 mt-2 block">
            Medium ionization index. Modulates wave speed.
          </span>
        </div>

        {/* WIDGET IV: NATURAL RESONANCE MATCHING */}
        <div className="bg-slate-900/50 p-4 border border-slate-800 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center space-x-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Schumann Alignment</span>
          </span>
          <p className="text-xl font-semibold text-cyan-400 mt-1">
            {schumannAlignment}%
          </p>
          <span className="text-[9px] font-mono text-slate-500 mt-2 block">
            Coupling ratio to natural Earth-ionosphere.
          </span>
        </div>

      </section>

      {/* 3. OSCILLOSCOPE CRT CANVAS MONITOR */}
      <main className="mb-6 space-y-6">
        <WaveCanvas
          config={config}
          onChangeConfig={handleUpdateConfig}
          activeFreq={activeFreq}
        />

        {/* 4. SIGNAL CONTROLLER PANEL */}
        <ControlPanel
          config={config}
          onChangeConfig={handleUpdateConfig}
          activeFreq={activeFreq}
        />

        {/* 5. INTERACTIVE SCIENTIFIC DATA LOG */}
        <InformationSection currentFreq={activeFreq} />
      </main>

      {/* 6. LABORATORY FOOTER AND HELP INFO */}
      <footer className="mt-8 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
        <div className="flex items-center space-x-1.5 text-center sm:text-left leading-normal">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />
          <span>Need Assistance? Shift ranges down for comfortable acoustics. 7429Hz is fully active visually.</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>COOPERATING SPECTRAL CORE v2.4</span>
          <span>© 2026 GENERAL EM LABS</span>
        </div>
      </footer>

    </div>
  );
}
