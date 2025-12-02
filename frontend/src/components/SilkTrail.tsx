import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  age: number;
}

const SilkTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<Point[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  // Track if we have valid mouse data to avoid drawing lines from (0,0) initially
  const hasMouseMoved = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      hasMouseMoved.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        mouse.current.x = touch.clientX;
        mouse.current.y = touch.clientY;
        hasMouseMoved.current = true;
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new point if mouse has moved
      if (hasMouseMoved.current) {
          points.current.push({
            x: mouse.current.x,
            y: mouse.current.y,
            age: 1.0,
          });
      }

      // Update points
      for (let i = 0; i < points.current.length; i++) {
        const p = points.current[i];
        p.age -= 0.02; // Fade speed
        if (p.age <= 0) {
          points.current.splice(i, 1);
          i--;
        }
      }

      // Draw trail
      if (points.current.length > 1) {
        ctx.beginPath();
        ctx.moveTo(points.current[0].x, points.current[0].y);

        for (let i = 1; i < points.current.length; i++) {
          const p = points.current[i];
          const prevP = points.current[i - 1];
          
          // Quadratic bezier for smoothness
          const midX = (prevP.x + p.x) / 2;
          const midY = (prevP.y + p.y) / 2;
          ctx.quadraticCurveTo(prevP.x, prevP.y, midX, midY);
        }
        
        // Connect to the last point
        ctx.lineTo(points.current[points.current.length - 1].x, points.current[points.current.length - 1].y);

        // Styling
        // Moonlight White with a hint of blue/purple
        const gradient = ctx.createLinearGradient(
            points.current[0].x, 
            points.current[0].y, 
            points.current[points.current.length - 1].x, 
            points.current[points.current.length - 1].y
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.5, 'rgba(240, 248, 255, 0.5)'); // AliceBlue
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(200, 220, 255, 0.6)';
        
        ctx.stroke();
        
        // Reset shadow for other drawings if any (though we clear rect)
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 pointer-events-none"
    />
  );
};

export default SilkTrail;
