# Checklist de Segurança - School Transport System

## ✅ Corrigido (Frontend)

- [x] Removidas credenciais hardcoded do código
- [x] Migrado de localStorage para sessionStorage
- [x] Adicionado suporte para JWT token via backend
- [x] Validação de entrada no form de login
- [x] Criado sistema básico de proteção CSRF
- [x] Criado arquivo de utilidades de segurança
- [x] Arquivo `.env.example` para configuração segura

## ⚠️ Crítico - Implementar no Backend

### Autenticação & Autorização
- [ ] Endpoint `/auth/login` que valida credenciais
- [ ] Geração de JWT token com expiração (ex: 1 hora)
- [ ] Refresh token para renovar sessão
- [ ] Hash seguro de senhas (bcrypt, argon2)
- [ ] Rate limiting no endpoint de login (máx 5 tentativas em 15 min)
- [ ] CSRF token validation em todas as requisições POST

### Comunicação
- [ ] HTTPS/TLS obrigatório (use certificados SSL válidos)
- [ ] Headers de segurança:
  ```
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'self'
  X-XSS-Protection: 1; mode=block
  ```

### Cookies (se usado)
- [ ] Flag `HttpOnly` (não acessível por JavaScript)
- [ ] Flag `Secure` (apenas HTTPS)
- [ ] Flag `SameSite=Strict` (previne CSRF)
- [ ] Path restrito: `Path=/api`
- [ ] Expiração apropriada

### Validação & Sanitização
- [ ] Validar todos os inputs no backend
- [ ] Sanitizar saídas HTML
- [ ] Validar tipos de dados esperados
- [ ] Limitar tamanho de payloads

### Base de Dados
- [ ] Credenciais em variáveis de ambiente
- [ ] Usar prepared statements (evita SQL injection)
- [ ] Encryption de dados sensíveis
- [ ] Logs de auditoria para ações críticas

## 🔄 Próximos Passos (Frontend)

1. Atualizar `AuthContext.jsx` para usar novo endpoint de backend
2. Implementar refresh token automaticamente
3. Adicionar tratamento de erros detalhado
4. Implementar logout automático por timeout
5. Adicionar 2FA (autenticação de dois fatores) - futuro

## 📋 Testes de Segurança

- [ ] Testar force brute no login
- [ ] Testar XSS payload: `<img src=x onerror=alert(1)>`
- [ ] Testar CSRF sem token válido
- [ ] Testar acesso direto a rotas protegidas
- [ ] Verificar exposição de dados sensíveis no console/network
