/* Lumière de persienne : un papier ivoire traversé par la lumière d'une fenêtre à volets.
   WebGL avec OGL, hébergé avec le site. Si WebGL manque, la version CSS reste en place. */
import { Renderer, Program, Mesh, Triangle } from '../vendor/ogl/ogl.js';

const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform vec3 uFond;
uniform vec3 uLumiere;
uniform vec3 uOmbre;
uniform float uForce;
uniform float uCentreX;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float bruit(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
void main() {
  float asp = uRes.x / uRes.y;
  vec2 p = vec2(vUv.x * asp, vUv.y);
  vec2 c = vec2((uCentreX + uMouse.x * 0.05) * asp, 0.52 + uMouse.y * 0.05);
  float a = -0.46 + uMouse.x * 0.07;
  mat2 r = mat2(cos(a), -sin(a), sin(a), cos(a));
  vec2 q = r * (p - c);
  vec2 dd = abs(q) - vec2(0.62, 0.44);
  float fenetre = 1.0 - smoothstep(-0.12, 0.22, max(dd.x, dd.y));
  float lames = 0.5 + 0.5 * sin(q.y * 52.0 + uTime * 0.22 + bruit(q * 2.6 + uTime * 0.03) * 1.4);
  lames = smoothstep(0.28, 0.78, lames);
  float montant = smoothstep(0.035, 0.0, abs(q.x)) * fenetre;
  float lumiere = fenetre * lames * (1.0 - montant * 0.9);
  lumiere *= 0.72 + 0.28 * bruit(p * 1.6 + uTime * 0.035);
  vec3 col = mix(uFond, uLumiere, lumiere * uForce);
  col = mix(col, uOmbre, (1.0 - fenetre) * 0.06);
  col += (hash(vUv * uRes + fract(uTime * 0.1)) - 0.5) * 0.025;
  gl_FragColor = vec4(col, 1.0);
}`;

const PALETTES = {
  jour: { fond: [0.965, 0.925, 0.859], lumiere: [1.0, 0.905, 0.72], ombre: [0.90, 0.82, 0.70], force: 0.85, centre: 0.74 },
  nuit: { fond: [0.047, 0.133, 0.2], lumiere: [0.953, 0.788, 0.643], ombre: [0.03, 0.09, 0.15], force: 0.22, centre: 0.78 },
};

export function lancer(canvas, mode, calme) {
  let renderer;
  try {
    renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio || 1, 1.5) * 0.75, alpha: false, antialias: false, powerPreference: 'low-power' });
  } catch (e) { return false; }
  const gl = renderer.gl;
  if (!gl) return false;
  const pal = PALETTES[mode] || PALETTES.jour;
  gl.clearColor(pal.fond[0], pal.fond[1], pal.fond[2], 1);
  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex, fragment,
    uniforms: {
      uTime: { value: 8 }, uRes: { value: [1, 1] }, uMouse: { value: [0, 0] },
      uFond: { value: pal.fond }, uLumiere: { value: pal.lumiere }, uOmbre: { value: pal.ombre },
      uForce: { value: pal.force }, uCentreX: { value: window.innerWidth < 900 ? 0.6 : pal.centre },
    },
  });
  const mesh = new Mesh(gl, { geometry, program });
  const parent = canvas.parentElement;
  const taille = () => {
    const w = parent.clientWidth, h = parent.clientHeight;
    renderer.setSize(w, h);
    canvas.style.width = '100%'; canvas.style.height = '100%';
    program.uniforms.uRes.value = [w, h];
    program.uniforms.uCentreX.value = window.innerWidth < 900 ? 0.6 : pal.centre;
    if (calme) renderer.render({ scene: mesh });
  };
  taille();
  if ('ResizeObserver' in window) new ResizeObserver(taille).observe(parent); else window.addEventListener('resize', taille);
  renderer.render({ scene: mesh });
  if (calme) return true;

  const cible = [0, 0], souris = [0, 0];
  window.addEventListener('pointermove', (e) => {
    const r = parent.getBoundingClientRect();
    cible[0] = ((e.clientX - r.left) / r.width - 0.5) * 2;
    cible[1] = -((e.clientY - r.top) / r.height - 0.5) * 2;
  }, { passive: true });
  let visible = true, raf = 0, t0 = performance.now();
  const boucle = (t) => {
    raf = 0;
    if (!visible || document.hidden) return;
    souris[0] += (cible[0] - souris[0]) * 0.035; souris[1] += (cible[1] - souris[1]) * 0.035;
    program.uniforms.uMouse.value = souris;
    program.uniforms.uTime.value = 8 + (t - t0) / 1000;
    renderer.render({ scene: mesh });
    raf = requestAnimationFrame(boucle);
  };
  const relancer = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(boucle); };
  if ('IntersectionObserver' in window) new IntersectionObserver((e) => { visible = e[0].isIntersecting; relancer(); }).observe(parent);
  document.addEventListener('visibilitychange', relancer);
  relancer();
  return true;
}
