import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKETS = new Set(["avatars", "progress"]);

export async function GET(
  _request: Request,
  context: { params: Promise<{ bucket: string; path: string[] }> },
) {
  const { bucket, path: parts } = await context.params;
  if (!BUCKETS.has(bucket) || parts.length === 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  const objectPath = parts.map((part) => decodeURIComponent(part)).join("/");
  if (objectPath.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("Sign in required", { status: 401 });
  }

  const { data, error } = await supabase.storage.from(bucket).download(objectPath);
  if (error || !data) {
    const signed = await supabase.storage.from(bucket).createSignedUrl(objectPath, 120);
    if (signed.data?.signedUrl) {
      return NextResponse.redirect(signed.data.signedUrl);
    }
    return new NextResponse("Could not open this photo.", { status: 404 });
  }

  const bytes = await data.arrayBuffer();
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": data.type || "image/webp",
      "Cache-Control": "private, max-age=300",
    },
  });
}
