import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { exchangeForLongLivedToken, getAccountInfo } from "@/services/instagram/graph-api.service";
import { prisma } from "@/lib/prisma";

// GET /api/instagram/auth?code=... — Meta OAuth callback
export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    const code = req.nextUrl.searchParams.get("code");
    if (!code) {
        return NextResponse.redirect(new URL("/dashboard/settings?error=no_code", req.url));
    }

    try {
        // Kısa ömürlü token al
        const tokenRes = await fetch(
            `https://api.instagram.com/oauth/access_token`,
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    client_id: process.env.META_APP_ID!,
                    client_secret: process.env.META_APP_SECRET!,
                    grant_type: "authorization_code",
                    redirect_uri: process.env.META_REDIRECT_URI!,
                    code,
                }),
            }
        );

        const shortToken = await tokenRes.json();
        if (!shortToken.access_token) throw new Error("Token alınamadı");

        // 60 günlük uzun ömürlü token'a çevir
        const longToken = await exchangeForLongLivedToken(shortToken.access_token);

        // Instagram Business hesap bilgilerini al
        const accountInfo = await getAccountInfo(shortToken.user_id, longToken.access_token);

        // Veritabanına kaydet
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                instagramAccountId: accountInfo.id,
                accessToken: longToken.access_token,
            },
        });

        return NextResponse.redirect(new URL("/dashboard/settings?success=connected", req.url));
    } catch (error) {
        console.error("Instagram auth hatası:", error);
        return NextResponse.redirect(new URL("/dashboard/settings?error=auth_failed", req.url));
    }
}

// POST /api/instagram/auth — OAuth URL oluştur
export async function POST() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const authUrl = new URL("https://api.instagram.com/oauth/authorize");
    authUrl.searchParams.set("client_id", process.env.META_APP_ID!);
    authUrl.searchParams.set("redirect_uri", process.env.META_REDIRECT_URI!);
    authUrl.searchParams.set("scope", "instagram_basic,instagram_content_publish,instagram_manage_insights");
    authUrl.searchParams.set("response_type", "code");

    return NextResponse.json({ authUrl: authUrl.toString() });
}
