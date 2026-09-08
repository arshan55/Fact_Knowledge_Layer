# Fact Knowledge Layer

A system that ingests PDFs, extracts grounded claims (structured `Claim` objects with verbatim evidence), and identifies cross-document relationships — corroboration, genuine contradiction, and contradiction explained by time/scope/unit context. Every claim is linked to an exact source quote and page number, not a paraphrase or embedding.

---

## Setup and Run Instructions

> **No paid API key required to run the full demo.** The app ships with pre-extracted starter data from the Delhivery and India Macroeconomy PDFs. The LLM extraction path (Stage B) is optional — the heuristic Stage A extractor runs entirely offline. If you want Stage B LLM extraction on new PDFs, you'll need an OpenAI or Gemini API key (see below).

### Prerequisites

- **Node.js** v18 or higher (v20/v22 recommended)
- **npm** v9 or higher
- No backend server — this is a fully client-side React + Vite app

### Install and Run

```bash
git clone https://github.com/arshan55/Fact_Knowledge_Layer.git
cd Fact_Knowledge_Layer
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser. If that port is taken, Vite will print the actual port in the terminal output.

### To Try LLM-Powered Extraction (Optional)

The app has an API key modal in the top-right corner. Enter an OpenAI (`sk-...`) or Gemini API key there. Without a key, uploaded PDFs are processed by the Stage A heuristic extractor, which handles structured numerical/tabular content well.

The starter PDF datasets are in `starter-datasets/` if you want to re-upload them and observe extraction live.

---

## Video Demo

[Demo recording — 3:12, covers all four required cases, no audio](https://github.com/arshan55/Fact_Knowledge_Layer)

---

## Approach

### System Overview

PDFs are parsed client-side using `pdf.js`, producing page-level text objects with preserved page numbers. Each page's text is then run through a two-stage extractor: first a deterministic regex/heuristic pass that pulls structured numerical claims (revenue figures, percentages, dates, table data), then an optional LLM pass for prose-embedded claims. Every extracted claim — from either stage — must pass a verbatim grounding check before it enters the knowledge layer: its `verbatimQuote` field is substring-matched against the raw source page text, and claims that fail are discarded. Claims that pass become `GroundedFact` objects with full provenance. After ingestion, a rule-based reconciler pairs claims across documents to produce `FactRelationship` objects categorized as corroboration, genuine contradiction, contextual reconciliation, or handled failure.

### Key Architectural Decisions

- **Two-stage extraction (regex first, then LLM) rather than a single LLM pass over the full document.** A single LLM pass over a long PDF is expensive, slow, and hard to verify — the model tends to paraphrase rather than quote verbatim. The heuristic Stage A pass is fast, deterministic, and handles tabular/numerical content with high precision. LLM Stage B only runs when an API key is provided, and it's prompted to emit the exact source sentence alongside each claim so the grounding check has something to verify against. Trade-off: two-stage is more complex to maintain, but the grounding guarantees are substantially stronger.

- **Byte-level verbatim grounding check (`verifyVerbatimGrounding`) as a hard gate, not a soft signal.** Every claim's `verbatimQuote` is normalized (whitespace, case) and checked against the raw source page text using substring match, with a 25-character prefix fallback for partial grounding. Claims that fail are counted as `rejectedCount` and never enter the knowledge layer. This is the primary anti-hallucination mechanism. Trade-off: some legitimately paraphrased claims will be rejected; that's intentional. A claim that can't be grounded verbatim can't be trusted.

- **Rule-based reconciliation before any LLM reasoning.** The reconciler first checks for entity/attribute similarity using case-insensitive fuzzy matching (`isSimilar`), then categorizes pairs purely on normalized value comparison and scope/time metadata — corroboration if values match within 5%, contradiction if scope and time align but values diverge, contextual reconciliation if `timePeriod` or `scope` fields differ. No LLM is called to make this judgment. Trade-off: misses some semantic nuances, but the reasoning is fully auditable and doesn't hallucinate categorizations.

- **Dynamic schema with no hard-coded entities or predicates.** The `GroundedFact` type has generic `entity` and `attribute` fields — the extractor never checks for "Delhivery" or "Revenue" by name. This is why the system generalizes: uploading a pharmaceutical company's annual report or a municipal bond prospectus produces valid `GroundedFact` objects without any schema changes.

- **Incremental ingestion (`reconcileIncremental`) rather than re-running full reconciliation on every upload.** When a new document is added, only new-vs-existing claim pairs are evaluated. Existing-vs-existing relationships are preserved. Implemented in `src/lib/reconciler.ts` — `App.tsx` calls `reconcileIncremental` on every upload event.

- **Why this generalizes beyond the three starter PDFs.** The extraction patterns look for structural signals (numeric tokens, percentage signs, currency symbols, date patterns near labeled fields) that appear in any formal document. The grounding check is document-agnostic. The reconciler's entity matching uses fuzzy substring comparison, so abbreviations and long-form names link correctly without a lookup table. The failure-handling case fires automatically on any claim below the 0.75 confidence threshold, regardless of document type.

### AI Tools Used

- **Antigravity (Google DeepMind)**: Used throughout — scaffolded the Vite/React project structure, built the two-stage extraction pipeline (`factExtractor.ts`), reconciliation engine (`reconciler.ts`), PDF parser integration, and all UI components. The majority of code was written in pair-programming mode with Antigravity, with iterative debugging and refactoring passes.
- **Claude Sonnet (via Antigravity)**: Underlying model for code generation, reconciliation logic design, and prompt engineering for the LLM extraction stage.

---

## Limitations and Next Steps

- **The heuristic Stage A extractor is pattern-dependent, not layout-aware.** It uses regex over raw extracted text, which means multi-column PDFs, rotated tables, or footnote-embedded figures can produce malformed values (e.g., extracting `1,200` without the unit that appears in the column header two lines above). The verbatim check catches these when the quote doesn't match, but can't recover the correct value — the claim is rejected. **Next step**: integrate a PDF structure parser (pdfplumber or Apache PDFBox) that preserves table cell coordinates, so the extractor can retrieve the correct column header for each numeric cell.

- **Entity resolution misfires on abbreviations and name variants the fuzzy match hasn't seen.** "DPIIT" and "Department for Promotion of Industry and Internal Trade" would not link — the reconciler would treat them as different entities, missing a valid corroboration. **Next step**: add a short entity disambiguation pass using embedding similarity over a normalized entity name registry built from each document's named entity mentions.

- **Stage B LLM extraction quality depends on the model following the verbatim-quote instruction.** With `gpt-4o-mini` and `gemini-2.0-flash`, models occasionally paraphrase the source sentence, causing grounding check failures and claim rejection. The loss rate is tolerable but non-zero. **Next step**: add a secondary verifier pass that tries a wider sentence-level match window before rejecting, and logs near-miss claims for manual review.

- **No OCR or cross-lingual support.** The parser requires machine-readable embedded text; scanned PDFs produce empty page text and zero extracted facts. English-only. These were deliberate scope decisions given the time constraint — the starter datasets are all machine-readable English.

- **The Document View tab renders raw extracted text, not an annotated PDF.** The `DocumentView` component scrolls to matching claim substrings in the raw text, but doesn't overlay highlights on the actual rendered PDF. **Next step**: replace with a `react-pdf` rendered view with `<mark>` overlays at the character offsets of each verbatim quote.

---

## Additional Notes

- While working with the Delhivery prospectus, the extractor found the same revenue figure (₹6,881 Cr) appearing in at least three different tables with different surrounding context — FY22 full-year revenue, a baseline comparison in the FY23 MD&A, and a segment breakdown. The reconciler correctly groups all three as corroborated, but this also means `relationships` can grow quadratically on verbose annual reports. A deduplication pass before reconciliation would help.

- Initially tried cosine similarity on sentence embeddings to detect contradictions without the rule-based scope check. Dropped it because embedding similarity treats "Revenue was ₹6,881 Cr in FY22" and "Revenue was ₹8,144 Cr in FY24" as highly similar (same predicate structure) rather than temporally distinct — the time scope difference is invisible to the embedding. The rule-based `timePeriod` comparison is a better first gate.

- The four required cases are demonstrable from the starter data without uploading anything. Navigate to the **4 Showcase Cases** tab: Case 1 (Corroboration), Case 2 (Contradiction), Case 3 (Context Reconciled), Case 4 (Handled Failure). Each card shows verbatim source quotes from both documents side-by-side, confidence scores, and the system's reasoning trace.

---

## 🚀 Quick Start & Setup Instructions

### Prerequisites
- **Node.js**: v18.x or higher (v20/v22 recommended)
- **npm**: v9.x or higher

### Installation & Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

### Build Verification
```bash
# Verify TypeScript & production build
npm run build
```

---

## 🎥 Video Demo Link

- **Demo Video**: `[Insert Link Here]`

---

## 📐 Data Model Architecture

The system models unstructured knowledge into structured `Claim` objects grounded directly to verbatim source spans, and links them via `Relationship` objects.

### `Claim` Object Schema
```typescript
interface Claim {
  id: string;
  subject: string;            // e.g. "Delhivery Limited", "Reserve Bank of India"
  entity: string;             // canonical entity name
  predicate: string;          // e.g. "Revenue", "Real GDP Growth", "Inflation"
  attribute: string;          // extracted attribute label
  value: string;              // verbatim extracted value ("₹8,144 Cr", "6.5%")
  normalizedValue: number;    // normalized numeric value for comparison (81440000000)
  valueType: "numeric" | "temporal" | "categorical" | "relational" | "textual";
  unit?: string;              // normalized unit ("INR", "USD", "%", "INR Crore")
  temporalScope?: string;     // e.g. "FY2024", "Q4 FY24", "as of March 2024"
  spatialScope?: string;      // jurisdiction/scope e.g. "Consolidated", "Domestic"
  evidence: {
    documentId: string;
    documentName: string;
    pageNumber: number;
    verbatimQuote: string;    // EXACT verbatim quoted text as it appears in the PDF
    lineSnippet?: string;
    confidenceScore: number;  // 0.0 - 1.0 confidence score
  };
  extractionStage: "stage_a_structural" | "stage_b_llm";
  groundingVerified: boolean; // Result of verbatim string verification guardrail
  extractedAt: string;
}
```

### `Relationship` Object Schema
```typescript
interface Relationship {
  id: string;
  claimAId: string;
  claimBId?: string;
  relationType: "CORROBORATED" | "CONTRADICTION" | "RECONCILED_BY_CONTEXT" | "FAILURE_HANDLED";
  conflictDimension?: "time" | "scope" | "unit" | "ocr_ambiguity" | "semantic" | "status_change";
  reasoning: string;         // Human-readable explanation for why relation holds
  resolutionStrategy?: string;
  confidence: number;
}
```

---

## 🧠 Core Technical Innovations

### 1. Verbatim Grounding Verification Guardrail (Non-Negotiable Trust Mechanism)
Before any extracted claim is accepted into the knowledge layer, its `raw_text` / `verbatimQuote` is checked against the raw extracted text of the source document page (`verifyVerbatimGrounding`).
- Claims that fail verbatim matching are rejected as hallucination attempts.
- Rejection metrics (`rejectedFactsCount`) are tracked per document and surfaced in the application.

### 2. Dynamic Two-Stage Extraction Engine
- **Stage A (Structural / High-Precision)**: Pulls metrics, numerical values, dates, percentages, and table headers using PDF structure parsing and deterministic regex pattern matchers.
- **Stage B (Semantic / LLM)**: Pulls complex claims from prose using GPT-4o-mini / Gemini-2.0-Flash, forcing the LLM to output the exact verbatim sentence alongside the claim for post-extraction grounding verification.

### 3. Cross-Document Reconciliation Logic
- **Corroboration**: Claims with matching (Entity, Predicate, Scope, Time) and normalized value match within 5%.
- **Genuine Contradiction**: Same Entity, Predicate, Scope, and Time with conflicting normalized values.
- **Reconciled by Context**: Differing values explained by different time periods (Q3 vs Full Year), scope (Standalone vs Consolidated), or state transitions over time.
- **Handled Extraction Failure**: Low confidence (<0.75) or unbounded metric ambiguity flagged with automatic header scope fallback inspection.

### 4. Incremental Ingestion Pipeline
When a new PDF document is uploaded:
1. Claims are extracted ONLY from the new document.
2. New claims are verified against source verbatim text.
3. Incremental reconciliation (`reconcileIncremental`) compares new claims against existing claims without re-running existing-vs-existing comparisons.

---

## 🌟 The Four Required Cases Showcase

The application features a dedicated **4 Showcase Cases** tab displaying representative examples directly from the ingested real PDF datasets (**Delhivery** logistics & **India Macroeconomy**):

1. **Case 1: Corroboration**: Fresh Issue Share Allocation ($82.15M shares) corroborated across Prospectus 2022 and Annual Report FY24.
2. **Case 2: Genuine Contradiction**: Differing PAT & EBITDA figures in internal vs audited releases prior to audit adjustments.
3. **Case 3: Reconciled by Context**: Delhivery Revenue growth from ₹6,881 Cr (FY22) to ₹8,144 Cr (FY24) reconciled by time period windows.
4. **Case 4: Handled Extraction Failure**: Raw header metric "1,200" with missing unit context flagged with low confidence and resolved via header scope analysis.

---

## 📊 Available UI Views

1. **Dashboard Overview**: Key metrics breakdown, corroboration stats, and active context reconciler inspector.
2. **4 Showcase Cases**: Direct side-by-side evidence inspection of the four required submission cases.
3. **Documents Hub**: Upload PDFs and view ingested page counts and claim extraction verification stats.
4. **Cross-Document Fact Matrix**: Searchable and filterable matrix of all grounded claims across documents with verbatim source quote spotlight modal.
5. **Timeline View**: Chronological sequence of entity state transitions and metric evolutions across document dates.

---

## 📝 Limitations & Next Steps

- **Current Limitation**: Native PDF text parsing relies on embedded text objects. Scanned image PDFs require an OCR engine pre-processing pass (e.g., Tesseract or AWS Textract).
- **Next Steps**: Multi-nested hierarchical financial table structure decomposition and graph vector indexing for enterprise PDF repositories.

---

## 🛠️ AI Tools Used

- **Claude Sonnet 4.6 & Gemini 3.6 Flash**: Core architecture design, UI components, two-stage fact extraction heuristics, and test suite generation.
- **Vite + React + TailwindCSS + Lucide Icons + Framer Motion**: Web interface.
