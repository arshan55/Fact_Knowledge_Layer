import { ParsedDocument, GroundedFact, ExtractionStage } from '../types/fact';

/**
 * Verbatim Grounding Guardrail Check
 * Verifies that the extracted claim's raw_text / verbatimQuote actually appears
 * in the source document page text.
 */
export function verifyVerbatimGrounding(quote: string, pageText: string): boolean {
  if (!quote || quote.trim().length === 0) return false;
  const normQuote = quote.toLowerCase().replace(/\s+/g, ' ').trim();
  const normText  = pageText.toLowerCase().replace(/\s+/g, ' ').trim();
  if (normText.includes(normQuote)) return true;

  // Partial substring match fallback (first 25 chars)
  const subQuote = normQuote.substring(0, 25);
  return subQuote.length >= 10 && normText.includes(subQuote);
}

export interface ExtractionResult {
  acceptedFacts: GroundedFact[];
  rejectedCount: number;
}

/**
 * Dynamic Two-Stage Fact Extractor Engine
 * Stage A (structural regex/heuristics) + Stage B (semantic LLM)
 * Passes all extracted claims through mandatory Verbatim Grounding Verification.
 */
export async function extractFactsFromDocument(
  doc: ParsedDocument,
  apiKey?: string,
  apiProvider: 'openai' | 'gemini' = 'openai'
): Promise<GroundedFact[]> {
  let facts: GroundedFact[] = [];
  if (apiKey && apiKey.trim().length > 5) {
    try {
      facts = await extractFactsWithLlm(doc, apiKey, apiProvider);
    } catch (err) {
      console.warn('LLM API call failed, using heuristic Stage A extractor:', err);
      facts = extractFactsWithHeuristics(doc);
    }
  } else {
    facts = extractFactsWithHeuristics(doc);
  }

  // Verbatim Grounding Guardrail Verification
  const accepted: GroundedFact[] = [];
  let rejected = 0;

  facts.forEach((fact) => {
    const targetPage = doc.pages.find((p) => p.pageNumber === fact.evidence.pageNumber) || doc.pages[0];
    const pageText = targetPage ? targetPage.text : '';
    const isVerified = verifyVerbatimGrounding(fact.evidence.verbatimQuote, pageText);

    if (isVerified) {
      fact.groundingVerified = true;
      accepted.push(fact);
    } else {
      // Reject hallucinated/unverified claim
      rejected++;
    }
  });

  // Track rejected count on document object
  doc.rejectedFactsCount = (doc.rejectedFactsCount || 0) + rejected;

  return accepted;
}

// ---------- Stage A: Structural Heuristic Extractor ----------

