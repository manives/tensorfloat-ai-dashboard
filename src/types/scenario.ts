export interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
  type: 'slider' | 'select' | 'toggle';
  options?: { label: string; value: number }[];
  formatDisplay?: (val: number) => string;
}

export interface OutputClassDefinition {
  index: number;
  label: string;
  description: string;
  color: string; // Tailwind hex or class e.g. '#10b981'
  badgeBg: string;
  recommendationAction: string;
}

export interface TrainingSample {
  id: number;
  raw: Record<string, any>;
  inputXs: number[];       // Normalized vector [0, 1]
  tensorLabels: number[];  // One-hot encoded vector
  labelName: string;
}

export interface ScenarioDataset {
  scenarioId: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  architectureDetails: string;
  features: FeatureDefinition[];
  outputClasses: OutputClassDefinition[];
  samples: TrainingSample[]; // MUST contain exactly 100 samples
}

export interface EpochLog {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss?: number;
  valAccuracy?: number;
}

export interface TrainingMetrics {
  status: 'idle' | 'training' | 'completed' | 'error';
  currentEpoch: number;
  totalEpochs: number;
  currentLoss: number;
  currentAccuracy: number;
  history: EpochLog[];
  trainingDurationMs: number;
  errorMessage?: string;
}

export interface PredictionResult {
  probabilities: {
    classDef: OutputClassDefinition;
    probability: number;
    percentage: string;
  }[];
  bestClass: OutputClassDefinition;
  confidence: number;
  executionTimeMs: number;
}
