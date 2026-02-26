import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Zod Şeması: Marka Kimliği Doğrulaması
const brandSchema = z.object({
    brandVoice: z.string().max(2000).optional(),
    brandColors: z.array(z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Geçersiz renk formatı")).optional(),
    brandKeywords: z.array(z.string().max(50)).optional(),
});

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const team = await prisma.team.findFirst({
            where: { ownerId: session.user.id },
            select: {
                brandVoice: true,
                brandColors: true,
                brandKeywords: true,
            },
        });

        if (!team) {
            return NextResponse.json({
                brand: {
                    brandVoice: "",
                    brandColors: ["#8b5cf6", "#1e293b"],
                    brandKeywords: []
                }
            });
        }

        return NextResponse.json({ brand: team });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const body = await req.json();

        // Zod ile Doğrulama
        const validation = brandSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                error: "Geçersiz veri",
                details: validation.error.format()
            }, { status: 400 });
        }

        const { brandVoice, brandColors, brandKeywords } = validation.data;

        const team = await prisma.team.findFirst({
            where: { ownerId: session.user.id }
        });

        if (!team) {
            // Takım yoksa oluştur
            const newTeam = await prisma.team.create({
                data: {
                    name: "Klinik",
                    ownerId: session.user.id,
                    brandVoice,
                    brandColors,
                    brandKeywords
                }
            });
            return NextResponse.json({ success: true, brand: newTeam });
        }

        const updated = await prisma.team.update({
            where: { id: team.id },
            data: {
                brandVoice,
                brandColors,
                brandKeywords,
            },
        });

        return NextResponse.json({ success: true, brand: updated });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