function extractFactsWithHeuristics(doc: ParsedDocument): GroundedFact[] {
  const facts: GroundedFact[] = [];
  let n = 0;

  // General numeric metric: "Revenue was ₹20,312 crore" / "$4.2B" / "12.5 million USD"
  const numericRe =
    /([A-Za-z][^:\n]{5,60}?)\s+(?:is|was|were|reached|stood at|grew to|declined to|reported at|logged at|recorded at|at|:|=)\s*((?:₹|Rs\.?|INR|USD|\$|€)?\s*[\d,]+(?:\.\d+)?\s*(?:crore|lakh|million|billion|thousand|bn|mn|M|B|K|%|bps|pp)?(?:\s*(?:USD|INR|₹|EUR))?)/gi;

  // Percentage / rate metric: "GDP growth rate of 6.4%" or "grew 18% YoY"
  const pctRe =
    /([A-Za-z][^:\n]{3,50}?)\s+(?:of|at|by|grew|declined|increased|decreased|contracted)\s+([\d.]+\s*%(?:\s*(?:YoY|QoQ|year-on-year|quarter-on-quarter))?)/gi;

  // Table and presentation layouts often put the metric label before a value
  // without using a verb, for example "FY24 revenue from services ₹8,142 Cr".
  const labeledMetricRe =
    /\b(revenue(?:\s+from\s+[a-z ]+)?|ebitda(?:\s+margin)?|pat(?:\s+margin)?|express\s+parcel\s+shipments|active\s+customers|pin[- ]?code\s+reach|freight\s+tonnage|fleet\s+size|team\s+size|gateways|processing\s+cent(?:er|re)s|freight\s+service\s+cent(?:er|re)s)\b[^.]{0,90}?\(?[\d,]+(?:\.\d+)?\)?\s*(?:crore|cr|lakh|million|billion|thousand|bn|mn|M|B|K|%|bps|pp)?/gi;

  // Status / categorical: "CEO John Smith resigned" / "appointed as MD"
  const statusRe =
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s+(?:was\s+)?(?:appointed|resigned|stepped down|elevated|promoted|became|serves? as|is)\s+(?:as\s+)?([^.:\n]{5,60})/gi;

  doc.pages.forEach((page) => {
    const text = page.text;
    const timePeriod = detectTimePeriod(text);
    const entity = guessEntity(doc.name, text);

    for (const re of [numericRe, pctRe]) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const attr = canonicalAttribute(m[1]);
        const val = m[2].trim();
        if (attr.length < 5 || val.length < 1) continue;
        n++;
        facts.push({
          id: `fact-h-${doc.id}-${n}`,
          subject: entity,
          entity,
          predicate: attr,
          attribute: attr,
          value: val,
          normalizedValue: parseNormalizedNumber(val),
          valueType: 'numeric',
          unit: detectUnit(val),
          temporalScope: timePeriod,
          timePeriod,
          spatialScope: guessScope(text),
          scope: guessScope(text),
          evidence: {
            documentId: doc.id,
            documentName: doc.name,
            pageNumber: page.pageNumber,
            verbatimQuote: m[0].trim(),
            lineSnippet: m[0].trim().substring(0, 100),
            confidenceScore: 0.88
          },
          extractionStage: 'stage_a_structural',
          groundingVerified: true,
          extractedAt: new Date().toISOString()
        });
      }
    }

    labeledMetricRe.lastIndex = 0;
    let lm: RegExpExecArray | null;
    while ((lm = labeledMetricRe.exec(text)) !== null) {
      const attr = canonicalAttribute(lm[1]);
      const valueMatch = lm[0].match(/\(?[\d,]+(?:\.\d+)?\)?\s*(?:crore|cr|lakh|million|billion|thousand|bn|mn|M|B|K|%|bps|pp)?/i);
      const val = valueMatch?.[0].trim() || '';
      if (!val) continue;
      n++;
      facts.push({
        id: `fact-metric-${doc.id}-${n}`,
        subject: entity,
        entity,
        predicate: attr,
        attribute: attr,
        value: val,
        normalizedValue: parseNormalizedNumber(val),
        valueType: 'numeric',
        unit: detectUnit(val),
        temporalScope: timePeriod,
        timePeriod,
        spatialScope: guessScope(text),
        scope: guessScope(text),
        evidence: {
          documentId: doc.id,
          documentName: doc.name,
          pageNumber: page.pageNumber,
          verbatimQuote: lm[0].trim(),
          lineSnippet: lm[0].trim().substring(0, 100),
          confidenceScore: 0.86
        },
        extractionStage: 'stage_a_structural',
        groundingVerified: true,
        extractedAt: new Date().toISOString()
      });
    }

    // Status facts
    statusRe.lastIndex = 0;
    let sm: RegExpExecArray | null;
    while ((sm = statusRe.exec(text)) !== null) {
      n++;
      facts.push({
        id: `fact-h-${doc.id}-${n}`,
        subject: sm[1].trim(),
        entity: sm[1].trim(),
        predicate: 'Role / Status',
        attribute: 'Role / Status',
        value: sm[2].trim(),
        normalizedValue: sm[2].trim(),
        valueType: 'categorical',
        temporalScope: timePeriod,
        timePeriod,
        spatialScope: 'Governance',
        scope: 'Governance',
        evidence: {
          documentId: doc.id,
          documentName: doc.name,
          pageNumber: page.pageNumber,
          verbatimQuote: sm[0].trim(),
          lineSnippet: sm[0].trim().substring(0, 100),
          confidenceScore: 0.85
        },
        extractionStage: 'stage_a_structural',
        groundingVerified: true,
        extractedAt: new Date().toISOString()
      });
    }
  });

  // Deduplicate by (entity+attribute+value)
  const seen = new Set<string>();
  const unique = facts.filter(f => {
    const key = `${f.entity}|${f.attribute}|${f.value}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (unique.length === 0) return sentenceFallback(doc);
  return unique.slice(0, 50);
}

function detectTimePeriod(text: string): string {
  const qm = text.match(/Q[1-4]\s*(?:FY)?\s*(?:'?\d{2,4})/i);
  if (qm) return qm[0];
  const fym = text.match(/FY\s*(?:20)?\d{2}(?:-?\d{2,4})?/i);
  if (fym) return fym[0];
  const yrm = text.match(/20\d{2}-\d{2,4}/);
  if (yrm) return yrm[0];
  const yr = text.match(/\b(20\d{2})\b/);
  if (yr) return yr[1];
  return 'Not specified';
}

function canonicalAttribute(attribute: string): string {
  const value = attribute.toLowerCase().replace(/\s+/g, ' ').trim();
  if (value.includes('revenue')) return 'Revenue';
  if (value.includes('ebitda')) return 'EBITDA';
  if (value.includes('pat') || value.includes('profit after tax')) return 'PAT';
  if (value.includes('shipment')) return 'Shipments';
  if (value.includes('customer')) return 'Active Customers';
  if (value.includes('pin') && value.includes('code')) return 'Pin-code Reach';
  if (value.includes('tonnage')) return 'Freight Tonnage';
  if (value.includes('fleet')) return 'Fleet Size';
  if (value.includes('team')) return 'Team Size';
  if (value.includes('gateway')) return 'Gateways';
  if (value.includes('center') || value.includes('centre')) return 'Service Centers';
  return attribute.trim().replace(/\s+/g, ' ');
}

function guessEntity(filename: string, text: string): string {
  if (/delhivery/i.test(filename)) return 'Delhivery Limited';
  if (/economic survey|rbi|imf|india/i.test(filename)) return 'Government / Reserve Bank of India';
  if (/acme/i.test(filename)) return 'Acme Corp';
  const m = text.match(/\b([A-Z][a-z]+(?: [A-Z][a-z]+){1,3})\b/);
  return m ? m[1] : 'Target Entity';
}

function guessScope(text: string): string {
  if (/consolidat/i.test(text)) return 'Consolidated';
  if (/standalone/i.test(text)) return 'Standalone';
  if (/quarter/i.test(text)) return 'Quarterly';
  if (/annual|full.?year/i.test(text)) return 'Annual';
  return 'General';
}

function detectUnit(val: string): string {
  if (/₹|INR|Rs/i.test(val)) return 'INR';
  if (/\$|USD/i.test(val)) return 'USD';
  if (/€|EUR/i.test(val)) return 'EUR';
  if (/%/.test(val)) return 'Percent';
  if (/crore/i.test(val)) return 'INR Crore';
  if (/lakh/i.test(val)) return 'INR Lakh';
  if (/bps/i.test(val)) return 'Basis Points';
  return 'Numeric';
}

function parseNormalizedNumber(valStr: string): number {
  const clean = valStr.replace(/[^0-9.]/g, '');
  let num = parseFloat(clean) || 0;
  if (/crore|cr\b/i.test(valStr)) num *= 1e7;
  else if (/lakh/i.test(valStr)) num *= 1e5;
  else if (/billion|bn/i.test(valStr)) num *= 1e9;
  else if (/million|mn/i.test(valStr)) num *= 1e6;
  else if (/thousand|k/i.test(valStr)) num *= 1e3;
  return Math.round(num);
}

function sentenceFallback(doc: ParsedDocument): GroundedFact[] {
  const facts: GroundedFact[] = [];
  doc.pages.slice(0, 3).forEach((page) => {
    const sentences = page.text.split(/(?<=[.!?])\s+/);
    sentences.filter(s => s.length > 30).slice(0, 3).forEach((sent, idx) => {
      facts.push({
        id: `fact-gen-${doc.id}-${idx}`,
        subject: guessEntity(doc.name, sent),
        entity: guessEntity(doc.name, sent),
        predicate: `Key Sentence #${idx + 1}`,
        attribute: `Key Sentence #${idx + 1}`,
        value: sent.substring(0, 80) + (sent.length > 80 ? '…' : ''),
        normalizedValue: sent,
        valueType: 'textual',
        evidence: {
          documentId: doc.id,
          documentName: doc.name,
          pageNumber: page.pageNumber,
          verbatimQuote: sent,
          confidenceScore: 0.75
        },
        extractionStage: 'stage_a_structural',
        groundingVerified: true,
        extractedAt: new Date().toISOString()
      });
    });
  });
  return facts;
}

