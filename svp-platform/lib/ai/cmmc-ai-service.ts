import { NISTControl, ControlAssessment, SystemAssessment, Finding, POAM } from "@/lib/types/cmmc";
import { getControlById } from "@/lib/data/nist-controls";

/**
 * AI Service for CMMC Analyzer
 * Provides AI-powered assistance for:
 * 1. Control applicability determination
 * 2. Artifact recommendations
 * 3. Response writing assistance
 * 4. Finding remediation recommendations
 * 5. POAM creation assistance
 */

export interface AIControlAnalysis {
  controlId: string;
  isApplicable: boolean;
  applicabilityReason: string;
  suggestedArtifacts: string[];
  implementationGuidance: string;
  commonChallenges: string[];
  interviewScript: string[];
  confidence: number;
}

export interface AIResponseSuggestion {
  controlId: string;
  suggestedResponse: string;
  keyPoints: string[];
  evidenceRequired: string[];
  confidence: number;
}

export interface AIFindingAnalysis {
  findingId: string;
  riskAnalysis: string;
  remediationSteps: string[];
  estimatedEffort: string;
  priority: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  resourcesRequired: string[];
  aiRecommendation: string;
}

export interface AIPOAMSuggestion {
  findingId: string;
  weaknessDescription: string;
  correctiveAction: string;
  milestones: Array<{
    description: string;
    duration: string;
  }>;
  resourcesRequired: string[];
  responsibleRoles: string[];
  estimatedCompletion: string;
}

export interface AIPreAuditResult {
  overallScore: number;
  complianceLevel: string;
  summary: string;
  keyFindings: Array<{
    controlId: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    finding: string;
    recommendation: string;
  }>;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  readinessLevel: 'not_ready' | 'needs_improvement' | 'nearly_ready' | 'ready';
}

/**
 * Generate AI analysis for a specific control based on system context
 */
export async function generateControlAnalysis(
  controlId: string,
  systemContext: SystemAssessment,
  questionnaireResponses?: Record<string, unknown>
): Promise<AIControlAnalysis> {
  const control = getControlById(controlId);
  if (!control) {
    throw new Error(`Control ${controlId} not found`);
  }

  // Build context for AI analysis
  const context = buildSystemContext(systemContext, questionnaireResponses);

  // Determine applicability based on system context
  const { isApplicable, reason } = determineApplicability(control, systemContext, questionnaireResponses);

  // Generate suggested artifacts
  const suggestedArtifacts = generateArtifactRecommendations(control, systemContext);

  // Generate implementation guidance
  const implementationGuidance = generateImplementationGuidance(control, systemContext);

  // Generate interview script
  const interviewScript = generateInterviewScript(control);

  return {
    controlId,
    isApplicable,
    applicabilityReason: reason,
    suggestedArtifacts,
    implementationGuidance,
    commonChallenges: control.commonArtifacts.slice(0, 3),
    interviewScript,
    confidence: 0.85,
  };
}

/**
 * Generate AI-suggested response for a control implementation description
 */
export async function generateControlResponse(
  controlId: string,
  systemContext: SystemAssessment,
  existingImplementation?: string
): Promise<AIResponseSuggestion> {
  const control = getControlById(controlId);
  if (!control) {
    throw new Error(`Control ${controlId} not found`);
  }

  const suggestedResponse = buildControlResponse(control, systemContext, existingImplementation);
  
  return {
    controlId,
    suggestedResponse,
    keyPoints: [
      `Implement ${control.title}`,
      `Address ${control.testMethods.join(', ')} test methods`,
      `Document ${control.commonArtifacts[0] || 'relevant controls'}`,
    ],
    evidenceRequired: control.commonArtifacts.slice(0, 4),
    confidence: 0.8,
  };
}

/**
 * Generate AI analysis for a finding including remediation recommendations
 */
