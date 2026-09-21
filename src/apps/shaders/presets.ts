export interface ShaderPreset {
  id: string;
  name: string;
  code: string;
}

export const SHADER_PRESETS: ShaderPreset[] = [
  {
    id: 'cyber-tunnel',
    name: 'Cyber Tunnel',
    code: `precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_audio;

void main() {
    vec2 st = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    float d = length(st);
    float angle = atan(st.y, st.x);
    
    float waves = sin(d * 14.0 - u_time * 4.0 + angle * 4.0);
    waves += sin(d * 28.0 + u_time * 3.0) * (0.3 + u_audio * 1.2);
    
    vec3 col = vec3(0.0);
    col.r = 0.5 + 0.5 * sin(u_time * 0.7 + d * 5.0 + 0.0);
    col.g = 0.5 + 0.5 * sin(u_time * 0.7 + d * 5.0 + 2.0);
    col.b = 0.5 + 0.5 * sin(u_time * 0.7 + d * 5.0 + 4.0);
    
    float ring = 0.02 / abs(sin(d * 8.0 - u_time * 2.5));
    col += vec3(0.0, 0.95, 1.0) * ring * (1.0 + u_audio * 2.0);
    
    gl_FragColor = vec4(col * (1.0 - d * 0.35), 1.0);
}`,
  },
  {
    id: 'retro-synthwave',
    name: 'Neon Grid Horizon',
    code: `precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_audio;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;

    vec3 col = vec3(0.05, 0.02, 0.12);

    // Horizon Sun
    vec2 sunPos = vec2(0.0, 0.15);
    float dSun = length(p - sunPos);
    if (dSun < 0.35) {
        float sunGrad = (0.35 - dSun) / 0.35;
        col = mix(vec3(1.0, 0.8, 0.1), vec3(1.0, 0.0, 0.5), uv.y * 2.0);
        // Sun horizontal stripes
        if (sin((p.y - sunPos.y) * 60.0) < -0.2 && p.y < sunPos.y) {
            col *= 0.1;
        }
    }

    // Grid Floor
    if (p.y < 0.0) {
        vec3 coord = vec3(p.x / -p.y, 1.0 / -p.y + u_time * (1.5 + u_audio * 2.0), 0.0);
        vec2 grid = abs(fract(coord.xy - 0.5) - 0.5) / fwidth(coord.xy);
        float line = min(grid.x, grid.y);
        float c = 1.0 - min(line, 1.0);
        col += vec3(0.0, 0.9, 1.0) * c * (-p.y * 1.8);
    }

    gl_FragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'cosmic-plasma',
    name: 'Cosmic Plasma',
    code: `precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_audio;

void main() {
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    float t = u_time * 0.8;

    float v1 = sin(p.x * 5.0 + t);
    float v2 = sin(5.0 * (p.x * sin(t / 2.0) + p.y * cos(t / 3.0)) + t);
    float cx = p.x + 0.5 * sin(t / 5.0);
    float cy = p.y + 0.5 * cos(t / 3.0);
    float v3 = sin(sqrt(100.0 * (cx * cx + cy * cy) + 1.0) + t);

    float v = v1 + v2 + v3;
    vec3 col = vec3(sin(v * 3.1415), cos(v * 3.1415), sin(v * 3.1415 + 2.0));
    col = col * 0.5 + 0.5;
    col += vec3(0.1, 0.3, 0.5) * (u_audio * 2.5);

    gl_FragColor = vec4(col, 1.0);
}`,
  },
];
