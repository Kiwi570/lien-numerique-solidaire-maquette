/* Lumière de persienne : un papier ivoire traversé par la lumière d'une fenêtre à volets.
   WebGL brut (un seul triangle plein écran), sans bibliothèque. Limité à 30 images par seconde,
   remplacé par la version CSS sur les écrans tactiles, en économie de données et en mode calme.
   Si WebGL manque, la version CSS reste en place. */

const VERTEX = `
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }`;

const FRAGMENT = `
precision mediump float;
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
  gl_FragColor = vec4(col, 1.0);
}`;

const PALETTES = {
  jour: { fond: [0.965, 0.925, 0.859], lumiere: [1.0, 0.905, 0.72], ombre: [0.90, 0.82, 0.70], force: 0.85, centre: 0.74 },
  nuit: { fond: [0.047, 0.133, 0.2], lumiere: [0.953, 0.788, 0.643], ombre: [0.03, 0.09, 0.15], force: 0.22, centre: 0.78 },
};

function shader(gl, type, source) {
  const s = gl.createShader(type);
  gl.shaderSource(s, source); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

export function lancer(canvas, mode, calme) {
  /* Figé (tactile, économie de données, mode calme) : pas de WebGL. Un canvas dessiné une seule fois
     perd son tampon au défilement et s'affiche en noir ; la version CSS reste en place. */
  const economie = (navigator.connection && navigator.connection.saveData) || matchMedia('(pointer: coarse)').matches;
  if (calme || economie) return false;
  let gl;
  try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false }); } catch (e) { return false; }
  if (!gl) return false;
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, shader(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(prog, shader(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
  } catch (e) { return false; }
  gl.useProgram(prog);
  const tampon = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tampon);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(prog, n);
  const pal = PALETTES[mode] || PALETTES.jour;
  gl.uniform3fv(U('uFond'), pal.fond); gl.uniform3fv(U('uLumiere'), pal.lumiere); gl.uniform3fv(U('uOmbre'), pal.ombre);
  gl.uniform1f(U('uForce'), pal.force);
  const uTime = U('uTime'), uRes = U('uRes'), uMouse = U('uMouse'), uCentre = U('uCentreX');

  const parent = canvas.parentElement;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;
  const souris = [0, 0], cible = [0, 0];
  let t0 = performance.now(), dernier = 0, raf = 0, visible = true;

  const dessiner = (t) => {
    gl.uniform1f(uTime, 8 + (t - t0) / 1000);
    gl.uniform2f(uMouse, souris[0], souris[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const taille = () => {
    const w = parent.clientWidth, h = parent.clientHeight;
    canvas.width = Math.max(1, Math.round(w * dpr)); canvas.height = Math.max(1, Math.round(h * dpr));
    canvas.style.width = '100%'; canvas.style.height = '100%';
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, w, h);
    gl.uniform1f(uCentre, window.innerWidth < 900 ? 0.6 : pal.centre);
    dessiner(performance.now());
  };
  taille();
  if ('ResizeObserver' in window) new ResizeObserver(taille).observe(parent); else window.addEventListener('resize', taille);

  window.addEventListener('pointermove', (e) => {
    const r = parent.getBoundingClientRect();
    cible[0] = ((e.clientX - r.left) / r.width - 0.5) * 2;
    cible[1] = -((e.clientY - r.top) / r.height - 0.5) * 2;
  }, { passive: true });
  const boucle = (t) => {
    raf = 0;
    if (!visible || document.hidden) return;
    raf = requestAnimationFrame(boucle);
    if (t - dernier < 33) return;           // 30 images par seconde suffisent pour une lumière lente
    dernier = t;
    souris[0] += (cible[0] - souris[0]) * 0.06; souris[1] += (cible[1] - souris[1]) * 0.06;
    dessiner(t);
  };
  const relancer = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(boucle); };
  if ('IntersectionObserver' in window) new IntersectionObserver((e) => { visible = e[0].isIntersecting; relancer(); }).observe(parent);
  document.addEventListener('visibilitychange', relancer);
  relancer();
  return true;
}
