import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
  onExit?: () => void;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const characters = 'アカサタナハマヤラワイキシチニヒミリウクスツヌフムユルエケセテネヘメレオコソトノホモヨロ0123456789ABCDEF<>/*+-{}[]=~^|';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 10, 5, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff66';
      ctx.font = `${fontSize}px 'Fira Code', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head character is brighter white/green
        if (Math.random() > 0.8) {
          ctx.fillStyle = '#e0ffe0';
        } else {
          ctx.fillStyle = '#00ff55';
        }

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      onClick={onExit}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        backgroundColor: '#030804',
        cursor: 'pointer',
      }}
      title="Click or press any key to exit Matrix mode"
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '16px',
          color: '#00ff66',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          background: 'rgba(0,0,0,0.7)',
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #00ff66',
        }}
      >
        [ MATRIX RUNTIME ACTIVE — Click anywhere to exit ]
      </div>
    </div>
  );
};
