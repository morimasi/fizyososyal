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
                clinicName: true,
                clinicWebsite: true,
                clinicAddress: true,
                logoUrl: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
        }

        return NextResponse.json({ profile: user });
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
        const { clinicName, clinicWebsite, clinicAddress, logoUrl } = body;

        const updated = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                clinicName,
                clinicWebsite,
                clinicAddress,
                ...(logoUrl !== undefined && { logoUrl }),
            },
            select: {
                clinicName: true,
                clinicWebsite: true,
                clinicAddress: true,
                logoUrl: true,
            },
        });

        return NextResponse.json({ success: true, profile: updated });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
