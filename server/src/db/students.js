// Mock de dados de estudantes pendentes
// Em produção, isso viria de um banco de dados real

let students = [
  {
    id: 1,
    name: 'João Silva',
    school: 'Escola A',
    grade: '5º ano',
    street: 'Rua Principal',
    neighborhood: 'Centro',
    photoUrl: null,
    status: 'pending',
    created_at: new Date()
  },
  {
    id: 2,
    name: 'Maria Santos',
    school: 'Colégio B',
    grade: '3º ano',
    street: 'Av. Central',
    neighborhood: 'Bairro Alto',
    photoUrl: null,
    status: 'pending',
    created_at: new Date()
  }
];

export const getAllStudents = async (status = null) => {
  if (status) {
    return students.filter(s => s.status === status);
  }
  return students;
};

export const getStudentById = async (id) => {
  return students.find(s => s.id === id);
};

export const createStudent = async (studentData) => {
  const newStudent = {
    id: students.length + 1,
    ...studentData,
    status: 'pending',
    created_at: new Date()
  };
  students.push(newStudent);
  return newStudent;
};

export const updateStudent = async (id, studentData) => {
  const student = students.find(s => s.id === id);
  if (!student) return null;
  
  Object.assign(student, studentData);
  return student;
};

export const deleteStudent = async (id) => {
  const index = students.findIndex(s => s.id === id);
  if (index === -1) return false;
  
  students.splice(index, 1);
  return true;
};

export const approveStudent = async (id) => {
  const student = students.find(s => s.id === id);
  if (!student) return null;
  
  student.status = 'approved';
  student.approved_at = new Date();
  return student;
};
