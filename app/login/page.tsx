import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="graph-paper min-h-screen grid lg:grid-cols-2 font-hand-body text-[#31302e]">
      {/* 左侧：手绘便签板 */}
      <section className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
        {/* 手绘大标题 */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 grid place-items-center sketch-border sketch-shadow bg-white font-hand-display text-[22px] font-bold text-[#213183] rotate-[-4deg]">
              知
            </span>
            <span className="font-hand-display text-[26px] font-bold text-[#31302e] rotate-[-1deg]">
              我的知识库
            </span>
          </div>
          <h1 className="mt-14 font-hand-display text-[48px] font-bold leading-[1.1] text-[#213183] max-w-md rotate-[-1deg]">
            把碎片化的想法，
            <span className="marker-highlight inline-block">收进一个安静的地方。</span>
          </h1>
          <p className="mt-5 font-hand-body text-[19px] text-[#615d59] max-w-sm leading-relaxed">
            笔记、分类、标签、全文检索——一个只属于你的私人知识仓库。
          </p>
        </div>

        {/* 便签装饰 */}
        <div className="relative flex items-center gap-4">
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
      </section>

      {/* 右侧：手绘登录卡片 */}
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] fade-up">
          {/* 移动端 Logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <span className="w-10 h-10 grid place-items-center sketch-border sketch-shadow bg-white font-hand-display text-[22px] font-bold text-[#213183] rotate-[-4deg]">
              知
            </span>
            <span className="font-hand-display text-[26px] font-bold text-[#31302e]">我的知识库</span>
          </div>

          <div className="bg-white sketch-border sketch-shadow p-8">
            <h2 className="font-hand-display text-[36px] font-bold text-[#213183] rotate-[-1deg]">
              登录
            </h2>
            <p className="mt-1 font-hand-body text-[16px] text-[#615d59]">
              欢迎回来，继续你的知识积累。
            </p>

            <form className="mt-7 space-y-5">
              <div>
                <label htmlFor="username" className="block font-hand-display text-[17px] font-bold text-[#31302e] mb-1.5">
                  用户名
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="请输入用户名"
                  className="w-full h-11 px-4 bg-white sketch-border text-[15px] text-[#31302e] placeholder:text-[#a39e98] outline-none focus:border-[#0075de] transition-colors font-hand-body"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block font-hand-display text-[17px] font-bold text-[#31302e]">
                    密码
                  </label>
                  <span className="font-hand-body text-[13px] text-[#a39e98]">单机部署 · 忘记密码需重置数据</span>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="请输入密码"
                  className="w-full h-11 px-4 bg-white sketch-border text-[15px] text-[#31302e] placeholder:text-[#a39e98] outline-none focus:border-[#0075de] transition-colors font-hand-body"
                />
              </div>
              <button
                type="submit"
                className="w-full h-11 bg-[#0075de] text-white font-hand-display text-[20px] font-bold sketch-border sketch-shadow rotate-[-0.5deg] hover:rotate-0 transition-transform"
              >
                登录
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
    </main>
  );
}
