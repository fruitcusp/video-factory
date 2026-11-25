import React, {useEffect, useMemo, useRef, useState} from 'react';
import {delayRender, continueRender} from 'remotion';
import gsap from 'gsap';
import anime from 'animejs';
import {SpringValue} from '@react-spring/web';
import {Application, Graphics} from 'pixi.js';
import p5 from 'p5';
import {Engine, Bodies, Composite} from 'matter-js';
import {scaleLinear} from 'd3-scale';
import {line, area, curveMonotoneX} from 'd3-shape';
import {Canvas, useThree} from '@react-three/fiber';
import type {VisualProps} from './Preview';
import {FONT} from './Preview';

// Cac hinh trung tam dung ENGINE THAT (thu vien goc, khong sua ruot):
// moi hinh la ham thuan theo khung hinh (tat dinh), dung duoc trong
// day render Remotion. Canvas (Pixi/p5/Three) ve dong bo theo tung
// khung kem delayRender de cho dung khung da ve xong moi chup.

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// ---------------- GSAP: timeline seek theo dung khung ----------------
export const VisualGsap: React.FC<VisualProps> = ({local, scene}) => {
  const o = useMemo(() => {
    const s = {x: 70, y: 330, sc: 0.4, r: 0};
    const tl = gsap.timeline({paused: true});
    tl.to(s, {x: 360, duration: 0.9, ease: 'power2.out'})
      .to(s, {y: 130, sc: 1, duration: 0.7, ease: 'back.out(2.2)'}, '-=0.3')
      .to(s, {r: 360, duration: 0.8, ease: 'power1.inOut'}, '-=0.25');
    tl.seek(local / 30, false);
    return {...s};
  }, [local]);
  return (
    <svg width="560" height="560" viewBox="0 0 560 560">
      <line x1="60" y1="430" x2="500" y2="430" stroke="#3a4a6b" strokeWidth="3" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={110 + i * 40} cy="330" r="7" fill="#2f7bff" opacity={0.25 + i * 0.2} />
      ))}
      <g transform={`translate(${o.x} ${o.y}) rotate(${o.r}) scale(${o.sc})`}>
        <rect x="-70" y="-70" width="140" height="140" rx="26" fill="#8be04e" />
        <text x="0" y="14" textAnchor="middle" fontFamily={FONT} fontSize="44" fontWeight="800" fill="#10240a">
          {scene % 2 === 0 ? 'GSAP' : 'GO!'}
        </text>
      </g>
      <text x="280" y="500" textAnchor="middle" fontFamily={FONT} fontSize="34" fontWeight="700" fill="#dfe8ff">
        {scene % 2 === 0 ? 'quỹ đạo theo dòng thời gian' : 'mượt mà từng khung'}
      </text>
    </svg>
  );
};

// ---------------- Anime.js: instance seek theo dung khung ----------------
export const VisualAnime: React.FC<VisualProps> = ({local, scene}) => {
  const p = useMemo(() => {
    const t = {v: 0};
    const inst = anime({
      targets: t,
      v: 100,
      duration: 2100,
      easing: 'easeOutElastic(1, .55)',
      autoplay: false,
    });
    inst.seek((local / 30) * 1000);
    return t.v;
  }, [local]);
  const dots = [];
  const N = 12;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = 60 + (p / 100) * 130;
    dots.push(
      <circle key={i} cx={280 + Math.cos(a) * r} cy={250 + Math.sin(a) * r} r={10 + (p / 100) * 8} fill={i % 2 ? '#ff7a1a' : '#2f7bff'} />,
    );
  }
  return (
    <svg width="560" height="560" viewBox="0 0 560 560">
      {dots}
      <text x="280" y="272" textAnchor="middle" fontFamily={FONT} fontSize="72" fontWeight="800" fill="#ffffff">
        {Math.round(p)}
      </text>
      <text x="280" y="490" textAnchor="middle" fontFamily={FONT} fontSize="34" fontWeight="700" fill="#ffd9ae">
        {scene % 2 === 0 ? 'đàn hồi kiểu lò xo' : 'số đếm sống động'}
      </text>
    </svg>
  );
};

