import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  Copy,
  Check,
  Grid,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Columns,
  SplitSquareVertical,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { BackgroundTheme, ComparisonMode } from '../types';

interface CompareCanvasProps {
  originalImage: string | null;
  resultImage: string | null;
  productName: string;
  isProcessing: boolean;
  onOpenSheetsModal: () => void;
  onQuickLogToSheet?: () => void;
  isLoggingToSheet?: boolean;
  sheetLoggedSuccess?: boolean;
}

export const CompareCanvas: React.FC<CompareCanvasProps> = ({
  originalImage,
  resultImage,
  productName,
  isProcessing,
  onOpenSheetsModal,
  onQuickLogToSheet,
  isLoggingToSheet,
  sheetLoggedSuccess,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ComparisonMode>('split');
  const [bgTheme, setBgTheme] = useState<BackgroundTheme>('transparent');
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Drag handler for split slider
  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX);
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging, handleMove]);

  // Download Image
  const handleDownload = () => {
    const imgToDownload = resultImage || originalImage;
    if (!imgToDownload) return;
    const a = document.createElement('a');
    a.href = imgToDownload;
    a.download = `${productName.toLowerCase().replace(/\s+/g, '-') || 'product'}-cleaned.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Copy Image to Clipboard
  const handleCopy = async () => {
    const target = resultImage || originalImage;
    if (!target) return;
    try {
      const response = await fetch(target);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    } catch (e) {
      console.warn('Clipboard write failed, fallback URL copy', e);
      await navigator.clipboard.writeText(target);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    }
  };

  // Background style helper
  const getBackdropClass = () => {
    switch (bgTheme) {
      case 'white':
        return 'bg-white';
      case 'neutral':
        return 'bg-neutral-200';
      case 'warm':
        return 'bg-[#f6f2ec]';
      case 'dark':
        return 'bg-neutral-900';
      case 'gradient':
        return 'bg-gradient-to-tr from-neutral-100 via-stone-200 to-amber-50';
      case 'transparent':
      default:
        return 'bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px] bg-white';
    }
  };

  const activeImage = resultImage || originalImage;

  return (
    <div
      id="product-compare-stage"
      className={`flex flex-col bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'relative h-[560px] sm:h-[620px]'
      }`}
    >
      {/* Top Canvas Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-neutral-200 bg-neutral-50/80 text-xs gap-2">
        {/* Left: View Mode Controls */}
        <div className="flex items-center gap-1 bg-neutral-200/60 p-0.5 rounded-lg">
          <button
            id="view-mode-split"
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'split' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="Split curtain slider"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split</span>
          </button>
          <button
            id="view-mode-side-by-side"
            onClick={() => setViewMode('side-by-side')}
            className={`px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'side-by-side' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="Side by side comparison"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Side by Side</span>
          </button>
          <button
            id="view-mode-result"
            onClick={() => setViewMode('result-only')}
            className={`px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'result-only' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="Cleaned result only"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Cleaned</span>
          </button>
          <button
            id="view-mode-original"
            onClick={() => setViewMode('original-only')}
            className={`px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'original-only' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="Original photo only"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Original</span>
          </button>
        </div>

        {/* Middle: Studio Backdrop Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-400 text-[11px] font-medium hidden md:inline">Backdrop:</span>
          <div className="flex items-center gap-1 bg-neutral-200/60 p-0.5 rounded-lg">
            <button
              onClick={() => setBgTheme('transparent')}
              className={`w-5 h-5 rounded-sm border ${
                bgTheme === 'transparent' ? 'ring-2 ring-indigo-500 border-white' : 'border-neutral-300'
              } bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[size:6px_6px] bg-white`}
              title="Transparent checkerboard"
            />
            <button
              onClick={() => setBgTheme('white')}
              className={`w-5 h-5 rounded-sm border ${
                bgTheme === 'white' ? 'ring-2 ring-indigo-500 border-neutral-400' : 'border-neutral-300'
              } bg-white`}
              title="E-commerce Pure White (#FFFFFF)"
            />
            <button
              onClick={() => setBgTheme('neutral')}
              className={`w-5 h-5 rounded-sm border ${
                bgTheme === 'neutral' ? 'ring-2 ring-indigo-500 border-neutral-400' : 'border-neutral-300'
              } bg-neutral-200`}
              title="Studio Neutral Gray"
            />
            <button
              onClick={() => setBgTheme('warm')}
              className={`w-5 h-5 rounded-sm border ${
                bgTheme === 'warm' ? 'ring-2 ring-indigo-500 border-neutral-400' : 'border-neutral-300'
              } bg-[#f6f2ec]`}
              title="Warm Minimalist Beige"
            />
            <button
              onClick={() => setBgTheme('dark')}
              className={`w-5 h-5 rounded-sm border ${
                bgTheme === 'dark' ? 'ring-2 ring-indigo-500 border-neutral-600' : 'border-neutral-300'
              } bg-neutral-900`}
              title="Dark Luxury Studio"
            />
          </div>
        </div>

        {/* Right: Inspection, Zoom, Log & Export */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-md transition-colors ${
              showGrid ? 'bg-indigo-100 text-indigo-700' : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/50'
            }`}
            title="Toggle alignment grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
            className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/50 rounded-md"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-neutral-500 px-1 min-w-[36px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
            className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/50 rounded-md"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {zoomLevel !== 1 && (
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/50 rounded-md"
              title="Reset zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="h-4 w-px bg-neutral-300 mx-1" />

          {/* Quick Log to Sheet */}
          {onQuickLogToSheet && (
            <button
              id="btn-quick-log-sheet"
              onClick={onQuickLogToSheet}
              disabled={isLoggingToSheet}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium text-xs transition-all ${
                sheetLoggedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
              }`}
              title="Log this edit to Google Sheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">
                {sheetLoggedSuccess ? 'Logged!' : isLoggingToSheet ? 'Logging...' : 'Log to Sheet'}
              </span>
            </button>
          )}

          {/* Copy Image */}
          <button
            id="btn-copy-image"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-medium text-xs shadow-2xs"
            title="Copy image to clipboard"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Download Image */}
          <button
            id="btn-download-image"
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs shadow-xs"
            title="Download high-resolution image"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/50 rounded-md"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        className={`relative flex-1 w-full h-full overflow-hidden select-none flex items-center justify-center ${getBackdropClass()}`}
      >
        {/* Alignment Grid Overlay */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(99, 102, 241, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.15) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          >
            {/* Center crosshairs */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-indigo-400/40" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-indigo-400/40" />
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-30 flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg animate-pulse mb-3">
              <Sparkles className="w-6 h-6 animate-spin text-indigo-100" />
            </div>
            <p className="font-semibold text-neutral-900 text-sm">Processing with gemini-3.1-flash-image-preview</p>
            <p className="text-xs text-neutral-500 mt-1">Removing background & executing custom instructions...</p>
          </div>
        )}

        {/* Empty State */}
        {!originalImage && !resultImage && (
          <div className="text-center p-8 max-w-sm">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center border border-neutral-200">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-semibold text-neutral-800 text-base">Select or upload a product photo</h3>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Upload your own item photo or pick one of the sample products below to start removing backgrounds.
            </p>
          </div>
        )}

        {/* VIEW MODE: SPLIT SLIDER */}
        {viewMode === 'split' && activeImage && (
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            style={{ transform: `scale(${zoomLevel})`, transition: isDragging ? 'none' : 'transform 0.15s ease' }}
          >
            {/* Base Image (Result or Original) */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <img
                src={resultImage || originalImage!}
                alt="Product Cleaned"
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain pointer-events-none drop-shadow-md"
              />
            </div>

            {/* Top Cutout Layer (Original clipped by slider) if result exists */}
            {resultImage && originalImage && (
              <div
                className="absolute inset-0 overflow-hidden flex items-center justify-center p-6"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
              >
                <img
                  src={originalImage}
                  alt="Product Original"
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain pointer-events-none drop-shadow-md"
                />
              </div>
            )}

            {/* Draggable Divider Handle */}
            {resultImage && originalImage && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.35)] cursor-ew-resize z-20 flex items-center justify-center"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
              >
                <div className="w-8 h-8 rounded-full bg-white border border-neutral-300 shadow-md flex items-center justify-center text-neutral-700 hover:scale-110 active:scale-95 transition-transform">
                  <SplitSquareVertical className="w-4 h-4 rotate-90" />
                </div>
              </div>
            )}

            {/* Corner Badges */}
            {resultImage && originalImage && (
              <>
                <span className="absolute top-4 left-4 bg-neutral-900/80 text-white text-[10px] font-medium px-2 py-1 rounded-md backdrop-blur pointer-events-none shadow-xs">
                  Original Photo
                </span>
                <span className="absolute top-4 right-4 bg-indigo-600/90 text-white text-[10px] font-medium px-2 py-1 rounded-md backdrop-blur pointer-events-none shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Cleaned Result
                </span>
              </>
            )}
          </div>
        )}

        {/* VIEW MODE: SIDE BY SIDE */}
        {viewMode === 'side-by-side' && (
          <div
            className="w-full h-full grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Original Card */}
            <div className="relative w-full h-full flex flex-col items-center justify-center rounded-xl bg-white/40 border border-neutral-200/80 p-4 overflow-hidden">
              <span className="absolute top-3 left-3 bg-neutral-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur z-10">
                Original
              </span>
              {originalImage ? (
                <img
                  src={originalImage}
                  alt="Original"
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain drop-shadow-sm"
                />
              ) : (
                <span className="text-xs text-neutral-400">No original image</span>
              )}
            </div>

            {/* Cleaned Result Card */}
            <div className="relative w-full h-full flex flex-col items-center justify-center rounded-xl bg-white/40 border border-neutral-200/80 p-4 overflow-hidden">
              <span className="absolute top-3 left-3 bg-indigo-600/90 text-white text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur z-10 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Cleaned
              </span>
              {resultImage ? (
                <img
                  src={resultImage}
                  alt="Cleaned Result"
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain drop-shadow-sm"
                />
              ) : (
                <div className="text-center p-4">
                  <p className="text-xs text-neutral-400">Awaiting instructions</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW MODE: RESULT ONLY */}
        {viewMode === 'result-only' && (
          <div
            className="w-full h-full flex items-center justify-center p-6"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {resultImage ? (
              <img
                src={resultImage}
                alt="Cleaned Result"
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain drop-shadow-lg"
              />
            ) : (
              <div className="text-center">
                <p className="text-xs text-neutral-400">Type instructions below to produce cleaned result</p>
              </div>
            )}
          </div>
        )}

        {/* VIEW MODE: ORIGINAL ONLY */}
        {viewMode === 'original-only' && (
          <div
            className="w-full h-full flex items-center justify-center p-6"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {originalImage ? (
              <img
                src={originalImage}
                alt="Original Photo"
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain drop-shadow-md"
              />
            ) : (
              <span className="text-xs text-neutral-400">No original image loaded</span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info Bar */}
      <div className="px-4 py-2 border-t border-neutral-200 bg-white flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-2 truncate">
          <span className="font-medium text-neutral-800">{productName || 'Product'}</span>
          {resultImage && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Cleaned & Background Removed
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] text-neutral-400">Drag center slider to inspect before & after</span>
        </div>
      </div>
    </div>
  );
};
