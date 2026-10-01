import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ManagerApp } from "@/components/manager/ManagerApp";
import { COOKIE, userFromToken } from "@/db/auth";
import { getDb } from "@/db/client";
import { CSV_PATH, ingestCsv } from "@/db/ingest";
import { loadPrograms } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function ManagerPage() {
  const db = getDb();
  const user = userFromToken(db, (await cookies()).get(COOKIE)?.value);
  if (!user) redirect("/login");
  if (user.role !== "manager") redirect("/");
  let data = loadPrograms(db);
  if (!data) {
    ingestCsv(db, CSV_PATH);
    data = loadPrograms(db)!;
  }
  return <ManagerApp user={user} snapshot={data.snapshot} />;
}
