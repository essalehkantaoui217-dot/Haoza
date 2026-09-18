import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { CompareCanvas } from './components/CompareCanvas';
import { InstructionBar } from './components/InstructionBar';
import { SamplePicker } from './components/SamplePicker';
import { HistoryTrail } from './components/HistoryTrail';
import { SheetsDrawer } from './components/SheetsDrawer';
import { SmartInspectorModal } from './components/SmartInspectorModal';
import { SAMPLE_PRODUCT_PHOTOS } from './data/samplePhotos';
import { ProductEditStep, SampleProductPhoto, PhotoAnalysis } from './types';
import { initAuth, googleSignIn, logout, getAccessToken } from './lib/firebaseAuth';
import {
  createProductCatalogSpreadsheet,
  appendEditLog,
  readRecentLogs,
  getSpreadsheetMetadata,
} from './lib/googleSheets';
import { convertImageUrlToBase64, performLocalCanvasCutout } from './lib/canvasCutout';
import { AlertCircle, X, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Authentication & Google Sheets State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);
  const [activeSpreadsheetId, setActiveSpreadsheetId] = useState<string | null>(null);
  const [activeSpreadsheetTitle, setActiveSpreadsheetTitle] = useState<string | null>(null);
  const [activeSpreadsheetUrl, setActiveSpreadsheetUrl] = useState<string | null>(null);
  const [recentLogs, setRecentLogs] = useState<string[][]>([]);
  const [isLoggingToSheet, setIsLoggingToSheet] = useState<boolean>(false);
  const [sheetLoggedSuccess, setSheetLoggedSuccess] = useState<boolean>(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState<boolean>(false);

  // Active Photo & Editing State
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(SAMPLE_PRODUCT_PHOTOS[0].id);
  const [productName, setProductName] = useState<string>(SAMPLE_PRODUCT_PHOTOS[0].name);
  const [originalImage, setOriginalImage] = useState<string | null>(SAMPLE_PRODUCT_PHOTOS[0].url);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [instruction, setInstruction] = useState<string>(SAMPLE_PRODUCT_PHOTOS[0].suggestedPrompt);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastModelUsed, setLastModelUsed] = useState<string>('gemini-3.1-flash-image-preview');

  // History Pipeline
  const [editSteps, setEditSteps] = useState<ProductEditStep[]>([
    {
      id: 'step-0',
      timestamp: Date.now(),
      prompt: 'Original product photo',
      imageUrl: SAMPLE_PRODUCT_PHOTOS[0].url,
      actionType: 'original',
    },
  ]);
  const [activeStepId, setActiveStepId] = useState<string | null>('step-0');

  // Diagnosis Modal
  const [analysisModalOpen, setAnalysisModalOpen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [photoAnalysis, setPhotoAnalysis] = useState<PhotoAnalysis | null>(null);

  // Status/Error Banner
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(null);

  // Initialize Firebase Auth listener on startup
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
      },
      () => {
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      setBannerError(null);
      const res = await googleSignIn();
      if (res?.user) {
        setUser(res.user);
        setBannerSuccess(`Connected Google Account: ${res.user.email}`);
        setTimeout(() => setBannerSuccess(null), 4000);
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setBannerError(err?.message || 'Could not complete Google sign-in.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Google Sign-Out Handler
  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setActiveSpreadsheetId(null);
    setActiveSpreadsheetTitle(null);
    setActiveSpreadsheetUrl(null);
    setRecentLogs([]);
  };

  // Create New Spreadsheet
  const handleCreateNewSheet = async (customTitle?: string) => {
    const token = await getAccessToken();
    if (!token) {
      setIsSheetsModalOpen(true);
      throw new Error('Please sign in with Google first.');
    }
    setIsCreatingSheet(true);
    try {
      const meta = await createProductCatalogSpreadsheet(token, customTitle);
      setActiveSpreadsheetId(meta.spreadsheetId);
      setActiveSpreadsheetTitle(meta.title);
      setActiveSpreadsheetUrl(meta.spreadsheetUrl);
      const rows = await readRecentLogs(token, meta.spreadsheetId);
      setRecentLogs(rows);
      setBannerSuccess(`Created Google Sheet: "${meta.title}"`);
      setTimeout(() => setBannerSuccess(null), 4000);
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Select Existing Spreadsheet
  const handleSelectExistingSheet = async (id: string) => {
    const token = await getAccessToken();
    if (!token) {
      setIsSheetsModalOpen(true);
      throw new Error('Please sign in with Google first.');
    }
    const meta = await getSpreadsheetMetadata(token, id);
    setActiveSpreadsheetId(meta.spreadsheetId);
    setActiveSpreadsheetTitle(meta.title);
    setActiveSpreadsheetUrl(meta.spreadsheetUrl);
    const rows = await readRecentLogs(token, meta.spreadsheetId);
    setRecentLogs(rows);
    setBannerSuccess(`Connected Google Sheet: "${meta.title}"`);
    setTimeout(() => setBannerSuccess(null), 4000);
  };

  // Log Edit to Sheet
  const handleLogCurrentEdit = async (customProductName?: string, notes?: string) => {
    const token = await getAccessToken();
    if (!token || !activeSpreadsheetId) {
      setIsSheetsModalOpen(true);
      return;
    }
    setIsLoggingToSheet(true);
    try {
      await appendEditLog(token, activeSpreadsheetId, {
        productName: customProductName || productName,
        promptInstruction: instruction || 'Background removal and cleanup',
        status: resultImage ? 'Cleaned & Background Removed' : 'Original Cataloged',
        aspectRatio,
        modelUsed: lastModelUsed,
        notes: notes || 'Logged from StudioClean AI',
      });
      setSheetLoggedSuccess(true);
      setTimeout(() => setSheetLoggedSuccess(false), 3000);
      const rows = await readRecentLogs(token, activeSpreadsheetId);
      setRecentLogs(rows);
    } catch (err: any) {
      setBannerError(err?.message || 'Failed to append row to Google Sheet.');
    } finally {
      setIsLoggingToSheet(false);
    }
  };

  const handleRefreshLogs = async () => {
    const token = await getAccessToken();
    if (token && activeSpreadsheetId) {
      const rows = await readRecentLogs(token, activeSpreadsheetId);
      setRecentLogs(rows);
    }
  };

  // Select Sample Product
  const handleSelectSample = (sample: SampleProductPhoto) => {
    setSelectedSampleId(sample.id);
    setProductName(sample.name);
    setOriginalImage(sample.url);
    setResultImage(null);
    setInstruction(sample.suggestedPrompt);
    setEditSteps([
      {
        id: `step-${Date.now()}`,
        timestamp: Date.now(),
        prompt: `Sample: ${sample.name}`,
        imageUrl: sample.url,
        actionType: 'original',
      },
    ]);
    setActiveStepId(null);
  };

  // Upload Custom Image File
  const handleUploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setSelectedSampleId(null);
      setProductName(cleanName);
      setOriginalImage(dataUrl);
      setResultImage(null);
      setInstruction('Remove background completely, isolate subject on clean pure white #FFFFFF background with natural contact shadow');
      const firstStepId = `step-${Date.now()}`;
      setEditSteps([
        {
          id: firstStepId,
          timestamp: Date.now(),
          prompt: `Uploaded: ${file.name}`,
          imageUrl: dataUrl,
          actionType: 'original',
        },
      ]);
      setActiveStepId(firstStepId);
    };
    reader.readAsDataURL(file);
  };

  // Submit Natural Language Instruction to Gemini API
  const handleSubmitInstruction = async (customPrompt?: string) => {
    const promptToRun = customPrompt || instruction;
    if (!promptToRun.trim()) return;

    const baseSource = resultImage || originalImage;
    if (!baseSource) {
      setBannerError('Please upload or select a product photo first.');
      return;
    }

    setIsProcessing(true);
    setBannerError(null);

    try {
      // Ensure image is converted to base64
      let base64Data = baseSource;
      if (baseSource.startsWith('http')) {
        base64Data = await convertImageUrlToBase64(baseSource);
      }

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptToRun,
          imageBase64: base64Data,
          aspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process product image');
      }

      setResultImage(data.imageUrl);
      if (data.modelUsed) {
        setLastModelUsed(data.modelUsed);
      }

      // Add to history trail
      const newStepId = `step-${Date.now()}`;
      const newStep: ProductEditStep = {
        id: newStepId,
        timestamp: Date.now(),
        prompt: promptToRun,
        imageUrl: data.imageUrl,
        actionType: 'bg_removal',
        modelUsed: data.modelUsed,
      };

      setEditSteps((prev) => [...prev, newStep]);
      setActiveStepId(newStepId);
      setBannerSuccess('Photo cleaned & updated with Gemini AI');
      setTimeout(() => setBannerSuccess(null), 3000);
    } catch (err: any) {
      console.error('Processing error:', err);
      setBannerError(err?.message || 'Failed to execute instruction. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Instant local canvas cutout (50ms client-side preview)
  const handleInstantLocalCutout = async () => {
    if (!originalImage) return;
    try {
      const cutout = await performLocalCanvasCutout(originalImage);
      setResultImage(cutout);
      const newStepId = `step-${Date.now()}`;
      setEditSteps((prev) => [
        ...prev,
        {
          id: newStepId,
          timestamp: Date.now(),
          prompt: 'Instant Local Cutout (Alpha Keying)',
          imageUrl: cutout,
          actionType: 'bg_removal',
        },
      ]);
      setActiveStepId(newStepId);
      setBannerSuccess('Instant local cutout applied!');
      setTimeout(() => setBannerSuccess(null), 3000);
    } catch (err: any) {
      setBannerError('Instant local cutout could not process this image format.');
    }
  };

  // AI Photo Diagnosis
  const handleAnalyzePhoto = async () => {
    if (!originalImage) return;
    setIsAnalyzing(true);
    setAnalysisModalOpen(true);
    try {
      let base64Data = originalImage;
      if (originalImage.startsWith('http')) {
        base64Data = await convertImageUrlToBase64(originalImage);
      }

      const res = await fetch('/api/analyze-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Data,
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setPhotoAnalysis(data.analysis);
        if (data.analysis.productIdentified && (!productName || productName.includes('Sample'))) {
          setProductName(data.analysis.productIdentified);
        }
      }
    } catch (err: any) {
      console.error('Diagnosis failed:', err);
      setBannerError('Photo diagnosis failed to complete.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step selection in history
  const handleSelectStep = (step: ProductEditStep) => {
    setActiveStepId(step.id);
    if (step.actionType === 'original') {
      setResultImage(null);
    } else {
      setResultImage(step.imageUrl);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header */}
      <Header
        user={user}
        activeSpreadsheetId={activeSpreadsheetId}
        activeSpreadsheetTitle={activeSpreadsheetTitle}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        isAuthenticating={isAuthenticating}
      />

      {/* Global Alerts / Notification Banners */}
      {bannerError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 text-xs text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="font-medium">{bannerError}</span>
          </div>
          <button onClick={() => setBannerError(null)} className="text-red-400 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {bannerSuccess && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{bannerSuccess}</span>
          </div>
          <button onClick={() => setBannerSuccess(null)} className="text-emerald-500 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Studio Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Main Stage: Before / After Comparison Canvas */}
        <CompareCanvas
          originalImage={originalImage}
          resultImage={resultImage}
          productName={productName}
          isProcessing={isProcessing}
          onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
          onQuickLogToSheet={activeSpreadsheetId ? () => handleLogCurrentEdit() : undefined}
          isLoggingToSheet={isLoggingToSheet}
          sheetLoggedSuccess={sheetLoggedSuccess}
        />

        {/* Natural Language Instruction Command Bar */}
        <InstructionBar
          instruction={instruction}
          onChangeInstruction={setInstruction}
          onSubmit={handleSubmitInstruction}
          onInstantLocalCutout={handleInstantLocalCutout}
          onAnalyzePhoto={handleAnalyzePhoto}
          isAnalyzing={isAnalyzing}
          isProcessing={isProcessing}
          aspectRatio={aspectRatio}
          onChangeAspectRatio={setAspectRatio}
          hasOriginalImage={Boolean(originalImage)}
        />

        {/* Multi-Step History Trail */}
        <HistoryTrail
          steps={editSteps}
          activeStepId={activeStepId}
          onSelectStep={handleSelectStep}
        />

        {/* Photo Selection / Upload Bar */}
        <SamplePicker
          selectedSampleId={selectedSampleId}
          onSelectSample={handleSelectSample}
          onUploadImage={handleUploadImage}
        />
      </main>

      {/* Google Sheets Sync Drawer */}
      <SheetsDrawer
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        user={user}
        onSignIn={handleGoogleSignIn}
        isAuthenticating={isAuthenticating}
        activeSpreadsheetId={activeSpreadsheetId}
        activeSpreadsheetTitle={activeSpreadsheetTitle}
        activeSpreadsheetUrl={activeSpreadsheetUrl}
        onCreateNewSheet={handleCreateNewSheet}
        onSelectExistingSheet={handleSelectExistingSheet}
        onLogCurrentEdit={handleLogCurrentEdit}
        isLogging={isLoggingToSheet}
        isCreatingSheet={isCreatingSheet}
        recentLogs={recentLogs}
        onRefreshLogs={handleRefreshLogs}
        currentPrompt={instruction}
        defaultProductName={productName}
      />

      {/* AI Photo Diagnosis Modal */}
      <SmartInspectorModal
        isOpen={analysisModalOpen}
        onClose={() => setAnalysisModalOpen(false)}
        analysis={photoAnalysis}
        isLoading={isAnalyzing}
        onApplyPrompt={(p) => {
          setInstruction(p);
          handleSubmitInstruction(p);
        }}
      />
    </div>
  );
}
