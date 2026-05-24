# 🎮 TOP UP GAME DIGITAL OTOMATIS (BOOTSTRAP Rp0 STARTUP)

Codebase ini dirancang premium, modern, dan **production-ready** sebagai basis platform top-up game digital otomatis bergaya Codashop / UniPin. Dibuat khusus untuk pengusaha bootstrap yang ingin merintis bisnis top-up dengan **modal awal Rp0** menggunakan tumpukan teknologi modern berkecepatan tinggi, aman degan sistem proteksi anti-rugi (*Anti-Loss Pricing Engine*), serta siap dideploy gratis ke berbagai cloud provider.

---

## 🚀 FITUR & KEUNGGULAN UTAMA

1. **UX Premium & Mobile-First Layout**:
   - Sentuhan desain minimalis nan futuristik bernuansa gelap (*Glassmorphism glow*).
   - Ticker transaksi lunas real-time untuk membangun kepercayaan konsumen (*social proof*).
   - Slider Flash Sale interaktif dilengkapi pencarian game kilat berbasis input responsif.
2. **Checkout Wizard & Flow Step-by-Step**:
   - Validasi ID Gamer game target (disertai dropdown server zone untuk game MLBB dan Genshin Impact).
   - Pembagian tab metode pembayaran yang sangat teratur (QRIS, E-Wallet, VA, Transfer Manual).
   - Pemasangan kupon promo (`WELCOME`, `NEWUSER`, `TOPUP`) berproteksi keuntungan ganda.
3. **Smart Pricing System (Anti-Rugi & Margin Otomatis)**:
   - Sistem akan otomatis menghitung harga jual akhir keping game berdasarkan modal supplier sesuai tiering persentase yang aman.
   - Proteksi ketat: Sistem menolak menyimpan harga jual jika margin keuntungan yang diperoleh berada di bawah threshold minimum yang ditentukan (misal Rp 500 - Rp 2.000).
4. **Interactive Payment Gateway Sandbox Simulator**:
   - Memungkinkan pembeli atau administrator mensimulasikan notifikasi Webhook Tripay lunas guna memicu pipeline pengisian otomatis ke supplier (paid & sukses) secara langsung dalam lingkungan uji coba.
5. **AI SEO Generator (Powered by Gemini)**:
   - Panel admin cerdas yang disokong oleh `gemini-3.5-flash` untuk menyusun metadata SEO bahasa Indonesia dalam 1 klik.

---

## 🛠️ SPESIFIKASI DAN STRUKTUR API ENDPOINTS

Daftar endpoint RESTful yang terimplementasi di backend `/server.ts` :

| Method | Endpoint | Kegunaan |
|--------|----------|----------|
| **GET** | `/api/games` | Mengambil seluruh daftar game yang aktif beserta identifikasi zone-server. |
| **GET** | `/api/products` | Mengambil daftar denominasi/kepingan game (bisa difilter via `?gameId=..`). |
| **PUT** | `/api/products/:id` | Mengedit modal, harga jual, status, serta menguji validasi margin anti-rugi. |
| **GET** | `/api/payments` | Mengambil detail metode pembayaran beserta hitungan biaya admin gateway. |
| **POST** | `/api/vouchers/validate` | Validasi kode kupon promo terhadap nominal keranjang belanja saat ini. |
| **POST** | `/api/orders` | Membuat pesanan/invoice baru berkode unik *INV-YYYYMMDD-XXXXX*. |
| **POST** | `/api/orders/:id/webhook-pay` | **Webhook Simulator**: Menirukan notifikasi sukses pembayaran Tripay. |
| **POST** | `/api/supplier/sync` | Mensimulasikan auto-sync stok, mengubah modal supplier dan merekrut markup otomatis. |
| **POST** | `/api/ai/seo` | Panggilan kecerdasan asisten Gemini untuk me-generate keyword meta optimal. |
| **POST** | `/api/demo/reset` | Mereset seluruh dataset simulasi kembali ke setelan pabrik untuk demo bersih. |

---

## 🗄️ SKEMA DATABASE & PRISMA ORM (ERD RE-SPECIFICATION)

Untuk deployment di supabase/PostgreSQL gratisan, Anda dapat menggunakan struktur berkas Prisma Schema di bawah ini:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Game {
  id               String    @id @default(uuid())
  slug             String    @unique
  name             String
  logo             String
  banner           String
  publisher        String
  status           String    @default("ACTIVE") // ACTIVE / INACTIVE
  sortOrder        Int       @default(1)
  inputPlaceholder String
  hasServer        Boolean   @default(false)
  products         Product[]
  createdAt        DateTime  @default(now())
}

