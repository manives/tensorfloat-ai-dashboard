import { ScenarioDataset, TrainingSample } from '../types/scenario';
import { createRng, normalize, oneHot } from './datasetUtils';

const features = [
  {
    id: 'creditScore',
    name: 'Pontuação de Score (300 - 850)',
    description: 'Score de crédito histórico do birô financeiro',
    min: 300,
    max: 850,
    step: 10,
    defaultValue: 650,
    unit: 'pts',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)} pts`
  },
  {
    id: 'debtToIncome',
    name: 'Comprometimento de Renda (%)',
    description: 'Percentual do salário mensal já comprometido com dívidas ativas',
    min: 5,
    max: 70,
    step: 1,
    defaultValue: 30,
    unit: '%',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)}%`
  },
  {
    id: 'employmentYears',
    name: 'Tempo de Trabalho Atual (Anos)',
    description: 'Estabilidade profissional no emprego atual',
    min: 0,
    max: 20,
    step: 0.5,
    defaultValue: 4,
    unit: 'anos',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${v.toFixed(1)} anos`
  },
  {
    id: 'previousDefaults',
    name: 'Histórico de Inadimplência',
    description: 'Número de restrições ou negativações nos últimos 5 anos',
    min: 0,
    max: 4,
    step: 1,
    defaultValue: 0,
    type: 'select' as const,
    options: [
      { label: 'Nenhuma (Limpo)', value: 0 },
      { label: '1 Ocorrência quitada', value: 1 },
      { label: '2 Ocorrências', value: 2 },
      { label: '3 ou mais Ocorrências', value: 3 },
    ],
    formatDisplay: (v: number) => v === 0 ? 'Nenhuma' : `${v} ocorrência(s)`
  },
  {
    id: 'loanToAnnualIncome',
    name: 'Relação Empréstimo / Renda Anual',
    description: 'Valor solicitado dividido pela renda anual total',
    min: 0.1,
    max: 1.2,
    step: 0.05,
    defaultValue: 0.35,
    type: 'slider' as const,
    formatDisplay: (v: number) => `${(v * 100).toFixed(0)}% da renda anual`
  },
  {
    id: 'age',
    name: 'Idade do Solicitante',
    description: 'Faixa etária do cliente',
    min: 18,
    max: 72,
    step: 1,
    defaultValue: 36,
    unit: 'anos',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)} anos`
  }
];

const outputClasses = [
  {
    index: 0,
    label: 'Aprovado (Baixo Risco)',
    description: 'Excelente perfil de crédito, liberação imediata da linha com taxas competitivas.',
    color: '#10b981',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    recommendationAction: 'Ação: Liberar contrato com aprovação instantânea e taxa de juros prime.'
  },
  {
    index: 1,
    label: 'Análise Manual (Risco Moderado)',
    description: 'Perfil intermediário que requer comprovação adicional de renda ou garantias.',
    color: '#f59e0b',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    recommendationAction: 'Ação: Solicitar holerite atualizado ou avalista para mitigar risco.'
  },
  {
    index: 2,
    label: 'Reprovado (Alto Risco)',
    description: 'Probabilidade de inadimplência fora dos parâmetros aceitáveis de concessão.',
    color: '#f43f5e',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    recommendationAction: 'Ação: Recusar proposta e recomendar regularização cadastral.'
  }
];

function generateCreditSamples(): TrainingSample[] {
  const rng = createRng(108);
  const samples: TrainingSample[] = [];

  for (let i = 0; i < 100; i++) {
    // Generate across 3 balanced segments with natural distributions
    const cohort = i % 3; // 0: approved target, 1: moderate target, 2: rejected target

    let score: number;
    let dti: number;
    let empYears: number;
    let defaults: number;
    let loanRatio: number;
    let age: number;

    if (cohort === 0) {
      // High quality profile
      score = Math.round(700 + rng() * 150);
      dti = Math.round(8 + rng() * 22);
      empYears = Math.round((3 + rng() * 15) * 10) / 10;
      defaults = rng() > 0.9 ? 1 : 0;
      loanRatio = Math.round((0.1 + rng() * 0.3) * 100) / 100;
      age = Math.round(26 + rng() * 40);
    } else if (cohort === 1) {
      // Moderate profile
      score = Math.round(560 + rng() * 140);
      dti = Math.round(25 + rng() * 28);
      empYears = Math.round((1 + rng() * 6) * 10) / 10;
      defaults = rng() > 0.6 ? 1 : (rng() > 0.8 ? 2 : 0);
      loanRatio = Math.round((0.3 + rng() * 0.4) * 100) / 100;
      age = Math.round(22 + rng() * 45);
    } else {
      // High risk profile
      score = Math.round(300 + rng() * 260);
      dti = Math.round(45 + rng() * 25);
      empYears = Math.round(rng() * 3 * 10) / 10;
      defaults = Math.round(1 + rng() * 3);
      loanRatio = Math.round((0.55 + rng() * 0.6) * 100) / 100;
      age = Math.round(19 + rng() * 50);
    }

    // Occasional outlier/noise
    if (rng() < 0.06) {
      score = Math.round(400 + rng() * 380);
      dti = Math.round(20 + rng() * 35);
    }

    const normScore = normalize(score, 300, 850);
    const normDti = normalize(dti, 5, 70);
    const normEmp = normalize(empYears, 0, 20);
    const normDef = normalize(defaults, 0, 4);
    const normLoan = normalize(loanRatio, 0.1, 1.2);
    const normAge = normalize(age, 18, 72);

    // Score evaluation: higher means lower risk
    const creditIndex =
      normScore * 0.38 +
      (1 - normDti) * 0.22 +
      normEmp * 0.12 +
      (1 - normDef) * 0.18 +
      (1 - normLoan) * 0.10;

    let finalClass = 0;
    if (creditIndex >= 0.62) {
      finalClass = 0; // Aprovado
    } else if (creditIndex >= 0.42) {
      finalClass = 1; // Análise Manual
    } else {
      finalClass = 2; // Reprovado
    }

    samples.push({
      id: i + 1,
      raw: {
        creditScore: score,
        debtToIncome: dti,
        employmentYears: empYears,
        previousDefaults: defaults,
        loanToAnnualIncome: loanRatio,
        age
      },
      inputXs: [normScore, normDti, normEmp, normDef, normLoan, normAge],
      tensorLabels: oneHot(finalClass, 3),
      labelName: outputClasses[finalClass].label
    });
  }

  return samples;
}

export const creditDataset: ScenarioDataset = {
  scenarioId: 'credit',
  title: 'Credit Scoring (Análise de Risco de Crédito)',
  category: 'Fintech & Análise de Risco',
  badge: 'Rede Neural Densa (Multiclasse)',
  description: 'Avalia solvência financeira e probabilidade de inadimplência categorizando solicitações em 3 faixas de risco.',
  architectureDetails: 'Camada de Entrada (6 neurônios) → Densa (20 neurônios, ReLU) → Batch Normalization → Densa (12 neurônios, ReLU) → Saída (3 neurônios, Softmax)',
  features,
  outputClasses,
  samples: generateCreditSamples()
};
