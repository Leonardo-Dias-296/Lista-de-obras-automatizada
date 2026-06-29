import { useState, useEffect } from 'react'

const API_BASE = '/api'

export function useAPI() {
  const [db, setDb] = useState({ inversores: {}, cidades: {}, itensFixos: [], produtos: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarConfig()
  }, [])

  async function carregarConfig() {
    try {
      setLoading(true)
      const r = await fetch(`${API_BASE}/config`)
      const data = await r.json()
      setDb(data)
    } catch (e) {
      console.error('Erro ao carregar config:', e)
    } finally {
      setLoading(false)
    }
  }

  async function gerarOrcamento(dados) {
    const r = await fetch(`${API_BASE}/gerar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
    if (!r.ok) throw new Error('Erro ao gerar orçamento')
    return r.blob()
  }

  async function gerarLote(lista) {
    const r = await fetch(`${API_BASE}/gerar_lote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lista)
    })
    if (!r.ok) throw new Error('Erro ao gerar lote')
    return r.blob()
  }

  async function calcularPreview(dados) {
    const r = await fetch(`${API_BASE}/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
    return r.json()
  }

  async function gerarPDF(dados) {
    const r = await fetch(`${API_BASE}/gerar_pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
    if (!r.ok) throw new Error('Erro ao gerar PDF')
    return r.blob()
  }

  async function salvarBanco(novoDb) {
    const r = await fetch(`${API_BASE}/banco`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoDb)
    })
    if (!r.ok) throw new Error('Erro ao salvar')
    setDb(novoDb)
    return r.json()
  }

  async function listarArquivos() {
    const r = await fetch(`${API_BASE}/arquivos`)
    return r.json()
  }

  async function deletarArquivo(nome) {
    const r = await fetch(`${API_BASE}/arquivos/${encodeURIComponent(nome)}`, {
      method: 'DELETE'
    })
    return r.json()
  }

  return {
    db,
    loading,
    carregarConfig,
    gerarOrcamento,
    gerarLote,
    calcularPreview,
    gerarPDF,
    salvarBanco,
    listarArquivos,
    deletarArquivo
  }
}
