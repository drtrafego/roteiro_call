import { neon } from "@neondatabase/serverless";

export function getSql() {
  return neon(process.env.DATABASE_URL!);
}

export async function criarTabela() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS respostas_call (
      id            SERIAL PRIMARY KEY,
      criado_em     TIMESTAMPTZ DEFAULT NOW(),

      nome_cliente  TEXT,
      negocio       TEXT,

      r1_origem_clientes        TEXT,
      r2_previsibilidade        TEXT,
      r3_tempo_resposta         TEXT,

      r4_maior_desafio          TEXT,
      r5_experiencia_anterior   TEXT,
      r6_visibilidade_canais    TEXT,

      r7_impacto_caixa          TEXT,
      r8_impacto_futuro         TEXT,
      r9_o_que_mudaria          TEXT,
      r10_ticket_medio          TEXT,

      nota_dor_principal        TEXT,
      nota_30_clientes          TEXT,
      nota_observacoes          TEXT,

      transicao_dor             TEXT,
      calculo_roi               TEXT,

      obj_vou_pensar            TEXT,
      obj_esta_caro             TEXT,
      obj_nao_funcionou         TEXT,
      obj_sem_budget            TEXT,
      obj_falar_socio           TEXT,

      fech_plano                TEXT,
      fech_objecao_final        TEXT,
      fech_proximo_passo        TEXT,
      fech_resultado            TEXT,

      ia_perfil_lead            TEXT,
      ia_temperatura            TEXT,
      ia_objecao_principal      TEXT,
      ia_proximo_passo          TEXT,
      ia_analise_completa       TEXT,
      ia_gerada_em              TIMESTAMPTZ
    );
  `;
}
