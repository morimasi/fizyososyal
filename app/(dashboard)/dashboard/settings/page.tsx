"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useInstagramAuth } from "@/hooks/useInstagramAuth";
import { Instagram, Palette, Stethoscope, Save, Link as LinkIcon, AlertCircle, Users, CreditCard, Mail, ShieldCheck, UserPlus, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "team" | "billing";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
    const { isConnected, isLoading, error, connect, disconnect } = useInstagramAuth(null);
    const [clinicName, setClinicName] = useState("Klinik Fizyo");
    const [brandVoice, setBrandVoice] = useState("Samimi ve hastaya güven veren akademik bir dil.");

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Kurumsal Yönetim
                    </h1>
                    <p className="text-slate-400 mt-2">Klinik profilini, ekip yetkilerini ve abonelik planınızı yönetin.</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1 bg-slate-900/50 border border-white/5 rounded-xl self-start">
                    {[
                        { id: "profile", label: "Profil", icon: Stethoscope },
                        { id: "team", label: "Ekip", icon: Users },
                        { id: "billing", label: "Abonelik", icon: CreditCard },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as SettingsTab)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all",
                                activeTab === tab.id
                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                                    : "text-slate-400 hover:text-white"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-6">
                {activeTab === "profile" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        {/* Instagram Entegrasyonu */}
                        <Card glow className={isConnected ? "border-emerald-500/20" : "border-violet-500/20"}>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Instagram className="w-5 h-5 text-pink-500" />
                                    <CardTitle>Instagram Bağlantısı</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-2">
                                {error && (
                                    <div className="flex items-center gap-2 text-rose-400 text-sm mb-4 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                                        <AlertCircle className="w-5 h-5" />
                                        <span>{error}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div>
                                        <h4 className="font-medium text-white">Meta Graph API</h4>
                                        <p className="text-sm text-slate-400">Otomatik yayınlama için Business hesabınızı bağlayın.</p>
                                    </div>
                                    {isConnected ? (
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center text-sm font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                                                <LinkIcon className="w-4 h-4 mr-2" /> Bağlı
                                            </span>
                                            <Button variant="danger" size="sm" onClick={disconnect}>
                                                Bağlantıyı Kes
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button variant="primary" onClick={connect} isLoading={isLoading}>
                                            <Instagram className="w-4 h-4 mr-2" />
                                            Hesabı Bağla
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Klinik Profili */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Stethoscope className="w-5 h-5 text-teal-400" />
                                    <CardTitle>Klinik Bilgileri</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Klinik / Hesap Adı (Sertifika ve Watermark için)</label>
                                    <input
                                        type="text"
                                        value={clinicName}
                                        onChange={(e) => setClinicName(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Brand Voice (Yapay Zeka Tonu)</label>
                                    <textarea
                                        value={brandVoice}
                                        onChange={(e) => setBrandVoice(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 h-24 resize-none"
                                        placeholder="Örn: Profesyonel, bilimsel ama hasta dostu."
                                    />
                                    <p className="text-xs text-slate-500">Gemini AI içerik üretirken bu marka sesini (Brand Voice) referans alır.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Brand Kit (Logo) */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Palette className="w-5 h-5 text-amber-400" />
                                    <CardTitle>Brand Kit (Watermark)</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-2">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-dashed border-white/20 flex items-center justify-center">
                                        <Palette className="w-8 h-8 text-slate-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-white mb-1">Klinik Logosu Yükle</h4>
                                        <p className="text-sm text-slate-400 mb-4">Şeffaf PNG formatında yükleyin. AI görsellerine otomatik filigran eklenecektir.</p>
                                        <Button variant="secondary" size="sm">Dosya Seç</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4 mt-6">
                            <Button variant="ghost">İptal</Button>
                            <Button variant="primary">
                                <Save className="w-4 h-4 mr-2" /> Değişiklikleri Kaydet
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === "team" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        {/* Invite Team Member */}
                        <Card glow className="border-violet-500/20 bg-gradient-to-br from-slate-900/50 to-violet-900/10">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <UserPlus className="w-5 h-5 text-violet-400" />
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
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 pl-11 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                    <select className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
                                        <option value="EDITOR">Editör (İçerik Üretir)</option>
                                        <option value="APPROVER">Onaylayıcı (Yayın Onayı Verir)</option>
                                        <option value="ADMIN">Admin (Tam Yetki)</option>
                                    </select>
                                    <Button variant="primary" className="md:w-32">
                                        Davet Gönder
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Team Table */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-400" />
                                        <CardTitle>Mevcut Ekip</CardTitle>
                                    </div>
                                    <span className="text-xs text-slate-500">3 Üye / 5 Limit</span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 border-b border-white/5">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kullanıcı</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rol</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Durum</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Eylem</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {[
                                                { name: "Dr. Ahmet Yılmaz", email: "ahmet@klinik.com", role: "Sahip", status: "Aktif", avatar: "AY" },
                                                { name: "Selin Can", email: "selin@klinik.com", role: "Editör", status: "Aktif", avatar: "SC" },
                                                { name: "Mert Demir", email: "mert@klinik.com", role: "Onaylayıcı", status: "Beklemede", avatar: "MD" },
                                            ].map((member, i) => (
                                                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300">
                                                                {member.avatar}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-white">{member.name}</div>
                                                                <div className="text-xs text-slate-500">{member.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={cn(
                                                            "text-[10px] font-bold px-2 py-1 rounded-md border uppercase",
                                                            member.role === "Sahip" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                                member.role === "Onaylayıcı" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                                                    "bg-slate-500/10 text-slate-400 border-white/10"
                                                        )}>
                                                            {member.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        {member.status === "Aktif" ? (
                                                            <span className="flex items-center text-emerald-400 gap-1.5">
                                                                <CheckCircle2 className="w-3 h-3" /> Aktif
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-500 italic">Davet Edildi</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-rose-400">Kaldır</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === "billing" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Current Plan */}
                            <Card glow className="md:col-span-2 border-teal-500/20 bg-gradient-to-br from-slate-900/50 to-teal-900/10">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-teal-400" />
                                            <CardTitle>Mevcut Plan: Profesional Plus</CardTitle>
                                        </div>
                                        <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-1 rounded-md border border-teal-500/30">Aktif</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Aylık Limit</div>
                                            <div className="text-xl font-bold text-white">50 / 200 Post</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">AI Kredisi</div>
                                            <div className="text-xl font-bold text-white">450 / 1000</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Yenileme Tarihi</div>
                                            <div className="text-xl font-bold text-white">15 Ekim</div>
                                        </div>
                                    </div>

                                    <div className="mt-8 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div className="bg-teal-500 h-full w-[45%]" />
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500 text-right">Kullanılan Kredi: %45</p>
                                </CardContent>
                            </Card>

                            {/* Payment Method */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Ödeme Yöntemi</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                        <div className="w-10 h-6 bg-slate-700 rounded-md" />
                                        <div className="text-sm">
                                            <p className="text-white font-medium">**** 4242</p>
                                            <p className="text-[10px] text-slate-500">Exp: 12/26</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="w-full mt-4 text-xs text-violet-400">Yöntemi Güncelle</Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Invoice History */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Fatura Geçmişi</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-white/5">
                                    {[
                                        { id: "INV-001", date: "15 Eylül 2026", amount: "49.00 USD", status: "Ödendi" },
                                        { id: "INV-002", date: "15 Ağustos 2026", amount: "49.00 USD", status: "Ödendi" },
                                        { id: "INV-003", date: "15 Temmuz 2026", amount: "49.00 USD", status: "Ödendi" },
                                    ].map((inv) => (
                                        <div key={inv.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02]">
                                            <div className="text-sm">
                                                <div className="text-white font-medium">{inv.id}</div>
                                                <div className="text-xs text-slate-500">{inv.date}</div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <span className="text-sm text-white font-semibold">{inv.amount}</span>
                                                <span className="text-[10px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-bold">
                                                    {inv.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
