import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";
const BUCKET = "media";
const ARTIST_FOLDER = "natalia-uchitel";

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

  const { error: dbError } = await supabase.from("media").insert({
    artist_id: ARTIST_ID,
    url: urlData.publicUrl,
    filename: file.name,
    alt: { de: "", en: "", ru: "" },
  });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ url: urlData.publicUrl });
}
