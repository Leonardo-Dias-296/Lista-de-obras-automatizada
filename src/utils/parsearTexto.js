export function parsearTextoColado(texto) {
  const resultado = {
    cliente: '',
    endereco: '',
    cidade: '',
    modulos: [],
    inversores: [],
    observacoes: '',
    estrutura: ''
  }

  if (!texto || !texto.trim()) return resultado

  const linhas = texto.split('\n').map(l => l.trim()).filter(l => l)

  let modulosQtd = 0
  let modulosPotencia = 0
  let inversorQtd = 0
  let inversorPotencia = 0
  const obsParts = []

  for (const linha of linhas) {
    const lower = linha.toLowerCase()

    // Detectar módulos: "09 módulos 610w", "9 painéis 550w", "12x 610w"
    const matchModulos = linha.match(/(\d+)\s*(?:módulos?|paineis?|modulos?|panels?)\s*(?:de\s*)?(\d+)\s*w/i)
    if (matchModulos) {
      modulosQtd = parseInt(matchModulos[1])
      modulosPotencia = parseInt(matchModulos[2])
      continue
    }

    // Detectar módulos: "9x610w", "9 x 610w"
    const matchModulosX = linha.match(/(\d+)\s*x\s*(\d+)\s*w/i)
    if (matchModulosX) {
      modulosQtd = parseInt(matchModulosX[1])
      modulosPotencia = parseInt(matchModulosX[2])
      continue
    }

    // Detectar inversor: "01 inv 7.5K", "2 inversores 10kw", "1x 5K"
    const matchInv = linha.match(/(\d+)\s*(?:inv(?:ersores?)?|inversor)\s*(?:de\s*)?(\d+(?:[.,]\d+)?)\s*k/i)
    if (matchInv) {
      inversorQtd = parseInt(matchInv[1])
      inversorPotencia = parseFloat(matchInv[2].replace(',', '.'))
      continue
    }

    const matchInvX = linha.match(/(\d+)\s*x\s*(\d+(?:[.,]\d+)?)\s*k/i)
    if (matchInvX) {
      inversorQtd = parseInt(matchInvX[1])
      inversorPotencia = parseFloat(matchInvX[2].replace(',', '.'))
      continue
    }

    // Detectar estrutura: "SSM", "PRATYC", "IBRAP", etc
    const estruturas = ['SSM', 'PRATYC', 'IBRAP', 'RENOVIGI', 'MINI TRILHO', 'OBRA DE SOLO']
    for (const est of estruturas) {
      if (lower.includes(est.toLowerCase())) {
        resultado.estrutura = est
        break
      }
    }

    // Detectar cidade: padrão "Cidade/UF"
    const matchCidade = linha.match(/(\w[\w\s]*?)\s*[-–]\s*(\w[\w\s]*?)\s*\/\s*([A-Z]{2})/i)
    if (matchCidade) {
      resultado.cidade = matchCidade[2].trim()
      continue
    }

    // Detectar endereço: Rua, Av, Trav, etc
    const matchEndereco = linha.match(/((?:Rua|Av|Avenida|Trav|Travessa|Al|Alameda|Rod|Rodovia|Estrada|R\.)[\s\S]*?)(?:\s*[-–]\s*Bairro|\s*[-–]\s*\d|\s*,\s*\d)/i)
    if (matchEndereco) {
      resultado.endereco = linha
      continue
    }

    // Detectar cliente: linhas com * ou que parecem nome (sem números de rua)
    if (linha.startsWith('*') && linha.endsWith('*')) {
      resultado.cliente = linha.replace(/\*/g, '').trim()
      continue
    }

    if (linha.startsWith('*')) {
      resultado.cliente = linha.replace(/\*/g, '').trim()
      continue
    }

    // Se a linha não tem números e não foi classificada, pode ser nome do cliente
    if (!resultado.cliente && !/\d/.test(linha) && linha.length > 3 && linha.length < 80) {
      resultado.cliente = linha
      continue
    }

    // Se chegou até aqui, é observação
    if (lower.includes('já') || lower.includes('separad') || lower.includes('atenção') ||
        lower.includes('obs') || lower.includes('nota') || lower.includes('levar') ||
        lower.includes('não') || lower.includes('sistema') || lower.includes('preto') ||
        lower.includes('branco') || linha.includes('–') || linha.includes('-')) {
      obsParts.push(linha)
    }
  }

  // Montar módulos
  if (modulosQtd > 0 && modulosPotencia > 0) {
    resultado.modulos = [{ potencia: modulosPotencia, qtd: modulosQtd }]
  }

  // Montar inversores
  if (inversorQtd > 0 && inversorPotencia > 0) {
    // Tentar encontrar o nome do inversor no DB baseado na potência
    resultado.inversores = [{ nome: `${inversorPotencia}K`, qtd: inversorQtd }]
  }

  // Observações juntas
  resultado.observacoes = obsParts.join(' ')

  return resultado
}
