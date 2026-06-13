import React, { useState } from 'react';
import { Activity, BookOpen, AlertTriangle, Cpu, Zap, Radio, RefreshCw } from 'lucide-react';

interface InformationSectionProps {
  currentFreq: number;
}

export const InformationSection: React.FC<InformationSectionProps> = ({ currentFreq }) => {
  const [activeTab, setActiveTab] = useState<'theory' | 'calculations' | 'probing'>('theory');
  const [calcFreq, setCalcFreq] = useState<number>(7429);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedLogs, setScannedLogs] = useState<string[]>([
    'System initialized. Waiting for sensor diagnostics...'
  ]);

  // Calculations for specific fields
  const skinDepth = (503 / Math.sqrt(calcFreq * 0.05)).toFixed(2); // Skin depth approximation in mild conductivity
  const waveLengthAir = (343 / calcFreq).toFixed(4); // Speed of sound in air (m)
  const bioInductionVal = (calcFreq * 0.00135).toFixed(3); // Hydrodynamic molecular resonance coeff

  const runSpectralScan = () => {
    setIsScanning(true);
    setScannedLogs(prev => ['[SCANNER] Initializing broad VLF sweep on carrier node...', ...prev]);
    
    setTimeout(() => {
      const scans = [
        `[SCANNER] Peak detected at ${currentFreq} Hz (amplitude -12.4dB)`,
        `[SCANNER] Usnotopical carrier synchronization state: IONIZED`,
        `[SCANNER] Radiational drift rate: ±${(Math.random() * 0.8).toFixed(3)} mA/s`,
        `[SCANNER] Subharmonic convergence factor: ${(currentFreq / 10).toFixed(1)} Hz verified`,
        `[SCANNER] Atmospheric moisture conductance: 46.2%`
      ];
      setScannedLogs(prev => [...scans, ...prev]);
      setIsScanning(false);
    }, 1500);
  };

  return (
    <div id="info-section-container" className="w-full bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur shadow-xl mt-6">
      {/* Navigation tabs */}
      <div className="flex border-b border-slate-800 bg-[#010409]/60">
        <button
          id="btn-tab-theory"
          onClick={() => setActiveTab('theory')}
          className={`flex items-center space-x-2 px-5 py-3.5 text-[11px] font-mono border-r border-slate-850 transition-all cursor-pointer ${
            activeTab === 'theory'
              ? 'text-cyan-400 bg-slate-950/40 font-semibold border-b border-b-cyan-500'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>FIELD THEORY</span>
        </button>

        <button
          id="btn-tab-calc"
          onClick={() => setActiveTab('calculations')}
          className={`flex items-center space-x-2 px-5 py-3.5 text-[11px] font-mono border-r border-slate-850 transition-all cursor-pointer ${
            activeTab === 'calculations'
              ? 'text-cyan-400 bg-slate-950/40 font-semibold border-b border-b-cyan-500'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>WAVE CALCULATOR</span>
        </button>

        <button
          id="btn-tab-probing"
          onClick={() => setActiveTab('probing')}
          className={`flex items-center space-x-2 px-5 py-3.5 text-[11px] font-mono transition-all cursor-pointer ${
            activeTab === 'probing'
              ? 'text-cyan-400 bg-slate-950/40 font-semibold border-b border-b-cyan-500'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>SPECTRAL SWEEPER</span>
        </button>
      </div>

      <div className="p-6 text-slate-300">
        {/* TAB 1: FIELD THEORY */}
        {activeTab === 'theory' && (
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-mono text-slate-100 font-bold uppercase tracking-wider">
                  What are Usnotopical Electromagnetics?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Usnotopical electrical waves are a hypothetical classification of Very Low Frequency (VLF) radio waves coupled directly with focused electrostatic discharge gradients. Rather than merely transmitting radiative waves into space, the current is driven along ionizing streams, setting up resonant physical oscillations inside ambient mediums like moisture-dense air, tissues, or saline fields.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                <h4 className="text-xs font-mono text-cyan-400 font-semibold flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>The Resonance at 7429 Hz</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1.5">
                  The frequency <strong>7429 Hz</strong> sits firmly near the boundary of human audio perception and ultra-low speed radio propagation. This specific range corresponds to the natural molecular vibration harmonics of high-voltage moisture vapor, creating high energy boundaries of ion flux density while causing extremely fast spatial wave dispersion.
                </p>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                <h4 className="text-xs font-mono text-purple-400 font-semibold flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  <span>Radiational Flux Current</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1.5">
                  Unlike simple pure alternating electric currents (AC), a radiational current couples continuous wave flow with high-energy charge ionization. As the carrier wave vibrates at 7429 Hz, positive and negative ion clouds form alternating clusters, establishing localized magnetic flux lines. This phenomenon allows currents to jump across dielectric barriers easily.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-900/30 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-300 leading-relaxed">
                <strong>Acoustic Precautions:</strong> Standard pure 7429 Hz tone frequencies represent incredibly sharp high-pitched ringing sounds similar to high-voltage transformers. For prolonged laboratory simulation and safety, this console offers <em>Subharmonic Translations</em> which lower the audio transducer to safe 742.9 Hz and 74.29 Hz resonant fractions.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: CALCULATOR */}
        {activeTab === 'calculations' && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono text-slate-100 font-bold uppercase tracking-wider flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Usnotopical Boundary Wave Calculator</span>
            </h3>
            <p className="text-xs text-slate-400">
              Compute the physical boundaries, wavelengths, and dielectric penetration ratios of any arbitrary electromagnetic or acoustic waveform through standard atmospheric mediums.
            </p>

            <div className="p-4 bg-[#020617]/80 border border-slate-800/85 rounded-lg space-y-4 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="text-xs font-mono text-slate-400">
                  Target Frequency Input (Hz):
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    id="calc-frequency-input"
                    type="number"
                    min="1"
                    max="100000"
                    value={calcFreq}
                    onChange={(e) => setCalcFreq(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-32 bg-[#09090b] border border-slate-800 text-cyan-400 px-2.5 py-1.5 text-xs font-mono text-right rounded focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <button
                    id="btn-calc-freq-reset"
                    onClick={() => setCalcFreq(7429)}
                    className="px-2.5 py-1.5 text-[11px] font-mono bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                  >
                    Set 7429Hz
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-[#09090b]/80 border border-slate-800/80 rounded-lg">
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Acoustic Wavelength (Air)</div>
                  <div className="text-lg font-mono font-bold text-cyan-400 mt-0.5">{waveLengthAir} m</div>
                  <div className="text-[9px] text-slate-500 mt-1">Spatial peak distance at 343 m/s</div>
                </div>

                <div className="p-3 bg-[#09090b]/80 border border-slate-800/80 rounded-lg">
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Resonant Skin Depth (Water)</div>
                  <div className="text-lg font-mono font-bold text-purple-400 mt-0.5">{skinDepth} mm</div>
                  <div className="text-[9px] text-slate-500 mt-1">Penetration barrier threshold</div>
                </div>

                <div className="p-3 bg-[#09090b]/80 border border-slate-800/80 rounded-lg col-span-2 lg:col-span-1">
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Biofield Induction Index</div>
                  <div className="text-lg font-mono font-bold text-amber-500 mt-0.5">{bioInductionVal} J</div>
                  <div className="text-[9px] text-slate-500 mt-1">Simulated cell membrane flux</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROBING SCANNER */}
        {activeTab === 'probing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-mono text-slate-100 font-bold uppercase tracking-wider flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-purple-400" />
                  <span>Real-Time Atmospheric Sweeper</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Triggers an instantaneous scan for stray radioactive, ionizing, or high-capacity electrical currents radiating close to the device.
                </p>
              </div>
              <button
                id="btn-atmosphere-scan"
                onClick={runSpectralScan}
                disabled={isScanning}
                className="flex items-center space-x-1.5 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider rounded-lg border border-cyan-500/30 text-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/50 hover:border-cyan-400 transition-all disabled:opacity-55 cursor-pointer disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'SCANNING...' : 'TRIGGER SWEEP'}</span>
              </button>
            </div>

            {/* Sweep logs console */}
            <div className="p-4 bg-[#020617] border border-slate-800 rounded-lg shadow-inner">
              <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2.5 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  VLF Spectral Scanner Terminal Output
                </span>
              </div>
              <div className="h-32 overflow-y-auto space-y-1.5 scrollbar pr-1 text-left">
                {scannedLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`text-[11px] font-mono transition-opacity ${
                      index === 0 ? 'text-cyan-400 font-semibold' : 'text-slate-450'
                    }`}
                  >
                    &gt; {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
