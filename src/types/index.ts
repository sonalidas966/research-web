export interface UserProfile {
  id: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Paper {
  id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface PaperSummary {
  id: string;
  userId: string;
  paperId: string;
  paperTitle: string;
  objectives: string;
  methodology: string;
  keyFindings: string;
  limitations: string;
  conclusions: string;
  fullSummaryText: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaperAbstract {
  id: string;
  userId: string;
  paperId: string;
  paperTitle: string;
  generatedAbstract: string;
  keywords: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LiteratureReview {
  id: string;
  userId: string;
  paperIds: string[];
  paperTitles: string;
  reviewTitle: string;
  synthesis: string;
  commonThemes: string;
  conflictingFindings: string;
  structuredReview: string;
  citations: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ResearchGap {
  id: string;
  userId: string;
  paperIds: string[];
  paperTitles: string;
  topic: string;
  limitations: string;
  unansweredQuestions: string;
  underexploredAreas: string;
  novelTopics: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: string[];
}

export interface ChatSession {
  id: string;
  userId: string;
  paperId: string;
  paperTitle: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'upload'
  | 'summarize'
  | 'abstract'
  | 'literature-review'
  | 'research-gaps'
  | 'chat';
