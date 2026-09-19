import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function GET() {
  const { user, response } = await requireAdmin();
  if (!user) return response;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      dailyAiLimitOverride: true,
      geminiCallCount: true,
      geminiCallResetAt: true,
      createdAt: true,
      _count: { select: { jobs: true, aiUsage: true } },
    },
  });

  return NextResponse.json(users);
}
