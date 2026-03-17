import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ ok: false, erro: "ID obrigatório" }, { status: 400 });

    const rows = await sql`SELECT * FROM respostas_call WHERE id = ${id}`;
    if (!rows.length) return NextResponse.json({ ok: false, erro: "Call não encontrada" }, { status: 404 });

    const call = rows[0];

    const prompt = `Você é um especialista em vendas consultivas e análise de calls comerciais para uma agência de tráfego pago chamada DR.Tráfego.

Analise as respostas coletadas durante uma call de diagnóstico comercial e retorne uma análise estratégica completa.

DADOS DA CALL:
Cliente: ${call.nome_cliente || "Não informado"}
Negócio/Segmento: ${call.negocio || "Não informado"}
Data: ${new Date(call.criado_em).toLocaleDateString("pt-BR")}

DIAGNÓSTICO — SITUAÇÃO:
1. Origem atual dos clientes: ${call.r1_origem_clientes || "-"}
2. Previsibilidade mensal: ${call.r2_previsibilidade || "-"}
3. Tempo de resposta a leads: ${call.r3_tempo_resposta || "-"}

DIAGNÓSTICO — PROBLEMA:
4. Maior desafio de crescimento: ${call.r4_maior_desafio || "-"}
5. Experiência anterior com tráfego: ${call.r5_experiencia_anterior || "-"}
6. Visibilidade de canais: ${call.r6_visibilidade_canais || "-"}

DIAGNÓSTICO — IMPLICAÇÃO:
7. Impacto no caixa: ${call.r7_impacto_caixa || "-"}
8. Impacto futuro se continuar assim: ${call.r8_impacto_futuro || "-"}
9. O que mudaria com 30% mais clientes: ${call.r9_o_que_mudaria || "-"}
10. Ticket médio por cliente: ${call.r10_ticket_medio || "-"}

RESUMO DO DIAGNÓSTICO:
Dor principal: ${call.nota_dor_principal || "-"}
Motivação de crescimento: ${call.nota_30_clientes || "-"}
Observações gerais: ${call.nota_observacoes || "-"}

OBJEÇÕES LEVANTADAS:
"Vou pensar": ${call.obj_vou_pensar || "Não levantada"}
"Está caro": ${call.obj_esta_caro || "Não levantada"}
"Não funcionou antes": ${call.obj_nao_funcionou || "Não levantada"}
"Sem budget": ${call.obj_sem_budget || "Não levantada"}
"Falar com sócio/esposa": ${call.obj_falar_socio || "Não levantada"}

FECHAMENTO:
Plano apresentado: ${call.fech_plano || "-"}
Objeção final: ${call.fech_objecao_final || "-"}
Próximo passo combinado: ${call.fech_proximo_passo || "-"}
Resultado da call: ${call.fech_resultado || "-"}

---

Responda em JSON com exatamente esta estrutura (sem markdown, só o JSON puro):
{
  "temperatura": "quente|morno|frio",
  "score": 0-10,
  "perfil_lead": "descrição em 1 parágrafo do perfil deste lead",
  "dor_dominante": "a dor mais forte identificada",
  "objecao_principal": "a objeção mais crítica e como contorná-la",
  "pontos_fortes": ["ponto 1", "ponto 2", "ponto 3"],
  "riscos": ["risco 1", "risco 2"],
  "proximo_passo": "ação específica e urgente para fechar este lead",
  "script_followup": "mensagem pronta para enviar via WhatsApp nas próximas 24h",
  "analise_completa": "análise detalhada em 3-4 parágrafos com insights estratégicos sobre este lead e como maximizar as chances de fechamento"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text().replace(/```json\n?|\n?```/g, "").trim();
    
    let analise;
    try {
      analise = JSON.parse(raw);
    } catch {
      analise = { analise_completa: raw };
    }

    await sql`
      UPDATE respostas_call SET
        ia_temperatura       = ${analise.temperatura || null},
        ia_perfil_lead       = ${analise.perfil_lead || null},
        ia_objecao_principal = ${analise.objecao_principal || null},
        ia_proximo_passo     = ${analise.proximo_passo || null},
        ia_analise_completa  = ${raw},
        ia_gerada_em         = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ ok: true, analise });
  } catch (err) {
    console.error("Erro na análise:", err);
    return NextResponse.json({ ok: false, erro: String(err) }, { status: 500 });
  }
}
