import { useState, useEffect } from 'react';
import '../styles/StudentModal.css'; 
import CardGenerator from './CardGenerator'; 
import { calculateBestRoute } from '../utils/routesDb';

const Icon = ({ name, size = 20, color = "currentColor", style = {} }) => {
  const icons = {
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    idCard: <><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></>,
    mapPin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
    bus: <><path d="M19 17h2l.64-2.54c.24-.959.24-1.962 0-2.92l-1.07-4.27A3 3 0 0 0 17.66 5H4.34a3 3 0 0 0-2.91 2.27L.36 11.54c-.24.959-.24 1.962 0 2.92L1 17h2"/><path d="M14 17H8"/><circle cx="17" cy="17" r="2"/><circle cx="5" cy="17" r="2"/><path d="M16 5l-1-4H7L6 5"/></>,
    sparkles: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>, 
    check: <polyline points="20 6 9 17 4 12"/>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    close: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    creditCard: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {icons[name]}
    </svg>
  );
};

const StudentModal = ({ student, onClose, onMarkAsPrinted, onSave }) => {
  const [showPrint, setShowPrint] = useState(false);
  const [currentRoute, setCurrentRoute] = useState("");
  const [suggestedRoute, setSuggestedRoute] = useState(null);
  const [isEditingData, setIsEditingData] = useState(false);
  const [isManualRoute, setIsManualRoute] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    school: '',
    street: '',
    number: '',
    neighborhood: '',
    parentName: '',
    parentPhone: '',
    ...student
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        cpf: student.cpf ? String(student.cpf) : '',
        school: student.school || '',
        street: student.street || '',
        number: student.number || '',
        neighborhood: student.neighborhood || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone ? String(student.parentPhone) : '',
        ...student
      });
      setCurrentRoute(student.route || "Rota Indefinida");
      setSuggestedRoute(null);
      setIsEditingData(false);
      setIsManualRoute(false);
    }
  }, [student]);

  if (!student) return null;

  const maskCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskPhone = (value) => {
    let r = value.replace(/\D/g, "");
    r = r.replace(/^0/, "");

    if (r.length > 10) {
      r = r.replace(/^(\d\d)(\d)(\d{4})(\d{4}).*/, "($1) $2 $3-$4");
    } else if (r.length > 5) {
      r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (r.length > 2) {
      r = r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
    } else {
      r = r.replace(/^(\d*)/, "($1");
    }
    return r;
  };

  const displayCPF = (value) => {
    if (!value) return '';
    const clean = String(value).replace(/\D/g, '');
    if (clean.length === 0) return '';
    return maskCPF(clean);
  };

  const displayPhone = (value) => {
    if (!value) return 'Não informado';
    const clean = String(value).replace(/\D/g, '');
    if (clean.length === 0) return 'Não informado';
    return maskPhone(clean);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'cpf') {
      finalValue = maskCPF(value);
    } 
    else if (name === 'parentPhone') {
      finalValue = maskPhone(value);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSuggestRoute = () => {
    const result = calculateBestRoute(formData.street, formData.neighborhood, formData.school);
    if (result) {
      setSuggestedRoute({ found: true, text: result.name, reason: result.reason });
      setIsManualRoute(false);
    } else {
      setSuggestedRoute({ found: false, text: "Nenhuma rota compatível." });
    }
  };

  const handleAcceptSuggestion = () => {
    if (suggestedRoute?.found) {
      setCurrentRoute(suggestedRoute.text); 
      setSuggestedRoute(null); 
    }
  };

  const handleManualEntry = () => {
    setSuggestedRoute(null);
    setIsManualRoute(true);
  };

  const handleSaveChanges = () => {
    const finalData = { ...formData, route: currentRoute };
    if (onSave) onSave(finalData);
    setIsEditingData(false);
  };

  const handleCancelEdit = () => {
    setFormData({
        name: student.name || '',
        cpf: student.cpf ? String(student.cpf) : '',
        school: student.school || '',
        street: student.street || '',
        number: student.number || '',
        neighborhood: student.neighborhood || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone ? String(student.parentPhone) : '',
        ...student
    });
    setCurrentRoute(student.route || "Rota Indefinida");
    setIsEditingData(false);
    setIsManualRoute(false);
    setSuggestedRoute(null);
  };

  if (showPrint) {
    const updatedStudent = { ...formData, route: currentRoute };
    return (
      <CardGenerator 
        student={updatedStudent} 
        onClose={() => setShowPrint(false)} 
        onMarkAsPrinted={onMarkAsPrinted}
      />
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '8px',
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid #30363d',
    color: '#fff',
    borderRadius: '6px',
    fontSize: 'inherit',
    fontFamily: 'inherit'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <div>
            <h2>{isEditingData ? 'Editando Dados' : 'Detalhes da Solicitação'}</h2>
            {!isEditingData && <div className="meta-date">Enviado em: {student.date || 'Data não registrada'}</div>}
          </div>
          
          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            {!isEditingData ? (
                <button className="icon-btn" onClick={() => setIsEditingData(true)} title="Editar Dados" style={{background:'none', border:'none', cursor:'pointer', color:'#8b949e'}}>
                    <Icon name="edit" size={20} />
                </button>
            ) : (
                <div style={{display: 'flex', gap: '8px'}}>
                    <button className="btn-pill btn-secondary-action" onClick={handleCancelEdit} style={{fontSize: '0.8rem', height:'32px'}}>
                        Cancelar
                    </button>
                </div>
            )}
            <button className="close-btn" onClick={onClose}>
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="top-section">
            <div className="photo-container">
              {student.photo ? (
                <img src={student.photo} alt="Aluno" className="photo-img" referrerPolicy="no-referrer" onError={(e) => {e.target.style.display='none'; if(e.target.nextSibling) e.target.nextSibling.style.display='flex'}} />
              ) : null}
              <div className="photo-placeholder" style={{display: student.photo ? 'none' : 'flex'}}>
                <Icon name="camera" size={32} />
                <span style={{fontSize: '0.75rem'}}>Sem Foto</span>
              </div>
            </div>
            
            <div className="info-col">
              <div className="section-title"><Icon name="idCard" size={16} /> Identificação</div>
              
              <div className="field-group">
                <label>Nome Completo</label>
                {isEditingData ? (
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} style={inputStyle} />
                ) : (
                    <div className="value-box" style={{fontWeight:'600', color:'#fff'}}>{formData.name}</div>
                )}
              </div>
              
              <div className="grid-2">
                <div className="field-group">
                  <label>CPF</label>
                  {isEditingData ? (
                      <input 
                        type="text" 
                        name="cpf" 
                        value={formData.cpf} 
                        onChange={handleInputChange} 
                        style={inputStyle} 
                        placeholder="000.000.000-00"
                        maxLength="14"
                      />
                  ) : (
                      <div className="value-box">{displayCPF(formData.cpf)}</div>
                  )}
                </div>
                <div className="field-group">
                  <label>Escola Destino</label>
                  {isEditingData ? (
                      <input type="text" name="school" value={formData.school} onChange={handleInputChange} style={inputStyle} />
                  ) : (
                      <div className="value-box">{formData.school}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <hr className="divider" />
          
          <div>
            <div className="section-title"><Icon name="mapPin" size={16} /> Localização e Transporte</div>
            
            <div className="route-section-wrapper">
               <div className="route-controls">
                  <div className="route-display">
                      {isManualRoute ? (
                          <div className="field-group">
                             <label style={{paddingLeft: '10px'}}>DIGITE A ROTA:</label>
                             <input 
                                autoFocus
                                type="text" 
                                className="route-input-pill"
                                value={currentRoute}
                                onChange={(e) => setCurrentRoute(e.target.value)}
                             />
                          </div>
                      ) 
                      : suggestedRoute && suggestedRoute.found ? (
                          <div className="suggestion-box">
                              <div className="suggestion-header">
                                <Icon name="check" size={14} /> MELHOR ROTA ENCONTRADA:
                              </div>
                              <div className="suggestion-text">{suggestedRoute.text}</div>
                              <div className="suggestion-reason">Lógica: {suggestedRoute.reason}</div>
                          </div>
                      ) 
                      : (
                          <div className="current-route-display">
                              <div className="route-icon-circle"><Icon name="bus" size={24} /></div>
                              <div>
                                <span className="route-label">Rota Atual</span>
                                <div className="route-value">{currentRoute}</div>
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="action-buttons">
                    {isManualRoute && (
                         <button className="btn-pill btn-blue-action" onClick={() => setIsManualRoute(false)}>OK</button>
                    )}

                    {!isManualRoute && suggestedRoute && (
                        <>
                           <button className="btn-pill btn-primary-action" onClick={handleAcceptSuggestion}>
                             <Icon name="check" size={16} /> Aceitar
                           </button>
                           <button className="btn-pill btn-secondary-action" onClick={handleManualEntry}>
                             <Icon name="edit" size={14} /> Manual
                           </button>
                        </>
                    )}

                    {!isManualRoute && !suggestedRoute && (
                        <button className="btn-pill btn-primary-action" onClick={handleSuggestRoute}>
                         Sugerir Rota
                        </button>
                    )}
                  </div>
               </div>

               {suggestedRoute && !suggestedRoute.found && (
                  <div className="route-error">
                      <Icon name="close" size={14} /> {suggestedRoute.text} 
                      <button className="link-btn" onClick={handleManualEntry}>Preencher Manualmente?</button>
                  </div>
               )}
            </div>

            <div className="grid-3-1" style={{marginTop: '15px'}}>
              <div className="field-group">
                <label>Rua</label>
                {isEditingData ? (
                    <input type="text" name="street" value={formData.street} onChange={handleInputChange} style={inputStyle} />
                ) : (
                    <div className="value-box">{formData.street || 'Não informada'}</div>
                )}
              </div>
              <div className="field-group">
                <label>Nº</label>
                {isEditingData ? (
                    <input type="text" name="number" value={formData.number} onChange={handleInputChange} style={inputStyle} />
                ) : (
                    <div className="value-box">{formData.number || 'S/N'}</div>
                )}
              </div>
            </div>
            <div className="field-group" style={{marginTop:'12px'}}>
              <label>Bairro</label>
              {isEditingData ? (
                    <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} style={inputStyle} />
                ) : (
                    <div className="value-box">{formData.neighborhood || 'Não informado'}</div>
                )}
            </div>
          </div>

          <hr className="divider" />
          
          <div>
            <div className="section-title"><Icon name="users" size={16} /> Responsável</div>
            <div className="grid-2">
              <div className="field-group">
                <label>Nome</label>
                {isEditingData ? (
                    <input type="text" name="parentName" value={formData.parentName} onChange={handleInputChange} style={inputStyle} />
                ) : (
                    <div className="value-box">{formData.parentName || 'Não informado'}</div>
                )}
              </div>
              <div className="field-group">
                <label>Contato</label>
                {isEditingData ? (
                    <input 
                        type="text" 
                        name="parentPhone" 
                        value={formData.parentPhone} 
                        onChange={handleInputChange} 
                        style={inputStyle} 
                        placeholder="(51) 9 9999-9999"
                        maxLength="16"
                    />
                ) : (
                    <div className="value-box contact-highlight">{displayPhone(formData.parentPhone)}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-footer btn-footer-cancel" onClick={onClose}>Fechar</button>
          
          {isEditingData ? (
              <button className="btn-footer btn-footer-primary" onClick={handleSaveChanges} style={{backgroundColor: '#1f6feb'}}>
                <Icon name="save" size={18} /> Salvar Alterações
              </button>
          ) : (
              <button className="btn-footer btn-footer-primary" onClick={() => setShowPrint(true)}>
                <Icon name="creditCard" size={18} /> Gerar Carteirinha
              </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentModal;