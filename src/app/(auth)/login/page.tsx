import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-fluid p-4">
      <Card className="w-full max-w-md glass-panel">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-sage-dark">Fizyososyal'e Giriş Yap</CardTitle>
          <CardDescription>
            İçerik üretmeye başlamak için hesabınıza giriş yapın.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button variant="default" className="w-full py-6 text-lg rounded-2xl shadow-md" type="submit">
              Google ile Devam Et
            </Button>
          </form>
          <p className="text-center text-xs text-slate-500 mt-2">
            Giriş yaparak kullanım koşullarımızı kabul etmiş olursunuz.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
