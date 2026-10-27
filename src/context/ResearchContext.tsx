import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import { useAuth } from './AuthContext.tsx';
import type {
  Paper,
  PaperSummary,
  PaperAbstract,
  LiteratureReview,
  ResearchGap,
  ChatSession,
} from '../types/index.ts';
import { SAMPLE_PAPERS } from '../data/samplePapers.ts';

interface ResearchContextType {
  papers: Paper[];
  summaries: PaperSummary[];
  abstracts: PaperAbstract[];
  reviews: LiteratureReview[];
  gaps: ResearchGap[];
  chatSessions: ChatSession[];
  isLoadingData: boolean;
  addPaper: (paperData: {
    title: string;
    authors?: string;
    year?: string;
    abstract?: string;
    fileName: string;
    fileSize: number;
    pageCount: number;
    storageUrl?: string;
    extractedText: string;
    pageTexts?: { pageNumber: number; text: string }[];
  }) => Promise<Paper>;
  deletePaper: (paperId: string) => Promise<void>;
  saveSummary: (summaryData: {
    paperId: string;
    paperTitle: string;
    objectives: string;
    methodology: string;
    keyFindings: string;
    limitations: string;
    conclusions: string;
    fullSummaryText: string;
  }) => Promise<PaperSummary>;
  deleteSummary: (summaryId: string) => Promise<void>;
  saveAbstract: (abstractData: {
    paperId: string;
    paperTitle: string;
    generatedAbstract: string;
    keywords: string;
  }) => Promise<PaperAbstract>;
  deleteAbstract: (abstractId: string) => Promise<void>;
  saveLiteratureReview: (reviewData: {
    paperIds: string[];
    paperTitles: string;
    reviewTitle: string;
    synthesis: string;
    commonThemes: string;
    conflictingFindings: string;
    structuredReview: string;
    citations: string;
  }) => Promise<LiteratureReview>;
  deleteLiteratureReview: (reviewId: string) => Promise<void>;
  saveResearchGap: (gapData: {
    paperIds: string[];
    paperTitles: string;
    topic: string;
    limitations: string;
    unansweredQuestions: string;
    underexploredAreas: string;
    novelTopics: string;
  }) => Promise<ResearchGap>;
  deleteResearchGap: (gapId: string) => Promise<void>;
  saveChatSession: (sessionData: {
    id?: string;
    paperId: string;
    paperTitle: string;
    messages: any[];
  }) => Promise<ChatSession>;
  loadSamplePaper: (index: number) => Promise<Paper>;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

export const ResearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [summaries, setSummaries] = useState<PaperSummary[]>([]);
  const [abstracts, setAbstracts] = useState<PaperAbstract[]>([]);
  const [reviews, setReviews] = useState<LiteratureReview[]>([]);
  const [gaps, setGaps] = useState<ResearchGap[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Sync with Firestore when user is authenticated
  useEffect(() => {
    if (!currentUser) {
      // Clear data or keep local mock session
      setPapers([]);
      setSummaries([]);
      setAbstracts([]);
      setReviews([]);
      setGaps([]);
      setChatSessions([]);
      return;
    }

    setIsLoadingData(true);
    const userId = currentUser.uid;

    // 1. Papers
    const papersQuery = query(collection(db, 'papers'), where('userId', '==', userId));
    const unsubPapers = onSnapshot(
      papersQuery,
      (snap) => {
        const list: Paper[] = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Paper, 'id'>),
        }));
        // Sort descending by createdAt
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPapers(list);
        setIsLoadingData(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'papers');
      }
    );

    // 2. Summaries
    const summariesQuery = query(collection(db, 'summaries'), where('userId', '==', userId));
    const unsubSummaries = onSnapshot(
      summariesQuery,
      (snap) => {
        const list: PaperSummary[] = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<PaperSummary, 'id'>),
        }));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSummaries(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'summaries');
      }
    );

    // 3. Abstracts
    const abstractsQuery = query(collection(db, 'abstracts'), where('userId', '==', userId));
    const unsubAbstracts = onSnapshot(
      abstractsQuery,
      (snap) => {
        const list: PaperAbstract[] = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<PaperAbstract, 'id'>),
        }));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAbstracts(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'abstracts');
      }
    );

    // 4. Literature Reviews
    const reviewsQuery = query(collection(db, 'literatureReviews'), where('userId', '==', userId));
    const unsubReviews = onSnapshot(
      reviewsQuery,
      (snap) => {
        const list: LiteratureReview[] = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<LiteratureReview, 'id'>),
        }));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReviews(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'literatureReviews');
      }
    );

    // 5. Research Gaps
    const gapsQuery = query(collection(db, 'researchGaps'), where('userId', '==', userId));
    const unsubGaps = onSnapshot(
      gapsQuery,
      (snap) => {
        const list: ResearchGap[] = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ResearchGap, 'id'>),
        }));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setGaps(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'researchGaps');
      }
    );

    // 6. Chat Sessions
    const chatQuery = query(collection(db, 'chatSessions'), where('userId', '==', userId));
    const unsubChat = onSnapshot(
      chatQuery,
      (snap) => {
        const list: ChatSession[] = snap.docs.map((docSnap) => {
          const data = docSnap.data();
          let parsedMessages: any[] = [];
          try {
            parsedMessages = data.messagesJson ? JSON.parse(data.messagesJson) : [];
          } catch {
            parsedMessages = [];
          }
          return {
            id: docSnap.id,
            userId: data.userId,
            paperId: data.paperId || '',
            paperTitle: data.paperTitle || '',
            messages: parsedMessages,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setChatSessions(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'chatSessions');
      }
    );

    return () => {
      unsubPapers();
      unsubSummaries();
      unsubAbstracts();
      unsubReviews();
      unsubGaps();
      unsubChat();
    };
  }, [currentUser]);

  const addPaper = async (paperData: {
    title: string;
    authors?: string;
    year?: string;
    abstract?: string;
    fileName: string;
    fileSize: number;
    pageCount: number;
    storageUrl?: string;
    extractedText: string;
    pageTexts?: { pageNumber: number; text: string }[];
  }): Promise<Paper> => {
    const id = `paper_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const userId = currentUser ? currentUser.uid : 'guest_user';

    const newPaper: Paper = {
      id,
      userId,
      title: paperData.title.slice(0, 500),
      authors: (paperData.authors || '').slice(0, 500),
      year: (paperData.year || '').slice(0, 10),
      abstract: (paperData.abstract || '').slice(0, 10000),
      fileName: paperData.fileName.slice(0, 255),
      fileSize: paperData.fileSize,
      pageCount: paperData.pageCount,
      storageUrl: paperData.storageUrl || '',
      extractedText: paperData.extractedText.slice(0, 200000),
      pageTexts: paperData.pageTexts,
      createdAt: now,
      updatedAt: now,
    };

    if (currentUser) {
      try {
        await setDoc(doc(db, 'papers', id), {
          id: newPaper.id,
          userId: newPaper.userId,
          title: newPaper.title,
          authors: newPaper.authors,
          year: newPaper.year,
          abstract: newPaper.abstract,
          fileName: newPaper.fileName,
          fileSize: newPaper.fileSize,
          pageCount: newPaper.pageCount,
          storageUrl: newPaper.storageUrl,
          extractedText: newPaper.extractedText,
          createdAt: newPaper.createdAt,
          updatedAt: newPaper.updatedAt,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `papers/${id}`);
      }
    } else {
      setPapers((prev) => [newPaper, ...prev]);
    }

    return newPaper;
  };

  const deletePaper = async (paperId: string) => {
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'papers', paperId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `papers/${paperId}`);
      }
    } else {
      setPapers((prev) => prev.filter((p) => p.id !== paperId));
    }
  };

  const saveSummary = async (summaryData: {
    paperId: string;
    paperTitle: string;
    objectives: string;
    methodology: string;
    keyFindings: string;
    limitations: string;
    conclusions: string;
    fullSummaryText: string;
  }): Promise<PaperSummary> => {
    const id = `summary_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const userId = currentUser ? currentUser.uid : 'guest_user';

    const newSummary: PaperSummary = {
      id,
      userId,
      paperId: summaryData.paperId,
      paperTitle: summaryData.paperTitle.slice(0, 500),
      objectives: summaryData.objectives.slice(0, 10000),
      methodology: summaryData.methodology.slice(0, 10000),
      keyFindings: summaryData.keyFindings.slice(0, 15000),
      limitations: summaryData.limitations.slice(0, 10000),
      conclusions: summaryData.conclusions.slice(0, 10000),
      fullSummaryText: summaryData.fullSummaryText.slice(0, 50000),
      createdAt: now,
      updatedAt: now,
    };

    if (currentUser) {
      try {
        await setDoc(doc(db, 'summaries', id), newSummary);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `summaries/${id}`);
      }
    } else {
      setSummaries((prev) => [newSummary, ...prev]);
    }

    return newSummary;
  };

  const deleteSummary = async (summaryId: string) => {
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'summaries', summaryId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `summaries/${summaryId}`);
      }
    } else {
      setSummaries((prev) => prev.filter((s) => s.id !== summaryId));
    }
  };

  const saveAbstract = async (abstractData: {
    paperId: string;
    paperTitle: string;
    generatedAbstract: string;
    keywords: string;
  }): Promise<PaperAbstract> => {
    const id = `abstract_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const userId = currentUser ? currentUser.uid : 'guest_user';

    const newAbstract: PaperAbstract = {
      id,
      userId,
      paperId: abstractData.paperId,
      paperTitle: abstractData.paperTitle.slice(0, 500),
      generatedAbstract: abstractData.generatedAbstract.slice(0, 10000),
      keywords: abstractData.keywords.slice(0, 1000),
      createdAt: now,
      updatedAt: now,
    };

    if (currentUser) {
      try {
        await setDoc(doc(db, 'abstracts', id), newAbstract);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `abstracts/${id}`);
      }
    } else {
      setAbstracts((prev) => [newAbstract, ...prev]);
    }

    return newAbstract;
  };

  const deleteAbstract = async (abstractId: string) => {
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'abstracts', abstractId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `abstracts/${abstractId}`);
      }
    } else {
      setAbstracts((prev) => prev.filter((a) => a.id !== abstractId));
    }
  };

  const saveLiteratureReview = async (reviewData: {
    paperIds: string[];
    paperTitles: string;
    reviewTitle: string;
    synthesis: string;
    commonThemes: string;
    conflictingFindings: string;
    structuredReview: string;
    citations: string;
  }): Promise<LiteratureReview> => {
    const id = `review_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const userId = currentUser ? currentUser.uid : 'guest_user';

    const newReview: LiteratureReview = {
      id,
      userId,
      paperIds: reviewData.paperIds,
      paperTitles: reviewData.paperTitles.slice(0, 5000),
      reviewTitle: reviewData.reviewTitle.slice(0, 500),
      synthesis: reviewData.synthesis.slice(0, 50000),
      commonThemes: reviewData.commonThemes.slice(0, 20000),
      conflictingFindings: reviewData.conflictingFindings.slice(0, 20000),
      structuredReview: reviewData.structuredReview.slice(0, 50000),
      citations: reviewData.citations.slice(0, 20000),
      createdAt: now,
      updatedAt: now,
    };

    if (currentUser) {
      try {
        await setDoc(doc(db, 'literatureReviews', id), newReview);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `literatureReviews/${id}`);
      }
    } else {
      setReviews((prev) => [newReview, ...prev]);
    }

    return newReview;
  };

  const deleteLiteratureReview = async (reviewId: string) => {
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'literatureReviews', reviewId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `literatureReviews/${reviewId}`);
      }
    } else {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    }
  };

  const saveResearchGap = async (gapData: {
    paperIds: string[];
    paperTitles: string;
    topic: string;
    limitations: string;
    unansweredQuestions: string;
    underexploredAreas: string;
    novelTopics: string;
  }): Promise<ResearchGap> => {
    const id = `gap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const userId = currentUser ? currentUser.uid : 'guest_user';

    const newGap: ResearchGap = {
      id,
      userId,
      paperIds: gapData.paperIds,
      paperTitles: gapData.paperTitles.slice(0, 5000),
      topic: gapData.topic.slice(0, 500),
      limitations: gapData.limitations.slice(0, 20000),
      unansweredQuestions: gapData.unansweredQuestions.slice(0, 20000),
      underexploredAreas: gapData.underexploredAreas.slice(0, 20000),
      novelTopics: gapData.novelTopics.slice(0, 30000),
      createdAt: now,
      updatedAt: now,
    };

    if (currentUser) {
      try {
        await setDoc(doc(db, 'researchGaps', id), newGap);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `researchGaps/${id}`);
      }
    } else {
      setGaps((prev) => [newGap, ...prev]);
    }

    return newGap;
  };

  const deleteResearchGap = async (gapId: string) => {
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'researchGaps', gapId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `researchGaps/${gapId}`);
      }
    } else {
      setGaps((prev) => prev.filter((g) => g.id !== gapId));
    }
  };

  const saveChatSession = async (sessionData: {
    id?: string;
    paperId: string;
    paperTitle: string;
    messages: any[];
  }): Promise<ChatSession> => {
    const id = sessionData.id || `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const userId = currentUser ? currentUser.uid : 'guest_user';

    const session: ChatSession = {
      id,
      userId,
      paperId: sessionData.paperId,
      paperTitle: sessionData.paperTitle,
      messages: sessionData.messages,
      createdAt: now,
      updatedAt: now,
    };

    if (currentUser) {
      try {
        await setDoc(doc(db, 'chatSessions', id), {
          id: session.id,
          userId: session.userId,
          paperId: session.paperId,
          paperTitle: session.paperTitle,
          messagesJson: JSON.stringify(session.messages),
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `chatSessions/${id}`);
      }
    } else {
      setChatSessions((prev) => [session, ...prev.filter((c) => c.id !== id)]);
    }

    return session;
  };

  const loadSamplePaper = async (index: number): Promise<Paper> => {
    const sample = SAMPLE_PAPERS[index % SAMPLE_PAPERS.length];
    return await addPaper({
      title: sample.title,
      authors: sample.authors,
      year: sample.year,
      abstract: sample.abstract,
      fileName: `${sample.title.slice(0, 30).toLowerCase().replace(/[^a-z0-9]+/g, '_')}.pdf`,
      fileSize: 482000,
      pageCount: sample.pageCount,
      extractedText: sample.text,
      pageTexts: [
        { pageNumber: 1, text: sample.abstract },
        { pageNumber: 2, text: sample.text.slice(0, 1500) },
      ],
    });
  };

  return (
    <ResearchContext.Provider
      value={{
        papers,
        summaries,
        abstracts,
        reviews,
        gaps,
        chatSessions,
        isLoadingData,
        addPaper,
        deletePaper,
        saveSummary,
        deleteSummary,
        saveAbstract,
        deleteAbstract,
        saveLiteratureReview,
        deleteLiteratureReview,
        saveResearchGap,
        deleteResearchGap,
        saveChatSession,
        loadSamplePaper,
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
};

export function useResearch() {
  const context = useContext(ResearchContext);
  if (!context) {
    throw new Error('useResearch must be used within a ResearchProvider');
  }
  return context;
}
