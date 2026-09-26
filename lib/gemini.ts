import { GoogleGenerativeAI } from "@google/generative-ai";
import { JobAnalysis } from "@/types/job";

const GEMINI_MODEL = "gemini-3-flash-preview";

let cachedClient: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY não configurada. Defina essa variável de ambiente para usar a análise por IA."
    );
  }

  cachedClient = new GoogleGenerativeAI(apiKey);
  return cachedClient;
}

// Os delimitadores """ em torno do jobText são a principal mitigação contra
// prompt injection: o modelo vê o texto da vaga como dado, não como instrução.
// A validação de shape abaixo (isValidAnalysis) é a segunda camada: mesmo que
// o modelo seja manipulado a retornar algo fora do esperado, rejeitamos.
const PROMPT_TEMPLATE = (jobText: string) => `
Você é um assistente de análise de vagas de emprego. Analise a vaga abaixo e
retorne APENAS um JSON válido, sem markdown, sem texto extra, seguindo
exatamente este formato:

{
  "company": "nome da empresa",
  "title": "cargo",
  "summary": "resumo da vaga em 2-3 frases",
  "requirements": ["requisito 1", "requisito 2"],
  "technologies": ["tecnologia 1", "tecnologia 2"],
  "questions": ["pergunta técnica provável 1", "pergunta técnica provável 2", "pergunta técnica provável 3"],
  "checklist": ["tarefa de preparação 1", "tarefa de preparação 2", "tarefa de preparação 3"]
}

Regras:
- "technologies" deve conter só nomes de tecnologias/ferramentas (ex: "Java", "Docker", "SQL"), sem frases.
- "questions" deve ter entre 3 e 5 perguntas técnicas prováveis de entrevista baseadas nas tecnologias e requisitos da vaga.
- "checklist" deve ter entre 3 e 5 ações práticas de preparação (ex: "Revisar conceitos de REST API").
- Se a empresa ou o cargo não estiverem explícitos no texto, faça sua melhor inferência.
- Responda em português.

Vaga:
"""
${jobText}
"""
`;

function toFriendlyError(error: unknown): Error {
  const status = (error as { status?: number } | undefined)?.status;

  if (status === 429) {
    return new Error(
      "Limite de uso gratuito da IA atingido no momento. Espere alguns segundos e tente novamente."
    );
  }

  if (status === 404) {
    return new Error(
      `O modelo de IA configurado (${GEMINI_MODEL}) não está mais disponível. É preciso atualizar o nome do modelo em lib/gemini.ts.`
    );
  }

  if (status === 400) {
    return new Error("A descrição enviada não pôde ser processada pela IA. Tente reformular ou encurtar o texto.");
  }

  return new Error("Não foi possível analisar a vaga. Tente novamente em instantes.");
}

// Valida que o output do Gemini tem o shape esperado antes de ser usado.
// Segunda linha de defesa contra prompt injection: mesmo que o modelo retorne
// dados manipulados (ex: campos com conteúdo arbitrário ou arrays gigantes),
// eles são rejeitados aqui. Os limites de tamanho também protegem contra
// o modelo gerar outputs anormalmente grandes que inflariam o banco.
function isValidAnalysis(data: unknown): data is JobAnalysis {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;

  if (typeof d.company !== "string" || d.company.length === 0 || d.company.length > 200) return false;
  if (typeof d.title !== "string" || d.title.length === 0 || d.title.length > 200) return false;
  if (typeof d.summary !== "string" || d.summary.length > 2000) return false;

  for (const field of ["requirements", "technologies", "questions", "checklist"] as const) {
    if (!Array.isArray(d[field])) return false;
  }

  const arr = d as { requirements: unknown[]; technologies: unknown[]; questions: unknown[]; checklist: unknown[] };
  if (arr.requirements.length > 20) return false;
  if (arr.technologies.length > 30) return false;
  if (arr.questions.length > 10) return false;
  if (arr.checklist.length > 10) return false;

  return true;
}

export async function analyzeJobWithGemini(jobText: string): Promise<JobAnalysis> {
  const model = getClient().getGenerativeModel({ model: GEMINI_MODEL });

  let rawText: string;
  try {
    const result = await model.generateContent(PROMPT_TEMPLATE(jobText));
    rawText = result.response.text();
  } catch (error) {
    console.error("Erro na chamada à API do Gemini:", error);
    throw toFriendlyError(error);
  }

  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("A IA retornou um formato inválido. Tente novamente.");
  }

  // Valida o shape antes de retornar — rejeita outputs fora do esperado
  if (!isValidAnalysis(parsed)) {
    console.error("Output do Gemini fora do schema esperado:", cleaned.slice(0, 500));
    throw new Error("A IA retornou um formato inesperado. Tente novamente.");
  }

  return parsed;
}
