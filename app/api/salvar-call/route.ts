import { NextRequest, NextResponse } from "next/server";
import { sql, criarTabela } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await criarTabela();

    const result = await sql`
      INSERT INTO respostas_call (
        nome_cliente, negocio,
        r1_origem_clientes, r2_previsibilidade, r3_tempo_resposta,
        r4_maior_desafio, r5_experiencia_anterior, r6_visibilidade_canais,
        r7_impacto_caixa, r8_impacto_futuro, r9_o_que_mudaria, r10_ticket_medio,
        nota_dor_principal, nota_30_clientes, nota_observacoes,
        transicao_dor, calculo_roi,
        obj_vou_pensar, obj_esta_caro, obj_nao_funcionou, obj_sem_budget, obj_falar_socio,
        fech_plano, fech_objecao_final, fech_proximo_passo, fech_resultado
      ) VALUES (
        ${body.nome_cliente || null}, ${body.negocio || null},
        ${body.r1 || null}, ${body.r2 || null}, ${body.r3 || null},
        ${body.r4 || null}, ${body.r5 || null}, ${body.r6 || null},
        ${body.r7 || null}, ${body.r8 || null}, ${body.r9 || null}, ${body.r10 || null},
        ${body.nota_dor || null}, ${body.nota_30 || null}, ${body.nota_obs || null},
        ${body.transicao_dor || null}, ${body.calculo_roi || null},
        ${body.obj1_nota || null}, ${body.obj2_nota || null}, ${body.obj3_nota || null},
        ${body.obj4_nota || null}, ${body.obj5_nota || null},
        ${body.fech_plano || null}, ${body.fech_objecao || null},
        ${body.fech_proximo || null}, ${body.fech_resultado || null}
      )
      RETURNING id, criado_em
    `;

    return NextResponse.json({ ok: true, id: result[0].id, criado_em: result[0].criado_em });
  } catch (err) {
    console.error("Erro ao salvar call:", err);
    return NextResponse.json({ ok: false, erro: String(err) }, { status: 500 });
  }
}