// ---------------- React Spring: vat ly lo xo, day tay bang advance() ----------------
export const VisualSpring: React.FC<VisualProps> = ({local, scene}) => {
  const v = useMemo(() => {
    const sv = new SpringValue(0);
    sv.start(1, {config: {tension: 160, friction: 13}});
    const steps = Math.min(local, 150);
    for (let i = 0; i < steps; i++) sv.advance(1000 / 30);
    const val = sv.get();
    sv.stop();
    return val;
  }, [local]);
  const v2 = useMemo(() => {
    const sv = new SpringValue(0);
    sv.start(1, {config: {tension: 90, friction: 8}});
    const steps = Math.min(local, 150);
    for (let i = 0; i < steps; i++) sv.advance(1000 / 30);
    const val = sv.get();
    sv.stop();
    return val;
  }, [local]);
  return (
    <svg width="560" height="560" viewBox="0 0 560 560">
      <circle cx="200" cy="240" r={Math.max(8, 95 * v)} fill="#e879f9" />
      <circle cx="370" cy="240" r={Math.max(8, 70 * v2)} fill="#22d3ee" />
      <rect x={110 + 250 * clamp01(v)} y="400" width="60" height="26" rx="13" fill="#facc15" />
      <line x1="80" y1="413" x2="480" y2="413" stroke="#475569" strokeWidth="3" />
      <text x="280" y="500" textAnchor="middle" fontFamily={FONT} fontSize="34" fontWeight="700" fill="#e2e8f0">
        {scene % 2 === 0 ? 'nảy thật như lò xo' : 'vật lý pegas mềm'}
      </text>
    </svg>
  );
};

// ---------------- PixiJS: canvas 2D toc do cao, ve theo tung khung ----------------
function drawPixi(app: Application, local: number, scene: number) {
  const stage = app.stage;
  while (stage.children.length) {
    const c = stage.children[0];
    stage.removeChild(c);
    c.destroy();
  }
  const g = new Graphics();
  const cx = 280;
  const cy = 250;
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2 + local * 0.03;
    const r = 70 + 90 * (0.5 + 0.5 * Math.sin(local * 0.09 + i));
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    g.circle(x, y, 7 + 5 * Math.sin(local * 0.15 + i * 1.7) ** 2).fill(i % 3 === 0 ? 0xffd94d : i % 3 === 1 ? 0x22d3ee : 0xe879f9);
  }
  g.circle(cx, cy, 34 + 6 * Math.sin(local * 0.12)).fill(0xffffff);
  g.star(cx, cy, 5, 120 + 20 * Math.sin(local * 0.07), 55).stroke({width: 4, color: 0x22d3ee});
  stage.addChild(g);
  app.renderer.render(stage);
}

