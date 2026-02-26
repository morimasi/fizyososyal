import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/instagram/status — Kullanıcının Instagram bağlantı durumunu döner
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ connected: false }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                instagramAccountId: true,
                accessToken: true,
                name: true,
            },
        });

        const isConnected = !!(user?.accessToken && user?.instagramAccountId);

        return NextResponse.json({
            connected: isConnected,
            accountId: user?.instagramAccountId ?? null,
            username: isConnected ? (user?.name ?? "Instagram Hesabı") : null,
        });
    } catch (error: any) {
        return NextResponse.json({ connected: false, error: error.message }, { status: 500 });
    }
}

// DELETE /api/instagram/status — Instagram bağlantısını kes
export async function DELETE() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                instagramAccountId: null,
                accessToken: null,
            },
        });

        return NextResponse.json({ success: true, message: "Instagram bağlantısı kesildi." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
