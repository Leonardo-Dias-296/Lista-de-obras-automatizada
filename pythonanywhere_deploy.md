# Guia de Implantação (Deploy) - SSM Solar v2.0 na PythonAnywhere

Este guia ensina como colocar o seu sistema de automação no ar de forma **gratuita** utilizando a plataforma PythonAnywhere. Desta forma, você e sua equipe poderão acessar o sistema de qualquer lugar via celular ou outro computador, sem depender do seu computador local estar ligado.

## Passo 1: Criar sua Conta

1. Acesse o site oficial: [https://www.pythonanywhere.com/](https://www.pythonanywhere.com/)
2. Clique em **Pricing & signup**.
3. Selecione a opção **Create a Beginner account (Free)**.
4. Preencha seus dados de cadastro (username, e-mail e senha). **Atenção:** seu username fará parte do link de acesso (ex: `http://seu_nome.pythonanywhere.com`).

---

## Passo 2: Fazer o Upload dos Arquivos

1. Após fazer o login, clique na no menu **Files** (no topo à direita).
2. Na lista de diretórios (à esquerda), certifique-se de estar na pasta `/home/seu_usuario/` ou crie um diretório novo chamado `ssmsolar`. Para este guia, assumiremos a pasta `/home/seu_usuario/mysite/` (que é padrão).
3. Faça o upload dos seguintes arquivos usando o botão amarelo **Upload a file**:
   * `server.py`
   * `index.html`
   * `database.json`
   * `history.json` (se quiser manter o histórico anterior, caso contrário o sistema cria um vazio automaticamente)
   * `requirements.txt`
   * `modelo.xlsx`

*Dica:* É possível zipar todos os arquivos, fazer o upload do arquivo .zip, e então usar a aba de "Consoles" para descompactar (`unzip arquivo.zip`).

---

## Passo 3: Configurar o Ambiente Virtual (Dependências)

1. Vá para a seção **Consoles** (no menu principal).
2. Clique em **Bash** (abre uma tela preta tipo terminal).
3. Crie um ambiente virtual executando:
   ```bash
   mkvirtualenv --python=/usr/bin/python3.10 ssm-env
   ```
4. Navegue até a pasta onde estão seus arquivos:
   ```bash
   cd ~/mysite
   ```
5. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

---

## Passo 4: Configurar a Web App

1. Vá para a seção **Web** no menu principal.
2. Clique no botão azul **Add a new web app**.
3. A tela vai informar que seu link será `seu_nome.pythonanywhere.com`. Clique em **Next**.
4. No passo da linguagem, escolha **Manual configuration (including virtualenvs)**.
5. Selecione a versão do **Python (ex: 3.10)** que você usou no Passo 3. Clique em Next para finalizar o assistente inicial.

### Ajustando os Vínculos Finais (na mesma tela 'Web')

Role a página para baixo e preencha as seguintes opções:

*   **Source code**: `/home/seu_usuario/mysite`
*   **Working directory**: `/home/seu_usuario/mysite`
*   **Virtualenv**: `/home/seu_usuario/.virtualenvs/ssm-env` (Basta digitar `ssm-env` e confirmar)

Na seção **Code**, clique em cima do link azul que diz: `/var/www/seu_nome_pythonanywhere_com_wsgi.py`. Isso abrirá um editor de texto. Delete **TUDO** que estiver lá dentro e substitua pelo seguinte código:

```python
import sys
import os

# Caminho para sua pasta onde está o server.py
path = '/home/seu_usuario/mysite'
if path not in sys.path:
    sys.path.append(path)

# Define o FLASK_ENV como production, que agora é lidado no server.py
os.environ["FLASK_ENV"] = "production"

# Importa o app do seu projeto (assumindo que seja server.py)
from server import app as application
```
*(Não esqueça de trocar `seu_usuario` pelo seu username real de cadastro)*

Salve o arquivo clicando em **Save** no topo direito.

---

## Passo 5: Iniciar o Sistema!

1. Volte para a seção **Web**.
2. Clique no grande botão verde **Reload seu_nome.pythonanywhere.com**.
3. Abra uma nova aba no seu navegador e digite o endereço final: `http://seu_nome.pythonanywhere.com`.

**Pronto!** O SSM Solar v2.0 agora está na nuvem. Você já pode enviar esse link para a sua equipe começar a usar online!

> [!TIP]
> Qualquer arquivo Excel ou PDF gerado ficará salvo na pasta `saidas` dentro da plataforma da PythonAnywhere (`/home/seu_usuario/mysite/saidas`). O botão de baixar (dentro da interface do sistema) funciona normalmente para enviar os arquivos pro seu computador/celular.
