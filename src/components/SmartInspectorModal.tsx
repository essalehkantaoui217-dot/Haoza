import React from 'react';
import { X, Sparkles, AlertCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { PhotoAnalysis } from '../types';

interface SmartInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: PhotoAnalysis | null;
  isLoading: boolean;
  onApplyPrompt: (prompt: string) => void;
}

export const SmartInspectorModal: React.FC<SmartInspectorModalProps> = ({
  isOpen,
  onClose,
  analysis,
  isLoading,
  onApplyPrompt,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full border border-neutral-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">AI Photo Diagnosis</h3>
              <p className="text-[11px] text-neutral-500">Inspected with Gemini Vision</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {isLoading ? (
            <div className="py-8 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-neutral-800">Analyzing photo defects & reflections...</p>
              <p className="text-[11px] text-neutral-400">Detecting product edges, lighting balance, and background noise</p>
            </div>
          ) : analysis ? (
            <>
              {/* Product Identified */}
              {analysis.productIdentified && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-medium">Detected Subject:</span>
                  <span className="text-xs font-semibold text-neutral-900">{analysis.productIdentified}</span>
                </div>
              )}

              {/* Detected Issues */}
              {analysis.currentIssues && analysis.currentIssues.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Identified Issues</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {analysis.currentIssues.map((issue, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-neutral-600 bg-amber-50/50 border border-amber-200/60 rounded-lg p-2 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Prompts */}
              {analysis.recommendedPrompts && analysis.recommendedPrompts.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                    Tailored Instructions to Apply:
                  </h4>
                  <div className="space-y-2">
                    {analysis.recommendedPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onApplyPrompt(prompt);
                          onClose();
                        }}
                        className="w-full text-left p-3 rounded-xl border border-neutral-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all group flex items-start justify-between gap-3 text-xs"
                      >
                        <span className="text-neutral-800 leading-relaxed group-hover:text-indigo-950 font-medium">
                          {prompt}
                        </span>
                        <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-indigo-600 shrink-0 mt-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-neutral-400 text-center py-4">No analysis available for this photo.</p>
          )}
        </div>
      </div>
    </div>
  );
};
