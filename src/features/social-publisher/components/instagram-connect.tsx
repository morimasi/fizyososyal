"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, CheckCircle2, AlertCircle, Link2 } from "lucide-react";

export function InstagramConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    // Gerçek uygulamada Meta Login penceresi açılacak
    // window.location.href = `/api/instagram/auth?client_id=${process.env.NEXT_PUBLIC_META_APP_ID}&redirect_uri=${process.env.NEXT_PUBLIC_META_REDIRECT_URI}`;
    
    // Simülasyon
    setTimeout(() => {
      setIsConnected(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <Card className="glass-panel w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="w-5 h-5 text-pink-600" />
          Instagram Bağlantısı
        </CardTitle>
        <CardDescription>
          İçeriklerinizi doğrudan paylaşmak için Instagram profesyonel hesabınızı bağlayın.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              <div className="text-sm font-medium">Bağlantı Aktif: @klinik_fizyoterapi</div>
            </div>
            <Button variant="outline" className="w-full rounded-xl" onClick={() => setIsConnected(false)}>
              Bağlantıyı Kes
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-sm">
              <AlertCircle className="w-5 h-5" />
              Henüz bir hesap bağlanmadı.
            </div>
            <Button 
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6"
              onClick={handleConnect}
              disabled={loading}
            >
              <Link2 className="w-5 h-5 mr-2" />
              {loading ? "Bağlanıyor..." : "Şimdi Bağla"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