export async function analyzeFinding(
  finding: Finding,
  controlAssessment: ControlAssessment,
  systemContext: SystemAssessment
): Promise<AIFindingAnalysis> {
  const control = getControlById(finding.controlId);
  
  const riskAnalysis = generateRiskAnalysis(finding, control, systemContext);
  const remediationSteps = generateRemediationSteps(finding, control);
  const resourcesRequired = generateResourceRequirements(finding, control);

  return {
    findingId: finding.id,
    riskAnalysis,
    remediationSteps,
    estimatedEffort: estimateEffort(finding.severity),
    priority: finding.severity,
    resourcesRequired,
    aiRecommendation: remediationSteps[0] || 'Implement required control',
  };
}

/**
 * Generate AI-suggested POAM for a finding
 */
export async function generatePOAMSuggestion(
  finding: Finding,
  controlAssessment: ControlAssessment,
  systemContext: SystemAssessment
): Promise<AIPOAMSuggestion> {
  const control = getControlById(finding.controlId);
  
  const weaknessDescription = finding.description;
  const correctiveAction = generateCorrectiveAction(finding, control);
  const milestones = generateMilestones(finding, control);
  const resourcesRequired = generateResourceRequirements(finding, control);

  return {
    findingId: finding.id,
    weaknessDescription,
    correctiveAction,
    milestones,
    resourcesRequired,
    responsibleRoles: ['System Administrator', 'Security Officer', 'IT Manager'],
    estimatedCompletion: calculateCompletionDate(finding.severity),
  };
}

/**
 * Perform AI Pre-Audit of the system
 */
export async function performPreAudit(
  systemContext: SystemAssessment,
  controlAssessments: ControlAssessment[],
  scopeControls?: string[]
): Promise<AIPreAuditResult> {
  const controlsToAudit = scopeControls || controlAssessments.map(ca => ca.controlId);
  
  // Simulate audit findings based on control assessments
  const simulatedFindings = simulateAuditFindings(controlAssessments, controlsToAudit);
  
  const totalControls = controlsToAudit.length;
  const implementedControls = controlAssessments.filter(
    ca => controlsToAudit.includes(ca.controlId) && ca.status === 'implemented'
  ).length;
  
  const score = Math.round((implementedControls / totalControls) * 100);
  
  let complianceLevel = 'Non-Compliant';
  let readinessLevel: AIPreAuditResult['readinessLevel'] = 'not_ready';
  
  if (score >= 95) {
    complianceLevel = 'Level 3 (Expert)';
    readinessLevel = 'ready';
  } else if (score >= 85) {
    complianceLevel = 'Level 2 (Advanced)';
    readinessLevel = 'nearly_ready';
  } else if (score >= 70) {
    complianceLevel = 'Level 1 (Foundational)';
    readinessLevel = 'needs_improvement';
  }

  return {
    overallScore: score,
    complianceLevel,
    summary: generateAuditSummary(score, simulatedFindings, systemContext),
    keyFindings: simulatedFindings,
    strengths: generateStrengths(controlAssessments),
    gaps: generateGaps(controlAssessments, controlsToAudit),
    recommendations: generateRecommendations(simulatedFindings),
    readinessLevel,
  };
}

// ============== Helper Functions ==============

function buildSystemContext(
  assessment: SystemAssessment,
  responses?: Record<string, unknown>
): string {
  let context = `System: ${assessment.name}\n`;
  context += `Type: ${assessment.systemType}\n`;
  context += `Handles CUI: ${assessment.handlesCUI ? 'Yes' : 'No'}\n`;
  context += `Users: ${assessment.userCount !== undefined ? assessment.userCount : 'Unknown'}\n`;
  
  if (assessment.cloudProvider) {
    context += `Cloud Provider: ${assessment.cloudProvider}\n`;
  }
  
  if (responses) {
    context += '\nQuestionnaire Responses:\n';
    for (const [key, value] of Object.entries(responses)) {
      context += `- ${key}: ${JSON.stringify(value)}\n`;
    }
  }
  
  return context;
}

