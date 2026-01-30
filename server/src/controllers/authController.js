import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { getUser, createUser } from '../db/users.js';

/**
 * POST /api/auth/login
 * Autentica usuário e retorna JWT token
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validação básica
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    // Buscar usuário no banco
    const user = await getUser(username);
    
    if (!user) {
      // Não revelar se usuário existe ou não (por segurança)
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha com bcrypt
    const passwordMatch = await bcryptjs.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1h' }
    );

    // Retornar token (não retornar dados sensíveis)
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro na autenticação' });
  }
};

/**
 * POST /api/auth/register
 * Cria novo usuário (apenas admin pode fazer isso)
 */
export const register = async (req, res) => {
  try {
    const { username, password, name, role = 'user' } = req.body;

    // Validações
    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    // Verificar se usuário já existe
    const existing = await getUser(username);
    if (existing) {
      return res.status(409).json({ error: 'Usuário já existe' });
    }

    // Hash da senha
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Criar novo usuário
    const newUser = await createUser({
      username,
      password_hash: hashedPassword,
      name,
      role
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

/**
 * POST /api/auth/logout
 * Logout (frontend remove token)
 */
export const logout = (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
};
