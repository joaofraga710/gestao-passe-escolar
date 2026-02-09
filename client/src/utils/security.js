export const generateCSRFToken = () => {
  const token = sessionStorage.getItem('csrf_token');
  if (token) return token;
  
  const newToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  sessionStorage.setItem('csrf_token', newToken);
  return newToken;
};

export const getCSRFToken = () => {
  return sessionStorage.getItem('csrf_token') || generateCSRFToken();
};

export const sanitizeHTML = (str) => {
  if (typeof str !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

export const getSecureHeaders = (token) => {
  return {
    'Content-Type': 'application/json',
    'X-CSRF-Token': getCSRFToken(),
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};
