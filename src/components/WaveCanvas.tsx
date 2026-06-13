import React, { useRef, useEffect, useState } from 'react';
import { WaveGeneratorConfig, Particle } from '../types';

interface WaveCanvasProps {
  config: WaveGeneratorConfig;
  onChangeConfig: (newConfig: Partial<WaveGeneratorConfig>) => void;
  activeFreq: number;
}

export const WaveCanvas: React.FC<WaveCanvasProps> = ({ config, onChangeConfig, activeFreq }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [draggedNode, setDraggedNode] = useState<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const pointsRef = useRef<{ x: number; y: number; label: string; desc: string }[]>([]);

  // Monitor container size to adhere strictly to the "Canvas/Stage Sizing" responsive guidelines
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 300),
          height: Math.max(height, 350)
        });
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Update canvas coordinates when state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
    }
  }, [dimensions]);

  // Define position of interactive nodes based on configuration values
  useEffect(() => {
    const h = dimensions.height;
    const w = dimensions.width;
    
    // Node 1: Left - Radiation Intensity & Base Gain
    const n1X = w * 0.25;
    const n1Y = h * 0.5 - (config.radiationIntensity - 5) * (h * 0.035);

    // Node 2: Middle - Carrier Frequency Deviation
    const freqRatio = (config.frequency - 7400) / 58; // scale 7400-7458
    const n2X = w * 0.5;
    const n2Y = h * 0.5 - (freqRatio - 0.5) * (h * 0.4);

    // Node 3: Right - FM LFO Speed and depth
    const lfoRatio = (config.lfoFrequency) / 30; // scale 0-30Hz
    const n3X = w * 0.75;
    const n3Y = h * 0.5 - (lfoRatio - 0.5) * (h * 0.4);

    pointsRef.current = [
      { x: n1X, y: n1Y, label: 'AMP-NODE I', desc: 'Radiation Intensity' },
      { x: n2X, y: n2Y, label: 'FREQ-NODE II', desc: 'Base Hertz Deviation' },
      { x: n3X, y: n3Y, label: 'MOD-NODE III', desc: 'LFO Resonance' },
    ];
  }, [dimensions, config.radiationIntensity, config.frequency, config.lfoFrequency]);

  // Handles dragging interactive nodes on the canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    // Detect click overlap on node handles with a 30px trigger radius
    let foundIndex = -1;
    pointsRef.current.forEach((node, i) => {
      const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
      if (dist < 32) {
        foundIndex = i;
      }
    });

    if (foundIndex !== -1) {
      setDraggedNode(foundIndex);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (draggedNode === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const mouseY = clientY - rect.top;
    const pctY = Math.max(0.1, Math.min(0.9, mouseY / dimensions.height));
    const invertedPctY = 1.0 - pctY;

    if (draggedNode === 0) {
      // Modify radiation intensity: 0 to 12
      const mappedIntensity = parseFloat((invertedPctY * 12).toFixed(1));
      onChangeConfig({ radiationIntensity: mappedIntensity });
    } else if (draggedNode === 1) {
      // Modify frequency dev: 7400 to 7458
      const mappedFreq = Math.round(7400 + invertedPctY * 58);
      onChangeConfig({ frequency: mappedFreq });
    } else if (draggedNode === 2) {
      // Modify modulation resonance: 0.1 to 30
      const mappedLFO = parseFloat((invertedPctY * 30).toFixed(1));
      onChangeConfig({ lfoFrequency: Math.max(0.1, mappedLFO) });
    }
  };

  const handleMouseUpOrLeave = () => {
    setDraggedNode(null);
  };

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const renderLoop = () => {
      time += 0.015 * (config.radiationIntensity * 0.3 + 0.4);
      
      const width = dimensions.width;
      const height = dimensions.height;

      // 1. Clear background with grid scanlines
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Sci-fi grid backing
      ctx.strokeStyle = '#0e172a';
      ctx.lineWidth = 1;
      const gridSize = 40;
      
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Horizontal central line (Atmospheric Ground reference)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // 2. Draw Theme Background Radiance Gradient
      const isCyanTheme = config.colorTheme === 'cyan-purple';
      const isAmberTheme = config.colorTheme === 'amber-orange';
      
      const themeColor1 = isCyanTheme ? '#06b6d4' : isAmberTheme ? '#f59e0b' : '#34d399';
      const themeColor2 = isCyanTheme ? '#a855f7' : isAmberTheme ? '#ea580c' : '#10b981';

      if (config.isPlaying) {
        const radGrad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width * 0.6);
        radGrad.addColorStop(0, `${themeColor1}15`);
        radGrad.addColorStop(0.5, `${themeColor2}0a`);
        radGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 3. Render Simulated Waves
      // Main Carrier electrical current (High Frequency)
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = `${themeColor1}dd`;
      
      // Setup dynamic variables
      const baseAmp = height * 0.12 * (config.volume * 6 + 0.5);
      const intensityScalar = config.radiationIntensity / 5;

      for (let x = 0; x < width; x++) {
        // High frequency sine component (simulated carriers)
        const carrierVal = Math.sin((x / (width * 0.08)) * (config.frequency / 7429) * 12 - time * 6);
        
        // Usnotopical modulator envelope component
        const lfoOsc = Math.sin((x / (width * 0.4)) - time * 1.5) * (config.lfoDepth / 100);
        const compositeAmp = baseAmp * (1 + lfoOsc) * intensityScalar;
        
        let y = height / 2 + carrierVal * compositeAmp;
        
        // Add quantum drift noise
        if (config.quantumDrift > 0 && Math.random() < 0.35) {
          y += (Math.random() - 0.5) * config.quantumDrift * 0.45;
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Shadow glow wave
      ctx.beginPath();
      ctx.lineWidth = 6;
      ctx.strokeStyle = `${themeColor1}22`;
      for (let x = 0; x < width; x++) {
        const carrierVal = Math.sin((x / (width * 0.08)) * (config.frequency / 7429) * 12 - time * 6);
        const lfoOsc = Math.sin((x / (width * 0.4)) - time * 1.5) * (config.lfoDepth / 100);
        let y = height / 2 + carrierVal * (baseAmp * (1 + lfoOsc) * intensityScalar);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Sub-harmonic current wave (Purple/Red visual component)
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `${themeColor2}aa`;
      for (let x = 0; x < width; x += 1.5) {
        // Subharmonic modulation wave (harmonic 742.9)
        const harmonicVal = Math.sin((x / (width * 0.28)) * (activeFreq / 742.9) * 5 - time * 2) * 1.1;
        const subAmp = baseAmp * 0.8 * intensityScalar;
        const y = height / 2 + harmonicVal * subAmp;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // 4. Update and Render Particles (Ion Streams)
      if (config.isPlaying && particlesRef.current.length < 130 && Math.random() < 0.45) {
        // Generate new particles from active electrode emitters (left/right)
        particlesRef.current.push({
          x: Math.random() < 0.5 ? 5 : width - 5,
          y: height / 2 + (Math.random() - 0.5) * (height * 0.4),
          vx: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? 1 : -1),
          vy: (Math.random() - 0.5) * 1.2,
          life: 0,
          maxLife: 80 + Math.random() * 80,
          size: Math.random() * 3 + 1,
          color: Math.random() < 0.7 ? themeColor1 : themeColor2,
          charge: Math.random() < 0.5 ? 1 : -1
        });
      }

      // Update particle physics towards frequency fields
      particlesRef.current = particlesRef.current.map(p => {
        const nextLife = p.life + 1;
        const movementFactor = config.radiationIntensity * 0.15 + 0.5;
        
        // Attract particles slightly towards the center current waves
        const targetY = height / 2 + Math.sin((p.x / (width * 0.08)) * (config.frequency / 7429) * 12 - time * 6) * (baseAmp * intensityScalar);
        const diffY = targetY - p.y;
        
        return {
          ...p,
          x: p.x + p.vx * movementFactor,
          y: p.y + (p.vy + diffY * 0.02) * movementFactor,
          life: nextLife,
        };
      }).filter(p => p.life < p.maxLife && p.x > 0 && p.x < width);

      // Render Ions/Particles
      particlesRef.current.forEach(p => {
        const opacity = 1 - p.life / p.maxLife;
        ctx.fillStyle = p.color;
        
        ctx.beginPath();
        ctx.globalAlpha = opacity;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw miniature electron shroud
        if (p.charge > 0 && Math.random() < 0.1) {
          ctx.strokeStyle = `${themeColor1}44`;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(p.x - p.size * 2, p.y - p.size * 2, p.size * 4, p.size * 4);
        }
        ctx.globalAlpha = 1.0;
      });

      // 5. Draw Electrode emitters (Endcaps)
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      
      // Left terminal
      ctx.fillRect(0, height / 2 - 40, 16, 80);
      ctx.strokeRect(0, height / 2 - 40, 16, 80);
      
      // Right terminal
      ctx.fillRect(width - 16, height / 2 - 40, 16, 80);
      ctx.strokeRect(width - 16, height / 2 - 40, 16, 80);

      // Electrode indicator cores
      ctx.fillStyle = config.isPlaying ? themeColor1 : '#1e293b';
      ctx.fillRect(4, height / 2 - 25, 8, 50);
      ctx.fillStyle = config.isPlaying ? themeColor2 : '#1e293b';
      ctx.fillRect(width - 12, height / 2 - 25, 8, 50);

      // 6. Draw Draggable Interactive Controller Nodes
      pointsRef.current.forEach((node, idx) => {
        // Pulse outer indicator rings
        const isSelected = draggedNode === idx;
        const ringRadius = 14 + Math.sin(time * 5 + idx * 1.5) * 3;
        
        ctx.strokeStyle = isSelected ? `${themeColor2}ff` : `${themeColor1}88`;
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner solid core node handle
        ctx.fillStyle = isSelected ? themeColor2 : '#0f172a';
        ctx.strokeStyle = isSelected ? '#ffffff' : themeColor1;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Glowing center dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Display node names and real-time attributes
        ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
        ctx.font = '10px var(--font-mono)';
        ctx.textAlign = 'center';

        let valText = '';
        if (idx === 0) valText = `${config.radiationIntensity.toFixed(1)}x Intensity`;
        if (idx === 1) valText = `${config.frequency} Hz`;
        if (idx === 2) valText = `${config.lfoFrequency.toFixed(1)} Hz Freq`;

        ctx.fillText(node.label, node.x, node.y - ringRadius - 15);
        ctx.fillStyle = isSelected ? themeColor2 : '#64748b';
        ctx.fillText(valText, node.x, node.y - ringRadius - 4);
      });

      // 7. Render dynamic mathematical formulas in background (Watermark scan)
      ctx.fillStyle = '#1e293b50';
      ctx.font = '11px var(--font-mono)';
      ctx.textAlign = 'left';
      ctx.fillText(`Φ(t) = sin(2π ⋅ ${config.frequency}t) ⋅ e^(-αt)`, 24, 30);
      ctx.fillText(`C_ion = (J_dis ⋅ H_res) / E_gap`, 24, 46);
      ctx.fillText(`Usnotopical Resonance: ${activeFreq.toFixed(2)} Hz Active`, 24, 62);

      // System state diagnostics in margins
      ctx.textAlign = 'right';
      ctx.fillText(`STATUS: ${config.isPlaying ? 'DISCHARGING' : 'STABLE'}`, width - 24, 30);
      ctx.fillText(`POLARITY: ${config.polarizationAngle}° ANGLE`, width - 24, 46);
      ctx.fillText(`JITTER: ±${(config.quantumDrift * 0.1).toFixed(2)} mA`, width - 24, 62);

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, config, activeFreq, draggedNode]);

  return (
    <div ref={containerRef} className="relative w-full h-[400px] bg-[#020617] border border-slate-800 rounded-xl overflow-hidden shadow-inner flex flex-col group">
      {/* Absolute canvas coordinate display axes */}
      <div className="absolute top-4 left-4 z-10 flex flex-col pointer-events-none select-none">
        <span className="text-[44px] sm:text-[56px] leading-none font-bold text-white tracking-tighter glow-cyan font-mono">
          {activeFreq.toFixed(2)}
          <span className="text-xl text-cyan-500 ml-1.5">Hz</span>
        </span>
        <span className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-widest flex items-center space-x-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${config.isPlaying ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`}></span>
          <span>Radiational Current Waveform Regulator</span>
        </span>
      </div>

      <div className="absolute top-4 right-4 flex space-x-2 pointer-events-none select-none z-10">
        <span className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800/60">
          STABILITY: 0.9998
        </span>
        <span className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800/60 lg:inline-block hidden">
          CRT-IV VORTEX
        </span>
      </div>

      {/* Primary Canvas element for rendering waveforms */}
      <canvas
        ref={canvasRef}
        id="usnotopical-oscilloscope-canvas"
        className="w-full h-full cursor-crosshair block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUpOrLeave}
      />

      {/* Tip helper overlay at the bottom margins */}
      <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none select-none">
        <span className="text-[10px] font-mono text-slate-500 bg-[#020617]/90 border border-slate-900 px-3 py-1 rounded-full backdrop-blur group-hover:text-cyan-400 transition-colors">
          ✦ Drag glowing Wave Nodes to modulate voltage and frequency fields ✦
        </span>
      </div>
    </div>
  );
};
