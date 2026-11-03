import { ScenarioDataset, TrainingSample } from '../types/scenario';
import { createRng, normalize, oneHot } from './datasetUtils';

const features = [
  {
    id: 'techAffinity',
    name: 'Afinidade com Tecnologia & Gadgets',
    description: 'Nível de interesse em smartphones, componentes de PC e inovação',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 70,
    unit: '%',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)}%`
  },
  {
    id: 'fashionAffinity',
    name: 'Afinidade com Moda & Vestuário',
    description: 'Nível de interesse em tendências, calçados e estilo pessoal',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 20,
    unit: '%',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)}%`
  },
  {
    id: 'homeDecorAffinity',
    name: 'Afinidade com Casa & Decoração',
    description: 'Nível de interesse em mobília, utensílios de cozinha e bem-estar',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 30,
    unit: '%',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)}%`
  },
  {
    id: 'weeklyGamingHours',
    name: 'Horas Semanais de Jogos / Streaming',
    description: 'Tempo semanal dedicado a jogos eletrônicos e transmissões',
    min: 0,
    max: 35,
    step: 1,
    defaultValue: 15,
    unit: 'h/sem',
    type: 'slider' as const,
    formatDisplay: (v: number) => `${Math.round(v)} h/sem`
  },
  {
    id: 'averageOrderValue',
    name: 'Ticket Médio de Compra (R$)',
    description: 'Gasto médio por pedido nos últimos 12 meses',
    min: 50,
    max: 2000,
    step: 50,
    defaultValue: 650,
    unit: 'R$',
    type: 'slider' as const,
    formatDisplay: (v: number) => `R$ ${Math.round(v)}`
  }
];

const outputClasses = [
  {
    index: 0,
    label: 'Tech & Eletrônicos',
    description: 'Recomendações prioritárias de smartphones, laptops, fones ANC e periféricos.',
    color: '#00f2fe',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    recommendationAction: 'Ação: Exibir carrossel de gadgets de ponta e descontos em hardware.'
  },
  {
    index: 1,
    label: 'Moda & Vestuário',
    description: 'Coleções sazonais, calçados premium, roupas casuais e acessórios estilizados.',
    color: '#ec4899',
    badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    recommendationAction: 'Ação: Exibir lookbook personalizado com base no gênero e tendências.'
  },
  {
    index: 2,
    label: 'Casa & Decoração',
    description: 'Móveis ergonômicos, iluminação inteligente, decoração minimalista e utilitários.',
    color: '#eab308',
    badgeBg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    recommendationAction: 'Ação: Sugerir kits de ambientação para home office e cozinha gourmet.'
  },
  {
    index: 3,
    label: 'Games & Entretenimento',
    description: 'Lançamentos de consoles, teclados mecânicos, cadeiras gamer e assinaturas digitais.',
    color: '#a855f7',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    recommendationAction: 'Ação: Exibir ofertas de passes de jogos, periféricos RGB e gift cards.'
  }
];

function generateRecommendationSamples(): TrainingSample[] {
  const rng = createRng(31415);
  const samples: TrainingSample[] = [];

  for (let i = 0; i < 100; i++) {
    // 4 clusters of 25 items each with variance
    const cluster = i % 4;

    let tech = 0;
    let fashion = 0;
    let home = 0;
    let gaming = 0;
    let aov = 0;

    if (cluster === 0) {
      // Tech cluster
      tech = Math.round(70 + rng() * 30);
      fashion = Math.round(rng() * 40);
      home = Math.round(rng() * 45);
      gaming = Math.round(rng() * 12);
      aov = Math.round(600 + rng() * 1400);
    } else if (cluster === 1) {
      // Fashion cluster
      tech = Math.round(rng() * 35);
      fashion = Math.round(75 + rng() * 25);
      home = Math.round(rng() * 50);
      gaming = Math.round(rng() * 8);
      aov = Math.round(150 + rng() * 850);
    } else if (cluster === 2) {
      // Home decor cluster
      tech = Math.round(rng() * 40);
      fashion = Math.round(rng() * 45);
      home = Math.round(70 + rng() * 30);
      gaming = Math.round(rng() * 6);
      aov = Math.round(250 + rng() * 1200);
    } else {
      // Gaming cluster
      tech = Math.round(50 + rng() * 45);
      fashion = Math.round(rng() * 30);
      home = Math.round(rng() * 25);
      gaming = Math.round(18 + rng() * 17);
      aov = Math.round(200 + rng() * 1000);
    }

    const normTech = normalize(tech, 0, 100);
    const normFashion = normalize(fashion, 0, 100);
    const normHome = normalize(home, 0, 100);
    const normGaming = normalize(gaming, 0, 35);
    const normAov = normalize(aov, 50, 2000);

    // Compute affinity vector to assign winning target class
    const scores = [
      normTech * 0.7 + normAov * 0.3,
      normFashion * 0.85 + normAov * 0.15,
      normHome * 0.85 + normAov * 0.15,
      normGaming * 0.75 + normTech * 0.25
    ];

    let bestIndex = 0;
    let maxScore = scores[0];
    for (let s = 1; s < 4; s++) {
      if (scores[s] > maxScore) {
        maxScore = scores[s];
        bestIndex = s;
      }
    }

    samples.push({
      id: i + 1,
      raw: {
        techAffinity: tech,
        fashionAffinity: fashion,
        homeDecorAffinity: home,
        weeklyGamingHours: gaming,
        averageOrderValue: aov
      },
      inputXs: [normTech, normFashion, normHome, normGaming, normAov],
      tensorLabels: oneHot(bestIndex, 4),
      labelName: outputClasses[bestIndex].label
    });
  }

  return samples;
}

export const recommendationDataset: ScenarioDataset = {
  scenarioId: 'recommendation',
  title: 'Recomendação de Produtos & Conteúdo',
  category: 'E-Commerce & Sistemas de Recomendação',
  badge: 'Rede Neural Densa (Multiclasse)',
  description: 'Mapeia os hábitos de navegação, interesses e ticket financeiro do usuário para recomendar a melhor categoria de produto.',
  architectureDetails: 'Camada de Entrada (5 neurônios) → Densa (16 neurônios, ReLU) → Densa (12 neurônios, ReLU) → Saída (4 neurônios, Softmax)',
  features,
  outputClasses,
  samples: generateRecommendationSamples()
};
