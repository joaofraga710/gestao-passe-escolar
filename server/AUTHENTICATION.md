# Como Criar Logins Seguramente

## 1️⃣ Iniciando o Backend

```bash
cd server
npm install
npm run dev
```

O servidor rodará em `http://localhost:3000`

## 2️⃣ Endpoints de Autenticação

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "name": "Administrador"
  }
}
```

### Registrar Novo Usuário
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "novo_usuario",
  "password": "senha123",
  "name": "Nome do Usuário",
  "role": "user"
}
```

### Logout
```bash
POST /api/auth/logout
Authorization: Bearer {seu_token_jwt}
```

## 3️⃣ Credenciais de Teste

**Padrão no banco de dados:**
- Username: `admin`
- Password: `admin123`

## 4️⃣ Fluxo no Frontend

1. Usuário entra username/password
2. Frontend envia POST para `/api/auth/login`
3. Backend valida e retorna JWT token
4. Frontend armazena token em sessionStorage
5. Próximas requisições incluem: `Authorization: Bearer {token}`
6. Backend valida token antes de processar requisição

## 5️⃣ Adicionar Novo Usuário

Use o endpoint `/api/auth/register`:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "maria",
    "password": "senha456",
    "name": "Maria Silva",
    "role": "user"
  }'
```

## 🔒 Segurança Implementada

✅ JWT Token com expiração (1h)
✅ Senha com hash bcrypt (10 rounds)
✅ Rate limiting (máx 5 tentativas em 15 min)
✅ CORS configurado
✅ Headers de segurança HTTP
✅ Validação de inputs
✅ Mensagens de erro genéricas (não revelam existência de usuários)

## ⚙️ Configuração

Edite `.env` para ajustar:
```
JWT_SECRET=sua_chave_muito_segura_32_caracteres
JWT_EXPIRE=1h
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

**IMPORTANTE:** Gere um `JWT_SECRET` seguro!
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🚀 Próximas Melhorias

- [ ] Banco de dados persistente (SQLite/PostgreSQL)
- [ ] Refresh tokens
- [ ] 2FA (Two-Factor Authentication)
- [ ] Auditoria de logins
- [ ] Recuperação de senha
- [ ] Roles e permissões detalhadas
