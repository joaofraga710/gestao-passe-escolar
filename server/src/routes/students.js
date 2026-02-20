import express from 'express';
import { getStudents, getStudent, addStudent, editStudent, approveStudentCard, issueStudentCard, getIssuedIds, getIssuedPaged } from '../controllers/studentsController.js';
import { verifyToken } from '../middleware/auth.js';
import { sendPdfByEmail } from '../utils/emailservice.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getStudents);
router.get('/issued', getIssuedIds);
router.get('/issued/paged', getIssuedPaged);
router.get('/:id', getStudent);
router.post('/', addStudent);
router.put('/:id', editStudent);
router.post('/:id/approve', approveStudentCard);
router.post('/:id/issue', issueStudentCard);

router.post('/:id/send-email', async (req, res) => {
  const { studentName, email, pdfBase64 } = req.body;
  
  try {
    await sendPdfByEmail(studentName, email, pdfBase64);
    res.status(200).json({ message: 'E-mail enviado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao enviar o e-mail.' });
  }
});

export default router;