function determineApplicability(
  control: NISTControl,
  assessment: SystemAssessment,
  responses?: Record<string, unknown>
): { isApplicable: boolean; reason: string } {
  // Level 1 controls are always applicable if handling CUI
  if (control.cmmcLevel === 1 && assessment.handlesCUI) {
    return { isApplicable: true, reason: 'Baseline requirement for all CUI systems' };
  }

  // Check specific conditions based on control family and responses
  if (control.family === 'AC' && control.number.includes('3.1.12')) {
    // Remote access controls
    const hasRemoteAccess = responses?.['remote_access'] === true;
    return {
      isApplicable: hasRemoteAccess,
      reason: hasRemoteAccess 
        ? 'Remote access is enabled - this control is required'
        : 'No remote access configured - control not applicable',
    };
  }

  if (control.family === 'AC' && control.number.includes('3.1.14')) {
    // Wireless controls
    const hasWireless = responses?.['wireless_access'] === true;
    return {
      isApplicable: hasWireless,
      reason: hasWireless
        ? 'Wireless networks present - control is required'
        : 'No wireless networks - control not applicable',
    };
  }

  if (control.family === 'SC' && control.number.includes('3.13.5')) {
    // Network segmentation
    return {
      isApplicable: assessment.systemType !== 'contractor',
      reason: assessment.systemType !== 'contractor'
        ? 'In-house system requires network boundary protection'
        : 'Third-party managed system - verify with provider',
    };
  }

  // Default: applicable for Level 2+ if handling CUI
  if (assessment.handlesCUI && control.cmmcLevel <= 2) {
    return { isApplicable: true, reason: 'Required for CMMC Level 2 compliance' };
  }

  return { isApplicable: false, reason: 'Control above target CMMC level' };
}

function generateArtifactRecommendations(
  control: NISTControl,
  assessment: SystemAssessment
): string[] {
  const baseArtifacts = [...control.commonArtifacts];
  
  // Add context-specific artifacts
  if (assessment.systemType === 'cloud' || assessment.systemType === 'hybrid') {
    if (control.family === 'SC') {
      baseArtifacts.push('Cloud Security Configuration Documentation');
      baseArtifacts.push('Shared Responsibility Matrix');
    }
  }
  
  if (assessment.handlesCUI && control.family === 'AC') {
    baseArtifacts.push('CUI Access Audit Trail');
  }
  
  return baseArtifacts.slice(0, 6);
}

function generateImplementationGuidance(
  control: NISTControl,
  assessment: SystemAssessment
): string {
  let guidance = control.discussion + '\n\n';
  
  guidance += 'Key Implementation Steps:\n';
  guidance += `1. Review ${control.commonArtifacts[0] || 'policy documentation'}\n`;
  guidance += `2. Implement technical controls for ${control.title}\n`;
  guidance += `3. Test using ${control.testMethods.join(', ')} methods\n`;
  guidance += '4. Document evidence of implementation\n';
  
  if (assessment.systemType === 'cloud') {
    guidance += '\nCloud-specific Considerations:\n';
    guidance += '- Verify cloud provider compliance certifications\n';
    guidance += '- Document shared responsibility implementation\n';
  }
  
  return guidance;
}

function generateInterviewScript(control: NISTControl): string[] {
  return control.interviewQuestions.slice(0, 5);
}

function buildControlResponse(
  control: NISTControl,
  assessment: SystemAssessment,
  existingImplementation?: string
): string {
  let response = `[${control.id}] ${control.title}\n\n`;
  
  if (existingImplementation) {
    response += `Current Implementation:\n${existingImplementation}\n\n`;
    response += `Recommended Enhancements:\n`;
  } else {
    response += `Implementation Approach:\n`;
  }
  
  response += `1. ${control.discussion.substring(0, 200)}...\n\n`;
  response += `2. Implement the following controls:\n`;
  response += `   - ${control.commonArtifacts.slice(0, 3).join('\n   - ')}\n\n`;
  
  response += `3. Assessment Method:\n`;
  response += `   - ${control.testMethods.map(m => {
    switch(m) {
      case 'examine': return 'Examine relevant documentation and configurations';
      case 'interview': return 'Interview ' + control.potentialAssessors.join(', ');
      case 'test': return 'Test control implementation';
      default: return m;
    }
  }).join('\n   - ')}\n`;
  
  return response;
}

