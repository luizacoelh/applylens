import { GoogleGenerativeAI } from "@google/generative-ai";
import { JobAnalysis } from "@/types/job";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY não encontrada.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Modelo atual com tier gratuito confirmado (jul/2026). É um modelo "preview",
// então o Google pode trocar o nome dele com pouco aviso — se um dia o
// /api/analyze voltar a quebrar com erro 404 "no longer available", é isso:
// procure o nome do modelo atual em https://ai.google.dev/gemini-api/docs/models
const GEMINI_MODEL = "gemini-3-flash-preview";

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

// Traduz erros técnicos da API do Gemini em mensagens que a pessoa
// consegue entender e agir a partir delas, em vez de "não foi possível".
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

export async function analyzeJobWithGemini(jobText: string): Promise<JobAnalysis> {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  let rawText: string;
  try {
    const result = await model.generateContent(PROMPT_TEMPLATE(jobText));
    rawText = result.response.text();
  } catch (error) {
    console.error("Erro na chamada à API do Gemini:", error);
    throw toFriendlyError(error);
  }

  // Gemini às vezes envolve o JSON em ```json ... ``` mesmo quando instruído a não fazer isso
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed: JobAnalysis;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("A IA retornou um formato inválido. Tente novamente.");
  }

  return parsed;
}
