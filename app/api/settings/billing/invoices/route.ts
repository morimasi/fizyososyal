import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        // Şimdilik mock fatura verileri (İlerde DB'ye eklenebilir)
        const invoices = [
            { id: "INV-9821", date: "15 Şubat 2026", amount: "$49.00", status: "ÖDENDİ" },
            { id: "INV-9742", date: "15 Ocak 2026", amount: "$49.00", status: "ÖDENDİ" },
            { id: "INV-9611", date: "15 Aralık 2025", amount: "$49.00", status: "ÖDENDİ" },
        ];

        return NextResponse.json({ invoices });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
