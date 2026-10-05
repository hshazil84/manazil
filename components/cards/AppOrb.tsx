'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * The Verse Finder orb, drawn by the same shader the app uses
 * (assets/shaders/orb.frag), ported from Flutter's GLSL to WebGL.
 * `energy` is 0.2 idle, 0.6 while finding the verse and 1 while listening;
 * the orb eases toward it and its clock runs faster the livelier it is.
 */

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uSize;
uniform float uTime;

vec3 rgb2yiq(vec3 c){return vec3(dot(c,vec3(0.299,0.587,0.114)),dot(c,vec3(0.596,-0.274,-0.322)),dot(c,vec3(0.211,-0.523,0.312)));}
vec3 yiq2rgb(vec3 c){return vec3(c.x+0.956*c.y+0.621*c.z,c.x-0.272*c.y-0.647*c.z,c.x-1.106*c.y+1.703*c.z);}

vec3 hash33(vec3 p3){
  p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
  p3 += dot(p3, p3.yxz + 19.19);
  return -1.0 + 2.0 * fract(vec3(p3.x + p3.y, p3.x + p3.z, p3.y + p3.z) * p3.zyx);
}
float snoise3(vec3 p){
  const float K1 = 0.333333333;
  const float K2 = 0.166666667;
  vec3 i = floor(p + (p.x + p.y + p.z) * K1);
  vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
  vec3 e = step(vec3(0.0), d0 - d0.yzx);
  vec3 i1 = e * (1.0 - e.zxy);
  vec3 i2 = 1.0 - e.zxy * (1.0 - e);
  vec3 d1 = d0 - (i1 - K2);
  vec3 d2 = d0 - (i2 - K1);
  vec3 d3 = d0 - 0.5;
  vec4 h = max(0.6 - vec4(dot(d0,d0), dot(d1,d1), dot(d2,d2), dot(d3,d3)), 0.0);
  vec4 n = h*h*h*h * vec4(dot(d0,hash33(i)), dot(d1,hash33(i+i1)), dot(d2,hash33(i+i2)), dot(d3,hash33(i+1.0)));
  return dot(vec4(31.316), n);
}
vec4 extractAlpha(vec3 c){ float a = max(max(c.r,c.g),c.b); return vec4(c.rgb/(a+1e-5), a); }

const float innerRadius = 0.6;
const float noiseScale = 0.65;
float light1(float i, float att, float d){ return i / (1.0 + d * att); }
float light2(float i, float att, float d){ return i / (1.0 + d * d * att); }

vec4 draw(vec2 uv, vec3 color1, vec3 color2, vec3 color3){
  float ang = atan(uv.y, uv.x);
  float len = length(uv);
  float invLen = len > 0.0 ? 1.0 / len : 0.0;
  float n0 = snoise3(vec3(uv * noiseScale, uTime * 0.5)) * 0.5 + 0.5;
  float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
  float d0 = distance(uv, (r0 * invLen) * uv);
  float v0 = light1(1.0, 10.0, d0);
  v0 *= smoothstep(r0 * 1.05, r0, len);
  float cl = cos(ang + uTime * 2.0) * 0.5 + 0.5;
  float a = uTime * -1.0;
  vec2 pos = vec2(cos(a), sin(a)) * r0;
  float d = distance(uv, pos);
  float v1 = light2(1.5, 5.0, d);
  v1 *= light1(1.0, 50.0, d0);
  float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
  float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);
  vec3 col = mix(color1, color2, cl);
  col = mix(color3, col, v0);
  col = (col + v1) * v2 * v3;
  col = clamp(col, 0.0, 1.0);
  return extractAlpha(col);
}

void main(){
  vec2 frag = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  float size = min(uSize.x, uSize.y);
  vec2 uv = (frag - uSize * 0.5) / size * 2.0;
  // The "clear" variant the app uses on light screens (uHue <= -900).
  vec3 color1 = vec3(0.910, 0.722, 0.290);
  vec3 color2 = vec3(0.831, 0.627, 0.188);
  vec3 color3 = vec3(0.0);
  vec4 col = draw(uv, color1, color2, color3);
  gl_FragColor = vec4(col.rgb * col.a, col.a);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
  return s;
}

export function AppOrb({ energy = 0.2, size = 150 }: { energy?: number; size?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const target = useRef(energy);
  const [failed, setFailed] = useState(false);
  target.current = energy;

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    try {
      const gl = el.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true });
      if (!gl) throw new Error('no webgl');
      const prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const uSize = gl.getUniformLocation(prog, 'uSize');
      const uTime = gl.getUniformLocation(prog, 'uTime');

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(size * dpr);
      el.height = Math.round(size * dpr);
      gl.viewport(0, 0, el.width, el.height);
      gl.uniform2f(uSize, el.width, el.height);
      gl.clearColor(0, 0, 0, 0);

      let t = 2.3; // a nice-looking starting moment
      let e = target.current;
      let last = performance.now();
      let visible = true;
      const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 });
      io.observe(el);

      const frame = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        if (visible) {
          e += (target.current - e) * Math.min(1, dt * 3);
          if (!reduce) t += dt * (0.55 + 1.5 * e);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.uniform1f(uTime, t);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
      return () => { cancelAnimationFrame(raf); io.disconnect(); };
    } catch (err) {
      console.warn('AppOrb fallback:', err);
      setFailed(true);
    }
  }, [size]);

  if (failed) {
    return (
      <div
        style={{
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 28%, #fff 0%, #f3d99a 28%, #D4A030 62%, #0f2a24 130%)',
        }}
      />
    );
  }
  return <canvas ref={canvas} style={{ width: size, height: size }} aria-hidden />;
}