function generateRiskAnalysis(
  finding: Finding,
  control: NISTControl | undefined,
  assessment: SystemAssessment
): string {
  let analysis = `Finding: ${finding.title}\n`;
  analysis += `Severity: ${finding.severity.toUpperCase()}\n\n`;
  
  if (control) {
    analysis += `Control Family: ${control.family} - ${control.title}\n`;
    analysis += `This control is designed to: ${control.description.substring(0, 150)}...\n\n`;
  }
  
  analysis += `Risk Implications:\n`;
  
  switch(finding.severity) {
    case 'critical':
      analysis += '- Critical exposure of CUI to unauthorized access\n';
      analysis += '- High probability of compliance failure\n';
      analysis += '- Potential for data breach or exfiltration\n';
      break;
    case 'high':
      analysis += '- Significant control weakness identified\n';
      analysis += '- Elevated risk of security incident\n';
      analysis += '- May impact CMMC certification\n';
      break;
    case 'medium':
      analysis += '- Moderate control deficiency\n';
      analysis += '- Should be addressed in near term\n';
      break;
    case 'low':
      analysis += '- Minor control gap\n';
      analysis += '- Address as resources permit\n';
      break;
  }
  
  return analysis;
}

function generateRemediationSteps(
  finding: Finding,
  control: NISTControl | undefined
): string[] {
  const steps: string[] = [];
  
  if (control) {
    steps.push(`Review and implement ${control.title}`);
    steps.push(`Develop or update ${control.commonArtifacts[0] || 'required documentation'}`);
    
    if (control.testMethods.includes('interview')) {
      steps.push(`Train relevant personnel on control requirements`);
    }
    
    steps.push(`Implement technical controls as specified`);
    steps.push(`Test control effectiveness`);
    steps.push(`Document implementation evidence`);
    steps.push(`Schedule follow-up assessment`);
  } else {
    steps.push('Review control requirements');
    steps.push('Develop remediation plan');
    steps.push('Implement required controls');
    steps.push('Verify control effectiveness');
  }
  
  return steps.slice(0, 6);
}

function estimateEffort(severity: string): string {
  switch(severity) {
    case 'critical': return '2-4 weeks';
    case 'high': return '1-2 weeks';
    case 'medium': return '3-7 days';
    case 'low': return '1-3 days';
    default: return 'Unknown';
  }
}

function generateResourceRequirements(
  finding: Finding,
  control: NISTControl | undefined
): string[] {
  const resources: string[] = [];
  
  if (control) {
    resources.push(...control.potentialAssessors.map(a => `${a} time`));
  }
  
  resources.push('Security documentation review');
  resources.push('Technical implementation resources');
  resources.push('Testing and validation time');
  
  return resources.slice(0, 5);
}

function generateCorrectiveAction(
  finding: Finding,
  control: NISTControl | undefined
): string {
  if (!control) {
    return `Address finding: ${finding.title}. Implement required security controls to remediate the identified deficiency.`;
  }
  
  return `Implement ${control.title} (${control.id}). ${control.description} Develop required documentation including: ${control.commonArtifacts.slice(0, 3).join(', ')}. Validate implementation through ${control.testMethods.join(', ')}.`;
}

function generateMilestones(
  finding: Finding,
  control: NISTControl | undefined
): Array<{ description: string; duration: string }> {
  return [
    { description: 'Initial assessment and planning', duration: '2-3 days' },
    { description: 'Policy/procedure development', duration: '3-5 days' },
    { description: 'Technical implementation', duration: finding.severity === 'critical' ? '1-2 weeks' : '3-7 days' },
    { description: 'Testing and validation', duration: '2-3 days' },
    { description: 'Documentation and evidence collection', duration: '2-3 days' },
  ];
}

function calculateCompletionDate(severity: string): string {
  const now = new Date();
  const days = severity === 'critical' ? 30 : severity === 'high' ? 45 : severity === 'medium' ? 60 : 90;
  const completion = new Date(now.setDate(now.getDate() + days));
  return completion.toISOString().split('T')[0];
}

