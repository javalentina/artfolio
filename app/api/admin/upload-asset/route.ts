import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const BUCKET = "media";
const ARTIST_FOLDER = "natalia-uchitel/assets";

// Uploads to storage only — does NOT insert into the media table.
// Use this for project/concert/bio images that should not appear
// in the start-page gallery (Momente section).
export async function POST(req: NextRequest) {
  const authSupabase = await createAuthClient();
  const { data: { user } } = await authSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop();
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `${ARTIST_FOLDER}/${safeName}`;

  const bytes = await file.arrayBuffer();
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, cacheControl: "31536000", upsert: false });

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: urlData.publicUrl });
}
