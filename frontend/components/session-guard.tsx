"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getCurrentUser } from "@/lib/api";

export function SessionGuard() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      const token = localStorage.getItem("alalai_token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const user = await getCurrentUser();
      if (!cancelled && !user) {
        clearToken();
        router.replace("/login?session=expired");
        router.refresh();
      }
    }

    verifySession();
    const interval = window.setInterval(verifySession, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [router]);

  return null;
}
