import React, { useState, KeyboardEvent } from 'react';
import {
  Sparkles,
  Send,
  Wand2,
  CheckCircle2,
  Zap,
  SlidersHorizontal,
  Eraser,
  SunMedium,
  Building2,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface InstructionBarProps {
  instruction: string;
  onChangeInstruction: (val: string) => void;
  onSubmit: (customPrompt?: string) => void;
  onInstantLocalCutout: () => void;
  onAnalyzePhoto: () => void;
  isAnalyzing: boolean;
  isProcessing: boolean;
  aspectRatio: string;
  onChangeAspectRatio: (val: string) => void;
  hasOriginalImage: boolean;
}

const QUICK_PRESETS = [
  {
    label: 'Remove Background (Cutout)',
    icon: Eraser,
    prompt: 'Remove background completely, isolate subject cleanly with sharp edges and transparent background.',
    badge: 'Popular',
  },
  {
    label: 'Amazon Pure White (#FFFFFF)',
    icon: CheckCircle2,
    prompt: 'Remove background and isolate product on 100% pure white (#FFFFFF) commercial studio background with soft realistic contact shadow.',
    badge: 'E-Commerce',
  },
  {
    label: 'Clean Dust, Scratches & Glare',
    icon: Wand2,
    prompt: 'Clean up all surface dust particles, scratches, smudges, and harsh lens glare. Keep product pristine and razor sharp.',
    badge: 'Retouch',
  },
  {
    label: 'Luxury Marble Pedestal',
    icon: Building2,
    prompt: 'Place product on a modern minimalist polished Carrara marble pedestal with soft luxury studio fill and rim lighting.',
    badge: 'Staging',
  },
  {
    label: 'Warm Organic Studio',
    icon: SunMedium,
    prompt: 'Place product on a warm neutral beige stone podium with soft gentle morning window sunlight and subtle palm leaf shadow.',
    badge: 'Lifestyle',
  },
];

export const InstructionBar: React.FC<InstructionBarProps> = ({
  instruction,
  onChangeInstruction,
  onSubmit,
  onInstantLocalCutout,
  onAnalyzePhoto,
  isAnalyzing,
  isProcessing,
  aspectRatio,
  onChangeAspectRatio,
  hasOriginalImage,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isProcessing && instruction.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div id="instruction-control-panel" className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-4 sm:p-5">
      {/* Header and Smart Assistant */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
            Natural Language Instruction
          </span>
          <span className="text-[11px] text-neutral-400 hidden sm:inline">
            Type anything you want to change, remove, or clean up
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasOriginalImage && (
            <button
              id="btn-analyze-photo"
              onClick={onAnalyzePhoto}
              disabled={isAnalyzing || isProcessing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors disabled:opacity-50"
              title="Inspect photo with Gemini to diagnose issues and get custom prompt suggestions"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{isAnalyzing ? 'Inspecting...' : 'AI Photo Diagnosis'}</span>
            </button>
          )}

          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Aspect ratio & format options"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="relative">
        <textarea
          id="input-edit-instruction"
          rows={2}
          value={instruction}
          onChange={(e) => onChangeInstruction(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Remove background completely, eliminate dust & reflections on the glass, isolate product on pure white..."
          className="w-full text-sm text-neutral-900 placeholder-neutral-400 bg-neutral-50/70 border border-neutral-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-xl p-3.5 pr-28 resize-none transition-all outline-none leading-relaxed"
        />

        <div className="absolute right-2.5 bottom-3 flex items-center gap-1.5">
          <button
            id="btn-run-instruction"
            onClick={() => onSubmit()}
            disabled={isProcessing || !instruction.trim()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-40 disabled:pointer-events-none"
            title="Execute instruction with gemini-3.1-flash-image-preview (⌘ + Enter)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isProcessing ? 'Editing...' : 'Apply'}</span>
          </button>
        </div>
      </div>

      {/* Quick Action Preset Chips */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[11px] font-medium text-neutral-400 shrink-0">Quick Presets:</span>
        {QUICK_PRESETS.map((preset, idx) => {
          const Icon = preset.icon;
          return (
            <button
              key={idx}
              onClick={() => {
                onChangeInstruction(preset.prompt);
                onSubmit(preset.prompt);
              }}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-100/80 hover:bg-neutral-200/80 text-neutral-700 border border-neutral-200/80 shrink-0 transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50"
            >
              <Icon className="w-3.5 h-3.5 text-neutral-500" />
              <span>{preset.label}</span>
              {preset.badge && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-white text-neutral-500 font-mono">
                  {preset.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Local Fast Cutout Button */}
        {hasOriginalImage && (
          <button
            onClick={onInstantLocalCutout}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 shrink-0 transition-all"
            title="Instant local canvas alpha keying (50ms)"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Instant Local Cutout</span>
          </button>
        )}
      </div>

      {/* Collapsible Format & Advanced Options */}
      {showOptions && (
        <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-medium">Aspect Ratio:</span>
            <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg">
              {['1:1', '4:3', '3:4', '16:9'].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => onChangeAspectRatio(ratio)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    aspectRatio === ratio
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {ratio} {ratio === '1:1' ? '(Square)' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <span>Powered by</span>
            <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700 font-mono">
              gemini-3.1-flash-image-preview
            </code>
          </div>
        </div>
      )}
    </div>
  );
};
