"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await signOut({ redirect: false });
        router.push("/login");
        router.refresh();
      }}
      className="font-hand-body text-[14px] text-[#615d59] hover:text-[#0075de] transition-colors"
    >
      退出登录
    </button>
  );
}
