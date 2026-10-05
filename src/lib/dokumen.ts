export const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024;

export function sanitizePdfFilename(filename: string) {
  const stem = filename
    .normalize("NFKD")
    .replace(/\.pdf$/i, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);

  return `${stem || "dokumen"}.pdf`;
}

export function buildDocumentPath(tugasAkhirId: string, filename: string) {
  return `documents/${tugasAkhirId}/${sanitizePdfFilename(filename)}`;
}

export function isDocumentPathForTugasAkhir(
  pathname: string,
  tugasAkhirId: string,
) {
  const prefix = `documents/${tugasAkhirId}/`;
  if (!pathname.startsWith(prefix)) return false;

  const filename = pathname.slice(prefix.length);
  return (
    filename.length > 4 &&
    filename.length <= 255 &&
    !filename.includes("..") &&
    /^[a-zA-Z0-9._-]+\.pdf$/i.test(filename)
  );
}
