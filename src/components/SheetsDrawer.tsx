import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  X,
  Plus,
  ExternalLink,
  Check,
  RefreshCw,
  AlertCircle,
  Table,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';
import { SheetLogRecord } from '../types';

interface SheetsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSignIn: () => void;
  isAuthenticating: boolean;
  activeSpreadsheetId: string | null;
  activeSpreadsheetTitle: string | null;
  activeSpreadsheetUrl: string | null;
  onCreateNewSheet: (title?: string) => Promise<void>;
  onSelectExistingSheet: (id: string) => Promise<void>;
  onLogCurrentEdit: (productName: string, notes?: string) => Promise<void>;
  isLogging: boolean;
  isCreatingSheet: boolean;
  recentLogs: string[][];
  onRefreshLogs: () => Promise<void>;
  currentPrompt: string;
  defaultProductName: string;
}

export const SheetsDrawer: React.FC<SheetsDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onSignIn,
  isAuthenticating,
  activeSpreadsheetId,
  activeSpreadsheetTitle,
  activeSpreadsheetUrl,
  onCreateNewSheet,
  onSelectExistingSheet,
  onLogCurrentEdit,
  isLogging,
  isCreatingSheet,
  recentLogs,
  onRefreshLogs,
  currentPrompt,
  defaultProductName,
}) => {
  const [customSheetTitle, setCustomSheetTitle] = useState('');
  const [customSpreadsheetIdInput, setCustomSpreadsheetIdInput] = useState('');
  const [productNameInput, setProductNameInput] = useState(defaultProductName);
  const [notesInput, setNotesInput] = useState('');
  const [isExportSuccess, setIsExportSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateSheet = async () => {
    try {
      setErrorMessage(null);
      await onCreateNewSheet(customSheetTitle.trim() || undefined);
      setCustomSheetTitle('');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create spreadsheet');
    }
  };

  const handleConnectExisting = async () => {
    try {
      setErrorMessage(null);
      let id = customSpreadsheetIdInput.trim();
      if (id.includes('/spreadsheets/d/')) {
        const match = id.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (match) id = match[1];
      }
      if (!id) {
        setErrorMessage('Please enter a valid Google Sheet ID or URL');
        return;
      }
      await onSelectExistingSheet(id);
      setCustomSpreadsheetIdInput('');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to connect spreadsheet');
    }
  };

  const handleExport = async () => {
    try {
      setErrorMessage(null);
      await onLogCurrentEdit(productNameInput.trim() || 'Product Photo', notesInput.trim());
      setIsExportSuccess(true);
      setTimeout(() => setIsExportSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to log edit to Google Sheets');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 leading-tight">Google Sheets Sync</h2>
              <p className="text-xs text-neutral-500">Track and catalog photo edits in your spreadsheets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Notice</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Authentication Section */}
          {!user ? (
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 text-center">
              <div className="w-12 h-12 rounded-full bg-white border border-neutral-200 mx-auto flex items-center justify-center shadow-2xs mb-3">
                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">Sign in to connect Google Sheets</h3>
              <p className="text-xs text-neutral-500 mt-1 mb-4 leading-relaxed">
                Connect your Google account to automatically log product photos, instructions, timestamps, and edit metadata directly into your spreadsheets.
              </p>
              <button
                id="btn-drawer-google-signin"
                onClick={onSignIn}
                disabled={isAuthenticating}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-800 shadow-2xs transition-all disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isAuthenticating ? 'Authorizing Google...' : 'Sign in with Google'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Active Sheet Card */}
              {activeSpreadsheetId ? (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">
                        Connected Spreadsheet
                      </span>
                      <h4 className="text-sm font-semibold text-neutral-900 mt-0.5">
                        {activeSpreadsheetTitle || 'Product Photo Edits Catalog'}
                      </h4>
                      <p className="text-[11px] text-neutral-500 font-mono mt-0.5 truncate max-w-[280px]">
                        ID: {activeSpreadsheetId}
                      </p>
                    </div>
                    {activeSpreadsheetUrl && (
                      <a
                        href={activeSpreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 bg-white px-2.5 py-1.5 rounded-lg border border-emerald-200 shadow-2xs"
                      >
                        <span>Open Sheet</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <h3 className="text-sm font-semibold text-neutral-900">No Spreadsheet Connected</h3>
                  <p className="text-xs text-neutral-500 mt-1 mb-3">
                    Create a new catalog spreadsheet in your Google Drive or link an existing one.
                  </p>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Catalog Sheet Name (Optional)"
                        value={customSheetTitle}
                        onChange={(e) => setCustomSheetTitle(e.target.value)}
                        className="flex-1 text-xs px-3 py-2 bg-white border border-neutral-300 rounded-lg outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={handleCreateSheet}
                        disabled={isCreatingSheet}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isCreatingSheet ? 'Creating...' : 'Create New'}</span>
                      </button>
                    </div>

                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-neutral-200 w-full" />
                      <span className="bg-neutral-50 px-2 text-[10px] text-neutral-400 uppercase tracking-wider absolute">
                        or link existing
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste Google Sheet URL or ID"
                        value={customSpreadsheetIdInput}
                        onChange={(e) => setCustomSpreadsheetIdInput(e.target.value)}
                        className="flex-1 text-xs px-3 py-2 bg-white border border-neutral-300 rounded-lg outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={handleConnectExisting}
                        className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-medium transition-colors"
                      >
                        Link
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Log Current Edit Form */}
              {activeSpreadsheetId && (
                <div className="p-4 rounded-2xl border border-neutral-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                      Log Active Edit to Sheet
                    </h4>
                    {isExportSuccess && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Added!
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 mb-1">Product Title</label>
                    <input
                      type="text"
                      value={productNameInput}
                      onChange={(e) => setProductNameInput(e.target.value)}
                      placeholder="e.g. Vintage Leather Watch"
                      className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 mb-1">Instruction / Prompt</label>
                    <p className="text-xs text-neutral-700 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 italic">
                      "{currentPrompt || 'Remove background and clean up product photo'}"
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 mb-1">Notes / Tags (Optional)</label>
                    <input
                      type="text"
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="e.g. Amazon Q4 Catalog, Hero Image"
                      className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>

                  <button
                    id="btn-log-sheet-row"
                    onClick={handleExport}
                    disabled={isLogging}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors disabled:opacity-60 shadow-xs"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{isLogging ? 'Appending Row to Google Sheet...' : 'Append Record to Google Sheet'}</span>
                  </button>
                </div>
              )}

              {/* Recent Logs Table */}
              {activeSpreadsheetId && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Table className="w-3.5 h-3.5 text-neutral-500" />
                      <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                        Recent Sheet Rows ({recentLogs.length})
                      </h4>
                    </div>
                    <button
                      onClick={onRefreshLogs}
                      className="p-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors"
                      title="Refresh rows from Google Sheets"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>

                  {recentLogs.length > 0 ? (
                    <div className="border border-neutral-200 rounded-xl overflow-hidden text-[11px]">
                      <div className="overflow-x-auto max-h-48">
                        <table className="w-full text-left">
                          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
                            <tr>
                              <th className="p-2">Product</th>
                              <th className="p-2">Prompt</th>
                              <th className="p-2">Time</th>
                              <th className="p-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {recentLogs.map((row, idx) => (
                              <tr key={idx} className="hover:bg-neutral-50">
                                <td className="p-2 font-medium text-neutral-900 whitespace-nowrap">
                                  {row[0] || 'Item'}
                                </td>
                                <td className="p-2 text-neutral-600 max-w-[120px] truncate" title={row[1]}>
                                  {row[1]}
                                </td>
                                <td className="p-2 text-neutral-400 whitespace-nowrap text-[10px]">
                                  {row[2]?.split(',')[0]}
                                </td>
                                <td className="p-2">
                                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                    {row[3] || 'Logged'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 text-center py-4 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                      No rows logged in this sheet yet. Click "Append Record" to log your first edit.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
          <span>Synced with Google Workspace APIs</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
