"use client";
import { useState } from "react";

type Call = {
  id: number;
  criado_em: string;
  nome_cliente: string;
  negocio: string;
  fech_resultado: string;
  ia_temperatura: string | null;
  ia_perfil_lead: string | null;
  ia_proximo_passo: string | null;
  ia_gerada_em: string | null;
  r4_maior_desafio: string;
  nota_dor_principal: string;
  fech_plano: string;
};

type Analise = {
  temperatura: string;
  score: number;
  perfil_lead: string;
  dor_dominante: string;
  objecao_principal: string;
  pontos_fortes: string[];
  riscos: string[];
  proximo_passo: string;
  script_followup: string;
  analise_completa: string;
};

const TEMP_COLOR: Record<string, [string, string, string]> = {
  quente: ["#FEE8E8", "#B83232", "#5A1A1A"],
  morno:  ["#FEF3DC", "#D4900A", "#6B4200"],
  frio:   ["#E8F0FE", "#2563EB", "#1E3A8A"],
};
const TEMP_EMOJI: Record<string, string> = { quente: "🔥", morno: "🌤", frio: "❄️" };

export default function AnaliseClient({ calls }: { calls: Call[] }) {
  const [selected, setSelected] = useState<Call | null>(null);
  const [analise, setAnalise] = useState<Analise | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function analisar(call: Call) {
    setSelected(call);
    setAnalise(null);
    setErro("");
    setLoading(true);
    try {
      const res = await fetch("/api/analisar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: call.id }),
      });
      const json = await res.json();
      if (json.ok) setAnalise(json.analise);
      else setErro(json.erro || "Erro desconhecido");
    } catch (e) {
      setErro(String(e));
    }
    setLoading(false);
  }

  const tempCfg = (t: string) => TEMP_COLOR[t?.toLowerCase()] ?? TEMP_COLOR.frio;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ minHeight: "100vh", background: "#0D0D0B", color: "#F7F6F2", fontFamily: "'DM Sans',sans-serif" }}>

        {/* NAV */}
        <nav style={{ position: "sticky", top: 0, background: "rgba(13,13,11,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <a href="/" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: "#F7F6F2", textDecoration: "none" }}>DR<span style={{ color: "#12C48B" }}>.</span>Tráfego</a>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Análise de Calls</span>
          </div>
          <a href="/" style={{ padding: "8px 16px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 12, textDecoration: "none" }}>← Voltar ao roteiro</a>
        </nav>

        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", minHeight: "calc(100vh - 57px)" }}>

          {/* LISTA DE CALLS */}
          <div style={{ borderRight: "1px solid rgba(255,255,255,0.08)", overflowY: "auto", maxHeight: "calc(100vh - 57px)", position: "sticky", top: 57 }}>
            <div style={{ padding: "24px 24px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#12C48B", marginBottom: 6 }}>Calls registradas</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>{calls.length} calls</div>
            </div>
            {calls.length === 0 && (
              <div style={{ padding: 32, textAlign: "center" as const, color: "rgba(255,255,255,0.3)" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 14 }}>Nenhuma call salva ainda.</div>
                <div style={{ fontSize: 12, marginTop: 6 }}>Use o roteiro e clique "Salvar no banco".</div>
              </div>
            )}
            {calls.map(call => {
              const t = call.ia_temperatura?.toLowerCase();
              const tc = t ? tempCfg(t) : null;
              const isSelected = selected?.id === call.id;
              return (
                <div key={call.id} onClick={() => analisar(call)} style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", background: isSelected ? "rgba(18,196,139,0.08)" : "transparent", borderLeft: isSelected ? "3px solid #12C48B" : "3px solid transparent", transition: "all .15s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#F7F6F2" }}>{call.nome_cliente || "Cliente sem nome"}</div>
                    {tc && (
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: tc[0], color: tc[2], fontFamily: "'DM Mono',monospace", letterSpacing: "0.06em" }}>
                        {TEMP_EMOJI[t!]} {t}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{call.negocio || "Não informado"}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Mono',monospace" }}>
                    {new Date(call.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                  {call.fech_resultado && (
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6, fontStyle: "italic" }}>"{call.fech_resultado.slice(0, 60)}{call.fech_resultado.length > 60 ? "..." : ""}"</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* PAINEL ANÁLISE */}
          <div style={{ padding: 40, overflowY: "auto" }}>
            {!selected && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", textAlign: "center" as const }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Selecione uma call</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", maxWidth: 360, lineHeight: 1.7 }}>Clique em qualquer call na lista para a IA analisar as respostas e gerar insights estratégicos de fechamento.</div>
              </div>
            )}

            {selected && (
              <div>
                {/* HEADER DA ANÁLISE */}
                <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#12C48B", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 8 }}>Análise da call</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>{selected.nome_cliente || "Cliente sem nome"}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{selected.negocio} · {new Date(selected.criado_em).toLocaleDateString("pt-BR")}</div>
                </div>

                {loading && (
                  <div style={{ textAlign: "center" as const, padding: "60px 0" }}>
                    <div style={{ fontSize: 40, marginBottom: 16, animation: "spin 2s linear infinite" }}>⚙️</div>
                    <div style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>Claude está analisando a call...</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Identificando perfil, objeções e próximos passos</div>
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                  </div>
                )}

                {erro && (
                  <div style={{ background: "rgba(184,50,50,0.15)", border: "1px solid rgba(184,50,50,0.3)", borderRadius: 12, padding: 20, color: "#ff9090", fontSize: 14 }}>
                    ⚠️ Erro na análise: {erro}
                  </div>
                )}

                {analise && (
                  <div>
                    {/* MÉTRICAS RÁPIDAS */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                      {/* TEMPERATURA */}
                      {(() => { const tc = tempCfg(analise.temperatura); return (
                        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
                          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 8 }}>Temperatura</div>
                          <div style={{ fontSize: 28 }}>{TEMP_EMOJI[analise.temperatura?.toLowerCase()] || "📊"}</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: tc[0] === "#FEE8E8" ? "#ff9090" : tc[0] === "#FEF3DC" ? "#FBBF24" : "#93C5FD", marginTop: 4, textTransform: "capitalize" as const }}>{analise.temperatura}</div>
                        </div>
                      ); })()}
                      {/* SCORE */}
                      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
                        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 8 }}>Score de fechamento</div>
                        <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: analise.score >= 7 ? "#12C48B" : analise.score >= 4 ? "#FBBF24" : "#ff9090" }}>{analise.score}<span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>/10</span></div>
                      </div>
                      {/* DOR */}
                      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
                        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 8 }}>Dor dominante</div>
                        <div style={{ fontSize: 13, color: "#F7F6F2", lineHeight: 1.5 }}>{analise.dor_dominante}</div>
                      </div>
                    </div>

                    {/* PERFIL DO LEAD */}
                    <div style={{ background: "rgba(18,196,139,0.06)", border: "1px solid rgba(18,196,139,0.2)", borderRadius: 14, padding: 24, marginBottom: 16 }}>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#12C48B", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>Perfil do lead</div>
                      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>{analise.perfil_lead}</p>
                    </div>

                    {/* PONTOS FORTES E RISCOS */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                      <div style={{ background: "rgba(18,196,139,0.05)", border: "1px solid rgba(18,196,139,0.15)", borderRadius: 12, padding: 20 }}>
                        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#12C48B", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 12 }}>✓ Pontos favoráveis</div>
                        {(analise.pontos_fortes || []).map((p, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
                            <span style={{ color: "#12C48B", flexShrink: 0 }}>→</span>{p}
                          </div>
                        ))}
                      </div>
                      <div style={{ background: "rgba(184,50,50,0.05)", border: "1px solid rgba(184,50,50,0.15)", borderRadius: 12, padding: 20 }}>
                        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#ff9090", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 12 }}>⚠ Riscos de perda</div>
                        {(analise.riscos || []).map((r, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
                            <span style={{ color: "#ff9090", flexShrink: 0 }}>→</span>{r}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* OBJEÇÃO PRINCIPAL */}
                    <div style={{ background: "rgba(239,159,39,0.06)", border: "1px solid rgba(239,159,39,0.2)", borderRadius: 14, padding: 24, marginBottom: 16 }}>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#FBBF24", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>Objeção principal + como contornar</div>
                      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>{analise.objecao_principal}</p>
                    </div>

                    {/* PRÓXIMO PASSO */}
                    <div style={{ background: "rgba(18,196,139,0.1)", border: "2px solid rgba(18,196,139,0.3)", borderRadius: 14, padding: 24, marginBottom: 16 }}>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#12C48B", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>🎯 Próximo passo recomendado</div>
                      <p style={{ fontSize: 15, fontWeight: 500, color: "#F7F6F2", lineHeight: 1.6 }}>{analise.proximo_passo}</p>
                    </div>

                    {/* SCRIPT DE FOLLOW-UP */}
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 24, marginBottom: 16 }}>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>📱 Script de follow-up: mande nas próximas 24h</div>
                      <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "16px 20px", fontSize: 14, color: "#F7F6F2", lineHeight: 1.7, fontStyle: "italic" }}>"{analise.script_followup}"</div>
                      <button onClick={() => navigator.clipboard.writeText(analise.script_followup)} style={{ marginTop: 10, padding: "6px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>📋 Copiar mensagem</button>
                    </div>

                    {/* ANÁLISE COMPLETA */}
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 24 }}>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 16 }}>Análise estratégica completa</div>
                      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.8, whiteSpace: "pre-wrap" as const }}>{analise.analise_completa}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
