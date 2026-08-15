"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Particle {
  x: number;
  y: number;
  tx: number; // 目标：文字采样位置
  ty: number;
  sx: number; // 散开位置
  sy: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
  depth: number; // 视差深度
  vx: number; // 鼠标推开速度
  vy: number;
}

// 设计系统贴纸色（DESIGN.md）：白 + 天蓝 + 浅紫 + 粉 + 青
const PALETTE = ["#ffffff", "#62aef0", "#d6b6f6", "#ff64c8", "#2a9d99"];

function sampleTextParticles(
  text: string,
  font: string,
  maxW: number,
  maxH: number,
  stride = 3
): { points: { x: number; y: number }[]; w: number; h: number } {
  const off = document.createElement("canvas");
  off.width = maxW;
  off.height = maxH;
  const octx = off.getContext("2d", { willReadFrequently: true });
  if (!octx) return { points: [], w: 0, h: 0 };

  octx.fillStyle = "#fff";
  octx.font = font;
  octx.textAlign = "center";
  octx.textBaseline = "middle";
  octx.fillText(text, maxW / 2, maxH / 2);

  const data = octx.getImageData(0, 0, maxW, maxH).data;
  const points: { x: number; y: number }[] = [];
  for (let y = 0; y < maxH; y += stride) {
    for (let x = 0; x < maxW; x += stride) {
      const idx = (y * maxW + x) * 4 + 3;
      if (data[idx] > 128) points.push({ x, y });
    }
  }
  return { points, w: maxW, h: maxH };
}

export default function ParticleHero({ title = "我的知识库" }: { title?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      const section = sectionRef.current;
      if (!canvas || !section) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let raf = 0;
      let particles: Particle[] = [];
      let scrollProgress = 0; // 滚动：0=聚合 1=散开
      let assembled = 0; // 入场聚合进度：0=散开 1=聚合
      const mouse = { x: -9999, y: -9999 };

      const build = () => {
        const w = section.clientWidth;
        const h = section.clientHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const isMobile = w < 640;
        const fontSize = isMobile ? Math.floor(w / 5.5) : Math.floor(w / 7);
        const font = `700 ${fontSize}px "NotionInter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`;
        const { points } = sampleTextParticles(title, font, w, h, isMobile ? 4 : 3);

        particles = points.map((p) => {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * Math.max(w, h) * 0.6 + 60;
          return {
            x: p.x,
            y: p.y,
            tx: p.x,
            ty: p.y,
            sx: p.x + Math.cos(angle) * dist,
            sy: p.y + Math.sin(angle) * dist * 0.7 + h * 0.5,
            size: Math.random() * 2.2 + 0.8,
            color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.04,
            depth: Math.random() * 0.6 + 0.4,
            vx: 0,
            vy: 0,
          };
        });
      };

      const draw = () => {
        const w = section.clientWidth;
        const h = section.clientHeight;
        ctx.clearRect(0, 0, w, h);

        const scrollEase = scrollProgress * scrollProgress * (3 - 2 * scrollProgress);
        const assembleEase = assembled * assembled * (3 - 2 * assembled);

        for (const p of particles) {
          // 鼠标推开（仅当已聚合）
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          const pushRadius = 110;
          if (mdist < pushRadius && assembled > 0.3) {
            const force = ((pushRadius - mdist) / pushRadius) * 3.2;
            p.vx += (mdx / (mdist || 1)) * force;
            p.vy += (mdy / (mdist || 1)) * force;
          }
          p.vx *= 0.88;
          p.vy *= 0.88;
          p.x += p.vx;
          p.y += p.vy;

          // 聚合到文字 + 滚动散开
          const targetX = p.tx;
          const targetY = p.ty;
          const sx = p.sx;
          const sy = p.sy;
          // 未入场时在散开位置，入场后向文字聚合，滚动后再次散开
          const mix = assembleEase * (1 - scrollEase);
          const x = sx + (targetX - sx) * mix;
          const y = sy + (targetY - sy) * mix;

          // 鼠标偏移后回到目标
          p.x += (x - p.x) * 0.12;
          p.y += (y - p.y) * 0.12;

          p.rot += p.vr;
          const tw = p.size * (1 + (1 - mix) * 0.9);
          const alpha = 0.25 + mix * 0.75;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.shadowBlur = p.size * 6;
          ctx.shadowColor = p.color;
          ctx.fillRect(-tw / 2, -tw / 2, tw, tw);
          ctx.restore();
        }
        ctx.shadowBlur = 0;

        raf = requestAnimationFrame(draw);
      };

      // 滚动：hero 离开视口时粒子散开
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: 1.2,
        onUpdate: (self) => {
          scrollProgress = self.progress;
        },
      });

      // 入场：粒子从散开聚合到文字（GSAP 驱动）
      const assembledTween = gsap.fromTo(
        { v: 0 },
        { v: 0 },
        {
          v: 1,
          duration: 2.2,
          ease: "power3.inOut",
          delay: 0.3,
          onUpdate: function () {
            assembled = this.targets()[0].v;
          },
        }
      );

      // 鼠标交互
      const onMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      };
      const onMouseLeave = () => {
        mouse.x = -9999;
        mouse.y = -9999;
      };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseout", onMouseLeave);

      build();
      draw();

      const onResize = () => build();
      window.addEventListener("resize", onResize);

      return () => {
        cancelAnimationFrame(raf);
        assembledTween.kill();
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseout", onMouseLeave);
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: sectionRef, dependencies: [title] }
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-[110vh] overflow-hidden hero-shimmer"
      aria-label="首页 Hero"
    >
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden />
      {/* 滚动提示 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 pointer-events-none">
        <span className="text-[11px] tracking-[0.2em] uppercase">Scroll</span>
        <svg className="w-4 h-4 animate-bounce" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 3v9M4.5 8.5L8 12l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
