# ThesisTrack UTS Demo Guide

> **LOCAL/DEMO ONLY** — seluruh credential di dokumen ini hanya untuk database demo lokal dan bukan production secret.

## Preparation

Run from the project root in PowerShell:

```powershell
$env:ALLOW_DEMO_RESET = "true"
npm run demo:reset
npm run demo:status
npm run dev
```

Expected status is `READY`, with `PENGGUNA = 1` and every other domain table `0`.

## Bootstrap Admin

- URL: `http://localhost:3000/login`
- Email: `admin@thesistrack.local`
- Password: `ThesisTrackDemo123!`
- The demo Admin does not require a first-login password change.

## Data to Create Live

Create these records through the UI; do not seed them.

| Record | Values |
| --- | --- |
| Prodi | `TSD` - `Teknologi Sains Data` - ACTIVE |
| Ruangan | `FTMM-301` - `Ruang Sidang 301` - `Gedung FTMM Lantai 3` - capacity `20` - ACTIVE |
| Mahasiswa | `Mahasiswa Demo` - `mahasiswa.demo@thesistrack.local` - `164221001` |
| Dosen 1 | `Dr. Dosen Satu` - `dosen.satu@thesistrack.local` - `198501012010121001` |
| Dosen 2 | `Dr. Dosen Dua` - `dosen.dua@thesistrack.local` - `198602022011121002` |
| Koordinator | `Koordinator Demo` - `koordinator.demo@thesistrack.local` - `197901012005011001` |

Use temporary password `DemoPass123!` for the four non-Admin accounts. At first login, change accounts used in the demo to `DemoBaru123!`. Do not show passwords on screen longer than necessary.

## Rehearsal Order

1. Admin: create Prodi, Ruangan, Mahasiswa, two Dosen, and Koordinator.
2. Mahasiswa: first-login password change; start TA; submit title `Sistem Pemantauan Tugas Akhir Berbasis Web`, field `Sistem Informasi`; add roadmap items `Susun proposal` and `Implementasi aplikasi`; rename the first to `Finalisasi proposal`; check and uncheck it.
3. Koordinator: assign Dr. Dosen Satu as supervisor 1 and Dr. Dosen Dua as supervisor 2.
4. Dosen 1: approve the topic with note `Topik valid untuk dilanjutkan.`; verify the TA becomes ACTIVE.
5. Mahasiswa: upload `output/pdf/UTS_Demo_Proposal.pdf`; check `Finalisasi proposal`; create task `Siapkan presentasi UTS`; create guidance request `Review rancangan implementasi aplikasi` linked to supervisor 1, roadmap item 2, and the uploaded PDF.
6. Dosen 1: validate the guidance request with feedback `Rancangan implementasi sudah jelas.`; verify roadmap remains 50%.
7. Koordinator: schedule Seminar Hasil in FTMM-301 on `2026-10-15`, 09:00-10:30; open Monitoring and Analytics; complete the TA and confirm the dialog.
8. Mahasiswa: verify status and completion date, and confirm the roadmap is read-only while still 50%.

Roadmap rules to state during the demo: personal, flexible item count, no weight, no manually entered percentage, progress is derived from checklist state, and 100% roadmap never completes the official TA automatically.

## Prisma Studio Checks

Open Studio without editing records:

```powershell
npx prisma studio
```

- After Admin CRUD: `Prodi`, `Pengguna`, `Ruangan`.
- After starting/submitting TA: `TugasAkhir`, `PengajuanTopik`, `TaMilestone`.
- After assignment: `Pembimbing` must have exactly two ACTIVE rows.
- After academic workflow: `Bimbingan`, `Dokumen`, `PersonalTask`.
- After scheduling: `UjianTa`.
- Never edit data in Studio during the rehearsal.

## Short-Time Fallback

If presentation time is limited, show: clean `demo:status`; Admin user creation; Mahasiswa start + submit + roadmap check; Koordinator assignment; Dosen approval; Koordinator Monitoring/Analytics + completion; then the final Prisma Studio model counts. Explain document, guidance, and schedule using the prepared screenshots in `demo-evidence/`.

## Cleanup

```powershell
$env:ALLOW_DEMO_RESET = "true"
npm run demo:reset
npm run demo:status
```

The final line must be `READY`.
