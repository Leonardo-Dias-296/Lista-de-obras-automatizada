import React from 'react'

export default function Toast({ show, msg, tipo }) {
  return (
    <div id="toast" className={`toast ${show ? 'show' : ''} ${tipo}`}>
      <span className="toast-icon">{tipo === 'success' ? '✓' : '✕'}</span>
      <span className="toast-msg">{msg}</span>
      <div className="toast-progress"></div>
    </div>
  )
}
