import React, { useEffect, useRef } from 'react';
import type { ExecutionState } from '@axiom/shared';

interface AxiomCoreProps {
  state: ExecutionState;
  size?: number;
}

export const AxiomCore: React.FC<AxiomCoreProps> = ({ state, size = 260 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Particle field
    const particleCount = 72;
    const particles = Array.from({ length: particleCount }, (_, i) => ({
      angle: (i / particleCount) * Math.PI * 2,
      distance: 60 + Math.random() * 35,
      speed: 0.008 + Math.random() * 0.012,
      size: 1.5 + Math.random() * 2,
      alpha: 0.3 + Math.random() * 0.5,
      offset: Math.random() * 10,
    }));

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;

      // Determine palette and dynamics based on execution state
      let primaryColor = '0, 240, 255'; // Cyan default (IDLE)
      let secondaryColor = '121, 40, 202'; // Violet
      let pulseSpeed = 1.0;
      let particleSpread = 1.0;

      switch (state) {
        case 'LISTENING':
          primaryColor = '0, 210, 255';
          secondaryColor = '0, 255, 170';
          pulseSpeed = 2.4;
          particleSpread = 1.3;
          break;
        case 'THINKING':
        case 'UNDERSTANDING':
          primaryColor = '147, 51, 234';
          secondaryColor = '59, 130, 246';
          pulseSpeed = 1.8;
          break;
        case 'PLANNING':
          primaryColor = '59, 130, 246';
          secondaryColor = '0, 240, 255';
          pulseSpeed = 1.4;
          break;
        case 'WAITING_FOR_PERMISSION':
          primaryColor = '245, 166, 35'; // Amber
          secondaryColor = '255, 90, 0';
          pulseSpeed = 0.8;
          break;
        case 'EXECUTING':
          primaryColor = '0, 230, 118'; // Neon Green
          secondaryColor = '0, 240, 255';
          pulseSpeed = 2.0;
          particleSpread = 1.25;
          break;
        case 'VERIFYING':
          primaryColor = '34, 197, 94';
          secondaryColor = '16, 185, 129';
          pulseSpeed = 1.2;
          break;
        case 'FAILED':
          primaryColor = '255, 51, 102'; // Crimson
          secondaryColor = '180, 0, 50';
          pulseSpeed = 0.6;
          break;
        case 'COMPLETED':
          primaryColor = '0, 230, 118';
          secondaryColor = '0, 200, 255';
          pulseSpeed = 0.9;
          break;
        default: // IDLE
          primaryColor = '0, 220, 255';
          secondaryColor = '99, 102, 241';
          pulseSpeed = 0.8;
      }

      // 1. Central Ambient Soft Glow
      const ambientGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        size * 0.45
      );
      ambientGlow.addColorStop(0, `rgba(${primaryColor}, 0.28)`);
      ambientGlow.addColorStop(0.5, `rgba(${secondaryColor}, 0.12)`);
      ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ambientGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, size * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // 2. Dynamic Fluid Energy Rings
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        const baseRadius = 50 + layer * 16;
        const waveFrequency = 6 + layer * 2;
        const waveAmplitude = 4 + Math.sin(time * pulseSpeed + layer) * 3;

        for (let a = 0; a <= Math.PI * 2; a += 0.05) {
          const r =
            baseRadius +
            Math.sin(a * waveFrequency + time * pulseSpeed * (layer % 2 === 0 ? 1 : -1)) *
              waveAmplitude;
          const x = centerX + Math.cos(a) * r;
          const y = centerY + Math.sin(a) * r;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(${layer === 0 ? primaryColor : secondaryColor}, ${
          0.45 - layer * 0.1
        })`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // 3. Intelligent Particle Orbitals
      for (const p of particles) {
        p.angle += p.speed * pulseSpeed;
        const radius = p.distance * particleSpread + Math.sin(time + p.offset) * 4;
        const px = centerX + Math.cos(p.angle) * radius;
        const py = centerY + Math.sin(p.angle) * radius;

        ctx.fillStyle = `rgba(${primaryColor}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Central Solid Nucleus Core
      const corePulse = Math.sin(time * pulseSpeed * 2) * 3;
      const coreGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        2,
        centerX,
        centerY,
        22 + corePulse
      );
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, `rgba(${primaryColor}, 0.95)`);
      coreGrad.addColorStop(0.8, `rgba(${secondaryColor}, 0.4)`);
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 22 + corePulse, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, size]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="drop-shadow-[0_0_35px_rgba(0,240,255,0.3)] transition-all duration-700"
      />
      <div className="mt-2 text-center">
        <span className="text-[10px] tracking-[0.25em] uppercase font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
          {state.replace(/_/g, ' ')}
        </span>
      </div>
    </div>
  );
};
