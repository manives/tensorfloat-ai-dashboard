import { ScenarioDataset, TrainingSample } from '../types/scenario';
import { createRng, normalize, oneHot } from './datasetUtils';

const features = [
  {
    id: 'websiteSessions',
    name: 'Sessões no Site (Últimos 30d)',
    description: 'Frequência de acessos a páginas institucionais e de preços',
    min: 0,
    max: 30,
    step: 1,
    defaultValue: 8,
    unit: 'visitas',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)} visitas`
  },
  {
    id: 'contentDownloads',
    name: 'Materiais & Whitepapers Baixados',
    description: 'Número de formulários de conversão e materiais técnicos acessados',
    min: 0,
    max: 10,
    step: 1,
    defaultValue: 2,
    unit: 'downloads',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)} materiais`
  },
  {
    id: 'companySize',
    name: 'Porte da Empresa Contratante',
    description: 'Faixa de número de colaboradores da organização',
    min: 0,
    max: 1,
    step: 0.33,
    defaultValue: 0.33,
    type: 'select' as const,
    options: [
      { label: 'Microempresa (1 - 10 func)', value: 0 },
      { label: 'Pequena (11 - 50 func)', value: 0.33 },
      { label: 'Média (51 - 200 func)', value: 0.66 },
      { label: 'Enterprise (200+ func)', value: 1.0 },
    ],
    formatDisplay: (v: number) => v < 0.2 ? 'Micro' : v < 0.5 ? 'Pequena' : v < 0.8 ? 'Média' : 'Enterprise'
  },
  {
    id: 'decisionRole',
    name: 'Cargo do Lead (Poder de Decisão)',
    description: 'Autoridade formal para aprovar contratação de software',
    min: 0,
    max: 1,
    step: 0.25,
    defaultValue: 0.5,
    type: 'select' as const,
    options: [
      { label: 'Operacional / Estudante', value: 0.1 },
      { label: 'Analista / Especialista', value: 0.4 },
      { label: 'Gerente / Coordenador', value: 0.75 },
      { label: 'C-Level / Sócio / Diretor', value: 1.0 },
    ],
    formatDisplay: (v: number) => v <= 0.2 ? 'Operacional' : v <= 0.5 ? 'Analista' : v <= 0.8 ? 'Gerência' : 'C-Level'
  },
  {
    id: 'emailEngagement',
    name: 'Taxa de Abertura / Cliques em E-mails',
    description: 'Engajamento com comunicações e sequências de e-mail marketing',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 45,
    unit: '%',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)}%`
  },
  {
    id: 'budgetStatus',
    name: 'Status de Orçamento (Budget)',
    description: 'Alocação orçamentária pré-existente para o projeto',
    min: 0,
    max: 1,
    step: 0.5,
    defaultValue: 0.5,
    type: 'select' as const,
    options: [
      { label: 'Sem orçamento previsto', value: 0 },
      { label: 'Em fase de planejamento / indefinição', value: 0.5 },
      { label: 'Verba aprovada e alocada', value: 1.0 },
    ],
    formatDisplay: (v: number) => v === 0 ? 'Sem verba' : v === 0.5 ? 'Em definição' : 'Aprovada'
  }
];

const outputClasses = [
  {
    index: 0,
    label: 'Lead Frio (Desqualificado)',
    description: 'Baixo engajamento ou sem fit de perfil com a persona da solução.',
    color: '#64748b',
    badgeBg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    recommendationAction: 'Ação: Manter em automação de newsletter geral; não acionar executivo de vendas.'
  },
  {
    index: 1,
    label: 'Lead Morno (Nutrição Ativa)',
    description: 'Demonstra interesse mas ainda está maturando a dor ou sem poder decisório imediato.',
    color: '#38bdf8',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    recommendationAction: 'Ação: Inscrever em trilha de nutrição de cases de sucesso e convite para webinar.'
  },
  {
    index: 2,
    label: 'Lead Quente (Sales Qualified / SQL)',
    description: 'Tomador de decisão com alto engajamento e orçamento disponível.',
    color: '#22c55e',
    badgeBg: 'bg-green-500/10 text-green-400 border-green-500/30',
    recommendationAction: 'Ação: Agendar reunião de demonstração executiva com o time de vendas (SDR/Closer).'
  }
];

function generateLeadsSamples(): TrainingSample[] {
  const rng = createRng(777);
  const samples: TrainingSample[] = [];

  for (let i = 0; i < 100; i++) {
    const tier = i % 3;

    let visits = 0;
    let downloads = 0;
    let size = 0.33;
    let role = 0.4;
    let email = 20;
    let budget = 0;

    if (tier === 0) {
      // Cold
      visits = Math.round(rng() * 4);
      downloads = Math.round(rng() * 1);
      size = rng() > 0.6 ? 0.33 : 0;
      role = rng() > 0.7 ? 0.4 : 0.1;
      email = Math.round(rng() * 20);
      budget = 0;
    } else if (tier === 1) {
      // Warm
      visits = Math.round(4 + rng() * 10);
      downloads = Math.round(1 + rng() * 4);
      size = rng() > 0.4 ? 0.66 : 0.33;
      role = rng() > 0.5 ? 0.75 : 0.4;
      email = Math.round(30 + rng() * 40);
      budget = rng() > 0.6 ? 0.5 : 0;
    } else {
      // Hot
      visits = Math.round(12 + rng() * 18);
      downloads = Math.round(3 + rng() * 7);
      size = rng() > 0.3 ? 1.0 : 0.66;
      role = rng() > 0.25 ? 1.0 : 0.75;
      email = Math.round(65 + rng() * 35);
      budget = rng() > 0.25 ? 1.0 : 0.5;
    }

    const normVisits = normalize(visits, 0, 30);
    const normDownloads = normalize(downloads, 0, 10);
    const normSize = size;
    const normRole = role;
    const normEmail = normalize(email, 0, 100);
    const normBudget = budget;

    // Lead quality formula
    const leadScore =
      normVisits * 0.18 +
      normDownloads * 0.14 +
      normSize * 0.18 +
      normRole * 0.24 +
      normEmail * 0.12 +
      normBudget * 0.14;

    let targetClass = 0;
    if (leadScore >= 0.58 && budget > 0) {
      targetClass = 2; // Hot
    } else if (leadScore >= 0.32) {
      targetClass = 1; // Warm
    } else {
      targetClass = 0; // Cold
    }

    samples.push({
      id: i + 1,
      raw: {
        websiteSessions: visits,
        contentDownloads: downloads,
        companySize: size,
        decisionRole: role,
        emailEngagement: email,
        budgetStatus: budget
      },
      inputXs: [normVisits, normDownloads, normSize, normRole, normEmail, normBudget],
      tensorLabels: oneHot(targetClass, 3),
      labelName: outputClasses[targetClass].label
    });
  }

  return samples;
}

export const leadsDataset: ScenarioDataset = {
  scenarioId: 'leads',
  title: 'Qualificação de Leads de Vendas (CRM Scoring)',
  category: 'Vendas B2B & Marketing Digital',
  badge: 'Rede Neural Densa (Lead Scoring)',
  description: 'Calcula a propensão de conversão comercial de leads B2B analisando engajamento digital, autoridade e orçamento disponível.',
  architectureDetails: 'Camada de Entrada (6 neurônios) → Densa (16 neurônios, ReLU) → Densa (10 neurônios, ReLU) → Saída (3 neurônios, Softmax)',
  features,
  outputClasses,
  samples: generateLeadsSamples()
};
