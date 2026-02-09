# School Transport System - Documentação Técnica

Sistema de gestão de transporte e emissão de carteirinhas escolares.

## Arquitetura

O projeto é dividido em duas partes independentes (Monorepo):

- **`client/` (Frontend):** Desenvolvido em React + Vite. Responsável pela interface, cálculos de GPS e geração do PDF.
- **`server/` (Backend):** Desenvolvido em Node.js + Express. Responsável pela API, autenticação JWT e persistência de dados.

---

## Lógica Principal (Frontend)

### 1. Sistema de Roteirização (`src/utils/gpsUtils.js`)

O algoritmo implementado segue 3 etapas para garantir a precisão:

1. **Geocodificação:** Converte o endereço textual do aluno em coordenadas exatas (Latitude/Longitude) utilizando a **Google Maps Geocoding API**.
2. **Proximidade (Haversine):** Calcula a distância matemática entre a residência do aluno e todas as paradas disponíveis em todas as rotas.
3. **Validação de Sentido (Índice Sequencial):**
   - O sistema identifica o índice da parada na **Casa** (X).
   - O sistema identifica o índice da parada na **Escola** (Y).
   
   > **Regra de Validação:** A rota só é considerada válida se `Índice Casa < Índice Escola`. Isso assegura logicamente que o ônibus passará na residência *antes* de chegar ao destino escolar.



### 2. Geração de Carteirinhas (`src/components/CardGenerator.jsx`)

O processo de geração do documento PDF ocorre inteiramente no navegador do cliente (`client-side`), evitando sobrecarga no servidor:

- **Crop de Imagem:** Utiliza a biblioteca `react-easy-crop` para garantir que a foto do aluno esteja na proporção 3x4 correta e centralizada.
- **Seleção de Fundo Condicional:**
  - O sistema verifica o nome da escola selecionada no cadastro.
  - **Escolas Estaduais:** (ex: *IEE Barão, 9 de Maio*) carregam automaticamente o asset `fundo-carteirinha-estadual.png`.
  - **Demais Escolas:** Utilizam o asset padrão `fundo-carteirinha.png`.
- **Renderização:** Utiliza `html2canvas` para rasterizar o elemento HTML visual e `jspdf` para converter essa imagem em um arquivo PDF A4 formatado para impressão.
