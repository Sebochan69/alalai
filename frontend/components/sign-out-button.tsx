"use client";

import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/api";

export function SignOutButton({
  className,
  iconOnly = false,
  label = "Sign out",
}: {
  className: string;
  iconOnly?: boolean;
  label?: string;
}) {
  const router = useRouter();

  function handleSignOut() {
    clearToken();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={className}
      aria-label="Sign out"
      title="Sign out"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {!iconOnly && <span>{label}</span>}
    </button>
  );
}
