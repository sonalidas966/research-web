import { Router, Request, Response } from 'express';
import {
  summarizePaper,
  generateAbstract,
  synthesizeLiteratureReview,
  findResearchGaps,
  chatWithResearchAssistant,
} from './gemini.ts';

export const apiRouter = Router();

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Aura Research API' });
});

apiRouter.post('/summarize', async (req: Request, res: Response) => {
  try {
    const { title, authors, year, text } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Paper text is required for summarization.' });
      return;
    }
    const result = await summarizePaper({
      title: title || 'Untitled Research Paper',
      authors,
      year,
      text,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/summarize:', error);
    res.status(500).json({
      error: error?.message || 'Failed to summarize paper. Please check your Gemini API key and try again.',
    });
  }
});

apiRouter.post('/generate-abstract', async (req: Request, res: Response) => {
  try {
    const { title, text } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Paper text is required to generate an abstract.' });
      return;
    }
    const result = await generateAbstract({
      title: title || 'Untitled Research Paper',
      text,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/generate-abstract:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate abstract. Please try again.',
    });
  }
});

apiRouter.post('/literature-review', async (req: Request, res: Response) => {
  try {
    const { papers, topic } = req.body;
    if (!Array.isArray(papers) || papers.length === 0) {
      res.status(400).json({ error: 'At least one paper is required to synthesize a literature review.' });
      return;
    }
    const result = await synthesizeLiteratureReview(papers, topic);
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/literature-review:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate literature review. Please try again.',
    });
  }
});

apiRouter.post('/research-gaps', async (req: Request, res: Response) => {
  try {
    const { papers, focusArea } = req.body;
    if (!Array.isArray(papers) || papers.length === 0) {
      res.status(400).json({ error: 'At least one paper is required to identify research gaps.' });
      return;
    }
    const result = await findResearchGaps(papers, focusArea);
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/research-gaps:', error);
    res.status(500).json({
      error: error?.message || 'Failed to analyze research gaps. Please try again.',
    });
  }
});

apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { title, text, messages } = req.body;
    if (!text || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Paper text and chat messages are required.' });
      return;
    }
    const result = await chatWithResearchAssistant(
      { title: title || 'Uploaded Paper', text },
      messages
    );
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate assistant response.',
    });
  }
});
