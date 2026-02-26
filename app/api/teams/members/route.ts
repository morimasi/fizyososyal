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

        // Önce kullanıcının kendi sahibi olduğu ilk takımı al 
        // (İlerde çoklu takım yönetimi gelirse burası id ile dinamik olur)
        let team = await prisma.team.findFirst({
            where: { ownerId: session.user.id },
            include: {
                members: {
                    include: { user: true }
                }
            }
        });

        // Eğer takım yoksa otomatik oluştur
        if (!team) {
            team = await prisma.team.create({
                data: {
                    name: "Benim Ekibim",
                    ownerId: session.user.id,
                },
                include: {
                    members: {
                        include: { user: true }
                    }
                }
            });
        }

        return NextResponse.json({ team });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
