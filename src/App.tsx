/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { ResearchProvider } from './context/ResearchContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { UploadView } from './components/UploadView.tsx';
import { SummarizerView } from './components/SummarizerView.tsx';
import { LiteratureReviewView } from './components/LiteratureReviewView.tsx';
import { ResearchGapsView } from './components/ResearchGapsView.tsx';
import { AssistantChatView } from './components/AssistantChatView.tsx';
import type { ActiveTab, Paper } from './types/index.ts';

function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPaperForAction, setSelectedPaperForAction] = useState<string | undefined>(undefined);

  const handleSelectPaperForAction = (paper: Paper, action: 'summarize' | 'abstract' | 'chat') => {
    setSelectedPaperForAction(paper.id);
    setActiveTab(action);
  };

  const handlePaperUploaded = (paper: Paper) => {
    setSelectedPaperForAction(paper.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onSelectPaperForAction={handleSelectPaperForAction}
            />
          )}

          {activeTab === 'upload' && (
            <UploadView
              setActiveTab={setActiveTab}
              onPaperUploaded={handlePaperUploaded}
            />
          )}

          {activeTab === 'summarize' && (
            <SummarizerView
              initialPaperId={selectedPaperForAction}
              initialMode="summary"
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'abstract' && (
            <SummarizerView
              initialPaperId={selectedPaperForAction}
              initialMode="abstract"
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'literature-review' && (
            <LiteratureReviewView setActiveTab={setActiveTab} />
          )}

          {activeTab === 'research-gaps' && (
            <ResearchGapsView setActiveTab={setActiveTab} />
          )}

          {activeTab === 'chat' && (
            <AssistantChatView
              initialPaperId={selectedPaperForAction}
              setActiveTab={setActiveTab}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ResearchProvider>
        <MainApp />
      </ResearchProvider>
    </AuthProvider>
  );
}
