# ThesisTrack

Sistem manajemen tugas akhir untuk FTMM Universitas Airlangga.

## Stack

- Next.js (App Router), React, dan TypeScript
- Tailwind CSS
- Prisma ORM dengan PostgreSQL
- Auth.js Credentials dengan session JWT
- Vercel Blob private storage untuk PDF akademik
- Zod dan Lucide React
- ESLint

## Menjalankan project

```bash
npm install
cp .env.example .env
npm run dev
```

Buka `http://localhost:3000`. Route utama akan mengarahkan ke `/login`.

## Struktur singkat

- `prisma/` — konfigurasi Prisma
- `public/brand/` dan `public/images/` — aset statis
- `src/app/` — halaman dan routing App Router
- `src/components/` — komponen layout, UI, dan shared
- `src/actions/` — Server Actions untuk auth, Admin CRUD, dan workflow tugas akhir
- `src/lib/` — helper aplikasi, termasuk Prisma Client
- `src/validations/` — schema validasi Zod
- `src/types/` — tipe bersama

Authentication mendukung empat role: Mahasiswa, Dosen Pembimbing, Koordinator TA, dan Admin Sistem. Login menggunakan Auth.js Credentials, bcrypt, dan session JWT. Pengguna baru diwajibkan mengganti password saat login pertama.

Area Admin menyediakan CRUD dasar Pengguna, Program Studi, dan Ruangan dengan authorization server-side serta validasi Zod.

Core Thesis Workflow tersedia: Mahasiswa memulai TA dan mengajukan topik, Koordinator menetapkan dua pembimbing setelah ada pengajuan pending, dan Dosen pembimbing mereview pengajuan. Approval mengaktifkan TA tanpa bergantung pada roadmap atau katalog template.

Phase 4 menyediakan upload PDF privat dengan versioning, protected preview, workflow Bimbingan dan review atomik, Personal Workspace, serta catatan Tindak Lanjut pembimbing. Bimbingan dapat mencantumkan item roadmap secara opsional tanpa mengubah checklist tersebut.

Phase 5 menyediakan penjadwalan Seminar Hasil dan Sidang oleh Koordinator dengan proteksi konflik ruangan secara transaksional, agenda read-only untuk Mahasiswa dan Dosen pembimbing aktif, serta monitoring risiko dan analytics status resmi.

Personal Roadmap adalah checklist fleksibel milik mahasiswa. Roadmap boleh kosong, tidak berbobot, tidak menjadi prerequisite workflow, dan persentasenya hanya menggambarkan item yang dicentang. Status `COMPLETED` ditetapkan secara resmi oleh Koordinator pada TA `ACTIVE`, bukan otomatis dari roadmap.

## Database development

Salin `.env.example` menjadi `.env`, lalu isi `DATABASE_URL` dengan koneksi PostgreSQL/Neon development yang valid dan `AUTH_SECRET` yang aman. Private Vercel Blob harus terhubung; untuk local development gunakan `vercel link` lalu `vercel env pull`. `BLOB_READ_WRITE_TOKEN` tetap dapat disediakan oleh environment sebagai opsi token statis, tetapi source tidak mewajibkan metode autentikasi tersebut. Setelah itu jalankan migration dan seed:

```bash
npx prisma migrate dev --name init_database
npm run db:seed
```

Seed menggunakan bcrypt untuk seluruh akun demo dengan password development:

```text
ThesisTrackDemo123!
```

Akun demo menggunakan email berakhiran `@thesistrack.local`, misalnya `admin@thesistrack.local`. Password ini hanya untuk development dan tidak boleh digunakan sebagai credential production.

Rule lintas-record berikut ditegakkan melalui validasi service dan server transaction karena tidak direpresentasikan secara bersih oleh Prisma schema:

- satu mahasiswa maksimal mempunyai satu TA berstatus `DRAFT` atau `ACTIVE`;
- non-admin wajib memiliki Prodi dan NIM/NIP;
- TA aktif mempunyai tepat dua pembimbing aktif yang berbeda, dengan urutan 1 dan 2;
- pembimbing, item roadmap opsional, dan dokumen pada satu bimbingan harus berasal dari TA yang sama;
- validasi bimbingan memperbarui status dokumen tanpa memberi efek samping pada personal roadmap;
- kapasitas ruangan harus positif, jam selesai harus setelah jam mulai, ruangan harus aktif, dan jadwal ruangan tidak boleh overlap.
