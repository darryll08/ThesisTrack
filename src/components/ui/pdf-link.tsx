import { ExternalLink, FileText } from "lucide-react";

export function PdfLink({ documentId, available }: { documentId: string; available: boolean }) {
  if (!available) return <span className="pdf-unavailable">Tidak tersedia</span>;

  return (
    <a
      href={`/api/dokumen/${documentId}/file`}
      target="_blank"
      rel="noreferrer"
      className="pdf-link"
      aria-label="Buka PDF di tab baru"
    >
      <FileText size={14} aria-hidden="true" />
      <span>Buka PDF</span>
      <ExternalLink size={12} aria-hidden="true" />
    </a>
  );
}
