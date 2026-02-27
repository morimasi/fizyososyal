import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename");

    if (!filename || !req.body) {
      return NextResponse.json({ error: "Dosya veya isim eksik" }, { status: 400 });
    }

    const blob = await put(filename, req.body, {
      access: "public",
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Yükleme başarısız" }, { status: 500 });
  }
}
