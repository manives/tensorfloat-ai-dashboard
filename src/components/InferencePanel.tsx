import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  Send,
  Zap,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  BookmarkCheck,
  RotateCcw
} from 'lucide-react';
import { ScenarioDataset, FeatureDefinition, PredictionResult } from '../types/scenario';
import { normalize } from '../datasets/datasetUtils';

interface InferencePanelProps {
  scenario: ScenarioDataset;
  isModelReady: boolean;
  onPredict: (normalizedInputs: number[]) => PredictionResult;
}

export const InferencePanel: React.FC<InferencePanelProps> = ({
  scenario,
  isModelReady,
  onPredict
}) => {
  // Feature input values state (stored as raw values)
  const [formValues, setFormValues] = useState<Record<string, number>>({});
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isInferring, setIsInferring] = useState<boolean>(false);

  // Initialize or reset form values when scenario changes
  useEffect(() => {
    const initial: Record<string, number> = {};
    scenario.features.forEach((feat) => {
      initial[feat.id] = feat.defaultValue;
    });
    setFormValues(initial);
    setPrediction(null);
  }, [scenario.scenarioId]);

  const handleInputChange = (featureId: string, val: number) => {
    setFormValues((prev) => ({
      ...prev,
      [featureId]: val
    }));
  };

  const runPrediction = () => {
    if (!isModelReady) return;
    setIsInferring(true);

    try {
      // Normalize values according to each feature's min and max
      const normalizedVector = scenario.features.map((feat) => {
        const rawVal = formValues[feat.id] ?? feat.defaultValue;
        return normalize(rawVal, feat.min, feat.max);
      });

      const result = onPredict(normalizedVector);
      setPrediction(result);
    } catch (err) {
      console.error('Inference error:', err);
    } finally {
      setIsInferring(false);
    }
  };

  // Quick Preset Profiles depending on the scenario
  const applyPreset = (presetType: 'safe' | 'medium' | 'critical') => {
    const updated: Record<string, number> = {};

    scenario.features.forEach((feat) => {
      if (presetType === 'safe') {
        // e.g. best case values
        if (feat.id.includes('tenure') || feat.id.includes('score') || feat.id.includes('Saturation') || feat.id.includes('loyalty')) {
          updated[feat.id] = feat.max * 0.9;
        } else if (feat.id.includes('Delay') || feat.id.includes('Tickets') || feat.id.includes('pain') || feat.id.includes('Default') || feat.id.includes('dyspnea')) {
          updated[feat.id] = feat.min;
        } else {
          updated[feat.id] = feat.defaultValue;
        }
      } else if (presetType === 'critical') {
        // critical / alert profile
        if (feat.id.includes('Delay') || feat.id.includes('Tickets') || feat.id.includes('pain') || feat.id.includes('Default') || feat.id.includes('dyspnea') || feat.id.includes('Charges')) {
          updated[feat.id] = feat.max * 0.85;
        } else if (feat.id.includes('Saturation')) {
          updated[feat.id] = 84; // Hypoxia
        } else if (feat.id.includes('tenure') || feat.id.includes('score')) {
          updated[feat.id] = feat.min * 1.2;
        } else {
          updated[feat.id] = feat.max;
        }
      } else {
        // medium balanced
        updated[feat.id] = feat.defaultValue;
      }
    });

    setFormValues(updated);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Interactive Inputs (7 cols) */}
      <div className="lg:col-span-7 bg-[#111728] border border-slate-800/90 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Parâmetros de Inferência</h3>
                <p className="text-xs text-slate-400">
                  Ajuste os dados de entrada para testar predições em tempo real
                </p>
              </div>
            </div>

            {/* Presets buttons */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-[11px] text-slate-500 mr-1 hidden sm:inline">Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset('safe')}
                className="px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-colors"
                title="Carregar Perfil Ideal/Favorável"
              >
                Perfil Ideal
              </button>
              <button
                type="button"
                onClick={() => applyPreset('critical')}
                className="px-2.5 py-1 text-[11px] font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition-colors"
                title="Carregar Perfil Crítico/Extremo"
              >
                Perfil Crítico
              </button>
              <button
                type="button"
                onClick={() => applyPreset('medium')}
                className="p-1 text-slate-400 hover:text-slate-200 bg-slate-800/60 rounded-lg transition-colors border border-slate-700/60"
                title="Restaurar Padrão"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Form Dynamic Fields */}
          <div className="space-y-4 mt-5">
            {scenario.features.map((feature: FeatureDefinition) => {
              const currentVal = formValues[feature.id] ?? feature.defaultValue;

              return (
                <div
                  key={feature.id}
                  className="bg-[#161f36]/50 hover:bg-[#161f36]/80 transition-colors p-3.5 rounded-xl border border-slate-800/80"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-200 block">
                        {feature.name}
                      </label>
                      <span className="text-[11px] text-slate-400 line-clamp-1">
                        {feature.description}
                      </span>
                    </div>

                    {/* Formatted Value Badge */}
                    <div className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 shrink-0">
                      {feature.formatDisplay ? feature.formatDisplay(currentVal) : currentVal}
                    </div>
                  </div>

                  {/* Render based on field type */}
                  {feature.type === 'slider' && (
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[10px] font-mono text-slate-500">
                        {feature.min}
                      </span>
                      <input
                        type="range"
                        min={feature.min}
                        max={feature.max}
                        step={feature.step}
                        value={currentVal}
                        onChange={(e) => handleInputChange(feature.id, parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-slate-500">
                        {feature.max}
                      </span>
                    </div>
                  )}

                  {feature.type === 'select' && feature.options && (
                    <select
                      value={currentVal}
                      onChange={(e) => handleInputChange(feature.id, parseFloat(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {feature.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {feature.type === 'toggle' && feature.options && (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {feature.options.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleInputChange(feature.id, opt.value)}
                          className={`py-1.5 text-xs font-medium rounded-lg transition-all border ${
                            currentVal === opt.value
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={runPrediction}
            disabled={!isModelReady || isInferring}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl ${
              !isModelReady
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white shadow-indigo-500/25 active:scale-[0.99] hover:shadow-cyan-500/20'
            }`}
          >
            <Sparkles className="w-5 h-5 text-cyan-200 animate-spin-slow" />
            <span>{isInferring ? 'Processando Tensores...' : 'Fazer Predição (Inferência IA)'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
          {!isModelReady && (
            <p className="text-center text-xs text-amber-400/90 mt-2 font-mono">
              * Aguarde o modelo finalizar o treinamento com os 100 dados para habilitar o teste.
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Prediction Results Output (5 cols) */}
      <div className="lg:col-span-5 bg-[#111728] border border-slate-800/90 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Resultado da Predição</h3>
                <p className="text-xs text-slate-400">
                  Probabilidades calculadas pela camada Softmax
                </p>
              </div>
            </div>

            {prediction && (
              <span className="font-mono text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                ⚡ {prediction.executionTimeMs} ms
              </span>
            )}
          </div>

          {/* Results Body */}
          {prediction ? (
            <div className="mt-5 space-y-6">
              {/* Winner Best Class Banner */}
              <div
                className="p-5 rounded-2xl border transition-all relative overflow-hidden bg-gradient-to-br from-[#151f38] to-[#0d1322]"
                style={{ borderColor: `${prediction.bestClass.color}60` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Diagnóstico Previsto
                    </span>
                    <h4
                      className="text-lg font-black tracking-tight"
                      style={{ color: prediction.bestClass.color }}
                    >
                      {prediction.bestClass.label}
                    </h4>
                  </div>

                  {/* Confidence Gauge Badge */}
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 block">Confiança</span>
                    <span
                      className="text-xl font-bold font-mono"
                      style={{ color: prediction.bestClass.color }}
                    >
                      {prediction.confidence}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {prediction.bestClass.description}
                </p>

                {/* Prescriptive Recommendation Pill */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-xs font-medium text-slate-200">
                  <BookmarkCheck className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                  <span>{prediction.bestClass.recommendationAction}</span>
                </div>
              </div>

              {/* Detailed Breakdown for All Classes */}
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Distribuição de Probabilidades
                </h5>

                <div className="space-y-3">
                  {prediction.probabilities.map((item) => {
                    const isWinner = item.classDef.index === prediction.bestClass.index;

                    return (
                      <div
                        key={item.classDef.index}
                        className={`p-3 rounded-xl border transition-all ${
                          isWinner
                            ? 'bg-[#192440] border-slate-700/80 shadow-md'
                            : 'bg-slate-900/40 border-slate-800/60 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span
                            className={`font-semibold ${
                              isWinner ? 'text-white' : 'text-slate-300'
                            }`}
                          >
                            {item.classDef.label}
                          </span>
                          <span className="font-mono font-bold text-slate-200">
                            {item.percentage}
                          </span>
                        </div>

                        {/* Animated Percentage Bar */}
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: item.percentage,
                              backgroundColor: item.classDef.color
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-600 mb-3">
                <Sparkles className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-slate-300">Nenhuma predição executada</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Configure os parâmetros de entrada à esquerda e clique em "Fazer Predição" para avaliar o resultado na rede neural.
              </p>
            </div>
          )}
        </div>

        {/* Footer Technical Note */}
        <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono flex items-center justify-between">
          <span>Camada: Softmax Activation</span>
          <span>tf.tensor2d → model.predict()</span>
        </div>
      </div>
    </div>
  );
};
