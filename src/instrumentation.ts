export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { getDb } = await import("./db/client");
  const { ingestCsv, CSV_PATH } = await import("./db/ingest");
  const r = ingestCsv(getDb(), CSV_PATH);
  console.log(`[newity] lender snapshot #${r.snapshotId} ${r.status} (${r.rows} rows) from ${CSV_PATH}`);
}
