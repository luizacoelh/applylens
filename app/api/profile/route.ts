import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";
import { parseArray, stringifyArray } from "@/lib/json";
import { ExperienceLevel } from "@prisma/client";
import { UpdateProfileRequest } from "@/types/profile";

export const runtime = "nodejs";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });

  if (!profile) {
    return NextResponse.json(null);
  }

  return NextResponse.json({
    goal: profile.goal,
    interestArea: profile.interestArea,
    experience: profile.experience,
    skills: parseArray(profile.skills),
  });
}

// Cria OU atualiza o perfil do usuário logado (upsert) — usado tanto no
// onboarding (primeira vez) quanto na edição posterior em /perfil.
export async function PUT(req: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body: UpdateProfileRequest = await req.json();
  const { goal, interestArea, experience, skills } = body;

  if (experience !== undefined && !Object.values(ExperienceLevel).includes(experience)) {
    return NextResponse.json({ error: "Nível de experiência inválido." }, { status: 400 });
  }

  try {
    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        goal: goal ?? null,
        interestArea: interestArea ?? null,
        experience: experience ?? ExperienceLevel.NAO_INFORMADO,
        skills: stringifyArray(skills ?? []),
      },
      update: {
        ...(goal !== undefined ? { goal: goal.trim() === "" ? null : goal.trim() } : {}),
        ...(interestArea !== undefined
          ? { interestArea: interestArea.trim() === "" ? null : interestArea.trim() }
          : {}),
        ...(experience !== undefined ? { experience } : {}),
        ...(skills !== undefined ? { skills: stringifyArray(skills) } : {}),
      },
    });

    return NextResponse.json({
      goal: profile.goal,
      interestArea: profile.interestArea,
      experience: profile.experience,
      skills: parseArray(profile.skills),
    });
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    return NextResponse.json({ error: "Não foi possível salvar o perfil." }, { status: 500 });
  }
}
