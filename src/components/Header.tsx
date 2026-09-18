import React from 'react';
import { User } from 'firebase/auth';
import { Sparkles, FileSpreadsheet, LogOut, Layers, ExternalLink } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  activeSpreadsheetId: string | null;
  activeSpreadsheetTitle: string | null;
  onOpenSheetsModal: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  isAuthenticating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeSpreadsheetId,
  activeSpreadsheetTitle,
  onOpenSheetsModal,
  onSignIn,
  onSignOut,
  isAuthenticating,
}) => {
  return (
    <header className="border-b border-neutral-200 bg-white/95 backdrop-blur sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs font-bold text-lg tracking-tight">
          <Layers className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight">
              StudioClean AI
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
              gemini-3.1-flash-image-preview
            </span>
          </div>
          <p className="text-xs text-neutral-500 hidden sm:block">
            Natural language background removal & product photo cleanup
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Google Sheets Sync Button */}
        <button
          id="btn-toggle-sheets"
          onClick={onOpenSheetsModal}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            activeSpreadsheetId
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-neutral-50 text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
          }`}
          title="Manage Google Sheets logging"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span className="hidden md:inline">
            {activeSpreadsheetTitle ? activeSpreadsheetTitle.slice(0, 18) + (activeSpreadsheetTitle.length > 18 ? '...' : '') : 'Google Sheets'}
          </span>
          {activeSpreadsheetId && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>

        {/* User / Google Sign-in */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-neutral-200 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="hidden lg:block text-left text-xs">
              <p className="font-medium text-neutral-800 leading-tight">
                {user.displayName || 'Signed in'}
              </p>
              <p className="text-neutral-500 text-[10px] leading-tight truncate max-w-[120px]">
                {user.email}
              </p>
            </div>
            <button
              id="btn-signout"
              onClick={onSignOut}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            id="btn-google-signin"
            onClick={onSignIn}
            disabled={isAuthenticating}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 shadow-2xs transition-all disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span>{isAuthenticating ? 'Connecting...' : 'Sign in for Sheets'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
