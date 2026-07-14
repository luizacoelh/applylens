# ApplyLens 

MVP gerenciador inteligente e local para acompanhar candidaturas de vagas de emprego, extrair requisitos automaticamente e preparar você para entrevistas.

---

##  Status do Projeto

*   **[x] Dashboard:** Visualização geral do funil de candidaturas e vagas ativas.
*   **[x] Cadastro de vagas:** Entrada simplificada de novas oportunidades de emprego.
*   **[x] Detalhes da candidatura:** Tela dedicada para acompanhar o progresso de cada vaga.
*   **[x] Banco de dados:** Persistência local robusta utilizando Prisma ORM com SQLite.
*   **[ / ] Inteligência Artificial (Em desenvolvimento):** Integração com a API do Gemini para análise de fit cultural, geração de checklists personalizados e simulação de perguntas técnicas.

---

##  Stack 

*   **Framework:** Next.js (App Router)
*   **Linguagem:** TypeScript
*   **Estilização:** Tailwind CSS
*   **Banco de Dados:** SQLite
*   **ORM:** Prisma
*   **IA:** Google Gemini SDK

##  Como Rodar Localmente

### 1. Clonar e Instalar Dependências
```
git clone [https://github.com/seu-usuario/applylens.git](https://github.com/seu-usuario/applylens.git)
cd applylens
npm install 
``` 

### 2. Configurar Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto:
```
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="sua_chave_api_aqui"
```
### 3. Rodar as Migrations do Banco de Dados
```
npx prisma migrate dev --name init
```
### 4. Rodar o servidor de desenvolvimento
```
npm run dev
```
Abra http://localhost:3000 no navegador para testar.