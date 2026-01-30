import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Apenas recupera token de sessionStorage (mais seguro que localStorage)
    const storedToken = sessionStorage.getItem('school_token');
    if (storedToken) {
      setToken(storedToken);
      // Valida token no backend (implementar conforme necessário)
      setUser({ role: 'admin' }); // Placeholder - obter do backend
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      console.log('API URL:', apiUrl);
      console.log('Tentando login com:', username);
      
      // IMPORTANTE: Implementar endpoint de autenticação no backend
      // O backend deve validar credenciais e retornar um JWT token
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Para cookies com SameSite
        body: JSON.stringify({ username, password })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro do servidor:', errorData);
        return false;
      }

      const data = await response.json();
      console.log('Login bem-sucedido!', data);
      
      // Armazena token em sessionStorage (não localStorage)
      sessionStorage.setItem('school_token', data.token);
      setToken(data.token);
      setUser(data.user);
      
      return true;
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('school_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, token }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);