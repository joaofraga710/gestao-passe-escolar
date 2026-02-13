import { useState, useEffect, useRef } from 'react';
import '../styles/PendingCards.css';
import StudentModal from '../components/StudentModal';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { addToTrash, getTrashIds } from '../utils/trashStorage';

const normalizeText = (text) => {
  if (!text) return "";
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

const BUS_ROUTES_DB = [
  {
    name: "Rota 01",
    schools: ["Escola A", "Colégio B"],
    streets: ["Rua Principal", "Av. Central"],
    neighborhoods: ["Centro", "Bairro Alto"]
  },
];

const calculateBestRoute = (street, neighborhood, school) => {
  const cleanStreet = normalizeText(street);
  const cleanNeighborhood = normalizeText(neighborhood);
  
  for (const route of BUS_ROUTES_DB) {
    if (cleanStreet && route.streets.some(s => normalizeText(s).includes(cleanStreet))) {
      return { name: route.name, type: 'exact' };
    }
    if (cleanNeighborhood && route.neighborhoods.some(n => normalizeText(n) === cleanNeighborhood)) {
      return { name: route.name, type: 'approximate' };
    }
  }
  return null;
};

const PendingCards = () => {
  const containerRef = useRef(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Carregando carteirinhas...');
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = import.meta.env.VITE_API_URL; 
  const FORM_URL = import.meta.env.VITE_FORM_URL; 

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
  }, { scope: containerRef, dependencies: [loading] });

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

  const fetchWithRetry = async (url, options, retries = 3, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeout);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response;
      } catch (error) {
        if (i === retries - 1) throw error;
        console.log(`Tentativa ${i + 1} falhou, tentando novamente em ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const loadPendingData = () => {
    setLoading(true);
    setLoadingMessage('Carregando carteirinhas...');
    
    const timer1 = setTimeout(() => {
      if (loading) setLoadingMessage('Aguarde, servidor iniciando... (pode levar até 30s)');
    }, 3000);
    
    const timer2 = setTimeout(() => {
      if (loading) setLoadingMessage('Ainda carregando... Quase lá!');
    }, 15000);
    
    const token = sessionStorage.getItem('school_token');
    
    Promise.all([
      fetchWithRetry(`${API_URL}/api/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }),
      fetchWithRetry(`${API_URL}/api/students/issued`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    ])
      .then(([studentsRes, issuedRes]) => Promise.all([studentsRes.json(), issuedRes.json()]))
      .then(([data, issuedIds]) => {
        if (!Array.isArray(data)) throw new Error('Dados inválidos');

        const formattedData = data.map((item, index) => {
            const rawRoute = findSmartValue(item, ['rota', 'linha']);
            const street = findSmartValue(item, ['rua', 'logradouro']);
            const neighborhood = findSmartValue(item, ['bairro']);
            const school = findSmartValue(item, ['escola']);

            let finalRoute = rawRoute;
            let detectionType = null;

            if (!rawRoute || rawRoute.length < 3 || rawRoute.toLowerCase().includes('não')) {
                const suggestion = calculateBestRoute(street, neighborhood, school);
                if (suggestion) {
                    finalRoute = suggestion.name;
                    detectionType = suggestion.type;
                } else {
                    finalRoute = "Rota Indefinida";
                }
            }

            return {
                id: String(index),
                name: findSmartValue(item, ['nome', 'aluno']),
                school: school || 'Não informada',
                // --- NOVA LINHA ADICIONADA AQUI ---
                schoolEmail: findSmartValue(item, ['email da escola', 'e-mail da escola', 'email']), 
                // ----------------------------------
                route: finalRoute,
                detectionType,
                street, neighborhood,
                number: findSmartValue(item, ['número']),
                parentName: findSmartValue(item, ['responsável']),
                parentPhone: findSmartValue(item, ['telefone']),
                cpf: String(findSmartValue(item, ['cpf']) || '').replace(/\D/g, ''),
                date: String(findSmartValue(item, ['carimbo']) || '').split(' ')[0],
                photo: getDriveImage(findSmartValue(item, ['foto'])),
            };
        });

        const issuedIdsSet = new Set(issuedIds.map(String));
        const trashedIds = getTrashIds();
        const pendingOnly = formattedData.filter(student => !issuedIdsSet.has(String(student.id)) && !trashedIds.has(String(student.id)));
        setStudents(pendingOnly);
        setLoading(false);
        clearTimeout(timer1);
        clearTimeout(timer2);
      })
      .catch(err => {
        console.error('Erro ao buscar estudantes:', err);
        setLoading(false);
        clearTimeout(timer1);
        clearTimeout(timer2);
        alert('Erro ao carregar carteirinhas. Tente novamente.');
      });
      
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  };

  useEffect(() => {
    loadPendingData();
    const handleTrashUpdate = () => loadPendingData();
    window.addEventListener('trash_updated', handleTrashUpdate);
    return () => window.removeEventListener('trash_updated', handleTrashUpdate);
  }, []);

  const handleLinkClick = (e) => {
    if (!FORM_URL || FORM_URL.includes('SEU_LINK')) { e.preventDefault(); alert("Link não configurado."); }
  };

  const handleMarkAsPrinted = async (studentId) => {
    const idString = String(studentId);
    
    try {
      const token = sessionStorage.getItem('school_token');
      
      const response = await fetch(`${API_URL}/api/students/${idString}/issue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao marcar como emitida');
      }
      
      setStudents(prev => prev.filter(s => String(s.id) !== idString));
      setSelectedStudent(null);
      
      window.dispatchEvent(new Event("cards_updated"));
    } catch (error) {
      console.error('Erro ao marcar carteirinha:', error);
      alert('Erro ao marcar carteirinha como emitida. Tente novamente.');
    }
  };

  const getBadgeStyle = (type) => {
    if (type === 'exact') return { bg: 'rgba(56, 139, 253, 0.15)', text: '#58a6ff', border: 'rgba(56, 139, 253, 0.3)', icon: '🎯' };
    if (type === 'approximate') return { bg: 'rgba(210, 153, 34, 0.15)', text: '#d29922', border: 'rgba(210, 153, 34, 0.3)', icon: '📍' };
    return { bg: 'rgba(110, 118, 129, 0.15)', text: '#8b949e', border: 'rgba(128, 129, 110, 0.2)', icon: '●' };
  };

  const filteredStudents = students.filter((student) => {
    const term = searchTerm.toLowerCase();
    return (
        (student.name && student.name.toLowerCase().includes(term)) ||
        (student.school && student.school.toLowerCase().includes(term)) ||
        (student.neighborhood && student.neighborhood.toLowerCase().includes(term))
    );
  });

  const handleMoveToTrash = (e, student) => {
    e.stopPropagation();
    addToTrash(student);
    setStudents(prev => prev.filter(s => String(s.id) !== String(student.id)));
    if (selectedStudent && String(selectedStudent.id) === String(student.id)) {
      setSelectedStudent(null);
    }
    window.dispatchEvent(new Event('trash_updated'));
  };

  return (
    <div ref={containerRef}>
      <div className="page-header gsap-header">
        <div><h1>Carteirinhas Pendentes</h1><p>Solicitações via Formulário Digital</p></div>
        <a href={FORM_URL} target="_blank" rel="noreferrer" className="form-link-btn" onClick={handleLinkClick}>
            <span>+</span> Nova Solicitação
        </a>
      </div>

      <div className="search-container gsap-header">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
            type="text" 
            className="search-input" 
            placeholder="Pesquisar aluno, escola ou bairro..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && (
        <div style={{textAlign:'center', marginTop:40}}>
          <div style={{opacity:0.6, marginBottom:10}}>{loadingMessage}</div>
          {loadingMessage.includes('servidor') && (
            <small style={{opacity:0.5, fontSize:12}}>⏳ Servidor gratuito iniciando (pode levar até 30s)</small>
          )}
        </div>
      )}
      
      {!loading && filteredStudents.length === 0 && students.length > 0 && (
          <div style={{textAlign:'center', marginTop:40, opacity:0.6}}>Nenhum aluno encontrado para "{searchTerm}".</div>
      )}
      
      {!loading && (
        <div className="cards-grid">
          {filteredStudents.map((student) => {
            const badge = getBadgeStyle(student.detectionType);
            return (
              <div key={student.id} className="student-card" onClick={() => setSelectedStudent(student)}>
                <button
                  className="trash-btn"
                  title="Mover para lixeira"
                  onClick={(e) => handleMoveToTrash(e, student)}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M6 6L7 20C7.04762 20.5523 7.44772 21 8 21H16C16.5523 21 16.9524 20.5523 17 20L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                <div className="card-header">
                  <div style={{width:48, height:48, borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'#2d333b', border:'1px solid var(--border-color)'}}>
                    {student.photo ? <img src={student.photo} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} referrerPolicy="no-referrer" onError={(e)=>{e.target.style.display='none'; if(e.target.nextSibling) e.target.nextSibling.style.display='flex'}} /> : null}
                    <div style={{width:'100%', height:'100%', display:student.photo ? 'none' : 'flex', alignItems:'center', justifyContent:'center'}}>👤</div>
                  </div>
                  <div style={{overflow:'hidden'}}>
                    <div className="student-name" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{student.name}</div>
                    <div className="school-name">{student.school}</div>
                  </div>
                </div>
                
                <div className="status-badge" style={{
                    display: 'inline-flex', 
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: badge.bg,
                    color: badge.text,
                    borderColor: badge.border,
                    maxWidth: '100%'
                }}>
                   {student.detectionType ? (
                      <>
                        <span>{badge.icon}</span> 
                        <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                           Rota: <strong>{student.route}</strong>
                        </span>
                      </>
                   ) : (
                      <>● Aguardando Análise</>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedStudent && (
        <StudentModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
          onMarkAsPrinted={handleMarkAsPrinted} 
        />
      )}
    </div>
  );
};

export default PendingCards;