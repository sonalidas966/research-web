import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const PRIMARY_MODEL = 'gemini-3.1-flash-lite';
export const SECONDARY_MODEL = 'gemini-3.8-flash';
export const TERTIARY_MODEL = 'gemini-flash-latest';

export interface PaperInput {
  id?: string;
  title: string;
  authors?: string;
  year?: string;
  text: string;
}

export function parseJsonSafe(text: string) {
  let cleaned = (text || '').trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
  }
  return JSON.parse(cleaned.trim() || '{}');
}

/**
 * Robust wrapper that retries on 503 / high demand across valid models
 */
async function generateContentSafe(params: {
  contents: string;
  responseMimeType?: string;
  temperature?: number;
}) {
  const modelsToTry = [PRIMARY_MODEL, SECONDARY_MODEL, TERTIARY_MODEL];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: {
            responseMimeType: params.responseMimeType,
            temperature: params.temperature ?? 0.2,
          },
        });
        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
  }

  throw lastError || new Error('AI service is temporarily busy. Please try again.');
}

/**
 * Summarize a research paper with strict academic guidelines:
 * - Objectives
 * - Methodology
 * - Key Findings
 * - Limitations
 * - Conclusions
 * - No fabrication, explicitly noting if evidence is limited.
 */
export async function summarizePaper(paper: {
  title: string;
  authors?: string;
  year?: string;
  text: string;
}) {
  const prompt = `You are an expert academic peer reviewer and research scientist.
Analyze the following research paper and generate a rigorous, objective academic summary.

CRITICAL RULES:
1. Do NOT fabricate research findings, experimental results, sample sizes, or citations.
2. Base all statements strictly on the provided paper text.
3. If the paper text does not contain enough information for a specific section (e.g. detailed methodology or limitations), explicitly state: "Not explicitly stated in the provided text."

Paper Title: "${paper.title}"
${paper.authors ? `Authors: ${paper.authors}` : ''}
${paper.year ? `Year: ${paper.year}` : ''}

Paper Content:
"""
${paper.text.slice(0, 75000)}
"""

Please return your response formatted in valid JSON conforming to this exact structure:
{
  "objectives": "Clear summary of the core research questions, hypotheses, or problem statement addressed.",
  "methodology": "Overview of research design, datasets, algorithms, sample sizes, experimental setup, or analytical frameworks used.",
  "keyFindings": "Specific empirical results, performance metrics, discoveries, or key evidence produced.",
  "limitations": "Limitations declared by the authors or methodological constraints observed in the study.",
  "conclusions": "Main conclusions, academic implications, and significance to the field.",
  "fullSummaryText": "A comprehensive 3 to 4 paragraph synthesis summarizing the paper from start to finish."
}
Only output valid JSON, nothing else.`;

  const rawJson = await generateContentSafe({
    contents: prompt,
    responseMimeType: 'application/json',
    temperature: 0.2,
  });

  return parseJsonSafe(rawJson);
}

/**
 * Generate an academic abstract (150-250 words) from the paper content,
 * structured as Background, Methods, Results, and Significance, plus 4-6 keywords.
 */
export async function generateAbstract(paper: {
  title: string;
  text: string;
}) {
  const prompt = `You are a scholarly scientific editor.
Generate a publication-grade academic abstract for this paper based EXCLUSIVELY on its actual content.
Do NOT invent results, methods, or implications not present in the text.

Paper Title: "${paper.title}"

Paper Content:
"""
${paper.text.slice(0, 75000)}
"""

Please return your response formatted in valid JSON conforming to this exact structure:
{
  "generatedAbstract": "A formal, coherent academic abstract (150-250 words) structured logically covering background, objective, methodology, core findings, and significance.",
  "keywords": "A comma-separated list of 4 to 6 relevant academic keywords."
}
Only output valid JSON, nothing else.`;

  const rawJson = await generateContentSafe({
    contents: prompt,
    responseMimeType: 'application/json',
    temperature: 0.2,
  });

  return parseJsonSafe(rawJson);
}

/**
 * Multi-paper Literature Review synthesis
 */
export async function synthesizeLiteratureReview(papers: PaperInput[], customTopic?: string) {
  const papersContext = papers.map((p, idx) => `
[Paper ${idx + 1}]
Title: ${p.title}
${p.authors ? `Authors: ${p.authors}` : 'Authors: Unspecified'}
${p.year ? `Year: ${p.year}` : ''}
Text Content:
${p.text.slice(0, 25000)}
----------------------------------
`).join('\n');

  const prompt = `You are a distinguished research professor and systematic literature reviewer.
Conduct a rigorous literature review synthesizing the following ${papers.length} research paper(s)${customTopic ? ` focusing on the topic: "${customTopic}"` : ''}.

CRITICAL REQUIREMENTS:
1. Synthesize across the papers rather than just summarizing them one by one.
2. Identify common themes and consensus where papers agree.
3. Highlight conflicting results, differing methodologies, or contradictory conclusions.
4. Use clear in-text citations linking claims to the source papers, e.g., "[Paper 1: Title / Author, Year]".
5. Do NOT fabricate findings or cross-citations not present in the source texts.
6. Clearly denote when evidence is inconclusive or where the selected papers do not provide enough coverage.

Source Papers:
${papersContext}

Please return your response formatted in valid JSON conforming to this exact structure:
{
  "reviewTitle": "Comprehensive Literature Review Title",
  "synthesis": "High-level thematic overview synthesizing the state of research across the reviewed literature (3-5 paragraphs).",
  "commonThemes": "Detailed breakdown of common themes, shared hypotheses, and consensus observed across papers.",
  "conflictingFindings": "Direct comparison of conflicting results, methodological disparities, or opposing viewpoints.",
  "structuredReview": "A detailed multi-section literature review organized by themes or methodological approaches with citations.",
  "citations": "A structured list of cited source papers with title, author, year, and key contribution."
}
Only output valid JSON, nothing else.`;

  const rawJson = await generateContentSafe({
    contents: prompt,
    responseMimeType: 'application/json',
    temperature: 0.3,
  });

  return parseJsonSafe(rawJson);
}

