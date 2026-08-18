"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ADMIN_LOGIN } from "@/lib/config";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await signOut({ redirect: false });
        router.push(ADMIN_LOGIN);
        router.refresh();
      }}
      className="font-hand-body text-[14px] text-ink-muted hover:text-primary transition-colors"
    >
      退出登录
    </button>
  );
}
