# TensorFloat AI Dashboard ⚡ Client-Side Neural Networks

Uma aplicação web moderna (SPA) construída em **React 18**, **TypeScript**, **Tailwind CSS** e **TensorFlow.js (@tensorflow/tfjs)** que executa treinamento e inferência de redes neurais densas tabulares **100% no cliente (browser)**, sem necessidade de servidores de IA ou chamadas de API externas.

---

## 🚀 Funcionalidades Principais

### 1. Arquitetura e Navegação Estilo Dashboard
- **Sidebar Fixa:** Logo estilizada *TensorFloat AI*, status de aceleração de hardware (WebGL/CPU), monitor de tensores ativos e navegação entre os 6 cenários.
- **Alternância Dinâmica de Cenários:** Ao selecionar qualquer cenário, o sistema carrega o dataset com 100 amostras, dispara o treinamento da rede neural em tempo real, renderiza o progresso das épocas e libera o playground de inferência.
- **Explorador de Datasets (Modal):** Permite inspecionar todas as 100 amostras com visualização amigável de dados de negócio, tensores brutos (`inputXs` normalizados e `tensorLabels` em one-hot encoding) e distribuição estatística balanceada.

---

## 🧠 Os 6 Cenários Práticos de IA Implementados

Cada cenário possui **exatamente 100 casos de treino/teste** diversificados com variações estocásticas realistas, variáveis normalizadas no intervalo $[0, 1]$ e alvos codificados em *One-Hot*:

| # | Cenário | Categoria | Entradas (Features) | Saídas (Classes Softmax) |
|---|---|---|---|---|
| **01** | **Previsão de Churn** | Retenção & CS | 6 (Tempo de casa, fatura mensal, tipo de contrato, suporte dedicado, tickets de suporte, atraso de pagamento) | 2 (`Cliente Fiel`, `Risco de Churn`) |
| **02** | **Credit Scoring** | Fintech & Risco | 6 (Pontuação Serasa, comprometimento de renda, estabilidade no emprego, inadimplências prévias, razão empréstimo/renda, idade) | 3 (`Aprovado`, `Análise Manual`, `Reprovado`) |
| **03** | **Recomendação de Produtos** | E-Commerce | 5 (Afinidade tech, afinidade moda, afinidade casa/decor, horas semanais de games, ticket médio AOV) | 4 (`Tech & Eletrônicos`, `Moda & Vestuário`, `Casa & Decor`, `Games & Streaming`) |
| **04** | **Triagem Médica Preliminar** | HealthTech | 6 (Temperatura corporal, pressão sistólica, frequência cardíaca, saturação SpO2, escala de dor, dispneia) | 3 (`Pouco Urgente - Verde`, `Moderado - Amarelo`, `Emergência - Vermelho`) |
| **05** | **Qualificação de Leads (CRM)** | Vendas B2B | 6 (Sessões no site, downloads de whitepapers, porte da empresa, autoridade/cargo, engajamento em e-mails, status de orçamento) | 3 (`Lead Frio`, `Lead Morno`, `Lead Quente - SQL`) |
| **06** | **Automação de IoT e Energia** | Smart Buildings | 6 (Temperatura interna, temperatura externa, contagem de ocupação, radiação solar, tarifa horária de pico, umidade) | 3 (`Modo Eco`, `Modo Conforto`, `Modo Alta Demanda`) |

---

## 🛠️ Stack Tecnológica

- **Front-end:** React 18 (SPA), TypeScript
- **Engine de IA:** `@tensorflow/tfjs` (v4.22+) executando em WebGL / CPU
- **Estilização:** Tailwind CSS com paleta Dark Mode refinada, efeitos glassmorphism e animações fluidas
- **Ícones:** `lucide-react`
- **Build Tool:** Vite 6

---

## 🏃 Como Executar Localmente

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou pnpm

### Passos de Instalação e Execução

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   A aplicação abrirá automaticamente em `http://localhost:3000`.

3. **Gerar build de produção:**
   ```bash
   npm run build
   ```

4. **Visualizar build gerado:**
   ```bash
   npm run preview
   ```

---

## 📁 Estrutura do Projeto

```
tensorfloat/
├── index.html                 # Ponto de entrada HTML com fontes e tema dark
├── package.json               # Dependências (@tensorflow/tfjs, react, tailwindcss, lucide)
├── tsconfig.json              # Configuração TypeScript ES2020
├── vite.config.ts             # Configuração do Vite com React plugin
├── tailwind.config.js         # Tema customizado (cores cyber/brand e animações)
└── src/
    ├── main.tsx               # Bootstrap do React
    ├── App.tsx                # Orquestrador de estado e layout principal
    ├── index.css              # Estilos globais e scrollbars
    ├── types/
    │   └── scenario.ts        # Interfaces TypeScript (Dataset, Feature, Metrics, Prediction)
    ├── datasets/
    │   ├── datasetUtils.ts    # Gerador PRNG reprodutível, normalizador e one-hot encoder
    │   ├── churnDataset.ts    # 100 amostras estruturadas de Previsão de Churn
    │   ├── creditDataset.ts   # 100 amostras estruturadas de Credit Scoring
    │   ├── recommendationDataset.ts # 100 amostras de Recomendação de Produtos
    │   ├── medicalDataset.ts  # 100 amostras de Triagem Médica de Urgência
    │   ├── leadsDataset.ts    # 100 amostras de CRM Lead Scoring
    │   ├── iotEnergyDataset.ts# 100 amostras de Automação IoT / HVAC
    │   └── index.ts           # Catálogo unificado dos cenários
    ├── services/
    │   └── tfModelService.ts  # Compilação, treinamento assíncrono e inferência TensorFlow.js
    └── components/
        ├── Sidebar.tsx        # Navegação com 6 cenários e telemetria de hardware
        ├── Header.tsx         # Barra de título, status e ações rápidas
        ├── TrainingDashboard.tsx # Progresso em tempo real, KPIs e gráfico SVG das épocas
        ├── InferencePanel.tsx # Sliders interativos, presets e visualizador de probabilidades
        ├── DatasetViewerModal.tsx # Inspeção completa das 100 amostras e tensores
        └── ScenarioView.tsx   # Visão combinada de treinamento + inferência
```
