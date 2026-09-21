import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../../core/audio/soundEngine';
import { SHADER_PRESETS } from './presets';
import { Play, Pause, RotateCcw, Download, Sparkles, AlertCircle } from 'lucide-react';

const DEFAULT_SHADER = `precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_audio;

void main() {
    vec2 st = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    float d = length(st);
    
    // Cyberpunk Neon Pulsing Tunnel
    float angle = atan(st.y, st.x);
    float waves = sin(d * 12.0 - u_time * 3.0 + angle * 3.0);
    waves += sin(d * 24.0 + u_time * 2.0) * (0.3 + u_audio * 0.8);
    
    vec3 col = vec3(0.0);
    col.r = 0.5 + 0.5 * sin(u_time * 0.5 + d * 4.0 + 0.0);
    col.g = 0.5 + 0.5 * sin(u_time * 0.5 + d * 4.0 + 2.0);
    col.b = 0.5 + 0.5 * sin(u_time * 0.5 + d * 4.0 + 4.0);
    
    // Add neon glow ring
    float ring = 0.015 / abs(sin(d * 6.0 - u_time * 2.0));
    col += vec3(0.0, 0.95, 1.0) * ring * (1.0 + u_audio * 1.5);
    
    gl_FragColor = vec4(col * (1.0 - d * 0.4), 1.0);
}`;

export const ShaderForge: React.FC = () => {
  const [code, setCode] = useState(DEFAULT_SHADER);
  const [isPlaying, setIsPlaying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });

  // WebGL initialization & shader compilation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      setError('WebGL not supported');
      return;
    }
    glRef.current = gl;

    // Fullscreen quad buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const compile = (fragmentSource: string) => {
      // Vertex shader
      const vs = gl.createShader(gl.VERTEX_SHADER)!;
      gl.shaderSource(vs, vertexShaderSource);
      gl.compileShader(vs);

      // Fragment shader
      const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(fs, fragmentSource);
      gl.compileShader(fs);

      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(fs);
        setError(info || 'Shader compile error');
        return;
      }

      // Link program
      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);

      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        setError(gl.getProgramInfoLog(prog) || 'Link error');
        return;
      }

      setError(null);
      programRef.current = prog;

      const posAttr = gl.getAttribLocation(prog, 'a_position');
      gl.enableVertexAttribArray(posAttr);
      gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
    };

    compile(code);
  }, [code]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    if (!canvas || !gl) return;

    const render = () => {
      if (programRef.current && isPlaying) {
        const prog = programRef.current;
        gl.useProgram(prog);

        const timeSec = (performance.now() - startTimeRef.current) / 1000.0;
        const resLoc = gl.getUniformLocation(prog, 'u_resolution');
        const timeLoc = gl.getUniformLocation(prog, 'u_time');
        const mouseLoc = gl.getUniformLocation(prog, 'u_mouse');
        const audioLoc = gl.getUniformLocation(prog, 'u_audio');

        gl.uniform2f(resLoc, canvas.width, canvas.height);
        gl.uniform1f(timeLoc, timeSec);
        gl.uniform2f(mouseLoc, mousePosRef.current.x, mousePosRef.current.y);

        // Sample audio amplitude
        let audioVol = 0;
        const analyser = sound.getAnalyser();
        if (analyser) {
          const data = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          audioVol = Math.sqrt(sum / data.length);
        }
        gl.uniform1f(audioLoc, audioVol);

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mousePosRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: 1.0 - (e.clientY - rect.top) / rect.height,
    };
  };

  const handleResetTime = () => {
    startTimeRef.current = performance.now();
    sound.playClick();
  };

  const handleSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    sound.playSuccess();
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'shaderforge-render.png';
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px', gap: '12px', backgroundColor: 'rgba(6, 7, 14, 0.95)', color: '#e0f7fa' }}>
      {/* Controls Header */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => {
              sound.playClick();
              setIsPlaying(!isPlaying);
            }}
            className={`btn-cyber ${isPlaying ? 'btn-cyber-primary' : ''}`}
            style={{ height: '28px' }}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button onClick={handleResetTime} className="btn-cyber" style={{ height: '28px' }} title="Reset Timer">
            <RotateCcw size={13} />
          </button>

          <button onClick={handleSnapshot} className="btn-cyber" style={{ height: '28px' }} title="Export Render PNG">
            <Download size={13} />
            <span>Snapshot</span>
          </button>
        </div>

        {/* Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Preset:</span>
          {SHADER_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                sound.playSuccess();
                setCode(p.code);
                startTimeRef.current = performance.now();
              }}
              className="btn-cyber"
              style={{ fontSize: '10px', padding: '2px 6px' }}
            >
              {p.name}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--error)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <AlertCircle size={13} />
            <span style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{error}</span>
          </div>
        )}
      </div>

      {/* Editor & WebGL Viewport Split */}
      <div style={{ flex: 1, display: 'flex', gap: '12px', overflow: 'hidden' }}>
        {/* GLSL Code Editor */}
        <div
          className="glass-panel"
          style={{
            flex: 1,
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#04050a',
          }}
        >
          <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-color)', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
            FRAGMENT SHADER (GLSL)
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#d0edf2',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              lineHeight: '1.4',
              resize: 'none',
              whiteSpace: 'pre',
            }}
          />
        </div>

        {/* WebGL Viewport */}
        <div
          className="glass-panel"
          style={{
            flex: 1,
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#000000',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <canvas
            ref={canvasRef}
            width={512}
            height={512}
            onMouseMove={handleMouseMove}
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
          />
          <div style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '10px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '3px' }}>
            60 FPS • WebGL Real-time
          </div>
        </div>
      </div>
    </div>
  );
};
