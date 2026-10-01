"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Mirrors the users seeded in drizzle/0001; all passwords are "password" (drizzle/0002).
const SDRS = ["sdr1", "sdr2", "sdr3", "sdr4", "sdr5", "sdr6", "sdr7", "sdr8"];
const MANAGERS = ["manager1", "manager2"];
const sdrStyle = "bg-blue-soft text-blue";
const managerStyle = "bg-green-soft text-ink";

export default function LoginPage() {
  const [username, setUsername] = useState(SDRS[0]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: f.get("username"), password: f.get("password") }),
    });
    if (!res.ok) {
      setError("That username and password don't match.");
      setBusy(false);
      return;
    }
    const user = await res.json();
    router.push(user.role === "manager" ? "/manager" : "/");
  }

  const field = "h-10 rounded-md border border-border px-3 text-base font-normal";
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6">
      <form onSubmit={submit} className="flex w-full max-w-[360px] flex-col gap-5 rounded-lg border border-border bg-white p-6 sm:p-8">
        <div className="flex items-center gap-[14px]">
          <span className="text-[20px] font-[800] leading-6 tracking-[0.08em] text-blue">NEWITY</span>
          <span className="h-5 w-px bg-border" />
          <span className="text-base font-medium leading-5">Loan Matcher</span>
        </div>
        <label className="flex flex-col gap-[6px] text-sm font-medium">
          Username
          <select
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            className={`${field} ${MANAGERS.includes(username) ? managerStyle : sdrStyle}`}
          >
            <optgroup label="SDRs">
              {SDRS.map((u) => <option key={u} className={sdrStyle}>{u}</option>)}
            </optgroup>
            <optgroup label="Sales managers">
              {MANAGERS.map((u) => <option key={u} className={managerStyle}>{u}</option>)}
            </optgroup>
          </select>
        </label>
        <label className="flex flex-col gap-[6px] text-sm font-medium">
          Password
          <input type="password" name="password" autoComplete="current-password" defaultValue="password" required className={`${field} bg-white`} />
        </label>
        {error && <p className="rounded-md bg-red-soft px-3 py-2 text-sm text-red">{error}</p>}
        <button type="submit" disabled={busy} className="h-[38px] rounded-full bg-blue text-[14px] font-semibold text-white disabled:opacity-60">
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
    </main>
  );
}
