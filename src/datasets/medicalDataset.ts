import { ScenarioDataset, TrainingSample } from '../types/scenario';
import { createRng, normalize, oneHot } from './datasetUtils';

const features = [
  {
    id: 'bodyTemperature',
    name: 'Temperatura Corporal (°C)',
    description: 'Aferição de temperatura axilar/timpânica do paciente',
    min: 35.0,
    max: 41.5,
    step: 0.1,
    defaultValue: 37.2,
    unit: '°C',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${v.toFixed(1)} °C`
  },
  {
    id: 'systolicBP',
    name: 'Pressão Sistólica (mmHg)',
    description: 'Pressão arterial máxima medida no momento da triagem',
    min: 80,
    max: 210,
    step: 5,
    defaultValue: 120,
    unit: 'mmHg',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)} mmHg`
  },
  {
    id: 'heartRate',
    name: 'Frequência Cardíaca (BPM)',
    description: 'Batimentos cardíacos por minuto em repouso',
    min: 40,
    max: 165,
    step: 1,
    defaultValue: 75,
    unit: 'bpm',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)} bpm`
  },
  {
    id: 'oxygenSaturation',
    name: 'Saturação de Oxigênio (SpO2 %)',
    description: 'Percentual de oxigenação sanguínea arterial via oxímetro',
    min: 78,
    max: 100,
    step: 1,
    defaultValue: 98,
    unit: '%',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)}%`
  },
  {
    id: 'painScale',
    name: 'Escala de Dor (0 a 10)',
    description: 'Intensidade da dor relatada pelo paciente',
    min: 0,
    max: 10,
    step: 1,
    defaultValue: 3,
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)} / 10`
  },
  {
    id: 'dyspneaLevel',
    name: 'Dificuldade Respiratória (Dispneia)',
    description: 'Gravidade relatada ou observada de falta de ar',
    min: 0,
    max: 3,
    step: 1,
    defaultValue: 0,
    type: 'select' as const,
    options: [
      { label: 'Ausente (Respiração normal)', value: 0 },
      { label: 'Leve (Esforço aos passos)', value: 1 },
      { label: 'Moderada (Fala entrecortada)', value: 2 },
      { label: 'Severa (Falta de ar em repouso)', value: 3 },
    ],
    formatDisplay: (v: number) => v === 0 ? 'Ausente' : v === 1 ? 'Leve' : v === 2 ? 'Moderada' : 'Severa'
  }
];

const outputClasses = [
  {
    index: 0,
    label: 'Pouco Urgente (Verde)',
    description: 'Quadro clínico estável. Atendimento ambulatorial padrão com tempo de espera seguro.',
    color: '#10b981',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    recommendationAction: 'Conduta: Encaminhar para consulta médica ambulatorial ou prescrição rotineira.'
  },
  {
    index: 1,
    label: 'Urgência Moderada (Amarelo)',
    description: 'Requer avaliação médica ágil e monitoramento para evitar agravamento clínico.',
    color: '#f59e0b',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    recommendationAction: 'Conduta: Posicionar em sala de observação e solicitar exames diagnósticos urgentes.'
  },
  {
    index: 2,
    label: 'Emergência Crítica (Vermelho)',
    description: 'Risco iminente à vida. Atendimento médico imediato com intervenção de suporte avançado.',
    color: '#f43f5e',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    recommendationAction: 'Conduta: Alerta vermelho! Acesso direto à Sala de Ressuscitação / UTI.'
  }
];

function generateMedicalSamples(): TrainingSample[] {
  const rng = createRng(999);
  const samples: TrainingSample[] = [];

  for (let i = 0; i < 100; i++) {
    const tier = i % 3; // 0: Verde, 1: Amarelo, 2: Vermelho

    let temp = 36.5;
    let bp = 120;
    let hr = 75;
    let spo2 = 98;
    let pain = 2;
    let dyspnea = 0;

    if (tier === 0) {
      // Stable
      temp = Math.round((36.2 + rng() * 1.3) * 10) / 10;
      bp = Math.round(110 + rng() * 25);
      hr = Math.round(60 + rng() * 25);
      spo2 = Math.round(96 + rng() * 4);
      pain = Math.round(rng() * 4);
      dyspnea = rng() > 0.85 ? 1 : 0;
    } else if (tier === 1) {
      // Moderate
      temp = Math.round((37.8 + rng() * 1.5) * 10) / 10;
      bp = Math.round(135 + rng() * 35);
      hr = Math.round(88 + rng() * 30);
      spo2 = Math.round(92 + rng() * 4);
      pain = Math.round(4 + rng() * 4);
      dyspnea = Math.round(1 + rng() * 1.2);
    } else {
      // Critical
      temp = Math.round((38.8 + rng() * 2.2) * 10) / 10;
      bp = rng() > 0.5 ? Math.round(175 + rng() * 35) : Math.round(80 + rng() * 15); // Severe hypertension or shock
      hr = Math.round(115 + rng() * 48);
      spo2 = Math.round(78 + rng() * 12); // SpO2 < 90
      pain = Math.round(8 + rng() * 2);
      dyspnea = Math.round(2 + rng() * 1);
    }

    const normTemp = normalize(temp, 35.0, 41.5);
    const normBp = normalize(bp, 80, 210);
    const normHr = normalize(hr, 40, 165);
    const normSpo2 = normalize(spo2, 78, 100);
    const normPain = normalize(pain, 0, 10);
    const normDyspnea = normalize(dyspnea, 0, 3);

    // Medical triage index score (higher indicates emergency)
    const hypoOxygenPenalty = (1 - normSpo2) * 3.5;
    const bpPenalty = Math.abs(bp - 120) / 80;
    const feverPenalty = Math.max(0, temp - 37.5) / 3.5;
    const dyspneaPenalty = normDyspnea * 2.0;
    const painPenalty = normPain * 0.8;

    const triageIndex = hypoOxygenPenalty + bpPenalty + feverPenalty + dyspneaPenalty + painPenalty;

    let targetClass = 0;
    if (triageIndex >= 2.5 || spo2 < 89 || dyspnea === 3) {
      targetClass = 2; // Emergência
    } else if (triageIndex >= 1.2 || spo2 < 94 || pain >= 6) {
      targetClass = 1; // Urgência Moderada
    } else {
      targetClass = 0; // Pouco Urgente
    }

    samples.push({
      id: i + 1,
      raw: {
        bodyTemperature: temp,
        systolicBP: bp,
        heartRate: hr,
        oxygenSaturation: spo2,
        painScale: pain,
        dyspneaLevel: dyspnea
      },
      inputXs: [normTemp, normBp, normHr, normSpo2, normPain, normDyspnea],
      tensorLabels: oneHot(targetClass, 3),
      labelName: outputClasses[targetClass].label
    });
  }

  return samples;
}

export const medicalDataset: ScenarioDataset = {
  scenarioId: 'medical',
  title: 'Triagem Médica Preliminar (Protocolo de Urgência)',
  category: 'HealthTech & Suporte Clínico',
  badge: 'Rede Neural Densa (Classificação Crítica)',
  description: 'Classifica a gravidade do quadro do paciente com base em sinais vitais e sintomas para priorização de atendimento hospitalar.',
  architectureDetails: 'Camada de Entrada (6 neurônios) → Densa (24 neurônios, LeakyReLU) → Dropout(0.15) → Densa (12 neurônios, ReLU) → Saída (3 neurônios, Softmax)',
  features,
  outputClasses,
  samples: generateMedicalSamples()
};
