import React, { useState, useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'

export default function Preview({ data, excelBlob, excelFileName, formData, onGerarPDF, onGerarPlanilha }) {
  const [excelRows, setExcelRows] = useState([])
  const [showExcel, setShowExcel] = useState(false)
  const tableRef = useRef(null)

  useEffect(() => {
    if (excelBlob) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
          setExcelRows(rows)
          setShowExcel(true)
        } catch (err) {
          console.error('Erro ao ler planilha:', err)
        }
      }
      reader.readAsArrayBuffer(excelBlob)
    } else {
      setExcelRows([])
      setShowExcel(false)
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

  function handlePrint() {
    const printWindow = window.open('', '_blank')
    if (!printWindow || !tableRef.current) return
    const tableHtml = tableRef.current.outerHTML
    printWindow.document.write(`
      <html>
        <head>
          <title>SSM Solar - Planilha</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; font-size: 12px; }
            th { background: #f0f0f0; font-weight: bold; }
            .row-header { background: #e8f4f8; font-weight: bold; }
            .row-title { background: #fff3cd; font-weight: bold; font-size: 14px; }
            .cell-a { width: 60px; }
            .cell-b { width: 350px; }
            .cell-c { width: 100px; text-align: center; }
            @media print {
              body { padding: 0; }
              table { font-size: 10px; }
            }
          </style>
        </head>
        <body>
          ${tableHtml}
          <script>window.onload=function(){window.print();window.close()}</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  function getCellClass(rowIdx, colIdx) {
    if (rowIdx <= 7) return 'row-header'
    if (rowIdx === 0) return 'row-title'
    return ''
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
          <button
            className="btn btn-ghost"
            style={{ color: 'var(--blue)', borderColor: 'rgba(56,189,248,0.3)', background: 'var(--blueGlow)' }}
            onClick={() => onGerarPDF({ materiais: data, cliente: formData?.cliente || 'Cliente' })}
          >
            📄 Baixar Romaneio PDF
          </button>
        </div>

        {showExcel && excelRows.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--accent)' }}>Prévia da Planilha</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-ghost btn-sm" onClick={handlePrint} style={{ fontSize: '12px' }}>
                  🖨️ Imprimir
                </button>
                <button className="btn btn-ghost btn-sm" onClick={handleDownload} style={{ fontSize: '12px' }}>
                  ⬇️ Baixar .xlsx
                </button>
              </div>
            </div>
            <div className="pt-wrap" style={{ maxHeight: '400px', overflow: 'auto' }}>
              <table className="pt" ref={tableRef} style={{ fontSize: '11px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}></th>
                    <th style={{ width: '60px' }}>A</th>
                    <th style={{ width: '300px' }}>B</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>C</th>
                  </tr>
                </thead>
                <tbody>
                  {excelRows.map((row, rowIdx) => (
                    <tr key={rowIdx} className={getCellClass(rowIdx, 0)}>
                      <td style={{ color: 'var(--muted)', fontSize: '10px', textAlign: 'right' }}>{rowIdx + 1}</td>
                      <td>{row[0] || ''}</td>
                      <td>{row[1] || ''}</td>
                      <td style={{ textAlign: 'center' }}>{row[2] || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
