export type GroundingEvidence = {
  documentId: string;
  documentName: string;
  pageNumber: number;
  verbatimQuote: string;      // raw_text: verbatim quoted sentence/cell as it appears in the source
  lineSnippet?: string;
  confidenceScore: number;    // 0.0 - 1.0 confidence based on extraction method & ambiguity
  sourceOffset?: string;      // page number + character offset or bounding box
};

export type FactValueType = 'numeric' | 'temporal' | 'categorical' | 'relational' | 'textual';
export type ExtractionStage = 'stage_a_structural' | 'stage_b_llm';

export type GroundedFact = {
  id: string;
  subject?: string;           // alias for entity (e.g. "Delhivery Limited", "India Macroeconomy")
  entity: string;             // e.g. "Delhivery", "RBI", "Economic Survey"
  predicate?: string;         // alias for attribute (e.g. "Revenue", "GDP Growth", "Inflation")
  attribute: string;          // e.g. "Revenue", "Net Sales", "GDP Growth Rate"
  value: string;              // e.g. "₹8,144 Cr", "6.5%"
  normalizedValue: number | string | boolean;
  valueType: FactValueType;
  unit?: string;              // normalized unit if numeric (INR, USD, %, Crore, Million, etc.)
  temporalScope?: string;     // temporal_scope: e.g. FY2024, "as of March 2024"
  timePeriod?: string;        // e.g. "FY 2023-24", "Q4 FY24"
  spatialScope?: string;      // spatial_scope: e.g. jurisdiction/location, "Consolidated"
  scope?: string;             // e.g. "Consolidated", "Domestic", "Parent Company"
  evidence: GroundingEvidence;
  extractionStage?: ExtractionStage; // Stage A (structural regex/heuristics) or Stage B (semantic LLM)
  groundingVerified?: boolean; // Mandatory verbatim grounding check status
  extractedAt: string;
};

// Claim is an alias for GroundedFact matching the data model spec
export type Claim = GroundedFact;

export type RelationshipType =
  | 'CORROBORATED'           // Fact match across documents
  | 'CONTRADICTION'          // Direct conflict in same scope & time
  | 'RECONCILED_BY_CONTEXT'  // Seeming conflict explained by time, scope, unit, or status update
  | 'FAILURE_HANDLED';       // Ambiguity, OCR/parsing extraction failure identified and flagged

export type FactRelationship = {
  id: string;
  caseType: 'case1' | 'case2' | 'case3' | 'case4';
  title: string;
  relationshipType: RelationshipType;
  factA: GroundedFact;
  factB?: GroundedFact;       // Optional for single-fact failure cases
  claimAId?: string;
  claimBId?: string;
  conflictDimension?: 'time' | 'scope' | 'unit' | 'ocr_ambiguity' | 'semantic' | 'status_change';
  reasoning: string;         // human-readable explanation of why this relation holds
  explanation?: string;       // alias for reasoning
  resolutionStrategy?: string;
  confidence: number;
};

// Relationship is an alias for FactRelationship
export type Relationship = FactRelationship;

export type ParsedDocument = {
  id: string;
  name: string;
  uploadedAt: string;
  pageCount: number;
  pages: {
    pageNumber: number;
    text: string;
  }[];
  extractedFacts: GroundedFact[];
  rejectedFactsCount?: number; // Count of claims rejected by verbatim grounding check (hallucination guardrail)
  fileSize?: string;
};

export type CasePreset = {
  id: string;
  caseNumber: 1 | 2 | 3 | 4;
  badgeTitle: string;
  shortDesc: string;
  relationship: FactRelationship;
};

// Workspace = isolated project context with its own PDFs, facts & relationships
export type Workspace = {
  id: string;
  name: string;
  emoji: string;            // visual identifier e.g. "📁" "🚚" "🇮🇳"
  createdAt: string;
  documents: ParsedDocument[];
  facts: GroundedFact[];
  relationships: FactRelationship[];
  rejectedClaimsTotal?: number; // Total count of claims filtered out by grounding verification
  isDemo?: boolean;         // marks the built-in starter workspace
};
