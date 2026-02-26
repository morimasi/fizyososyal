import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: Tek bir postu getir
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const post = await prisma.post.findUnique({
            where: { id },
            include: { media: true, analytics: true },
        });

        if (!post || post.userId !== session.user.id) {
            return NextResponse.json({ error: "Post bulunamadı" }, { status: 404 });
        }

        return NextResponse.json({ post });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Postu güncelle (içerik, tarih, durum)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const body = await req.json();
        const post = await prisma.post.findUnique({ where: { id } });

        if (!post || post.userId !== session.user.id) {
            return NextResponse.json({ error: "Post bulunamadı" }, { status: 404 });
        }

        const updated = await prisma.post.update({
            where: { id },
            data: {
                title: body.title ?? post.title,
                content: body.content ?? post.content,
                hashtags: body.hashtags ?? post.hashtags,
                status: body.status ?? post.status,
                scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : post.scheduledDate,
            },
        });

        return NextResponse.json({ post: updated });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Postu sil
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const post = await prisma.post.findUnique({ where: { id } });

        if (!post || post.userId !== session.user.id) {
            return NextResponse.json({ error: "Post bulunamadı" }, { status: 404 });
        }

        await prisma.post.delete({ where: { id } });

        return NextResponse.json({ success: true, message: "Post silindi." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
