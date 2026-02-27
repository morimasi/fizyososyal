import React from "react";
import { UserRole } from "@/types/studio";
import { UserCog, ShieldCheck, UserCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleSelectorProps {
    selectedRole: UserRole;
    onSelect: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onSelect }) => {
    const roles = [
        {
            id: "EDITOR" as const,
            label: "Editör",
            icon: UserCog,
            desc: "İçerik Hazırlama",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            id: "APPROVER" as const,
            label: "Onaylayıcı",
            icon: UserCheck,
            desc: "Klinik Denetim",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            id: "ADMIN" as const,
            label: "Yönetici",
            icon: ShieldCheck,
            desc: "Tam Yetki / Yayın",
            color: "text-violet-400",
            bg: "bg-violet-500/10",
            border: "border-violet-500/20"
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Simülasyon Rolü</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => {
                    const active = selectedRole === role.id;
                    return (
                        <button
                            key={role.id}
                            onClick={() => onSelect(role.id)}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 gap-2 text-center group",
                                active
                                    ? cn(role.bg, role.border, "ring-2 ring-white/10 scale-[1.02]")
                                    : "bg-slate-900/50 border-white/5 hover:border-white/10"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-lg transition-transform",
                                active ? "scale-110" : "bg-slate-800 scale-100 group-hover:scale-105"
                            )}>
                                <role.icon className={cn("w-5 h-5", active ? role.color : "text-slate-500")} />
                            </div>
                            <div className="flex flex-col">
                                <span className={cn(
                                    "text-[11px] font-black tracking-tight",
                                    active ? "text-white" : "text-slate-500"
                                )}>
                                    {role.label}
                                </span>
                                <span className="text-[9px] text-slate-600 font-medium leading-none mt-0.5">
                                    {role.desc}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
