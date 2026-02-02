import { getAllStudents, getStudentById, createStudent, updateStudent, approveStudent } from '../db/students.js';
import { markAsIssued, getIssuedStudentIds } from '../db/supabaseStudents.js';

/**
 * GET /api/students
 * Retorna todos os estudantes da planilha Google Sheets
 */
export const getStudents = async (req, res) => {
  try {
    const googleSheetsUrl = process.env.GOOGLE_SHEETS_URL;
    
    if (!googleSheetsUrl) {
      return res.status(500).json({ error: 'URL da planilha não configurada' });
    }

    // Buscar dados da planilha do Google
    const response = await fetch(googleSheetsUrl);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Retornar os dados da planilha diretamente
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar estudantes da planilha:', error);
    res.status(500).json({ error: 'Erro ao buscar dados da planilha' });
  }
};

/**
 * GET /api/students/:id
 * Retorna um estudante específico
 */
export const getStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await getStudentById(parseInt(id));
    
    if (!student) {
      return res.status(404).json({ error: 'Estudante não encontrado' });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Erro ao buscar estudante:', error);
    res.status(500).json({ error: 'Erro ao buscar estudante' });
  }
};

/**
 * POST /api/students
 * Cria novo estudante
 */
export const addStudent = async (req, res) => {
  try {
    const studentData = req.body;
    
    // Validações básicas
    if (!studentData.name || !studentData.school) {
      return res.status(400).json({ error: 'Nome e escola são obrigatórios' });
    }
    
    const newStudent = await createStudent(studentData);
    res.status(201).json(newStudent);
  } catch (error) {
    console.error('Erro ao criar estudante:', error);
    res.status(500).json({ error: 'Erro ao criar estudante' });
  }
};

/**
 * PUT /api/students/:id
 * Atualiza um estudante
 */
export const editStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const studentData = req.body;
    
    const updatedStudent = await updateStudent(parseInt(id), studentData);
    
    if (!updatedStudent) {
      return res.status(404).json({ error: 'Estudante não encontrado' });
    }
    
    res.json(updatedStudent);
  } catch (error) {
    console.error('Erro ao atualizar estudante:', error);
    res.status(500).json({ error: 'Erro ao atualizar estudante' });
  }
};

/**
 * POST /api/students/:id/approve
 * Aprova um estudante (muda status para approved)
 */
export const approveStudentCard = async (req, res) => {
  try {
    const { id } = req.params;
    const approvedStudent = await approveStudent(parseInt(id));
    
    if (!approvedStudent) {
      return res.status(404).json({ error: 'Estudante não encontrado' });
    }
    
    res.json(approvedStudent);
  } catch (error) {
    console.error('Erro ao aprovar estudante:', error);
    res.status(500).json({ error: 'Erro ao aprovar estudante' });
  }
};

/**
 * POST /api/students/:id/issue
 * Marca estudante como emitido (salva no Supabase)
 */
export const issueStudentCard = async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.user?.username || 'admin';
    
    // Marcar como emitido no Supabase
    const result = await markAsIssued(parseInt(id), username);
    
    res.json({ 
      success: true, 
      message: 'Carteirinha marcada como emitida',
      data: result 
    });
  } catch (error) {
    console.error('Erro ao emitir carteirinha:', error);
    res.status(500).json({ error: 'Erro ao emitir carteirinha' });
  }
};

/**
 * GET /api/students/issued
 * Retorna IDs dos estudantes já emitidos
 */
export const getIssuedIds = async (req, res) => {
  try {
    const issuedIds = await getIssuedStudentIds();
    res.json(issuedIds);
  } catch (error) {
    console.error('Erro ao buscar carteirinhas emitidas:', error);
    res.status(500).json({ error: 'Erro ao buscar carteirinhas emitidas' });
  }
};