export const VisualPixi: React.FC<VisualProps> = ({local, scene}) => {
  const ref = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const [initHandle] = useState(() => delayRender('pixi-init'));
  useEffect(() => {
    let dead = false;
    (async () => {
      const app = new Application();
      await app.init({width: 560, height: 560, backgroundAlpha: 0, antialias: true, preserveDrawingBuffer: true});
      if (dead) return;
      appRef.current = app;
      ref.current?.appendChild(app.canvas);
      drawPixi(app, 0, scene);
      continueRender(initHandle);
    })();
    return () => {
      dead = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    const h = delayRender('pixi-frame');
    drawPixi(app, local, scene);
    continueRender(h);
  }, [local, scene]);
  return <div ref={ref} style={{width: 560, height: 560}} />;
};

// ---------------- p5.js: ve sinh dong, che do noLoop + ve tay tung khung ----------------
export const VisualP5: React.FC<VisualProps> = ({local, scene}) => {
  const ref = useRef<HTMLDivElement>(null);
  const instRef = useRef<p5 | null>(null);
  const readyRef = useRef(false);
  const [initHandle] = useState(() => delayRender('p5-init'));
  useEffect(() => {
    if (!ref.current) return;
    const inst = new p5((p: p5) => {
      p.setup = () => {
        p.createCanvas(560, 560);
        p.noLoop();
        readyRef.current = true;
        drawP5(p, 0, scene);
        continueRender(initHandle);
      };
    }, ref.current);
    instRef.current = inst;
    return () => {
      inst.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const p = instRef.current;
    if (!p || !readyRef.current) return;
    const h = delayRender('p5-frame');
    drawP5(p, local, scene);
    continueRender(h);
  }, [local, scene]);
  return <div ref={ref} style={{width: 560, height: 560}} />;
};

function drawP5(p: p5, local: number, scene: number) {
  p.clear();
  p.noStroke();
  const cols: [number, number, number][] = [
    [47, 123, 255],
    [255, 122, 26],
    [63, 214, 143],
    [232, 121, 249],
  ];
  for (let i = 0; i < 42; i++) {
    const a = i * 0.7 + local * 0.02;
    const r = 30 + i * 4.4 * (0.4 + 0.6 * clamp01(local / 50));
    const x = 280 + Math.cos(a) * r;
    const y = 250 + Math.sin(a * 1.3) * r * 0.72;
    const c = cols[i % 4];
    p.fill(c[0], c[1], c[2], 200);
    p.circle(x, y, 9 + 7 * Math.sin(local * 0.1 + i));
  }
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(30);
  p.textStyle(p.BOLD);
  p.text(scene % 2 === 0 ? 'xoáy sáng tạo' : 'thuật toán vẽ', 280, 500);
}

// ---------------- Matter.js: mo phong vat ly tat dinh theo so buoc ----------------
export const VisualMatter: React.FC<VisualProps> = ({local, scene}) => {
  const balls = useMemo(() => {
    const engine = Engine.create();
    const list = [...Array(7)].map((_, i) =>
      Bodies.circle(110 + i * 58, 30 + (i % 3) * 44, 21, {restitution: 0.82, friction: 0.04, frictionAir: 0.008}),
    );
    const ground = Bodies.rectangle(280, 470, 520, 26, {isStatic: true});
    const wallL = Bodies.rectangle(16, 260, 22, 470, {isStatic: true});
    const wallR = Bodies.rectangle(544, 260, 22, 470, {isStatic: true});
    const ledge = Bodies.rectangle(280, 300, 190, 16, {isStatic: true, angle: 0.16});
    Composite.add(engine.world, [...list, ground, wallL, wallR, ledge]);
    const steps = Math.min(local, 170);
    for (let i = 0; i < steps; i++) Engine.update(engine, 1000 / 60);
    const out = list.map((b) => ({x: b.position.x, y: b.position.y, a: b.angle}));
    Engine.clear(engine);
    return out;
  }, [local]);
  const fills = ['#ffd94d', '#2f7bff', '#ff7a1a', '#3fd68f', '#e879f9', '#22d3ee', '#f87171'];
  return (
    <svg width="560" height="560" viewBox="0 0 560 560">
      <rect x="20" y="457" width="520" height="26" fill="#334155" />
      <g transform="translate(280 300) rotate(9.2)">
        <rect x="-95" y="-8" width="190" height="16" fill="#475569" />
      </g>
      {balls.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${(b.a * 180) / Math.PI})`}>
          <circle r="21" fill={fills[i]} />
          <line x1="-13" y1="0" x2="13" y2="0" stroke="#0f172a" strokeWidth="4" />
        </g>
      ))}
      <text x="280" y="530" textAnchor="middle" fontFamily={FONT} fontSize="32" fontWeight="700" fill="#e2e8f0">
        {scene % 2 === 0 ? 'rơi, nảy, va chạm thật' : 'vật lý 2D sống'}
      </text>
    </svg>
  );
};

// ---------------- D3: duong du lieu bang d3-scale + d3-shape ----------------
export const VisualD3: React.FC<VisualProps> = ({local, scene}) => {
  const {path, areaPath, pts, ticks} = useMemo(() => {
    const data = [12, 26, 21, 38, 34, 52, 47, 66, 61, 82, 95];
    const reveal = 1 + Math.floor(clamp01((local - 4) / 52) * (data.length - 1));
    const shown = data.slice(0, reveal);
    const x = scaleLinear().domain([0, data.length - 1]).range([70, 500]);
    const y = scaleLinear().domain([0, 100]).range([400, 90]);
    const lineGen = line<number>().x((_, i) => x(i)).y((d) => y(d)).curve(curveMonotoneX);
    const areaGen = area<number>().x((_, i) => x(i)).y0(400).y1((d) => y(d)).curve(curveMonotoneX);
    return {
      path: lineGen(shown) || '',
      areaPath: areaGen(shown) || '',
      pts: shown.map((d, i) => ({cx: x(i), cy: y(d), v: d})),
      ticks: y.ticks(4).map((t) => ({v: t, y: y(t)})),
    };
  }, [local]);
  const last = pts[pts.length - 1];
  return (
    <svg width="560" height="560" viewBox="0 0 560 560">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1="70" y1={t.y} x2="500" y2={t.y} stroke="#26355c" strokeWidth="1.5" />
          <text x="58" y={t.y + 6} textAnchor="end" fontFamily={FONT} fontSize="22" fill="#8ea6d8">
            {t.v}
          </text>
        </g>
      ))}
      <path d={areaPath} fill="#2f7bff" opacity="0.25" />
      <path d={path} fill="none" stroke="#2f7bff" strokeWidth="6" strokeLinejoin="round" />
      {pts.map((pt, i) => (
        <circle key={i} cx={pt.cx} cy={pt.cy} r="7" fill="#ffd94d" />
      ))}
      {last ? (
        <text x={Math.min(last.cx, 470)} y={last.cy - 22} textAnchor="middle" fontFamily={FONT} fontSize="40" fontWeight="800" fill="#ffffff">
          {last.v}
        </text>
      ) : null}
      <text x="280" y="500" textAnchor="middle" fontFamily={FONT} fontSize="34" fontWeight="700" fill="#dfe8ff">
        {scene % 2 === 0 ? 'số liệu biết kể chuyện' : 'biểu đồ tự vẽ dần'}
      </text>
    </svg>
  );
};

// ---------------- Three.js (R3F): 3D that, advance theo khung Remotion ----------------
const ThreeAdvance: React.FC<{local: number}> = ({local}) => {
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    const h = delayRender('three-frame');
    advance(local / 30);
    continueRender(h);
  }, [local, advance]);
  return null;
};

export const VisualThree: React.FC<VisualProps> = ({local, scene}) => {
  const rot: [number, number, number] = [local * 0.021, local * 0.033, 0];
  const bobY = Math.sin(local * 0.07) * 0.35;
  return (
    <div style={{width: 560, height: 560}}>
      <Canvas frameloop="never" gl={{antialias: true, preserveDrawingBuffer: true}} camera={{position: [0, 0, 8], fov: 50}}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 6]} intensity={1.6} />
        <ThreeAdvance local={local} />
        <mesh rotation={rot} position={[-1.5, bobY, 0]}>
          <boxGeometry args={[1.9, 1.9, 1.9]} />
          <meshStandardMaterial color="#2f7bff" />
        </mesh>
        <mesh rotation={[rot[1], rot[0], 0]} position={[1.7, -bobY, 0]}>
          <icosahedronGeometry args={[1.25, 0]} />
          <meshStandardMaterial color="#ff7a1a" flatShading />
        </mesh>
        <mesh rotation={[Math.PI / 2.4, 0, local * 0.02]} position={[0, -2.1, 0]}>
          <torusGeometry args={[1.5, 0.32, 14, 36]} />
          <meshStandardMaterial color="#3fd68f" />
        </mesh>
      </Canvas>
      <div
        style={{
          marginTop: -64,
          textAlign: 'center',
          color: '#e2e8f0',
          fontFamily: FONT,
          fontSize: 32,
          fontWeight: 700,
        }}
      >
        {scene % 2 === 0 ? 'vật thể 3D xoay thật' : 'không gian ba chiều'}
      </div>
    </div>
  );
};
