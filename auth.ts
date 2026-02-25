import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Instagram from "next-auth/providers/instagram";
import LinkedIn from "next-auth/providers/linkedin";
import TikTok from "next-auth/providers/tiktok";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    scope: "openid profile email https://www.googleapis.com/auth/youtube.upload",
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
        Instagram({
            clientId: env.INSTAGRAM_CLIENT_ID,
            clientSecret: env.INSTAGRAM_CLIENT_SECRET,
        }),
        LinkedIn({
            clientId: env.LINKEDIN_CLIENT_ID,
            clientSecret: env.LINKEDIN_CLIENT_SECRET,
        }),
        TikTok({
            clientId: env.TIKTOK_CLIENT_KEY,
            clientSecret: env.TIKTOK_CLIENT_SECRET,
        }),
    ],
    session: {
        strategy: "database",
    },
    callbacks: {
        session({ session, user }) {
            session.user.id = user.id;

            // Özel admin erişimi tanımı
            if (user.email === "bbmaltunel@gmail.com") {
                (session.user as any).role = "ADMIN";
                (session.user as any).isAdmin = true;
            }

            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
});
