import { NextResponse } from "next/server";
import { getEngineStatus, getAllCompanies } from "@/lib/engine";

export async function GET() {
  const status = getEngineStatus();
  const companies = getAllCompanies();

  return NextResponse.json({ status, companies });
}
