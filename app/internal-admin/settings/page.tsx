"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [nickname, setNickname] = useState("知识库管理员");
  const [saved, setSaved] = useState(false);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 w-full">
      <h2 className="text-[22px] font-bold tracking-[-0.25px] text-ink mb-6">系统设置</h2>

      <div className="space-y-6">
        {/* 账号设置 */}
        <section className="card p-6 fade-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px] font-semibold text-ink">账号设置</h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#f6f5f4] text-[#615d59] border border-[#e6e6e6]">
              单用户模式
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold tracking-[0.125px] text-[#31302e] mb-1.5">
                用户名
              </label>
              <input
                defaultValue="admin"
                disabled
                className="w-full max-w-[360px] h-9 px-3 rounded-[6px] bg-[#f6f5f4] border border-[#e6e6e6] text-[13.5px] text-[#a39e98] outline-none cursor-not-allowed"
              />
              <p className="text-[11px] text-[#a39e98] mt-1">用户名不可修改</p>
            </div>
            <div>
              <label className="block text-[12px] font-semibold tracking-[0.125px] text-[#31302e] mb-1.5">
                昵称
              </label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full max-w-[360px] h-9 px-3 rounded-[6px] bg-canvas border border-[#e6e6e6] text-[13.5px] text-ink outline-none focus:border-[#0075de] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold tracking-[0.125px] text-[#31302e] mb-1.5">
                修改密码
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="新密码"
                  className="w-full max-w-[360px] h-9 px-3 rounded-[6px] bg-canvas border border-[#e6e6e6] text-[13.5px] text-ink placeholder:text-[#a39e98] outline-none focus:border-[#0075de] transition-colors"
                />
                <button className="h-9 px-4 rounded-[8px] border border-[#e6e6e6] text-[13px] text-[#31302e] hover:border-[#0075de]/40 hover:text-[#0075de] transition-colors">
                  修改
                </button>
              </div>
              <p className="text-[11px] text-[#a39e98] mt-1">需验证原密码，密码使用 bcrypt 加密存储</p>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-[#e6e6e6] flex items-center justify-between">
            <span className="text-[12px] text-[#a39e98]">个人资料修改</span>
            <button
              onClick={showSaved}
              className="h-8 px-4 rounded-full bg-primary text-white text-[13px] font-medium hover:bg-primary-active transition-colors"
            >
              保存修改
            </button>
          </div>
          {saved && (
            <div className="mt-3 flex items-center gap-1.5 text-[12.5px] text-sticker-green fade-up">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8.5l3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              已保存
            </div>
          )}
        </section>

        {/* 数据备份 */}
        <section className="card p-6 fade-up" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px] font-semibold text-ink">数据备份</h3>
            <span className="text-[11px] text-[#a39e98]">最近备份：3 天前</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button className="flex flex-col items-center gap-2 px-4 py-5 sketch-border border border-[#e6e6e6] hover:border-primary/30 hover:shadow-[var(--shadow-soft)] transition-all">
              <span className="w-9 h-9 sketch-border bg-primary/10 grid place-items-center">
                <svg className="w-4.5 h-4.5 text-primary" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 3v9m0 0l-3.5-3.5M10 12l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 14.5V16a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 17 16v-1.5" strokeLinecap="round" />
                </svg>
              </span>
              <span className="text-[13px] font-medium text-ink">一键导出备份</span>
              <span className="text-[11px] text-[#a39e98]">JSON + Markdown</span>
            </button>
            <button className="flex flex-col items-center gap-2 px-4 py-5 sketch-border border border-[#e6e6e6] hover:border-primary/30 hover:shadow-[var(--shadow-soft)] transition-all">
              <span className="w-9 h-9 sketch-border bg-sticker-purple/10 grid place-items-center">
                <svg className="w-4.5 h-4.5 text-sticker-purple-deep" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 14V5m0 0L6.5 8.5M10 5l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 14.5V16a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 17 16v-1.5" strokeLinecap="round" />
                </svg>
              </span>
              <span className="text-[13px] font-medium text-ink">本地导入恢复</span>
              <span className="text-[11px] text-[#a39e98]">导入前强制备份提示</span>
            </button>
            <button className="flex flex-col items-center gap-2 px-4 py-5 sketch-border border border-[#e6e6e6] hover:border-primary/30 hover:shadow-[var(--shadow-soft)] transition-all">
              <span className="w-9 h-9 sketch-border bg-sticker-green/10 grid place-items-center">
                <svg className="w-4.5 h-4.5 text-sticker-green" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h9l3 3v9H4V4z" strokeLinejoin="round" />
                  <path d="M4 8h12M10 4v6m0 0l-2-2m2 2l2-2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-[13px] font-medium text-ink">定期自动备份</span>
              <span className="text-[11px] text-[#a39e98]">每日 03:00</span>
            </button>
          </div>
        </section>

        {/* 基础配置 */}
        <section className="card p-6 fade-up" style={{ animationDelay: "160ms" }}>
          <h3 className="text-[15px] font-semibold text-ink mb-5">基础配置</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13.5px] text-ink">默认列表排序</div>
                <div className="text-[11px] text-[#a39e98] mt-0.5">影响前台笔记列表默认展示顺序</div>
              </div>
              <select className="h-8 px-3 rounded-[8px] bg-canvas border border-[#e6e6e6] text-[13px] text-[#31302e] outline-none focus:border-[#0075de] transition-colors">
                <option>更新时间倒序</option>
                <option>创建时间倒序</option>
                <option>标题排序</option>
              </select>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-[#e6e6e6]">
              <div>
                <div className="text-[13.5px] text-ink">列表每页条数</div>
                <div className="text-[11px] text-[#a39e98] mt-0.5">分页展示的笔记数量</div>
              </div>
              <select className="h-8 px-3 rounded-[8px] bg-canvas border border-[#e6e6e6] text-[13px] text-[#31302e] outline-none focus:border-[#0075de] transition-colors">
                <option>20 条</option>
                <option>10 条</option>
                <option>50 条</option>
              </select>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-[#e6e6e6]">
              <div>
                <div className="text-[13.5px] text-ink">新笔记默认权限</div>
                <div className="text-[11px] text-[#a39e98] mt-0.5">新建笔记时的默认可见性</div>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-[8px] bg-[#f6f5f4] border border-[#e6e6e6]">
                <button className="px-3 h-7 rounded-[6px] text-[12.5px] bg-canvas text-ink shadow-[var(--shadow-soft)] font-medium">
                  私有
                </button>
                <button className="px-3 h-7 rounded-[6px] text-[12.5px] text-[#615d59] hover:text-ink transition-colors">
                  公开
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
