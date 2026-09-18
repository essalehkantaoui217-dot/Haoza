import React from 'react';
import { History, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { ProductEditStep } from '../types';

interface HistoryTrailProps {
  steps: ProductEditStep[];
  activeStepId: string | null;
  onSelectStep: (step: ProductEditStep) => void;
}

export const HistoryTrail: React.FC<HistoryTrailProps> = ({
  steps,
  activeStepId,
  onSelectStep,
}) => {
  if (steps.length <= 1) return null;

  return (
    <div id="edit-history-trail" className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-neutral-500" />
          <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
            Edit Trail ({steps.length} Steps)
          </h4>
        </div>
        <span className="text-[11px] text-neutral-400">Click any step to inspect or branch</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
        {steps.map((step, idx) => {
          const isActive = activeStepId === step.id;
          return (
            <div key={step.id} className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onSelectStep(step)}
                className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/50'
                }`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-200 bg-white shrink-0">
                  <img
                    src={step.imageUrl}
                    alt={`Step ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="max-w-[130px]">
                  <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                    {idx === 0 ? 'Original' : `Step ${idx}`}
                  </p>
                  <p className="text-[11px] font-medium text-neutral-800 truncate" title={step.prompt}>
                    {idx === 0 ? 'Uploaded photo' : step.prompt}
                  </p>
                </div>
              </button>

              {idx < steps.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
