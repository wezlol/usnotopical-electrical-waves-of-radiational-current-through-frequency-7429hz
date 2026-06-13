export interface WaveGeneratorConfig {
  frequency: number;            // Default 7429 Hz
  harmonicMode: 'exact' | 'sub_10' | 'sub_100'; // Exact (7429Hz), Subharmonic (742.9Hz) or (74.29Hz)
  waveform: 'sine' | 'square' | 'triangle' | 'pulse';
  volume: number;               // 0 to 0.15 (safe range)
  isPlaying: boolean;
  lfoFrequency: number;         // 0.1Hz to 30Hz
  lfoDepth: number;             // FM depth in Hz
  pulsingRate: number;          // 0Hz (continuous) to 10Hz (pulses)
  radiationIntensity: number;   // 0 to 10
  currentDensity: number;       // mA/cm2 calculated factor
  polarizationAngle: number;    // degrees (0 - 360)
  quantumDrift: number;         // random jitter factor
  colorTheme: 'cyan-purple' | 'amber-orange' | 'plasma-green';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  charge: number; // positive or negative ion
}

export interface WaveHistoryPoint {
  time: number;
  amplitude: number;
  ionized: boolean;
}
