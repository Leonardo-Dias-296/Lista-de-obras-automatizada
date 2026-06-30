import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'

export default function Preview({ data, excelBlob, excelFileName, formData, onGerarPDF, onGerarPlanilha }) {
  const [excelRows, setExcelRows] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (excelBlob) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
          setExcelRows(rows)
          setReady(true)
        } catch (err) {
          console.error('Erro ao ler planilha:', err)
        }
      }
      reader.readAsArrayBuffer(excelBlob)
    } else {
      setExcelRows([])
      setReady(false)
    }
  }, [excelBlob])

  function handleDownload() {
    if (!excelBlob) return
    const url = URL.createObjectURL(excelBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = excelFileName || 'planilha.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleVisualizar() {
    if (!excelBlob) return

    const url = URL.createObjectURL(excelBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = excelFileName || 'planilha.xlsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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

        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
          {formData && (
            <button
              className="btn btn-primary"
              onClick={() => onGerarPlanilha(formData)}
            >
              📋 Gerar Planilha
            </button>
          )}
          {ready && (
            <button className="btn btn-primary" onClick={handleVisualizar} style={{ background: '#217346' }}>
              📊 Abrir no Excel
            </button>
          )}
          {ready && (
            <button className="btn btn-ghost" onClick={handleDownload} style={{ color: 'var(--accent)' }}>
              ⬇️ Baixar .xlsx
            </button>
          )}
          <button
            className="btn btn-ghost"
            style={{ color: 'var(--blue)', borderColor: 'rgba(56,189,248,0.3)', background: 'var(--blueGlow)' }}
            onClick={() => onGerarPDF({ materiais: data, cliente: formData?.cliente || 'Cliente' })}
          >
            📄 Baixar Romaneio PDF
          </button>
        </div>
      </div>
    </div>
  )
}
