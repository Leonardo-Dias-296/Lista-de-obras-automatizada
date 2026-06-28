import React, { useState } from 'react'
import { parsearTextoColado } from '../utils/parsearTexto'

export default function PasteInfo({ onAplicar, showToast }) {
  const [aberto, setAberto] = useState(false)
  const [texto, setTexto] = useState('')
  const [preview, setPreview] = useState(null)

  function handleColar(e) {
    const t = e.target.value
    setTexto(t)
    if (t.trim().length > 10) {
      setPreview(parsearTextoColado(t))
    } else {
      setPreview(null)
    }
  }

  function handleAplicar() {
    if (!preview) return showToast('Cole o texto primeiro', 'error')
    onAplicar(preview)
    setTexto('')
    setPreview(null)
    setAberto(false)
    showToast('Informações preenchidas automaticamente!', 'success')
  }

  function temDado(dado) {
    if (Array.isArray(dado)) return dado.length > 0 && (dado[0].qtd > 0 || dado[0].potencia > 0)
    return !!dado
  }

  return (
    <>
      <button type="button" className="btn btn-ghost" style={{ marginBottom: '14px', color: 'var(--gold)', borderColor: 'rgba(245,158,11,0.3)', background: 'var(--goldGlow)' }} onClick={() => setAberto(true)}>
        📋 Colar Informações do WhatsApp
      </button>

      {aberto && (
        <div className="modal-back open">
          <div className="modal-box" style={{ maxWidth: '600px' }}>
            <div className="modal-head">
              <h3>📋 Colar Informações</h3>
              <button className="btn-close" onClick={() => { setAberto(false); setTexto(''); setPreview(null) }}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '12px' }}>
                Cole a mensagem do WhatsApp. O sistema detecta automaticamente:<br />
                <strong>Equipe</strong> (1ª linha) → <strong>Cliente</strong> (antes da vírgula) → <strong>Cidade</strong> → <strong>Módulos</strong> → <strong>Inversor</strong>
              </p>

              <div className="field">
                <textarea
                  value={texto}
                  onChange={handleColar}
                  placeholder={`*Renato (kit no local)*\nZeno da Silva Delgau, Rua Araguaia, 1200 - Bairro Igara – Canoas/RS\nSistema de 09 módulos 610w + 01 inv 7.5K – MÓDULOS JÁ SEPARADOS`}
                  rows={8}
                  style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '13px' }}
                />
              </div>

              {preview && (
                <div style={{ marginTop: '16px' }}>
                  <div className="sec-div"><div className="sec-div-line"></div><span className="sec-div-lbl">Prévia do que será preenchido</span><div className="sec-div-line"></div></div>

                  <div style={{ display: 'grid', gap: '8px' }}>
                    {temDado(preview.equipe) && (
                      <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.07)', borderRadius: '10px', border: '1px solid rgba(248,113,113,0.2)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Equipe</span>
                        <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>{preview.equipe}</div>
                      </div>
                    )}
                    {temDado(preview.cliente) && (
                      <div style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.07)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Cliente</span>
                        <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>{preview.cliente}</div>
                      </div>
                    )}
                    {temDado(preview.cidade) && (
                      <div style={{ padding: '10px 14px', background: 'rgba(56,189,248,0.07)', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.2)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Cidade</span>
                        <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>{preview.cidade}</div>
                      </div>
                    )}
                    {temDado(preview.modulos) && (
                      <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.07)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Módulos</span>
                        <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>{preview.modulos[0].qtd}x {preview.modulos[0].potencia}W</div>
                      </div>
                    )}
                    {temDado(preview.inversores) && (
                      <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.07)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Inversor</span>
                        <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>{preview.inversores[0].qtd}x {preview.inversores[0].nome}</div>
                      </div>
                    )}
                    {temDado(preview.observacoes) && (
                      <div style={{ padding: '10px 14px', background: 'rgba(148,163,184,0.07)', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.2)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Observações</span>
                        <div style={{ fontSize: '13px', marginTop: '2px' }}>{preview.observacoes}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => { setAberto(false); setTexto(''); setPreview(null) }}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleAplicar} disabled={!preview}>✅ Aplicar ao Formulário</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
