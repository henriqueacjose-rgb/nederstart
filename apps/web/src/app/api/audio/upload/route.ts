import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const audioBucket = process.env.NEXT_PUBLIC_AUDIO_BUCKET ?? "native-audio";

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_APP_ENV === "production" || process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "Audio uploads are disabled in production" }, { status: 403 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  const lessonCode = String(formData.get("lessonCode") ?? "").trim();
  const transcriptNl = String(formData.get("transcriptNl") ?? "").trim();
  const speed = String(formData.get("speed") ?? "natural").trim();
  const type = String(formData.get("type") ?? "phrase").trim();

  if (!(file instanceof File) || !lessonCode || !transcriptNl) {
    return NextResponse.json({ error: "file, lessonCode and transcriptNl are required" }, { status: 400 });
  }

  const extension = file.name.split(".").pop() || "mp3";
  const storagePath = `audio/${lessonCode}/${type}/${Date.now()}-${transcriptNl
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}.${extension}`;

  const upload = await supabase.storage.from(audioBucket).upload(storagePath, file, {
    contentType: file.type || "audio/mpeg",
    upsert: true
  });
  if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 });

  const { data: lesson } = await supabase.from("lessons").select("id").eq("code", lessonCode).single();
  if (!lesson?.id) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const asset = await supabase.from("audio_assets").insert({
    lesson_id: lesson.id,
    type,
    speed,
    file_url: storagePath,
    transcript_nl: transcriptNl,
    status: "published"
  });
  if (asset.error) return NextResponse.json({ error: asset.error.message }, { status: 500 });

  const { data: publicUrl } = supabase.storage.from(audioBucket).getPublicUrl(storagePath);
  return NextResponse.json({ path: storagePath, publicUrl: publicUrl.publicUrl });
}
