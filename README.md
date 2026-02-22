# PhysioSocial AI 🩺🤖

Fizyoterapistler için özel olarak geliştirilmiş, Yapay Zeka destekli Sosyal Medya Asistanı ve İçerik Yönetim Platformu.

Bu proje, fizyoterapistlerin klinik marka kimliklerine uygun (brand voice), tıbbi açıdan doğru ve dikkat çekici sosyal medya içeriklerini saniyeler içinde üretmelerini sağlar.

## 🌟 Özellikler

- **AI İçerik Stüdyosu:** Gemini 1.5 Flash ile "Bel fıtığı için 3 egzersiz" gibi konularda anında Instagram postu (metin + hashtag) üretimi.
- **Sesli Asistan:** Yazmaya uğraşmadan, yapay zekaya sesli komutlarla içerik ürettirme (Web Speech API).
- **Görsel Üretimi (Yakında):** NanoBanana entegrasyonu ile postlar için tıbbi açıdan uygun fotogerçekçi görseller üretme.
- **Marka Koruyucu:** Üretilen tüm içeriklerin kliniğin belirlediği "Brand Voice" (Samimi, Profesyonel vb.) tonuna uygun olması.
- **Akıllı Takvim & Zamanlama:** Upstash QStash altyapısı ile Vercel zaman sınırlarına takılmadan postları geleceğe planlama.
- **Çoklu Giriş:** Google ve Instagram (Meta) OAuth ile güvenli ve hızlı giriş (NextAuth.js v5).
- **Modern Dashboard:** Next.js 14 App Router, Tailwind CSS ve Lucide Icons ile tasarlanmış Glassmorphism arayüzü.

---

## 🚀 Kurulum ve Başlangıç

### 1. Gereksinimler
- Node.js 18.x veya üzeri
- PostgreSQL veritabanı (Neon DB önerilir)

### 2. Projeyi Klonlayın
```bash
git clone https://github.com/morimasi/fizyososyal.git
cd fizyososyal
npm install
```

### 3. Çevre Değişkenleri (.env)
Proje dizininde bir `.env` dosyası oluşturun ve aşağıdaki değişkenleri kendi bilgilerinizle doldurun:

```env
# Veritabanı (Örn: Neon Serverless Postgres)
DATABASE_URL="postgresql://user:password@host/db?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:password@host/db?sslmode=require"

# NextAuth v5 Yapılandırması
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="kendi-guvenli-anahtariniz-npx-auth-secret-ile-uretebilirsiniz"

# Google Auth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Instagram Auth (Meta for Developers)
INSTAGRAM_CLIENT_ID="your_instagram_client_id"
INSTAGRAM_CLIENT_SECRET="your_instagram_client_secret"

# Yapay Zeka (Gemini)
GEMINI_API_KEY="your_gemini_api_key"

# (Opsiyonel) Görsel Üretimi
NANOBANANA_API_KEY="your_nanobanana_api_key"

# Upstash QStash (Post Zamanlama İçin Görev Kuyruğu)
QSTASH_TOKEN="your_qstash_token"
QSTASH_CURRENT_SIGNING_KEY="your_current_signing_key"
QSTASH_NEXT_SIGNING_KEY="your_next_signing_key"
QSTASH_WEBHOOK_URL="https://your-domain.com/api/webhooks/qstash"
```
*(Lokal testlerde `NANOBANANA_API_KEY` veya `INSTAGRAM_CLIENT_ID` yoksa bile rastgele bir değer ("dummy_key") girerek uygulamanın diğer özelliklerini test edebilirsiniz.)*

### 4. Veritabanını Hazırlayın
Prisma şemasını veritabanına aktarın:
```bash
npx prisma generate
npx prisma db push
```

### 5. Uygulamayı Başlatın
```bash
npm run dev
```
Uygulamanız [http://localhost:3000](http://localhost:3000) adresinde çalışmaya başlayacaktır.

---

## 🌐 Vercel Üzerinde Canlıya Alma (Deploy)

Bu proje Next.js altyapısıyla **Vercel** üzerinde sorunsuz çalışmak üzere tasarlanmıştır. Sunucusuz (Serverless) ortamda Prisma ve zamanlanmış görevlerin (QStash) düzgün çalışması için `package.json` dosyasına özel `postinstall` scripti eklenmiştir.

1.  GitHub deponuzu Vercel'e bağlayın.
2.  **Settings > Environment Variables** bölümünden yukarıdaki tüm `.env` değişkenlerini Vercel'e ekleyin. (Özellikle `AUTH_SECRET` eksik olmamalıdır).
3.  Deploy düğmesine basın. Vercel, Prisma Client'ı otomatik oluşturup build işlemini tamamlayacaktır.

---

## 🛠 Kullanılan Teknolojiler

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Veritabanı ORM:** [Prisma](https://www.prisma.io/)
- **Servis & Veritabanı Sağlayıcı:** [Neon (Serverless Postgres)](https://neon.tech/)
- **Kimlik Doğrulama:** [Auth.js (NextAuth v5)](https://authjs.dev/)
- **Stil & UI:** Tailwind CSS, Framer Motion, Radix UI
- **AI & NLP:** [Google Gemini API](https://ai.google.dev/) (İçerik) ve Web Speech API (Ses tanıma)
- **Arka Plan Görevleri:** [Upstash QStash](https://upstash.com/docs/qstash) (Zamanlanmış webhooklar)

## 📄 Lisans
Tüm hakları saklıdır. PhysioSocial AI, ticari kullanıma uygun tescilli bir yapıdır.
