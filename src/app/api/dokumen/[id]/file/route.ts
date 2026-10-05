import { get } from "@vercel/blob";
import { PenggunaRole, StatusAktif } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function unavailable(message: string, status = 404) {
  return Response.json({ error: message }, { status });
}

function inlineFilename(filename: string) {
  const safe = filename.replace(/["\r\n]/g, "_");
  return `inline; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(safe)}`;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.mustChangePassword) {
    return unavailable("Anda harus login untuk membuka dokumen.", 401);
  }

  const { id } = await context.params;
  const document = await prisma.dokumen.findUnique({
    where: { id },
    select: {
      namaFile: true,
      storagePath: true,
      tugasAkhir: {
        select: {
          mahasiswaId: true,
          pembimbing: {
            where: { status: StatusAktif.ACTIVE },
            select: { dosenId: true },
          },
        },
      },
    },
  });
  if (!document) return unavailable("Dokumen tidak ditemukan.");

  const authorized =
    (currentUser.role === PenggunaRole.MAHASISWA &&
      document.tugasAkhir.mahasiswaId === currentUser.id) ||
    (currentUser.role === PenggunaRole.DOSEN &&
      document.tugasAkhir.pembimbing.some(
        (item) => item.dosenId === currentUser.id,
      ));
  if (!authorized) return unavailable("Dokumen tidak ditemukan.");
  if (!document.storagePath) {
    return unavailable("File dokumen belum tersedia.");
  }

  try {
    const result = await get(document.storagePath, {
      access: "private",
      ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    });
    if (!result) return unavailable("File dokumen tidak ditemukan.");

    const headers = new Headers({
      "Cache-Control": "private, no-cache",
      ETag: result.blob.etag,
      "X-Content-Type-Options": "nosniff",
    });
    if (result.statusCode === 304) {
      return new Response(null, { status: 304, headers });
    }
    if (result.blob.contentType !== "application/pdf") {
      return unavailable("File dokumen bukan PDF yang valid.", 415);
    }

    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", inlineFilename(document.namaFile));
    headers.set("Content-Length", String(result.blob.size));
    return new Response(result.stream, { status: 200, headers });
  } catch {
    return unavailable(
      "Penyimpanan dokumen belum dikonfigurasi atau tidak dapat diakses.",
      503,
    );
  }
}
