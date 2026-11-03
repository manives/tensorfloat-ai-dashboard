import { ScenarioDataset } from '../types/scenario';
import { churnDataset } from './churnDataset';
import { creditDataset } from './creditDataset';
import { recommendationDataset } from './recommendationDataset';
import { medicalDataset } from './medicalDataset';
import { leadsDataset } from './leadsDataset';
import { iotEnergyDataset } from './iotEnergyDataset';

export const SCENARIOS: ScenarioDataset[] = [
  churnDataset,
  creditDataset,
  recommendationDataset,
  medicalDataset,
  leadsDataset,
  iotEnergyDataset
];

export const SCENARIOS_MAP: Record<string, ScenarioDataset> = {
  [churnDataset.scenarioId]: churnDataset,
  [creditDataset.scenarioId]: creditDataset,
  [recommendationDataset.scenarioId]: recommendationDataset,
  [medicalDataset.scenarioId]: medicalDataset,
  [leadsDataset.scenarioId]: leadsDataset,
  [iotEnergyDataset.scenarioId]: iotEnergyDataset
};

// Double check and validate exact 100 samples assertion
SCENARIOS.forEach((sc) => {
  if (sc.samples.length !== 100) {
    console.warn(`[DATASET WARNING] ${sc.title} has ${sc.samples.length} samples instead of 100!`);
  }
});
