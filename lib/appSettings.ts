import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export interface AppSettings {
  dailyAiLimit: number;
  ipHourlyLimit: number;
  maxDescriptionLength: number;
}

// AppSettings é uma tabela de uma linha só (singleton), editável em /admin
// sem precisar de deploy. Se a linha ainda não existir (primeira vez que o
// app roda depois desta sprint), cria com os valores padrão automaticamente.
export async function getAppSettings(): Promise<AppSettings> {
  const settings = await prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  });

  return {
    dailyAiLimit: settings.dailyAiLimit,
    ipHourlyLimit: settings.ipHourlyLimit,
    maxDescriptionLength: settings.maxDescriptionLength,
  };
}

export async function updateAppSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const settings = await prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    update: patch,
    create: { id: SETTINGS_ID, ...patch },
  });

  return {
    dailyAiLimit: settings.dailyAiLimit,
    ipHourlyLimit: settings.ipHourlyLimit,
    maxDescriptionLength: settings.maxDescriptionLength,
  };
}
