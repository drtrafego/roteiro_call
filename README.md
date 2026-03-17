# Roteiro de Call — DR.Tráfego

Sistema de roteiro interativo com análise de calls por IA, integrado ao Neon e com autenticação via Stack Auth.

## Estrutura

```
app/
  page.tsx                  → Roteiro interativo (público)
  analise/
    page.tsx                → Lista de calls (protegido por Stack Auth)
    AnaliseClient.tsx       → Interface de análise com IA
  api/
    salvar-call/route.ts    → Salva respostas no Neon
    analisar/route.ts       → Chama Claude API e salva análise
  handler/[...stack]/       → Páginas de login do Stack Auth
lib/
  db.ts                     → Conexão Neon + create table automático
  stack.ts                  → Config Stack Auth
middleware.ts               → Proteção de rotas via Stack Auth
```

## Setup — 3 passos

### 1. Variáveis de ambiente

Renomeie `.env.local` e preencha:

```env
DATABASE_URL=postgresql://USER:PASS@HOST/DB?sslmode=require
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_STACK_PROJECT_ID=...
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=...
STACK_SECRET_SERVER_KEY=...
```

**Neon:** cole sua connection string do dashboard do Neon.

**Stack Auth:** crie um projeto em https://app.stack-auth.com → copie as 3 chaves.

**Anthropic:** gere em https://console.anthropic.com

### 2. Instalar e rodar

```bash
npm install
npm run dev
```

### 3. Deploy no Vercel

```bash
# Via Vercel CLI
npx vercel

# Ou conecte o repositório no dashboard do Vercel
# e adicione as env vars em Settings → Environment Variables
```

## Como usar

1. Acesse `/` → roteiro interativo durante a call
2. Preencha as respostas → clique **"Salvar no banco"** no final
3. Acesse `/analise` → faça login → selecione a call → clique para analisar
4. A IA retorna: temperatura do lead, score, perfil, objeção principal, próximo passo e script de follow-up pronto

## Tabela criada automaticamente no Neon

`respostas_call` — criada no primeiro acesso, sem necessidade de rodar migrations manualmente.
