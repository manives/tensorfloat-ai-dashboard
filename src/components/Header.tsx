import React from 'react';
import { Database, Play, RotateCcw, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import { ScenarioDataset, TrainingMetrics } from '../types/scenario';
import unipdsLogo from '../assets/unipds-logo.png';

interface HeaderProps {
  scenario: ScenarioDataset;
  metrics: TrainingMetrics;
  onRetrain: () => void;
  onOpenDatasetModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  scenario,
  metrics,
  onRetrain,
  onOpenDatasetModal
}) => {
  const isTraining = metrics.status === 'training';
  const isCompleted = metrics.status === 'completed';

  return (
    <header className="border-b border-slate-800/80 bg-[#0c101d]/80 backdrop-blur-md sticky top-0 z-10 px-8 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Title & Metadata */}
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-black border border-amber-500/30 shadow-sm shadow-amber-500/10">
              <img src={unipdsLogo} alt="UNIPDS Educação" className="w-4 h-4 rounded object-cover" />
              <span className="text-[11px] font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-100">
                UNIPDS EDUCAÇÃO
              </span>
            </div>

            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5 font-medium">
              <Cpu className="w-3.5 h-3.5" />
              {scenario.badge}
            </span>
            <span className="text-xs font-medium text-slate-400">
              • {scenario.category}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white mt-1 tracking-tight flex items-center gap-2">
            {scenario.title}
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mt-0.5">
            {scenario.description}
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Dataset button */}
          <button
            onClick={onOpenDatasetModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium transition-all shadow-sm group"
          >
            <Database className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Dataset (100 Amostras)</span>
            <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">
              100%
            </span>
          </button>

          {/* Retrain button */}
          <button
            onClick={onRetrain}
            disabled={isTraining}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-lg ${
              isTraining
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-indigo-500/20 active:scale-95'
            }`}
          >
            {isTraining ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Treinando Épocas...</span>
              </>
            ) : isCompleted ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Retreinar Modelo</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Iniciar Treinamento</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
