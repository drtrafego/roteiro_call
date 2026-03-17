import { stackServerApp } from "@/lib/stack";
import { redirect } from "next/navigation";
import { getSql, criarTabela } from "@/lib/db";
import AnaliseClient from "./AnaliseClient";

export default async function AnalisePage() {
  const user = await stackServerApp.getUser();
  if (!user) redirect("/handler/sign-in");

  await criarTabela();
  const sql = getSql();
  const calls = (await sql`
    SELECT id, criado_em, nome_cliente, negocio,
           fech_resultado, ia_temperatura, ia_perfil_lead,
           ia_proximo_passo, ia_gerada_em,
           r4_maior_desafio, nota_dor_principal, fech_plano
    FROM respostas_call
    ORDER BY criado_em DESC
    LIMIT 50
  `) as Record<string, unknown>[];

  return <AnaliseClient calls={JSON.parse(JSON.stringify(calls))} />;
}
