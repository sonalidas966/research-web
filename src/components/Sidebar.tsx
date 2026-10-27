import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  FileSearch,
  Library,
  Compass,
  MessageSquare,
  Sparkles,
  Layers,
  ChevronRight,
  Database,
  X,
} from 'lucide-react';
import type { ActiveTab } from '../types/index.ts';
import { useResearch } from '../context/ResearchContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) => {
  const { papers, loadSamplePaper } = useResearch();
  const { currentUser } = useAuth();

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & recent papers',
    },
    {
      id: 'upload' as ActiveTab,
      label: 'Upload Papers',
      icon: UploadCloud,
      badge: papers.length > 0 ? papers.length : undefined,
      description: 'PDF text extraction',
    },
    {
      id: 'summarize' as ActiveTab,
      label: 'Paper Summarizer',
      icon: FileText,
      description: 'Structured findings & objectives',
    },
    {
      id: 'abstract' as ActiveTab,
      label: 'Abstract Generator',
      icon: FileSearch,
      description: 'Evidence-based academic abstract',
    },
    {
      id: 'literature-review' as ActiveTab,
      label: 'Literature Review',
      icon: Library,
      description: 'Multi-paper synthesis & citations',
    },
    {
      id: 'research-gaps' as ActiveTab,
      label: 'Research Gaps',
      icon: Compass,
      description: 'Novel topics & limitations',
    },
    {
      id: 'chat' as ActiveTab,
      label: 'Research Assistant',
      icon: MessageSquare,
      description: 'Q&A with page references',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header on Mobile */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 lg:hidden">
          <span className="font-serif font-bold text-slate-900">Aura Research</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="truncate">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal truncate">
                      {item.description}
                    </div>
                  </div>
                </div>

                {item.badge !== undefined ? (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-blue-200/80 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight
                    className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isActive ? 'text-blue-500 opacity-100' : 'text-slate-400'
                    }`}
                  />
                )}
              </button>
            );
          })}

          {/* Quick Sample Loader if no papers */}
          {papers.length === 0 && (
            <div className="pt-4 px-2">
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-3 text-center">
                <Sparkles className="w-4 h-4 text-blue-600 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-800">
                  Want to explore fast?
                </p>
                <p className="text-[11px] text-slate-500 mb-2">
                  Load a landmark academic paper in 1 click.
                </p>
                <button
                  onClick={async () => {
                    await loadSamplePaper(0);
                    setActiveTab('summarize');
                    onClose();
                  }}
                  className="w-full text-xs font-medium py-1.5 px-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg transition-colors shadow-2xs"
                >
                  Load Attention Paper
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Status Panel */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 px-2 py-1">
            <Database className="w-3.5 h-3.5 text-blue-500" />
            <span>
              {currentUser ? 'Firestore Cloud Storage Active' : 'Local Sandbox Mode'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 px-2">
            Isolated by user account
          </div>
        </div>
      </aside>
    </>
  );
};