function simulateAuditFindings(
  assessments: ControlAssessment[],
  scopeControls: string[]
): AIPreAuditResult['keyFindings'] {
  const findings: AIPreAuditResult['keyFindings'] = [];
  
  // Simulate findings based on control gaps
  for (const assessment of assessments) {
    if (!scopeControls.includes(assessment.controlId)) continue;
    
    if (assessment.status === 'not_implemented' || assessment.status === 'partially_implemented') {
      const control = getControlById(assessment.controlId);
      if (!control) continue;
      
      let severity: 'critical' | 'high' | 'medium' | 'low' = 'medium';
      if (control.cmmcLevel === 1) severity = 'high';
      if (control.family === 'AC' || control.family === 'IA') severity = 'critical';
      
      findings.push({
        controlId: assessment.controlId,
        severity,
        finding: `${control.title} is ${assessment.status.replace('_', ' ')}`,
        recommendation: `Implement ${control.title} with required documentation: ${control.commonArtifacts[0]}`,
      });
    }
  }
  
  return findings.slice(0, 10); // Limit to top 10 findings
}

function generateAuditSummary(
  score: number,
  findings: AIPreAuditResult['keyFindings'],
  assessment: SystemAssessment
): string {
  let summary = `Pre-audit assessment for ${assessment.name} shows an overall compliance score of ${score}%. `;
  
  if (findings.length === 0) {
    summary += 'No significant findings identified. System appears to be well-controlled.';
  } else {
    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    const highCount = findings.filter(f => f.severity === 'high').length;
    
    summary += `Identified ${findings.length} findings requiring attention: `;
    if (criticalCount > 0) summary += `${criticalCount} critical, `;
    if (highCount > 0) summary += `${highCount} high priority. `;
    
    summary += 'Address these findings before formal assessment to improve compliance posture.';
  }
  
  return summary;
}

function generateStrengths(assessments: ControlAssessment[]): string[] {
  const implemented = assessments.filter(a => a.status === 'implemented');
  const strengths: string[] = [];
  
  if (implemented.length > 0) {
    const families = new Set(implemented.map(a => a.controlId.split('.')[0]));
    if (families.has('AC')) strengths.push('Strong access control implementation');
    if (families.has('AU')) strengths.push('Comprehensive audit logging');
    if (families.has('SC')) strengths.push('Robust system protection controls');
  }
  
  if (strengths.length === 0) {
    strengths.push('Assessment baseline established');
    strengths.push('Documentation framework in place');
  }
  
  return strengths.slice(0, 3);
}

function generateGaps(assessments: ControlAssessment[], scopeControls: string[]): string[] {
  const gaps: string[] = [];
  
  const notImplemented = assessments.filter(
    a => scopeControls.includes(a.controlId) && 
    (a.status === 'not_implemented' || a.status === 'partially_implemented')
  );
  
  const byFamily: Record<string, number> = {};
  for (const assessment of notImplemented) {
    const family = assessment.controlId.split('.')[0];
    byFamily[family] = (byFamily[family] || 0) + 1;
  }
  
  for (const [family, count] of Object.entries(byFamily)) {
    if (count > 2) {
      gaps.push(`${family} family has ${count} controls requiring implementation`);
    }
  }
  
  if (gaps.length === 0 && notImplemented.length > 0) {
    gaps.push(`${notImplemented.length} individual controls need attention`);
  }
  
  return gaps.slice(0, 3);
}

function generateRecommendations(findings: AIPreAuditResult['keyFindings']): string[] {
  const recommendations: string[] = [];
  
  const criticalFindings = findings.filter(f => f.severity === 'critical');
  if (criticalFindings.length > 0) {
    recommendations.push(`Prioritize ${criticalFindings.length} critical findings for immediate remediation`);
  }
  
  recommendations.push('Develop POAMs for all identified findings');
  recommendations.push('Schedule regular control testing and validation');
  recommendations.push('Ensure evidence collection for implemented controls');
  
  return recommendations;
}

/**
 * Generate system prompt for AI Pre-Auditor Agent
 */
