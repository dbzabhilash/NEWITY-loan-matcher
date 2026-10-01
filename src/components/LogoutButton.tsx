"use client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button type="button" onClick={() => fetch("/api/logout", { method: "POST" }).then(() => router.push("/login"))} className="font-medium hover:text-ink">
      Log out
    </button>
  );
}
