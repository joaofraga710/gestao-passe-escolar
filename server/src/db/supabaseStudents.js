import { supabase } from '../config/supabase.js';

/**
 * Marcar estudante como emitido
 */
export const markAsIssued = async (googleSheetsIndex, issuedBy = 'admin') => {
  const { data, error } = await supabase
    .from('students')
    .upsert({
      google_sheets_index: googleSheetsIndex,
      status: 'issued',
      issued_at: new Date().toISOString(),
      issued_by: issuedBy
    }, {
      onConflict: 'google_sheets_index'
    })
    .select();

  if (error) throw error;
  return data[0];
};

/**
 * Obter todos os IDs de estudantes emitidos
 */
export const getIssuedStudentIds = async () => {
  const { data, error } = await supabase
    .from('students')
    .select('google_sheets_index')
    .eq('status', 'issued');

  if (error) throw error;
  return data.map(item => item.google_sheets_index);
};

/**
 * Obter status de um estudante específico
 */
export const getStudentStatus = async (googleSheetsIndex) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('google_sheets_index', googleSheetsIndex)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
};

/**
 * Obter todos os estudantes emitidos com paginação
 */
export const getIssuedStudents = async (page = 1, limit = 50) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('students')
    .select('*', { count: 'exact' })
    .eq('status', 'issued')
    .order('issued_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data, count, page, limit };
};

/**
 * Remover estudante das emitidas (voltar para pendentes)
 */
export const markAsPending = async (googleSheetsIndex) => {
  const { data, error } = await supabase
    .from('students')
    .delete()
    .eq('google_sheets_index', googleSheetsIndex)
    .select();

  if (error) throw error;
  return data;
};
