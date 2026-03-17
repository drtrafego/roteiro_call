"use client";
import { useEffect, useRef, useState } from "react";

// ─── TIPOS ────────────────────────────────────────────────────────────────────
type DbStatus = "idle" | "saving" | "saved" | "error";
type Perfil = "estabelecido" | "iniciante" | null;

const FIELDS = [
  "nome-cliente", "negocio-cliente",
  "r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9", "r10",
  "nota-dor", "nota-30", "nota-obs", "transicao-dor", "ticket-medio", "calculo-roi",
  "obj1-nota", "obj2-nota", "obj3-nota", "obj4-nota", "obj5-nota",
  "fech-plano", "fech-objecao", "fech-proximo", "fech-resultado",
];

// ─── COMPONENTES COMPARTILHADOS ───────────────────────────────────────────────
const Card = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ background: "#fff", border: "1px solid #E0DED8", borderRadius: 10, padding: "18px 20px", marginBottom: 12 }}>
    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#9A9A92", marginBottom: 8 }}>{label}</div>
    {children}
  </div>
);

const Tip = ({ txt, tipo = "v" }: { txt: string; tipo?: "v" | "a" | "r" }) => {
  const cfg = { v: ["#E1F5EE", "#5DCAA5", "#085041"], a: ["#FEF3DC", "#D4900A", "#6B4200"], r: ["#FEE8E8", "#B83232", "#5A1A1A"] }[tipo];
  return <div style={{ background: cfg[0], borderLeft: `3px solid ${cfg[1]}`, borderRadius: "0 8px 8px 0", padding: "10px 14px", marginBottom: 10, fontSize: 13, lineHeight: 1.6, color: cfg[2] }}>{txt}</div>;
};

const Script = ({ label, txt }: { label?: string; txt: string }) => (
  <div style={{ background: "#F7F6F3", borderLeft: "3px solid #C8C6C0", borderRadius: "0 8px 8px 0", padding: "12px 16px", marginBottom: 10 }}>
    {label && <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#9A9A92", marginBottom: 6 }}>{label}</div>}
    <div style={{ fontSize: 13.5, lineHeight: 1.65, fontStyle: "italic" }}>"{txt}"</div>
  </div>
);

const Lbl = ({ txt }: { txt: string }) => (
  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#9A9A92", margin: "14px 0 6px" }}>{txt}</div>
);

const SH = ({ num, title, timer }: { num: string; title: string; timer: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: "#1A1A18", borderRadius: 10, marginBottom: 20 }}>
    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0F6E56", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono',monospace", fontSize: 11, fontWeight: 500, flexShrink: 0 }}>{num}</div>
    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", flex: 1 }}>{title}</div>
    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#5DCAA5", background: "rgba(93,202,165,0.15)", padding: "3px 10px", borderRadius: 20 }}>{timer}</div>
  </div>
);

const Divider = ({ txt }: { txt: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "40px 0 32px" }}>
    <div style={{ flex: 1, height: 1, background: "#E0DED8" }} />
    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9A9A92", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{txt}</div>
    <div style={{ flex: 1, height: 1, background: "#E0DED8" }} />
  </div>
);

const InputField = ({ id, placeholder, onChange }: { id: string; placeholder: string; onChange: () => void }) => (
  <input id={id} type="text" placeholder={placeholder} onChange={onChange}
    style={{ width: "100%", background: "#FAFAF8", border: "1px solid #E0DED8", borderRadius: 8, padding: "10px 14px", fontFamily: "inherit", fontSize: 13, color: "#1A1A18", outline: "none" }} />
);

const TextArea = ({ id, placeholder, rows = 2, onChange }: { id: string; placeholder: string; rows?: number; onChange: () => void }) => (
  <textarea id={id} placeholder={placeholder} rows={rows} onChange={onChange}
    style={{ width: "100%", background: "#FAFAF8", border: "1px solid #E0DED8", borderRadius: 8, padding: "10px 14px", fontFamily: "inherit", fontSize: 13, color: "#1A1A18", outline: "none", resize: "vertical" as const }} />
);

