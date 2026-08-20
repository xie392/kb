"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const GITHUB = "https://github.com/xie392";
const REPO = "https://github.com/xie392/kb";

/** 技能自评（百分比仅作展示，可按需调整） */
const SKILLS = [
  { name: "前端开发", level: 90, color: "#0075de" },
  { name: "后端开发", level: 82, color: "#2a9d99" },
  { name: "数据库设计", level: 78, color: "#ff64c8" },
  { name: "工程化与部署", level: 85, color: "#dd5b00" },
  { name: "开源协作", level: 88, color: "#391c57" },
];

const STACK = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "Tailwind CSS",
  "Prisma",
  "SQLite",
  "PostgreSQL",
  "tRPC",
  "TanStack Query",
  "NextAuth",
  "Zod",
  "Tiptap",
  "GSAP",
  "rough.js",
  "shadcn/ui",
  "Docker",
  "Git",
];

interface CounterProps {
  to: number;
  suffix?: string;
}

function Counter({ to, suffix = "" }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const obj = { v: 0 };
      const tween = gsap.to(obj, {
        v: to,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
        onUpdate: () => {
          el.textContent = `${Math.round(obj.v)}${suffix}`;
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { dependencies: [to, suffix] }
  );
  return (
    <span ref={ref} className="tabular-nums">
      0{suffix}
    </span>
  );
}

interface AboutContentProps {
  stats: { label: string; value: number }[];
}

export default function AboutContent({ stats }: AboutContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      // 技能条：滚动进入视口后宽度展开
      gsap.utils.toArray<HTMLElement>(".skill-bar-fill").forEach((bar) => {
        gsap.fromTo(
          bar,
          { width: "0%" },
          {
            width: bar.dataset.level + "%",
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: { trigger: bar, start: "top 90%" },
          }
        );
      });

      // 技术栈徽章：逐个淡入上浮
      gsap.fromTo(
        ".stack-chip",
        { y: 20, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.06,
          ease: "back.out(1.5)",
          scrollTrigger: { trigger: ".stack-cloud", start: "top 85%" },
        }
      );

      // 区块标题：马克笔高亮下划线滑入
      gsap.fromTo(
        ".about-section-title",
        { x: -24, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
        }
      );

      // GitHub 卡片：鼠标 3D 倾斜
      const tilt = tiltRef.current;
      if (!tilt) return;
      const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.4, ease: "power3.out" });
      const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.4, ease: "power3.out" });
      const onMove = (e: MouseEvent) => {
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * 14);
        rx(-py * 14);
      };
      const onLeave = () => {
        rx(0);
        ry(0);
      };
      tilt.addEventListener("mousemove", onMove);
      tilt.addEventListener("mouseleave", onLeave);
      return () => {
        tilt.removeEventListener("mousemove", onMove);
        tilt.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="graph-paper pb-20" style={{ perspective: "900px" }}>
      <div className="max-w-250 mx-auto px-4 sm:px-6">
        {/* ── 一句话介绍 ── */}
        <section className="pt-16">
          <h2 className="about-section-title font-hand-display text-[22px] sm:text-[26px] font-bold text-secondary marker-underline inline-block">
            我是谁
          </h2>
          <div className="mt-6 bg-white sketch-border sketch-shadow p-6 sm:p-8">
            <p className="font-hand-body text-[16px] sm:text-[18px] leading-relaxed text-ink-secondary">
              你好，我是 <span className="marker-highlight font-bold">XIE392</span>，
              一名热爱折腾的全栈开发者。这个知识库是我的第二大脑——
              碎片化的想法在这里被<span className="font-bold text-primary">沉淀成系统化的知识</span>，
              每一个页面都是一次思考的记录。
            </p>
            <p className="mt-4 font-hand-body text-[15px] sm:text-[16px] leading-relaxed text-ink-muted">
              你现在看到的这个站点，是我用{" "}
              <span className="font-bold text-secondary">Next.js 16 (App Router)</span> +{" "}
              <span className="font-bold text-secondary">tRPC</span> +{" "}
              <span className="font-bold text-secondary">Prisma</span> 全栈自建的：
              前台是手绘线框图风格，富文本编辑器基于 Tiptap，
              图表和动画用 rough.js / GSAP 手绘实现，后台涵盖文章、分类、标签、备份与数据看板。
            </p>
            <p className="mt-4 font-hand-body text-[15px] sm:text-[16px] leading-relaxed text-ink-muted">
              业余时间喜欢研究开源项目、打磨工具链，并把踩过的坑写成笔记。
              如果你也喜欢，欢迎到 GitHub 一起交流。
            </p>
          </div>
        </section>

        {/* ── 数据统计 ── */}
        <section className="pt-14">
          <h2 className="about-section-title font-hand-display text-[22px] sm:text-[26px] font-bold text-secondary marker-underline inline-block">
            知识库实时数据
          </h2>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="bg-white sketch-border sketch-shadow p-5 text-center"
                style={{ transform: `rotate(${[-1.5, 1, -1, 1.5][i]}deg)` }}
              >
                <div className="font-hand-display text-[32px] sm:text-[38px] font-bold text-sticker-brown leading-none">
                  <Counter to={s.value} />
                </div>
                <div className="mt-2 font-hand-body text-[14px] text-ink-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 技能 ── */}
        <section className="pt-14">
          <h2 className="about-section-title font-hand-display text-[22px] sm:text-[26px] font-bold text-secondary marker-underline inline-block">
            技能自评
          </h2>
          <div className="mt-6 bg-white sketch-border sketch-shadow p-6 sm:p-8 space-y-5">
            {SKILLS.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-hand-body text-[15px] text-ink-secondary">{s.name}</span>
                  <span className="font-hand-display text-[15px] font-bold" style={{ color: s.color }}>
                    {s.level}%
                  </span>
                </div>
                <div className="h-3.5 rounded-full bg-canvas-soft border border-dashed border-hairline overflow-hidden">
                  <div
                    className="skill-bar-fill h-full rounded-full"
                    data-level={s.level}
                    style={{ backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 技术栈徽章 ── */}
        <section className="pt-14">
          <h2 className="about-section-title font-hand-display text-[22px] sm:text-[26px] font-bold text-secondary marker-underline inline-block">
            常用技术栈
          </h2>
          <div className="stack-cloud mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
            {STACK.map((t, i) => (
              <span
                key={t}
                className={`stack-chip font-hand-display text-[15px] sm:text-[16px] px-4 py-1.5 bg-white sketch-border sketch-shadow hover:-translate-y-0.5 hover:shadow-elevated transition-transform ${
                  i % 2 ? "rotate-[0.8deg]" : "rotate-[-0.8deg]"
                }`}
              >
                <span style={{ color: ["#0075de", "#ff64c8", "#2a9d99", "#dd5b00", "#391c57"][i % 5] }}>
                  ●
                </span>{" "}
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* ── GitHub 卡片 ── */}
        <section className="pt-14">
          <h2 className="about-section-title font-hand-display text-[22px] sm:text-[26px] font-bold text-secondary marker-underline inline-block">
            来 GitHub 找我
          </h2>
          <div className="mt-6">
            <a
              ref={tiltRef}
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-full bg-gradient-to-br from-secondary to-sticker-purple-deep text-white sketch-border sketch-shadow p-7 sm:p-9 transition-shadow will-change-transform"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <img
                  src="https://github.com/xie392.png"
                  alt="XIE392"
                  width={88}
                  height={88}
                  className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover ring-4 ring-white/20 shrink-0"
                />
                <div className="flex-1 text-center sm:text-left">
                  <div className="font-hand-display text-[26px] sm:text-[30px] font-bold">xie392</div>
                  <div className="mt-1 font-hand-body text-[15px] text-white/75">
                    全栈开发者 · 开源爱好者 · 知识库主人
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 font-hand-display text-[16px] text-sticker-sky group-hover:underline">
                    github.com/xie392
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
                      <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42L17.59 5H14V3zM5 5h7v2H7v10h10v-5h2v7H5V5z" />
                    </svg>
                  </div>
                </div>
                <span className="shrink-0 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 font-hand-display text-[16px] font-bold text-secondary shadow-elevated transition-transform group-hover:translate-x-1">
                  GitHub 主页 →
                </span>
              </div>
            </a>

            <p className="mt-5 text-center font-hand-body text-[14px] text-ink-faint">
              这个知识库本身也是开源的 →{" "}
              <Link
                href={REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                xie392/kb
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
