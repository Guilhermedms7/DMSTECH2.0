# DMSTECH 2.0 — Loja de Tecnologia

Aplicação full stack de demonstração para uma loja de produtos gamer e tecnologia. Reúne catálogo, busca, categorias, ofertas, detalhes de produtos e carrinho.

## Funcionalidades

- Navegação por categorias de produtos
- Busca por nome, descrição ou marca
- Seções de produtos em destaque e em oferta
- Página de detalhes com preço e especificações
- Adição e remoção de itens do carrinho

O carrinho usa um usuário de demonstração. A finalização de compra aparece na interface, mas ainda não processa pagamentos.

## Tecnologias

- **Frontend:** React, Axios e Tailwind CSS
- **Backend:** Python, FastAPI e Motor
- **Banco de dados:** MongoDB

## Estrutura

- `frontend/` — aplicação React
- `backend/server.py` — API e modelos de dados
- `backend/requirements.txt` — dependências Python
- `backend_test.py` — verificações da API

## Executar localmente

Requisitos: Python, Node.js, Yarn e MongoDB.

### 1. Configure o MongoDB

Crie `backend/.env`:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=dmstech
```

### 2. Inicie a API

Na raiz do repositório:

```bash
cd backend
python -m venv .venv
```

Ative o ambiente virtual. No Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

No macOS ou Linux:

```bash
source .venv/bin/activate
```

Instale as dependências e inicie o servidor:

```bash
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

A documentação interativa da API ficará disponível em [http://localhost:8000/docs](http://localhost:8000/docs).

### 3. Inicie a interface

Em outro terminal, crie `frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

Depois instale as dependências e inicie a aplicação:

```bash
cd frontend
yarn install
yarn start
```

O React ficará disponível em [http://localhost:3000](http://localhost:3000).