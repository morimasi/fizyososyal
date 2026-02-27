# 🚀 AI Destekli Multimodal Sosyal Medya Yönetim Platformu - Geliştirme Planı

Bu belge, yapay zeka destekli, düşük maliyetli, yüksek performanslı ve tam modüler sosyal medya içerik üretim platformunun (SaaS) ana mimari şemasını, teknoloji yığınını ve geliştirme yol haritasını içermektedir.

---

## 1. 🤖 Master Geliştirme Promptu (Sistem Bağlamı)

Bu metin, projeye dahil olacak diğer geliştiricilere veya yapay zeka asistanlarına projenin amacını ve kurallarını tek seferde anlatmak için tasarlanmıştır:

> "Sen kıdemli bir Full-Stack Yazılım Mimarı ve Baş Geliştiricisin. Amacımız, Instagram için yapay zeka destekli (Multimodal) içerik (Post, Reels, Carousel, Reklam) oluşturma, düzenleme, önizleme, indirme ve doğrudan yayınlama işlevlerine sahip ultra profesyonel bir SaaS uygulaması geliştirmektir.
>
> Proje, **Next.js (App Router)** tabanlı, **Vercel** üzerinde barındırılan, **Neon (Serverless PostgreSQL)** ve **Drizzle ORM** kullanılarak veri yönetimi sağlanan, gücünü **Google Gemini API** ve **Google Vertex AI** (Imagen/Video) modellerinden alan bir platformdur. Dosya yüklemeleri için **Vercel Blob**, sosyal medya etkileşimleri için **Meta Graph API** kullanılacaktır.
> 
> Kodlar yazılırken 'Feature-Sliced Design' prensiplerine uyulmalı, Vercel Edge/Serverless mimarisi gözetilmeli, bileşenler tamamen modüler olmalı ve TypeScript ile katı (strict) tip tanımlamaları yapılmalıdır. Her kod bloğu açıklayıcı yorum satırları içermelidir."

---

## 2. 🏗️ Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji / Araç | Neden Seçildi? |
| :--- | :--- | :--- |
| **Frontend/Framework** | Next.js 14+ (App Router), React, TailwindCSS | SEO uyumu, hızlı sayfa yüklemeleri, API ve UI'ın tek projede birleşmesi. |
| **State Management** | Zustand | Redux'a göre çok daha hafif ve boilerplate (fazlalık) kod gerektirmez. |
| **Veritabanı** | Neon (Serverless Postgres) | Sunucusuz yapısıyla trafiğe göre ölçeklenir, kullanılmadığında maliyet yaratmaz. |
| **ORM** | Drizzle ORM | Prisma'ya göre çok daha hızlı çalışır, Edge fonksiyonlarında 'Cold Start' gecikmesi yapmaz. |
| **Yapay Zeka** | Google Gemini & Vertex AI | Multimodal (görsel ve metin anlama/üretme) kapasitesi çok yüksek ve entegrasyonu kolaydır. |
| **Dosya Depolama** | Vercel Blob | Uygulama ile aynı altyapıda olduğu için sıfır gecikmeli medya yükleme/okuma sağlar. |

---

## 3. 🗺️ Sistem Mimarisi ve Veri Akışı

Aşağıdaki diyagram, Vercel üzerindeki Next.js uygulamamızın, Neon veritabanı ve Google yapay zeka servisleriyle nasıl iletişim kurduğunu temsil eder:



---

## 4. 📂 Modüler Dosya ve Klasör Yapısı

Proje, büyüme potansiyeli göz önünde bulundurularak "Feature-Sliced" (Özellik Odaklı) tasarıma göre yapılandırılacaktır.

```text
my-ai-social-app/
├── src/
│   ├── app/                    # 🌐 Next.js App Router (Sayfalar ve API Rotaları)
│   │   ├── (auth)/             # Giriş/Kayıt sayfaları
│   │   ├── api/                
│   │   │   ├── ai/generate/    # Gemini ve Vertex AI çağrıları
│   │   │   └── instagram/      # Meta Graph API işlemleri
│   │   ├── dashboard/          # Kullanıcı ana paneli ve editör arayüzü
│   │   └── layout.tsx & page.tsx
│   ├── components/             # 🧩 Yeniden Kullanılabilir Ortak UI (Butonlar, Modallar)
│   ├── db/                     # 🗄️ Veritabanı ve Şema Tanımları
│   │   ├── index.ts            # Neon & Drizzle Bağlantı Ayarları
│   │   └── schema.ts           # Veritabanı Tabloları
│   ├── features/               # 📦 Ana Özellik Modülleri (İş Mantığı Burada İzole Edilir)
│   │   ├── ai-generator/       # Prompt yönetimi, AI üretim mantığı
│   │   ├── canvas-editor/      # Görsel/Video düzenleme, katman (layer) yönetimi
│   │   └── social-publisher/   # Instagram entegrasyonu, zamanlama
│   ├── lib/                    # 🛠️ Yardımcı Fonksiyonlar (Utils, Sabitler)
│   │   ├── google-ai.ts        # Google AI istemci konfigürasyonları
│   │   └── utils.ts            # Tailwind sınıf birleştirici (cn) vb.
│   └── types/                  # 🏷️ Global TypeScript arayüzleri (Interfaces)
├── .env.local                  # 🔐 API anahtarları (Git'e atılmaz!)
├── drizzle.config.ts           # ⚙️ Drizzle konfigürasyonu
└── tailwind.config.ts          # 🎨 Stil sistemi ayarları
5. 🗄️ Çekirdek Veritabanı Şeması (Drizzle + Neon)
src/db/schema.ts (Temel Tablolar)
TypeScript
import { pgTable, serial, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Kullanıcılar ve AI Kredileri
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  aiCredits: integer('ai_credits').notNull().default(100), 
  instagramAccountId: text('instagram_account_id'), 
  instagramToken: text('instagram_token'),          
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Üretilen İçerikler (Posts)
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(), 
  type: text('type').notNull(), // 'post', 'reels', 'carousel'
  mediaUrl: text('media_url').notNull(), // Vercel Blob URL
  caption: text('caption'), 
  settings: jsonb('settings'), // Canvas editör ayarları (JSON)
  status: text('status').default('draft'), // 'draft', 'published', 'scheduled'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
6. 🛣️ Geliştirme Yol Haritası (Faz Planlaması)
Faz 1: Çatı Kurulumu

Next.js, Tailwind, Drizzle ve Neon veritabanı altyapısının kurulması.

Faz 2: Kimlik Doğrulama & Yönetim

NextAuth.js ile kullanıcı girişlerinin ve token sisteminin kodlanması.

Faz 3: AI Multimodal Motoru 🧠

Gemini ve Vertex AI entegrasyonu (Metin, görsel, video üretimi).

Faz 4: Profesyonel Canvas Editörü 🎨

Sürükle-bırak destekli editör arayüzü ve gerçek zamanlı mobil cihaz önizlemesi.

Faz 5: Sosyal Medya Entegrasyonu 📱

Meta Graph API ile Instagram hesap bağlama ve anında/planlı yayınlama.

Faz 6: Test ve Canlıya Alım

Edge fonksiyon optimizasyonu, maliyet paneli ve Vercel üzerinden tam deployment.