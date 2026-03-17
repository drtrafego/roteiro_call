import { NextRequest, NextResponse } from 'next/server'
import { getSql } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET — lista todas as respostas (mais recentes primeiro)
export async function GET() {
  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM respostas_call
      ORDER BY criado_em DESC
      LIMIT 200
    `) as Record<string, unknown>[];
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('does not exist')) {
      return NextResponse.json({ ok: true, data: [], aviso: 'Tabela ainda não criada. Acesse /api/setup primeiro.' })
    }
    return NextResponse.json({ ok: false, erro: msg }, { status: 500 })
  }
}

// POST — salva uma resposta de call
export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const sql = getSql();

    const rows = (await sql`
      INSERT INTO respostas_call (
        nome_cliente, negocio,
        r1_origem_clientes, r2_previsibilidade, r3_tempo_resposta,
        r4_maior_desafio, r5_experiencia_anterior, r6_visibilidade_canais,
        r7_impacto_caixa, r8_impacto_futuro, r9_o_que_mudaria, r10_ticket_medio,
        nota_dor_principal, nota_30_porcento, nota_observacoes,
        transicao_dor_usada, ticket_medio_calc, calculo_roi,
        obj_vou_pensar, obj_esta_caro, obj_nao_funcionou, obj_sem_budget, obj_falar_socio,
        fech_plano, fech_objecao_final, fech_proximo_passo, fech_resultado
      ) VALUES (
        ${b.nome_cliente        ?? null}, ${b.negocio               ?? null},
        ${b.r1_origem_clientes  ?? null}, ${b.r2_previsibilidade    ?? null}, ${b.r3_tempo_resposta      ?? null},
        ${b.r4_maior_desafio    ?? null}, ${b.r5_experiencia_anterior ?? null}, ${b.r6_visibilidade_canais ?? null},
        ${b.r7_impacto_caixa   ?? null}, ${b.r8_impacto_futuro     ?? null}, ${b.r9_o_que_mudaria       ?? null}, ${b.r10_ticket_medio ?? null},
        ${b.nota_dor_principal  ?? null}, ${b.nota_30_porcento      ?? null}, ${b.nota_observacoes       ?? null},
        ${b.transicao_dor_usada ?? null}, ${b.ticket_medio_calc     ?? null}, ${b.calculo_roi            ?? null},
        ${b.obj_vou_pensar      ?? null}, ${b.obj_esta_caro         ?? null}, ${b.obj_nao_funcionou      ?? null}, ${b.obj_sem_budget ?? null}, ${b.obj_falar_socio ?? null},
        ${b.fech_plano          ?? null}, ${b.fech_objecao_final    ?? null}, ${b.fech_proximo_passo     ?? null}, ${b.fech_resultado ?? null}
      )
      RETURNING id, criado_em
    `) as Record<string, unknown>[];

    const row = rows[0];
    return NextResponse.json({ ok: true, id: row.id, criado_em: row.criado_em })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, erro: msg }, { status: 500 })
  }
}
