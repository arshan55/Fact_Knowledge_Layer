# Fact Knowledge Layer (Superjoin Assignment)

A production-ready **Fact Knowledge Layer** system that ingests unstructured PDFs, extracts grounded claims with exact verbatim source evidence, enforces hallucination guardrails, and reconciles cross-document relationships (Corroboration, Contradiction, Contextual Reconciliation, and Handled Extraction Failures).

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

## Live Demo

- **Live App**: [https://fact-ochre.vercel.app/](https://fact-ochre.vercel.app/)
