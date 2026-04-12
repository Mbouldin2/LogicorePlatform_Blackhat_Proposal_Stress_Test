/**
 * NIST 800-171 Control Definition
 */
export interface NISTControl {
  id: string; // e.g., "AC.L1-3.1.1"
  family: string; // e.g., "AC" (Access Control)
  level: number; // 1, 2, or 3
  number: string; // e.g., "3.1.1"
  title: string;
  description: string;
  discussion: string;
  relatedControls: string[];
  assessmentObjective: string;
  potentialAssessors: string[];
  // CMMC mapping
  cmmcLevel: 1 | 2 | 3;
  // Common artifacts that validate this control
  commonArtifacts: string[];
  // Interview questions for assessment
  interviewQuestions: string[];
  // Test methods
  testMethods: ('examine' | 'interview' | 'test')[];
}

/**
 * Assessment Status
 */
export type AssessmentStatus = 
  | 'draft'
  | 'in_progress'
  | 'completed'
  | 'archived';

/**
 * Control Implementation Status
 */
export type ControlStatus = 
  | 'not_applicable'
  | 'not_implemented'
  | 'partially_implemented'
  | 'implemented'
  | 'not_tested';

/**
 * Finding Severity
 */
export type FindingSeverity = 
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'informational';

/**
 * POAM Status
 */
export type POAMStatus = 
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'risk_accepted'
  | 'transferred';

/**
 * System/Assessment Definition
 */
export interface SystemAssessment {
  id: string;
  name: string;
  description: string;
  organizationName: string;
  systemOwner: string;
  systemOwnerEmail: string;
  securityOfficer?: string;
  securityOfficerEmail?: string;
  assessorName?: string;
  assessorEmail?: string;
  
  // System characteristics
  systemType: 'on_premise' | 'cloud' | 'hybrid' | 'contractor';
  cloudProvider?: string;
  handlesCUI: boolean;
  cuiCategories?: string[];
  networkDiagramAvailable: boolean;
  userCount?: number;
  
  // Assessment metadata
  status: AssessmentStatus;
  targetLevel?: 1 | 2 | 3;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  
  // AI-generated context
  systemContext?: string;
  applicableControlsCount?: number;
  implementedControlsCount?: number;
  
  // Scoring
  overallScore?: number; // 0-100
  complianceLevel?: 'non_compliant' | 'level_1' | 'level_2' | 'level_3';
}

/**
 * Control Assessment Entry
 */
export interface ControlAssessment {
  id: string;
  assessmentId: string;
  controlId: string;
  
  // Applicability
  isApplicable: boolean;
  notApplicableReason?: string;
  
  // Implementation
  status: ControlStatus;
  implementationDescription?: string;
  implementationEvidence?: string[];
  
  // AI-generated content
  aiSuggestedResponse?: string;
  aiArtifacts?: string[];
  aiRecommendations?: string[];
  
  // Manual assessment
  assessorNotes?: string;
  artifactsReviewed?: string[];
  interviewsConducted?: string[];
  testsPerformed?: string[];
  
  // Finding
  hasFinding: boolean;
  findingId?: string;
  
  // Metadata
  assessedBy?: string;
  assessedAt?: Date;
  updatedAt: Date;
}

/**
 * Finding/Deficiency
 */
export interface Finding {
  id: string;
  assessmentId: string;
  controlId: string;
  controlAssessmentId: string;
  
  // Finding details
  title: string;
  description: string;
  severity: FindingSeverity;
  
  // AI analysis
  aiRiskAnalysis?: string;
  aiRemediationSuggestions?: string[];
  
  // Assessment
  rootCause?: string;
  affectedAssets?: string[];
  
  // POAM linkage
  poamId?: string;
  
  // Metadata
  identifiedBy: string;
  identifiedAt: Date;
  updatedAt: Date;
}

/**
 * Plan of Action and Milestones (POAM)
 */
export interface POAM {
  id: string;
  assessmentId: string;
  findingId: string;
  
  // POAM details
  controlId: string;
  weaknessDescription: string;
  severity: FindingSeverity;
  
