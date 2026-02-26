import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Zod Şeması: Klinik Profili Doğrulaması
const profileSchema = z.object({
    clinicName: z.string().min(2, "Klinik adı en az 2 karakter olmalıdır").max(100).optional(),
    clinicWebsite: z.string().url("Geçerli bir URL giriniz").or(z.literal("")).optional(),
    clinicAddress: z.string().max(500).optional(),
    logoUrl: z.string().url().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        // Kullanıcının sahip olduğu ilk takımı (klinik) bul
        const team = await prisma.team.findFirst({
            where: { ownerId: session.user.id },
            select: {
                clinicName: true,
                clinicWebsite: true,
                clinicAddress: true,
            },
        });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { logoUrl: true }
        });

        if (!team) {
            // Eğer takımı yoksa kullanıcı için bir tane oluştur veya boş dön
            return NextResponse.json({
                profile: {
                    clinicName: "",
                    clinicWebsite: "",
                    clinicAddress: "",
                    logoUrl: user?.logoUrl || ""
                }
            });
        }

        return NextResponse.json({
            profile: { ...team, logoUrl: user?.logoUrl }
        });
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
        const validation = profileSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                error: "Geçersiz veri",
                details: validation.error.format()
            }, { status: 400 });
        }

        const { clinicName, clinicWebsite, clinicAddress, logoUrl } = validation.data;

        // 1. Kullanıcı logosunu güncelle
        if (logoUrl !== undefined) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { logoUrl }
            });
        }

        // 2. Takım (Klinik) bilgilerini güncelle
        const team = await prisma.team.findFirst({
            where: { ownerId: session.user.id }
        });

        if (team) {
            const updatedTeam = await prisma.team.update({
                where: { id: team.id },
                data: { clinicName, clinicWebsite, clinicAddress },
            });
            return NextResponse.json({ success: true, profile: { ...updatedTeam, logoUrl } });
        } else {
            // Eğer takım yoksa yeni oluştur (First run scenario)
            const newTeam = await prisma.team.create({
                data: {
                    name: clinicName || "Klinik",
                    ownerId: session.user.id,
                    clinicName,
                    clinicWebsite,
                    clinicAddress
                }
            });
            return NextResponse.json({ success: true, profile: { ...newTeam, logoUrl } });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
