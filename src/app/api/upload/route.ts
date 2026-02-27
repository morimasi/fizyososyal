import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";

const uploadSchema = z.object({
  filename: z.string().min(1, "Dosya adı gerekli"),
});

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz erişim", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ 
        error: "Dosya gerekli", 
        code: "FILE_REQUIRED" 
      }, { status: 400 });
    }

    const filename = formData.get("filename") as string || file.name;
    
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "İzin verilmeyen dosya türü", 
        code: "INVALID_FILE_TYPE",
        allowedTypes
      }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "Dosya çok büyük (max 10MB)", 
        code: "FILE_TOO_LARGE" 
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const uniqueFilename = `${session.user.id}/${Date.now()}-${filename}`;
    
    const blob = await put(uniqueFilename, buffer, {
      access: "public",
      contentType: file.type,
    });

    console.log("File uploaded:", { userId: session.user.id, filename: uniqueFilename, url: blob.url });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: uniqueFilename,
      size: file.size,
      type: file.type
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Upload error:", errorMsg);
    
    return NextResponse.json({ 
      error: "Yükleme başarısız", 
      details: process.env.NODE_ENV === "development" ? errorMsg : undefined,
      code: "UPLOAD_FAILED"
    }, { status: 500 });
  }
}
