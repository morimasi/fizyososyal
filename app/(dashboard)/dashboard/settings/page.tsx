"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useInstagramAuth } from "@/hooks/useInstagramAuth";
import { Instagram, Palette, Stethoscope, Save, Link as LinkIcon, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const { isConnected, isLoading, error, connect, disconnect } = useInstagramAuth(null); // Başlangıç state'i gerçek veriden gelecek
    const [clinicName, setClinicName] = useState("Klinik Fizyo");
    const [brandVoice, setBrandVoice] = useState("Samimi ve hastaya güven veren akademik bir dil.");

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Ayarlar & Profil
                </h1>
                <p className="text-slate-400 mt-2">Klinik markanızı, bağlamlarınızı ve entegrasyonlarınızı yönetin.</p>
            </div>

            <div className="grid gap-6">
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
                            <label className="text-sm font-medium text-slate-300">Klinik / Hesap Adı</label>
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
        </div>
    );
}
