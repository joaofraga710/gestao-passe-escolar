import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação básica no cliente
    if (!username.trim() || !password.trim()) {
      setError('Usuário e senha são obrigatórios.');
      return;
    }
    
    if (username.length < 3) {
      setError('Usuário deve ter pelo menos 3 caracteres.');
      return;
    }
    
    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres.');
      return;
    }

    login(username, password).then((success) => {
      if (success) {
        navigate('/pendentes');
      } else {
        setError('Credenciais inválidas.');
      }
    });
  };

  return (
    <div className="login-container">
      <div className="login-box animate-slide-up">
        <div className="login-header">
          <div className="logo-icon animate-float"></div>
          <h1 className="animate-fade-in">Gestão de Carteirinhas</h1>
          <p className="animate-fade-in-delay"></p>
        </div>

        <form onSubmit={handleSubmit} className="login-form animate-fade-in-delay-2">
          <div className="input-group">
            <label>Usuário</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Digite seu usuário"
              autoFocus
            />
          </div>
          
          <div className="input-group">
            <label>Senha</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>

          {error && <div className="error-msg animate-shake">{error}</div>}

          <button type="submit" className="login-btn animate-pulse-hover">
            Entrar no Sistema
          </button>
        </form>
        
        <div className="login-footer">
          © 2026 Secretaria da Educação de Imbé
        </div>
      </div>
    </div>
  );
};

export default Login;