/**
 * Research Gap Finder
 * Distinguishes potential research gaps from verified novelty,
 * explains why each suggested topic is worth investigating.
 */
export async function findResearchGaps(papers: PaperInput[], focusArea?: string) {
  const papersContext = papers.map((p, idx) => `
[Paper ${idx + 1}]
Title: ${p.title}
${p.authors ? `Authors: ${p.authors}` : ''}
Text Sample:
${p.text.slice(0, 25000)}
----------------------------------
`).join('\n');

  const prompt = `You are an academic advisor and scientific research strategist.
Analyze the following paper(s) to discover genuine research gaps, unaddressed limitations, and future research directions${focusArea ? ` with specific focus on: "${focusArea}"` : ''}.

CRITICAL REQUIREMENTS:
1. Identify limitations and boundary conditions acknowledged or evident in the literature.
2. Identify unanswered questions left unresolved by the authors.
3. Highlight underexplored areas (e.g. neglected demographics, untested algorithmic regimes, alternative theoretical frameworks, lack of longitudinal data).
4. Propose novel research topics and explain WHY each topic is worth investigating (practical impact, theoretical significance, methodology advancement).
5. CRITICAL: Distinguish potential research gaps from verified novelty. For each suggested topic, explicitly categorize it as either:
   - "[Direct Literature Limitation]" (directly cited or evident unaddressed constraint in the provided papers)
   - "[Potential Gap - Needs Broader Verification]" (appears unexplored within this collection of papers, but may have external literature that needs validation)
6. Do NOT fabricate claims of absolute global novelty. Always maintain scientific humility.

Source Papers:
${papersContext}

Please return your response formatted in valid JSON conforming to this exact structure:
{
  "topic": "${focusArea ? focusArea : 'Identified Research Gaps & Novel Opportunities'}",
  "limitations": "Synthesis of primary limitations and constraints across the reviewed works.",
  "unansweredQuestions": "Specific empirical and theoretical questions left open by these studies.",
  "underexploredAreas": "Specific experimental setups, datasets, parameter ranges, or contexts that remain underexplored.",
  "novelTopics": "A rich markdown or structured list of 4-6 high-potential research topics. For each topic include: Title, Classification ([Direct Literature Limitation] or [Potential Gap - Needs Broader Verification]), Rationale / Why It Is Worth Investigating, Proposed Methodology, and Expected Academic Contribution."
}
Only output valid JSON, nothing else.`;

  const rawJson = await generateContentSafe({
    contents: prompt,
    responseMimeType: 'application/json',
    temperature: 0.3,
  });

  return parseJsonSafe(rawJson);
}

/**
 * Research Assistant Chat
 * Answers questions strictly grounded in the paper text with page references where possible.
 */
export async function chatWithResearchAssistant(paper: {
  title: string;
  text: string;
}, messages: { role: 'user' | 'assistant'; content: string }[]) {
  const lastUserMessage = messages[messages.length - 1]?.content || '';
  const conversationHistory = messages.slice(0, -1).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

  const prompt = `You are Aura Research Assistant, a rigorous academic research companion.
You are assisting a researcher who is analyzing the paper: "${paper.title}".

CRITICAL INSTRUCTIONS:
1. Base your answer EXCLUSIVELY on the provided paper text below.
2. When referencing facts, findings, methodology, or statements from the paper, cite the page number or section if mentioned in the text (e.g., [Page 4] or [Section 3.2]).
3. If the paper does NOT provide sufficient evidence or does not mention the topic of the user's question, you MUST explicitly state:
   "The uploaded paper does not provide sufficient evidence to answer this question." Do NOT speculate, hallucinate, or bring in outside unsubstantiated claims.
4. Keep answers clear, academic, structured, and helpful.

PAPER TEXT (WITH PAGE LABELS):
"""
${paper.text.slice(0, 85000)}
"""

CONVERSATION HISTORY:
${conversationHistory || 'None'}

USER'S CURRENT QUESTION:
"${lastUserMessage}"

Please provide an evidence-based response with citations/page references where present.`;

  const replyText = await generateContentSafe({
    contents: prompt,
    temperature: 0.2,
  });

  return {
    reply: replyText || 'Unable to generate response. Please try again.',
  };
}
