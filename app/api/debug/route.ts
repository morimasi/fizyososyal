import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(req: NextRequest) {
    const debugInfo: any = {
        timestamp: new Date().toISOString(),
        env: {
            NODE_ENV: process.env.NODE_ENV,
            HAS_GEMINI_KEY: !!process.env.GEMINI_API_KEY,
            HAS_NANOB_KEY: !!process.env.NANOBANANA_API_KEY,
            HAS_DB_URL: !!process.env.DATABASE_URL,
            NEXT_AUTH_URL: process.env.NEXTAUTH_URL,
        }
    };

    try {
        // 1. Test Auth & Gemini
        try {
            const session = await auth();
            debugInfo.session = {
                active: !!session,
                user: session?.user ? { id: !!session.user.id, email: !!session.user.email } : null
            };

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
            // Test simple generation instead of listing
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            debugInfo.gemini = {
                status: "Client initialized",
                testModel: "gemini-1.5-flash"
            };
        } catch (e: any) {
            debugInfo.geminiError = e.message;
        }

        // 2. Test DB
        try {
            const userCount = await prisma.user.count();
            debugInfo.db = {
                connected: true,
                userCount
            };
        } catch (e: any) {
            debugInfo.dbError = e.message;
        }

        return NextResponse.json(debugInfo);
    } catch (globalError: any) {
        return NextResponse.json({
            fatal: globalError.message,
            stack: globalError.stack
        }, { status: 500 });
    }
}
