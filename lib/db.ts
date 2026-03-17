import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | null = null;

export function getSql() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

// Backwards-compatible alias used via tagged template literal
export const sql: ReturnType<typeof neon> = new Proxy({} as ReturnType<typeof neon>, {
  apply(_target, _thisArg, args) {
    return (getSql() as (...a: unknown[]) => unknown)(...args);
  },
  get(_target, prop) {
    return (getSql() as unknown as Record<string | symbol, unknown>)[prop];
  },
});


export async function criarTabela() {
  await sql`
    CREATE TABLE IF NOT EXISTS respostas_call (
      id            SERIAL PRIMARY KEY,
      criado_em     TIMESTAMPTZ DEFAULT NOW(),

      -- Identificação
      nome_cliente  TEXT,
      negocio       TEXT,

      -- Diagnóstico — situação
      r1_origem_clientes        TEXT,
      r2_previsibilidade        TEXT,
      r3_tempo_resposta         TEXT,

      -- Diagnóstico — problema
      r4_maior_desafio          TEXT,
      r5_experiencia_anterior   TEXT,
      r6_visibilidade_canais    TEXT,

      -- Diagnóstico — implicação
      r7_impacto_caixa          TEXT,
      r8_impacto_futuro         TEXT,
      r9_o_que_mudaria          TEXT,
      r10_ticket_medio          TEXT,

      -- Resumo diagnóstico
      nota_dor_principal        TEXT,
      nota_30_clientes          TEXT,
      nota_observacoes          TEXT,

      -- Apresentação
      transicao_dor             TEXT,
      calculo_roi               TEXT,

      -- Objeções levantadas
      obj_vou_pensar            TEXT,
      obj_esta_caro             TEXT,
      obj_nao_funcionou         TEXT,
      obj_sem_budget            TEXT,
      obj_falar_socio           TEXT,

      -- Fechamento
      fech_plano                TEXT,
      fech_objecao_final        TEXT,
      fech_proximo_passo        TEXT,
      fech_resultado            TEXT,

      -- Análise IA (preenchida depois)
      ia_perfil_lead            TEXT,
      ia_temperatura            TEXT,   -- quente / morno / frio
      ia_objecao_principal      TEXT,
      ia_proximo_passo          TEXT,
      ia_analise_completa       TEXT,
      ia_gerada_em              TIMESTAMPTZ
    );
  `;
}
