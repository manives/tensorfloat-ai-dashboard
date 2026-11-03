import { ScenarioDataset, TrainingSample } from '../types/scenario';
import { createRng, normalize, oneHot } from './datasetUtils';

const features = [
  {
    id: 'roomTemperature',
    name: 'Temperatura Interna Atual (°C)',
    description: 'Leitura do termostato interno no ambiente monitorado',
    min: 16,
    max: 36,
    step: 0.5,
    defaultValue: 24.5,
    unit: '°C',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${v.toFixed(1)} °C`
  },
  {
    id: 'ambientExternalTemp',
    name: 'Temperatura Externa (°C)',
    description: 'Temperatura externa aferida pelos sensores climáticos prediais',
    min: 10,
    max: 42,
    step: 0.5,
    defaultValue: 29.0,
    unit: '°C',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${v.toFixed(1)} °C`
  },
  {
    id: 'occupancyCount',
    name: 'Ocupação de Pessoas no Recinto',
    description: 'Contagem de presença detectada por sensores ópticos e de movimento',
    min: 0,
    max: 30,
    step: 1,
    defaultValue: 8,
    unit: 'pessoas',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)} pessoas`
  },
  {
    id: 'solarRadiation',
    name: 'Incidência Solar / Radiação Térmica',
    description: 'Nível de radiação solar direta nas fachadas e janelas',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 40,
    unit: '%',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)}%`
  },
  {
    id: 'tariffPrice',
    name: 'Tarifa de Energia Atual (Bandeira)',
    description: 'Custo tarifário da concessionária de energia por horário',
    min: 0,
    max: 1,
    step: 0.5,
    defaultValue: 0,
    type: 'select' as const,
    options: [
      { label: 'Fora de Ponta (Bandeira Verde / Econômica)', value: 0 },
      { label: 'Intermediária (Bandeira Amarela)', value: 0.5 },
      { label: 'Horário de Pico (Bandeira Vermelha / Alta)', value: 1.0 },
    ],
    formatDisplay: (v: number) => v === 0 ? 'Verde (Baixa)' : v === 0.5 ? 'Amarela (Média)' : 'Vermelha (Pico)'
  },
  {
    id: 'humidity',
    name: 'Umidade Relativa do Ar (%)',
    description: 'Sensor higrômetro interno para controle de ponto de orvalho',
    min: 20,
    max: 90,
    step: 1,
    defaultValue: 55,
    unit: '%',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)}%`
  }
];

const outputClasses = [
  {
    index: 0,
    label: 'Modo Eco / Conservação Máxima',
    description: 'Desativa compressores auxiliares e mantém ventilação mínima para economizar até 45% de energia.',
    color: '#10b981',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    recommendationAction: 'Ação do Sistema: Reduzir ciclo do chiller e acionar venezianas inteligentes.'
  },
  {
    index: 1,
    label: 'Modo Conforto Balanceado',
    description: 'Operação padrão com regulação térmica ideal mantendo temperatura entre 22°C e 24°C.',
    color: '#3b82f6',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    recommendationAction: 'Ação do Sistema: Manter compressores em frequência nominal e controle PID ativo.'
  },
  {
    index: 2,
    label: 'Modo Alta Demanda / Climatização Potente',
    description: 'Potência máxima do HVAC ativada para compensar alta ocupação ou calor extremo externo.',
    color: '#f97316',
    badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    recommendationAction: 'Ação do Sistema: Ligar compressores secundários e ventiladores em rotação máxima.'
  }
];

function generateIoTSamples(): TrainingSample[] {
  const rng = createRng(444);
  const samples: TrainingSample[] = [];

  for (let i = 0; i < 100; i++) {
    const mode = i % 3;

    let roomTemp = 24.0;
    let extTemp = 25.0;
    let occupancy = 5;
    let solar = 30;
    let tariff = 0;
    let humidity = 50;

    if (mode === 0) {
      // Eco friendly conditions: few people, pleasant temp or high tariff
      roomTemp = Math.round((19 + rng() * 4) * 10) / 10;
      extTemp = Math.round((18 + rng() * 6) * 10) / 10;
      occupancy = Math.round(rng() * 3);
      solar = Math.round(rng() * 25);
      tariff = rng() > 0.4 ? 1.0 : 0.5;
      humidity = Math.round(40 + rng() * 20);
    } else if (mode === 1) {
      // Balanced standard
      roomTemp = Math.round((23 + rng() * 4) * 10) / 10;
      extTemp = Math.round((24 + rng() * 8) * 10) / 10;
      occupancy = Math.round(4 + rng() * 10);
      solar = Math.round(25 + rng() * 45);
      tariff = rng() > 0.6 ? 0.5 : 0;
      humidity = Math.round(45 + rng() * 25);
    } else {
      // Heavy demand: hot, crowded, intense sunlight
      roomTemp = Math.round((27 + rng() * 8) * 10) / 10;
      extTemp = Math.round((32 + rng() * 9) * 10) / 10;
      occupancy = Math.round(15 + rng() * 15);
      solar = Math.round(70 + rng() * 30);
      tariff = rng() > 0.5 ? 0.5 : 0;
      humidity = Math.round(60 + rng() * 28);
    }

    const normRoom = normalize(roomTemp, 16, 36);
    const normExt = normalize(extTemp, 10, 42);
    const normOcc = normalize(occupancy, 0, 30);
    const normSolar = normalize(solar, 0, 100);
    const normTariff = tariff;
    const normHum = normalize(humidity, 20, 90);

    // Thermal demand index vs cost sensitivity
    const heatLoad = normRoom * 0.35 + normExt * 0.25 + normOcc * 0.3 + normSolar * 0.1;
    const costAvoidance = normTariff * (occupancy < 5 ? 0.4 : 0.15);

    let targetClass = 1;
    if (heatLoad > 0.62 && costAvoidance < 0.35) {
      targetClass = 2; // High demand
    } else if (heatLoad < 0.38 || (occupancy <= 2 && tariff > 0)) {
      targetClass = 0; // Eco
    } else {
      targetClass = 1; // Balanced
    }

    samples.push({
      id: i + 1,
      raw: {
        roomTemperature: roomTemp,
        ambientExternalTemp: extTemp,
        occupancyCount: occupancy,
        solarRadiation: solar,
        tariffPrice: tariff,
        humidity
      },
      inputXs: [normRoom, normExt, normOcc, normSolar, normTariff, normHum],
      tensorLabels: oneHot(targetClass, 3),
      labelName: outputClasses[targetClass].label
    });
  }

  return samples;
}

export const iotEnergyDataset: ScenarioDataset = {
  scenarioId: 'iot-energy',
  title: 'Automação de IoT e Energia (Smart HVAC)',
  category: 'Smart Buildings & Eficiência Energética',
  badge: 'Rede Neural Densa (Otimização IoT)',
  description: 'Controla a estratégia térmica e energética de edifícios inteligentes em tempo real com base em sensores ambientais e tarifas elétricas.',
  architectureDetails: 'Camada de Entrada (6 neurônios) → Densa (16 neurônios, ReLU) → Densa (8 neurônios, ReLU) → Saída (3 neurônios, Softmax)',
  features,
  outputClasses,
  samples: generateIoTSamples()
};
