const ALLOWED = ["cdninstagram.com", "fbcdn.net", "instagram.com"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("u");
  if (!target) return new Response("missing u", { status: 400 });

  let host: string;
  try {
    host = new URL(target).hostname;
  } catch {
    return new Response("bad url", { status: 400 });
  }
  if (!ALLOWED.some((d) => host === d || host.endsWith("." + d))) {
    return new Response("forbidden host", { status: 403 });
  }

  try {
    const upstream = await fetch(target, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Referer: "https://www.instagram.com/",
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
      },
      // los recursos de imagen también se cachean en el edge
      next: { revalidate: 3600 },
    });
    if (!upstream.ok) return new Response("upstream error", { status: 502 });

    const buf = await upstream.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response("fetch failed", { status: 502 });
  }
}
