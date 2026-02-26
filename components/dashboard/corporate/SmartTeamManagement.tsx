"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Users, UserPlus, Mail, ShieldCheck, CheckCircle2, MoreVertical, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type TeamMember = {
    id: string;
    teamId: string;
    userId: string;
    role: "ADMIN" | "EDITOR" | "APPROVER";
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    }
};

type Invite = {
    id: string;
    email: string;
    role: "ADMIN" | "EDITOR" | "APPROVER";
    createdAt: string;
    status?: string;
};

export function SmartTeamManagement() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("EDITOR");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [membersRes, invitesRes] = await Promise.all([
                fetch("/api/teams/members"),
                fetch("/api/teams/invites")
            ]);

            if (membersRes.ok) {
                const data = await membersRes.json();
                if (data.team?.members) setMembers(data.team.members);
            }

            if (invitesRes.ok) {
                const data = await invitesRes.json();
                if (data.invites) setInvites(data.invites);
            }
        } catch (error) {
            console.error("Veri yüklenemedi:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInvite = async () => {
        if (!inviteEmail) return alert("Lütfen bir e-posta adresi girin.");
        setIsActionLoading(true);
        try {
            const res = await fetch("/api/teams/invites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Davet başarıyla gönderildi!");
                setInviteEmail("");
                fetchData();
            } else {
                alert("Hata: " + data.error);
            }
        } catch (err) {
            alert("Davet gönderilirken bir hata oluştu.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCancelInvite = async (id: string) => {
        if (!confirm("Bu daveti iptal etmek istediğinize emin misiniz?")) return;
        setIsActionLoading(true);
        try {
            const res = await fetch(`/api/teams/invites?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchData();
            } else {
                const data = await res.json();
                alert("Hata: " + data.error);
            }
        } catch (err) {
            alert("İşlem başarısız oldu.");
        } finally {
            setIsActionLoading(false);
        }
    };

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
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 pl-11 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        >
                            <option value="EDITOR">Editör (İçerik Üretir)</option>
                            <option value="APPROVER">Onaylayıcı (Yayın Onayı Verir)</option>
                            <option value="ADMIN">Admin (Tam Yetki)</option>
                        </select>
                        <Button
                            onClick={handleInvite}
                            variant="primary"
                            disabled={isActionLoading}
                            isLoading={isActionLoading}
                            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 md:w-32 text-white"
                        >
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
                            <CardTitle>Aktif Ekip Üyeleri & Davetler</CardTitle>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                            {members.length + invites.length} / 5 Limit
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
                                {isLoading ? (
                                    <tr><td colSpan={4} className="p-6 text-center text-slate-500">Yükleniyor...</td></tr>
                                ) : members.length === 0 && invites.length === 0 ? (
                                    <tr><td colSpan={4} className="p-6 text-center text-slate-500">Henüz ekip üyesi yok.</td></tr>
                                ) : (
                                    <>
                                        {/* Üyeler */}
                                        {members.map((member) => (
                                            <tr key={member.id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-xs font-bold text-blue-300 ring-2 ring-black/20 uppercase text-white font-bold">
                                                            {member.user.name ? member.user.name.substring(0, 2) : member.user.email.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-white">{member.user.name || "İsimsiz Kullanıcı"}</div>
                                                            <div className="text-xs text-slate-500">{member.user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-white">
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
                                                    <span className="flex items-center text-emerald-400 gap-1.5 font-medium">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Davetler */}
                                        {invites.map((invite) => (
                                            <tr key={invite.id} className="group hover:bg-white/[0.02] transition-colors border-l-4 border-blue-500/30">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                                                            ?
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-slate-300 italic">Bekleyen Davet</div>
                                                            <div className="text-xs text-slate-500">{invite.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border",
                                                        invite.role === "ADMIN" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                            invite.role === "APPROVER" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                                "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                    )}>
                                                        {invite.role === "ADMIN" ? "Admin (Tam)" : invite.role === "APPROVER" ? "Onaylayıcı" : "Editör"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="text-slate-500 italic flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> Davet Edildi
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleCancelInvite(invite.id)}
                                                        className="text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                    >
                                                        İptal Et
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                )}</tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
