import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const url = searchParams.get("url");
    const itag = searchParams.get("itag");

    if (!url || !ytdl.validateURL(url)) {
      return NextResponse.json(
        { error: "Geçerli bir YouTube URL'si girin" },
        { status: 400 }
      );
    }

    if (!itag) {
      return NextResponse.json(
        { error: "Format (itag) gerekli" },
        { status: 400 }
      );
    }

    const info = await ytdl.getInfo(url);
    const format = info.formats.find((f) => f.itag === parseInt(itag, 10));

    if (!format) {
      return NextResponse.json(
        { error: "Seçilen format bulunamadı" },
        { status: 404 }
      );
    }

    const title = info.videoDetails.title
      .replace(/[^\w\sÇçĞğİıÖöŞşÜü-]/g, "")
      .trim()
      .replace(/\s+/g, "_");
    const ext = format.container || "mp4";
    const filename = `${title}.${ext}`;

    const stream = ytdl(url, { filter: (f) => f.itag === parseInt(itag, 10) });

    const readable = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        stream.on("end", () => {
          controller.close();
        });
        stream.on("error", (err: Error) => {
          controller.error(err);
        });
      },
    });

    const headers: Record<string, string> = {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": format.mimeType || "video/mp4",
    };
    if (format.contentLength) {
      headers["Content-Length"] = format.contentLength;
    }

    return new NextResponse(readable, { headers });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Bilinmeyen hata oluştu";
    return NextResponse.json(
      { error: `İndirme hatası: ${message}` },
      { status: 500 }
    );
  }
}
