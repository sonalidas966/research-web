import React from 'react';
import {
  FileText,
  UploadCloud,
  Library,
  Compass,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Trash2,
  Calendar,
  Layers,
  User,
  PlusCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useResearch } from '../context/ResearchContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import type { ActiveTab, Paper } from '../types/index.ts';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSelectPaperForAction?: (paper: Paper, action: 'summarize' | 'abstract' | 'chat') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onSelectPaperForAction,
}) => {
  const {
    papers,
    summaries,
    abstracts,
    reviews,
    gaps,
    deletePaper,
    loadSamplePaper,
  } = useResearch();
  const { currentUser, signInWithGoogle } = useAuth();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-blue-700/50 backdrop-blur-xs text-blue-200 text-xs px-3 py-1 rounded-full mb-3 border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Systematic Literature Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif mb-2 text-white">
            Aura Research
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed mb-6 font-sans">
            Your personal research guide. Upload academic papers in PDF, generate structured objective summaries, synthesize multi-paper literature reviews, discover unexplored research gaps, and converse with grounded page citations.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('upload')}
              className="inline-flex items-center space-x-2 bg-white text-blue-900 hover:bg-blue-50 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition-all"
            >
              <UploadCloud className="w-4 h-4 text-blue-600" />
              <span>Upload Research PDF</span>
            </button>

            {papers.length === 0 && (
              <button
                onClick={async () => {
                  await loadSamplePaper(0);
                  setActiveTab('summarize');
                }}
                className="inline-flex items-center space-x-2 bg-blue-700/60 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl text-xs sm:text-sm border border-blue-400/30 transition-all"
              >
                <Sparkles className="w-4 h-4 text-blue-300" />
                <span>Load Sample Paper</span>
              </button>
            )}

            {!currentUser && (
              <button
                onClick={() => signInWithGoogle()}
                className="inline-flex items-center space-x-2 bg-blue-950/60 hover:bg-blue-950 text-blue-200 font-medium px-4 py-2 rounded-xl text-xs sm:text-sm border border-blue-700/50 transition-all ml-auto"
              >
                <span>Sign in with Google to sync cloud</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Papers Stored
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{papers.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Uploaded & parsed</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Summaries
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {summaries.length + abstracts.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Structured analyses</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Reviews
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Library className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{reviews.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Multi-paper syntheses</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Research Gaps
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{gaps.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Unexplored avenues</p>
        </div>
      </div>

      {/* Main Content Sections: Uploaded Papers & Recent Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Uploaded Papers */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-serif">
                Uploaded Research Papers
              </h2>
              <p className="text-xs text-slate-500">
                Documents available for summarization, review synthesis, and assistant queries
              </p>
            </div>
            <button
              onClick={() => setActiveTab('upload')}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-3 py-1.5 rounded-lg transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Paper</span>
            </button>
          </div>

          {papers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-sm font-semibold text-slate-900">No papers uploaded yet</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload a PDF paper to begin extracting text, generating structured summaries, or querying with evidence citations.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-xs transition-colors"
                >
                  Upload Your PDF
                </button>
                <button
                  onClick={async () => {
                    await loadSamplePaper(0);
                    setActiveTab('summarize');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
                >
                  Load Landmark Transformer Paper
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {papers.map((paper) => (
                <div
                  key={paper.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/50">
                        {paper.pageCount} Pages
                      </span>
                      {paper.year && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {paper.year}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm text-slate-900 line-clamp-1 hover:text-blue-600">
                      {paper.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {paper.authors ? `By ${paper.authors}` : paper.fileName}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <button
                      onClick={() => {
                        if (onSelectPaperForAction) {
                          onSelectPaperForAction(paper, 'summarize');
                        } else {
                          setActiveTab('summarize');
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      title="Summarize Paper"
                    >
                      Summarize
                    </button>
                    <button
                      onClick={() => {
                        if (onSelectPaperForAction) {
                          onSelectPaperForAction(paper, 'chat');
                        } else {
                          setActiveTab('chat');
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      title="Ask Assistant"
                    >
                      Chat
                    </button>
                    <button
                      onClick={() => deletePaper(paper.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove Paper"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sample Papers Quick Selector */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Fast Benchmark Papers Available for Direct Exploration:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={async () => {
                  await loadSamplePaper(0);
                  setActiveTab('summarize');
                }}
                className="text-left p-2.5 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
              >
                <div className="text-[11px] font-bold text-slate-800 line-clamp-1">
                  Attention Is All You Need
                </div>
                <div className="text-[10px] text-slate-500">Vaswani et al. • Transformers</div>
              </button>

              <button
                onClick={async () => {
                  await loadSamplePaper(1);
                  setActiveTab('summarize');
                }}
                className="text-left p-2.5 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
              >
                <div className="text-[11px] font-bold text-slate-800 line-clamp-1">
                  Deep Residual Learning
                </div>
                <div className="text-[10px] text-slate-500">He et al. • ResNet Architectures</div>
              </button>

              <button
                onClick={async () => {
                  await loadSamplePaper(2);
                  setActiveTab('summarize');
                }}
                className="text-left p-2.5 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
              >
                <div className="text-[11px] font-bold text-slate-800 line-clamp-1">
                  CRISPR-Cas9 Mechanics
                </div>
                <div className="text-[10px] text-slate-500">Doudna et al. • Off-Target Edits</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Recent Summaries & Saved Research Topics */}
        <div className="space-y-6">
          {/* Recent Summaries */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-slate-900">
                Recent Paper Summaries
              </h3>
              <button
                onClick={() => setActiveTab('summarize')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {summaries.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No summaries generated yet. Run the summarizer on any uploaded paper.
              </p>
            ) : (
              <div className="space-y-3">
                {summaries.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveTab('summarize')}
                    className="p-3 rounded-lg bg-slate-50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 cursor-pointer transition-all space-y-1"
                  >
                    <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {item.paperTitle}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-2">
                      {item.keyFindings || item.fullSummaryText}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Research Topics & Gaps */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-slate-900">
                Saved Research Gaps
              </h3>
              <button
                onClick={() => setActiveTab('research-gaps')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center space-x-1"
              >
                <span>Explore</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {gaps.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No research gaps identified yet. Run the Research Gap Finder across your papers.
              </p>
            ) : (
              <div className="space-y-3">
                {gaps.slice(0, 3).map((gap) => (
                  <div
                    key={gap.id}
                    onClick={() => setActiveTab('research-gaps')}
                    className="p-3 rounded-lg bg-amber-50/40 border border-amber-200/60 hover:border-amber-300 cursor-pointer transition-all space-y-1"
                  >
                    <div className="text-xs font-bold text-amber-900 line-clamp-1">
                      {gap.topic}
                    </div>
                    <div className="text-[11px] text-slate-600 line-clamp-2">
                      {gap.unansweredQuestions || gap.limitations}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Academic Literature Review CTA */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-200/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-blue-800 font-serif font-bold text-sm">
              <Library className="w-4 h-4 text-blue-600" />
              <span>Multi-Paper Synthesis</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Synthesize 2 or more papers into an academic literature review with common themes, conflicting methodologies, and citations.
            </p>
            <button
              onClick={() => setActiveTab('literature-review')}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              Start Literature Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