  // Remediation plan
  correctiveAction: string;
  resourcesRequired?: string;
  responsibleParty: string;
  responsiblePartyEmail?: string;
  
  // Timeline
  scheduledCompletionDate: Date;
  actualCompletionDate?: Date;
  milestones: POAMMilestone[];
  
  // Status
  status: POAMStatus;
  
  // AI recommendations
  aiSuggestedSteps?: string[];
  aiPriorityRanking?: number; // 1-10
  aiResourceEstimate?: string;
  
  // Risk acceptance (if applicable)
  riskAccepted?: boolean;
  riskAcceptanceRationale?: string;
  riskAcceptanceApprover?: string;
  riskAcceptanceDate?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * POAM Milestone
 */
export interface POAMMilestone {
  id: string;
  description: string;
  targetDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed';
  deliverables?: string[];
}

/**
 * AI Assessment Session
 */
export interface AIAssessmentSession {
  id: string;
  assessmentId: string;
  
  // Session type
  type: 'initial_assessment' | 'control_review' | 'finding_analysis' | 'poam_planning' | 'pre_audit';
  
  // Conversation
  messages: AIAssessmentMessage[];
  
  // AI context
  systemPrompt: string;
  modelUsed?: string;
  
  // Results
  suggestedControls?: string[];
  generatedResponses?: Record<string, string>;
  identifiedFindings?: Partial<Finding>[];
  
  // Metadata
  startedAt: Date;
  completedAt?: Date;
  status: 'active' | 'completed' | 'error';
}

/**
 * AI Assessment Message
 */
export interface AIAssessmentMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  // For AI responses
  model?: string;
  tokensUsed?: number;
  // For structured responses
  structuredData?: {
    controlId?: string;
    findingId?: string;
    responseType?: string;
    confidence?: number;
  };
}

/**
 * Artifact Template
 */
export interface ArtifactTemplate {
  id: string;
  controlId: string;
  name: string;
  description: string;
  type: 'policy' | 'procedure' | 'configuration' | 'log' | 'screenshot' | 'document' | 'other';
  required: boolean;
  aiGuidance?: string;
  exampleContent?: string;
}

/**
 * Assessment Questionnaire Question
 */
export interface AssessmentQuestion {
  id: string;
  category: string;
  question: string;
  questionType: 'boolean' | 'multiple_choice' | 'text' | 'multi_select';
  options?: string[];
  helpText?: string;
  // Mapping to controls
  applicableControls: string[]; // control IDs that this question helps determine
  // Scoring weight
  weight: number;
}

/**
 * Questionnaire Response
 */
export interface QuestionnaireResponse {
  id: string;
  assessmentId: string;
  questionId: string;
  answer: string | string[] | boolean;
  notes?: string;
  answeredAt: Date;
  answeredBy?: string;
}

/**
 * AI Pre-Audit Configuration
 */
export interface AIPreAuditConfig {
  id: string;
  assessmentId: string;
  
  // System prompt for the AI auditor
  systemPrompt: string;
  
  // Audit scope
  scopeControls: string[]; // specific controls to audit, or 'all'
  scopeDescription?: string;
  
  // Audit configuration
  simulateFindings: boolean;
  findingSeverity: 'low' | 'medium' | 'high' | 'mixed';
  auditDepth: 'surface' | 'standard' | 'deep';
  
  // Results
  auditReport?: {
    summary: string;
    overallScore: number;
    complianceLevel: string;
    keyFindings: string[];
    recommendations: string[];
  };
  
  // Metadata
  startedAt: Date;
  completedAt?: Date;
  status: 'pending' | 'running' | 'completed' | 'error';
}

// Firestore collection names
export const CMMC_COLLECTIONS = {
  ASSESSMENTS: 'cmmc_assessments',
  CONTROL_ASSESSMENTS: 'cmmc_control_assessments',
  FINDINGS: 'cmmc_findings',
  POAMS: 'cmmc_poams',
  AI_SESSIONS: 'cmmc_ai_sessions',
  QUESTIONNAIRE_RESPONSES: 'cmmc_questionnaire_responses',
  PRE_AUDITS: 'cmmc_pre_audits',
} as const;
