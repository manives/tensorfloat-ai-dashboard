import React, { useState, useEffect } from 'react';
import { SCENARIOS, SCENARIOS_MAP } from './datasets';
import { TrainingMetrics } from './types/scenario';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ScenarioView } from './components/ScenarioView';
import { DatasetViewerModal } from './components/DatasetViewerModal';
import { TFModelService } from './services/tfModelService';

export const App: React.FC = () => {
  const [activeScenarioId, setActiveScenarioId] = useState<string>(SCENARIOS[0].scenarioId);
  const [trainedScenarioIds, setTrainedScenarioIds] = useState<Set<string>>(new Set());
  const [trainingScenarioId, setTrainingScenarioId] = useState<string | null>(null);

  // Store training metrics per scenario
  const [metricsMap, setMetricsMap] = useState<Record<string, TrainingMetrics>>(() => {
    const map: Record<string, TrainingMetrics> = {};
    SCENARIOS.forEach((sc) => {
      map[sc.scenarioId] = {
        status: 'idle',
        currentEpoch: 0,
        totalEpochs: 25,
        currentLoss: 0,
        currentAccuracy: 0,
        history: [],
        trainingDurationMs: 0
      };
    });
    return map;
  });

  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState<boolean>(false);
  const [backendInfo, setBackendInfo] = useState<{ backend: string; tensorCount: number; memoryMB: number }>({
    backend: 'webgl',
    tensorCount: 0,
    memoryMB: 0
  });

  // Update backend info periodically
  useEffect(() => {
    const updateStats = () => {
      try {
        const info = TFModelService.getBackendInfo();
        setBackendInfo(info);
      } catch (e) {
        // tf may not be initialized yet
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const activeScenario = SCENARIOS_MAP[activeScenarioId] || SCENARIOS[0];
  const activeMetrics = metricsMap[activeScenarioId] || {
    status: 'idle',
    currentEpoch: 0,
    totalEpochs: 25,
    currentLoss: 0,
    currentAccuracy: 0,
    history: [],
    trainingDurationMs: 0
  };

  const handleUpdateMetrics = (metrics: TrainingMetrics) => {
    setMetricsMap((prev) => ({
      ...prev,
      [activeScenarioId]: metrics
    }));
  };

  const handleMarkTrained = (scenarioId: string) => {
    setTrainedScenarioIds((prev) => new Set([...prev, scenarioId]));
    setTrainingScenarioId(null);
  };

  const handleRetrain = async () => {
    setTrainingScenarioId(activeScenarioId);
    try {
      await TFModelService.trainScenarioModel(activeScenario, 25, (progress) => {
        handleUpdateMetrics(progress);
      });
      handleMarkTrained(activeScenarioId);
    } catch (err) {
      console.error('Error retraining model:', err);
    } finally {
      setTrainingScenarioId(null);
    }
  };

  const handleSelectScenario = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0d14] text-slate-100 font-sans">
      {/* Sidebar with stylized logo and 6 scenarios */}
      <Sidebar
        scenarios={SCENARIOS}
        activeScenarioId={activeScenarioId}
        onSelectScenario={handleSelectScenario}
        trainedScenarioIds={trainedScenarioIds}
        trainingScenarioId={trainingScenarioId}
        backendInfo={backendInfo}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Scenario Header with Retrain & Dataset explorer actions */}
        <Header
          scenario={activeScenario}
          metrics={activeMetrics}
          onRetrain={handleRetrain}
          onOpenDatasetModal={() => setIsDatasetModalOpen(true)}
        />

        {/* Scrollable Main Workspace */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <ScenarioView
            key={activeScenarioId}
            scenario={activeScenario}
            metrics={activeMetrics}
            onUpdateMetrics={handleUpdateMetrics}
            onMarkTrained={handleMarkTrained}
            isTraining={trainingScenarioId === activeScenarioId}
            setIsTraining={(training) => setTrainingScenarioId(training ? activeScenarioId : null)}
          />
        </main>
      </div>

      {/* Dataset Explorer Modal (Shows the 100 diversified cases) */}
      <DatasetViewerModal
        scenario={activeScenario}
        isOpen={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
      />
    </div>
  );
};

export default App;
