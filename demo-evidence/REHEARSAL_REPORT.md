# ThesisTrack UTS Rehearsal Report

Date: 4 October 2026 (Asia/Jakarta)

## Result

`UTS DEMO MODE READY`

The full role sequence passed: Admin CRUD; Mahasiswa first-login flow, TA start, topic submission, flexible personal roadmap add/rename/check/uncheck, PDF upload, PersonalTask, and guidance request; Koordinator two-supervisor assignment, scheduling, Monitoring, Analytics, and official completion; Dosen topic approval and guidance validation.

## Business Evidence

- Topic approval changed the official TA from DRAFT to ACTIVE.
- Exactly two supervisors were ACTIVE (orders 1 and 2).
- Roadmap progress was derived from checklist state: 1 of 2 items = 50%.
- Guidance validation left roadmap progress at 50%.
- Official completion succeeded while roadmap remained 50%.
- Completed TA had `tanggalSelesai = 2026-10-04` and the roadmap became read-only.
- Prisma Studio showed: Prodi 1, Pengguna 5, TugasAkhir 1, PengajuanTopik 1, Pembimbing 2, MasterMilestone 0, TaMilestone 2, Bimbingan 1, Dokumen 1, PersonalTask 1, TindakLanjut 0, Ruangan 1, UjianTa 1.

## Cleanup

- Deleted the one exact rehearsal Blob path; no wildcard deletion was used.
- Ran `demo:reset` and `demo:status` after rehearsal.
- Final state: PENGGUNA 1; every other domain table 0; `READY`.
- Temporary rendered PDF preview was removed. The reusable valid upload fixture remains at `output/pdf/UTS_Demo_Proposal.pdf`.

## Recording

`SCREEN RECORDING NOT AVAILABLE — SCREENSHOT EVIDENCE COMPLETE`

No existing ffmpeg installation was available. No recording software was installed.

## Regression

- Prisma format/validate/generate: PASS
- Migrate status: PASS (2 migrations, database up to date)
- Drift check: PASS (`No difference detected`)
- Jakarta date tests: PASS (2/2)
- Phase 5 and roadmap helper tests: PASS
- ESLint: PASS
- TypeScript `--noEmit`: PASS
- Production build: PASS (26/26 static pages generated)
