import { Sidebar } from "@/components/dashboard/Sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let session;
    try {
        session = await auth();
    } catch (e: any) {
        return (
            <div className="p-8 text-center bg-red-900/50 text-white min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Layout Auth Error</h1>
                <pre className="text-sm bg-black/50 p-4 rounded max-w-2xl overflow-auto text-left">
                    {e.message}{'\n'}{e.stack}
                </pre>
            </div>
        );
    }

    if (!session?.user?.id) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-slate-950 flex relative">
            {/* Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] right-[-10%] w-[40%] h-[60%] bg-teal-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 ml-64 p-8 relative z-10 w-full overflow-y-auto">
                <div className="max-w-6xl mx-auto">{children}</div>
            </main>
        </div>
    );
}
