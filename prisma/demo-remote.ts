const expectedDemoHost =
  "ep-spring-wildflower-azch8bxg-pooler.c-3.ap-southeast-1.aws.neon.tech";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL demo tidak tersedia di .env.demo.local.");
  }

  const target = new URL(databaseUrl);
  if (target.hostname !== expectedDemoHost) {
    throw new Error("Remote demo reset ditolak: target bukan database demo.");
  }

  process.env.ALLOW_DEMO_RESET = "true";
  process.argv[2] = "reset";
  await import("./demo.ts");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Remote demo reset gagal.");
  process.exitCode = 1;
});
