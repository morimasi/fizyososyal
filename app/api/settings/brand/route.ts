import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                brandVoice: true,
                //@ts-expect-error Prisma client not synced
                brandColors: true,
                //@ts-expect-error Prisma client not synced
                brandKeywords: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
        }

        return NextResponse.json({ brand: user });
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
        const { brandVoice, brandColors, brandKeywords } = body;

        const updated = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                brandVoice,
                ...(brandColors && { brandColors }),
                ...(brandKeywords && { brandKeywords }),
            } as any,
            select: {
                brandVoice: true,
                brandColors: true,
                brandKeywords: true,
            },
        });

        return NextResponse.json({ success: true, brand: updated });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
