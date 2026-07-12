"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Check = {
  name: string;
  status: "pass" | "warn" | "fail";
  detail: string;
};

type BetaCheckResponse = {
  status: "pass" | "warn" | "fail";
  env: {
    appEnv: string;
    supabaseConfigured: boolean;
    requireAuth: boolean;
    audioBucket: string;
    missing: string[];
  };
  checks: Check[];
};

const styles = {
  pass: "bg-[#E3F3EC] text-brand-success",
  warn: "bg-[#FFF3E8] text-brand-warning",
  fail: "bg-[#FDE8E8] text-red-700"
};

export function BetaCheckPanel() {
  const [data, setData] = useState<BetaCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/beta-check", { cache: "no-store" });
      setData((await response.json()) as BetaCheckResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Beta check failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="grid gap-4">
      <Card className="grid gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-accent">QA technical check</p>
            <h2 className="text-2xl font-bold text-brand-text">
              {loading ? "Running checks" : `Status: ${data?.status ?? "error"}`}
            </h2>
          </div>
          <Button type="button" onClick={load} disabled={loading}>
            {loading ? "Checking..." : "Run again"}
          </Button>
        </div>
        {error ? <p className="rounded-component bg-[#FDE8E8] p-3 text-sm font-semibold text-red-700">{error}</p> : null}
      </Card>

      {data ? (
        <>
          <Card className="grid gap-2">
            <h2 className="text-xl font-bold text-brand-text">Environment</h2>
            <p className="text-sm text-brand-muted">Mode: {data.env.appEnv}</p>
            <p className="text-sm text-brand-muted">Supabase configured: {String(data.env.supabaseConfigured)}</p>
            <p className="text-sm text-brand-muted">Auth required: {String(data.env.requireAuth)}</p>
            <p className="text-sm text-brand-muted">Audio bucket: {data.env.audioBucket}</p>
            {data.env.missing.length ? (
              <p className="text-sm text-brand-warning">Missing: {data.env.missing.join(", ")}</p>
            ) : null}
          </Card>

          <div className="grid gap-3">
            {data.checks.map((check) => (
              <Card key={check.name} className="grid gap-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-brand-text">{check.name}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[check.status]}`}>
                    {check.status}
                  </span>
                </div>
                <p className="text-sm text-brand-muted">{check.detail}</p>
              </Card>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
