import React, { useState, useEffect } from 'react'
import PasteInfo from './PasteInfo'

export default function Formulario({ db, onCalcular, onAdicionarFila, showToast }) {
  const [cliente, setCliente] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [codObra, setCodObra] = useState('')
  const [equipe, setEquipe] = useState('')
  const [estrutura, setEstrutura] = useState('')
  const [cidade, setCidade] = useState('')

  const [modulos, setModulos] = useState([{ potencia: '', qtd: 1 }])
  const [inversores, setInversores] = useState([{ nome: '', qtd: 1 }])
  const [extras, setExtras] = useState([{ nome: '', qtd: 1 }])

  function addModulo() {
    setModulos([...modulos, { potencia: '', qtd: 1 }])
  }

  function removeModulo(idx) {
    if (modulos.length > 1) {
      setModulos(modulos.filter((_, i) => i !== idx))
    }
  }

  function updateModulo(idx, field, value) {
    const novos = [...modulos]
    novos[idx][field] = field === 'qtd' ? parseInt(value) || 1 : value
    setModulos(novos)
  }

  function addInversor() {
    setInversores([...inversores, { nome: '', qtd: 1 }])
  }

  function removeInversor(idx) {
    if (inversores.length > 1) {
      setInversores(inversores.filter((_, i) => i !== idx))
    }
  }

  function updateInversor(idx, field, value) {
    const novos = [...inversores]
    novos[idx][field] = field === 'qtd' ? parseInt(value) || 1 : value
    setInversores(novos)
  }

  function addExtra() {
    setExtras([...extras, { nome: '', qtd: 1 }])
  }

  function removeExtra(idx) {
    setExtras(extras.filter((_, i) => i !== idx))
  }

  function updateExtra(idx, field, value) {
    const novos = [...extras]
    novos[idx][field] = field === 'qtd' ? parseInt(value) || 1 : value
    setExtras(novos)
  }

  function handleCalcular() {
    const totalModulos = modulos.reduce((sum, m) => sum + (m.qtd || 0), 0)
    if (!totalModulos || inversores.every(i => !i.nome) || !cidade) {
      return showToast('Preencha Módulos, Inversores e Cidade', 'error')
    }
    onCalcular({ modulos, inversores, cidade })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (inversores.every(i => !i.nome)) return showToast('Adicione pelo menos um inversor', 'error')
    if (modulos.every(m => !m.potencia)) return showToast('Adicione pelo menos um módulo', 'error')

    onAdicionarFila({
      cliente,
      data,
      equipe,
      cod_obra: codObra,
      modulos,
      inversores,
      extras: extras.filter(e => e.nome),
      cidade,
      estrutura
    })

    setCliente('')
    setCodObra('')
    setEquipe('')
  }

  function applyPasteData(dados) {
    if (dados.equipe) setEquipe(dados.equipe)
    if (dados.cliente) setCliente(dados.cliente)
    if (dados.cidade) setCidade(dados.cidade)
    if (dados.modulos.length > 0) setModulos(dados.modulos)
    if (dados.inversores.length > 0) {
      const invsEncontrados = dados.inversores.map(inv => {
        const potencia = inv.nome.replace('k', '').replace('K', '').replace(',', '.')
        const match = Object.keys(db.inversores).find(n => {
          const nLower = n.toLowerCase()
          return nLower.includes(potencia) || nLower.includes(`${potencia}k`) || nLower.includes(`${potencia} kw`)
        })
        return { nome: match || inv.nome, qtd: inv.qtd }
      })
      setInversores(invsEncontrados)
    }
  }

  return (
    <div className="card">
      <div className="card-head">
        <div className="cicon g">📝</div>
        <div>
          <h1 className="card-title">Novo Orçamento</h1>
          <p className="card-sub">Preencha os dados técnicos para gerar a lista de materiais</p>
        </div>
      </div>
      <div className="card-body">
        <PasteInfo onAplicar={applyPasteData} showToast={showToast} />
        <form onSubmit={handleSubmit}>
          <div className="sec-div"><div className="sec-div-line"></div><span className="sec-div-lbl">Dados da Obra</span><div className="sec-div-line"></div></div>

          <div className="field">
            <label className="flabel">Nome do Cliente <span className="req">*</span></label>
            <input type="text" value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Ex: João da Silva" required />
          </div>

          <div className="frow2">
            <div className="field">
              <label className="flabel">Data <span className="req">*</span></label>
              <input type="date" value={data} onChange={e => setData(e.target.value)} required />
            </div>
            <div className="field">
              <label className="flabel">Cód. Obra</label>
              <input type="text" value={codObra} onChange={e => setCodObra(e.target.value)} placeholder="Ex: OBR-001" />
            </div>
          </div>

          <div className="field">
            <label className="flabel">Equipe</label>
            <input type="text" value={equipe} onChange={e => setEquipe(e.target.value)} placeholder="Ex: Equipe Alpha" />
          </div>

          <div className="sec-div"><div className="sec-div-line"></div><span className="sec-div-lbl">Configuração Solar</span><div className="sec-div-line"></div></div>

          <div className="field">
            <label className="flabel">Estrutura <span className="req">*</span></label>
            <select value={estrutura} onChange={e => setEstrutura(e.target.value)} required>
              <option value="">— Selecione a estrutura —</option>
              <option value="SSM">SSM</option>
              <option value="PRATYC">PRATYC</option>
              <option value="IBRAP">IBRAP</option>
              <option value="RENOVIGI">RENOVIGI</option>
              <option value="MINI TRILHO ALTO IBRAP">MINI TRILHO ALTO IBRAP</option>
              <option value="MINI TRILHO BAIXO IBRAP">MINI TRILHO BAIXO IBRAP</option>
              <option value="MINI TRILHO ALTO PRATYC">MINI TRILHO ALTO PRATYC</option>
              <option value="OBRA DE SOLO">OBRA DE SOLO</option>
            </select>
          </div>

          <div className="sec-div"><div className="sec-div-line"></div><span className="sec-div-lbl">Módulos da Obra</span><div className="sec-div-line"></div></div>
          {modulos.map((mod, idx) => (
            <div key={idx} className="frow2 modulo-obra-row" style={{ marginBottom: '10px' }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <input type="number" value={mod.potencia} onChange={e => updateModulo(idx, 'potencia', e.target.value)} placeholder="Potência (W)" required />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" value={mod.qtd} onChange={e => updateModulo(idx, 'qtd', e.target.value)} min="1" placeholder="Qtd" style={{ width: '70px' }} required />
                <button type="button" className="mat-x" onClick={() => removeModulo(idx)} title="Remover">✕</button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={addModulo}>➕ Adicionar Módulo</button>

          <div className="sec-div"><div className="sec-div-line"></div><span className="sec-div-lbl">Inversores da Obra</span><div className="sec-div-line"></div></div>
          {inversores.map((inv, idx) => (
            <div key={idx} className="frow2 inversor-obra-row" style={{ marginBottom: '10px' }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <select value={inv.nome} onChange={e => updateInversor(idx, 'nome', e.target.value)} required>
                  <option value="">— Selecione o inversor —</option>
                  {Object.keys(db.inversores).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" value={inv.qtd} onChange={e => updateInversor(idx, 'qtd', e.target.value)} min="1" placeholder="Qtd" style={{ width: '70px' }} />
                <button type="button" className="mat-x" onClick={() => removeInversor(idx)} title="Remover">✕</button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={addInversor}>➕ Adicionar Inversor</button>

          <div className="sec-div"><div className="sec-div-line"></div><span className="sec-div-lbl">Itens Extras e Medidas de Campo</span><div className="sec-div-line"></div></div>
          {extras.map((ext, idx) => (
            <div key={idx} className="frow2 extra-obra-row" style={{ marginBottom: '10px' }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <input type="text" value={ext.nome} onChange={e => updateExtra(idx, 'nome', e.target.value)} placeholder="Nome do Cabo/Item" required />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" value={ext.qtd} onChange={e => updateExtra(idx, 'qtd', e.target.value)} min="1" placeholder="Metros/Unid" style={{ width: '85px' }} required />
                <button type="button" className="mat-x" onClick={() => removeExtra(idx)} title="Remover">✕</button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={addExtra}>➕ Adicionar Item Extra ou Cabo</button>

          <div className="sec-div"><div className="sec-div-line"></div><span className="sec-div-lbl">Localização</span><div className="sec-div-line"></div></div>

          <div className="field" style={{ marginBottom: '22px' }}>
            <label className="flabel">Cidade <span className="req">*</span></label>
            <select value={cidade} onChange={e => setCidade(e.target.value)} required>
              <option value="">— Selecione a cidade —</option>
              {Object.keys(db.cidades).map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <button type="button" className="btn btn-blue" style={{ marginBottom: '10px' }} onClick={handleCalcular}>
            🔍 Calcular Prévia de Materiais
          </button>
          <button type="submit" className="btn btn-primary">
            ➕ Adicionar à Lista de Impressão
          </button>
        </form>
      </div>
    </div>
  )
}
