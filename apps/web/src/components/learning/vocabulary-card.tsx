"use client";

import { useMemo, useRef, useState } from "react";
import type { VocabularyItem } from "@nederstart/shared";
import { resolveAudioUrl } from "@/lib/learning/audio-storage";
import { Button } from "@/components/ui/button";

function shortPronunciationHint(explanation?: string) {
  const text = explanation?.toLowerCase() ?? "";
  const hints: string[] = [];

  if (text.includes("boca") || text.includes("labios") || text.includes("lábios")) hints.push("Boca controlada");
  if (text.includes("relax")) hints.push("Boca relaxada");
  if (text.includes("curto") || text.includes("seca")) hints.push("Som curto");
  if (text.includes("nao acrescente") || text.includes("não acrescente")) hints.push("Não acrescentar vogal final");
  if (text.includes("garganta") || text.includes("friccao") || text.includes("fricção")) hints.push("Som atrás da boca");
  if (text.includes("audio nativo") || text.includes("áudio nativo")) hints.push("Imitar o áudio nativo");

  return hints.slice(0, 3);
}

function speechIndicators(explanation?: string) {
  const text = explanation?.toLowerCase() ?? "";

  const mouth =
    text.includes("relax") ? "relaxada" : text.includes("arredond") ? "arredondada" : text.includes("aberta") ? "aberta" : "ouvir audio";
  const tongue =
    text.includes("frente") ? "frente" : text.includes("tras") || text.includes("trás") ? "atrás" : text.includes("lingua") || text.includes("língua") ? "controlada" : "ouvir audio";
  const throat =
    text.includes("garganta") || text.includes("friccao") || text.includes("fricção") || text.includes("g/ch")
      ? "sim"
      : "se aplicável";

  return { mouth, tongue, throat };
}

export function VocabularyCard({ item }: { item: VocabularyItem }) {
  const [audioStatus, setAudioStatus] = useState<"idle" | "playing" | "pending">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useMemo(() => (item.audioPath ? resolveAudioUrl(item.audioPath, "recorded") : ""), [item.audioPath]);
  const hints = shortPronunciationHint(item.explanation);
  const indicators = speechIndicators(item.explanation);

  async function playAudio() {
    if (!audioUrl) {
      setAudioStatus("pending");
      return;
    }

    if (!audioRef.current) audioRef.current = new Audio(audioUrl);
    audioRef.current.currentTime = 0;

    try {
      await audioRef.current.play();
      setAudioStatus("playing");
    } catch {
      setAudioStatus("pending");
    }
  }

  return (
    <article className="grid gap-3 rounded-component border border-brand-border bg-white p-4 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-words text-2xl font-bold text-brand-text sm:text-3xl">{item.textNl}</p>
          <div className="mt-2 grid gap-1 text-sm text-brand-muted">
            <p>
              <span className="font-semibold text-brand-text">PT:</span> {item.translationPt}
            </p>
            <p>
              <span className="font-semibold text-brand-text">EN:</span> {item.translationEn}
            </p>
          </div>
        </div>

        <Button type="button" onClick={playAudio} className="w-full sm:w-auto">
          Play audio
        </Button>
      </div>

      <div className="rounded-component bg-brand-background p-3">
        <p className="text-xs font-semibold uppercase text-brand-accent">Pronunciation first</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(hints.length ? hints : ["Ouvir primeiro", "Repetir curto", "Comparar com áudio"]).map((hint) => (
            <span key={hint} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-brand-text">
              {hint}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-2 text-xs sm:grid-cols-3 sm:text-sm">
        <span className="rounded-component border border-brand-border px-2.5 py-2 text-brand-muted">
          <span className="font-semibold text-brand-text">👄 Boca:</span> {indicators.mouth}
        </span>
        <span className="rounded-component border border-brand-border px-2.5 py-2 text-brand-muted">
          <span className="font-semibold text-brand-text">👅 Língua:</span> {indicators.tongue}
        </span>
        <span className="rounded-component border border-brand-border px-2.5 py-2 text-brand-muted">
          <span className="font-semibold text-brand-text">🗣️ Garganta:</span> {indicators.throat}
        </span>
      </div>

      {audioStatus === "pending" ? (
        <p className="rounded-component bg-[#FFF3E8] p-3 text-sm font-semibold text-brand-warning">Audio pending</p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="secondary" className="w-full sm:w-auto">
          Praticar
        </Button>
      </div>

      <details className="rounded-component border border-brand-border p-3">
        <summary className="cursor-pointer font-semibold text-brand-text">Ver detalhes</summary>
        <div className="mt-3 grid gap-3 text-sm leading-7 text-brand-muted">
          {item.example ? <p>{item.example}</p> : null}
          <p>{item.explanation ?? "Use o áudio nativo como referência principal antes de repetir."}</p>
        </div>
      </details>
    </article>
  );
}
