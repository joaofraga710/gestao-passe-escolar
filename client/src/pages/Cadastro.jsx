import React, { useState } from 'react';
import '../styles/StudentModal.css'; // Podemos reaproveitar o CSS do modal ou criar um novo

const Cadastro = () => {
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    escola: '',
    serie: '',
    endereco: '',
    foto: '' // Aqui vai a string base64 da imagem
  });

  // Função para converter arquivo em texto (Base64)
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Opcional: Validar tamanho (ex: max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("A foto é muito grande! Tente uma menor que 2MB.");
        return;
      }
      const base64 = await convertToBase64(file);
      setFormData({ ...formData, foto: base64 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // URL do seu Script (que está no .env)
      const API_URL = import.meta.env.VITE_API_URL; 
      
      // O fetch padrão as vezes bloqueia CORS com Google Script, 
      // mas enviando stringify no body costuma funcionar com 'no-cors' ou redirect handling
      await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(formData)
      });

      // O Google Apps Script não retorna JSON limpo fácil via browser por causa de CORS,
      // então se não der erro no fetch, assumimos sucesso.
      setSucesso(true);
      
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="container-sucesso" style={{textAlign: 'center', padding: '50px', color: 'white'}}>
        <h1>✅ Solicitação Enviada!</h1>
        <p>Recebemos seus dados e sua foto.</p>
        <p>Aguarde a confecção da sua carteirinha.</p>
        <button onClick={() => window.location.reload()} style={{marginTop: '20px', padding: '10px 20px'}}>
          Nova Solicitação
        </button>
      </div>
    );
  }

  return (
    <div className="cadastro-container" style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', color: 'white' }}>
      <h2>🚌 Novo Passe Escolar</h2>
      <p style={{marginBottom: '20px', opacity: 0.8}}>Preencha os dados e anexe uma foto do rosto.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <input 
          type="text" 
          placeholder="Nome Completo do Aluno" 
          required 
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
          style={{padding: '12px', borderRadius: '8px', border: 'none'}}
        />

        <input 
          type="text" 
          placeholder="Nome da Escola" 
          required 
          value={formData.escola}
          onChange={(e) => setFormData({...formData, escola: e.target.value})}
          style={{padding: '12px', borderRadius: '8px', border: 'none'}}
        />

        <input 
          type="text" 
          placeholder="Série / Turma" 
          required 
          value={formData.serie}
          onChange={(e) => setFormData({...formData, serie: e.target.value})}
          style={{padding: '12px', borderRadius: '8px', border: 'none'}}
        />

        <input 
          type="text" 
          placeholder="Endereço / Bairro" 
          required 
          value={formData.endereco}
          onChange={(e) => setFormData({...formData, endereco: e.target.value})}
          style={{padding: '12px', borderRadius: '8px', border: 'none'}}
        />

        <div style={{background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px'}}>
          <label style={{display: 'block', marginBottom: '10px'}}>📸 Foto para a Carteirinha:</label>
          <input 
            type="file" 
            accept="image/*" 
            required 
            onChange={handleFileChange}
            style={{color: 'white'}}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !formData.foto}
          style={{
            padding: '15px', 
            borderRadius: '50px', 
            border: 'none', 
            background: loading ? '#555' : '#4CAF50', 
            color: 'white', 
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Enviando...' : 'ENVIAR SOLICITAÇÃO'}
        </button>

      </form>
    </div>
  );
};

export default Cadastro;