export function generatePreAuditorSystemPrompt(): string {
  return `You are an expert NIST SP 800-171 assessor and CMMC certified professional with 15+ years of experience in DoD contractor cybersecurity assessments.

YOUR ROLE:
- Perform pre-assessment audits of contractor systems
- Identify control gaps and compliance deficiencies
- Provide actionable remediation guidance
- Simulate formal CMMC assessment conditions

ASSESSMENT METHODOLOGY:
1. Use the NIST SP 800-171 Rev 3 assessment procedures
2. Apply CMMC Level 2 requirements as baseline
3. Use test methods: Examine, Interview, Test
4. Rate findings as: Satisfied, Partially Satisfied, or Not Satisfied

CONTROL EVALUATION CRITERIA:
- Satisfied: Control is fully implemented and operating effectively
- Partially Satisfied: Control is implemented but has deficiencies
- Not Satisfied: Control is not implemented or ineffective

FINDING SEVERITY LEVELS:
- Critical: Immediate risk to CUI confidentiality/integrity
- High: Significant control weakness requiring prompt attention  
- Medium: Control deficiency requiring remediation
- Low: Minor gap to address as resources permit

ARTIFACT REVIEW:
- Verify policies exist and are current
- Confirm procedures are documented and followed
- Validate technical configurations match baselines
- Interview personnel to verify understanding

OUTPUT FORMAT:
Provide structured assessment results including:
1. Overall compliance score (0-100%)
2. CMMC level readiness
3. Detailed findings by control
4. Risk-based recommendations
5. Remediation timeline guidance

Be thorough, objective, and practical in your assessment approach.`;
}

/**
 * Generate system prompt for Control Response Assistant
 */
export function generateResponseAssistantPrompt(): string {
  return `You are an expert NIST 800-171 compliance writer specializing in control implementation descriptions for DoD contractors.

YOUR ROLE:
- Write clear, comprehensive control implementation descriptions
- Provide specific, actionable implementation guidance
- Ensure responses address all assessment objectives
- Use professional language suitable for assessor review

WRITING GUIDELINES:
1. Start with a clear statement of how the control is implemented
2. Describe specific technologies, processes, or procedures used
3. Include scope (what systems, locations, personnel are covered)
4. Reference specific policies, procedures, or configurations
5. Address how the control is monitored and maintained

STRUCTURE EACH RESPONSE WITH:
- Implementation Statement: How the control requirement is met
- Technical Implementation: Specific tools/configurations used
- Procedural Implementation: Processes and procedures in place
- Scope: What is covered by this control implementation
- Evidence: What artifacts demonstrate implementation

AVOID:
- Vague statements like "we have a policy"
- References to future implementation
- Unclear or ambiguous language
- Copy-paste from control descriptions

FOCUS ON:
- What IS currently implemented
- Specific configuration details
- Who is responsible
- How effectiveness is verified

Write responses that would satisfy a CMMC assessor's examination.`;
}

/**
 * Generate system prompt for Artifact Recommendation Assistant  
 */
export function generateArtifactAssistantPrompt(): string {
  return `You are a CMMC artifact specialist helping contractors identify and prepare evidence for NIST 800-171 control assessments.

YOUR ROLE:
- Recommend specific artifacts that validate control implementation
- Describe what assessors look for in each artifact type
- Suggest artifact format and content
- Help prioritize artifact collection efforts

ARTIFACT TYPES:
- Policies: Formal documents stating organizational requirements
- Procedures: Step-by-step instructions for performing tasks
- Configurations: System settings and security baselines
- Logs: Audit trails and monitoring records
- Screenshots: Visual evidence of configurations
- Documents: Standards, diagrams, inventories
- Records: Evidence of activities performed

FOR EACH ARTIFACT RECOMMENDATION:
1. Specify exact artifact name/type
2. Describe required content/elements
3. Identify responsible party for creating it
4. Suggested format (document, screenshot, export)
5. Where it should be stored

QUALITY CRITERIA:
- Artifacts must be current (not outdated)
- Must directly relate to the control being assessed
- Should show actual implementation, not just intent
- Must be complete (not partial or draft)
- Should be organized and easily retrievable

Help contractors present a complete, organized body of evidence that demonstrates their security posture.`;
}
