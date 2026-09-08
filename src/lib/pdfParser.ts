import * as pdfjsLib from 'pdfjs-dist';
import { ParsedDocument } from '../types/fact';

// Set up PDF.js worker using cdn fallback or local bundle
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export async function parsePdfFile(file: File): Promise<ParsedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;
    
    const pages: { pageNumber: number; text: string }[] = [];
    
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
        
      pages.push({
        pageNumber: pageNum,
        text: pageText
      });
    }
    
    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    
    return {
      id: documentId,
      name: file.name,
      uploadedAt: new Date().toISOString().split('T')[0],
      pageCount: pdfDocument.numPages,
      pages,
      extractedFacts: [],
      fileSize: `${(file.size / 1024).toFixed(1)} KB`
    };
  } catch (error) {
    console.warn('PDF.js parsing error, falling back to text reader:', error);
    // Plain text fallback if PDF is non-standard
    const text = await file.text();
    return {
      id: `doc-${Date.now()}`,
      name: file.name,
      uploadedAt: new Date().toISOString().split('T')[0],
      pageCount: 1,
      pages: [{ pageNumber: 1, text: text || 'PDF Content extracted.' }],
      extractedFacts: [],
      fileSize: `${(file.size / 1024).toFixed(1)} KB`
    };
  }
}
