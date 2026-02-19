import { useState } from 'react';
import BUS_ROUTES from '../utils/busRoutes';
import { getCoordinatesFromAddress, findNearestRoute } from '../utils/gpsUtils';
import '../styles/CalcularRota.css';

const CalcularRota = () => {
  const [formData, setFormData] = useState({
    street: '',
    number: '',
    neighborhood: '',
    school: ''
  });
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateRoute = async () => {
    if (!formData.street || !formData.school) {
      alert('Por favor, preencha pelo menos a Rua e a Escola.');
      return;
    }

    setIsCalculating(true);
    setResult(null);

    const coords = await getCoordinatesFromAddress(
      formData.street,
      formData.number,
      formData.neighborhood
    );

    if (!coords) {
      setResult({
        found: false,
        name: 'Erro de Localização',
        reason: 'Endereço não encontrado no mapa. Verifique rua e número.',
        type: 'error'
      });
      setIsCalculating(false);
      return;
    }

    const routeResult = findNearestRoute(coords, BUS_ROUTES, formData.school);
    
    setResult({
      found: routeResult.found,
      name: routeResult.name || routeResult.text,
      reason: routeResult.reason || 'Nenhuma rota próxima identificada.',
      type: routeResult.type || 'error'
    });

    setIsCalculating(false);
  };

  const handleReset = () => {
    setFormData({ street: '', number: '', neighborhood: '', school: '' });
    setResult(null);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Calcular Rota GPS</h1>
          <p>Encontre a melhor rota baseada na geolocalização exata do aluno</p>
        </div>
      </div>

      <div className="calculator-form">
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label htmlFor="street">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Rua
            </label>
            <input 
              type="text"
              id="street"
              name="street"
              value={formData.street} 
              onChange={handleInputChange}
              className="form-select"
              style={{ padding: '10px', backgroundColor: 'transparent', color: '#fff' }}
              placeholder="Ex: Av. Paraguassú"
              disabled={isCalculating}
            />
          </div>

          <div className="form-group">
            <label htmlFor="number">Nº</label>
            <input 
              type="text"
              id="number"
              name="number"
              value={formData.number} 
              onChange={handleInputChange}
              className="form-select"
              style={{ padding: '10px', backgroundColor: 'transparent', color: '#fff' }}
              placeholder="Ex: 1234"
              disabled={isCalculating}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
          <div className="form-group">
            <label htmlFor="neighborhood">Bairro</label>
            <input 
              type="text"
              id="neighborhood"
              name="neighborhood"
              value={formData.neighborhood} 
              onChange={handleInputChange}
              className="form-select"
              style={{ padding: '10px', backgroundColor: 'transparent', color: '#fff' }}
              placeholder="Ex: Centro"
              disabled={isCalculating}
            />
          </div>

          <div className="form-group">
            <label htmlFor="school">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7v10c0 5.5 4.5 10 10 10s10-4.5 10-10V7L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="12 2 12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Escola Destino
            </label>
            <input 
              type="text"
              id="school"
              name="school"
              value={formData.school} 
              onChange={handleInputChange}
              className="form-select"
              style={{ padding: '10px', backgroundColor: 'transparent', color: '#fff' }}
              placeholder="Ex: EMEF Norberto Martinho Cardoso"
              disabled={isCalculating}
            />
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: '20px' }}>
          <button 
            className="btn-calcular" 
            onClick={calculateRoute}
            disabled={!formData.street || !formData.school || isCalculating}
          >
            {isCalculating ? (
              <>
                <span className="spinner"></span>
                Buscando Satélite...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="9 11 12 14 22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Processar Rota
              </>
            )}
          </button>
          
          {result && (
            <button className="btn-reset" onClick={handleReset}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="1 4 1 10 7 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Limpar
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className="results-section">
          <div className="results-header">
            <h2>Diagnóstico da Rota</h2>
          </div>

          {result.type === 'denied' ? (
            <div className="no-results" style={{ borderColor: '#da3633', backgroundColor: 'rgba(218, 54, 51, 0.05)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#da3633">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="2"/>
                <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2"/>
                <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2"/>
              </svg>
              <h3 style={{ color: '#ff7b72', marginTop: '10px' }}>{result.name}</h3>
              <p style={{ fontSize: '1.1rem', marginTop: '10px' }}>{result.reason}</p>
            </div>
          ) : result.found ? (
            <div className="routes-list">
              <div className="route-card" style={{ borderColor: '#238636', backgroundColor: 'rgba(35, 134, 54, 0.05)' }}>
                <div className="route-header">
                  <div className="route-name" style={{ color: '#3fb950' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 17h2l.64-2.54c.24-.959.24-1.962 0-2.92l-1.07-4.27A3 3 0 0 0 17.66 5H4.34a3 3 0 0 0-2.91 2.27L.36 11.54c-.24.959-.24 1.962 0 2.92L1 17h2" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="5" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    {result.name}
                  </div>
                  <div className="route-badge" style={{ backgroundColor: '#238636', color: '#fff' }}>Viável</div>
                </div>
                
                <div className="route-details" style={{ padding: '20px 0 10px 0' }}>
                  <p style={{ fontSize: '1.1rem', color: '#c9d1d9', margin: 0 }}>
                    <strong>Análise do Sistema:</strong> {result.reason}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-results">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#8b949e">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h3 style={{ marginTop: '10px' }}>Nenhuma rota compatível</h3>
              <p>{result.reason}</p>
              <p className="suggestion">Verifique se o nome da escola está correto de acordo com a base de dados.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CalcularRota;