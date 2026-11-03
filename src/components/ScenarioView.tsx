import React, { useEffect, useRef } from 'react';
import { ScenarioDataset, TrainingMetrics, PredictionResult } from '../types/scenario';
import { TrainingDashboard } from './TrainingDashboard';
import { InferencePanel } from './InferencePanel';
import { TFModelService } from '../services/tfModelService';

interface ScenarioViewProps {
  scenario: ScenarioDataset;
  metrics: TrainingMetrics;
  onUpdateMetrics: (metrics: TrainingMetrics) => void;
  onMarkTrained: (scenarioId: string) => void;
  isTraining: boolean;
  setIsTraining: (val: boolean) => void;
}

export const ScenarioView: React.FC<ScenarioViewProps> = ({
  scenario,
  metrics,
  onUpdateMetrics,
  onMarkTrained,
  isTraining,
  setIsTraining
}) => {
  // Prevent duplicate concurrent training triggers
  const isCurrentlyTrainingRef = useRef(false);

  const startTraining = async () => {
    if (isCurrentlyTrainingRef.current) return;
    isCurrentlyTrainingRef.current = true;
    setIsTraining(true);

    try {
      await TFModelService.trainScenarioModel(scenario, 25, (progress) => {
        onUpdateMetrics(progress);
      });
      onMarkTrained(scenario.scenarioId);
    } catch (err) {
      console.error('Failed to train model:', err);
    } finally {
      isCurrentlyTrainingRef.current = false;
      setIsTraining(false);
    }
  };

  // When scenario changes, auto-train if not already trained
  useEffect(() => {
    const hasModel = TFModelService.hasTrainedModel(scenario.scenarioId);
    if (!hasModel && !isCurrentlyTrainingRef.current) {
      startTraining();
    }
  }, [scenario.scenarioId]);

  const handlePredict = (normalizedInputs: number[]): PredictionResult => {
    return TFModelService.predict(scenario.scenarioId, scenario, normalizedInputs);
  };

  const isModelReady = metrics.status === 'completed' && TFModelService.hasTrainedModel(scenario.scenarioId);

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
      {/* Real-time Training Dashboard */}
      <section aria-label="Painel de Treinamento Neural">
        <TrainingDashboard metrics={metrics} scenario={scenario} />
      </section>

      {/* Interactive Inference Panel */}
      <section aria-label="Playground Interativo de Inferência">
        <InferencePanel
          scenario={scenario}
          isModelReady={isModelReady}
          onPredict={handlePredict}
        />
      </section>
    </div>
  );
};
