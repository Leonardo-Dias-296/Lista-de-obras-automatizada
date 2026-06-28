export function parsearTextoColado(texto) {
  const resultado = {
    equipe: '',
    cliente: '',
    cidade: '',
    modulos: [],
    inversores: [],
    observacoes: ''
  }

  if (!texto || !texto.trim()) return resultado

  const linhas = texto.split('\n').map(l => l.trim()).filter(l => l)
  const textoCompleto = linhas.join(' ')

  // 1. Detectar módulos: "09 módulos 610w", "9x 610w", "9 painéis 550w"
  const matchModulos = textoCompleto.match(/(\d+)\s*(?:módulos?|paineis?|modulos?|panels?)\s*(?:de\s*)?(\d+)\s*w/i)
    || textoCompleto.match(/(\d+)\s*x\s*(\d+)\s*w/i)
  if (matchModulos) {
    resultado.modulos = [{ qtd: parseInt(matchModulos[1]), potencia: parseInt(matchModulos[2]) }]
  }

  // 2. Detectar inversor: "01 inv 7.5K", "1 inv 10kw", "2x 5k"
  const matchInv = textoCompleto.match(/(\d+)\s*(?:inv(?:ersores?)?|inversor)\s*(?:de\s*)?(\d+(?:[.,]\d+)?)\s*k/i)
    || textoCompleto.match(/(\d+)\s*x\s*(\d+(?:[.,]\d+)?)\s*k/i)
  if (matchInv) {
    const qtd = parseInt(matchInv[1])
    const potencia = parseFloat(matchInv[2].replace(',', '.'))
    resultado.inversores = [{ qtd, nome: `${potencia}K` }]
  }

  // 3. Detectar cidade: "Cidade/RS" ou "– Cidade/RS" ou "- Cidade/RS"
  const matchCidade = textoCompleto.match(/[-–]\s*(\w[\w\s]*?)\s*\/\s*([A-Z]{2})/i)
  if (matchCidade) {
    resultado.cidade = matchCidade[1].trim()
  }

  // 4. Identificar equipe: primeira linha (geralmente entre asteriscos ou com parênteses)
  const primeiraLinha = linhas[0] || ''
  if (primeiraLinha.includes('(') && primeiraLinha.includes(')')) {
    resultado.equipe = primeiraLinha.replace(/\*/g, '').trim()
  } else if (primeiraLinha.startsWith('*')) {
    resultado.equipe = primeiraLinha.replace(/\*/g, '').trim()
  }

  // 5. Identificar cliente: linha que começa com nome antes da primeira vírgula
  for (const linha of linhas) {
    // Pular linha de equipe (já processada)
    if (linha === primeiraLinha) continue

    // Pular linha de sistema/módulos
    if (/módulos?|paineis?|inv|sistema/i.test(linha)) continue

    // Pular linha de observações
    if (/SEPARAD|ATENÇÃO|OBS|NOTA/i.test(linha) && linha.length > 50) continue

    // Se tem vírgula, o cliente é tudo antes da primeira vírgula
    if (linha.includes(',')) {
      const antesVirgula = linha.split(',')[0].trim()
      if (antesVirgula.length > 2 && !/^\d/.test(antesVirgula)) {
        resultado.cliente = antesVirgula
        break
      }
    }

    // Se não tem vírgula e parece nome (sem números e não é cidade)
    if (!/\d/.test(linha) && !/\/[A-Z]{2}/.test(linha) && linha.length > 3 && linha.length < 60) {
      // Pular linhas que são só observações
      if (!/SEPARAD|JÁ|SISTEMA|MÓDULO/i.test(linha)) {
        resultado.cliente = linha
        break
      }
    }
  }

  // 6. Observações: tudo que sobrou e parece relevante
  const obsParts = []
  for (const linha of linhas) {
    if (linha === primeiraLinha) continue
    if (/módulos?|paineis?/i.test(linha) && /\d+\s*w/i.test(linha)) continue
    if (/inv|inversor/i.test(linha) && /\d+\s*k/i.test(linha)) continue
    if (linha === resultado.cliente) continue
    if (linha.includes(',') && linha.split(',')[0].trim() === resultado.cliente) continue

    if (/SEPARAD|JÁ|PRETO|BRANCO|ATENÇÃO|OBS|SISTEMA|kit|local/i.test(linha)) {
      obsParts.push(linha)
    }
  }
  resultado.observacoes = obsParts.join(' ')

  return resultado
}