const Q = ({ num, txt, hint, id, onChange }: { num: number; txt: string; hint: string; id: string; onChange: () => void }) => (
  <div style={{ paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #E0DED8" }}>
    <div style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 12, alignItems: "start", marginBottom: 6 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#F7F6F3", border: "1px solid #E0DED8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#5A5A54", flexShrink: 0 }}>{num}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{txt}</div>
        <div style={{ fontSize: 11, color: "#9A9A92", fontStyle: "italic" }}>↳ {hint}</div>
      </div>
    </div>
    <div style={{ marginLeft: 40 }}><InputField id={id} placeholder="Resposta do cliente..." onChange={onChange} /></div>
  </div>
);

// ─── TELA DE SELEÇÃO ──────────────────────────────────────────────────────────
function TelaSeleção({ onSelect }: { onSelect: (p: Perfil) => void }) {
  const [hover, setHover] = useState<Perfil>(null);

  const cards = [
    {
      id: "estabelecido" as Perfil,
      emoji: "🏢",
      titulo: "Negócio estabelecido",
      subtitulo: "Já tem clientes e quer crescer",
      descricao: "Para médicos, advogados e prestadores que já operam e querem aumentar a previsibilidade e escala de clientes.",
      tags: ["Já tem clientes", "Quer escalar", "Tem histórico"],
      cor: "#0F6E56",
    },
    {
      id: "iniciante" as Perfil,
      emoji: "🚀",
      titulo: "Negócio em início",
      subtitulo: "Abrindo ou acabou de abrir",
      descricao: "Para quem está montando o escritório, clínica ou serviço e ainda está construindo sua base de clientes.",
      tags: ["Recém aberto", "Poucos clientes", "Construindo marca"],
      cor: "#7C3AED",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0B", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Logo */}
      <div style={{ marginBottom: 48, textAlign: "center" as const }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: "#F7F6F2", marginBottom: 8 }}>
          DR<span style={{ color: "#12C48B" }}>.</span>Tráfego
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase" as const }}>Roteiro de Call</div>
      </div>

      {/* Título */}
      <div style={{ textAlign: "center" as const, marginBottom: 48, maxWidth: 480 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, letterSpacing: "-0.025em", color: "#F7F6F2", lineHeight: 1.15, marginBottom: 12 }}>
          Qual é o perfil<br />do seu lead?
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, fontWeight: 300 }}>
          Selecione o perfil correto para carregar as perguntas certas. Roteiro errado = diagnóstico vazio.
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, width: "100%", maxWidth: 720 }}>
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => onSelect(card.id)}
            onMouseEnter={() => setHover(card.id)}
            onMouseLeave={() => setHover(null)}
            style={{
              background: hover === card.id ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
              border: `1.5px solid ${hover === card.id ? card.cor : "rgba(255,255,255,0.1)"}`,
              borderRadius: 20, padding: 32, cursor: "pointer",
              textAlign: "left" as const, transition: "all 0.2s",
              transform: hover === card.id ? "translateY(-4px)" : "none",
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            {/* Top */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 40 }}>{card.emoji}</div>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: hover === card.id ? card.cor : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", transition: "all 0.2s" }}>→</div>
            </div>

            {/* Título */}
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: "#F7F6F2", marginBottom: 4, letterSpacing: "-0.01em" }}>{card.titulo}</div>
            <div style={{ fontSize: 13, color: card.cor, fontWeight: 500, marginBottom: 12 }}>{card.subtitulo}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 20 }}>{card.descricao}</div>

            {/* Tags */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
              {card.tags.map(tag => (
                <span key={tag} style={{ padding: "3px 10px", background: "rgba(255,255,255,0.06)", borderRadius: 20, fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono',monospace", letterSpacing: "0.04em" }}>{tag}</span>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 32, fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono',monospace" }}>
        Você pode voltar e trocar o perfil a qualquer momento
      </div>
    </div>
  );
}

// ─── ROTEIRO ESTABELECIDO ─────────────────────────────────────────────────────
function RoteiroEstabelecido({ onVoltar, dbStatus, savedId, salvarNeon, exportarTxt }: RoteiroProps) {
  const [openObj, setOpenObj] = useState<string | null>(null);
  const Obj = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div style={{ border: "1px solid #E0DED8", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
      <div onClick={() => setOpenObj(openObj === id ? null : id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", cursor: "pointer", background: "#fff" }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{title}</span>
        <span style={{ fontSize: 12, color: "#9A9A92", transform: openObj === id ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform .2s" }}>▼</span>
      </div>
      {openObj === id && <div style={{ padding: "16px 18px", background: "#F7F6F3", borderTop: "1px solid #E0DED8" }}>{children}</div>}
    </div>
  );

  const autoSave = useAutoSave();
  return (
    <RoteiroLayout perfil="estabelecido" onVoltar={onVoltar} dbStatus={dbStatus} savedId={savedId} salvarNeon={salvarNeon} exportarTxt={exportarTxt}
      nav={[{ num: "1", label: "Abertura", href: "abertura" }, { num: "2", label: "Diagnóstico", href: "diagnostico" }, { num: "3", label: "Apresentação", href: "apresentacao" }, { num: "3B", label: "Ancoragem", href: "ancoragem" }, { num: "4", label: "Objeções", href: "objecoes" }, { num: "5", label: "Fechamento", href: "fechamento" }, { num: "6", label: "Follow-up", href: "followup" }]}>

      {/* FASE 1 */}
      <div id="abertura" style={{ marginBottom: 48 }}>
        <SH num="1" title="Abertura" timer="0 a 5 min" />
        <Tip txt="Objetivo: criar sintonia e assumir o controle. Quem faz pergunta, lidera a conversa." />
        <Card label="Fala de abertura">
          <Script txt="[Nome], que bom falar com você. Antes de mostrar qualquer coisa, quero entender o seu negócio primeiro. Posso te fazer algumas perguntas?" />
        </Card>
        <Card label="Se ele perguntar o preço logo de cara">
          <Script txt="Com certeza te falo, mas o valor depende do que faz sentido pra você: cada negócio é diferente. Me deixa entender o seu caso primeiro. Combinado?" />
        </Card>
        <Tip txt="PNL: Espelhamento: ajuste seu ritmo ao ritmo do lead nos primeiros 2 minutos." tipo="a" />
        <Tip txt="Use o nome da pessoa ao menos 2x nos primeiros 3 minutos: ativa atenção seletiva." />
      </div>

      <Divider txt="fase 2" />

      {/* FASE 2 */}
      <div id="diagnostico" style={{ marginBottom: 48 }}>
        <SH num="2" title="Diagnóstico: Cavar a Dor" timer="5 a 20 min" />
        <Tip txt="Objetivo: fazer o lead verbalizar os próprios problemas. Voc\u00ea n\u00e3o convence: ele se convence." />
        <Tip txt="NUNCA interrompa. Quanto mais ele fala, mais munição você tem." tipo="r" />
        <Card label="Perguntas de situação">
          <Q num={1} txt="Hoje, de onde vêm a maioria dos seus clientes?" hint="Canal principal atual" id="r1" onChange={autoSave} />
          <Q num={2} txt="Você tem previsibilidade de quantos clientes novos chegam por mês?" hint="Sim/Não: se sim, o número" id="r2" onChange={autoSave} />
          <Q num={3} txt="Quando um lead entra em contato, quem responde e em quanto tempo?" hint="Tempo de resposta + responsável" id="r3" onChange={autoSave} />
        </Card>
        <Card label="Perguntas de problema">
          <Q num={4} txt="Qual é o maior desafio hoje pra crescer o número de clientes?" hint="Anote a resposta literal: use as palavras dele depois" id="r4" onChange={autoSave} />
          <Q num={5} txt="Você já tentou divulgação paga antes? O que aconteceu?" hint="Experiência anterior (frustração = sua oportunidade)" id="r5" onChange={autoSave} />
          <Q num={6} txt="Você sabe qual canal traz o cliente que mais paga, ou trata todos igual?" hint="Sabe / não sabe" id="r6" onChange={autoSave} />
        </Card>
        <Card label="Perguntas de implicação: as mais importantes">
          <Q num={7} txt="Essa falta de previsibilidade... como afeta o seu caixa hoje?" hint="Conecta o problema a dinheiro real" id="r7" onChange={autoSave} />
          <Q num={8} txt="Se nos próximos 3 meses continuar assim, qual é o impacto no seu negócio?" hint="Ele imagina o futuro negativo: urgência natural" id="r8" onChange={autoSave} />
          <Q num={9} txt="Se você tivesse 30% mais clientes por mês, o que mudaria pra você?" hint="Âncora o futuro positivo" id="r9" onChange={autoSave} />
          <Q num={10} txt="Um cliente novo vale quanto pra você? Qual é o ticket médio?" hint="Use para ancoragem de ROI depois" id="r10" onChange={autoSave} />
        </Card>
        <Card label="Resumo das anotações">
          <Lbl txt="Dor principal (palavras dele):" />
          <TextArea id="nota-dor" placeholder="Anote com as palavras exatas que ele usou..." rows={3} onChange={autoSave} />
          <Lbl txt="O que mudaria com 30% mais clientes:" />
          <TextArea id="nota-30" placeholder="Anote aqui..." onChange={autoSave} />
          <Lbl txt="Outras observações:" />
          <TextArea id="nota-obs" placeholder="Comportamento, tom, urgência percebida..." onChange={autoSave} />
        </Card>
      </div>

      <Divider txt="fase 3" />

      {/* FASE 3 */}
      <div id="apresentacao" style={{ marginBottom: 48 }}>
        <SH num="3" title="Apresentação" timer="20 a 35 min" />
        <Tip txt="Objetivo: conectar cada parte do serviço à dor que ELE verbalizou. Use as palavras que ele usou." />
        <Tip txt="Nunca apresente features. Apresente consequências." tipo="r" />
        <Card label="Fala de transição">
          <Script txt="[Nome], deixa eu te mostrar como a gente resolve exatamente o que você descreveu. Você mencionou [DOR DELE]. É exatamente isso que o nosso sistema foi desenhado pra resolver." />
          <Lbl txt="Dor que você vai usar:" />
          <InputField id="transicao-dor" placeholder="Ex: que não sabe de onde vêm os clientes que mais pagam..." onChange={autoSave} />
        </Card>
        <Card label="Prova social">
          <Script label="Se tiver resultado recente" txt="A gente fez isso com [segmento similar]. Nos primeiros 60 dias, [resultado concreto]. Posso te mostrar o dashboard aqui na tela." />
          <Script label="Se não tiver resultado recente" txt="Temos mais de 5 anos rodando campanhas, com mais de 25 negócios gerenciados. Estamos selecionando 3 parceiros pra garantir atenção total e o resultado é garantia nossa." />
          <Tip txt="Mostre métricas reais na tela. Número na tela vale mais que qualquer fala." tipo="a" />
        </Card>
      </div>

      <Divider txt="fase 3B · ancoragem" />

      {/* ANCORAGEM */}
      <div id="ancoragem" style={{ marginBottom: 48 }}>
        <SH num="3B" title="Ancoragem de Preço" timer="Apresentação" />
        <Tip txt="Apresente SEMPRE nesta ordem: Completo → Essencial → Estratégico. Nunca comece pelo mais barato." />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, margin: "16px 0" }}>
          {[
            { nome: "Essencial", valor: "R$1.000", itens: ["✓ Tráfego pago", "✓ CRM de leads", "• Dashboard", "• Reunião mensal"], destaque: false },
            { nome: "Estratégico ★", valor: "R$1.500", itens: ["✓ Tráfego pago", "✓ CRM de leads", "✓ Dashboard", "✓ Reunião mensal"], destaque: true },
            { nome: "Completo", valor: "R$2.800", itens: ["✓ Tráfego pago", "✓ CRM de leads", "✓ Dashboard", "✓ Reunião mensal", "✓ 2 canais + relatório"], destaque: false },
          ].map(p => (
            <div key={p.nome} style={{ background: p.destaque ? "#E1F5EE" : "#fff", border: `${p.destaque ? "2px solid #0F6E56" : "1px solid #E0DED8"}`, borderRadius: 10, padding: 16, textAlign: "center" as const, position: "relative" }}>
              {p.destaque && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#0F6E56", color: "#fff", fontSize: 9, fontWeight: 600, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" as const }}>RECOMENDADO</div>}
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: p.destaque ? "#085041" : "#9A9A92", marginBottom: 6 }}>{p.nome}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: p.destaque ? "#0F6E56" : "#1A1A18" }}>{p.valor}</div>
              <div style={{ fontSize: 11, color: "#9A9A92", marginBottom: 10 }}>/mês</div>
              {p.itens.map(i => <div key={i} style={{ fontSize: 11, color: i.startsWith("✓") ? "#1A1A18" : "#9A9A92", textAlign: "left" as const, marginBottom: 3 }}>{i}</div>)}
            </div>
          ))}
        </div>
        <Card label="Scripts da ancoragem">
          <Script label="Passo 1: ancore alto (Completo)" txt="[Nome], o nosso formato mais completo é o Plano Completo: R$2.800 por mês." />
          <Script label="Passo 2: Essencial como limitado" txt="O Plano Essencial fica em R$1.000, mas sem dashboard e sem reunião mensal. Você não tem visibilidade do que acontece com os leads depois que entram." />
          <Script label="Passo 3: Estratégico como a escolha óbvia" txt="O que a maioria escolhe é o Estratégico: R$1.500 por mês. Tráfego, CRM, dashboard em tempo real e reunião mensal. É o que eu recomendo pra quem quer crescer de forma organizada." />
        </Card>
        <Card label="Ancoragem de ROI">
          <Script txt="Então se a gente trouxer apenas 3 clientes novos por mês, o seu investimento já se paga mais que duas vezes. O resto é lucro puro." />
          <Lbl txt="Cálculo na hora (3 × ticket médio):" />
          <InputField id="calculo-roi" placeholder="Ex: 3 × R$800 = R$2.400 → se paga e sobra..." onChange={autoSave} />
        </Card>
      </div>

      <Divider txt="fase 4" />

      {/* OBJEÇÕES */}
      <div id="objecoes" style={{ marginBottom: 48 }}>
        <SH num="4" title="Objeções: Scripts de Resposta" timer="Call" />
        <Tip txt="Objeção não é rejeição é pedido de mais informação. Primeiro valide, depois redirecione." />
        {[
          {
            id: "obj1", title: '"Vou pensar e te dou um retorno"', content: <>
              <Script txt="Claro, faz sentido. Mas antes de você ir pensar: o que especificamente você ainda precisa ver pra ter confiança pra decidir?" />
              <Script label="Se ele for vago:" txt="É uma questão de valor, de timing, ou tem alguma dúvida que eu não esclareci?" />
              <Tip txt="Force a objeção real aparecer. O 'vou pensar' esconde sempre: preço, confiança ou timing." tipo="a" />
              <Lbl txt="O que ele respondeu:" /><InputField id="obj1-nota" placeholder="Anote a objeção real..." onChange={autoSave} />
            </>
          },
          {
            id: "obj2", title: '"Está caro, tem agência mais barata"', content: <>
              <Script label="Nunca compare preço: compare consequência" txt="Concordo que tem mais baratas. A pergunta é: o que acontece quando você paga menos e o resultado não vem? Você fica sem clientes e sem o dinheiro investido." />
              <Script label="Se ele insistir:" txt="Me diz: se a gente trouxesse [X] clientes novos por mês, qual seria o retorno em faturamento pra você?" />
              <Tip txt="Quando ele calcula o retorno em voz alta, o preço vira investimento. Deixa ele fazer a conta." />
              <Lbl txt="O que ele respondeu:" /><InputField id="obj2-nota" placeholder="Anote..." onChange={autoSave} />
            </>
          },
          {
            id: "obj3", title: '"Já tentei tráfego pago e não funcionou"', content: <>
              <Script label="Primeiro valide:" txt="Entendo completamente. A maioria dos clientes que chega até nós passou por isso. O que aconteceu naquela vez?" />
              <Script label="Depois redirecione:" txt="O que você descreveu é o que acontece quando o tráfego funciona sozinho, sem CRM e sem acompanhamento. É exatamente aí que o nosso sistema é diferente." />
              <Tip txt="Experiência ruim anterior é sua maior oportunidade. Ele já sabe o que não quer." />
              <Lbl txt="O histórico dele:" /><InputField id="obj3-nota" placeholder="Anote..." onChange={autoSave} />
            </>
          },
          {
            id: "obj4", title: '"Não tenho budget agora"', content: <>
              <Script txt="O problema de budget não está ligado ao que você me descreveu: a falta de previsibilidade? Se a entrada de clientes fosse maior, o budget apareceria naturalmente, certo?" />
              <Script label="Oferta com garantia:" txt="Começamos com o Plano Essencial. Se no primeiro mês você não ver resultado no dashboard, você não paga o segundo. Risco zero." />
              <Tip txt="Só ofereça garantia com confiança de entregar. Use como demonstração de segurança, não desespero." tipo="r" />
              <Lbl txt="O que ele respondeu:" /><InputField id="obj4-nota" placeholder="Anote..." onChange={autoSave} />
            </>
          },
          {
            id: "obj5", title: '"Preciso falar com minha esposa / sócio"', content: <>
              <Script txt="Claro, faz todo sentido. Sugiro a gente agendar 20 minutos com vocês dois juntos: assim esclareço qualquer dúvida na hora e vocês decidem juntos. Quando você tem agenda essa semana?" />
              <Tip txt="Nunca deixe o material ir sem você. Peça a call com todos juntos." tipo="a" />
              <Lbl txt="Data/horário combinado:" /><InputField id="obj5-nota" placeholder="Anote quando ficou agendado..." onChange={autoSave} />
            </>
          },
        ].map(obj => (
          <Obj key={obj.id} id={obj.id} title={obj.title}>{obj.content}</Obj>
        ))}
      </div>

      <Divider txt="fase 5" />

      {/* FECHAMENTO */}
      <div id="fechamento" style={{ marginBottom: 48 }}>
        <SH num="5" title="Fechamento" timer="35 a 45 min" />
        <Tip txt="Objetivo: obter uma decisão dentro da call. Nunca termine sem um 'sim' ou descobrir a objeção real." />
        <Tip txt="A maioria das vendas perdidas acontece porque o vendedor nunca pediu o fechamento." tipo="r" />
        <Card label="Fala de fechamento: use exatamente assim">
          <Script txt="[Nome], com base em tudo que você me contou: especialmente [DOR DELE]: o plano que faz sentido pra você é o Estratégico. Posso te enviar o contrato ainda hoje e a gente começa na semana que vem. Você prefere pagar via PIX ou cartão?" />
        </Card>
        <div style={{ background: "#0F6E56", borderRadius: 10, padding: "18px 24px", textAlign: "center" as const, margin: "16px 0" }}>
          <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>DEPOIS DE PEDIR O FECHAMENTO: FIQUE EM SILÊNCIO.</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 4 }}>Quem falar primeiro perde. Aguente o desconforto.</div>
        </div>
        <Card label="Se ele hesitar">
          <Script txt="O que faria você decidir agora?" />
          <Tip txt="Fique em silêncio após essa pergunta. A resposta vai dar a objeção real." />
        </Card>
        <Card label="Anotações do fechamento">
          <Lbl txt="Plano apresentado:" /><InputField id="fech-plano" placeholder="Ex: Estratégico · R$1.500..." onChange={autoSave} />
          <Lbl txt="Objeção final:" /><InputField id="fech-objecao" placeholder="Anote o que ele disse..." onChange={autoSave} />
          <Lbl txt="Próximo passo:" /><InputField id="fech-proximo" placeholder="Ex: Enviando contrato hoje..." onChange={autoSave} />
          <Lbl txt="Resultado da call:" /><TextArea id="fech-resultado" placeholder="Fechou / ficou de pensar / nova call agendada para..." onChange={autoSave} />
        </Card>
      </div>

      <Divider txt="fase 6" />

      {/* FOLLOW-UP */}
      <div id="followup" style={{ marginBottom: 48 }}>
        <SH num="6" title="Follow-up Pós-Call" timer="Dias seguintes" />
        <Tip txt="80% das vendas acontecem entre o 5° e 12° contato. A maioria dos vendedores desiste no 2°." />
        <Card label="Sequência de follow up">
          {[
            { dia: "DIA\n0", title: "Imediatamente após a call", txt: "Manda portfólio + áudio de 60s no WhatsApp explicando o próximo passo." },
            { dia: "DIA\n2", title: "Abertura de conversa", txt: '"[Nome], vi que você ainda não teve tempo de analisar. Posso te fazer uma pergunta rápida?"' },
            { dia: "DIA\n5", title: "Prova social", txt: "Manda um print de métrica real sem contexto. Ele vai perguntar o que é: você reengaja." },
            { dia: "DIA\n10", title: "Pergunta direta", txt: '"[Nome], o que está impedindo você de dar esse passo? Me fala com franqueza: quero entender se tem algo que eu não esclareci direito."' },
            { dia: "DIA\n20", title: "Nova abordagem", txt: '"[Nome], mudei uma coisa na nossa oferta que acho que faz mais sentido pra você."' },
            { dia: "DIA\n30", title: "Último contato", txt: '"[Nome], vou dar baixa no seu contato. Mudou alguma coisa no seu planejamento?"' },
          ].map(fu => (
            <div key={fu.dia} style={{ display: "grid", gridTemplateColumns: "52px 1fr", gap: 14, padding: "14px 0", borderBottom: "1px solid #E0DED8", alignItems: "start" }}>
              <div style={{ background: "#E1F5EE", borderRadius: 8, padding: "8px 4px", textAlign: "center" as const, fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 500, color: "#085041", lineHeight: 1.4, whiteSpace: "pre-line" as const }}>{fu.dia}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{fu.title}</div>
                <div style={{ fontSize: 12, color: "#5A5A54", fontStyle: "italic", lineHeight: 1.5 }}>{fu.txt}</div>
              </div>
            </div>
          ))}
        </Card>
    </div>
    </RoteiroLayout >
  );
}

// ROTEIRO INICIANTE ────────────────────────────────────────────────────────
function RoteiroIniciante({ onVoltar, dbStatus, savedId, salvarNeon, exportarTxt }: RoteiroProps) {
  const [openObj, setOpenObj] = useState<string | null>(null);
  const Obj = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div style={{ border: "1px solid #E0DED8", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
      <div onClick={() => setOpenObj(openObj === id ? null : id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", cursor: "pointer", background: "#fff" }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{title}</span>
        <span style={{ fontSize: 12, color: "#9A9A92", transform: openObj === id ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform .2s" }}>▼</span>
      </div>
      {openObj === id && <div style={{ padding: "16px 18px", background: "#F7F6F3", borderTop: "1px solid #E0DED8" }}>{children}</div>}
    </div>
  );

  const autoSave = useAutoSave();
  return (
    <RoteiroLayout perfil="iniciante" onVoltar={onVoltar} dbStatus={dbStatus} savedId={savedId} salvarNeon={salvarNeon} exportarTxt={exportarTxt}
      nav={[{ num: "1", label: "Abertura", href: "abertura" }, { num: "2", label: "Diagnóstico", href: "diagnostico" }, { num: "3", label: "Apresentação", href: "apresentacao" }, { num: "3B", label: "Ancoragem", href: "ancoragem" }, { num: "4", label: "Objeções", href: "objecoes" }, { num: "5", label: "Fechamento", href: "fechamento" }, { num: "6", label: "Follow-up", href: "followup" }]}>

      <div style={{ background: "#F0EBFF", border: "1px solid #C4B5FD", borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#4C1D95" }}>
        🚀 <strong>Modo Iniciante ativo</strong> Perguntas adaptadas para quem está construindo o negócio. O foco é sonho, validação e primeiros clientes.
      </div>

      {/* FASE 1 */}
      <div id="abertura" style={{ marginBottom: 48 }}>
        <SH num="1" title="Abertura" timer="0 a 5 min" />
        <Tip txt="Com iniciantes, o tom precisa ser mais de mentoria do que de diagnóstico. Eles precisam sentir que você é um parceiro, não um fornecedor." />
        <Card label="Fala de abertura: tom de parceria">
          <Script txt="[Nome], que bom falar com você. Quero antes de tudo entender onde você está hoje no seu negócio: cada fase tem uma estratégia diferente e quero ter certeza que vou indicar o caminho certo pra você. Posso te fazer algumas perguntas?" />
        </Card>
        <Card label="Se ele perguntar o preço logo de cara">
          <Script txt="Vou te falar tudo sobre isso, mas primeiro preciso entender a fase que você está: porque o investimento certo depende de onde você quer chegar. Me conta um pouco mais sobre o seu negócio?" />
        </Card>
        <Tip txt="Iniciantes são mais inseguros com o processo de vendas. Seja mais acolhedor, menos interrogatório. Crie um ambiente onde ele se sinta à vontade para admitir que ainda está começando." tipo="a" />
      </div>

      <Divider txt="fase 2" />

      {/* FASE 2 DIAGNÓSTICO INICIANTE */}
      <div id="diagnostico" style={{ marginBottom: 48 }}>
        <SH num="2" title="Diagnóstico: Entender o Momento" timer="5 a 20 min" />
        <Tip txt="Para iniciantes, a dor não é 'perder escala' é 'ainda não saí do zero'. As perguntas precisam mapear onde ele está na jornada, não o que ele já construiu." />
        <Tip txt="Nunca deixe o iniciante se sentir pequeno. Valide a coragem de estar começando antes de qualquer pergunta." tipo="a" />

        <Card label="Perguntas de situação: onde ele está na jornada">
          <Q num={1} txt="Me conta como surgiu a ideia de abrir esse negócio: o que te motivou?" hint="Entenda o sonho e a motivação. Isso vai alimentar toda a ancoragem depois." id="r1" onChange={autoSave} />
          <Q num={2} txt="Você já tem seus primeiros clientes pagantes ou ainda está na fase de estruturação?" hint="Determina se já há validação ou se é pré-receita" id="r2" onChange={autoSave} />
          <Q num={3} txt="Hoje como você está tentando atrair esses primeiros clientes?" hint="Mapeie: indicação, redes sociais, abordagem direta, nenhuma ação..." id="r3" onChange={autoSave} />
        </Card>

        <Card label="Perguntas de problema: o que trava o crescimento">
          <Q num={4} txt="Qual é a maior dificuldade que você enfrenta pra conseguir novos clientes agora?" hint="Deixa ele verbalizar. Não sugira respostas." id="r4" onChange={autoSave} />
          <Q num={5} txt="Quando você fala do seu serviço pra alguém, qual é a reação mais comum? As pessoas entendem o valor?" hint="Mapeia problema de comunicação e posicionamento" id="r5" onChange={autoSave} />
          <Q num={6} txt="Você tem uma ideia de quem é o cliente ideal pra você: o perfil de pessoa que mais se beneficia do que você faz?" hint="Avalia maturidade de ICP: muito comum iniciantes não ter isso claro" id="r6" onChange={autoSave} />
        </Card>

        <Card label="Perguntas de implicação: conectar a urgência">
          <Q num={7} txt="Você tem uma meta de quantos clientes quer ter nos próximos 3 meses?" hint="Cria urgência com base no sonho, não na dor atual" id="r7" onChange={autoSave} />
          <Q num={8} txt="Se em 3 meses você continuar dependendo só de indicação, você acredita que vai chegar nessa meta?" hint="Ele mesmo percebe que o caminho atual não funciona" id="r8" onChange={autoSave} />
          <Q num={9} txt="Quanto um cliente novo representa pra você em faturamento? Qual é o valor médio do seu serviço?" hint="Base para ancoragem de ROI: essencial para o iniciante enxergar o investimento como alavanca" id="r9" onChange={autoSave} />
          <Q num={10} txt="Hoje você consegue se dedicar full-time a isso ou ainda concilia com outra atividade?" hint="Contexto importante: define urgência e disponibilidade de budget" id="r10" onChange={autoSave} />
        </Card>

        <Card label="Resumo das anotações">
          <Lbl txt="Motivação e sonho que ele verbalizou:" />
          <TextArea id="nota-dor" placeholder="Anote a motivação principal vai ser a âncora emocional do fechamento..." rows={3} onChange={autoSave} />
          <Lbl txt="Meta de clientes em 3 meses:" />
          <TextArea id="nota-30" placeholder="Anote aqui..." onChange={autoSave} />
          <Lbl txt="Outras observações (maturidade, insegurança, urgência):" />
          <TextArea id="nota-obs" placeholder="Está full-time? Tem budget disponível? Já tentou algo antes?..." onChange={autoSave} />
        </Card>
      </div>

      <Divider txt="fase 3" />

      {/* FASE 3 APRESENTAÇÃO INICIANTE */}
      <div id="apresentacao" style={{ marginBottom: 48 }}>
        <SH num="3" title="Apresentação" timer="20 a 35 min" />
        <Tip txt="Para iniciantes, o foco é mostrar que você vai CONSTRUIR junto com eles a base de clientes: não otimizar algo que já existe." />
        <Tip txt="Conecte tudo ao sonho e à meta que ele declarou: não à dor de escala." tipo="a" />

        <Card label="Fala de transição: conecte ao sonho dele">
          <Script txt="[Nome], com base no que você me contou: você quer [META DELE] nos próximos meses e hoje ainda depende de indicação pra isso. Deixa eu te mostrar como a gente acelera esse processo de forma previsível." />
          <Lbl txt="Meta que você vai usar na transição:" />
          <InputField id="transicao-dor" placeholder="Ex: ter os primeiros 10 clientes do escritório em 60 dias..." onChange={autoSave} />
        </Card>

        <Card label="Como apresentar o sistema para iniciantes">
          <Script label="Tráfego pago" txt="A gente vai colocar o seu serviço na frente das pessoas certas advogados, médicos, serviços já ficam invisíveis porque não aparecem quando o cliente está procurando. A gente muda isso." />
          <Script label="CRM" txt="Todo contato que chegar fica registrado. Você nunca vai perder um lead por falta de acompanhamento que é a maior causa de não crescimento pra quem está começando." />
          <Script label="Dashboard" txt="Você vai ver em tempo real de onde estão vindo as consultas, quanto custou cada contato, e o que está funcionando. Você toma decisão com dado, não no feeling." />
          <Tip txt="Para iniciantes, o dashboard resolve um problema extra: insegurança sobre se o investimento está valendo. Com dado na tela, a ansiedade diminui e a confiança aumenta." tipo="a" />
        </Card>

        <Card label="Prova social adaptada para iniciantes">
          <Script label="Profissional liberal em início similar" txt="A gente trabalhou com um [advogado/médico/prestador] que estava exatamente nessa fase: acabou de abrir o negócio. Em [X dias] ele já tinha [resultado]. Posso te mostrar o dashboard aqui na tela." />
          <Script label="Se não tiver caso de iniciante" txt="Temos mais de 5 anos de experiência. Trabalhamos com negócios em fases diferentes: inclusive quem estava exatamente onde você está. O sistema que entregamos foi feito justamente pra essa fase de construção." />
        </Card>
      </div>

      <Divider txt="fase 3B · ancoragem" />

      {/* ANCORAGEM INICIANTE */}
      <div id="ancoragem" style={{ marginBottom: 48 }}>
        <SH num="3B" title="Ancoragem de Preço" timer="Apresentação" />
        <Tip txt="Para o iniciante o preço precisa ser justificado pelo ROI de forma ainda mais clara. Ele tem menos certeza do budget e mais medo de errar o investimento." />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, margin: "16px 0" }}>
          {[
            { nome: "Essencial", valor: "R$1.000", itens: ["✓ Tráfego pago", "✓ CRM de leads", "• Dashboard", "• Reunião mensal"], destaque: false },
            { nome: "Estratégico ★", valor: "R$1.500", itens: ["✓ Tráfego pago", "✓ CRM de leads", "✓ Dashboard", "✓ Reunião mensal"], destaque: true },
            { nome: "Completo", valor: "R$2.800", itens: ["✓ Tráfego pago", "✓ CRM de leads", "✓ Dashboard", "✓ Reunião mensal", "✓ 2 canais + relatório"], destaque: false },
          ].map(p => (
            <div key={p.nome} style={{ background: p.destaque ? "#E1F5EE" : "#fff", border: `${p.destaque ? "2px solid #0F6E56" : "1px solid #E0DED8"}`, borderRadius: 10, padding: 16, textAlign: "center" as const, position: "relative" }}>
              {p.destaque && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#0F6E56", color: "#fff", fontSize: 9, fontWeight: 600, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" as const }}>IDEAL PARA INICIANTES</div>}
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: p.destaque ? "#085041" : "#9A9A92", marginBottom: 6 }}>{p.nome}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: p.destaque ? "#0F6E56" : "#1A1A18" }}>{p.valor}</div>
              <div style={{ fontSize: 11, color: "#9A9A92", marginBottom: 10 }}>/mês</div>
              {p.itens.map(i => <div key={i} style={{ fontSize: 11, color: i.startsWith("✓") ? "#1A1A18" : "#9A9A92", textAlign: "left" as const, marginBottom: 3 }}>{i}</div>)}
            </div>
          ))}
        </div>

        <Card label="Scripts da ancoragem: adaptados para iniciantes">
          <Script label="Passo 1: ancore alto" txt="[Nome], o nosso formato mais completo é o Plano Completo: ideal pra quem quer máxima velocidade de crescimento: R$2.800 por mês." />
          <Script label="Passo 2: Essencial como limitado" txt="O Plano Essencial fica em R$1.000. Ele funciona, mas sem dashboard você não vai saber o que está funcionando: e pra quem está começando, esse dado é crucial pra não desperdiçar o investimento." />
          <Script label="Passo 3: Estratégico como ideal para a fase dele" txt="Pra quem está na fase que você está, o que mais faz sentido é o Estratégico: R$1.500 por mês. Você tem tudo que precisa pra construir uma base sólida: tráfego, CRM pra não perder nenhum lead, dashboard pra ver o que funciona e reunião mensal pra ajustar a rota junto comigo." />
        </Card>

        <Card label="Ancoragem de ROI especial para iniciante">
          <Script txt="Você me disse que seu serviço vale [VALOR DELE]. Se a gente trouxer só 2 clientes novos no primeiro mês o que é conservador você já recuperou o investimento. A partir do 3° cliente é lucro. Faz sentido?" />
          <Tip txt="Com iniciante, use 2 clientes como base (mais conservador). Ele precisa sentir que é seguro, não que está apostando." />
          <Lbl txt="Cálculo feito na hora (2 × ticket médio):" />
          <InputField id="calculo-roi" placeholder="Ex: 2 × R$1.200 = R$2.400 → se paga com margem..." onChange={autoSave} />
        </Card>
      </div>

      <Divider txt="fase 4" />

      {/* OBJEÇÕES INICIANTE */}
      <div id="objecoes" style={{ marginBottom: 48 }}>
        <SH num="4" title="Objeções: Scripts de Resposta" timer="Call" />
        <Tip txt="Iniciantes têm objeções mais emocionais do que racionais. O medo de errar o investimento é maior do que a análise de preço." />
        {[
          {
            id: "obj1", title: '"Vou pensar, ainda estou começando"', content: <>
              <Tip txt="Esta é a objeção mais comum do iniciante é medo de se comprometer, não falta de interesse." tipo="a" />
              <Script txt="Faz sentido querer pensar com cuidado. Me ajuda a entender: o que especificamente te deixa inseguro pra decidir agora? É o valor, é dúvida sobre o resultado, ou é outra coisa?" />
              <Script label="Se ele disser que tem medo de não dar resultado:" txt="Entendo esse medo e é exatamente por isso que eu trabalho com reunião mensal no Estratégico. Se no segundo mês a gente não estiver no caminho certo, a gente ajusta junto. Você não fica no escuro." />
              <Lbl txt="O que ele respondeu:" /><InputField id="obj1-nota" placeholder="Anote o medo específico..." onChange={autoSave} />
            </>
          },
          {
            id: "obj2", title: '"Não sei se tenho budget pra isso agora"', content: <>
              <Tip txt="Budget é a objeção mais real do iniciante. Não force explore e ofereça a entrada mais acessível." tipo="a" />
              <Script txt="Entendo completamente. Você me disse que seu serviço vale [VALOR]. Se a gente trouxer 2 clientes no primeiro mês que é um resultado bem conservador o investimento já se paga. Você está travado no custo fixo de R$1.500, mas o retorno potencial é de [VALOR x 2]. Faz sentido pensar assim?" />
              <Script label="Se ele realmente não tiver budget:" txt="Nesse caso, o Essencial por R$1.000 pode ser a porta de entrada certa. A gente começa mais enxuto, e quando você sentir o resultado, migramos pro Estratégico. O que acha?" />
              <Lbl txt="O que ele respondeu:" /><InputField id="obj2-nota" placeholder="Anote..." onChange={autoSave} />
            </>
          },
          {
            id: "obj3", title: '"Será que tráfego funciona pra minha área?"', content: <>
              <Tip txt="Dúvida muito comum de profissionais liberais especialmente advogados que têm restrições do CFA/OAB sobre publicidade." tipo="a" />
              <Script label="Para advogados:" txt="É uma dúvida legítima. A OAB tem regras específicas e a gente trabalha dentro dessas regras. Não fazemos publicidade que promete resultado, fazemos conteúdo e captação dentro do que é permitido. Posso te mostrar como outros escritórios estão fazendo?" />
              <Script label="Para outros profissionais:" txt="Pessoas buscam [médico/dentista/serviço] no Google todo dia na sua cidade. Se você não aparece, aparece o concorrente. A questão não é se funciona é quem vai aparecer primeiro. Você ou o escritório da frente?" />
              <Lbl txt="Área e dúvida específica dele:" /><InputField id="obj3-nota" placeholder="Anote a área e a dúvida levantada..." onChange={autoSave} />
            </>
          },
          {
            id: "obj4", title: '"Preciso estruturar mais o negócio antes"', content: <>
              <Tip txt="Armadilha clássica do iniciante acha que precisa estar 'pronto' para começar a captar. Quebre esse mito." tipo="r" />
              <Script txt="Entendo essa sensação. Mas deixa eu te perguntar uma coisa: você já consegue atender um cliente hoje se ele aparecer? Se sim, você já está pronto pra captar. A estrutura de negócio se constrói com clientes, não antes deles." />
              <Script label="Se ele ainda não está operacional:" txt="Nesse caso faz sentido esperar. Me conta o que ainda falta pra você estar operacional e quando chegar lá, a gente conversa de novo. Posso te colocar numa lista de prioridade?" />
              <Lbl txt="O que falta na estrutura dele (se for o caso):" /><InputField id="obj4-nota" placeholder="Anote..." onChange={autoSave} />
            </>
          },
          {
            id: "obj5", title: '"Tenho medo de não ter retorno"', content: <>
              <Script txt="Esse medo faz todo sentido: e é por isso que o nosso sistema tem o dashboard. Você não vai precisar confiar na minha palavra: você vai ver os números em tempo real. Se no primeiro mês não estiver gerando resultado, a gente sabe exatamente o que ajustar." />
              <Script label="Reforce com a garantia:" txt="E pra deixar ainda mais seguro: se no primeiro mês você não ver movimento, você não paga o segundo. Você só continua se sentir que está valendo." />
              <Lbl txt="O que ele respondeu:" /><InputField id="obj5-nota" placeholder="Anote..." onChange={autoSave} />
            </>
          },
        ].map(obj => (
          <Obj key={obj.id} id={obj.id} title={obj.title}>{obj.content}</Obj>
        ))}
      </div>

      <Divider txt="fase 5" />

      {/* FECHAMENTO INICIANTE */}
      <div id="fechamento" style={{ marginBottom: 48 }}>
        <SH num="5" title="Fechamento" timer="35 a 45 min" />
        <Tip txt="Com iniciante, o fechamento precisa ser mais encorajador. Ele precisa sentir que está tomando a decisão certa, não que está sendo empurrado." />
        <Card label="Fala de fechamento: adaptada para iniciante">
          <Script txt="[Nome], você me disse que quer [META DELE] nos próximos meses. Com o caminho que você tem hoje: só indicação: isso vai ser muito mais difícil e demorado. O Estratégico resolve isso: você vai ter leads chegando de forma previsível, vai acompanhar tudo no dashboard e a gente vai ajustar junto todo mês. Posso enviar o contrato ainda hoje pra você começar essa semana?" />
        </Card>
        <div style={{ background: "#0F6E56", borderRadius: 10, padding: "18px 24px", textAlign: "center" as const, margin: "16px 0" }}>
          <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>DEPOIS DE PEDIR O FECHAMENTO: FIQUE EM SILÊNCIO.</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 4 }}>Quem falar primeiro perde. Aguente o desconforto.</div>
        </div>
        <Card label="Se ele hesitar">
          <Script txt="O que faria você se sentir seguro pra decidir agora?" />
          <Tip txt="Para iniciante, substitua 'decidir' por 'se sentir seguro'. A linguagem de segurança funciona melhor que a de decisão." tipo="a" />
        </Card>
        <Card label="Anotações do fechamento">
          <Lbl txt="Plano apresentado:" /><InputField id="fech-plano" placeholder="Ex: Estratégico · R$1.500..." onChange={autoSave} />
          <Lbl txt="Objeção final:" /><InputField id="fech-objecao" placeholder="Anote o que ele disse..." onChange={autoSave} />
          <Lbl txt="Próximo passo:" /><InputField id="fech-proximo" placeholder="Ex: Enviando contrato hoje..." onChange={autoSave} />
          <Lbl txt="Resultado da call:" /><TextArea id="fech-resultado" placeholder="Fechou / ficou de pensar / nova call agendada para..." onChange={autoSave} />
        </Card>
      </div>

      <Divider txt="fase 6" />

      {/* FOLLOW-UP INICIANTE */}
      <div id="followup" style={{ marginBottom: 48 }}>
        <SH num="6" title="Follow-up Pós-Call" timer="Dias seguintes" />
        <Tip txt="O iniciante precisa de um follow-up mais cuidadoso. Ele não some por desinteresse: some por insegurança. Seu papel é ser um ponto de segurança, não pressão." />
        <Card label="Sequência de follow-up para iniciantes">
          {[
            { dia: "DIA\n0", title: "Imediatamente (máx. 30 min)", txt: "Manda um áudio de 60s reforçando que você entende a fase dele e que o sistema foi feito pra exatamente esse momento. Não mande só o PDF frio." },
            { dia: "DIA\n2", title: "Mensagem de suporte", txt: '"[Nome], fica à vontade pra me mandar qualquer dúvida que surgir enquanto você analisa. É uma decisão importante e quero que você se sinta seguro."' },
            { dia: "DIA\n5", title: "Conteúdo relevante", txt: "Manda um caso real (ou um artigo) de profissional da área dele que usou tráfego pago no início. Contexto de par funciona melhor que argumento de vendas." },
            { dia: "DIA\n20", title: "Nova condição", txt: '"[Nome], tenho uma proposta de entrada diferente que pode fazer mais sentido pra sua fase agora. Posso te apresentar em 10 minutos?"' },
            { dia: "DIA\n30", title: "Encerramento gentil", txt: '"[Nome], vou organizar minha agenda aqui. Se ainda fizer sentido conversar, estarei disponível. Torço muito pelo seu crescimento!"' },
          ].map(fu => (
            <div key={fu.dia} style={{ display: "grid", gridTemplateColumns: "52px 1fr", gap: 14, padding: "14px 0", borderBottom: "1px solid #E0DED8", alignItems: "start" }}>
              <div style={{ background: "#F0EBFF", borderRadius: 8, padding: "8px 4px", textAlign: "center" as const, fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 500, color: "#4C1D95", lineHeight: 1.4, whiteSpace: "pre-line" as const }}>{fu.dia}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{fu.title}</div>
                <div style={{ fontSize: 12, color: "#5A5A54", fontStyle: "italic", lineHeight: 1.5 }}>{fu.txt}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </RoteiroLayout>
  );
}

// ─── LAYOUT COMPARTILHADO ─────────────────────────────────────────────────────
type RoteiroProps = {
  onVoltar: () => void;
  dbStatus: DbStatus;
  savedId: number | null;
  salvarNeon: () => void;
  exportarTxt: () => void;
};

function RoteiroLayout({ perfil, onVoltar, dbStatus, savedId, salvarNeon, exportarTxt, nav, children }: RoteiroProps & { perfil: Perfil; nav: { num: string; label: string; href: string }[]; children: React.ReactNode }) {
  const cor = perfil === "iniciante" ? "#7C3AED" : "#0F6E56";
  const statusLabel = { idle: "Salvar no banco", saving: "Salvando...", saved: `✓ Salvo! ID #${savedId}`, error: "Erro: tente novamente" };
  const statusColor = { idle: cor, saving: "#D4900A", saved: "#12C48B", error: "#B83232" };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ display: "flex", minHeight: "100vh", background: "#F7F6F3" }}>
        {/* SIDEBAR */}
        <nav style={{ width: 220, minHeight: "100vh", background: "#1A1A18", position: "fixed", top: 0, left: 0, display: "flex", flexDirection: "column", padding: "28px 0", zIndex: 100 }}>
          <div style={{ padding: "0 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: 16 }}>
            <button onClick={onVoltar} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 11, cursor: "pointer", fontFamily: "'DM Mono',monospace", letterSpacing: "0.06em", padding: 0, marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>← Trocar perfil</button>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: cor, letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 4 }}>{perfil === "iniciante" ? "🚀 Iniciante" : "🏢 Estabelecido"}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>Roteiro de Call</div>
          </div>
          {nav.map(item => (
            <a key={item.href} href={`#${item.href}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 20px", textDecoration: "none", borderLeft: `3px solid transparent`, transition: "all .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)", flexShrink: 0, fontFamily: "'DM Mono',monospace" }}>{item.num}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{item.label}</div>
            </a>
          ))}
          <div style={{ marginTop: "auto", padding: "16px 20px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "rgba(255,255,255,0.05)", borderRadius: 8, marginBottom: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor[dbStatus] }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono',monospace" }}>{dbStatus === "idle" ? "pronto" : dbStatus === "saving" ? "salvando..." : dbStatus === "saved" ? `salvo #${savedId}` : "erro"}</span>
            </div>
            <button onClick={salvarNeon} disabled={dbStatus === "saving"} style={{ width: "100%", padding: 10, background: statusColor[dbStatus], color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 6, opacity: dbStatus === "saving" ? 0.7 : 1 }}>{statusLabel[dbStatus]}</button>
            {savedId && <a href="/analise" style={{ display: "block", width: "100%", padding: "8px 10px", background: "rgba(18,196,139,0.15)", color: "#12C48B", border: "1px solid rgba(18,196,139,0.3)", borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", marginBottom: 6, textAlign: "center" as const, textDecoration: "none" }}>Ver análise IA →</a>}
            <button onClick={exportarTxt} style={{ width: "100%", padding: "8px 10px", background: "transparent", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11, cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}>↓ Exportar .txt</button>
          </div>
        </nav>
        {/* MAIN */}
        <main style={{ marginLeft: 220, flex: 1, padding: "40px 48px 80px", maxWidth: 860 }}>
          <div style={{ marginBottom: 36, paddingBottom: 24, borderBottom: "1px solid #E0DED8" }}>
            <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em" }}>Roteiro de Call</h1>
            <p style={{ fontSize: 13, color: "#5A5A54", marginTop: 6 }}>Script completo · Preencha durante a conversa · 45 minutos</p>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" as const }}>
              {["Essencial · R$1.000", "Estratégico · R$1.500 ★", "Completo · R$2.800"].map(p => (
                <span key={p} style={{ padding: "4px 12px", background: "#E1F5EE", color: "#085041", borderRadius: 20, fontSize: 11, fontWeight: 500, fontFamily: "'DM Mono',monospace" }}>{p}</span>
              ))}
            </div>
          </div>
          {/* CLIENTE BAR */}
          <div style={{ background: "#fff", border: "1px solid #E0DED8", borderRadius: 10, padding: "14px 20px", marginBottom: 32, display: "flex", alignItems: "center", gap: 16 }}>
            <label style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#9A9A92", whiteSpace: "nowrap" }}>Cliente</label>
            <input id="nome-cliente" type="text" placeholder="Nome do cliente..." onChange={() => { const v = (document.getElementById("nome-cliente") as HTMLInputElement)?.value || "[Nome]";["n1", "n2", "n3", "n4", "n5", "n6"].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = v; }); }} style={{ flex: 1, border: "none", background: "transparent", fontSize: 15, fontWeight: 500, outline: "none", fontFamily: "inherit" }} />
            <label style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#9A9A92", whiteSpace: "nowrap" }}>Negócio</label>
            <input id="negocio-cliente" type="text" placeholder="Segmento / empresa..." style={{ flex: 1, border: "none", background: "transparent", fontSize: 15, outline: "none", fontFamily: "inherit" }} />
          </div>
          {children}
        </main>
      </div>
    </>
  );
}

// ─── HOOK AUTOSAVE ────────────────────────────────────────────────────────────
function useAutoSave() {
  return () => {
    const data: Record<string, string> = {};
    FIELDS.forEach(id => {
      const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
      data[id] = el?.value ?? "";
    });
    localStorage.setItem("roteiro_call_drtrafego", JSON.stringify(data));
  };
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function RoteiroCall() {
  const [perfil, setPerfil] = useState<Perfil>(null);
  const [dbStatus, setDbStatus] = useState<DbStatus>("idle");
  const [savedId, setSavedId] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("roteiro_call_drtrafego");
    const savedPerfil = localStorage.getItem("roteiro_call_perfil") as Perfil;
    if (savedPerfil) setPerfil(savedPerfil);
    if (saved) {
      const data = JSON.parse(saved);
      setTimeout(() => {
        FIELDS.forEach(id => {
          const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
          if (el && data[id]) el.value = data[id];
        });
      }, 100);
    }
  }, [perfil]);

  function selecionarPerfil(p: Perfil) {
    setPerfil(p);
    localStorage.setItem("roteiro_call_perfil", p ?? "");
  }

  function getVal(id: string) {
    const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
    return el?.value ?? "";
  }

  async function salvarNeon() {
    setDbStatus("saving");
    const body = {
      nome_cliente: getVal("nome-cliente"), negocio: getVal("negocio-cliente"),
      r1: getVal("r1"), r2: getVal("r2"), r3: getVal("r3"), r4: getVal("r4"), r5: getVal("r5"),
      r6: getVal("r6"), r7: getVal("r7"), r8: getVal("r8"), r9: getVal("r9"), r10: getVal("r10"),
      nota_dor: getVal("nota-dor"), nota_30: getVal("nota-30"), nota_obs: getVal("nota-obs"),
      transicao_dor: getVal("transicao-dor"), calculo_roi: getVal("calculo-roi"),
      obj1_nota: getVal("obj1-nota"), obj2_nota: getVal("obj2-nota"), obj3_nota: getVal("obj3-nota"),
      obj4_nota: getVal("obj4-nota"), obj5_nota: getVal("obj5-nota"),
      fech_plano: getVal("fech-plano"), fech_objecao: getVal("fech-objecao"),
      fech_proximo: getVal("fech-proximo"), fech_resultado: getVal("fech-resultado"),
      perfil_lead: perfil,
    };
    try {
      const res = await fetch("/api/salvar-call", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.ok) { setSavedId(json.id); setDbStatus("saved"); setTimeout(() => setDbStatus("idle"), 4000); }
      else setDbStatus("error");
    } catch { setDbStatus("error"); }
  }

  function exportarTxt() {
    const nome = getVal("nome-cliente") || "cliente";
    const data = new Date().toLocaleDateString("pt-BR");
    let txt = `ROTEIRO DE CALL: DR.TRÁFEGO\nPerfil: ${perfil}\nData: ${data} | Cliente: ${nome}\n${"=".repeat(50)}\n\n`;
    [["DIAGNÓSTICO", [["R1", "r1"], ["R2", "r2"], ["R3", "r3"], ["R4", "r4"], ["R5", "r5"], ["R6", "r6"], ["R7", "r7"], ["R8", "r8"], ["R9", "r9"], ["R10", "r10"], ["Dor", "nota-dor"], ["Meta", "nota-30"], ["Obs", "nota-obs"]]],
    ["APRESENTAÇÃO", [["Transição", "transicao-dor"], ["ROI", "calculo-roi"]]],
    ["OBJEÇÕES", [["Obj1", "obj1-nota"], ["Obj2", "obj2-nota"], ["Obj3", "obj3-nota"], ["Obj4", "obj4-nota"], ["Obj5", "obj5-nota"]]],
    ["FECHAMENTO", [["Plano", "fech-plano"], ["Objeção", "fech-objecao"], ["Próximo", "fech-proximo"], ["Resultado", "fech-resultado"]]]
    ].forEach(([s, items]) => {
      txt += `── ${s} ──\n`;
      (items as [string, string][]).forEach(([l, id]) => { const v = getVal(id); if (v) txt += `${l}: ${v}\n`; });
      txt += "\n";
    });
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `call_${nome.replace(/\s+/g, "_")}_${data.replace(/\//g, "-")}.txt`;
    a.click(); URL.revokeObjectURL(url);
  }

  const props = { onVoltar: () => selecionarPerfil(null), dbStatus, savedId, salvarNeon, exportarTxt };

  if (!perfil) return <TelaSeleção onSelect={selecionarPerfil} />;
  if (perfil === "estabelecido") return <RoteiroEstabelecido {...props} />;
  return <RoteiroIniciante {...props} />;
}
