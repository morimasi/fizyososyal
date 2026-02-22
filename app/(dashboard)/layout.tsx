import { Sidebar } from "@/components/dashboard/Sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

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
