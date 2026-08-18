"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ADMIN_HOME } from "@/lib/config";
import { SketchDecorations } from "@/components/sketch/sketch-decorations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <main className="graph-paper min-h-screen grid lg:grid-cols-2 font-hand-body text-ink-secondary relative">
      <SketchDecorations />

      {/* 左侧：手绘便签板 */}
      <section className="hidden lg:flex flex-col justify-center p-12 xl:pl-28 relative overflow-hidden z-10">
        <div className="relative max-w-md">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 grid place-items-center sketch-border sketch-shadow bg-white font-hand-display text-[22px] font-bold text-secondary rotate-[-4deg]">
              知
            </span>
            <span className="font-hand-display text-[26px] font-bold text-ink-secondary rotate-[-1deg]">
              我的知识库
            </span>
          </div>
          <h1 className="mt-14 font-hand-display text-[50px] font-bold leading-[1.1] text-secondary rotate-[-1deg]">
            把碎片化的想法，
            <span className="marker-highlight inline-block">收进一个安静的地方。</span>
          </h1>
          <p className="mt-6 font-hand-body text-[19px] text-ink-muted leading-relaxed">
            笔记、分类、标签、全文检索——一个只属于你的私人知识仓库。
          </p>
          <div className="mt-10 flex items-center gap-4">
            <div className="sticky-note sketch-border px-4 py-2 rotate-[-2deg]">
              <div className="font-hand-display text-[18px] font-bold text-sticker-brown">个人专属</div>
            </div>
            <div className="sticky-note sketch-border px-4 py-2 rotate-[1.5deg]">
              <div className="font-hand-display text-[18px] font-bold text-sticker-brown">私有部署</div>
            </div>
            <div className="sticky-note sketch-border px-4 py-2 rotate-[-1deg]">
              <div className="font-hand-display text-[18px] font-bold text-sticker-brown">数据自持</div>
            </div>
          </div>
        </div>
      </section>

      {/* 右侧：手绘登录卡片 */}
      <section className="flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-100 fade-up">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <span className="w-10 h-10 grid place-items-center sketch-border sketch-shadow bg-white font-hand-display text-[22px] font-bold text-secondary rotate-[-4deg]">
              知
            </span>
            <span className="font-hand-display text-[26px] font-bold text-ink-secondary">我的知识库</span>
          </div>

          <div className="bg-white sketch-border sketch-shadow p-8 relative">
            <h2 className="font-hand-display text-[36px] font-bold text-secondary rotate-[-1deg]">
              登录
            </h2>
            <p className="mt-1 font-hand-body text-[16px] text-ink-muted">
              欢迎回来，继续你的知识积累。
            </p>

            <form onSubmit={onSubmit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="username" className="block font-hand-display text-[17px] font-bold text-ink-secondary mb-1.5">
                  用户名
                </label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="h-11 text-[15px]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block font-hand-display text-[17px] font-bold text-ink-secondary">
                    密码
                  </label>
                  <span className="font-hand-body text-[13px] text-ink-faint">初始账号 admin / admin123</span>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="h-11 text-[15px]"
                />
              </div>
              {error && (
                <div role="alert" className="sticky-note sketch-border px-3 py-2 rotate-[-1deg]">
                  <span className="font-hand-body text-[14px] text-red-500">✗ {error}</span>
                </div>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-[20px]"
              >
                {loading ? "登录中…" : "登录"}
              </Button>
            </form>
          </div>

          <p className="mt-6 font-hand-body text-[14px] text-ink-faint text-center leading-relaxed">
            登录即表示同意数据仅存储于你自己的服务器，
            <br />
            不会上传到任何第三方服务。
          </p>
        </div>
      </section>
    </main>
  );
}
