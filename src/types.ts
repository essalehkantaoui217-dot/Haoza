export type ComparisonMode = 'split' | 'side-by-side' | 'result-only' | 'original-only';

export type BackgroundTheme = 'transparent' | 'white' | 'neutral' | 'warm' | 'dark' | 'gradient';

export interface ProductEditStep {
  id: string;
  timestamp: number;
  prompt: string;
  imageUrl: string;
  actionType: 'original' | 'bg_removal' | 'cleanup' | 'restage' | 'custom';
  modelUsed?: string;
  notes?: string;
}

export interface SampleProductPhoto {
  id: string;
  name: string;
  category: string;
  url: string;
  originalDescription: string;
  suggestedPrompt: string;
}

export interface SheetLogRecord {
  id: string;
  timestamp: string;
  productName: string;
  promptInstruction: string;
  aspectRatio: string;
  status: 'Cleaned' | 'Background Removed' | 'Restaged';
  spreadsheetId?: string;
  sheetUrl?: string;
  rowNumber?: number;
}

export interface PhotoAnalysis {
  productIdentified?: string;
  currentIssues?: string[];
  recommendedPrompts?: string[];
}
