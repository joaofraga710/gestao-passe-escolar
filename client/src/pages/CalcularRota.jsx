import { useState } from 'react';
import { BUS_ROUTES_DB, normalizeText } from '../utils/routesDb';
import '../styles/CalcularRota.css';

const CalcularRota = () => {
  const [selectedBairro, setSelectedBairro] = useState('');
  const [selectedEscola, setSelectedEscola] = useState('');
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Extrair todos os bairros únicos das rotas
  const getAllBairros = () => {
    const bairros = new Set();
    BUS_ROUTES_DB.forEach(route => {
      route.itinerary.forEach(point => {
        // Só adicionar se não parece ser uma escola (não começa com EMEF, EMEI, EEEM)
        if (!point.match(/^(EMEF|EMEI|EEEM)/i)) {
          bairros.add(point);
        }
      });
    });
    return Array.from(bairros).sort();
  };

  // Extrair todas as escolas únicas das rotas
  const getAllEscolas = () => {
    const escolas = new Set();
    BUS_ROUTES_DB.forEach(route => {
      route.itinerary.forEach(point => {
        // Só adicionar se parece ser uma escola (começa com EMEF, EMEI, EEEM)
        if (point.match(/^(EMEF|EMEI|EEEM)/i)) {
          escolas.add(point);
        }
      });
    });
    return Array.from(escolas).sort();
  };

  const calculateRoutes = () => {
    if (!selectedBairro || !selectedEscola) {
      alert('Por favor, selecione o bairro e a escola.');
      return;
    }

    setIsCalculating(true);

    // Simular um pequeno delay para feedback visual
    setTimeout(() => {
      const cleanBairro = normalizeText(selectedBairro);
      const cleanEscola = normalizeText(selectedEscola);
      const foundRoutes = [];

      BUS_ROUTES_DB.forEach(route => {
        const bairroIndex = route.itinerary.findIndex(point => 
          normalizeText(point).includes(cleanBairro)
        );

        const escolaIndex = route.itinerary.findIndex(point => 
          normalizeText(point).includes(cleanEscola)
        );

        // Verificar se a rota passa pelo bairro E pela escola
        // E se o bairro vem antes da escola no itinerário
        if (bairroIndex !== -1 && escolaIndex !== -1 && bairroIndex < escolaIndex) {
          foundRoutes.push({
            name: route.name,
            pickupPoint: route.itinerary[bairroIndex],
            dropoffPoint: route.itinerary[escolaIndex],
            itinerary: route.itinerary,
            pickupIndex: bairroIndex,
            dropoffIndex: escolaIndex
          });
        }
      });

      setResults({
        bairro: selectedBairro,
        escola: selectedEscola,
        routes: foundRoutes
      });
      setIsCalculating(false);
    }, 300);
  };

  const handleReset = () => {
    setSelectedBairro('');
    setSelectedEscola('');
    setResults(null);
  };

  const bairros = getAllBairros();
  const escolas = getAllEscolas();

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Calcular Rota</h1>
          <p>Encontre as rotas de transporte disponíveis para o aluno</p>
        </div>
      </div>

      <div className="calculator-form">
        <div className="form-group">
          <label htmlFor="bairro">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Bairro do Aluno
          </label>
          <select 
            id="bairro"
            value={selectedBairro} 
            onChange={(e) => setSelectedBairro(e.target.value)}
            className="form-select"
            disabled={isCalculating}
          >
            <option value="">Selecione o bairro...</option>
            {bairros.map(bairro => (
              <option key={bairro} value={bairro}>{bairro}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="escola">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7v10c0 5.5 4.5 10 10 10s10-4.5 10-10V7L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="12 2 12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Escola do Aluno
          </label>
          <select 
            id="escola"
            value={selectedEscola} 
            onChange={(e) => setSelectedEscola(e.target.value)}
            className="form-select"
            disabled={isCalculating}
          >
            <option value="">Selecione a escola...</option>
            {escolas.map(escola => (
              <option key={escola} value={escola}>{escola}</option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button 
            className="btn-calcular" 
            onClick={calculateRoutes}
            disabled={!selectedBairro || !selectedEscola || isCalculating}
          >
            {isCalculating ? (
              <>
                <span className="spinner"></span>
                Calculando...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="9 11 12 14 22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Calcular Rota
              </>
            )}
          </button>
          {results && (
            <button className="btn-reset" onClick={handleReset}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="1 4 1 10 7 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Nova Consulta
            </button>
          )}
        </div>
      </div>

      {results && (
        <div className="results-section">
          <div className="results-header">
            <h2>Resultados da Busca</h2>
            <div className="search-params">
              <span className="param-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {results.bairro}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{opacity: 0.3}}>
                <polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="param-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7v10c0 5.5 4.5 10 10 10s10-4.5 10-10V7L12 2z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {results.escola}
              </span>
            </div>
          </div>

          {results.routes.length === 0 ? (
            <div className="no-results">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h3>Nenhuma rota encontrada</h3>
              <p>Não há rotas de transporte que atendam o bairro <strong>{results.bairro}</strong> e a escola <strong>{results.escola}</strong>.</p>
              <p className="suggestion">Verifique se as informações estão corretas ou tente uma combinação diferente.</p>
            </div>
          ) : (
            <div className="routes-list">
              <div className="routes-count">
                {results.routes.length === 1 
                  ? '1 rota encontrada' 
                  : `${results.routes.length} rotas encontradas`
                }
              </div>
              {results.routes.map((route, index) => (
                <div key={index} className="route-card">
                  <div className="route-header">
                    <div className="route-name">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 17h2l.64-2.54c.24-.959.24-1.962 0-2.92l-1.07-4.27A3 3 0 0 0 17.66 5H4.34a3 3 0 0 0-2.91 2.27L.36 11.54c-.24.959-.24 1.962 0 2.92L1 17h2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="5" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      {route.name}
                    </div>
                    <div className="route-badge">Compatível</div>
                  </div>
                  
                  <div className="route-details">
                    <div className="route-point pickup">
                      <div className="point-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="3" fill="currentColor"/>
                        </svg>
                      </div>
                      <div>
                        <div className="point-label">Embarque</div>
                        <div className="point-value">{route.pickupPoint}</div>
                      </div>
                    </div>

                    <div className="route-arrow">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="5 12 19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="12 5 19 12 12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>

                    <div className="route-point dropoff">
                      <div className="point-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L2 7v10c0 5.5 4.5 10 10 10s10-4.5 10-10V7L12 2z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <div>
                        <div className="point-label">Desembarque</div>
                        <div className="point-value">{route.dropoffPoint}</div>
                      </div>
                    </div>
                  </div>

                  <div className="route-info">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Passa por {route.dropoffIndex - route.pickupIndex} ponto(s) até a escola
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CalcularRota;
