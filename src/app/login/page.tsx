"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ADMIN_HOME } from "@/lib/config";

function SketchDecorations() {
  return (
    <div
      aria-hidden
      className="hidden lg:block pointer-events-none absolute inset-0 overflow-hidden"
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <filter id="pencil" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
        </defs>

        {/* ── 主弧形箭头：从左侧文案弯向登录卡片 ── */}
        <g
          style={{
            stroke: "#615d59",
            strokeWidth: 2.6,
            fill: "none",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            animation: "sketch-draw 1.4s cubic-bezier(0.65,0,0.35,1) 0.3s both",
          }}
        >
          <path d="M 560 490 C 650 390, 740 370, 820 410" filter="url(#pencil)" />
          <path d="M 810 398 L 834 416 L 810 428" filter="url(#pencil)" />
        </g>

        {/* ── 手写标注 "从这里进入" ── */}
        <g style={{ animation: "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.9s both" }}>
          <text
            x="598"
            y="350"
            transform="rotate(-6 598 350)"
            fontFamily="var(--font-hand-display), Caveat, cursive"
            fontSize="26"
            fontWeight="700"
            fill="#523410"
          >
            从这里进入
          </text>
          <path
            d="M 596 366 Q 660 356, 738 368"
            stroke="#dd5b00"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
            filter="url(#pencil)"
          />
        </g>

        {/* ── 四角星（蓝色，顶部中间） ── */}
        <g
          stroke="#0075de"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
          transform="translate(690,190) rotate(12)"
          style={{ animation: "fade-up 0.5s ease 1.1s both" }}
        >
          <path d="M 0 -18 L 0 18 M -18 0 L 18 0" />
          <path d="M -11 -11 L 11 11 M -11 11 L 11 -11" strokeWidth="1.8" opacity="0.65" />
        </g>

        {/* ── 手绘小圆圈（青色） ── */}
        <g
          stroke="#2a9d99"
          strokeWidth="2.8"
          fill="none"
          transform="translate(570,650)"
          style={{ animation: "fade-up 0.5s ease 1.2s both" }}
        >
          <ellipse cx="0" cy="0" rx="24" ry="18" transform="rotate(-20)" />
        </g>

        {/* ── 加号（深靛蓝） ── */}
        <g
          stroke="#213183"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
          transform="translate(760,690)"
          style={{ animation: "fade-up 0.5s ease 1.3s both" }}
        >
          <path d="M 0 -13 L 0 13 M -13 0 L 13 0" />
        </g>

        {/* ── 对勾（绿色） ── */}
        <g
          stroke="#1aae39"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(640,270) rotate(-8)"
          style={{ animation: "fade-up 0.5s ease 1.15s both" }}
        >
          <path d="M -12 2 L -3 12 L 14 -10" />
        </g>

        {/* ── 纸飞机（橙色，右上） ── */}
        <g
          transform="translate(870,260) rotate(-20)"
          style={{ animation: "fade-up 0.5s ease 1.25s both" }}
        >
          <path
            d="M 0 0 L 36 14 L 28 18 L 0 4 Z M 0 0 L 28 18 L 20 22 L 0 4 Z"
            fill="#dd5b00"
            fillOpacity="0.15"
            stroke="#dd5b00"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>

        {/* ── 虚线手绘方框（左下） ── */}
        <g
          transform="translate(490,600) rotate(-4)"
          style={{ animation: "fade-up 0.5s ease 1.35s both" }}
        >
          <rect
            x="-30"
            y="-22"
            width="60"
            height="44"
            rx="6"
            fill="none"
            stroke="#31302e"
            strokeWidth="1.8"
            strokeDasharray="5 4"
            opacity="0.35"
          />
        </g>

        {/* ── 散落圆点 ── */}
        <circle cx="540" cy="560" r="5" fill="#dd5b00" opacity="0.5" />
        <circle cx="740" cy="290" r="4" fill="#0075de" opacity="0.45" />
        <circle cx="590" cy="270" r="4.5" fill="#1aae39" opacity="0.45" />
        <circle cx="680" cy="560" r="6" fill="#d6b6f6" opacity="0.55" />
        <circle cx="620" cy="730" r="4" fill="#ff64c8" opacity="0.4" />
        <circle cx="780" cy="560" r="3.5" fill="#62aef0" opacity="0.5" />
        <circle cx="520" cy="380" r="3.5" fill="#0075de" opacity="0.35" />

        {/* ── 手绘波浪虚线 ── */}
        <path
          d="M 440 800 Q 500 775, 560 800 T 680 800 T 800 800"
          stroke="#31302e"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          opacity="0.22"
          strokeDasharray="3 6"
        />

        {/* ── 对话气泡 "Hi!" ── */}
        <g
          transform="translate(870,170) rotate(6)"
          style={{ animation: "fade-up 0.5s ease 1.4s both" }}
        >
          <path
            d="M 0 0 Q 0 -34, 46 -34 Q 92 -34, 92 0 Q 92 24, 56 26 L 48 42 L 44 26 Q 0 24, 0 0 Z"
            fill="#fff"
            stroke="#31302e"
            strokeWidth="1.8"
            opacity="0.9"
            filter="url(#pencil)"
          />
          <text
            x="46"
            y="-4"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-hand-display), Caveat, cursive"
            fontSize="22"
            fontWeight="700"
            fill="#213183"
          >
            Hi!
          </text>
        </g>

        {/* ── 螺旋小涂鸦 ── */}
        <g
          stroke="#62aef0"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
          transform="translate(470,210)"
          style={{ animation: "fade-up 0.5s ease 1.5s both" }}
        >
          <path d="M 0 0 C 10 -10, 22 -5, 20 8 C 18 20, 2 22, -6 12 C -14 2, -8 -16, 8 -18" />
        </g>

        {/* ── 小心心（粉色） ── */}
        <g
          transform="translate(820,340)"
          style={{ animation: "fade-up 0.5s ease 1.45s both" }}
        >
          <path
            d="M 0 6 C -10 -4, -20 4, 0 16 C 20 4, 10 -4, 0 6 Z"
            fill="#ff64c8"
            fillOpacity="0.2"
            stroke="#ff64c8"
            strokeWidth="1.8"
            opacity="0.6"
          />
        </g>
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("用户名或密码错误");
      } else {
        router.push(ADMIN_HOME);
        router.refresh();
      }
    } catch {
      setError("登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="graph-paper min-h-screen grid lg:grid-cols-2 font-hand-body text-[#31302e] relative">
      <SketchDecorations />

      {/* 左侧：手绘便签板 */}
      <section className="hidden lg:flex flex-col justify-center p-12 xl:pl-28 relative overflow-hidden z-10">
        <div className="relative max-w-md">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 grid place-items-center sketch-border sketch-shadow bg-white font-hand-display text-[22px] font-bold text-[#213183] rotate-[-4deg]">
              知
            </span>
            <span className="font-hand-display text-[26px] font-bold text-[#31302e] rotate-[-1deg]">
              我的知识库
            </span>
          </div>
          <h1 className="mt-14 font-hand-display text-[50px] font-bold leading-[1.1] text-[#213183] rotate-[-1deg]">
            把碎片化的想法，
            <span className="marker-highlight inline-block">收进一个安静的地方。</span>
          </h1>
          <p className="mt-6 font-hand-body text-[19px] text-[#615d59] leading-relaxed">
            笔记、分类、标签、全文检索——一个只属于你的私人知识仓库。
          </p>
          <div className="mt-10 flex items-center gap-4">
            <div className="sticky-note sketch-border px-4 py-2 rotate-[-2deg]">
              <div className="font-hand-display text-[18px] font-bold text-[#523410]">个人专属</div>
            </div>
            <div className="sticky-note sketch-border px-4 py-2 rotate-[1.5deg]">
              <div className="font-hand-display text-[18px] font-bold text-[#523410]">私有部署</div>
            </div>
            <div className="sticky-note sketch-border px-4 py-2 rotate-[-1deg]">
              <div className="font-hand-display text-[18px] font-bold text-[#523410]">数据自持</div>
            </div>
          </div>
        </div>
      </section>

      {/* 右侧：手绘登录卡片 */}
      <section className="flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[400px] fade-up">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <span className="w-10 h-10 grid place-items-center sketch-border sketch-shadow bg-white font-hand-display text-[22px] font-bold text-[#213183] rotate-[-4deg]">
              知
            </span>
            <span className="font-hand-display text-[26px] font-bold text-[#31302e]">我的知识库</span>
          </div>

          <div className="bg-white sketch-border sketch-shadow p-8 relative">
            <h2 className="font-hand-display text-[36px] font-bold text-[#213183] rotate-[-1deg]">
              登录
            </h2>
            <p className="mt-1 font-hand-body text-[16px] text-[#615d59]">
              欢迎回来，继续你的知识积累。
            </p>

            <form onSubmit={onSubmit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="username" className="block font-hand-display text-[17px] font-bold text-[#31302e] mb-1.5">
                  用户名
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="w-full h-11 px-4 bg-white sketch-border text-[15px] text-[#31302e] placeholder:text-[#a39e98] outline-none focus:border-[#0075de] transition-colors font-hand-body"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block font-hand-display text-[17px] font-bold text-[#31302e]">
                    密码
                  </label>
                  <span className="font-hand-body text-[13px] text-[#a39e98]">初始账号 admin / admin123</span>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full h-11 px-4 bg-white sketch-border text-[15px] text-[#31302e] placeholder:text-[#a39e98] outline-none focus:border-[#0075de] transition-colors font-hand-body"
                />
              </div>
              {error && (
                <div className="sticky-note sketch-border px-3 py-2 rotate-[-1deg]">
                  <span className="font-hand-body text-[14px] text-red-500">✗ {error}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#0075de] text-white font-hand-display text-[20px] font-bold sketch-border sketch-shadow rotate-[-0.5deg] hover:rotate-0 transition-transform disabled:opacity-50"
              >
                {loading ? "登录中…" : "登录"}
              </button>
            </form>
          </div>

          <p className="mt-6 font-hand-body text-[14px] text-[#a39e98] text-center leading-relaxed">
            登录即表示同意数据仅存储于你自己的服务器，
            <br />
            不会上传到任何第三方服务。
          </p>
        </div>
      </section>

      <style>{`
        @keyframes sketch-draw {
          from {
            stroke-dasharray: 600;
            stroke-dashoffset: 600;
            opacity: 0;
          }
          to {
            stroke-dasharray: 600;
            stroke-dashoffset: 0;
            opacity: 0.55;
          }
        }
      `}</style>
    </main>
  );
}
