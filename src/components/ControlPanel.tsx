import React from 'react';
import { WaveGeneratorConfig } from '../types';
import { Play, Square, Volume2, ShieldAlert, Sparkles, RefreshCw, Layers, Sliders, Sun } from 'lucide-react';

interface ControlPanelProps {
  config: WaveGeneratorConfig;
  onChangeConfig: (newConfig: Partial<WaveGeneratorConfig>) => void;
  activeFreq: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, onChangeConfig, activeFreq }) => {
  
  // Quick pre-configured physical system states
  const presets = [
    {
      name: 'Standard 7429 Radiational Core',
      config: {
        frequency: 7429,
        harmonicMode: 'sub_10' as const,
        waveform: 'sine' as const,
        lfoFrequency: 3.5,
        lfoDepth: 80,
        pulsingRate: 0,
        radiationIntensity: 6.0,
        quantumDrift: 15,
        colorTheme: 'cyan-purple' as const
      },
      desc: 'Standard laboratory continuous wave hum at comfortable decadic harmonic (742.9Hz).'
    },
    {
      name: 'Quantum Pulsed Discharge',
      config: {
        frequency: 7429,
        harmonicMode: 'sub_100' as const,
        waveform: 'square' as const,
        lfoFrequency: 18.2,
        lfoDepth: 180,
        pulsingRate: 4.5,
        radiationIntensity: 8.5,
        quantumDrift: 75,
        colorTheme: 'amber-orange' as const
      },
      desc: 'High-energy electrostatic sparks that pulse rapidly, providing granular crackles.'
    },
    {
      name: 'Bio-Resonant Deep Wave',
      config: {
        frequency: 7429,
        harmonicMode: 'sub_100' as const,
        waveform: 'triangle' as const,
        lfoFrequency: 1.2,
        lfoDepth: 40,
        pulsingRate: 0,
        radiationIntensity: 3.0,
        quantumDrift: 2,
        colorTheme: 'plasma-green' as const
      },
      desc: 'Soothe bioelectric fields using triangular centi-harmonics wave modulators (74.29Hz).'
    },
    {
      name: 'Exact Carrier Piercing Probe',
      config: {
        frequency: 7429,
        harmonicMode: 'exact' as const,
        waveform: 'sine' as const,
        lfoFrequency: 8.0,
        lfoDepth: 120,
        pulsingRate: 1.5,
        radiationIntensity: 10.0,
        quantumDrift: 30,
        colorTheme: 'cyan-purple' as const
      },
      desc: 'WARNING: Real high-frequency VLF radiation carrier tone (7429Hz). Best heard with quiet volume.'
    }
  ];

  const handleApplyPreset = (preset: typeof presets[number]) => {
    // Keep volume and play state, overwrite the rest of the configuration
    onChangeConfig({
      ...preset.config,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* SECTION 1: MASTER POWER & INTERACTIVE PRESETS */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col justify-between backdrop-blur shadow-lg">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <h3 className="text-sm font-mono font-bold tracking-wider text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>IGNITION SYSTEM</span>
            </h3>
            <span className={`w-2.5 h-2.5 rounded-full ${config.isPlaying ? 'bg-cyan-400 shadow-[0_0_12px_#06b6d4]' : 'bg-slate-700'}`}></span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-5">
            Activate the continuous usnotopical stream below. Running the sound starts the Web Audio oscillator.
          </p>

          {/* LARGE NEON IGNITION BUTTON WITH SLEEK INTERFACE GRADIENTS */}
          <button
            id="btn-master-ignition"
            onClick={() => onChangeConfig({ isPlaying: !config.isPlaying })}
            className={`w-full py-4.5 px-6 rounded-lg font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-3 transition-all cursor-pointer transform duration-150 active:translate-y-0.5 ${
              config.isPlaying
                ? 'bg-gradient-to-r from-red-650 to-orange-600 text-white shadow-lg shadow-red-950/40 hover:brightness-110'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/30 hover:brightness-115 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            }`}
          >
            {config.isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-current animate-pulse" />
                <span>TERMINATE OSCILLATIONS</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>ENGAGE SIGNAL GENERATION</span>
              </>
            )}
          </button>
        </div>

        {/* PRESET MATRICES */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <h4 className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Preset Simulation Matrices</span>
          </h4>
          <div className="space-y-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                id={`btn-preset-${idx}`}
                onClick={() => handleApplyPreset(p)}
                className="w-full text-left p-2.5 rounded-lg bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all text-xs group"
              >
                <div className="font-mono text-slate-300 font-bold group-hover:text-cyan-400 flex justify-between items-center">
                  <span>{p.name}</span>
                  <span className="text-[10px] text-slate-600 font-normal">ApplyPreset</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug group-hover:text-slate-400">
                  {p.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: RESONANCE PARAMETERS & VOLUME */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col justify-between backdrop-blur shadow-lg">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <h3 className="text-sm font-mono font-bold tracking-wider text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>CARRIER DECK</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">{activeFreq.toFixed(1)} Hz Active</span>
          </div>

          <div className="space-y-4">
            
            {/* VOLTS GAIN (VOLUME) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 flex items-center space-x-1">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Amperage / Volume</span>
                </span>
                <span className="text-cyan-400 font-bold">{(config.volume * 666).toFixed(0)} A</span>
              </div>
              <input
                id="slider-volume"
                type="range"
                min="0"
                max="0.15"
                step="0.005"
                value={config.volume}
                onChange={(e) => onChangeConfig({ volume: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-950 rounded-lg cursor-pointer appearance-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0.0A (Mute)</span>
                <span>Safe Amplitude Threshold (Max)</span>
              </div>
            </div>

            {/* HARMONIC TRANSDUCTOR SWITCH */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 block">
                Harmonic Decimator Range:
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
                <button
                  id="btn-harmonic-exact"
                  onClick={() => onChangeConfig({ harmonicMode: 'exact' })}
                  className={`py-1.5 px-2 rounded font-mono text-[10px] text-center transition-all ${
                    config.harmonicMode === 'exact'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Exact (7k)
                </button>
                <button
                  id="btn-harmonic-sub10"
                  onClick={() => onChangeConfig({ harmonicMode: 'sub_10' })}
                  className={`py-1.5 px-2 rounded font-mono text-[10px] text-center transition-all ${
                    config.harmonicMode === 'sub_10'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Deca (742Hz)
                </button>
                <button
                  id="btn-harmonic-sub100"
                  onClick={() => onChangeConfig({ harmonicMode: 'sub_100' })}
                  className={`py-1.5 px-2 rounded font-mono text-[10px] text-center transition-all ${
                    config.harmonicMode === 'sub_100'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Centi (74Hz)
                </button>
              </div>
            </div>

            {/* WAVEFORM CLASS */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 block">
                Electrostatic Waveform Pattern:
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                {(['sine', 'square', 'triangle', 'pulse'] as const).map((w) => (
                  <button
                    key={w}
                    id={`btn-wave-${w}`}
                    onClick={() => onChangeConfig({ waveform: w })}
                    className={`py-1 rounded font-mono text-[10px] text-center uppercase transition-all ${
                      config.waveform === w
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* FREQUENCY SHIFT SLIDER */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300">Carrier Center-Shift</span>
                <span className="text-cyan-400 font-bold">{config.frequency} Hz</span>
              </div>
              <input
                id="slider-frequency"
                type="range"
                min="7400"
                max="7458"
                step="1"
                value={config.frequency}
                onChange={(e) => onChangeConfig({ frequency: parseInt(e.target.value) })}
                className="w-full accent-purple-400 h-1.5 bg-slate-950 rounded-lg cursor-pointer appearance-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>7400 Hz</span>
                <span>Exact Core: 7429 Hz</span>
                <span>7458 Hz</span>
              </div>
            </div>

          </div>
        </div>

        {/* PIERCING AUDIO CAUTION OVERLAY WARNING */}
        {config.harmonicMode === 'exact' && config.isPlaying && (
          <div className="mt-4 p-2 bg-amber-500/10 border border-amber-950 rounded flex items-start space-x-2 text-amber-300 select-none animate-pulse">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="text-[10px] font-mono leading-tight">
              CAUTION: Exact 7429Hz outputs high-pitch micro-tones. Maintain lower speaker settings to ensure comfort.
            </span>
          </div>
        )}
      </div>

      {/* SECTION 3: ADVANCED OSCILLATOR DECK */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col justify-between backdrop-blur shadow-lg">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <h3 className="text-sm font-mono font-bold tracking-wider text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>USNOTOPICAL PARAMETERS</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">FM sidebands active</span>
          </div>

          <div className="space-y-4">
            
            {/* LFO FREQUENCY */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300">Carrier Drift (LFO Speed)</span>
                <span className="text-purple-400 font-bold">{config.lfoFrequency.toFixed(1)} Hz</span>
              </div>
              <input
                id="slider-lfo-speed"
                type="range"
                min="0.1"
                max="30"
                step="0.1"
                value={config.lfoFrequency}
                onChange={(e) => onChangeConfig({ lfoFrequency: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-950 rounded-lg cursor-pointer appearance-none accent-purple-400"
              />
            </div>

            {/* LFO DEPTH */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300">Modulator Swing Depth</span>
                <span className="text-purple-400 font-bold">{config.lfoDepth} Hz</span>
              </div>
              <input
                id="slider-lfo-depth"
                type="range"
                min="0"
                max="250"
                step="5"
                value={config.lfoDepth}
                onChange={(e) => onChangeConfig({ lfoDepth: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-950 rounded-lg cursor-pointer appearance-none accent-purple-400"
              />
            </div>

            {/* DISCHARGE PULSE RATE */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300">Current Discharging Pulses</span>
                <span className="text-yellow-400 font-bold">
                  {config.pulsingRate === 0 ? 'Continuous AC' : `${config.pulsingRate.toFixed(1)} Hz`}
                </span>
              </div>
              <input
                id="slider-pulse-rate"
                type="range"
                min="0"
                max="10"
                step="0.2"
                value={config.pulsingRate}
                onChange={(e) => onChangeConfig({ pulsingRate: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-950 rounded-lg cursor-pointer appearance-none accent-yellow-400"
              />
            </div>

            {/* QUANTUM DRIFT PHASE */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300">Phase Jitter (Quantum Noise)</span>
                <span className="text-emerald-400 font-bold">{config.quantumDrift}% mix</span>
              </div>
              <input
                id="slider-quantum-drift"
                type="range"
                min="0"
                max="100"
                step="1"
                value={config.quantumDrift}
                onChange={(e) => onChangeConfig({ quantumDrift: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-950 rounded-lg cursor-pointer appearance-none accent-emerald-400"
              />
            </div>

          </div>
        </div>

        {/* CUSTOM DECK VISUAL OSCILLOSCOPE COLORS */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Fluorescent Tint:</span>
          <div className="flex space-x-1.5 bg-slate-950 p-1 border border-slate-800 rounded-lg">
            {(['cyan-purple', 'amber-orange', 'plasma-green'] as const).map((theme) => (
              <button
                key={theme}
                id={`btn-theme-${theme}`}
                onClick={() => onChangeConfig({ colorTheme: theme })}
                className={`w-4 h-4 rounded-full transition-all cursor-pointer ${
                  theme === 'cyan-purple'
                    ? 'bg-cyan-500 border border-slate-700 hover:scale-110'
                    : theme === 'amber-orange'
                    ? 'bg-amber-500 border border-slate-700 hover:scale-110'
                    : 'bg-emerald-500 border border-slate-700 hover:scale-110'
                } ${config.colorTheme === theme ? 'ring-2 ring-white scale-110' : 'opacity-65'}`}
                title={`Switch visual palette to ${theme}`}
              />
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
