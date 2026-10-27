import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker for pdfjs in browser
if (typeof window !== 'undefined') {
  // Use cdnjs worker matching standard pdfjs-dist
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractedPdfResult {
  fullText: string;
  pages: ExtractedPage[];
  pageCount: number;
  suggestedTitle: string;
  suggestedAuthors?: string;
  estimatedYear?: string;
  suggestedAbstract?: string;
}

/**
 * Extract text from a File or ArrayBuffer page-by-page with [Page X] headers.
 */
export async function extractTextFromPdf(
  fileOrBuffer: File | ArrayBuffer,
  onProgress?: (progress: number) => void
): Promise<ExtractedPdfResult> {
  let arrayBuffer: ArrayBuffer;
  if (fileOrBuffer instanceof File) {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    arrayBuffer = fileOrBuffer;
  }

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pages: ExtractedPage[] = [];
  const fullTextParts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageStrings = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .filter((s: string) => s.trim().length > 0);

    const pageRawText = pageStrings.join(' ');
    // Clean redundant whitespaces
    const cleanedText = pageRawText.replace(/\s+/g, ' ').trim();

    pages.push({
      pageNumber: i,
      text: cleanedText,
    });

    fullTextParts.push(`[Page ${i}]\n${cleanedText}`);

    if (onProgress) {
      onProgress(Math.round((i / numPages) * 100));
    }
  }

  const fullText = fullTextParts.join('\n\n');

  // Attempt heuristic metadata extraction from page 1
  const firstPageText = pages[0]?.text || '';
  const heuristics = extractHeuristicMetadata(firstPageText, fileOrBuffer instanceof File ? fileOrBuffer.name : 'Research Paper');

  return {
    fullText,
    pages,
    pageCount: numPages,
    suggestedTitle: heuristics.title,
    suggestedAuthors: heuristics.authors,
    estimatedYear: heuristics.year,
    suggestedAbstract: heuristics.abstract,
  };
}

function extractHeuristicMetadata(firstPageText: string, fallbackFileName: string) {
  let title = fallbackFileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
  let authors = '';
  let year = '';
  let abstract = '';

  // Check for common year patterns (e.g. 2020-2026)
  const yearMatch = firstPageText.match(/\b(20[12][0-9]|19[89][0-9])\b/);
  if (yearMatch) {
    year = yearMatch[1];
  }

  // Look for abstract block
  const abstractMatch = firstPageText.match(/abstract[:\s—\-]+(.*?)(introduction|1\.|keywords|background)/i);
  if (abstractMatch && abstractMatch[1]) {
    abstract = abstractMatch[1].trim().slice(0, 1000);
  }

  // Look for first 150 chars as tentative title if cleaner than filename
  const firstLines = firstPageText.slice(0, 300).split(/\r?\n|\.\s/);
  if (firstLines.length > 0 && firstLines[0].length > 10 && firstLines[0].length < 160) {
    // Avoid picking up "arXiv" or "Journal of..." as title if possible
    if (!firstLines[0].toLowerCase().startsWith('arxiv') && !firstLines[0].toLowerCase().startsWith('ieee')) {
      title = firstLines[0].trim();
    }
  }

  return { title, authors, year, abstract };
}
