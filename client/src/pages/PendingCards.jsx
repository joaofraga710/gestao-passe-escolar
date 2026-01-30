import { useState, useEffect, useRef } from 'react';
import '../styles/PendingCards.css';
import StudentModal from '../components/StudentModal';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

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

  useEffect(() => {
    setLoading(true);
    
    // Obter token do sessionStorage
    const token = sessionStorage.getItem('school_token');
    
    fetch(`${API_URL}/api/students`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
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
                route: finalRoute,
                detectionType,
                street, neighborhood,
                number: findSmartValue(item, ['número']),
                parentName: findSmartValue(item, ['responsável']),
                parentPhone: findSmartValue(item, ['telefone']),
                cpf: (findSmartValue(item, ['cpf']) || '').replace(/\D/g, ''),
                date: (findSmartValue(item, ['carimbo']) || '').split(' ')[0],
                photo: getDriveImage(findSmartValue(item, ['foto'])),
            };
        });

        const issuedList = JSON.parse(localStorage.getItem('issuedCards') || '[]');
        const pendingOnly = formattedData.filter(student => !issuedList.includes(String(student.id)));
        setStudents(pendingOnly);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao buscar estudantes:', err);
        setLoading(false);
      });
  }, []);

  const handleLinkClick = (e) => {
    if (!FORM_URL || FORM_URL.includes('SEU_LINK')) { e.preventDefault(); alert("Link não configurado."); }
  };

  const handleMarkAsPrinted = (studentId) => {
    const idString = String(studentId);
    const issuedList = JSON.parse(localStorage.getItem('issuedCards') || '[]');
    if (!issuedList.includes(idString)) {
      localStorage.setItem('issuedCards', JSON.stringify([...issuedList, idString]));
      window.dispatchEvent(new Event("cards_updated"));
    }
    setStudents(prev => prev.filter(s => String(s.id) !== idString));
    setSelectedStudent(null);
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

      {loading && <div style={{textAlign:'center', marginTop:40, opacity:0.6}}>Carregando...</div>}
      
      {!loading && filteredStudents.length === 0 && students.length > 0 && (
          <div style={{textAlign:'center', marginTop:40, opacity:0.6}}>Nenhum aluno encontrado para "{searchTerm}".</div>
      )}
      
      {!loading && (
        <div className="cards-grid">
          {filteredStudents.map((student) => {
            const badge = getBadgeStyle(student.detectionType);
            return (
              <div key={student.id} className="student-card" onClick={() => setSelectedStudent(student)}>
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