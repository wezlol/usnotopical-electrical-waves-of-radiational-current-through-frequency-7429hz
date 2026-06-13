import { useEffect, useRef } from 'react';
import { WaveGeneratorConfig } from '../types';

export function useAudioEngine(config: WaveGeneratorConfig) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Audio Nodes
  const oscRef = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const pulseGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const pulseIntervalRef = useRef<any>(null);

  // Initialize Audio Context on demand
  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    } catch (e) {
      console.error('Web Audio API not supported', e);
    }
  };

  // Build audio graph
  const startSynth = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Stop existing nodes just in case
    stopSynth();

    // 1. Create Nodes
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Pulse node
    const pulseGain = ctx.createGain();
    pulseGain.gain.setValueAtTime(1, ctx.currentTime);
    pulseGain.connect(masterGain);
    pulseGainRef.current = pulseGain;

    // Primary wave oscillator
    const osc = ctx.createOscillator();
    const targetFreq = getActiveFrequency();
    osc.frequency.setValueAtTime(targetFreq, ctx.currentTime);
    osc.type = config.waveform === 'pulse' ? 'triangle' : config.waveform;

    // LFO modulator (FM)
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(config.lfoFrequency, ctx.currentTime);
    
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(config.lfoDepth, ctx.currentTime);

    // Filtered static-noise (simulates quantum radiational discharge crackle)
    const noiseBuffer = createNoiseBuffer(ctx);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const biquadFilter = ctx.createBiquadFilter();
    biquadFilter.type = 'bandpass';
    biquadFilter.frequency.setValueAtTime(getActiveFrequency(), ctx.currentTime);
    biquadFilter.Q.setValueAtTime(25, ctx.currentTime); // High resonant peak at 7429Hz

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, ctx.currentTime); // start quiet

    // Connect FM graph
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    // Connect Oscillator graph
    osc.connect(pulseGain);

    // Connect Resonant Radiational Noise graph
    noiseSource.connect(biquadFilter);
    biquadFilter.connect(noiseGain);
    noiseGain.connect(pulseGain);

    // Store references
    oscRef.current = osc;
    lfoRef.current = lfo;
    lfoGainRef.current = lfoGain;
    noiseSourceRef.current = noiseSource;
    filterRef.current = biquadFilter;
    noiseGainRef.current = noiseGain;

    // Start playback
    osc.start();
    lfo.start();
    noiseSource.start();

    // Fade-in
    masterGain.gain.linearRampToValueAtTime(config.volume, ctx.currentTime + 0.1);

    setupPulsing();
  };

  const stopSynth = () => {
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }

    try {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      if (lfoRef.current) {
        lfoRef.current.stop();
        lfoRef.current.disconnect();
        lfoRef.current = null;
      }
      if (lfoGainRef.current) {
        lfoGainRef.current.disconnect();
        lfoGainRef.current = null;
      }
      if (noiseSourceRef.current) {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
        noiseSourceRef.current = null;
      }
      if (filterRef.current) {
        filterRef.current.disconnect();
        filterRef.current = null;
      }
      if (noiseGainRef.current) {
        noiseGainRef.current.disconnect();
        noiseGainRef.current = null;
      }
      if (pulseGainRef.current) {
        pulseGainRef.current.disconnect();
        pulseGainRef.current = null;
      }
      if (masterGainRef.current) {
        masterGainRef.current.disconnect();
        masterGainRef.current = null;
      }
    } catch (e) {
      // safe catch
    }
  };

  // Calculates the actual synthesis frequency based on user's hearing preference harmonicMode
  const getActiveFrequency = () => {
    const base = config.frequency; // default 7429
    if (config.harmonicMode === 'sub_10') return base / 10;   // 742.9 Hz
    if (config.harmonicMode === 'sub_100') return base / 100; // 74.29 Hz
    return base;                                              // 7429 Hz
  };

  // Helper for generating white noise buffer
  const createNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  // Manages intermittent bursting/spark pulsing
  const setupPulsing = () => {
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }

    const ctx = audioCtxRef.current;
    const pulseGain = pulseGainRef.current;
    if (!ctx || !pulseGain) return;

    if (config.pulsingRate <= 0) {
      // Continuous stream
      pulseGain.gain.setValueAtTime(1.0, ctx.currentTime);
      return;
    }

    const intervalMs = 1000 / config.pulsingRate;
    pulseIntervalRef.current = setInterval(() => {
      const now = ctx.currentTime;
      // Synthesize a quick bursting current wave envelope (Attack-Decay)
      pulseGain.gain.cancelScheduledValues(now);
      pulseGain.gain.setValueAtTime(0, now);
      pulseGain.gain.linearRampToValueAtTime(1.0, now + 0.02);
      pulseGain.gain.exponentialRampToValueAtTime(0.001, now + (intervalMs / 1000) * 0.7);
    }, intervalMs);
  };

  // Sync state transitions to active Audio Graph
  useEffect(() => {
    if (config.isPlaying) {
      if (!oscRef.current) {
        startSynth();
      } else {
        const ctx = audioCtxRef.current;
        if (ctx) {
          const targetFreq = getActiveFrequency();
          
          // Smooth frequency transition smoothly
          oscRef.current.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 0.05);
          
          if (filterRef.current) {
            filterRef.current.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 0.05);
          }
          
          if (oscRef.current.type !== 'custom') {
            oscRef.current.type = config.waveform === 'pulse' ? 'triangle' : config.waveform;
          }

          if (lfoRef.current) {
            lfoRef.current.frequency.setValueAtTime(config.lfoFrequency, ctx.currentTime);
          }

          if (lfoGainRef.current) {
            lfoGainRef.current.gain.setValueAtTime(config.lfoDepth, ctx.currentTime);
          }

          if (masterGainRef.current) {
            masterGainRef.current.gain.linearRampToValueAtTime(config.volume, ctx.currentTime + 0.05);
          }

          if (noiseGainRef.current) {
            // Noise scale is correlated to active intensity and jitter parameters
            const noiseScale = (config.quantumDrift / 100) * config.radiationIntensity * 0.12;
            noiseGainRef.current.gain.setValueAtTime(noiseScale, ctx.currentTime);
          }

          setupPulsing();
        }
      }
    } else {
      stopSynth();
    }
  }, [
    config.isPlaying,
    config.frequency,
    config.harmonicMode,
    config.waveform,
    config.volume,
    config.lfoFrequency,
    config.lfoDepth,
    config.pulsingRate,
    config.radiationIntensity,
    config.quantumDrift,
  ]);

  // Handle unmount cleanups
  useEffect(() => {
    return () => {
      stopSynth();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return {
    getActiveFrequency,
  };
}