model Product {
  id             String    @id @default(uuid())
  gameId         String
  game           Game      @relation(fields: [gameId], references: [id], onDelete: Cascade)
  sku            String    @unique
  name           String
  priceSupplier  Int
  priceFinal     Int
  isFlashSale    Boolean   @default(false)
  flashSalePrice Int?
  originalPrice  Int?
  status         String    @default("ACTIVE")
  createdAt      DateTime  @default(now())
}

model Order {
  id                 String   @id // INV-YYYYMMDD-XXXXX
  gameId             String
  gameName           String
  productId          String
  productName        String
  userUid            String
  userServer         String?
  priceSupplier      Int
  priceBase          Int
  priceFinal         Int
  discountAmount     Int      @default(0)
  voucherApplied     String?
  paymentMethodId    String
  paymentMethodName  String
  status             String   @default("PENDING") // PENDING, PAID, PROCESSING, SUCCESS, FAILED
  supplierUsed       String   @default("Digiflazz")
  supplierStatus     String   @default("Menunggu Pembayaran")
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model Voucher {
  id          String   @id @default(uuid())
  code        String   @unique
  discountMax Int
  minPurchase Int
  quota       Int
  used        Int      @default(0)
  status      String   @default("ACTIVE")
  expiryDate  DateTime
}
```

---

## 📦 ATURAN PERHITUNGAN MARGIN OTOMATIS (PRICING FORMULA)

Aplikasi secara ketat menegakkan formula pengamanan profit sebagai berikut:

```typescript
let sellingPrice = supplierPrice + margin;
```

*   **Supplier Price < Rp10.000**: Minimal profit wajib **Rp 500**, markup default **Rp 2.000**.
*   **Supplier Price Rp10.000 – Rp50.000**: Minimal profit wajib **Rp 1.000**, markup default **10% - 15%**.
*   **Supplier Price Rp50.000 – Rp100.000**: Minimal profit wajib **Rp 2.000**, markup default **8% - 12%**.
*   **Supplier Price Rp100.000+**: Minimal profit wajib **Rp 2.000**, markup default **5% - 8%**.

> ⚠️ Jika terjadi penurunan harga yang menyebabkan profit mendekati Rp 0 atau merugi karena disoroti kode voucher, sistem checkout server-side akan otomatis meng-clamp diskon ketersediaan agar margin bisnis minimum selalu terproteksi di atas Rp 150!

---

## 🛠️ PANDUAN RUNNING & DEPLOYMENT MANDIRI

### 🐳 Menjalankan via Docker (Lokal / VM Cloud Server VPS)

Kami melengkapi berkas dockerizer standar agar deployment portabel berjalan mulus.

#### 1. **Dockerfile**
Tambahkan berkas `/Dockerfile` berikut di server VPS Anda:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/server.cjs"]
```

#### 2. **docker-compose.yml**
Gunakan orkestrasi docker-compose berikut:
```yaml
version: '3.8'
services:
  topupgame-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=GANTI_DENGAN_GEMINI_KEY_ANDA
      - APP_URL=http://localhost:3000
    restart: unless-stopped
```

Untuk meluncurkan di VPS:
```bash
docker-compose up -d --build
```

---

## 🚀 STRATEGI BOOTSTRAP Rp0 (FOKUS PROFIT & CASH FLOW POSITIVE)

Untuk merintis bisnis ini hingga menghasilkan profit bersih konsisten tanpa modal besar:
1. **Daftar Akun Kemitraan Gratisan**:
   - Ambil keping diamond dari API Supplier (pendaftaran Digiflazz gratis).
   - Gunakan Payment Gateway integrasi Tripay (pendaftaran instant gratis, tanpa biaya bulanan, biaya dibebankan per transaksi pembeli).
2. **Deploy Tanpa Biaya Server**:
   - Server backend & frontend dapat dijalankan gratis di Render.com atau Cloud Run Free tier.
   - Database PostgreSQL menggunakan Supabase Free Tier.
3. **Optimasi Organik (SEO)**:
   - Gunakan fitur **AI SEO Generator** berbasis Gemini AI di panel admin untuk rutin meng-generate meta-description optimal di landing page game Anda guna merebut peringkat terdepan pencarian organik Google.
