"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const GITHUB = "https://github.com/xie392";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/** 读取手绘主题色（亮/暗模式自动跟随） */
function readThemeColor(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

/**
 * 关于我页 Hero：方格纸 + 星座墨点（Canvas 抖动铅笔连线）+ 手绘装饰。
 * 全站手绘线框图语言：墨色点线、草图边框、便签、胶带、马克笔标题。
 */
export default function AboutHero() {
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
      let nodes: Node[] = [];
      const mouse = { x: -9999, y: -9999 };
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // 铅笔/墨色调色板（读主题变量，暗色自适应）
      const palette = {
        line: readThemeColor("--color-sketch-line-soft", "rgba(49,48,46,0.45)"),
        dot: readThemeColor("--color-sketch-line", "rgba(49,48,46,0.75)"),
        accent: readThemeColor("--color-primary", "#0075de"),
        pink: readThemeColor("--color-sticker-pink", "#ff64c8"),
      };

      const build = () => {
        const w = section.clientWidth;
        const h = section.clientHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = Math.min(70, Math.max(20, Math.floor((w * h) / 22000)));
        nodes = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 1.8 + 0.8,
        }));
      };

      /** 手绘抖动直线：把直线切成多段，每段加垂直随机偏移，模拟铅笔线条 */
      const sketchLine = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        alpha: number,
        color: string
      ) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy);
        const segs = Math.max(4, Math.floor(len / 14));
        const nx = -dy / len;
        const ny = dx / len;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        for (let i = 1; i <= segs; i++) {
          const t = i / segs;
          const j = (Math.random() - 0.5) * 1.4;
          ctx.lineTo(x1 + dx * t + nx * j, y1 + dy * t + ny * j);
        }
        ctx.stroke();
        ctx.restore();
      };

      const draw = () => {
        const w = section.clientWidth;
        const h = section.clientHeight;
        ctx.clearRect(0, 0, w, h);

        for (const n of nodes) {
          // 鼠标轻微吸引（像墨水被笔尖牵住）
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 160 && dist > 0.01) {
            const f = (160 - dist) / 160;
            n.vx += (dx / dist) * f * 0.04;
            n.vy += (dy / dist) * f * 0.04;
          }
          n.vx *= 0.97;
          n.vy *= 0.97;
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -12) n.x = w + 12;
          if (n.x > w + 12) n.x = -12;
          if (n.y < -12) n.y = h + 12;
          if (n.y > h + 12) n.y = -12;
        }

        // 近距墨点连线（铅笔抖动）
        const linkDist = 140;
        for (let i = 0; i < nodes.length; i++) {
          const a = nodes[i];
          for (let j = i + 1; j < nodes.length; j++) {
            const b = nodes[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < linkDist) {
              sketchLine(
                a.x,
                a.y,
                b.x,
                b.y,
                (1 - d / linkDist) * 0.5,
                palette.line
              );
            }
          }
          // 与鼠标连线（蓝色马克笔强调）
          const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (md < 190) {
            sketchLine(
              a.x,
              a.y,
              mouse.x,
              mouse.y,
              (1 - md / 190) * 0.55,
              palette.accent
            );
          }
        }

        // 墨点
        for (const n of nodes) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = palette.dot;
          ctx.fill();
        }

        if (!reduced) raf = requestAnimationFrame(draw);
      };

      // 入场时间轴
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".about-hero-avatar",
        { scale: 0.6, opacity: 0, rotate: -10 },
        { scale: 1, opacity: 1, rotate: -3, duration: 0.9, ease: "back.out(1.6)" },
        0.15
      )
        .fromTo(
          ".about-hero-title",
          { y: 50, opacity: 0, rotate: -3 },
          { y: 0, opacity: 1, rotate: -2, duration: 1.0 },
          0.1
        )
        .fromTo(
          ".about-hero-sub",
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          0.65
        )
        .fromTo(
          ".about-hero-cta",
          { y: 20, opacity: 0, rotate: 1 },
          { y: 0, opacity: 1, rotate: -1, duration: 0.6 },
          0.9
        )
        .fromTo(
          ".about-note",
          { y: 30, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: "back.out(1.4)",
          },
          0.5
        )
        .fromTo(".about-hero-scroll", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.3);

      // 滚动：内容轻微上移 + 头像倾斜
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          gsap.set(".about-hero-inner", { y: self.progress * -60 });
          gsap.set(".about-hero-avatar", {
            rotate: -3 + self.progress * 6,
          });
        },
      });

      const onMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        if (reduced) return;
        if (!raf) raf = requestAnimationFrame(draw);
      };
      const onLeave = () => {
        mouse.x = -9999;
        mouse.y = -9999;
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseout", onLeave);

      build();
      draw();

      const onResize = () => build();
      window.addEventListener("resize", onResize);

      // 暗色模式切换时重读配色
      const onTheme = () => {
        palette.line = readThemeColor("--color-sketch-line-soft", palette.line);
        palette.dot = readThemeColor("--color-sketch-line", palette.dot);
        palette.accent = readThemeColor("--color-primary", palette.accent);
        palette.pink = readThemeColor("--color-sticker-pink", palette.pink);
      };
      const mo = new MutationObserver(onTheme);
      mo.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => {
        cancelAnimationFrame(raf);
        raf = 0;
        tl.kill();
        st.kill();
        mo.disconnect();
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseout", onLeave);
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative graph-paper min-h-[88vh] overflow-hidden flex items-center justify-center"
      aria-label="关于我"
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" aria-hidden />

      {/* 浮动便签装饰（仅大屏） */}
      <div className="hidden lg:block about-note absolute left-[6%] top-[18%] rotate-[-6deg] z-10 pointer-events-none">
        <div className="sticky-note sketch-border px-4 py-3 w-36">
          <div className="font-hand-display text-[15px] font-bold text-sticker-brown">
            ✏️ 第二大脑
          </div>
          <div className="mt-1 font-hand-body text-[12px] text-sticker-orange-deep leading-snug">
            把想法沉淀成系统
          </div>
        </div>
      </div>

      <div className="hidden lg:block about-note absolute right-[7%] top-[22%] rotate-[5deg] z-10 pointer-events-none">
        <div
          className="sticky-note sketch-border-2 px-4 py-3 w-36"
          style={{ background: "#ffe3ef" }}
        >
          <div className="font-hand-display text-[15px] font-bold text-sticker-brown">
            🚀 开源爱好者
          </div>
          <div className="mt-1 font-hand-body text-[12px] text-sticker-orange-deep leading-snug">
            喜欢折腾工具链
          </div>
        </div>
      </div>

      <div className="hidden lg:block about-note absolute right-[10%] bottom-[16%] rotate-[-3deg] z-10 pointer-events-none">
        <div
          className="sticky-note sketch-border px-4 py-3 w-36"
          style={{ background: "#dff3e6" }}
        >
          <div className="font-hand-display text-[15px] font-bold text-sticker-brown">
            ☕ 全栈开发
          </div>
          <div className="mt-1 font-hand-body text-[12px] text-sticker-orange-deep leading-snug">
            从前端到部署
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center px-4 about-hero-inner w-full max-w-250 mx-auto">
        {/* 头像：白卡草图边框 + 顶部胶带 */}
        <div className="about-hero-avatar mx-auto relative inline-block">
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 z-20"
            style={{
              background: "rgba(0,117,222,0.28)",
              borderLeft: "1px dashed rgba(0,0,0,0.12)",
              borderRight: "1px dashed rgba(0,0,0,0.12)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
            aria-hidden
          />
          <div className="bg-white sketch-border sketch-shadow p-2 rotate-[-3deg]">
            <img
              src="https://github.com/xie392.png"
              alt="XIE392 的头像"
              width={116}
              height={116}
              className="w-28 h-28 sm:w-30 sm:h-30 object-cover rounded-[4px] bg-canvas-soft"
            />
          </div>
        </div>

        {/* 名称：墨色手写体 + 马克笔下划线（对齐首页标题风格） */}
        <h1 className="about-hero-title mt-8 font-hand-display text-[52px] sm:text-[72px] md:text-[88px] font-bold leading-none text-secondary inline-block">
          XIE392
          <span
            className="block w-full h-[6px] mt-2 rotate-[-1deg]"
            style={{
              background:
                "repeating-linear-gradient(90deg, rgba(0,117,222,0.55) 0 8px, transparent 8px 14px)",
              borderRadius: "3px",
            }}
            aria-hidden
          />
        </h1>

        <p className="about-hero-sub mt-6 font-hand-display text-[18px] sm:text-[22px] text-ink-muted tracking-wide">
          <span className="marker-highlight font-bold">全栈开发者</span>
          <span className="mx-2 text-ink-faint">·</span>
          开源爱好者
          <span className="mx-2 text-ink-faint">·</span>
          知识库主人
        </p>

        <div className="about-hero-cta mt-10 flex items-center justify-center gap-4 flex-wrap">
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 bg-white sketch-border sketch-shadow px-7 py-3 font-hand-display text-[17px] font-bold text-secondary hover:-translate-y-0.5 transition-transform"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden>
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.03 11.03 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
            </svg>
            GitHub 主页
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>

      {/* 滚动提示 */}
      <div className="about-hero-scroll absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ink-faint pointer-events-none">
        <span className="font-hand-display text-[11px] tracking-[0.25em] uppercase">
          Scroll
        </span>
        <svg
          className="w-4 h-4 animate-bounce"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            d="M8 3v9M4.5 8.5L8 12l3.5-3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