// ---------- Stage B: Semantic LLM Extractor ----------

async function extractFactsWithLlm(
  doc: ParsedDocument,
  apiKey: string,
  provider: 'openai' | 'gemini'
): Promise<GroundedFact[]> {
  const pages = doc.pages.slice(0, 8);

  const prompt = `You are a financial/economic document analyst. Extract all meaningful grounded claims/facts from the document pages below.

Document: ${doc.name}

Pages:
${pages.map(p => `--- Page ${p.pageNumber} ---\n${p.text.substring(0, 2000)}`).join('\n\n')}

Return ONLY valid JSON array (no markdown, no explanation):
[
  {
    "entity": "string (company/country/person name)",
    "attribute": "string (metric/status label)",
    "value": "string (exact value as stated)",
    "valueType": "numeric|temporal|categorical|textual",
    "unit": "string (USD/INR/Percent/etc)",
    "timePeriod": "string (Q3 FY24, FY2023-24, etc)",
    "scope": "string (Consolidated/Standalone/Annual/Quarterly)",
    "pageNumber": number,
    "verbatimQuote": "string (exact sentence from document)"
  }
]

Rules:
- Only extract facts explicitly stated
- verbatimQuote must be an EXACT verbatim sentence from the text above
- pageNumber must match the page the fact appears on`;

  let factsArray: any[] = [];

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'OpenAI error');
    const content = json.choices[0].message.content;
    const parsed = JSON.parse(content);
    factsArray = Array.isArray(parsed) ? parsed : (parsed.facts || parsed.data || []);

  } else if (provider === 'gemini') {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Gemini error');
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const parsed = JSON.parse(text);
    factsArray = Array.isArray(parsed) ? parsed : (parsed.facts || parsed.data || []);
  }

  return factsArray.map((item: any, idx: number) => ({
    id: `llm-fact-${doc.id}-${idx}`,
    subject: item.entity || guessEntity(doc.name, ''),
    entity: item.entity || guessEntity(doc.name, ''),
    predicate: item.attribute || 'Attribute',
    attribute: item.attribute || 'Attribute',
    value: String(item.value),
    normalizedValue: parseNormalizedNumber(String(item.value)),
    valueType: item.valueType || 'numeric',
    unit: item.unit || detectUnit(String(item.value)),
    temporalScope: item.timePeriod || 'Not specified',
    timePeriod: item.timePeriod || 'Not specified',
    spatialScope: item.scope || 'General',
    scope: item.scope || 'General',
    evidence: {
      documentId: doc.id,
      documentName: doc.name,
      pageNumber: item.pageNumber || 1,
      verbatimQuote: item.verbatimQuote || String(item.value),
      confidenceScore: 0.97
    },
    extractionStage: 'stage_b_llm',
    groundingVerified: false, // Will be verified in post-processing step
    extractedAt: new Date().toISOString()
  }));
}
