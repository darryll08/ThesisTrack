import { Prisma } from "@prisma/client";

export function uniqueTarget(error: unknown): string[] {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = error.meta?.target;
    return Array.isArray(target) ? target.map(String) : [String(target ?? "")];
  }

  return [];
}
