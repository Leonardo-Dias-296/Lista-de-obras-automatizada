# Lista de Obras Automatizada

Sistema de automação de separação de materiais para instalações solares fotovoltaicas.

## Funcionalidades

- Cálculo automático de materiais por módulo e inversor
- Geração de planilhas Excel (.xlsx)
- Geração de romaneios em PDF
- Fila de impressão em lote
- Gerenciamento de inversores e cidades
- Relatórios e estatísticas

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Python (Flask)
- **Deploy:** Vercel

## Como rodar localmente

```bash
# Instalar dependências
npm install
cd api && pip install -r requirements.txt

# Rodar frontend
npm run dev

# Rodar backend (em outro terminal)
cd api && python app.py
```

## Deploy

```bash
vercel --prod
```
