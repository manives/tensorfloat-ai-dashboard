import React, { useState } from 'react';
import { X, Search, Database, Code, CheckCircle, BarChart3, Download } from 'lucide-react';
import { ScenarioDataset } from '../types/scenario';

interface DatasetViewerModalProps {
  scenario: ScenarioDataset;
  isOpen: boolean;
  onClose: () => void;
}

export const DatasetViewerModal: React.FC<DatasetViewerModalProps> = ({
  scenario,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'raw' | 'tensors' | 'stats'>('raw');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Filter samples based on search term
  const filteredSamples = scenario.samples.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.id.toString().includes(term) ||
      s.labelName.toLowerCase().includes(term) ||
      JSON.stringify(s.raw).toLowerCase().includes(term)
    );
  });

  // Calculate class distribution
  const classCounts: Record<string, number> = {};
  scenario.samples.forEach((s) => {
    classCounts[s.labelName] = (classCounts[s.labelName] || 0) + 1;
  });

  // Export JSON functionality
  const downloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scenario.samples, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${scenario.scenarioId}-dataset-100-samples.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-fadeIn">
      <div className="bg-[#0f1424] border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-lg">
                  Dataset de Treinamento: {scenario.title.split('(')[0]}
                </h3>
                <span className="text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Exatamente {scenario.samples.length} Amostras
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Valores normalizados [0, 1] e rótulos categorizados em One-Hot Encoding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadJSON}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exportar JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subheader: Tabs & Search */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-[#0a0d16] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'raw'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Valores Clínicos/Reais</span>
            </button>
            <button
              onClick={() => setActiveTab('tensors')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'tensors'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Tensores TF.js (inputXs & Labels)</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'stats'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Distribuição de Classes</span>
            </button>
          </div>

          {activeTab !== 'stats' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar amostra (ID, classe)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-500 font-mono"
              />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-5 custom-scrollbar">
          {activeTab === 'raw' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase bg-[#141b30]">
                    <th className="p-3">#</th>
                    {scenario.features.map((f) => (
                      <th key={f.id} className="p-3 whitespace-nowrap">
                        {f.name}
                      </th>
                    ))}
                    <th className="p-3 text-right">Rótulo / Classe Real</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredSamples.map((sample) => (
                    <tr
                      key={sample.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-3 text-slate-500 font-bold">
                        #{sample.id.toString().padStart(3, '0')}
                      </td>
                      {scenario.features.map((f) => (
                        <td key={f.id} className="p-3 text-slate-300">
                          {f.formatDisplay
                            ? f.formatDisplay(sample.raw[f.id])
                            : sample.raw[f.id]}
                        </td>
                      ))}
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                          {sample.labelName}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'tensors' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase bg-[#141b30]">
                    <th className="p-3"># ID</th>
                    <th className="p-3">
                      inputXs (Vetor Normalizado [0, 1])
                    </th>
                    <th className="p-3 text-right">
                      tensorLabels (One-Hot Encoded)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredSamples.map((sample) => (
                    <tr
                      key={sample.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-3 text-slate-500 font-bold">
                        #{sample.id.toString().padStart(3, '0')}
                      </td>
                      <td className="p-3 text-cyan-300">
                        [{sample.inputXs.map((val) => val.toFixed(3)).join(', ')}]
                      </td>
                      <td className="p-3 text-right text-emerald-400">
                        [{sample.tensorLabels.join(', ')}] ({sample.labelName})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="max-w-2xl mx-auto space-y-6 py-4">
              <div className="bg-[#141b30] p-5 rounded-xl border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-1">
                  Distribuição das Classes no Dataset (Total: 100 Amostras)
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  O dataset foi gerado com distribuição balanceada e variações estocásticas realistas para evitar viés (bias).
                </p>

                <div className="space-y-3">
                  {scenario.outputClasses.map((cls) => {
                    const count = classCounts[cls.label] || 0;
                    const pct = ((count / scenario.samples.length) * 100).toFixed(0);

                    return (
                      <div key={cls.index} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span style={{ color: cls.color }}>{cls.label}</span>
                          <span className="font-mono text-slate-300">
                            {count} casos ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: cls.color
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#141b30] p-5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <h5 className="font-bold text-white">Conformidade com Requisitos de Engenharia:</h5>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  <li>Total de linhas garantido: exatamente 100 instâncias</li>
                  <li>Normalização: Min-Max Scaling [0, 1] em todas as variáveis contínuas</li>
                  <li>Encoding de Alvo: One-Hot categorical vectors compatíveis com Softmax + Categorical Crossentropy</li>
                  <li>Validação Cruzada: 80% treino / 20% validação em tempo real</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0a0d16] flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Mostrando {filteredSamples.length} de {scenario.samples.length} registros</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
