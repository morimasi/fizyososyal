import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: BEKLEYEN_ONAY statusundaki postları getir (ADMIN/APPROVER için)
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
        }

        const posts = await prisma.post.findMany({
            where: {
                userId: session.user.id,
                status: "BEKLEYEN_ONAY",
            },
            include: { media: true },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json({ posts, count: posts.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
