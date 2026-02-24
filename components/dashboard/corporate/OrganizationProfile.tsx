"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Stethoscope, Camera, MapPin, Globe, Save } from "lucide-react";
import { useState } from "react";

export function OrganizationProfile() {
    const [clinicName, setClinicName] = useState("Klinik Fizyo");
    const [website, setWebsite] = useState("https://klinikfizyo.com");
    const [address, setAddress] = useState("Levent, İstanbul");

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <Card glow className="border-teal-500/20">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-teal-400" />
                        <CardTitle>Kurumsal Kimlik</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                    {/* Logo & Cover */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-2xl bg-slate-800 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-teal-500/50">
                                <Stethoscope className="w-12 h-12 text-slate-600 group-hover:text-teal-500/50 transition-colors" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 text-center mt-2 font-bold uppercase tracking-wider">Logo Değiştir</p>
                        </div>

                        <div className="flex-1 space-y-4 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Klinik Adı</label>
                                    <div className="relative">
                                        <Stethoscope className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                        <input
                                            type="text"
                                            value={clinicName}
                                            onChange={(e) => setClinicName(e.target.value)}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 pl-10 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Web Sitesi</label>
                                    <div className="relative">
                                        <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                        <input
                                            type="url"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 pl-10 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Konum / Adres</label>
                                <div className="relative">
                                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 pl-10 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                        <Button variant="primary" className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-900/20">
                            <Save className="w-4 h-4 mr-2" /> Profili Güncelle
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
