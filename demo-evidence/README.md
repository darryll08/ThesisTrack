# UTS Full Rehearsal Evidence

Rehearsal date: 4 October 2026 (Asia/Jakarta). Browser evidence uses JPG because that is the native capture format of the automated browser.

| File | Step | Role | Action | Expected result |
| --- | --- | --- | --- | --- |
| `01-demo-status.jpg` | Preparation/cleanup | System | Run `demo:status` | All 13 domain counts match clean-demo targets and status is READY. |
| `02-admin-dashboard.jpg` | 1 | Admin | Login | Admin dashboard loads with clean master-data totals. |
| `03-admin-prodi-created.jpg` | 2 | Admin | Create Prodi | TSD is visible; `Prodi` count becomes 1. |
| `04-admin-room-created.jpg` | 3 | Admin | Create room | FTMM-301 is visible; `Ruangan` count becomes 1. |
| `05-admin-users-created.jpg` | 4-7 | Admin | Create Mahasiswa, 2 Dosen, Koordinator | Five total users exist including bootstrap Admin. |
| `10-koordinator-assignment.jpg` | 14-15 | Koordinator | Assign exactly two supervisors | Both supervisors are visible and ACTIVE. |
| `11-dosen-review-result.jpg` | 16-19 | Dosen | Approve topic | Topic is DISETUJUI and TA has progressed through ACTIVE. |
| `12-ta-active-dashboard.jpg` | 19-23 | Mahasiswa | Open active workflow | TA details, supervisors, and derived roadmap are visible. |
| `13-document-uploaded.jpg` | 20 | Mahasiswa | Upload valid PDF | Proposal v1 is persisted and listed. |
| `15-personal-task.jpg` | 22 | Mahasiswa | Create PersonalTask | Task is listed as TODO. |
| `16-bimbingan-validated.jpg` | 21, 25-27 | Mahasiswa | Inspect validated guidance | Guidance is TERVALIDASI and roadmap remains 50%. |
| `16-dosen-bimbingan-validated.jpg` | 25-27 | Dosen | Validate guidance | Review result is visible; no roadmap mutation occurs. |
| `17-jadwal.jpg` | 28-29 | Koordinator | Create schedule | Seminar Hasil is TERJADWAL for FTMM-301. |
| `17-agenda-mahasiswa.jpg` | 29 | Mahasiswa | Inspect agenda | The new schedule is visible to the student. |
| `18-monitoring.jpg` | 30 | Koordinator | Open Monitoring | ACTIVE TA and 50% roadmap are visible. |
| `19-analytics.jpg` | 31 | Koordinator | Open Analytics | Population and roadmap analytics render correctly. |
| `20-ta-completed.jpg` | 32-34 | Koordinator | Complete TA | Status is COMPLETED after confirmation. |
| `20-roadmap-read-only.jpg` | 34-35 | Mahasiswa | Inspect completed TA | Completion date is present and roadmap is read-only at 50%. |
| `21-database-final.jpg` | DB evidence | Prisma Studio | Inspect all models | Counts show the accumulated workflow across all relevant models. |

The screenshots are cumulative proof: earlier transitions are visible in their resulting list/detail state without exposing passwords, hashes, connection strings, or other secrets. No database record was edited through Prisma Studio.
