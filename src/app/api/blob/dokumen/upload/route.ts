import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { PenggunaRole, TugasAkhirStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { isDocumentPathForTugasAkhir, MAX_PDF_SIZE_BYTES } from "@/lib/dokumen";
import { prisma } from "@/lib/prisma";
import { blobDokumenPayloadSchema } from "@/validations/dokumen";

export const runtime = "nodejs";

class UploadAuthorizationError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function authorizeUpload(pathname: string, clientPayload: string | null) {
  const mahasiswa = await getCurrentUser();
  if (!mahasiswa) {
    throw new UploadAuthorizationError("Anda harus login.", 401);
  }
  if (
    mahasiswa.mustChangePassword ||
    mahasiswa.role !== PenggunaRole.MAHASISWA
  ) {
    throw new UploadAuthorizationError("Upload tidak diizinkan.", 403);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(clientPayload ?? "");
  } catch {
    throw new UploadAuthorizationError("Payload upload tidak valid.", 400);
  }
  const parsed = blobDokumenPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new UploadAuthorizationError("Payload upload tidak valid.", 400);
  }

  const tugasAkhir = await prisma.tugasAkhir.findFirst({
    where: {
      id: parsed.data.tugasAkhirId,
      mahasiswaId: mahasiswa.id,
      status: TugasAkhirStatus.ACTIVE,
    },
    select: { id: true },
  });
  if (!tugasAkhir) {
    throw new UploadAuthorizationError(
      "Tugas akhir aktif tidak ditemukan.",
      403,
    );
  }
  if (!isDocumentPathForTugasAkhir(pathname, tugasAkhir.id)) {
    throw new UploadAuthorizationError("Path dokumen tidak valid.", 400);
  }

  return { mahasiswa, tugasAkhir };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;
    if (body.type === "blob.generate-client-token") {
      await authorizeUpload(body.payload.pathname, body.payload.clientPayload);
    }

    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const { mahasiswa, tugasAkhir } = await authorizeUpload(
          pathname,
          clientPayload,
        );

        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: MAX_PDF_SIZE_BYTES,
          validUntil: Date.now() + 10 * 60 * 1000,
          addRandomSuffix: true,
          allowOverwrite: false,
          tokenPayload: JSON.stringify({
            tugasAkhirId: tugasAkhir.id,
            mahasiswaId: mahasiswa.id,
          }),
        };
      },
      onUploadCompleted: async () => {},
    });

    return Response.json(result);
  } catch (error) {
    if (error instanceof UploadAuthorizationError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json(
      {
        error:
          "Penyimpanan dokumen belum dikonfigurasi atau tidak dapat diakses.",
      },
      { status: 503 },
    );
  }
}
