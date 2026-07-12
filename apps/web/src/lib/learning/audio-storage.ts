import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const audioBucket = process.env.NEXT_PUBLIC_AUDIO_BUCKET ?? "native-audio";

export function isRecordedAudioUrl(fileUrl: string, status?: string) {
  return Boolean(fileUrl) && status !== "placeholder";
}

export function resolveAudioUrl(fileUrl: string, status?: string) {
  if (!isRecordedAudioUrl(fileUrl, status)) return "";
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) return fileUrl;

  const supabase = createSupabaseBrowserClient();
  if (!supabase) return "";
  const { data } = supabase.storage.from(audioBucket).getPublicUrl(fileUrl);
  return data.publicUrl;
}
