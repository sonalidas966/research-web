import React, { useState } from 'react';
import {
  Library,
  Sparkles,
  Download,
  AlertCircle,
  Loader2,
  Trash2,
  Layers,
  GitCompare,
  Quote,
  CheckSquare,
  Square,
  BookOpen,
} from 'lucide-react';
import { useResearch } from '../context/ResearchContext.tsx';
import { downloadAsPdf, downloadAsText } from '../lib/pdfExport.ts';
import type { LiteratureReview, ActiveTab } from '../types/index.ts';

interface LiteratureReviewViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const LiteratureReviewView: React.FC<LiteratureReviewViewProps> = ({ setActiveTab }) => {
  const { papers, reviews, saveLiteratureReview, deleteLiteratureReview } = useResearch();

  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>(
    papers.map((p) => p.id).slice(0, 3)
  );
  const [topicFocus, setTopicFocus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeReview, setActiveReview] = useState<LiteratureReview | null>(null);

  const toggleSelectPaper = (id: string) => {
    setSelectedPaperIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedPaperIds(papers.map((p) => p.id));
  const deselectAll = () => setSelectedPaperIds([]);

  const handleSynthesizeReview = async () => {
    if (selectedPaperIds.length === 0) {
      setError('Please select at least 1 paper to review (2 or more recommended for comparative synthesis).');
      return;
    }

    const selectedPapers = papers.filter((p) => selectedPaperIds.includes(p.id));

    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch('/api/literature-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          papers: selectedPapers.map((p) => ({
            id: p.id,
            title: p.title,
            authors: p.authors,
            year: p.year,
            text: p.extractedText,
          })),
          topic: topicFocus.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to synthesize literature review.');
      }

      const data = await response.json();

      const saved = await saveLiteratureReview({
        paperIds: selectedPaperIds,
        paperTitles: selectedPapers.map((p) => p.title).join('; '),
        reviewTitle: data.reviewTitle || 'Systematic Literature Review',
        synthesis: data.synthesis || '',
        commonThemes: data.commonThemes || '',
        conflictingFindings: data.conflictingFindings || '',
        structuredReview: data.structuredReview || '',
        citations: data.citations || '',
      });

      setActiveReview(saved);
    } catch (err: any) {
      console.error('Literature review synthesis error:', err);
      setError(err?.message || 'Error synthesizing literature review.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPdf = (item: LiteratureReview) => {
    downloadAsPdf(
      item.reviewTitle,
      'Multi-Paper Literature Review Synthesis',
      [
        { heading: '1. Thematic Synthesis & State of Research', body: item.synthesis },
        { heading: '2. Common Themes & Consensus', body: item.commonThemes },
        { heading: '3. Conflicting Findings & Divergences', body: item.conflictingFindings },
        { heading: '4. Structured Literature Review', body: item.structuredReview },
        { heading: '5. Cited Source Papers & References', body: item.citations },
      ],
      `lit_review_${item.reviewTitle.slice(0, 25).toLowerCase().replace(/[^a-z0-9]+/g, '_')}.pdf`
    );
  };

  const handleExportTxt = (item: LiteratureReview) => {
    const textContent = `# ${item.reviewTitle}
Synthesized by Aura Research — Your Personal Research Guide

Source Papers: ${item.paperTitles}

## 1. Synthesis & State of Research
${item.synthesis}

## 2. Common Themes & Consensus
${item.commonThemes}

## 3. Conflicting Findings & Divergences
${item.conflictingFindings}

## 4. Structured Literature Review
${item.structuredReview}

## 5. Citations & References
${item.citations}
`;
    downloadAsText(
      `lit_review_${item.reviewTitle.slice(0, 25).toLowerCase().replace(/[^a-z0-9]+/g, '_')}.txt`,
      textContent
    );
  };

  if (papers.length === 0) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
          <Library className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 font-serif">
          No Papers Available for Literature Review
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Upload 2 or more PDF research papers or load the sample landmark papers to synthesize cross-paper literature reviews.
        </p>
        <button
          onClick={() => setActiveTab('upload')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs"
        >
          Go to Upload Papers
        </button>
      </div>
    );
  }

  const displayReview = activeReview || reviews[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-serif">
          Multi-Paper Literature Review
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Synthesize across multiple papers, compare empirical findings, identify common themes, highlight conflicting results, and cite source papers.
        </p>
      </div>

      {/* Paper Selection Configuration Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Select Source Papers for Synthesis ({selectedPaperIds.length} of {papers.length} selected)
            </h3>
            <p className="text-xs text-slate-500">
              Comparing 2 or more papers enables deeper thematic convergence and divergence analysis
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={selectAll}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50"
            >
              Select All
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={deselectAll}
              className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1 rounded hover:bg-slate-100"
            >
              Deselect
            </button>
          </div>
        </div>

        {/* Paper Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
          {papers.map((paper) => {
            const isSelected = selectedPaperIds.includes(paper.id);
            return (
              <div
                key={paper.id}
                onClick={() => toggleSelectPaper(paper.id)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start space-x-3 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 text-slate-900'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-600'
                }`}
              >
                <div className="mt-0.5 text-blue-600">
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 fill-blue-600 text-white" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold line-clamp-1 text-slate-900">
                    {paper.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {paper.authors ? paper.authors : paper.fileName} • {paper.pageCount} pages
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional Custom Angle / Topic */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Optional Synthesis Angle or Specific Research Focus:
          </label>
          <input
            type="text"
            placeholder="e.g., Computational efficiency and scaling limits, or clinical off-target safety..."
            value={topicFocus}
            onChange={(e) => setTopicFocus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Synthesize Button */}
        <div className="pt-2 flex justify-end">
          <button
            disabled={isLoading || selectedPaperIds.length === 0}
            onClick={handleSynthesizeReview}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Literature Across Papers...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Synthesize Literature Review</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* SYNTHESIZED LITERATURE REVIEW RESULTS */}
      {displayReview ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/50">
                Peer-Reviewed Literature Synthesis
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-serif mt-1">
                {displayReview.reviewTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                Synthesized from: {displayReview.paperTitles}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExportPdf(displayReview)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={() => handleExportTxt(displayReview)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors"
              >
                <span>TXT</span>
              </button>

              <button
                onClick={() => deleteLiteratureReview(displayReview.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 1. Synthesis Overview */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 uppercase tracking-wide">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>1. State of the Art & Thematic Overview</span>
              </div>
              <div className="text-sm font-serif text-slate-800 leading-relaxed bg-blue-50/20 p-5 rounded-xl border border-blue-100 whitespace-pre-wrap">
                {displayReview.synthesis}
              </div>
            </div>

            {/* 2. Common Themes & Consensus */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900 uppercase tracking-wide">
                <Quote className="w-4 h-4 text-emerald-600" />
                <span>2. Common Themes & Scientific Consensus</span>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed bg-emerald-50/20 p-5 rounded-xl border border-emerald-100 whitespace-pre-wrap">
                {displayReview.commonThemes}
              </div>
            </div>

            {/* 3. Conflicting Findings & Divergences */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 uppercase tracking-wide">
                <GitCompare className="w-4 h-4 text-amber-600" />
                <span>3. Conflicting Findings & Methodological Divergences</span>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed bg-amber-50/20 p-5 rounded-xl border border-amber-100 whitespace-pre-wrap">
                {displayReview.conflictingFindings}
              </div>
            </div>

            {/* 4. Structured Review */}
            {displayReview.structuredReview && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900 uppercase tracking-wide">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>4. Detailed Literature Review</span>
                </div>
                <div className="text-sm font-serif text-slate-800 leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-200 whitespace-pre-wrap">
                  {displayReview.structuredReview}
                </div>
              </div>
            )}

            {/* 5. Citations & References */}
            {displayReview.citations && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Cited Source Papers & Linked Contributions
                </div>
                <div className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap font-mono">
                  {displayReview.citations}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          Select source papers above and click &quot;Synthesize Literature Review&quot; to generate an integrated academic review with cross-paper citations.
        </div>
      )}
    </div>
  );
};
