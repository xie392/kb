"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface Stat {
  v: string;
  l: string;
}

interface Cat {
  id: string;
  name: string;
  count: number;
}

interface HomeHeroProps {
  siteName: string;
  stats: Stat[];
  cats: Cat[];
}

export default function HomeHero({ siteName, stats, cats }: HomeHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduced) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-char", {
        y: 80,
        opacity: 0,
        rotate: -10,
        duration: 0.8,
        stagger: 0.04,
        ease: "back.out(1.7)",
      })
        .from(
          ".hero-underline",
          { scaleX: 0, transformOrigin: "left center", duration: 0.6 },
          "-=0.3"
        )
        .from(
          ".hero-sub",
          { y: 24, opacity: 0, duration: 0.6 },
          "-=0.3"
        )
        .from(
          ".hero-stat",
          {
            y: 30,
            opacity: 0,
            scale: 0.85,
            rotate: (i: number) => [-4, 3, -2][i],
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.5)",
          },
          "-=0.3"
        )
        .from(
          ".hero-cat",
          {
            y: 16,
            opacity: 0,
            duration: 0.45,
            stagger: 0.05,
          },
          "-=0.3"
        );

      gsap.to(".hero-doodle-1", {
        y: "+=18",
        x: "+=10",
        rotate: 6,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".hero-doodle-2", {
        y: "+=22",
        x: "-=12",
        rotate: -5,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".hero-doodle-3", {
        y: "+=14",
        x: "+=8",
        rotate: 4,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: rootRef }
  );

  const chars = siteName.split("");

  return (
    <section
      ref={rootRef}
      className="relative max-w-250 mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-10 text-center"
    >
      <svg
        className="hero-doodle-1 absolute left-[4%] top-[12%] hidden sm:block pointer-events-none"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
      >
        <path
          d="M24 6 L27 21 L42 24 L27 27 L24 42 L21 27 L6 24 L21 21 Z"
          stroke="#0075de"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="rgba(0,117,222,0.1)"
        />
      </svg>

      <svg
        className="hero-doodle-2 absolute right-[5%] top-[18%] hidden sm:block pointer-events-none"
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
      >
        <circle
          cx="20"
          cy="20"
          r="14"
          stroke="#ff64c8"
          strokeWidth="2"
          strokeDasharray="4 3"
          fill="none"
        />
        <circle cx="20" cy="20" r="4" fill="#ff64c8" opacity="0.5" />
      </svg>

      <svg
        className="hero-doodle-3 absolute left-[8%] bottom-[15%] hidden sm:block pointer-events-none"
        width="44"
        height="44"
        viewBox="0 0 44 44"
        fill="none"
      >
        <path
          d="M8 36 L20 10 L32 36 Z"
          stroke="#2a9d99"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      <h1 className="font-hand-display text-[44px] sm:text-[64px] md:text-[80px] font-bold leading-none text-secondary rotate-[-2deg] inline-block">
        <span className="inline-block overflow-hidden align-bottom">
          {chars.map((ch, i) => (
            <span key={i} className="hero-char inline-block">
              {ch}
            </span>
          ))}
        </span>
        <span
          className="hero-underline block w-full h-[6px] mt-2 rotate-[-1deg]"
          style={{
            background:
              "repeating-linear-gradient(90deg, rgba(0,117,222,0.55) 0 8px, transparent 8px 14px)",
            borderRadius: "3px",
          }}
        />
      </h1>

      <p className="hero-sub mt-6 font-hand-body text-[20px] text-ink-muted max-w-md mx-auto">
        记录碎片化的想法，
        <span className="marker-highlight">沉淀系统化的知识</span>
      </p>

      <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
        {stats.map((s, i) => (
          <div
            key={s.l}
            className="hero-stat sticky-note sketch-border px-5 py-3"
            style={{ transform: `rotate(${[-2, 1, -1, 2][i]}deg)` }}
          >
            <div className="font-hand-display text-[28px] sm:text-[34px] font-bold text-sticker-brown leading-none">
              {s.v}
            </div>
            <div className="mt-1 font-hand-body text-[14px] text-sticker-orange-deep">
              {s.l}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
        {cats.map((c, i) => (
          <Link
            key={c.id}
            href={`/categories?cat=${c.id}`}
            className={`hero-cat font-hand-display text-[16px] sm:text-[18px] px-4 py-1.5 bg-white sketch-border sketch-shadow hover:-translate-y-0.5 transition-transform ${
              i % 2 ? "rotate-[1deg]" : "rotate-[-1deg]"
            }`}
          >
            <span style={{ color: ["#0075de", "#ff64c8", "#2a9d99"][i % 3] }}>
              ●
            </span>{" "}
            {c.name}
            <span className="text-ink-faint text-[14px]"> ({c.count})</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
