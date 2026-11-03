import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, Clock, Layers, Zap, TrendingUp, BarChart2 } from 'lucide-react';
import { TrainingMetrics, ScenarioDataset } from '../types/scenario';

interface TrainingDashboardProps {
  metrics: TrainingMetrics;
  scenario: ScenarioDataset;
}

export const TrainingDashboard: React.FC<TrainingDashboardProps> = ({ metrics, scenario }) => {
  const isTraining = metrics.status === 'training';
  const isCompleted = metrics.status === 'completed';
  const progressPercent = Math.min(
    100,
    Math.round((metrics.currentEpoch / Math.max(1, metrics.totalEpochs)) * 100)
  );

  // SVG Chart Dimensions
  const svgWidth = 400;
  const svgHeight = 120;
  const padding = 16;

  // Build points for Loss curve (lower is better: 0 to maxLoss)
  const history = metrics.history;
  const maxLoss = Math.max(1.0, ...history.map((h) => h.loss));
  const minLoss = 0;

  const lossPoints = history.length > 1
    ? history
        .map((h, i) => {
          const x = padding + (i / (history.length - 1)) * (svgWidth - padding * 2);
          const y =
            svgHeight -
            padding -
            ((h.loss - minLoss) / (maxLoss - minLoss || 1)) * (svgHeight - padding * 2);
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ')
    : '';

  // Build points for Accuracy curve (0% to 100%)
  const accuracyPoints = history.length > 1
    ? history
        .map((h, i) => {
          const x = padding + (i / (history.length - 1)) * (svgWidth - padding * 2);
          const y =
            svgHeight -
            padding -
            (h.accuracy / 100) * (svgHeight - padding * 2);
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ')
    : '';

  return (
    <div className="bg-[#111728] border border-slate-800/90 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Top Banner & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isTraining
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : isCompleted
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
            }`}
          >
            {isTraining ? (
              <Activity className="w-5 h-5 animate-pulse" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Zap className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Status do Treinamento</h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium border ${
                  isTraining
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                    : isCompleted
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {isTraining
                  ? `Treinando Época ${metrics.currentEpoch}/${metrics.totalEpochs}...`
                  : isCompleted
                  ? `Treinamento Concluído (${metrics.currentAccuracy.toFixed(1)}% Acurácia)`
                  : 'Aguardando Inicialização'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Otimizador: Adam (lr=0.015) • Categorical Crossentropy • 100 Amostras Reais
            </p>
          </div>
        </div>

        {/* Progress bar container */}
        <div className="w-full sm:w-60">
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
            <span>Épocas: {metrics.currentEpoch}/{metrics.totalEpochs}</span>
            <span className="text-indigo-400 font-semibold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                  : 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Real-time KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
        {/* KPI 1: Accuracy */}
        <div className="bg-[#161f36]/70 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Acurácia Final
            </span>
            <span className="text-[10px] font-mono text-slate-500">ACC</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {metrics.currentAccuracy > 0 ? `${metrics.currentAccuracy.toFixed(1)}%` : '--'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            {isCompleted ? 'Convergência ótima atingida' : isTraining ? 'Calculando precisão...' : 'Sem dados'}
          </div>
        </div>

        {/* KPI 2: Loss */}
        <div className="bg-[#161f36]/70 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Função de Perda
            </span>
            <span className="text-[10px] font-mono text-slate-500">LOSS</span>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {metrics.currentLoss > 0 ? metrics.currentLoss.toFixed(4) : '--'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            Cross-Entropy mínima
          </div>
        </div>

        {/* KPI 3: Duration */}
        <div className="bg-[#161f36]/70 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Tempo de Treino
            </span>
            <span className="text-[10px] font-mono text-slate-500">SPEED</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-200">
            {metrics.trainingDurationMs > 0 ? `${(metrics.trainingDurationMs / 1000).toFixed(2)}s` : '--'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            Aceleração via WebGL
          </div>
        </div>

        {/* KPI 4: Dataset Scale */}
        <div className="bg-[#161f36]/70 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Tamanho do Lote
            </span>
            <span className="text-[10px] font-mono text-slate-500">DATA</span>
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300">
            100 <span className="text-sm font-normal text-slate-400">casos</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            100% no browser (Zero API)
          </div>
        </div>
      </div>

      {/* Real-time Loss / Accuracy Curve Chart */}
      <div className="mt-5 bg-[#0d1220]/90 rounded-xl p-4 border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Evolução das Métricas por Época
            </h4>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
              <span className="text-slate-300">Acurácia (%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
              <span className="text-slate-300">Perda (Loss)</span>
            </div>
          </div>
        </div>

        {/* SVG Live Chart */}
        <div className="w-full overflow-hidden">
          {history.length > 1 ? (
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-32 stroke-linejoin-round stroke-linecap-round"
            >
              {/* Background grid lines */}
              <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="#1f293d" strokeDasharray="3 3" />
              <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="#1f293d" strokeDasharray="3 3" />
              <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#1f293d" strokeDasharray="3 3" />

              {/* Accuracy Polyline (Emerald) */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                points={accuracyPoints}
              />

              {/* Loss Polyline (Cyan) */}
              <polyline
                fill="none"
                stroke="#00f2fe"
                strokeWidth="2.5"
                points={lossPoints}
              />
            </svg>
          ) : (
            <div className="h-32 flex items-center justify-center text-slate-500 text-xs font-mono">
              {isTraining ? 'Aguardando primeiras épocas...' : 'Inicie o treinamento para visualizar as curvas de convergência.'}
            </div>
          )}
        </div>

        {/* Architecture Specs Details */}
        <div className="mt-3 pt-3 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
          <div>
            <span className="text-slate-500">Arquitetura: </span>
            <span className="text-slate-300">{scenario.architectureDetails}</span>
          </div>
          <div>
            <span className="text-slate-500">Features: </span>
            <span className="text-indigo-400 font-semibold">{scenario.features.length} inputs</span>
            <span className="text-slate-500"> → Classes: </span>
            <span className="text-emerald-400 font-semibold">{scenario.outputClasses.length} categorias</span>
          </div>
        </div>
      </div>
    </div>
  );
};
