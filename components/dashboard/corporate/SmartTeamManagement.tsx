"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Users, UserPlus, Mail, ShieldCheck, CheckCircle2, MoreVertical, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type TeamMember = {
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "EDITOR" | "APPROVER";
    status: "AKTIF" | "BEKLEMEDE";
    avatar: string;
};

export function SmartTeamManagement() {
    const [members] = useState<TeamMember[]>([
        { id: 1, name: "Dr. Ahmet Yılmaz", email: "ahmet@klinik.com", role: "ADMIN", status: "AKTIF", avatar: "AY" },
        { id: 2, name: "Selin Can", email: "selin@klinik.com", role: "EDITOR", status: "AKTIF", avatar: "SC" },
        { id: 3, name: "Mert Demir", email: "mert@klinik.com", role: "APPROVER", status: "BEKLEMEDE", avatar: "MD" },
    ]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            {/* Invite Section */}
            <Card glow className="border-blue-500/20 bg-slate-900/50">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-blue-400" />
                        <CardTitle>Yeni Ekip Üyesi Davet Et</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="email"
                                placeholder="asistan@klinik.com"
                                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 pl-11 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <select className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                            <option value="EDITOR">Editör (İçerik Üretir)</option>
                            <option value="APPROVER">Onaylayıcı (Yayın Onayı Verir)</option>
                            <option value="ADMIN">Admin (Tam Yetki)</option>
                        </select>
                        <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 md:w-32">
                            Davet Gönder
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Team List */}
            <Card className="border-white/5 overflow-hidden">
                <CardHeader className="bg-white/[0.02] border-b border-white/5 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-slate-400" />
                            <CardTitle>Aktif Ekip Üyeleri</CardTitle>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                            3 / 5 Limit
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Kullanıcı</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Yetki Seviyesi</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Durum</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {members.map((member) => (
                                    <tr key={member.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-xs font-bold text-blue-300 ring-2 ring-black/20">
                                                    {member.avatar}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-white">{member.name}</div>
                                                    <div className="text-xs text-slate-500">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border",
                                                member.role === "ADMIN" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                    member.role === "APPROVER" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                        "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                            )}>
                                                {member.role === "ADMIN" ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                                {member.role === "ADMIN" ? "Admin (Tam)" : member.role === "APPROVER" ? "Onaylayıcı" : "Editör"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {member.status === "AKTIF" ? (
                                                <span className="flex items-center text-emerald-400 gap-1.5 font-medium">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                                                </span>
                                            ) : (
                                                <span className="text-slate-500 italic flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse" /> Davet Edildi
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
