import { useState, useEffect, useRef } from 'react';
import '../styles/PendingCards.css';
import StudentModal from '../components/StudentModal';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const IssuedCards = () => {
  const containerRef = useRef(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const ITEMS_PER_PAGE = 12;

  const API_URL = import.meta.env.VITE_API_URL; 

  useGSAP(() => {
    gsap.fromTo('.gsap-header', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });
  }, { scope: containerRef });

  useGSAP(() => {
    if (!loading && students.length > 0) {
      gsap.killTweensOf('.student-card');
      gsap.fromTo('.student-card', 
        { y: 30, opacity: 0, scale: 0.95 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.06, clearProps: 'all' }
      );
    }
  }, { scope: containerRef, dependencies: [loading, students] });

  const findSmartValue = (item, includes) => {
    if (!item || typeof item !== 'object') return '';
    const foundKey = Object.keys(item).find(key => includes.some(inc => key.toLowerCase().includes(inc.toLowerCase())));
    return foundKey ? item[foundKey] : '';
  };

  const getDriveImage = (driveUrl) => {
    if (!driveUrl) return null;
    const cleanUrl = driveUrl.split(',')[0].trim();
    const idMatch = cleanUrl.match(/[-\w]{25,}/);
    if (!idMatch) return null;
    return `https://wsrv.nl/?url=${encodeURIComponent(`https://drive.google.com/uc?export=view&id=${idMatch[0]}`)}&w=400&q=80&output=webp`;
  };

  const loadIssuedData = async (currentPage = page) => {
    setLoading(true);
    
    try {
      // Obter token do sessionStorage
      const token = sessionStorage.getItem('school_token');

      const issuedResponse = await fetch(`${API_URL}/api/students/issued/paged?page=${currentPage}&limit=${ITEMS_PER_PAGE}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!issuedResponse.ok) {
        throw new Error('Erro ao buscar emitidas');
      }
      
      const result = await issuedResponse.json();
      const issuedItems = Array.isArray(result.items) ? result.items : [];

      if (issuedItems.length === 0) {
        setStudents([]);
        setTotalItems(result.total || 0);
        setLoading(false);
        return;
      }

      const formattedData = issuedItems.map((item) => ({
        id: String(item.id),
        name: findSmartValue(item, ['nome', 'aluno']),
        school: findSmartValue(item, ['escola']) || 'Não informada',
        route: findSmartValue(item, ['rota']),
        street: findSmartValue(item, ['rua', 'logradouro']),
        number: findSmartValue(item, ['número']),
        neighborhood: findSmartValue(item, ['bairro']),
        parentName: findSmartValue(item, ['responsável']),
        parentPhone: findSmartValue(item, ['telefone']),
        cpf: String(findSmartValue(item, ['cpf']) || '').replace(/\D/g, ''),
        date: String(findSmartValue(item, ['carimbo']) || '').split(' ')[0],
        photo: getDriveImage(findSmartValue(item, ['foto'])),
        status: "Emitida"
      }));

      setStudents(formattedData);
      setTotalItems(result.total || 0);
      setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar emitidas:', err);
        setLoading(false);
        alert('Erro ao carregar carteirinhas emitidas.');
      }
  };

  useEffect(() => {
    loadIssuedData(page);
    const handleUpdate = () => loadIssuedData();
    window.addEventListener('cards_updated', handleUpdate);
    return () => window.removeEventListener('cards_updated', handleUpdate);
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const filteredStudents = students.filter(student => {
    const term = searchTerm.toLowerCase();
    return (
      (student.name && student.name.toLowerCase().includes(term)) ||
      (student.school && student.school.toLowerCase().includes(term)) ||
      (student.cpf && student.cpf.includes(term))
    );
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedStudents = filteredStudents;

  return (
    <div ref={containerRef}>
      <div className="page-header gsap-header">
        <div>
          <h1>Carteirinhas Emitidas</h1>
          <p>Histórico de documentos finalizados</p>
        </div>
      </div>

      <div className="search-container gsap-header">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
            type="text" 
            className="search-input" 
            placeholder="Buscar no histórico..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <div style={{textAlign: 'center', marginTop: 40, opacity: 0.6}}>Carregando histórico...</div>}

      {!loading && students.length === 0 && (
        <div style={{textAlign: 'center', marginTop: 60, opacity: 0.6}}>
          <div style={{fontSize: '3rem', marginBottom: 10}}></div>
          <p>Nenhuma carteirinha emitida ainda.</p>
        </div>
      )}

      {!loading && students.length > 0 && filteredStudents.length === 0 && (
        <div style={{textAlign: 'center', marginTop: 60, opacity: 0.6}}>
          <div style={{fontSize: '2rem', marginBottom: 10}}></div>
          <p>Nenhum aluno encontrado para "<strong>{searchTerm}</strong>"</p>
        </div>
      )}

      <div className="cards-grid issued-grid">
        {paginatedStudents.map((student) => (
          <div key={student.id} className="student-card" onClick={() => setSelectedStudent(student)}>
            
            <div className="card-header">
              <div style={{width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#2d333b', border: '1px solid var(--border-color)'}}>
                {student.photo ? (
                  <img src={student.photo} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} referrerPolicy="no-referrer" onError={(e)=>{e.target.style.display='none'; if(e.target.nextSibling) e.target.nextSibling.style.display='flex'}} />
                ) : <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>👤</div>}
              </div>
              <div style={{overflow: 'hidden'}}>
                <div className="student-name" style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{student.name}</div>
                <div className="school-name">{student.school}</div>
              </div>
            </div>

            <div className="status-badge" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(35, 134, 54, 0.15)', 
                color: '#3fb950', 
                border: '1px solid rgba(35, 134, 54, 0.2)',
                borderRadius: '20px'
            }}>
               <span>✓</span> Emitida
            </div>
          </div>
        ))}
      </div>

      {!loading && totalItems > ITEMS_PER_PAGE && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <div className="pagination-info">
            Página {currentPage} de {totalPages}
          </div>
          <button
            className="pagination-btn"
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima
          </button>
        </div>
      )}

      {selectedStudent && (
        <StudentModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </div>
  );
};

export default IssuedCards;