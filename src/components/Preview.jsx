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

  function handleVisualizar() {
    if (!excelRows.length) return

    const rowsHtml = excelRows.map((row, i) => {
      let rowClass = ''
      if (i === 0) rowClass = 'title-row'
      else if (i >= 1 && i <= 7) rowClass = 'header-row'

      const cells = [
        `<td class="row-num">${i + 1}</td>`,
        `<td class="col-a">${escapeHtml(String(row[0] || ''))}</td>`,
        `<td class="col-b">${escapeHtml(String(row[1] || ''))}</td>`,
        `<td class="col-c">${escapeHtml(String(row[2] || ''))}</td>`
      ].join('')

      return `<tr class="${rowClass}">${cells}</tr>`
    }).join('\n')

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>SSM Solar - ${escapeHtml(excelFileName || 'Planilha')}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Calibri, Arial, sans-serif; background: #f0f0f0; }
  .toolbar {
    background: #217346; padding: 10px 20px; display: flex; align-items: center;
    justify-content: space-between; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    position: sticky; top: 0; z-index: 100;
  }
  .toolbar-title { font-size: 14px; font-weight: bold; }
  .toolbar-actions { display: flex; gap: 8px; }
  .toolbar-actions button {
    padding: 6px 16px; border: 1px solid rgba(255,255,255,0.3); border-radius: 4px;
    background: rgba(255,255,255,0.1); color: white; cursor: pointer; font-size: 13px;
  }
  .toolbar-actions button:hover { background: rgba(255,255,255,0.25); }
  .sheet-container { padding: 20px; overflow: auto; }
  table {
    border-collapse: collapse; background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    min-width: 600px;
  }
  th {
    background: #f3f3f3; border: 1px solid #d0d0d0; padding: 4px 8px;
    font-size: 12px; color: #555; font-weight: normal; text-align: center;
    position: sticky; top: 52px; z-index: 10;
  }
  td {
    border: 1px solid #e0e0e0; padding: 5px 10px; font-size: 13px; white-space: nowrap;
  }
  .row-num { background: #f8f8f8; color: #999; text-align: right; width: 40px; font-size: 11px; }
  .col-a { min-width: 80px; }
  .col-b { min-width: 300px; }
  .col-c { min-width: 100px; text-align: center; }
  .title-row td { background: #fff3cd !important; font-weight: bold; font-size: 15px; }
  .header-row td { background: #e8f4f8 !important; font-weight: 600; }
  @media print {
    .toolbar { display: none !important; }
    .sheet-container { padding: 0; }
    table { box-shadow: none; }
    th { position: static; }
  }
</style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-title">SSM Solar - ${escapeHtml(excelFileName || 'Planilha')}</div>
    <div class="toolbar-actions">
      <button onclick="window.print()">🖨️ Imprimir</button>
      <button onclick="window.close()">✕ Fechar</button>
    </div>
  </div>
  <div class="sheet-container">
    <table>
      <thead>
        <tr>
          <th></th><th>A</th><th>B</th><th>C</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </div>
</body>
</html>`

    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(html)
      newWindow.document.close()
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
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
              📊 Visualizar Planilha
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
