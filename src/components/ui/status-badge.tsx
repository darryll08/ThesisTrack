const success = new Set(["ACTIVE", "SELESAI", "COMPLETED", "TERVALIDASI", "TERVERIFIKASI", "DISETUJUI", "RENDAH"]);
const warning = new Set(["MENUNGGU", "MENUNGGU_REVIEW", "TERJADWAL", "SEDANG", "IN_PROGRESS"]);
const attention = new Set(["PERLU_REVISI", "TINGGI", "CANCELLED", "DIBATALKAN", "INACTIVE"]);
export function StatusBadge({ status }: { status: string }) {
  const tone = success.has(status) ? "success" : warning.has(status) ? "waiting" : attention.has(status) ? "attention" : "neutral";
  return <span className={`status-badge ${tone}`}><span aria-hidden="true" />{status.replaceAll("_", " ")}</span>;
}
