import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getAppSettings, updateAppSettings } from "@/lib/appSettings";

export const runtime = "nodejs";

export async function GET() {
  const { user, response } = await requireAdmin();
  if (!user) return response;

  const settings = await getAppSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const { user, response } = await requireAdmin();
  if (!user) return response;

  const body = await req.json();
  const { dailyAiLimit, ipHourlyLimit, maxDescriptionLength } = body;

  for (const [key, value] of Object.entries({ dailyAiLimit, ipHourlyLimit, maxDescriptionLength })) {
    if (value !== undefined && (typeof value !== "number" || value <= 0 || !Number.isInteger(value))) {
      return NextResponse.json({ error: `Valor inválido para ${key} — precisa ser um inteiro positivo.` }, { status: 400 });
    }
  }

  const settings = await updateAppSettings({ dailyAiLimit, ipHourlyLimit, maxDescriptionLength });
  return NextResponse.json(settings);
}
