import React from 'react';
import {
  UserMinus,
  CreditCard,
  Sparkles,
  HeartPulse,
  Target,
  Zap,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { ScenarioDataset } from '../types/scenario';
import unipdsLogo from '../assets/unipds-logo.png';

interface SidebarProps {
  scenarios: ScenarioDataset[];
  activeScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  trainedScenarioIds: Set<string>;
  trainingScenarioId: string | null;
  backendInfo: { backend: string; tensorCount: number; memoryMB: number };
}

const SCENARIO_ICONS: Record<string, React.ReactNode> = {
  churn: <UserMinus className="w-5 h-5" />,
  credit: <CreditCard className="w-5 h-5" />,
  recommendation: <Sparkles className="w-5 h-5" />,
  medical: <HeartPulse className="w-5 h-5" />,
  leads: <Target className="w-5 h-5" />,
  'iot-energy': <Zap className="w-5 h-5" />
};

export const Sidebar: React.FC<SidebarProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  trainedScenarioIds,
  trainingScenarioId,
  backendInfo
}) => {
  return (
    <aside className="w-80 bg-[#0f1422] border-r border-slate-800/80 flex flex-col h-screen select-none shrink-0 z-20">
      {/* Brand & Logo */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3 bg-[#0a0d14]/70">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/30 via-slate-800 to-yellow-500/20 p-[1.5px] shadow-lg shadow-amber-500/10">
            <img
              src={unipdsLogo}
              alt="UNIPDS Educação"
              className="w-full h-full rounded-[10px] object-cover bg-black"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1 truncate">
              <span className="text-white">UNIPDS</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200">AI</span>
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/30 shrink-0">
              TF.JS
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate">TensorFloat Dashboard</p>
        </div>
      </div>

      {/* Navigation Subheader */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Cenários Práticos de IA</span>
          <span className="text-[10px] font-mono bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
            {scenarios.length} Modelos
          </span>
        </div>
      </div>

      {/* Scenarios Menu List */}
      <nav className="flex-1 px-3 py-1 space-y-1.5 overflow-y-auto custom-scrollbar">
        {scenarios.map((sc, index) => {
          const isActive = sc.scenarioId === activeScenarioId;
          const isTrained = trainedScenarioIds.has(sc.scenarioId);
          const isCurrentTraining = trainingScenarioId === sc.scenarioId;
          const icon = SCENARIO_ICONS[sc.scenarioId] || <Cpu className="w-5 h-5" />;

          return (
            <button
              key={sc.scenarioId}
              onClick={() => onSelectScenario(sc.scenarioId)}
              className={`w-full group text-left p-3 rounded-xl transition-all duration-200 relative flex items-start gap-3 border ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-950/70 via-indigo-900/40 to-slate-900/80 border-indigo-500/40 shadow-lg shadow-indigo-950/50'
                  : 'bg-slate-900/30 hover:bg-slate-800/40 border-transparent hover:border-slate-800 text-slate-300'
              }`}
            >
              {/* Active Indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-indigo-400 to-cyan-400 rounded-r-full shadow-sm shadow-cyan-400/50" />
              )}

              {/* Icon Box */}
              <div
                className={`p-2 rounded-lg shrink-0 transition-colors ${
                  isActive
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                    : 'bg-slate-800/60 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                }`}
              >
                {icon}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-[11px] font-mono text-slate-500">
                    0{index + 1}
                  </span>
                  {/* Status Indicator Pill */}
                  {isCurrentTraining ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Treinando
                    </span>
                  ) : isTrained ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Pronto
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">
                      100 casos
                    </span>
                  )}
                </div>

                <div className={`font-semibold text-sm leading-snug truncate ${
                  isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                }`}>
                  {sc.title.split('(')[0].trim()}
                </div>

                <div className="text-xs text-slate-400 truncate mt-0.5">
                  {sc.category}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Engine Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-[#0a0d14]/70">
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Execução 100% Client-Side
            </span>
            <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/50">
              {backendInfo.backend}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/50 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">Tensores Ativos</span>
              <span className="font-mono font-semibold text-slate-200">
                {backendInfo.tensorCount}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Memória GPU/CPU</span>
              <span className="font-mono font-semibold text-slate-200">
                {backendInfo.memoryMB} MB
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
