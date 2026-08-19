"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_HOME, ADMIN_LOGIN } from "@/lib/config";

export default function AdminSettingsPage() {
  const utils = api.useUtils();
  const router = useRouter();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // 昵称
  const { data: profile } = api.settings.getProfile.useQuery();
  const [nickname, setNickname] = useState("");

  // 密码
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const changePassword = api.settings.changePassword.useMutation({
    onSuccess: async () => {
      setOldPwd(""); setNewPwd(""); setConfirmPwd("");
      show("密码已修改，即将退出登录", "ok");
      setTimeout(async () => {
        await signOut({ redirect: false });
        router.push(ADMIN_LOGIN);
        router.refresh();
      }, 1500);
    },
    onError: (e) => show(e.message, "err"),
  });
  const updateProfile = api.settings.updateProfile.useMutation({
    onSuccess: () => { show("昵称已保存", "ok"); utils.settings.getProfile.invalidate(); },
    onError: (e) => show(e.message, "err"),
  });

  // 备份
  const backup = api.settings.backup.useQuery(undefined, { enabled: false });
  const doBackup = async () => {
    const data = await backup.refetch();
    if (data.data) {
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `knowledge-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      show("备份已导出", "ok");
    }
  };

  const show = (text: string, type: "ok" | "err") => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 2500);
  };

  return (
    <div className="p-8 w-full">
      <h2 className="font-hand-display text-[32px] font-bold text-secondary mb-6">系统设置</h2>

      {msg && (
        <div className="mb-4 sticky-note sketch-border px-4 py-2 rotate-[-1deg] w-fit fade-up">
          <span className={`font-hand-display text-[16px] font-bold ${msg.type === "ok" ? "text-sticker-teal" : "text-red-500"}`}>
            {msg.type === "ok" ? "✓" : "✗"} {msg.text}
          </span>
        </div>
      )}

      <div className="space-y-6 max-w-190">
        {/* 账号设置 */}
        <section className="bg-white sketch-border sketch-shadow p-6 fade-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-hand-display text-[22px] font-bold text-ink-secondary marker-underline inline-block">
              账号设置
            </h3>
            <span className="font-hand-body text-[13px] text-ink-faint">单用户模式</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block font-hand-display text-[16px] font-bold text-ink-secondary mb-1.5">
                用户名
              </label>
              <Input
                value={profile?.username ?? "…"}
                disabled
                className="w-full max-w-90 h-10 bg-canvas-soft text-ink-faint"
              />
              <p className="mt-1 font-hand-body text-[12px] text-ink-faint">用户名不可修改</p>
            </div>
            <div>
              <label className="block font-hand-display text-[16px] font-bold text-ink-secondary mb-1.5">
                昵称
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={profile?.nickname ?? "设置昵称"}
                  className="w-full max-w-90 h-10"
                />
                <Button
                  onClick={() => {
                    if (!nickname.trim()) return show("请输入昵称", "err");
                    updateProfile.mutate({ nickname: nickname.trim() });
                  }}
                  variant="outline"
                  className="h-10 px-4 text-[15px] font-bold text-ink-secondary rotate-[0.5deg]"
                >
                  保存
                </Button>
              </div>
            </div>
            <div>
              <label className="block font-hand-display text-[16px] font-bold text-ink-secondary mb-1.5">
                修改密码
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="password"
                  value={oldPwd}
                  onChange={(e) => setOldPwd(e.target.value)}
                  placeholder="原密码"
                  className="w-full max-w-40 h-10"
                />
                <Input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="新密码（至少 6 位）"
                  className="w-full max-w-50 h-10"
                />
                <Input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="确认新密码"
                  className="w-full max-w-50 h-10"
                />
                <Button
                  onClick={() => {
                    if (!oldPwd || !newPwd || !confirmPwd) return show("请填写完整", "err");
                    if (newPwd.length < 6) return show("新密码至少 6 位", "err");
                    if (newPwd !== confirmPwd) return show("两次输入的新密码不一致", "err");
                    changePassword.mutate({ oldPassword: oldPwd, newPassword: newPwd });
                  }}
                  variant="outline"
                  className="h-10 px-4 text-[15px] font-bold text-ink-secondary rotate-[-0.5deg]"
                >
                  修改
                </Button>
              </div>
              <p className="mt-1 font-hand-body text-[12px] text-ink-faint">密码使用 bcrypt 加密存储</p>
            </div>
          </div>
        </section>

        {/* 数据备份 */}
        <section className="bg-white sketch-border sketch-shadow p-6 fade-up" style={{ animationDelay: "80ms" }}>
          <h3 className="font-hand-display text-[22px] font-bold text-ink-secondary marker-underline inline-block mb-5">
            数据备份
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={doBackup}
              className="flex flex-col items-center gap-2 px-4 py-5 sketch-dashed hover:bg-canvas-soft transition-colors"
            >
              <span className="font-hand-display text-[20px] font-bold text-primary">⬇</span>
              <span className="font-hand-display text-[17px] font-bold text-ink-secondary">一键导出备份</span>
              <span className="font-hand-body text-[13px] text-ink-faint">全量 JSON 下载</span>
            </button>
            <Link
              href={`${ADMIN_HOME}/backups`}
              className="flex flex-col items-center gap-2 px-4 py-5 sketch-dashed hover:bg-canvas-soft transition-colors"
            >
              <span className="font-hand-display text-[20px] font-bold text-sticker-teal">⏱</span>
              <span className="font-hand-display text-[17px] font-bold text-ink-secondary">定期自动备份</span>
              <span className="font-hand-body text-[13px] text-ink-faint">前往备份管理</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
