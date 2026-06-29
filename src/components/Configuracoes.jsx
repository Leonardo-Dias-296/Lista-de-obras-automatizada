import React, { useState } from 'react'

export default function Configuracoes({ db, onSalvar, showToast }) {
  const [modalInversor, setModalInversor] = useState(false)
  const [modalCidade, setModalCidade] = useState(false)

  const [invNome, setInvNome] = useState('')
  const [invNomeOriginal, setInvNomeOriginal] = useState('')
  const [invIsCopy, setInvIsCopy] = useState(false)
  const [invDisjCA, setInvDisjCA] = useState('')
  const [invDisjCC, setInvDisjCC] = useState('')
  const [invMateriais, setInvMateriais] = useState([{ nome: '', qtd: 1 }])

  const [cidNome, setCidNome] = useState('')
  const [cidNomeOriginal, setCidNomeOriginal] = useState('')
  const [cidPlacas, setCidPlacas] = useState({})

  const PLACAS_PADRAO = ['Placa Padrão entrada P', 'Placa Padrão entrada G']
  const PLACAS_PROP = ['Placa propaganda P', 'Placa propaganda G']
  const PLACA_LABEL = {
    'Placa Padrão entrada P': 'Padrão Entrada — Pequena',
    'Placa Padrão entrada G': 'Padrão Entrada — Grande',
    'Placa propaganda P': 'Propaganda — Pequena (até 29 módulos)',
    'Placa propaganda G': 'Propaganda — Grande (30+ módulos)'
  }

  function abrirModalInversor(editNome = null, copyNome = null) {
    const isCopy = !!copyNome
    const sourceNome = editNome || copyNome

    setInvNomeOriginal(editNome || '')
    setInvIsCopy(isCopy)
    setInvNome(isCopy ? `${sourceNome} - Cópia` : (editNome || ''))
    setInvDisjCA(sourceNome ? (db.inversores[sourceNome]?.disjuntor_ca || '') : '')
    setInvDisjCC(sourceNome ? (db.inversores[sourceNome]?.disjuntor_cc || '') : '')

    if (sourceNome && db.inversores[sourceNome]?.materiais) {
      setInvMateriais(db.inversores[sourceNome].materiais.map(m => ({
        nome: m.codigo ? `${m.codigo} - ${m.nome}` : m.nome,
        qtd: m.qtd
      })))
    } else {
      setInvMateriais([{ nome: '', qtd: 1 }])
    }
    setModalInversor(true)
  }

  async function salvarInversor() {
    if (!invNome.trim()) return showToast('Informe o nome do inversor', 'error')
    try {
      const novoDb = { ...db }
      novoDb.inversores = { ...db.inversores }

      if (invNomeOriginal && invNomeOriginal !== invNome && !invIsCopy) {
        delete novoDb.inversores[invNomeOriginal]
      }

      novoDb.inversores[invNome] = {
        disjuntor_ca: invDisjCA,
        disjuntor_cc: invDisjCC,
        materiais: invMateriais.filter(m => m.nome)
      }

      await onSalvar(novoDb)
      setModalInversor(false)
      showToast('Inversor salvo!', 'success')
    } catch (err) {
      console.error('Erro ao salvar inversor:', err)
      showToast('Erro ao salvar inversor. Verifique o servidor.', 'error')
    }
  }

  function deletarInversor(nome) {
    if (!confirm(`Excluir o inversor "${nome}"?`)) return
    const novoDb = { ...db }
    novoDb.inversores = { ...db.inversores }
    delete novoDb.inversores[nome]
    onSalvar(novoDb)
  }

  function abrirModalCidade(editNome = null) {
    setCidNomeOriginal(editNome || '')
    setCidNome(editNome || '')
    const excl = editNome ? (db.cidades[editNome]?.naoadicionar || []).map(i => i.nome) : []
    const placas = {}
    ;[...PLACAS_PADRAO, ...PLACAS_PROP].forEach(p => {
      placas[p] = !excl.includes(p)
    })
    setCidPlacas(placas)
    setModalCidade(true)
  }

  async function salvarCidade() {
    if (!cidNome.trim()) return showToast('Informe o nome da cidade', 'error')
    try {
      const novoDb = { ...db }
      novoDb.cidades = { ...db.cidades }

      if (cidNomeOriginal && cidNomeOriginal !== cidNome) {
        delete novoDb.cidades[cidNomeOriginal]
      }

      const naoadicionar = Object.entries(cidPlacas)
        .filter(([_, checked]) => !checked)
        .map(([nome]) => ({ nome }))

      novoDb.cidades[cidNome] = { naoadicionar }
      await onSalvar(novoDb)
      setModalCidade(false)
      showToast('Cidade salva!', 'success')
    } catch (err) {
      console.error('Erro ao salvar cidade:', err)
      showToast('Erro ao salvar cidade. Verifique o servidor.', 'error')
    }
  }

  function deletarCidade(nome) {
    if (!confirm(`Excluir a cidade "${nome}"?`)) return
    const novoDb = { ...db }
    novoDb.cidades = { ...db.cidades }
    delete novoDb.cidades[nome]
    onSalvar(novoDb)
  }

  return (
    <div className="two-col">
      <div className="card">
        <div className="card-head">
          <div className="cicon b">🔌</div>
          <div>
            <h2 className="card-title">Gerenciar Inversores</h2>
            <p className="card-sub">Modelos, materiais específicos e disjuntores</p>
          </div>
        </div>
        <div className="card-body">
          {Object.keys(db.inversores).length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: '13px' }}>Nenhum inversor cadastrado</p>
          ) : (
            Object.keys(db.inversores).map(n => (
              <div key={n} className="adm-item">
                <div>
                  <div className="adm-name">{n}</div>
                  {db.inversores[n].disjuntor_ca && (
                    <div className="adm-sub">⚡ Disjuntor CA: {db.inversores[n].disjuntor_ca}</div>
                  )}
                  {db.inversores[n].disjuntor_cc && (
                    <div className="adm-sub">⚡ Disjuntor CC: {db.inversores[n].disjuntor_cc}</div>
                  )}
                </div>
                <div className="adm-acts">
                  <button className="btn-icon" onClick={() => abrirModalInversor(null, n)} title="Copiar">📋</button>
                  <button className="btn-icon" onClick={() => abrirModalInversor(n)} title="Editar">✏️</button>
                  <button className="btn-icon danger" onClick={() => deletarInversor(n)} title="Excluir">🗑️</button>
                </div>
              </div>
            ))
          )}
          <button className="btn btn-ghost" style={{ marginTop: '10px' }} onClick={() => abrirModalInversor()}>➕ Novo Inversor</button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="cicon g">🏙️</div>
          <div>
            <h2 className="card-title">Gerenciar Cidades</h2>
            <p className="card-sub">Configuração de placas por localidade</p>
          </div>
        </div>
        <div className="card-body">
          {Object.keys(db.cidades).length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: '13px' }}>Nenhuma cidade cadastrada</p>
          ) : (
            Object.keys(db.cidades).map(n => {
              const excl = (db.cidades[n].naoadicionar || []).map(i => i.nome)
              return (
                <div key={n} className="adm-item">
                  <div>
                    <div className="adm-name">{n}</div>
                    {excl.length ? (
                      <div className="adm-sub">🚫 Excluídas: {excl.join(', ')}</div>
                    ) : (
                      <div className="adm-sub" style={{ color: 'var(--green)' }}>✓ Todas as placas ativas</div>
                    )}
                  </div>
                  <div className="adm-acts">
                    <button className="btn-icon" onClick={() => abrirModalCidade(n)} title="Editar">✏️</button>
                    <button className="btn-icon danger" onClick={() => deletarCidade(n)} title="Excluir">🗑️</button>
                  </div>
                </div>
              )
            })
          )}
          <button className="btn btn-ghost" style={{ marginTop: '10px' }} onClick={() => abrirModalCidade()}>➕ Nova Cidade</button>
        </div>
      </div>

      {modalInversor && (
        <div className="modal-back open">
          <div className="modal-box">
            <div className="modal-head">
              <h3>{invNomeOriginal ? `Editar: ${invNomeOriginal}` : (invIsCopy ? `Copiar de: ${invNomeOriginal}` : 'Novo Inversor')}</h3>
              <button className="btn-close" onClick={() => setModalInversor(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label className="flabel">Nome do Modelo</label>
                <input type="text" value={invNome} onChange={e => setInvNome(e.target.value)} placeholder="Ex: Solis 5Kw" />
              </div>
              <div className="frow2">
                <div className="field">
                  <label className="flabel">Disjuntor CA</label>
                  <input type="text" value={invDisjCA} onChange={e => setInvDisjCA(e.target.value)} placeholder="Ex: 32A" />
                </div>
                <div className="field">
                  <label className="flabel">Disjuntor CC</label>
                  <input type="text" value={invDisjCC} onChange={e => setInvDisjCC(e.target.value)} placeholder="Ex: 15A" />
                </div>
              </div>
              <div className="sec-div"><div className="sec-div-line"></div><span className="sec-div-lbl">Materiais Específicos</span><div className="sec-div-line"></div></div>
              {invMateriais.map((mat, idx) => (
                <div key={idx} className="mat-item inv-material-item">
                  <input type="text" value={mat.nome} onChange={e => {
                    const novos = [...invMateriais]
                    novos[idx].nome = e.target.value
                    setInvMateriais(novos)
                  }} placeholder="Nome ou Código do Item" required />
                  <input type="number" value={mat.qtd} onChange={e => {
                    const novos = [...invMateriais]
                    novos[idx].qtd = parseInt(e.target.value) || 1
                    setInvMateriais(novos)
                  }} min="1" style={{ textAlign: 'center', padding: '9px 8px' }} />
                  <button className="mat-x" type="button" onClick={() => setInvMateriais(invMateriais.filter((_, i) => i !== idx))}>✕</button>
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={() => setInvMateriais([...invMateriais, { nome: '', qtd: 1 }])} style={{ marginTop: '4px' }}>➕ Adicionar Material</button>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setModalInversor(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvarInversor}>Salvar Inversor</button>
            </div>
          </div>
        </div>
      )}

      {modalCidade && (
        <div className="modal-back open">
          <div className="modal-box">
            <div className="modal-head">
              <h3>{cidNomeOriginal ? `Editar: ${cidNomeOriginal}` : 'Nova Cidade'}</h3>
              <button className="btn-close" onClick={() => setModalCidade(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label className="flabel">Nome da Cidade <span className="req">*</span></label>
                <input type="text" value={cidNome} onChange={e => setCidNome(e.target.value)} placeholder="Ex: Porto Alegre" />
              </div>
              <div className="sec-div"><div className="sec-div-line"></div><span className="sec-div-lbl">Placas de Padrão de Entrada</span><div className="sec-div-line"></div></div>
              {PLACAS_PADRAO.map(nome => (
                <label key={nome} className="tog-row">
                  <span className="tog-lbl">{PLACA_LABEL[nome]}</span>
                  <span className="tog-sw">
                    <input type="checkbox" checked={cidPlacas[nome] || false} onChange={e => setCidPlacas({ ...cidPlacas, [nome]: e.target.checked })} />
                    <span className="tog-track"></span>
                  </span>
                </label>
              ))}
              <div className="sec-div"><div className="sec-div-line"></div><span className="sec-div-lbl">Placas de Propaganda</span><div className="sec-div-line"></div></div>
              {PLACAS_PROP.map(nome => (
                <label key={nome} className="tog-row">
                  <span className="tog-lbl">{PLACA_LABEL[nome]}</span>
                  <span className="tog-sw">
                    <input type="checkbox" checked={cidPlacas[nome] || false} onChange={e => setCidPlacas({ ...cidPlacas, [nome]: e.target.checked })} />
                    <span className="tog-track"></span>
                  </span>
                </label>
              ))}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setModalCidade(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvarCidade}>Salvar Cidade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
