import React from 'react'

export default function Preview({ data, onGerarPDF }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="card">
        <div className="card-head">
          <div className="cicon b">📊</div>
          <div>
            <h2 className="card-title">Prévia de Materiais</h2>
            <p className="card-sub">Lista calculada antes da geração</p>
          </div>
        </div>
        <div className="card-body">
          <div className="p-empty">
            <div className="p-empty-icon">🔍</div>
            Preencha o formulário e clique em<br /><strong>Calcular Prévia</strong> para visualizar.
          </div>
        </div>
      </div>
    )
  }

  const totalModulos = data['Perfil'] || 0
  const totalItens = Object.keys(data).length

  return (
    <div className="card">
      <div className="card-head">
        <div className="cicon b">📊</div>
        <div>
          <h2 className="card-title">Prévia de Materiais</h2>
          <p className="card-sub">Lista calculada antes da geração</p>
        </div>
      </div>
      <div className="card-body">
        <div className="sum-grid">
          <div className="sum-cell">
            <div className="sum-val">{totalModulos}</div>
            <div className="sum-lbl">Módulos</div>
          </div>
          <div className="sum-cell">
            <div className="sum-val">{totalItens}</div>
            <div className="sum-lbl">Tipos de Item</div>
          </div>
        </div>

        <div className="pt-wrap">
          <table className="pt">
            <thead>
              <tr>
                <th>Material</th>
                <th style={{ textAlign: 'right' }}>Qtd</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data).map(([nome, qtd]) => (
                <tr key={nome}>
                  <td>{nome}</td>
                  <td className="td-num">{qtd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          className="btn btn-ghost"
          style={{ marginTop: '16px', color: 'var(--blue)', borderColor: 'rgba(56,189,248,0.3)', background: 'var(--blueGlow)' }}
          onClick={() => onGerarPDF({ materiais: data })}
        >
          📄 Baixar Romaneio PDF
        </button>
      </div>
    </div>
  )
}
