# School Transport System 

Sistema de gestão de carteirinhas escolares com autenticação segura.

## Estrutura do Projeto

```
school-transport-system/
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/           # Rotas da API
│   │   ├── controllers/       # Lógica de negócio
│   │   ├── middleware/        # Autenticação, erros, etc
│   │   ├── db/                # Base de dados
│   │   └── server.js          # Servidor principal
│   ├── package.json
│   └── .env                   # Variáveis de ambiente
│
├── docs/                      # Documentação
├── scripts/                   # Scripts úteis
└── SECURITY_CHECKLIST.md      # Checklist de segurança
```

## Começar Rápido

### Backend

```bash
cd server
npm install
npm run dev
```

Servidor rodará em: `http://localhost:3000`

### Frontend

```bash
cd client
npm install
npm run dev
```

Aplicação rodará em: `http://localhost:5173`

## Login Padrão

- **Usuário:** `admin`
- **Senha:** `admin123`

> Altere essas credenciais em produção!

## Documentação

- [Autenticação](./server/AUTHENTICATION.md) - Fluxo de login e criação de usuários
- [Checklist de Segurança](./SECURITY_CHECKLIST.md) - Itens críticos para produção
- [API Documentation](./docs/API_Documentation.md) - Endpoints da API

## Tecnologias

**Frontend:**
- React 19
- Vite
- React Router
- CSS3

**Backend:**
- Node.js
- Express
- JWT (JSON Web Tokens)
- bcryptjs (Hash de senhas)
- express-rate-limit (Rate limiting)

## 📝 Variáveis de Ambiente

### Server (.env)
```
PORT=3000
NODE_ENV=development
JWT_SECRET=sua_chave_muito_segura
JWT_EXPIRE=1h
CORS_ORIGIN=http://localhost:5173
```

### Client (.env.local)
```
VITE_API_URL=http://localhost:3000
```

## Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feature/MinhaFeature`
2. Commit suas mudanças: `git commit -m 'Add MinhaFeature'`
3. Push para a branch: `git push origin feature/MinhaFeature`
4. Abra um Pull Request

## Licença

MIT

## 📧 Contato

Secretaria da Educação de Imbé - 2026
