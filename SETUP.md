# Setup do Projeto

## Configuração do Backend

### 1. Instalar dependências do backend
```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com:
```
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_anonima_do_supabase
PORT=3001
```

### 3. Executar o servidor
```bash
npm start
# ou para desenvolvimento
npm run dev
```

## Configuração do Frontend

### 1. Instalar dependências do frontend
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com:
```
REACT_APP_API_URL=http://localhost:3001/api/auth
```

### 3. Executar o frontend
```bash
npm start
```

## Endpoints da API

- `POST /api/auth/signup` - Criar nova conta
- `POST /api/auth/signin` - Fazer login
- `GET /api/auth/user` - Obter dados do usuário (requer token)

## Componentes

- `pages/Login.js` - Componente de login
- `pages/Register.js` - Componente de registro
- `service/api.js` - Serviço de API para comunicação com o backend
