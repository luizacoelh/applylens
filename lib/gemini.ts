import { GoogleGenerativeAI } from '@google/generative-ai';
import { JobAnalysis } from '@/types/job';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY não encontrada.");
}

const genAI = new GoogleGenerativeAI(apiKey);

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

export async function analyzeJobWithGemini(jobText: string): Promise<JobAnalysis> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent(PROMPT_TEMPLATE(jobText));
  const rawText = result.response.text();

  // Gemini às vezes envolve o JSON em ```json ... ``` mesmo quando instruído a não fazer isso
  const cleaned = rawText.replace(/```json|```/g, '').trim();

  let parsed: JobAnalysis;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('A IA retornou um formato inválido. Tente novamente.');
  }

  return parsed;
}