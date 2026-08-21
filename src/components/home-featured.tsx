"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { formatDate } from "@/lib/format";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface FeaturedArticle {
  id: string;
  title: string;
  summary: string | null;
  categoryName: string | null;
  updatedAt: string | Date;
}

export default function HomeFeatured({ articles }: { articles: FeaturedArticle[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduced) return;

      gsap.fromTo(
        ".featured-title",
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 82%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".featured-card",
        { y: 60, opacity: 0, rotate: -4 },
        {
          y: 0,
          opacity: 1,
          rotate: (i: number) => [-1.5, 1, -1][i],
          duration: 0.75,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".featured-line",
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 82%",
            once: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="max-w-250 mx-auto px-4 sm:px-6 pb-14">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="featured-title font-hand-display text-[24px] font-bold text-secondary marker-underline inline-block">
          精选笔记
        </h2>
        <span className="featured-line flex-1 pencil-line h-[2px]" />
      </div>

      <div className="bg-white sketch-border sketch-shadow p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        {articles.map((article, i) => (
          <Link
            key={article.id}
            href={`/article/${article.id}`}
            className="featured-card group sketch-dashed p-4 hover:bg-canvas-soft transition-colors flex flex-col"
            style={{ transform: `rotate(${[-1.5, 1, -1][i]}deg)` }}
          >
            <span className="font-hand-body text-[13px] text-sticker-pink">
              【{article.categoryName ?? "未分类"}】
            </span>
            <h3 className="mt-1.5 font-hand-display text-[20px] font-bold leading-snug text-ink-secondary group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            {article.summary && (
              <p className="mt-1.5 font-hand-body text-[14px] text-ink-muted leading-relaxed line-clamp-2 flex-1">
                {article.summary}
              </p>
            )}
            <div className="mt-2 flex items-center justify-between">
              <span className="font-hand-body text-[13px] text-ink-faint">
                {formatDate(new Date(article.updatedAt).toISOString())}
              </span>
              <span className="font-hand-display text-[14px] text-primary">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
