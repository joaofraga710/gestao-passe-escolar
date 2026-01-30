import bcryptjs from 'bcryptjs';

// Banco de dados em memória (substitua por SQLite, PostgreSQL, etc.)
// Para desenvolvimento rápido, usaremos array em memória
// Em produção, use um banco de dados real!

let users = [];

// Inicializar usuários padrão
const initializeUsers = async () => {
  if (users.length === 0) {
    const adminHash = await bcryptjs.hash('admin123', 10);
    users = [
      {
        id: 1,
        username: 'admin',
        password_hash: adminHash,
        name: 'Administrador',
        role: 'admin',
        created_at: new Date()
      }
    ];
  }
};

// Inicializar ao carregar o módulo
await initializeUsers();

export const getUser = async (username) => {
  return users.find(u => u.username === username);
};

export const getUserById = async (id) => {
  return users.find(u => u.id === id);
};

export const createUser = async (userData) => {
  const newUser = {
    id: users.length + 1,
    ...userData,
    created_at: new Date()
  };
  users.push(newUser);
  return newUser;
};

export const updateUser = async (id, userData) => {
  const user = users.find(u => u.id === id);
  if (!user) return null;
  
  Object.assign(user, userData);
  return user;
};

export const deleteUser = async (id) => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;
  
  users.splice(index, 1);
  return true;
};

export const getAllUsers = async () => {
  return users;
};
