"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AudioPlaceholder } from "@nederstart/shared";
import { resolveAudioUrl } from "@/lib/learning/audio-storage";
import { updateLessonProgress } from "@/lib/learning/progress-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type PlaybackSpeed = "slow" | "natural";

function durationForTranscript(transcript: string, speed: PlaybackSpeed) {
  const words = Math.max(2, transcript.split(/\s+/).filter(Boolean).length);
  const seconds = words * (speed === "slow" ? 0.9 : 0.55);
  return Math.max(2.5, Math.min(12, seconds));
}

export function AudioPlayer({ lessonCode, items }: { lessonCode: string; items: AudioPlaceholder[] }) {
  const playableItems = useMemo(
    () => items.filter((item) => item.speed !== "reduced").slice(0, 10),
    [items]
  );
  const [index, setIndex] = useState(0);
  const [speed, setSpeed] = useState<PlaybackSpeed>("natural");
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [audioError, setAudioError] = useState("");
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const current = playableItems[index];
  const audioUrl = current ? resolveAudioUrl(current.fileUrl, current.status) : "";
  const hasRecordedAudio = Boolean(audioUrl);
  const simulatedDuration = current ? durationForTranscript(current.transcriptNl, speed) : 1;
  const duration = hasRecordedAudio && recordedDuration > 0 ? recordedDuration : simulatedDuration;
  const progress = Math.min(100, Math.round((elapsed / duration) * 100));

  useEffect(() => {
    if (!isPlaying || !current || hasRecordedAudio) return undefined;
    timerRef.current = window.setInterval(() => {
      setElapsed((value) => {
        const next = value + 0.1;
        if (next >= duration) {
          window.clearInterval(timerRef.current ?? undefined);
          timerRef.current = null;
          setIsPlaying(false);
          void updateLessonProgress(lessonCode, { audioCompleted: true });
          return duration;
        }
        return next;
      });
    }, 100);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [current, duration, hasRecordedAudio, isPlaying, lessonCode]);

  useEffect(() => {
    setAudioError("");
    setElapsed(0);
    setRecordedDuration(0);
    setIsPlaying(false);
  }, [audioUrl, current?.id]);

  useEffect(() => {
    if (!audioRef.current || !hasRecordedAudio) return;
    audioRef.current.playbackRate = speed === "slow" ? 0.75 : 1;
  }, [hasRecordedAudio, speed]);

  async function togglePlayback() {
    if (hasRecordedAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch {
          setAudioError("Audio file could not be played.");
          setIsPlaying(false);
        }
      }
      return;
    }
    setIsPlaying((value) => !value);
  }

  function replay() {
    setElapsed(0);
    if (hasRecordedAudio && audioRef.current) {
      audioRef.current.currentTime = 0;
      void audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setAudioError("Audio file could not be played.");
          setIsPlaying(false);
        });
      return;
    }
    setIsPlaying(true);
  }

  function nextItem() {
    setIsPlaying(false);
    setElapsed(0);
    setIndex((value) => (value + 1) % playableItems.length);
  }

  if (playableItems.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-bold text-brand-text">Audio</h2>
        <p className="mt-2 text-sm text-brand-muted">No audio items available for this lesson yet.</p>
      </Card>
    );
  }

  return (
    <Card className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-accent">Native audio reference</p>
          <h2 className="mt-1 text-xl font-bold text-brand-text">{current.transcriptNl}</h2>
          <p className="mt-1 text-sm text-brand-muted">Voice slot: default native NL voice</p>
        </div>
        <div className="flex rounded-component border border-brand-border bg-white p-1">
          {(["slow", "natural"] as PlaybackSpeed[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={speed === option}
              onClick={() => {
                setSpeed(option);
                setElapsed(0);
                setIsPlaying(false);
              }}
              className={`rounded-component px-3 py-2 text-sm font-semibold transition ${
                speed === option ? "bg-brand-primary text-white" : "text-brand-muted hover:bg-brand-background"
              }`}
            >
              {option === "slow" ? "Slow" : "Natural"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        {hasRecordedAudio ? (
          <audio
            ref={audioRef}
            src={audioUrl}
            onLoadedMetadata={(event) => setRecordedDuration(event.currentTarget.duration || 0)}
            onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)}
            onEnded={() => {
              setIsPlaying(false);
              void updateLessonProgress(lessonCode, { audioCompleted: true });
            }}
            onError={() => setAudioError("Audio file not found yet. Placeholder playback remains available.")}
          />
        ) : null}
        <div
          className="h-2 overflow-hidden rounded-full bg-brand-border"
          role="progressbar"
          aria-label="Audio playback progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="h-full rounded-full bg-brand-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-xs font-semibold text-brand-muted">
          <span>{elapsed.toFixed(1)}s</span>
          <span>{duration.toFixed(1)}s</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={togglePlayback}>
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button type="button" variant="secondary" onClick={replay}>
          Replay
        </Button>
        <Button type="button" variant="secondary" onClick={nextItem}>
          Next audio
        </Button>
      </div>

      <p className="text-sm text-brand-muted">
        Item {index + 1} of {playableItems.length}.{" "}
        {hasRecordedAudio
          ? "Playing recorded native audio from Supabase Storage."
          : "Placeholder playback simulates the audio timeline until recorded files are connected."}
      </p>
      {audioError ? <p className="rounded-component bg-[#FFF3E8] p-3 text-sm text-brand-warning">{audioError}</p> : null}
    </Card>
  );
}
