'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Resposta = {
  id: number
  criado_em: string
  nome_cliente: string | null
  negocio: string | null
  r4_maior_desafio: string | null
  r10_ticket_medio: string | null
  nota_dor_principal: string | null
  fech_plano: string | null
  fech_resultado: string | null
  r1_origem_clientes: string | null
  r2_previsibilidade: string | null
  r3_tempo_resposta: string | null
  r5_experiencia_anterior: string | null
  r6_visibilidade_canais: string | null
  r7_impacto_caixa: string | null
  r8_impacto_futuro: string | null
  r9_o_que_mudaria: string | null
  nota_30_porcento: string | null
  nota_observacoes: string | null
  transicao_dor_usada: string | null
  ticket_medio_calc: string | null
  calculo_roi: string | null
  obj_vou_pensar: string | null
  obj_esta_caro: string | null
  obj_nao_funcionou: string | null
  obj_sem_budget: string | null
  obj_falar_socio: string | null
  fech_objecao_final: string | null
  fech_proximo_passo: string | null
}

export default function Respostas() {
  const [respostas, setRespostas] = useState<Resposta[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [selecionada, setSelecionada] = useState<Resposta | null>(null)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    fetch('/api/respostas')
      .then(r => r.json())
      .then(d => { if (d.ok) setRespostas(d.data); else setErro(d.erro || 'Erro ao carregar') })
      .catch(() => setErro('Erro de conexão com o servidor'))
      .finally(() => setLoading(false))
  }, [])

  const filtradas = respostas.filter(r =>
    [r.nome_cliente, r.negocio, r.fech_resultado].some(v => v?.toLowerCase().includes(busca.toLowerCase()))
  )

  const statusColor = (resultado: string | null) => {
    if (!resultado) return '#888'
    const r = resultado.toLowerCase()
    if (r.includes('fechou') || r.includes('assinou') || r.includes('fechado')) return '#12C48B'
    if (r.includes('pensar') || r.includes('analisar') || r.includes('call')) return '#EF9F27'
    return '#9A9A90'
  }

  const dataFmt = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#F7F6F3;color:#1A1A18;min-height:100vh}
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        .topbar{background:#1A1A18;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;gap:16px}
        .topbar-logo{font-family:'DM Mono',monospace;font-size:13px;color:#5DCAA5;font-weight:500}
        .topbar h1{font-size:16px;font-weight:500;color:#fff}
        .topbar-right{display:flex;align-items:center;gap:12px}
        .btn-back{padding:8px 16px;background:transparent;border:1px solid rgba(255,255,255,.2);border-radius:8px;color:rgba(255,255,255,.6);font-size:13px;cursor:pointer;text-decoration:none;font-family:'DM Sans',sans-serif;transition:all .15s}
        .btn-back:hover{border-color:rgba(255,255,255,.4);color:#fff}
        .container{max-width:1100px;margin:0 auto;padding:32px 24px}
        .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px}
        .stat-card{background:#fff;border:1px solid #E0DED8;border-radius:10px;padding:16px 18px}
        .stat-num{font-size:28px;font-weight:600;letter-spacing:-.02em;color:#1A1A18}
        .stat-num.verde{color:#0F6E56}
        .stat-lbl{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#9A9A92;margin-top:4px}
        .search-bar{margin-bottom:20px}
        .search-bar input{width:100%;padding:12px 16px;background:#fff;border:1px solid #E0DED8;border-radius:10px;font-size:14px;color:#1A1A18;outline:none;font-family:'DM Sans',sans-serif;transition:border-color .15s}
        .search-bar input:focus{border-color:#5DCAA5}
        .search-bar input::placeholder{color:#C8C6C0}
        .table-wrap{background:#fff;border:1px solid #E0DED8;border-radius:12px;overflow:hidden}
        table{width:100%;border-collapse:collapse}
        th{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#9A9A92;padding:12px 16px;text-align:left;background:#F7F6F3;border-bottom:1px solid #E0DED8}
        td{padding:12px 16px;font-size:13px;color:#1A1A18;border-bottom:1px solid #F0EEEA;vertical-align:top}
        tr:last-child td{border-bottom:none}
        tr:hover td{background:#FAFAF8;cursor:pointer}
        .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:10px;font-family:'DM Mono',monospace;font-weight:500;background:#F0EEEA;color:#5A5A54}
        .empty{text-align:center;padding:60px 24px;color:#9A9A92}
        .empty-icon{font-size:40px;margin-bottom:12px}
        .loader{text-align:center;padding:60px;color:#9A9A92;font-size:14px}

        /* MODAL */
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:flex-start;justify-content:flex-end;padding:0}
        .drawer{width:520px;height:100vh;background:#fff;overflow-y:auto;box-shadow:-4px 0 32px rgba(0,0,0,.15);display:flex;flex-direction:column}
        .drawer-header{padding:24px 24px 16px;border-bottom:1px solid #E0DED8;position:sticky;top:0;background:#fff;z-index:1;display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
        .drawer-name{font-size:18px;font-weight:600;color:#1A1A18}
        .drawer-meta{font-size:12px;color:#9A9A92;margin-top:2px}
        .drawer-close{width:32px;height:32px;border-radius:8px;background:#F7F6F3;border:1px solid #E0DED8;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;color:#5A5A54;flex-shrink:0;transition:all .15s}
        .drawer-close:hover{background:#E0DED8}
        .drawer-body{padding:20px 24px;flex:1}
        .d-section{margin-bottom:24px}
        .d-section-title{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#0F6E56;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #E1F5EE}
        .d-row{margin-bottom:10px}
        .d-label{font-size:10px;color:#9A9A92;font-family:'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px}
        .d-val{font-size:13px;color:#1A1A18;line-height:1.55;background:#F7F6F3;padding:8px 12px;border-radius:6px}
        .d-val.empty{color:#C8C6C0;font-style:italic}
        .resultado-badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500;background:#E1F5EE;color:#085041;margin-top:4px}
      `}</style>

      <div className="topbar">
        <div>
          <div className="topbar-logo">DR.Tráfego</div>
          <h1>Respostas de Call</h1>
        </div>
        <div className="topbar-right">
          <Link href="/" className="btn-back">← Voltar ao roteiro</Link>
        </div>
      </div>

      <div className="container">
        {/* STATS */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-num">{respostas.length}</div>
            <div className="stat-lbl">Calls registradas</div>
          </div>
          <div className="stat-card">
            <div className="stat-num verde">{respostas.filter(r => r.fech_resultado?.toLowerCase().includes('fechou') || r.fech_resultado?.toLowerCase().includes('assinou')).length}</div>
            <div className="stat-lbl">Fechamentos</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{respostas.filter(r => r.r10_ticket_medio).length}</div>
            <div className="stat-lbl">Com ticket médio</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{respostas.filter(r => r.obj_vou_pensar || r.obj_esta_caro).length}</div>
            <div className="stat-lbl">Com objeções</div>
          </div>
        </div>

        {/* BUSCA */}
        <div className="search-bar">
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome, negócio ou resultado..." />
        </div>

        {/* TABELA */}
        {loading ? (
          <div className="loader">Carregando respostas...</div>
        ) : erro ? (
          <div className="empty"><div className="empty-icon">⚠️</div><div>{erro}</div></div>
        ) : filtradas.length === 0 ? (
          <div className="empty"><div className="empty-icon">📋</div><div style={{fontWeight:500,marginBottom:6}}>Nenhuma resposta encontrada</div><div style={{fontSize:13}}>As calls salvas aparecem aqui após você clicar em "Salvar no Neon" no roteiro.</div></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Negócio</th>
                  <th>Dor principal</th>
                  <th>Plano</th>
                  <th>Resultado</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(r => (
                  <tr key={r.id} onClick={() => setSelecionada(r)}>
                    <td><span className="badge">#{r.id}</span></td>
                    <td style={{fontWeight:500}}>{r.nome_cliente || <span style={{color:'#C8C6C0'}}></span>}</td>
                    <td style={{color:'#5A5A54'}}>{r.negocio || <span style={{color:'#C8C6C0'}}></span>}</td>
                    <td style={{color:'#5A5A54',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.r4_maior_desafio || r.nota_dor_principal || <span style={{color:'#C8C6C0'}}></span>}</td>
                    <td>{r.fech_plano ? <span className="badge">{r.fech_plano}</span> : <span style={{color:'#C8C6C0'}}></span>}</td>
                    <td><span style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:7,height:7,borderRadius:'50%',background:statusColor(r.fech_resultado),flexShrink:0,display:'inline-block'}}></span>{r.fech_resultado ? r.fech_resultado.slice(0,40)+(r.fech_resultado.length>40?'...':'') : <span style={{color:'#C8C6C0'}}></span>}</span></td>
                    <td style={{color:'#9A9A92',whiteSpace:'nowrap'}}>{dataFmt(r.criado_em)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DRAWER DETALHE */}
      {selecionada && (
        <div className="overlay" onClick={() => setSelecionada(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <div className="drawer-name">{selecionada.nome_cliente || 'Sem nome'}</div>
                <div className="drawer-meta">{selecionada.negocio && `${selecionada.negocio} · `}{dataFmt(selecionada.criado_em)}</div>
                {selecionada.fech_resultado && <div className="resultado-badge">{selecionada.fech_resultado}</div>}
              </div>
              <div className="drawer-close" onClick={() => setSelecionada(null)}>✕</div>
            </div>
            <div className="drawer-body">
              {[
                { titulo: 'Diagnóstico: Situação', campos: [
                  ['Origem dos clientes', selecionada.r1_origem_clientes],
                  ['Previsibilidade', selecionada.r2_previsibilidade],
                  ['Tempo de resposta', selecionada.r3_tempo_resposta],
                ]},
                { titulo: 'Diagnóstico: Problema', campos: [
                  ['Maior desafio', selecionada.r4_maior_desafio],
                  ['Experiência anterior', selecionada.r5_experiencia_anterior],
                  ['Visibilidade de canais', selecionada.r6_visibilidade_canais],
                ]},
                { titulo: 'Diagnóstico: Implicação', campos: [
                  ['Impacto no caixa', selecionada.r7_impacto_caixa],
                  ['Impacto futuro', selecionada.r8_impacto_futuro],
                  ['O que mudaria', selecionada.r9_o_que_mudaria],
                  ['Ticket médio', selecionada.r10_ticket_medio],
                ]},
                { titulo: 'Resumo do Diagnóstico', campos: [
                  ['Dor principal (palavras dele)', selecionada.nota_dor_principal],
                  ['30% mais clientes', selecionada.nota_30_porcento],
                  ['Observações', selecionada.nota_observacoes],
                ]},
                { titulo: 'Apresentação', campos: [
                  ['Dor usada na transição', selecionada.transicao_dor_usada],
                  ['Ticket médio (cálculo)', selecionada.ticket_medio_calc],
                  ['Cálculo ROI', selecionada.calculo_roi],
                ]},
                { titulo: 'Objeções Levantadas', campos: [
                  ['"Vou pensar"', selecionada.obj_vou_pensar],
                  ['"Está caro"', selecionada.obj_esta_caro],
                  ['"Não funcionou"', selecionada.obj_nao_funcionou],
                  ['"Sem budget"', selecionada.obj_sem_budget],
                  ['"Falar com sócio"', selecionada.obj_falar_socio],
                ]},
                { titulo: 'Fechamento', campos: [
                  ['Plano apresentado', selecionada.fech_plano],
                  ['Objeção final', selecionada.fech_objecao_final],
                  ['Próximo passo', selecionada.fech_proximo_passo],
                  ['Resultado da call', selecionada.fech_resultado],
                ]},
              ].map(section => (
                <div key={section.titulo} className="d-section">
                  <div className="d-section-title">{section.titulo}</div>
                  {section.campos.map(([label, val]) => (
                    <div key={label} className="d-row">
                      <div className="d-label">{label}</div>
                      <div className={`d-val${!val ? ' empty' : ''}`}>{val || 'Não preenchido'}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
