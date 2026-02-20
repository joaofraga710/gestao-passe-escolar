import { useRef, useState, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Cropper from 'react-easy-crop';

const getRadianAngle = (degreeValue) => {
  return (degreeValue * Math.PI) / 180;
};

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    if (!url.startsWith('blob:')) {
      image.setAttribute('crossOrigin', 'anonymous');
    }
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );
  
  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return canvas.toDataURL('image/jpeg', 1.0);
}

const theme = {
  bgOverlay: 'rgba(15, 17, 21, 0.92)',
  bgPanel: '#0d1117',
  bgHeader: '#161b22',
  border: '#30363d',
  textPrimary: '#c9d1d9',
  textSecondary: '#8b949e',
  accent: '#1f6feb',
  accentHover: '#388bfd',
  success: '#238636',
  danger: '#da3633',
  pdfBackground: '#525659' 
};

const CONFIG = { marginTop: '10mm', zoomScreen: '0.8' };

const maskCPF = (value) => {
  if (!value) return '';
  const clean = String(value).replace(/\D/g, '');
  if (clean.length === 0) return '';
  return clean
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const maskPhone = (value) => {
  if (!value) return '';
  let r = String(value).replace(/\D/g, "");
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

const SingleCard = ({ student, styles, base64Background, photoSrc }) => {
  const blueTextStyle = {
    position: 'absolute', color: '#003366', fontWeight: 'bold', fontSize: '11px',
    fontFamily: '"Arial", sans-serif', whiteSpace: 'nowrap', left: '113px', zIndex: 10, letterSpacing: '0.5px',
  };

  return (
    <div style={{...styles.cardContainer, backgroundColor: 'white'}}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        {base64Background ? (
          <img src={base64Background} alt="Fundo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : <div style={{width:'100%', height:'100%', background: '#f0f0f0'}}></div>}
      </div>
      <div style={{ position: 'absolute', top: '82px', left: '337px', width: '121px', height: '149px', backgroundColor: '#e5e7eb', overflow: 'hidden', zIndex: 5 }}>
        {photoSrc ? (
          <img src={photoSrc} alt="Aluno" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : <div style={{width:'100%', height:'100%', background:'#e5e7eb'}}></div>}
      </div>
      <div style={{ ...blueTextStyle, top: '151px', left: '67px', fontSize: '14px', textTransform: 'uppercase', width: '216px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name}</div>
      <div style={{ ...blueTextStyle, top: '173px', left: '96px', fontSize: '14px' }}>{maskCPF(student.cpf) || '---'}</div>
      <div style={{ ...blueTextStyle, top: '195px', width: '216px', fontSize: '14px' }}>{student.parentName || '---'}</div>
      <div style={{ ...blueTextStyle, top: '217px', color: '#d32f2f', width: '216px', left: '65px', fontSize: '14px' }}>{student.route || '---'}</div>
      <div style={{ position: 'absolute', color: '#FFFFFF', fontWeight: 'bold', fontSize: '14px', fontFamily: '"Arial", sans-serif', top: '270px', left: '81px', zIndex: 10, letterSpacing: '0.5px' }}>{maskPhone(student.parentPhone) || '---'}</div>
    </div>
  );
};

const CardGenerator = ({ student, onClose, onMarkAsPrinted }) => {
  const printRef = useRef(null);
  const [step, setStep] = useState('loading');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [destinationEmail, setDestinationEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  const [photoForCrop, setPhotoForCrop] = useState(null);
  const [croppedPhoto, setCroppedPhoto] = useState(null);
  const [base64Bg, setBase64Bg] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const prepareSafeUrl = async (url) => {
      try {
        if (!url) return null;
        if (url.startsWith('data:')) return url;
        let fetchUrl = url;
        if (!url.includes('wsrv.nl')) {
           fetchUrl = `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=jpg`;
        }
        const response = await fetch(fetchUrl);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } catch (e) { return url; }
    };

    const init = async () => {
      try {
        const stateSchools = ['IEE Barão de Tramandaí', 'EEEM 9 de maio', 'EEEM Reinaldo Vacari'];
        const isStateSchool = student?.school && stateSchools.includes(student.school);
        const bgFileName = isStateSchool ? '/fundo-carteirinha-estadual.png' : '/fundo-carteirinha.png';
        
        const resp = await fetch(bgFileName);
        const blob = await resp.blob();
        const reader = new FileReader();
        reader.onloadend = () => { if (isMounted) setBase64Bg(reader.result); };
        reader.readAsDataURL(blob);
      } catch (e) { 
        console.error(e);
      }

      if (student?.photo) {
        const safeUrl = await prepareSafeUrl(student.photo);
        if (isMounted) { setPhotoForCrop(safeUrl); setStep('crop'); }
      } else { if (isMounted) setStep('preview'); }
    };
    init();
    return () => { isMounted = false; };
  }, [student]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirmCrop = async () => {
    try {
      const resultBase64 = await getCroppedImg(photoForCrop, croppedAreaPixels, rotation);
      setCroppedPhoto(resultBase64);
      setStep('preview');
    } catch (e) {
      setCroppedPhoto(photoForCrop);
      setStep('preview');
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      const canvas = await html2canvas(printRef.current, {
        scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff',
        logging: false, letterRendering: true, imageTimeout: 10000
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      pdf.save(`Carteirinha_${student.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) { alert("Erro ao gerar PDF."); } 
    finally { setIsGenerating(false); }
  };

  const handleGenerateAndSendEmail = async () => {
    if (!printRef.current || !destinationEmail) return;
    setIsSendingEmail(true);
  
    try {
      await new Promise(r => setTimeout(r, 800));
      const canvas = await html2canvas(printRef.current, {
        scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff',
        logging: false, letterRendering: true, imageTimeout: 10000
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      
      const pdfBase64 = pdf.output('datauristring');
      const token = sessionStorage.getItem('school_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${apiUrl}/api/students/${student.id}/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentName: student.name,
          email: destinationEmail,
          pdfBase64: pdfBase64
        })
      });
  
      if (!response.ok) throw new Error('Falha no envio');
      
      alert('PDF enviado com sucesso para a escola!');
      setDestinationEmail('');
    } catch (error) {
      alert("Erro ao enviar o e-mail.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleFinalize = () => {
    if (onMarkAsPrinted) onMarkAsPrinted(student.id);
    setShowConfirmModal(false);
    onClose();
  };

  if (!student) return null;

  if (step === 'loading') {
    return (
      <div style={styles.overlay}>
        <div style={{color: theme.textSecondary, fontSize: '0.9rem', animation: 'fadeIn 0.5s'}}>Carregando recursos...</div>
      </div>
    );
  }

  if (step === 'crop') {
    return (
      <div style={styles.overlay}>
        <div style={styles.panel}> 
          <div style={styles.header}>
            <h2 style={styles.title}>Ajustar Foto</h2>
            <p style={styles.subtitle}>Arraste, gire e use o zoom para centralizar</p>
          </div>
          <div style={styles.cropperContainer}>
            <Cropper
              image={photoForCrop} 
              crop={crop} 
              zoom={zoom} 
              rotation={rotation}
              aspect={135/165}
              onCropChange={setCrop} 
              onCropComplete={onCropComplete} 
              onZoomChange={setZoom} 
              onRotationChange={setRotation}
              objectFit="contain"
            />
          </div>
          <div style={styles.controls}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
               <span style={styles.label}>ZOOM</span>
               <span style={styles.label}>{zoom.toFixed(1)}x</span>
            </div>
            <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="minimal-slider" style={styles.slider} />
            
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', marginTop: '16px'}}>
               <span style={styles.label}>ROTAÇÃO</span>
               <span style={styles.label}>{rotation}°</span>
            </div>
            <input type="range" value={rotation} min={0} max={360} step={1} onChange={(e) => setRotation(Number(e.target.value))} className="minimal-slider" style={styles.slider} />
          </div>
          <div style={styles.footer}>
            <button onClick={onClose} style={styles.btnSecondary}>Cancelar</button>
            <button onClick={handleConfirmCrop} style={styles.btnPrimary}>Confirmar Foto</button>
          </div>
        </div>
        <style>{animationsAndStyles}</style>
      </div>
    );
  }

  const isReady = !!base64Bg;

  return (
    <div style={styles.overlay}>
      <div style={styles.previewShell} className="fade-in">
        
        {/* LADO ESQUERDO: Visualização do PDF (Fundo Cinza) */}
        <div style={styles.previewMain}>
          <div style={{...styles.a4PageWrapper, zoom: CONFIG.zoomScreen}}>
            <div style={{...styles.a4Page, paddingTop: CONFIG.marginTop}}>
              <div style={{display: 'flex', width: '100%', justifyContent: 'center', gap: '0px'}}>
                <div style={{...styles.cardWrapper, zoom: 0.73}}>
                  <SingleCard student={student} styles={styles} base64Background={base64Bg} photoSrc={croppedPhoto} />
                </div>
                <div style={{...styles.cardWrapper, zoom: 0.73}}>
                  <SingleCard student={student} styles={styles} base64Background={base64Bg} photoSrc={croppedPhoto} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: Barra Lateral de Configurações (Estilo Chrome) */}
        <div style={styles.previewSide}>
          <h2 style={styles.sideTitle}>Imprimir</h2>

          {/* Ações Principais do Topo */}
          <div style={styles.topActions}>
            <button 
              style={{...styles.btnPrimary, flex: 1, opacity: (!isReady || isGenerating) ? 0.6 : 1}}
              onClick={handleDownloadPDF}
              disabled={!isReady || isGenerating}
            >
              {isGenerating ? 'Aguarde...' : 'Baixar PDF'}
            </button>
            <button onClick={onClose} style={{...styles.btnSecondary, flex: 1}}>
              Cancelar
            </button>
          </div>

          <div style={styles.sideDivider}></div>

          {/* Secção de Destino / E-mail */}
          <div style={styles.settingGroup}>
            <label style={styles.settingLabel}>Destino / Enviar por E-mail</label>
            <select
              style={styles.selectInput}
              value={destinationEmail}
              onChange={(e) => setDestinationEmail(e.target.value)}
            >
              <option value="">Apenas Salvar no Computador</option>
              <option value="emefprofclelia@edu.imbe.rs.gov.br">emefprofclelia@edu.imbe.rs.gov.br</option>
              <option value="emefprofjusseniimbe@edu.imbe.rs.gov.br">emefprofjusseniimbe@edu.imbe.rs.gov.br</option>
              <option value="emefmanoelmendesimbe@edu.imbe.rs.gov.br">emefmanoelmendesimbe@edu.imbe.rs.gov.br</option>
              <option value="emefnorbertomartinhocardosoimbe@edu.imbe.rs.gov.br">emefnorbertomartinhocardosoimbe@edu.imbe.rs.gov.br</option>
              <option value="emefolavobilacimbe@edu.imbe.rs.gov.br">emefolavobilacimbe@edu.imbe.rs.gov.br</option>
              <option value="emefruibarbosaimbe@edu.imbe.rs.gov.br">emefruibarbosaimbe@edu.imbe.rs.gov.br</option>
              <option value="emefestadodesantacatarinaimbe@edu.imbe.rs.gov.br">emefestadodesantacatarinaimbe@edu.imbe.rs.gov.br</option>
              <option value="emeftiradentesimbe@edu.imbe.rs.gov.br">emeftiradentesimbe@edu.imbe.rs.gov.br</option>
              <option value="emeichapeuzinhovermelho@edu.imbe.rs.gov.br">emeichapeuzinhovermelho@edu.imbe.rs.gov.br</option>
              <option value="emeijardelinoperoni@edu.imbe.rs.gov.br">emeijardelinoperoni@edu.imbe.rs.gov.br</option>
              <option value="emeipeixinhodourado@edu.imbe.rs.gov.br">emeipeixinhodourado@edu.imbe.rs.gov.br</option>
              <option value="emeiprofiara@edu.imbe.rs.gov.br">emeiprofiara@edu.imbe.rs.gov.br</option>
              <option value="emeiprofpedrinha@edu.imbe.rs.gov.br">emeiprofpedrinha@edu.imbe.rs.gov.br</option>
              <option value="emeitiamarica@edu.imbe.rs.gov.br">emeitiamarica@edu.imbe.rs.gov.br</option>
              <option value="emeivojovino@edu.imbe.rs.gov.br">emeivojovino@edu.imbe.rs.gov.br</option>
              <option value="emeivorosa@edu.imbe.rs.gov.br">emeivorosa@edu.imbe.rs.gov.br</option>
              <option value="capebprofsoniabauerimbe@edu.imbe.rs.gov.br">capebprofsoniabauerimbe@edu.imbe.rs.gov.br</option>
              <option value="capeb2imbe@edu.imbe.rs.gov.br">capeb2imbe@edu.imbe.rs.gov.br</option>
              <option value="craeimbe@edu.imbe.rs.gov.br">craeimbe@edu.imbe.rs.gov.br</option>
              <option value="escolademusica@edu.imbe.rs.gov.br">escolademusica@edu.imbe.rs.gov.br</option>
            </select>
            
            {destinationEmail && (
              <button 
                style={{...styles.btnPrimary, backgroundColor: theme.accent, marginTop: '10px', width: '100%'}}
                onClick={handleGenerateAndSendEmail}
                disabled={!isReady || isGenerating || isSendingEmail}
              >
                {isSendingEmail ? 'Enviando...' : '✉️ Enviar para Escola'}
              </button>
            )}
          </div>

          <div style={styles.sideDivider}></div>

          {/* Outras Configurações */}
          <div style={styles.settingGroup}>
            <label style={styles.settingLabel}>Páginas</label>
            <div style={{ color: theme.textPrimary, fontSize: '0.9rem' }}>Tudo (1 página)</div>
          </div>

          <div style={styles.settingGroup}>
            <label style={styles.settingLabel}>Layout</label>
            <div style={{ color: theme.textPrimary, fontSize: '0.9rem' }}>Retrato</div>
          </div>

          <div style={styles.sideDivider}></div>

          <div style={{ flex: 1 }}></div>

          <button onClick={() => setStep('crop')} style={{...styles.btnSecondary, width: '100%', marginBottom: '12px'}}>
            Ajustar Foto do Aluno
          </button>

          {onMarkAsPrinted && (
            <button style={{...styles.btnSuccess, width: '100%'}} onClick={() => setShowConfirmModal(true)}>
              Concluído ✓
            </button>
          )}
        </div>
      </div>

      {/* Modal de Confirmação Final */}
      {showConfirmModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.confirmBox} className="pop-in">
            <h3 style={styles.confirmTitle}>Tudo pronto?</h3>
            <p style={styles.confirmText}>
              A carteirinha de <strong>{student.name}</strong> será marcada como emitida e sairá da lista de pendências.
            </p>
            <div style={styles.confirmActions}>
              <button onClick={() => setShowConfirmModal(false)} style={styles.btnSecondary}>Cancelar</button>
              <button onClick={handleFinalize} style={styles.btnSuccess}>Confirmar Emissão</button>
            </div>
          </div>
        </div>
      )}

      {/* Área Oculta para Geração do PDF */}
      <div style={{ position: 'fixed', top: 0, left: '-10000px', width: '290mm', height: '400mm', backgroundColor: 'white', zIndex: -1 }}>
        <div ref={printRef} style={{ width: '100%', height: '100%', backgroundColor: 'white', display: 'flex', justifyContent: 'center', paddingTop: '14mm' }}>
          <div style={{display: 'flex', width: '100%', justifyContent: 'center', gap: '0px'}}>
            <div style={{...styles.cardWrapper, zoom: 1}}><SingleCard student={student} styles={styles} base64Background={base64Bg} photoSrc={croppedPhoto} /></div>
            <div style={{...styles.cardWrapper, zoom: 1}}><SingleCard student={student} styles={styles} base64Background={base64Bg} photoSrc={croppedPhoto} /></div>
          </div>
        </div>
      </div>
      <style>{animationsAndStyles}</style>
    </div>
  );
};

const animationsAndStyles = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .fade-in { animation: fadeIn 0.3s ease-out forwards; }
  .pop-in { animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .minimal-slider { -webkit-appearance: none; width: 100%; background: transparent; cursor: pointer; }
  .minimal-slider:focus { outline: none; }
  .minimal-slider::-webkit-slider-runnable-track { width: 100%; height: 2px; cursor: pointer; background: ${theme.border}; border-radius: 2px; }
  .minimal-slider::-webkit-slider-thumb { height: 14px; width: 14px; border-radius: 50%; background: #ffffff; cursor: pointer; -webkit-appearance: none; margin-top: -6px; box-shadow: 0 0 8px rgba(0,0,0,0.5); transition: transform 0.1s; }
  .minimal-slider::-webkit-slider-thumb:hover { transform: scale(1.2); background: ${theme.accent}; }
`;

const styles = {
  overlay: { position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', backgroundColor: theme.bgPanel },
  panel: { width: '450px', height: '650px', backgroundColor: theme.bgPanel, borderRadius: '12px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)', animation: 'popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)', margin: 'auto' },
  header: { padding: '20px 24px', borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.bgHeader },
  title: { margin: 0, fontSize: '1.1rem', fontWeight: '600', color: theme.textPrimary },
  subtitle: { margin: '4px 0 0 0', fontSize: '0.85rem', color: theme.textSecondary },
  cropperContainer: { flex: 1, position: 'relative', backgroundColor: '#000', margin: '20px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${theme.border}` },
  controls: { padding: '0 24px 20px 24px' },
  label: { fontSize: '0.7rem', color: theme.textSecondary, fontWeight: '600', letterSpacing: '0.5px' },
  slider: { width: '100%' },
  footer: { padding: '16px 24px', borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: theme.bgHeader },
  
  // Layout do Chrome Print Dialog
  previewShell: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    backgroundColor: theme.bgPanel,
  },
  previewMain: {
    flex: 1,
    backgroundColor: theme.pdfBackground,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto',
    padding: '40px'
  },
  a4PageWrapper: {
    backgroundColor: 'white',
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    display: 'flex'
  },
  a4Page: { width: '210mm', height: '297mm', background: 'white', display: 'flex', justifyContent: 'center' },
  previewSide: {
    width: '340px',
    backgroundColor: theme.bgPanel,
    borderLeft: `1px solid ${theme.border}`,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-2px 0 10px rgba(0,0,0,0.2)',
    overflowY: 'auto'
  },
  sideTitle: { margin: '0 0 20px 0', fontSize: '1.3rem', fontWeight: '500', color: theme.textPrimary },
  topActions: { display: 'flex', gap: '10px' },
  sideDivider: { height: '1px', background: theme.border, margin: '20px 0' },
  settingGroup: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' },
  settingLabel: { fontSize: '0.85rem', color: theme.textSecondary, fontWeight: '500' },
  selectInput: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '4px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.bgHeader,
    color: theme.textPrimary,
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer'
  },

  // Botões e Cards
  btnPrimary: { padding: '10px 16px', borderRadius: '4px', border: `1px solid ${theme.accent}`, backgroundColor: theme.accent, color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' },
  btnSecondary: { padding: '10px 16px', borderRadius: '4px', border: `1px solid ${theme.border}`, backgroundColor: 'transparent', color: theme.textPrimary, cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s' },
  btnSuccess: { padding: '10px 16px', borderRadius: '4px', border: `1px solid ${theme.success}`, backgroundColor: theme.success, color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' },
  
  modalOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(2px)', animation: 'fadeIn 0.2s' },
  confirmBox: { width: '320px', backgroundColor: theme.bgPanel, padding: '24px', borderRadius: '12px', border: `1px solid ${theme.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
  confirmTitle: { margin: '0 0 12px 0', color: theme.textPrimary, fontSize: '1.1rem', fontWeight: '600' },
  confirmText: { margin: '0 0 24px 0', color: theme.textSecondary, fontSize: '0.9rem', lineHeight: '1.5' },
  confirmActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  
  cardWrapper: { width: '484px', height: '311px', position: 'relative' },
  cardContainer: { width: '100%', height: '100%', position: 'relative', overflow: 'hidden' },
};

export default CardGenerator;