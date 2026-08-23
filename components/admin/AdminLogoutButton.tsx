"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  const router = useRouter();

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("nilasa-auth-token");
      window.localStorage.removeItem("nilasa-user");
      document.cookie = "nilasa_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/admin/login";
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="admin-menu-item"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "#F87171",
        background: "none",
        border: "none",
        padding: "8px 0",
        fontFamily: "var(--font-mono)",
        fontSize: "0.76rem",
        cursor: "pointer",
        transition: "color 0.15s ease"
      }}
    >
      <LogOut size={14} strokeWidth={2} />
      <span>Sign Out</span>
    </button>
  );
}
