import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  ArrowRight,
  Eye,
  BookOpen,
} from 'lucide-react';
import { extractTextFromPdf } from '../lib/pdfExtractor.ts';
import { useResearch } from '../context/ResearchContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase.ts';
import type { ActiveTab, Paper } from '../types/index.ts';

interface UploadViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onPaperUploaded?: (paper: Paper) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  setActiveTab,
  onPaperUploaded,
}) => {
  const { addPaper, loadSamplePaper, papers, deletePaper } = useResearch();
  const { currentUser } = useAuth();

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extracted preview modal / state
  const [recentlyUploadedPaper, setRecentlyUploadedPaper] = useState<Paper | null>(null);
  const [selectedPreviewPaper, setSelectedPreviewPaper] = useState<Paper | null>(null);
  const [activePreviewPage, setActivePreviewPage] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage('Please upload a valid PDF document (.pdf).');
      return;
    }

    try {
      setErrorMessage(null);
      setIsProcessing(true);
      setProgress(10);
      setStatusMessage('Extracting pages and text content from PDF...');

      const result = await extractTextFromPdf(file, (p) => {
        setProgress(Math.min(90, Math.max(10, p)));
        setStatusMessage(`Parsing PDF text... ${p}% completed (${result ? result.pageCount : ''} pages)`);
      });

      if (!result.fullText || result.fullText.trim().length === 0) {
        throw new Error('No readable text could be extracted. The PDF may be scanned or image-only without OCR.');
      }

      let storageUrl = '';
      if (currentUser) {
        setStatusMessage('Securing document in Firebase Storage...');
        try {
          const fileRef = ref(storage, `users/${currentUser.uid}/papers/${Date.now()}_${file.name}`);
          const uploadTask = await uploadBytesResumable(fileRef, file);
          storageUrl = await getDownloadURL(uploadTask.ref);
        } catch (storageErr) {
          console.warn('Firebase Storage upload notice (continuing with database record):', storageErr);
        }
      }

      setStatusMessage('Saving paper metadata and parsed content...');
      const saved = await addPaper({
        title: result.suggestedTitle || file.name.replace(/\.pdf$/i, ''),
        authors: result.suggestedAuthors || '',
        year: result.estimatedYear || '',
        abstract: result.suggestedAbstract || '',
        fileName: file.name,
        fileSize: file.size,
        pageCount: result.pageCount,
        storageUrl,
        extractedText: result.fullText,
        pageTexts: result.pages,
      });

      setProgress(100);
      setStatusMessage('Paper successfully processed and saved!');
      setRecentlyUploadedPaper(saved);

      if (onPaperUploaded) {
        onPaperUploaded(saved);
      }
    } catch (err: any) {
      console.error('PDF parsing error:', err);
      setErrorMessage(err?.message || 'Failed to process PDF file. Please try another file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-serif">
          Upload Research Papers
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Upload PDF papers to extract page-by-page text, review findings, generate summaries, and enable evidence-based citations.
        </p>
      </div>

      {/* Upload Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/60 scale-[1.005]'
            : 'border-slate-300 hover:border-blue-400 bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {isProcessing ? 'Processing Research Paper...' : 'Choose a PDF paper or drag & drop here'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports standard scientific PDF papers (journal articles, conference papers, preprints)
            </p>
          </div>

          {isProcessing ? (
            <div className="space-y-2 pt-2">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 font-medium">{statusMessage}</p>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Select PDF from Computer</span>
            </button>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification for Recently Uploaded Paper */}
      {recentlyUploadedPaper && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Paper Ready for AI Analysis
              </span>
              <h4 className="text-sm font-semibold text-slate-900 mt-0.5">
                {recentlyUploadedPaper.title}
              </h4>
              <p className="text-xs text-slate-600">
                {recentlyUploadedPaper.pageCount} pages parsed • {(recentlyUploadedPaper.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('summarize')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <span>Summarize Paper</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className="px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Ask Assistant
            </button>
          </div>
        </div>
      )}

      {/* Fast Test Benchmark Academic Papers */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
        <div className="flex items-center space-x-2 text-slate-900">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold font-serif">
            Or Load Curated Academic Landmark Papers
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Try Aura Research instantly with peer-reviewed scientific papers pre-extracted for benchmarking:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                11 Pages • 2017
              </span>
              <h4 className="text-xs font-bold text-slate-900 mt-2">
                Attention Is All You Need
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Self-attention mechanisms, transformer architecture, BLEU translation benchmarks, and computational complexity.
              </p>
            </div>
            <button
              onClick={async () => {
                const p = await loadSamplePaper(0);
                setRecentlyUploadedPaper(p);
              }}
              className="w-full py-1.5 px-3 bg-white text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-lg text-xs font-medium transition-all shadow-2xs"
            >
              Load Paper
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                12 Pages • 2016
              </span>
              <h4 className="text-xs font-bold text-slate-900 mt-2">
                Deep Residual Learning
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Identity mapping shortcuts, vanishing gradients, 152-layer deep ResNets, and optimization degradation.
              </p>
            </div>
            <button
              onClick={async () => {
                const p = await loadSamplePaper(1);
                setRecentlyUploadedPaper(p);
              }}
              className="w-full py-1.5 px-3 bg-white text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-lg text-xs font-medium transition-all shadow-2xs"
            >
              Load Paper
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                14 Pages • 2020
              </span>
              <h4 className="text-xs font-bold text-slate-900 mt-2">
                CRISPR-Cas9 Mechanics
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Off-target double-strand breaks, seed region kinetics, high-fidelity variants (eSpCas9, HypaCas9), and clinical delivery.
              </p>
            </div>
            <button
              onClick={async () => {
                const p = await loadSamplePaper(2);
                setRecentlyUploadedPaper(p);
              }}
              className="w-full py-1.5 px-3 bg-white text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-lg text-xs font-medium transition-all shadow-2xs"
            >
              Load Paper
            </button>
          </div>
        </div>
      </div>

      {/* Library of Uploaded Papers */}
      {papers.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-serif">
                Your Uploaded Papers ({papers.length})
              </h2>
              <p className="text-xs text-slate-500">
                Click any paper to inspect extracted page text or perform actions
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {papers.map((p) => (
              <div
                key={p.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {p.pageCount} Pages
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {(p.fileSize / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 mt-1 truncate">
                    {p.title}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    {p.authors ? p.authors : p.fileName}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedPreviewPaper(p);
                      setActivePreviewPage(1);
                    }}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Text</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('summarize')}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    Summarize
                  </button>
                  <button
                    onClick={() => deletePaper(p.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Text Inspector Modal */}
      {selectedPreviewPaper && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600">
                  Extracted Text Inspector
                </span>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  {selectedPreviewPaper.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Total {selectedPreviewPaper.pageCount} pages parsed with evidence anchors
                </p>
              </div>
              <button
                onClick={() => setSelectedPreviewPaper(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Page {activePreviewPage} of {selectedPreviewPaper.pageCount}
              </span>
              <div className="flex items-center space-x-1">
                <button
                  disabled={activePreviewPage <= 1}
                  onClick={() => setActivePreviewPage((prev) => Math.max(1, prev - 1))}
                  className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={activePreviewPage >= selectedPreviewPaper.pageCount}
                  onClick={() => setActivePreviewPage((prev) => Math.min(selectedPreviewPaper.pageCount, prev + 1))}
                  className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap flex-1 bg-white">
              {selectedPreviewPaper.pageTexts && selectedPreviewPaper.pageTexts[activePreviewPage - 1]
                ? selectedPreviewPaper.pageTexts[activePreviewPage - 1].text
                : selectedPreviewPaper.extractedText.slice(0, 4000)}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end space-x-2 bg-slate-50">
              <button
                onClick={() => setSelectedPreviewPaper(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedPreviewPaper(null);
                  setActiveTab('summarize');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700"
              >
                Summarize This Paper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
