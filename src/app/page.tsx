import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { App } from "@/components/App";
import { COOKIE, userFromToken } from "@/db/auth";
import { getDb } from "@/db/client";
import { CSV_PATH, ingestCsv } from "@/db/ingest";
import { loadPrograms } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function Page() {
  const db = getDb();
  const user = userFromToken(db, (await cookies()).get(COOKIE)?.value);
  if (!user) redirect("/login");
  let data = loadPrograms(db);
  if (!data) {
    ingestCsv(db, CSV_PATH); // first request beat instrumentation — import inline
    data = loadPrograms(db)!;
  }
  return <App programs={data.programs} snapshot={data.snapshot} user={user} />;
}
