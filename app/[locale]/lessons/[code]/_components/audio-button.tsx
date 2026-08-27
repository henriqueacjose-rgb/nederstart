'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useMounted } from '@/components/client-only';
import { Volume2, Gauge, Repeat, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Pronunciation playback using the browser Web Speech API (SpeechSynthesis).
 * This is a SYNTHESIZED development placeholder, NOT real native audio.
 * It is clearly labelled as such in the UI.
 */
export function AudioButton({
  text,
  compact = false,
}: {
  text: string;
  compact?: boolean;
}) {
  const t = useTranslations('lesson');
  const mounted = useMounted();
  const [speaking, setSpeaking] = useState(false);

  const supported =
    mounted &&
    typeof window !== 'undefined' &&
    'speechSynthesis' in window;

  const speak = useCallback(
    (rate: number) => {
      if (!supported) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'nl-NL';
        utter.rate = rate;
        const voices = window.speechSynthesis.getVoices();
        const nl = voices.find((v) => v.lang?.toLowerCase().startsWith('nl'));
        if (nl) utter.voice = nl;
        utter.onstart = () => setSpeaking(true);
        utter.onend = () => setSpeaking(false);
        utter.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(utter);
      } catch {
        setSpeaking(false);
      }
    },
    [supported, text]
  );

  if (compact) {
    return (
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={cn('h-8 w-8 shrink-0', speaking && 'text-primary')}
        onClick={() => speak(1)}
        disabled={!supported}
        aria-label={t('listen')}
      >
        <Volume2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="default"
          onClick={() => speak(1)}
          disabled={!supported}
          className={cn(speaking && 'opacity-80')}
        >
          <Volume2 className="mr-1.5 h-4 w-4" />
          {t('playNormal')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => speak(0.6)}
          disabled={!supported}
        >
          <Gauge className="mr-1.5 h-4 w-4" />
          {t('playSlow')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => speak(1)}
          disabled={!supported}
        >
          <Repeat className="mr-1.5 h-4 w-4" />
          {t('repeat')}
        </Button>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Info className="h-3 w-3 shrink-0" />
        {t('audioPlaceholder')}
      </p>
    </div>
  );
}
