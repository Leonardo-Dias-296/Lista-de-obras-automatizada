import math
import unicodedata
import json
import os
import urllib.request
import urllib.error

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

REDIS_URL = os.environ.get('REDIS_URL', '')
KV_URL = os.environ.get('KV_REST_API_URL', '')
KV_TOKEN = os.environ.get('KV_REST_API_TOKEN', '')
KV_KEY = 'lista-database'

if not KV_URL and REDIS_URL:
    import re
    match = re.match(r'redis://default:(.+?)@(.+?):\d+', REDIS_URL)
    if match:
        KV_TOKEN = match.group(1)
        KV_URL = f"https://{match.group(2)}"

def normalize_name(name):
    if not name:
        return ""
    name = str(name).strip().lower()
    name = "".join(
        c for c in unicodedata.normalize('NFD', name)
        if unicodedata.category(c) != 'Mn'
    )
    return "".join(c for c in name if c.isalnum())

def calcular_terra(m):
    valor = math.floor(m / 2) + 2
    if valor % 2 != 0:
        valor -= 1
    if valor >= m:
        valor = m - 1
        if valor % 2 != 0:
            valor -= 1
    return valor

REGRAS_MODULO = {
    "Perfil":                               lambda m: m,
    "Emenda Barra":                         lambda m: math.ceil((m + 2) / 2) * 2,
    "Emenda Placa":                         lambda m: (2 * m) + 8,
    "Canto / Final":                        lambda m: math.ceil((m / 2) * 4 + 4),
    "Terra":                                calcular_terra,
    "Conjunto PE em L PRISIONEIRO":         lambda m: (2 * m) + 8,
    "Placa propaganda P":                   lambda m: 1 if m < 30 else 0,
    "Placa propaganda G":                   lambda m: 1 if m >= 30 else 0,
}

def _find_db_path():
    candidates = [
        os.path.join(BASE_DIR, 'database.json'),
        os.path.join(BASE_DIR, '..', 'database.json'),
        os.path.join(os.getcwd(), 'database.json'),
        '/var/task/database.json',
    ]
    for p in candidates:
        if os.path.exists(p):
            return os.path.abspath(p)
    return os.path.abspath(os.path.join(BASE_DIR, 'database.json'))

_db_path = None

def _get_db_path():
    global _db_path
    if _db_path is None:
        _db_path = _find_db_path()
    return _db_path

DEFAULT_DB = {"cidades": {}, "estruturas": {}, "inversores": {}, "produtos": {}, "itensFixos": []}

def _kv_request(method, path, body=None):
    if not KV_URL or not KV_TOKEN:
        return None
    url = f"{KV_URL}/{path}"
    data = json.dumps(body).encode('utf-8') if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header('Authorization', f'Bearer {KV_TOKEN}')
    if body:
        req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception:
        return None

def load_db():
    if KV_URL and KV_TOKEN:
        result = _kv_request('GET', f'get/{KV_KEY}')
        if result and result.get('result'):
            val = result['result']
            if isinstance(val, str):
                return json.loads(val)
            return val
    path = _get_db_path()
    if not os.path.exists(path):
        return DEFAULT_DB.copy()
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_db(data):
    if KV_URL and KV_TOKEN:
        body = {'key': KV_KEY, 'value': json.dumps(data, ensure_ascii=False)}
        result = _kv_request('POST', 'set', body)
        if result and result.get('result') == 'OK':
            return
    path = _get_db_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def calcular_quantidades(modulos_lista, inversores, cidade_nome, db):
    quantidades = {}

    total_modulos = sum(int(m.get('qtd', 0)) for m in modulos_lista) if isinstance(modulos_lista, list) else int(modulos_lista)

    for nome, regra in REGRAS_MODULO.items():
        qtd = regra(total_modulos)
        if qtd > 0:
            quantidades[nome] = qtd

    for inv in inversores:
        inv_nome = inv.get('nome', '').strip()
        inv_qtd = int(inv.get('qtd', 1))
        if inv_nome in db.get('inversores', {}):
            for item in db['inversores'][inv_nome].get('materiais', []):
                nome = item.get('nome')
                cod  = item.get('codigo')
                qtd  = item.get('qtd', 1) * inv_qtd
                if cod:
                    quantidades[f"[{cod}] {nome}"] = quantidades.get(f"[{cod}] {nome}", 0) + qtd
                else:
                    quantidades[nome] = quantidades.get(nome, 0) + qtd

    for item in db.get('itensFixos', []):
        nome = item['nome']
        qtd  = item['qtd']
        quantidades[nome] = quantidades.get(nome, 0) + qtd

    if cidade_nome in db.get('cidades', {}):
        for item in db['cidades'][cidade_nome].get('naoadicionar', []):
            nome = item['nome']
            if nome in quantidades:
                del quantidades[nome]

    total_micro = 0
    for inv in inversores:
        if "micro" in inv.get('nome', '').lower():
            total_micro += int(inv.get('qtd', 1))

    if total_micro > 0:
        qtd_mc4 = (8 * total_micro) + 8
    else:
        if total_modulos <= 20:
            qtd_mc4 = total_modulos - 2
        elif total_modulos <= 50:
            qtd_mc4 = total_modulos - 10
        elif total_modulos <= 100:
            qtd_mc4 = total_modulos - 20
        else:
            qtd_mc4 = total_modulos - 30
        if qtd_mc4 < 0:
            qtd_mc4 = 0

    if qtd_mc4 > 0:
        quantidades['Conector MC4'] = qtd_mc4

    return quantidades
