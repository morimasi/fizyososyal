import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { analyzeClinicBrand } from "@/services/ai/gemini.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        // 1. Klinik verilerini getir
        const team = await prisma.team.findFirst({
            where: { ownerId: session.user.id },
            include: {
                posts: {
                    take: 5,
                    orderBy: { createdAt: "desc" },
                    select: { title: true }
                }
            }
        });

        if (!team) {
            return NextResponse.json({ error: "Klinik verisi bulunamadı." }, { status: 404 });
        }

        // 2. Gemini ile analiz et
        console.log("[AI-BRAND] Marka analizi başlatılıyor: ", team.clinicName || team.name);
        const suggestion = await analyzeClinicBrand({
            name: team.clinicName || team.name,
            address: team.clinicAddress,
            website: team.clinicWebsite,
            posts: team.posts
        });

        return NextResponse.json({
            success: true,
            suggestion
        });

    } catch (error: any) {
        console.error("[AI-BRAND] API Hatası:", error);
        return NextResponse.json({
            error: "Marka analizi sırasında bir hata oluştu.",
            details: error.message
        }, { status: 500 });
    }
}
