'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

type Particle = {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  opacity: number;
};

export function ParticleBackground({ 
    className, 
    quantity = 100, 
}: {
    className?: string;
    quantity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
  const animationFrameId = useRef<number | null>(null);

  const init = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);

    const newParticles: Particle[] = [];
    for (let i = 0; i < quantity; i++) {
        newParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.2 + 0.5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }
    particlesRef.current = newParticles;
  };

  
  useEffect(() => {
    const canvas = canvasRef.current;
    let context: CanvasRenderingContext2D | null = null;
    
    if (canvas) {
      context = canvas.getContext('2d');
      contextRef.current = context;
    }

    if (!context) return;
    
    init(context, canvas!);
    
    const animate = () => {
        const currentContext = contextRef.current;
        const currentCanvas = canvasRef.current;
        if (!currentCanvas || !currentContext) return;

        currentContext.clearRect(0, 0, currentCanvas.width, currentCanvas.height);

        for (const particle of particlesRef.current) {
            // Mouse interaction
            if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
                const dx = particle.x - mouseRef.current.x;
                const dy = particle.y - mouseRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) { // Interaction radius
                    const forceDirectionX = dx / dist;
                    const forceDirectionY = dy / dist;
                    const force = (120 - dist) / 120;
                    particle.x += forceDirectionX * force * 0.5;
                    particle.y += forceDirectionY * force * 0.5;
                }
            }

            // Move particle
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off walls
            if (particle.x < 0 || particle.x > currentCanvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > currentCanvas.height) particle.vy *= -1;
            
            // Draw particle
            currentContext.beginPath();
            currentContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            currentContext.fillStyle = `rgba(0, 183, 255, ${particle.opacity})`; // Cyan-ish color
            currentContext.fill();
        }

        animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const currentCanvas = canvasRef.current;
      const currentContext = contextRef.current;
      if (currentCanvas && currentContext) {
        init(currentContext, currentCanvas);
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [quantity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('fixed top-0 left-0 w-full h-full -z-10', className)}
    />
  );
};
