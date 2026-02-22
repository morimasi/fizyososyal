import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Instagram from "next-auth/providers/instagram";
import LinkedIn from "next-auth/providers/linkedin";
import TikTok from "next-auth/providers/tiktok";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
            clientId: process.env.INSTAGRAM_CLIENT_ID,
            clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
        }),
        LinkedIn({
            clientId: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        }),
        TikTok({
            clientId: process.env.TIKTOK_CLIENT_KEY,
            clientSecret: process.env.TIKTOK_CLIENT_SECRET,
        }),
    ],
    session: {
        strategy: "database",
    },
    callbacks: {
        session({ session, user }) {
            session.user.id = user.id;
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
});
