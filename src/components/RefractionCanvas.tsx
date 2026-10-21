import React, { useEffect, useRef } from 'react';

interface RefractionCanvasProps {
  accentColor?: string;
  intensity?: number;
  showAerodynamics?: boolean;
}

interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vRot: number;
  opacity: number;
  sides: number;
  depth: number;
  aspect: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export const RefractionCanvas: React.FC<RefractionCanvasProps> = ({
  accentColor = '#E8A588',
  intensity = 1,
  showAerodynamics = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate crystal shards around the car periphery (like in the reference photo)
    const shards: Shard[] = [];
    const shardCount = Math.floor(48 * intensity);

    for (let i = 0; i < shardCount; i++) {
      // Swirling elliptical distribution around the center
      const angle = (i / shardCount) * Math.PI * 2 + Math.random() * 0.4;
      const radiusX = (width * 0.38) + (Math.random() - 0.5) * (width * 0.25);
      const radiusY = (height * 0.32) + (Math.random() - 0.5) * (height * 0.22);
      
      shards.push({
        x: width * 0.5 + Math.cos(angle) * radiusX,
        y: height * 0.52 + Math.sin(angle) * radiusY,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 14 + Math.random() * 38,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.008,
        opacity: 0.35 + Math.random() * 0.55,
        sides: Math.floor(3 + Math.random() * 3), // 3, 4, 5 sided crystal facets
        depth: 0.3 + Math.random() * 0.7,
        aspect: 0.5 + Math.random() * 0.9,
      });
    }

    // Sparkles & caustic light particles
    const particles: Particle[] = [];
    const particleCount = 70;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.5,
        size: 1 + Math.random() * 2.8,
        alpha: Math.random(),
        life: Math.random() * 100,
        maxLife: 80 + Math.random() * 60,
      });
    }

    // Aerodynamic streamline particles
    const aeroStreams: { x: number; y: number; speed: number; len: number; yOffset: number }[] = [];
    for (let i = 0; i < 40; i++) {
      aeroStreams.push({
        x: Math.random() * width,
        y: height * 0.35 + (Math.random() - 0.5) * (height * 0.25),
        speed: 6 + Math.random() * 12,
        len: 40 + Math.random() * 120,
        yOffset: (Math.random() - 0.5) * 40,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015;

      ctx.clearRect(0, 0, width, height);

      const mOffsetX = 0;
      const mOffsetY = 0;

      // 1. Draw Aerodynamic streamlines if enabled
      if (showAerodynamics) {
        ctx.save();
        for (let a = 0; a < aeroStreams.length; a++) {
          const s = aeroStreams[a];
          s.x += s.speed;
          if (s.x > width + s.len) {
            s.x = -s.len;
            s.y = height * 0.38 + (Math.random() - 0.5) * (height * 0.28);
          }

          // Curving aero profile over GT3 RS swan-neck rear wing & roof
          const progress = Math.max(0, Math.min(1, s.x / width));
          const aeroCurve = Math.sin(progress * Math.PI) * -35;

          const grad = ctx.createLinearGradient(s.x - s.len, s.y + aeroCurve, s.x, s.y + aeroCurve);
          grad.addColorStop(0, 'rgba(232, 165, 136, 0)');
          grad.addColorStop(0.7, 'rgba(232, 165, 136, 0.45)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0.9)');

          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6;
          ctx.moveTo(s.x - s.len, s.y + aeroCurve);
          ctx.lineTo(s.x, s.y + aeroCurve);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Draw Caustic Light Particles (bokeh / dust of refraction)
      for (let p = 0; p < particles.length; p++) {
        const pt = particles[p];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life++;
        if (pt.life > pt.maxLife || pt.y < -10) {
          pt.x = Math.random() * width;
          pt.y = height + 10;
          pt.life = 0;
        }

        const alpha = Math.sin((pt.life / pt.maxLife) * Math.PI) * 0.7;
        ctx.save();
        ctx.fillStyle = `rgba(255, 245, 238, ${alpha})`;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(pt.x + mOffsetX * 0.5, pt.y + mOffsetY * 0.5, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Draw Crystalline Glass Shards (Refractive Shards)
      for (let i = 0; i < shards.length; i++) {
        const s = shards[i];
        s.rot += s.vRot;
        s.x += s.vx + Math.sin(time + i) * 0.25;
        s.y += s.vy + Math.cos(time + i * 0.7) * 0.25;

        const posX = s.x + mOffsetX * s.depth;
        const posY = s.y + mOffsetY * s.depth;

        ctx.save();
        ctx.translate(posX, posY);
        ctx.rotate(s.rot);
        ctx.scale(1, s.aspect);

        // Glass shard outline & gradient
        const shardGrad = ctx.createLinearGradient(-s.size, -s.size, s.size, s.size);
        shardGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        shardGrad.addColorStop(0.35, 'rgba(255, 240, 232, 0.4)');
        shardGrad.addColorStop(0.7, 'rgba(232, 165, 136, 0.2)');
        shardGrad.addColorStop(1, 'rgba(255, 255, 255, 0.85)');

        ctx.beginPath();
        // Generate irregular faceted polygon
        const pts = s.sides;
        for (let j = 0; j < pts; j++) {
          const a = (j / pts) * Math.PI * 2;
          const r = s.size * (0.75 + ((j % 2 === 0 ? 0.3 : -0.15)));
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        // Shard fill
        ctx.fillStyle = shardGrad;
        ctx.fill();

        // Facet reflection edge (prismatic specular line)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 0.9;
        ctx.stroke();

        // Internal refractive cleavage line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 0.6;
        ctx.moveTo(-s.size * 0.6, -s.size * 0.2);
        ctx.lineTo(s.size * 0.5, s.size * 0.4);
        ctx.stroke();

        // Subtle specular glint
        const glintAlpha = (Math.sin(time * 3 + i) + 1) * 0.5;
        if (glintAlpha > 0.8) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${glintAlpha * s.opacity})`;
          ctx.arc(s.size * 0.2, -s.size * 0.3, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [accentColor, intensity, showAerodynamics]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
};
