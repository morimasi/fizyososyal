"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Stethoscope, Users, CreditCard, ShieldCheck,
    Palette, Settings, LayoutGrid, Link as LinkIcon
} from "lucide-react";
import { OrganizationProfile } from "@/components/dashboard/corporate/OrganizationProfile";
import { BrandIdentityCenter } from "@/components/dashboard/corporate/BrandIdentityCenter";
import { SmartTeamManagement } from "@/components/dashboard/corporate/SmartTeamManagement";
import { IntegrationHub } from "@/components/dashboard/corporate/IntegrationHub";
import { BillingCenter } from "@/components/dashboard/corporate/BillingCenter";

type SettingsTab = "profile" | "brand" | "team" | "integrations" | "billing";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

    const tabs = [
        { id: "profile", label: "Klinik Profili", icon: Stethoscope, color: "text-teal-400" },
        { id: "brand", label: "Marka Kimliği", icon: Palette, color: "text-amber-400" },
        { id: "team", label: "Ekip Yönetimi", icon: Users, color: "text-blue-400" },
        { id: "integrations", label: "Entegrasyonlar", icon: LinkIcon, color: "text-emerald-400" },
        { id: "billing", label: "Abonelik & Fatura", icon: CreditCard, color: "text-indigo-400" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent tracking-tight">
                        Kurumsal Yönetim Merkezi
                    </h1>
                    <p className="text-slate-400 mt-3 text-lg font-medium">
                        Klinik operasyonlarınızı ve AI marka kimliğinizi tek noktadan orkestre edin.
                    </p>
                </div>

                <div className="flex p-1.5 bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl overflow-x-auto no-scrollbar max-w-full">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as SettingsTab)}
                            className={cn(
                                "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl ring-1 ring-white/10"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                            )}
                        >
                            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? tab.color : "text-slate-600")} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="relative">
                {activeTab === "profile" && <OrganizationProfile />}
                {activeTab === "brand" && <BrandIdentityCenter />}
                {activeTab === "team" && <SmartTeamManagement />}
                {activeTab === "integrations" && <IntegrationHub />}
                {activeTab === "billing" && <BillingCenter />}
            </div>

            {/* Footer Status */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-2xl z-50">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Sistem Aktif</span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Son Güncelleme: {new Date().toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
}
