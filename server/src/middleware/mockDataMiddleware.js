/**
 * Middleware para usar dados mock em testes locais
 * Ativado apenas com USE_MOCK_DATA=true no .env
 */

import { mockStudents } from '../db/mockStudents.js';

export const mockDataMiddleware = (req, res, next) => {
  // Só intercepta se USE_MOCK_DATA estiver ativado
  if (process.env.USE_MOCK_DATA !== 'true') {
    return next();
  }

  // Intercepta apenas a rota de estudantes
  if (req.path === '/api/students' && req.method === 'GET') {
    console.log('📋 Usando dados de exemplo (mock)');
    return res.json(mockStudents);
  }

  next();
};
