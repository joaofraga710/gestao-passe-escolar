/**
 * Utilidades de segurança
 */

// Gera um token CSRF simples (deve ser validado no backend)
export const generateCSRFToken = () => {
  const token = sessionStorage.getItem('csrf_token');
  if (token) return token;
  
  const newToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  sessionStorage.setItem('csrf_token', newToken);
  return newToken;
};

// Obtém o token CSRF armazenado
export const getCSRFToken = () => {
  return sessionStorage.getItem('csrf_token') || generateCSRFToken();
};

// Sanitiza strings para prevenir XSS
export const sanitizeHTML = (str) => {
  if (typeof str !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

// Headers padrão com CSRF token para requisições
export const getSecureHeaders = (token) => {
  return {
    'Content-Type': 'application/json',
    'X-CSRF-Token': getCSRFToken(),
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};
