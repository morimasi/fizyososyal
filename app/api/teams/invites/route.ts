import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// GET: Davetleri listele
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const team = await prisma.team.findFirst({
            where: { ownerId: session.user.id }
        });

        if (!team) {
            return NextResponse.json({ invites: [] });
        }

        const invites = await prisma.teamInvite.findMany({
            where: { teamId: team.id },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ invites });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Davet gönder
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const body = await req.json();
        const { email, role } = body;

        if (!email) {
            return NextResponse.json({ error: "E-posta gereklidir" }, { status: 400 });
        }

        let team = await prisma.team.findFirst({
            where: { ownerId: session.user.id }
        });

        if (!team) {
            team = await prisma.team.create({
                data: {
                    name: "Benim Ekibim",
                    ownerId: session.user.id
                }
            });
        }

        // Zaten üye mi kontrol et
        const existingMember = await prisma.teamMember.findFirst({
            where: {
                teamId: team.id,
                user: { email }
            }
        });

        if (existingMember) {
            return NextResponse.json({ error: "Bu kullanıcı zaten ekip üyesi" }, { status: 400 });
        }

        // Mevcut aktif davet var mı kontrol et
        const existingInvite = await prisma.teamInvite.findFirst({
            where: {
                teamId: team.id,
                email,
                expiresAt: { gte: new Date() }
            }
        });

        if (existingInvite) {
            return NextResponse.json({ error: "Bu kullanıcıya zaten aktif bir davet gönderilmiş" }, { status: 400 });
        }

        const invite = await prisma.teamInvite.create({
            data: {
                teamId: team.id,
                email,
                role: role || "EDITOR",
                token: crypto.randomUUID(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 gün
            }
        });

        return NextResponse.json({ success: true, invite });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Daveti iptal et
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Davet ID gereklidir" }, { status: 400 });
        }

        const invite = await prisma.teamInvite.findUnique({
            where: { id },
            include: { team: true }
        });

        if (!invite || invite.team.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Davet bulunamadı veya yetkiniz yok" }, { status: 404 });
        }

        await prisma.teamInvite.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
