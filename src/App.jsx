import React, { useState, useEffect, useCallback } from 'react'
import { useAPI } from './hooks/useAPI'
import Formulario from './components/Formulario'
import Preview from './components/Preview'
import Fila from './components/Fila'
import Arquivos from './components/Arquivos'
import Configuracoes from './components/Configuracoes'
import Relatorios from './components/Relatorios'
import Toast from './components/Toast'

export default function App() {
  const { db, loading, carregarConfig, gerarOrcamento, gerarLote, calcularPreview, gerarPDF, salvarBanco, listarArquivos, deletarArquivo } = useAPI()
  const [aba, setAba] = useState('calc')
  const [toast, setToast] = useState({ show: false, msg: '', tipo: 'success' })
  const [previewData, setPreviewData] = useState(null)
  const [excelData, setExcelData] = useState(null)
  const [excelBlob, setExcelBlob] = useState(null)
  const [excelFileName, setExcelFileName] = useState('')
  const [fila, setFila] = useState([])
  const [arquivos, setArquivos] = useState([])

  const showToast = useCallback((msg, tipo = 'success') => {
    setToast({ show: true, msg, tipo })
    setTimeout(() => setToast({ show: false, msg: '', tipo: 'success' }), 3400)
  }, [])

  useEffect(() => {
    atualizarArquivos()
  }, [])

  async function atualizarArquivos() {
    try {
      const lista = await listarArquivos()
      setArquivos(lista)
    } catch (e) {}
  }

  async function handleCalcularPreview(dados) {
    try {
      const result = await calcularPreview({ modulos: dados.modulos, inversores: dados.inversores, cidade: dados.cidade })
      setPreviewData(result)
      setExcelData(dados)
      setExcelBlob(null)
    } catch (e) {
      showToast('Erro ao calcular prévia', 'error')
    }
  }

  async function handleGerarPlanilha(dados) {
    try {
      showToast('Gerando planilha...')
      const blob = await gerarOrcamento(dados)
      const fileName = `SSM_${(dados.cliente || 'Cliente').replace(/\s+/g, '_')}_${dados.data || 'sem_data'}.xlsx`
      setExcelBlob(blob)
      setExcelFileName(fileName)
      showToast('Planilha gerada com sucesso!')
    } catch (e) {
      showToast('Erro ao gerar planilha', 'error')
    }
  }

  async function handleAdicionarFila(projeto) {
    setFila(prev => [...prev, projeto])
    showToast('Projeto adicionado à fila!')
  }

  async function handleGerarLote() {
    if (!fila.length) return showToast('A fila está vazia', 'error')
    try {
      const blob = await gerarLote(fila)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `LOTE_SSM_${Date.now()}.xlsx`
      a.click()
      setFila([])
      atualizarArquivos()
      showToast('Lote gerado com sucesso!')
    } catch (e) {
      showToast('Erro ao gerar lote', 'error')
    }
  }

  async function handleGerarPDF(dados) {
    try {
      const blob = await gerarPDF(dados)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ROMANEIO_${dados.cliente}.pdf`
      a.click()
    } catch (e) {
      showToast('Erro ao gerar PDF', 'error')
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Carregando sistema...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="bg-orbs">
        <div className="orb"></div>
        <div className="orb"></div>
        <div className="orb"></div>
      </div>
      <div className="bg-grid"></div>

      <nav className="navbar">
        <div className="nav-inner">
          <div className="brand">
            <div className="brand-mark">☀️</div>
            <div className="brand-text">
              <span className="brand-name">Sistema de <span className="accent">Separação</span> de Materiais</span>
              <span className="brand-version">v2.0</span>
            </div>
          </div>
          <div className="nav-tabs">
            <button className={`ntab ${aba === 'calc' ? 'active' : ''}`} onClick={() => setAba('calc')}>
              🧮 <span className="tab-label">Calculadora</span>
            </button>
            <button className={`ntab ${aba === 'relatorios' ? 'active' : ''}`} onClick={() => setAba('relatorios')}>
              📊 <span className="tab-label">Relatórios</span>
            </button>
            <button className={`ntab ${aba === 'config' ? 'active' : ''}`} onClick={() => setAba('config')}>
              ⚙️ <span className="tab-label">Configurações</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="app-content">
        {aba === 'calc' && (
          <div className="two-col">
            <Formulario
              db={db}
              onCalcular={handleCalcularPreview}
              onAdicionarFila={handleAdicionarFila}
              showToast={showToast}
            />
            <div className="sticky-r">
              <Fila fila={fila} setFila={setFila} onGerarLote={handleGerarLote} />
              <Preview
                data={previewData}
                excelBlob={excelBlob}
                excelFileName={excelFileName}
                formData={excelData}
                onGerarPDF={handleGerarPDF}
                onGerarPlanilha={handleGerarPlanilha}
              />
              <Arquivos arquivos={arquivos} onAtualizar={atualizarArquivos} onDeletar={deletarArquivo} />
            </div>
          </div>
        )}
        {aba === 'relatorios' && <Relatorios />}
        {aba === 'config' && <Configuracoes db={db} onSalvar={salvarBanco} showToast={showToast} />}
      </main>

      <Toast {...toast} />
    </div>
  )
}
