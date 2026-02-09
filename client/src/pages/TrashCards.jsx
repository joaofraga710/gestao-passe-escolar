import { useEffect, useRef, useState } from 'react';
import '../styles/PendingCards.css';
import StudentModal from '../components/StudentModal';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { getActiveTrash, removeFromTrash } from '../utils/trashStorage';

const TrashCards = () => {
  const containerRef = useRef(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useGSAP(() => {
    gsap.fromTo('.gsap-header', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });
  }, { scope: containerRef });

  useGSAP(() => {
    if (items.length > 0) {
      gsap.killTweensOf('.student-card');
      gsap.fromTo('.student-card',
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.06, clearProps: 'all' }
      );
    }
  }, { scope: containerRef, dependencies: [items] });

  const loadTrash = () => {
    setItems(getActiveTrash());
  };

  useEffect(() => {
    loadTrash();
    const handleUpdate = () => loadTrash();
    window.addEventListener('trash_updated', handleUpdate);
    return () => window.removeEventListener('trash_updated', handleUpdate);
  }, []);

  const handleRestore = (e, id) => {
    e.stopPropagation();
    removeFromTrash(id);
    loadTrash();
    window.dispatchEvent(new Event('trash_updated'));
  };

  const filteredItems = items.filter((item) => {
    const student = item.data || {};
    const term = searchTerm.toLowerCase();
    return (
      (student.name && student.name.toLowerCase().includes(term)) ||
      (student.school && student.school.toLowerCase().includes(term)) ||
      (student.neighborhood && student.neighborhood.toLowerCase().includes(term))
    );
  });

  return (
    <div ref={containerRef}>
      <div className="page-header gsap-header">
        <div>
          <h1>Lixeira</h1>
          <p>Itens excluídos são removidos após 7 dias</p>
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
          placeholder="Pesquisar na lixeira..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {items.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: 60, opacity: 0.6 }}>
          <p>Nenhuma carteirinha na lixeira.</p>
        </div>
      )}

      {items.length > 0 && filteredItems.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: 60, opacity: 0.6 }}>
          <p>Nenhum aluno encontrado para "{searchTerm}"</p>
        </div>
      )}

      <div className="cards-grid">
        {filteredItems.map((item) => {
          const student = item.data || {};
          return (
            <div key={item.id} className="student-card" onClick={() => setSelectedStudent(student)}>
              <button
                className="trash-btn"
                title="Restaurar"
                onClick={(e) => handleRestore(e, item.id)}
                style={{ borderColor: 'rgba(88, 166, 255, 0.3)', background: 'rgba(88, 166, 255, 0.12)', color: '#58a6ff' }}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M7 8L3 12L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M21 12C21 7.58172 17.4183 4 13 4H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              <div className="card-header">
                <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#2d333b', border: '1px solid var(--border-color)' }}>
                  {student.photo ? (
                    <img src={student.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                  )}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div className="student-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name}</div>
                  <div className="school-name">{student.school}</div>
                </div>
              </div>

              <div className="status-badge" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(110, 118, 129, 0.15)',
                color: '#8b949e',
                border: '1px solid rgba(128, 129, 110, 0.2)',
                borderRadius: '20px'
              }}>
                🗑️ Na lixeira
              </div>
            </div>
          );
        })}
      </div>

      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

export default TrashCards;
