"use client";

import { useMemo, useRef, useState } from "react";
import type { PhraseItem } from "@nederstart/shared";
import { resolveAudioUrl } from "@/lib/learning/audio-storage";
import { Button } from "@/components/ui/button";

function compactBlocks(blocks?: string) {
  if (!blocks) return "Ouvir por blocos";
  return blocks.replace(/\s+/g, " ").trim();
}

function phraseHint(explanation?: string) {
  const text = explanation?.toLowerCase() ?? "";
  const hints: string[] = [];

  if (text.includes("blocos")) hints.push("Falar por blocos");
  if (text.includes("ritmo")) hints.push("Manter ritmo");
  if (text.includes("entoacao") || text.includes("entoação")) hints.push("Subir/descer natural");
  if (text.includes("reduc")) hints.push("Aceitar redução natural");
  if (text.includes("audio nativo") || text.includes("áudio nativo")) hints.push("Copiar áudio nativo");

  return hints.slice(0, 3);
}

export function PhraseCard({ item }: { item: PhraseItem }) {
  const [audioStatus, setAudioStatus] = useState<"idle" | "playing" | "pending">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useMemo(() => (item.audioPath ? resolveAudioUrl(item.audioPath, "recorded") : ""), [item.audioPath]);
  const hints = phraseHint(item.explanation);

  async function playAudio(_speed: "slow" | "natural") {
    if (!audioUrl) {
      setAudioStatus("pending");
      return;
    }

    if (!audioRef.current) audioRef.current = new Audio(audioUrl);
    audioRef.current.currentTime = 0;

    try {
      audioRef.current.playbackRate = _speed === "slow" ? 0.75 : 1;
      await audioRef.current.play();
      setAudioStatus("playing");
    } catch {
      setAudioStatus("pending");
    }
  }

  return (
    <article className="grid gap-4 rounded-component border border-brand-border bg-white p-4 shadow-soft">
      <div className="grid gap-3">
        <p className="break-words text-2xl font-bold leading-tight text-brand-text">{item.textNl}</p>
        <div className="grid gap-1 text-sm text-brand-muted">
          <p>
            <span className="font-semibold text-brand-text">PT:</span> {item.translationPt}
          </p>
          <p>
            <span className="font-semibold text-brand-text">EN:</span> {item.translationEn}
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-[auto_auto_1fr]">
        <Button type="button" onClick={() => playAudio("slow")} className="w-full">
          Slow
        </Button>
        <Button type="button" onClick={() => playAudio("natural")} className="w-full">
          Natural
        </Button>
        <Button type="button" variant="secondary" className="w-full">
          Shadowing
        </Button>
      </div>

      {audioStatus === "pending" ? (
        <p className="rounded-component bg-[#FFF3E8] p-3 text-sm font-semibold text-brand-warning">Audio pending</p>
      ) : null}

      <div className="rounded-component bg-brand-background p-3">
        <p className="text-xs font-semibold uppercase text-brand-accent">Sound blocks</p>
        <p className="mt-1 text-sm font-semibold text-brand-text">{compactBlocks(item.soundBlocks)}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(hints.length ? hints : ["Ouvir lento", "Repetir por blocos", "Depois natural"]).map((hint) => (
            <span key={hint} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-text">
              {hint}
            </span>
          ))}
        </div>
      </div>

      <details className="rounded-component border border-brand-border p-3">
        <summary className="cursor-pointer font-semibold text-brand-text">Ver detalhes</summary>
        <div className="mt-3 grid gap-3 text-sm leading-7 text-brand-muted">
          {item.slowForm ? (
            <p>
              <span className="font-semibold text-brand-text">Slow:</span> {item.slowForm}
            </p>
          ) : null}
          {item.naturalForm ? (
            <p>
              <span className="font-semibold text-brand-text">Natural:</span> {item.naturalForm}
            </p>
          ) : null}
          {item.reducedForm ? (
            <p>
              <span className="font-semibold text-brand-text">Reduced:</span> {item.reducedForm}
            </p>
          ) : null}
          <p>{item.explanation ?? "Use o áudio nativo como referência principal antes de repetir."}</p>
        </div>
      </details>
    </article>
  );
}
