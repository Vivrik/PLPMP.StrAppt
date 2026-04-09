"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleLogin() {
    setError(null);

    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? "Unable to sign in.");
          return;
        }

        router.refresh();
      })();
    });
  }

  return (
    <div className="panel" style={{ maxWidth: "32rem", margin: "0 auto" }}>
      <span className="eyebrow">Admin access</span>
      <h2 style={{ marginTop: "1rem" }}>Review submissions and report status.</h2>
      <p className="muted-copy">
        This internal view is protected with a lightweight admin password for the MVP.
      </p>
      <div className="field" style={{ marginTop: "1rem" }}>
        <label htmlFor="admin-password">Admin password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      {error ? <div className="error-state" style={{ marginTop: "1rem" }}>{error}</div> : null}
      <div className="stack-row" style={{ marginTop: "1rem" }}>
        <button type="button" className="primary-button" disabled={isPending} onClick={handleLogin}>
          {isPending ? "Signing in..." : "Open dashboard"}
        </button>
      </div>
    </div>
  );
}
