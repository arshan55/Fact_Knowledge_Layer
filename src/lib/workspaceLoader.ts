import { parsePdfFile } from './pdfParser';
import { extractFactsFromDocument } from './factExtractor';
import { reconcileFacts } from './reconciler';
import { Workspace } from '../types/fact';

export interface WorkspaceDataset {
  id: string;
  name: string;
  emoji: string;
  pdfs: { url: string; name: string }[];
}

export const DATASET_CONFIGS: WorkspaceDataset[] = [
  {
    id: 'ws-delhivery',
    name: 'Delhivery · Logistics',
    emoji: '🚚',
    pdfs: [
      { url: '/datasets/delhivery/01-delhivery-prospectus-2022-excerpt.pdf',     name: 'Delhivery Prospectus 2022' },
      { url: '/datasets/delhivery/02-delhivery-annual-report-fy24-excerpt.pdf',  name: 'Delhivery Annual Report FY24' },
      { url: '/datasets/delhivery/03-delhivery-q4-fy24-earnings-presentation.pdf', name: 'Delhivery Q4 FY24 Earnings' },
    ]
  },
  {
    id: 'ws-india-macro',
    name: 'India Macroeconomy',
    emoji: '🇮🇳',
    pdfs: [
      { url: '/datasets/india-macroeconomy/01-india-economic-survey-2024-25-excerpt.pdf', name: 'Economic Survey 2024-25' },
      { url: '/datasets/india-macroeconomy/02-rbi-annual-report-2024-25-excerpt.pdf',     name: 'RBI Annual Report 2024-25' },
      { url: '/datasets/india-macroeconomy/03-imf-india-2025-article-iv-excerpt.pdf',     name: 'IMF India Article IV 2025' },
    ]
  }
];

/**
 * Fetches a PDF from a public URL and returns it as a File object
 */
async function fetchPdfAsFile(url: string, name: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const blob = await res.blob();
  return new File([blob], `${name}.pdf`, { type: 'application/pdf' });
}

/**
 * Loads a single workspace dataset — parses all PDFs, extracts facts, reconciles
 * Reports progress via the onProgress callback
 */
export async function loadWorkspaceDataset(
  config: WorkspaceDataset,
  apiKey: string,
  apiProvider: 'openai' | 'gemini',
  onProgress?: (msg: string) => void
): Promise<Workspace> {
  const documents = [];
  const allFacts = [];

  for (const pdfConfig of config.pdfs) {
    onProgress?.(`Parsing ${pdfConfig.name}…`);
    const file = await fetchPdfAsFile(pdfConfig.url, pdfConfig.name);
    const doc = await parsePdfFile(file);
    // Override name with friendly name
    doc.name = pdfConfig.name;

    onProgress?.(`Extracting facts from ${pdfConfig.name}…`);
    const facts = await extractFactsFromDocument(doc, apiKey, apiProvider);
    doc.extractedFacts = facts;

    documents.push(doc);
    allFacts.push(...facts);
  }

  onProgress?.(`Reconciling ${allFacts.length} facts across ${documents.length} documents…`);
  const relationships = reconcileFacts(allFacts);

  return {
    id: config.id,
    name: config.name,
    emoji: config.emoji,
    createdAt: new Date().toISOString().split('T')[0],
    documents,
    facts: allFacts,
    relationships
  };
}
