import { ScenarioDataset, TrainingSample } from '../types/scenario';
import { createRng, normalize, oneHot } from './datasetUtils';

const features = [
  {
    id: 'tenureMonths',
    name: 'Tempo de Contrato (Meses)',
    description: 'Duração da permanência do cliente na empresa',
    min: 1,
    max: 72,
    step: 1,
    defaultValue: 18,
    unit: 'meses',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)} meses`
  },
  {
    id: 'monthlyCharges',
    name: 'Fatura Mensal (R$)',
    description: 'Valor cobrado na assinatura mensal do plano',
    min: 30,
    max: 250,
    step: 5,
    defaultValue: 95,
    unit: 'R$',
    type: 'slider' as const,
    formatDisplay: (v: number) => `R$ ${v.toFixed(2)}`
  },
  {
    id: 'contractType',
    name: 'Tipo de Contrato',
    description: 'Fidelidade e periodicidade da assinatura',
    min: 0,
    max: 1,
    step: 0.5,
    defaultValue: 0,
    type: 'select' as const,
    options: [
      { label: 'Mensal (Sem fidelidade)', value: 0 },
      { label: 'Anual (Fidelidade 12m)', value: 0.5 },
      { label: 'Bienal (Fidelidade 24m)', value: 1.0 },
    ],
    formatDisplay: (v: number) => v === 0 ? 'Mensal' : v === 0.5 ? 'Anual' : 'Bienal'
  },
  {
    id: 'techSupport',
    name: 'Suporte Técnico Dedicado',
    description: 'Inclusão de atendimento prioritário no plano',
    min: 0,
    max: 1,
    step: 1,
    defaultValue: 0,
    type: 'toggle' as const,
    options: [
      { label: 'Não', value: 0 },
      { label: 'Sim', value: 1 },
    ],
    formatDisplay: (v: number) => v >= 0.5 ? 'Sim' : 'Não'
  },
  {
    id: 'supportTickets',
    name: 'Chamados de Reclamação (Mês)',
    description: 'Número de contatos de reclamação nos últimos 30 dias',
    min: 0,
    max: 8,
    step: 1,
    defaultValue: 2,
    unit: 'tickets',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)} chamados`
  },
  {
    id: 'paymentDelayDays',
    name: 'Dias de Atraso no Pagamento',
    description: 'Média de dias decorridos após o vencimento da fatura',
    min: 0,
    max: 30,
    step: 1,
    defaultValue: 3,
    unit: 'dias',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)} dias`
  }
];

const outputClasses = [
  {
    index: 0,
    label: 'Cliente Fiel (Baixo Risco)',
    description: 'Alta probabilidade de continuidade e satisfação com o serviço.',
    color: '#10b981',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    recommendationAction: 'Ação Recomendada: Ofertar upgrade de plano ou benefício de fidelidade.'
  },
  {
    index: 1,
    label: 'Risco de Churn (Cancelamento)',
    description: 'Alta probabilidade de cancelamento ou rescisão contratual a curto prazo.',
    color: '#f43f5e',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    recommendationAction: 'Ação Recomendada: Acionar Customer Success imediatamente com desconto ou retenção.'
  }
];

function generateChurnSamples(): TrainingSample[] {
  const rng = createRng(42);
  const samples: TrainingSample[] = [];

  for (let i = 0; i < 100; i++) {
    // 50% target class 0 (Loyal), 50% target class 1 (Churn)
    const isChurnTarget = i < 50;

    let tenure: number;
    let charges: number;
    let contract: number;
    let techSupport: number;
    let tickets: number;
    let delay: number;

    if (isChurnTarget) {
      // Churn profile: shorter tenure, higher charges, monthly contract, less tech support, more tickets & delays
      tenure = Math.round(1 + rng() * 18); // 1 to 19 months
      charges = 100 + rng() * 140; // 100 to 240 R$
      contract = rng() > 0.8 ? 0.5 : 0; // mostly monthly
      techSupport = rng() > 0.75 ? 1 : 0;
      tickets = Math.round(2 + rng() * 6); // 2 to 8 tickets
      delay = Math.round(5 + rng() * 25); // 5 to 30 days
    } else {
      // Loyal profile: longer tenure, reasonable charges, annual/biennial contract, tech support, few tickets & delays
      tenure = Math.round(14 + rng() * 58); // 14 to 72 months
      charges = 30 + rng() * 120; // 30 to 150 R$
      contract = rng() > 0.3 ? (rng() > 0.5 ? 1.0 : 0.5) : 0;
      techSupport = rng() > 0.3 ? 1 : 0;
      tickets = Math.round(rng() * 2); // 0 to 2 tickets
      delay = Math.round(rng() * 4); // 0 to 4 days
    }

    // Occasional edge-cases to provide realistic noise
    if (rng() < 0.08) {
      tickets = Math.round(rng() * 7);
      delay = Math.round(rng() * 20);
    }

    // Compute final class mathematically based on a weighted risk score
    const normTenure = normalize(tenure, 1, 72);
    const normCharges = normalize(charges, 30, 250);
    const normContract = contract;
    const normTech = techSupport;
    const normTickets = normalize(tickets, 0, 8);
    const normDelay = normalize(delay, 0, 30);

    const churnRiskScore =
      (1 - normTenure) * 0.25 +
      normCharges * 0.15 +
      (1 - normContract) * 0.2 +
      (1 - normTech) * 0.1 +
      normTickets * 0.2 +
      normDelay * 0.1;

    const labelIndex = churnRiskScore >= 0.48 ? 1 : 0;

    samples.push({
      id: i + 1,
      raw: {
        tenureMonths: tenure,
        monthlyCharges: Math.round(charges * 100) / 100,
        contractType: contract,
        techSupport: techSupport,
        supportTickets: tickets,
        paymentDelayDays: delay
      },
      inputXs: [normTenure, normCharges, normContract, normTech, normTickets, normDelay],
      tensorLabels: oneHot(labelIndex, 2),
      labelName: outputClasses[labelIndex].label
    });
  }

  return samples;
}

export const churnDataset: ScenarioDataset = {
  scenarioId: 'churn',
  title: 'Previsão de Churn (Cancelamento de Clientes)',
  category: 'Retenção & Customer Success',
  badge: 'Rede Neural Densa (Classificação)',
  description: 'Detecta padrões de insatisfação e prevê com antecedência se um assinante cancelará o serviço.',
  architectureDetails: 'Camada de Entrada (6 neurônios) → Densa (16 neurônios, ReLU) → Dropout(0.1) → Densa (8 neurônios, ReLU) → Saída (2 neurônios, Softmax)',
  features,
  outputClasses,
  samples: generateChurnSamples()
};
