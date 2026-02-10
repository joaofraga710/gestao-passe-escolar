import express from 'express';
import { getStudents, getStudent, addStudent, editStudent, approveStudentCard, issueStudentCard, getIssuedIds, getIssuedPaged } from '../controllers/studentsController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas de estudantes requerem autenticação
router.use(verifyToken);

// Listar estudantes
router.get('/', getStudents);

// Obter IDs de estudantes emitidos
router.get('/issued', getIssuedIds);

// Obter estudantes emitidos com paginação
router.get('/issued/paged', getIssuedPaged);

// Buscar estudante específico
router.get('/:id', getStudent);

// Criar novo estudante
router.post('/', addStudent);

// Atualizar estudante
router.put('/:id', editStudent);

// Aprovar carteirinha
router.post('/:id/approve', approveStudentCard);

// Marcar como emitida
router.post('/:id/issue', issueStudentCard);

export default router;
