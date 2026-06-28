import React from 'react'

export default function Fila({ fila, setFila, onGerarLote }) {
  if (fila.length === 0) return null

  function removerFila(idx) {
    setFila(fila.filter((_, i) => i !== idx))
  }

  function limparFila() {
    setFila([])
  }

  return (
    <div className="card" id="cardFila">
      <div className="card-head">
        <div className="cicon g">🧺</div>
        <div>
          <h2 className="card-title">Fila de Impressão ({fila.length})</h2>
          <p className="card-sub">Projetos aguardando geração em lote</p>
        </div>
      </div>
      <div className="card-body">
        {fila.map((item, idx) => {
          const invStr = item.inversores.map(i => `${i.qtd > 1 ? i.qtd + 'x ' : ''}${i.nome}`).join(', ')
          const totMods = item.modulos.reduce((s, m) => s + m.qtd, 0)
          return (
            <div key={idx} className="fila-item">
              <div>
                <span className="fila-cli">{item.cliente}</span>
                <span className="fila-det">
                  {invStr} · {totMods} módulos · {item.cidade}{item.estrutura ? ' · ' + item.estrutura : ''}
                </span>
              </div>
              <button className="btn-rmv" onClick={() => removerFila(idx)}>✕</button>
            </div>
          )
        })}
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={limparFila}>🗑️ Limpar</button>
          <button className="btn btn-orange btn-sm" style={{ flex: 2 }} onClick={onGerarLote}>🖨️ Baixar Tudo</button>
        </div>
      </div>
    </div>
  )
}
