import React, { useState, useEffect } from 'react'

export default function Relatorios() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    carregarStats()
  }, [])

  async function carregarStats() {
    try {
      const r = await fetch('/api/stats')
      const data = await r.json()
      setStats(data)
    } catch (e) {
      console.error('Erro ao carregar stats:', e)
    }
  }

  if (!stats) {
    return (
      <div className="stats-hero">
        <div className="stat-card">
          <div className="stat-val">...</div>
          <div className="stat-lbl">Carregando...</div>
        </div>
      </div>
    )
  }

  function renderTabela(obj) {
    if (!Object.keys(obj).length) {
      return <p style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: '13px' }}>Sem dados ainda</p>
    }
    return (
      <table className="pt">
        <thead>
          <tr>
            <th>Nome</th>
            <th style={{ textAlign: 'right' }}>Usos</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(obj).map(([n, v]) => (
            <tr key={n}>
              <td>{n}</td>
              <td className="td-num">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <>
      <div className="stats-hero">
        <div className="stat-card">
          <div className="stat-bg-icon">📋</div>
          <div className="stat-val">{stats.total_orcamentos}</div>
          <div className="stat-lbl">Orçamentos Gerados</div>
        </div>
        <div className="stat-card">
          <div className="stat-bg-icon">☀️</div>
          <div className="stat-val">{stats.total_modulos}</div>
          <div className="stat-lbl">Módulos Solicitados</div>
        </div>
      </div>
      <div className="two-col">
        <div className="card">
          <div className="card-head">
            <div className="cicon b">🔌</div>
            <div>
              <h2 className="card-title">Inversores Mais Usados</h2>
              <p className="card-sub">Top 5 por frequência de uso</p>
            </div>
          </div>
          <div className="card-body">{renderTabela(stats.top_inversores)}</div>
        </div>
        <div className="card">
          <div className="card-head">
            <div className="cicon gr">🏙️</div>
            <div>
              <h2 className="card-title">Cidades Mais Atendidas</h2>
              <p className="card-sub">Top 5 por número de obras</p>
            </div>
          </div>
          <div className="card-body">{renderTabela(stats.top_cidades)}</div>
        </div>
      </div>
    </>
  )
}
