import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Download,
  AlertCircle,
  Loader2,
  Trash2,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  CheckSquare,
  Square,
  Bookmark,
} from 'lucide-react';
import { useResearch } from '../context/ResearchContext.tsx';
import { downloadAsPdf, downloadAsText } from '../lib/pdfExport.ts';
import type { ResearchGap, ActiveTab } from '../types/index.ts';

interface ResearchGapsViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const ResearchGapsView: React.FC<ResearchGapsViewProps> = ({ setActiveTab }) => {
  const { papers, gaps, saveResearchGap, deleteResearchGap } = useResearch();

  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>(
    papers.map((p) => p.id).slice(0, 3)
  );
  const [focusArea, setFocusArea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeGap, setActiveGap] = useState<ResearchGap | null>(null);

  const toggleSelectPaper = (id: string) => {
    setSelectedPaperIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedPaperIds(papers.map((p) => p.id));
  const deselectAll = () => setSelectedPaperIds([]);

  const handleFindGaps = async () => {
    if (selectedPaperIds.length === 0) {
      setError('Please select at least 1 paper to inspect for limitations and novel gaps.');
      return;
    }

    const selectedPapers = papers.filter((p) => selectedPaperIds.includes(p.id));

    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch('/api/research-gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          papers: selectedPapers.map((p) => ({
            id: p.id,
            title: p.title,
            authors: p.authors,
            text: p.extractedText,
          })),
          focusArea: focusArea.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to analyze research gaps.');
      }

      const data = await response.json();

      const saved = await saveResearchGap({
        paperIds: selectedPaperIds,
        paperTitles: selectedPapers.map((p) => p.title).join('; '),
        topic: data.topic || focusArea.trim() || 'Identified Research Gaps & Novel Opportunities',
        limitations: data.limitations || '',
        unansweredQuestions: data.unansweredQuestions || '',
        underexploredAreas: data.underexploredAreas || '',
        novelTopics: data.novelTopics || '',
      });

      setActiveGap(saved);
    } catch (err: any) {
      console.error('Research gap finding error:', err);
      setError(err?.message || 'Error analyzing research gaps.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPdf = (item: ResearchGap) => {
    downloadAsPdf(
      item.topic,
      'Research Gaps & Novel Investigation Opportunities',
      [
        { heading: '1. Limitations Identified in the Literature', body: item.limitations },
        { heading: '2. Unanswered Empirical & Theoretical Questions', body: item.unansweredQuestions },
        { heading: '3. Underexplored Methodologies & Regimes', body: item.underexploredAreas },
        { heading: '4. Suggested Novel Research Topics & Justifications', body: item.novelTopics },
      ],
      `research_gaps_${item.topic.slice(0, 25).toLowerCase().replace(/[^a-z0-9]+/g, '_')}.pdf`
    );
  };

  const handleExportTxt = (item: ResearchGap) => {
    const textContent = `# ${item.topic}
Identified by Aura Research — Your Personal Research Guide

Source Papers: ${item.paperTitles}

## 1. Limitations Identified in the Literature
${item.limitations}

## 2. Unanswered Questions
${item.unansweredQuestions}

## 3. Underexplored Areas
${item.underexploredAreas}

## 4. Suggested Novel Research Topics & Justifications
${item.novelTopics}
`;
    downloadAsText(
      `research_gaps_${item.topic.slice(0, 25).toLowerCase().replace(/[^a-z0-9]+/g, '_')}.txt`,
      textContent
    );
  };

  if (papers.length === 0) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 font-serif">
          No Papers Available to Find Research Gaps
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Upload research papers or load the landmark benchmark papers to analyze unanswered questions, methodological constraints, and novel research topics.
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

  const displayGap = activeGap || gaps[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-serif">
          Research Gap Finder & Novel Topic Discovery
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Uncover limitations, unanswered questions, underexplored areas, and prospective thesis/paper topics. Distinguishes direct literature constraints from potential gaps needing broader verification.
        </p>
      </div>

      {/* Configuration Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Select Base Papers to Investigate ({selectedPaperIds.length} selected)
            </h3>
            <p className="text-xs text-slate-500">
              The AI examines declared boundary conditions, open questions, and empirical blindspots
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
          {papers.map((paper) => {
            const isSelected = selectedPaperIds.includes(paper.id);
            return (
              <div
                key={paper.id}
                onClick={() => toggleSelectPaper(paper.id)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start space-x-3 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/40 text-slate-900'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-600'
                }`}
              >
                <div className="mt-0.5 text-amber-600">
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 fill-amber-600 text-white" />
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

        {/* Optional Focus Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Optional Academic Focus Area or Target Domain:
          </label>
          <input
            type="text"
            placeholder="e.g., Long-sequence memory scaling, edge deployment, or clinical translation safety..."
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Button */}
        <div className="pt-2 flex justify-end">
          <button
            disabled={isLoading || selectedPaperIds.length === 0}
            onClick={handleFindGaps}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scanning for Limitations & Gaps...</span>
              </>
            ) : (
              <>
                <Compass className="w-4 h-4 text-amber-200" />
                <span>Find Research Gaps</span>
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

      {/* RESULTS DISPLAY */}
      {displayGap ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded border border-amber-300/50">
                  Critical Gap Analysis
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(displayGap.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-serif mt-1">
                {displayGap.topic}
              </h2>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                Analyzed from: {displayGap.paperTitles}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExportPdf(displayGap)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={() => handleExportTxt(displayGap)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors"
              >
                <span>TXT</span>
              </button>

              <button
                onClick={() => deleteResearchGap(displayGap.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Scientific Rigor / Disclaimers notice */}
            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Academic Verification Protocol:</span> Each topic is classified as either{' '}
                <span className="font-semibold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded text-[11px]">[Direct Literature Limitation]</span>{' '}
                (unaddressed constraint directly stated in the papers) or{' '}
                <span className="font-semibold text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded text-[11px]">[Potential Gap - Needs Verification]</span>{' '}
                (unexplored in this selection, requires cross-checking against global indexed literature).
              </div>
            </div>

            {/* 1. Limitations Identified */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>1. Limitations Declared in the Literature</span>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed bg-amber-50/20 p-5 rounded-xl border border-amber-100 whitespace-pre-wrap">
                {displayGap.limitations}
              </div>
            </div>

            {/* 2. Unanswered Questions */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900 uppercase tracking-wide">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>2. Unanswered Empirical & Theoretical Questions</span>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed bg-indigo-50/20 p-5 rounded-xl border border-indigo-100 whitespace-pre-wrap">
                {displayGap.unansweredQuestions}
              </div>
            </div>

            {/* 3. Underexplored Areas */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900 uppercase tracking-wide">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>3. Underexplored Methodological & Parameter Spaces</span>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed bg-emerald-50/20 p-5 rounded-xl border border-emerald-100 whitespace-pre-wrap">
                {displayGap.underexploredAreas}
              </div>
            </div>

            {/* 4. Suggested Novel Research Topics */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-2 text-xs font-bold text-purple-900 uppercase tracking-wide">
                <Lightbulb className="w-4 h-4 text-purple-600" />
                <span>4. High-Potential Novel Research Topics & Justifications</span>
              </div>
              <div className="text-sm font-serif text-slate-800 leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-200 whitespace-pre-wrap">
                {displayGap.novelTopics}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          Select base papers above and click &quot;Find Research Gaps&quot; to identify empirical limitations, unanswered questions, and potential novel study avenues.
        </div>
      )}
    </div>
  );
};
