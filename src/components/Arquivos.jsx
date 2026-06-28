import React, { useState } from 'react'

export default function Arquivos({ arquivos, onAtualizar, onDeletar }) {
  const [filtro, setFiltro] = useState('')

  const arquivosFiltrados = arquivos.filter(a =>
    a.nome.toLowerCase().includes(filtro.toLowerCase())
  )

  async function handleDeletar(nome) {
    if (!confirm(`Excluir permanentemente o arquivo ${nome}?`)) return
    try {
      await onDeletar(nome)
      onAtualizar()
    } catch (e) {
      console.error('Erro ao excluir:', e)
    }
  }

  function handleDownload(nome) {
    const a = document.createElement('a')
    a.href = `/api/download/${encodeURIComponent(nome)}`
    a.download = nome
    a.click()
  }

  return (
    <div className="card">
      <div className="card-head">
        <div className="cicon gr">📁</div>
        <h2 className="card-title">Arquivos Gerados</h2>
      </div>
      <div className="card-body">
        <div className="search-wrap">
          <span className="search-ico">🔍</span>
          <input
            type="text"
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            placeholder="Buscar arquivo..."
          />
        </div>
        <div id="listaArquivos">
          {arquivosFiltrados.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: '13px' }}>
              Nenhum arquivo gerado ainda
            </p>
          ) : (
            arquivosFiltrados.map(a => (
              <div key={a.nome} className="file-item">
                <span className="file-name">{a.nome}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn-icon" style={{ color: 'var(--blue)' }} onClick={() => handleDownload(a.nome)} title="Baixar">⬇</button>
                  <button className="btn-icon danger" onClick={() => handleDeletar(a.nome)} title="Excluir">🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
