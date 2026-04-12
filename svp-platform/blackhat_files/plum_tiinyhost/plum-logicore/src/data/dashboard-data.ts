import { Vulnerability, KillShot, ComplianceItem, ScoreFactor, NavItem } from '@/types';

export const navItems: NavItem[] = [
  { id: 'kill-shots', label: 'Kill Shots', badge: '3', badgeColor: 'red', critical: true },
  { id: 'deficiency', label: 'Deficiency Flags', badge: '4', badgeColor: 'red', critical: true },
  { id: 'weakness', label: 'Weakness Exposure', badge: '7', badgeColor: 'amber' },
  { id: 'compliance', label: 'Compliance Gaps', badge: '5', badgeColor: 'amber' },
  { id: 'evidence', label: 'Evidence Gaps', badge: '6', badgeColor: 'cyan' },
  { id: 'sow', label: 'Unenforceable SOW', badge: '3', badgeColor: 'amber' },
  { id: 'price', label: 'Price Risk', badge: '2', badgeColor: 'cyan' },
  { id: 'performance', label: 'Past Performance', badge: 'Clean', badgeColor: 'green' },
];

export const evaluatorLenses: NavItem[] = [
  { id: 'technical', label: 'Technical SME', badge: '9 flags', badgeColor: 'red' },
  { id: 'contracting', label: 'Contracting Officer', badge: '8 flags', badgeColor: 'amber' },
  { id: 'sseb', label: 'SSEB Chair View', badge: 'Aligned', badgeColor: 'cyan' },
];

export const killShots: KillShot[] = [
  {
    id: 'ks-001',
    num: '// KS-001',
    title: 'Zero Trust / OT Latency Contradiction',
    description: 'ZTA architecture as written violates NFPA 72 latency requirements. Authentication overhead undefined for BACnet/Modbus environments. Evaluator will find this unworkable in life-safety context.',
    impact: 'IMPACT: SIGNIFICANT WEAKNESS → DEFICIENCY',
  },
  {
    id: 'ks-002',
    num: '// KS-002',
    title: 'IEC 62443 Absent From Compliance Map',
    description: 'OT-specific security standard not cited. NIST 800-82 name-dropped without zone/conduit architecture mapping. Technical SME evaluator will cite this as a fundamental OT security knowledge gap.',
    impact: 'IMPACT: SIGNIFICANT WEAKNESS — SCORING BLOCKED',
  },
  {
    id: 'ks-003',
    num: '// KS-003',
    title: 'Past Performance Scope Mismatch',
    description: 'Cited contracts are IT cybersecurity engagements relabeled as OT-relevant. No demonstrated fire system C2 or life-safety OT environment. CPARS POC calls will expose this discrepancy.',
    impact: 'IMPACT: PP VOLUME SCORING COLLAPSE',
  },
];

export const vulnerabilities: Vulnerability[] = [
  {
    id: 'RT-001',
    type: 'deficiency',
    title: 'COOP Plan Fails Life-Safety Bypass Test',
    description: 'No fail-safe bypass defined for cybersecurity layer failure during active suppression event',
    impact: 'critical',
    lens: 'Technical SME',
    evaluatorComment: {
      name: 'Dr. Marcus Webb — OT Systems Evaluator, GS-15',
      role: 'OT Systems Evaluator, GS-15',
      quote: 'This is a fundamental systems engineering failure, not a documentation oversight. If your cybersecurity layer can physically block suppression activation during an active fire event — and this proposal provides zero architectural evidence that it cannot — you have not designed a security solution. You have designed a liability. I have been evaluating OT proposals for eleven years. This is the kind of omission that gets people fired AND gets buildings burned down. I am marking this as a Deficiency, not a Weakness. The offeror has not demonstrated basic understanding of the operating environment.',
    },
  },
  {
    id: 'RT-002',
    type: 'deficiency',
    title: 'EDR on PLC — Unvalidated Capability Claim',
    description: 'Endpoint Detection on embedded fire system controllers asserted without processing overhead analysis or hardware validation',
    impact: 'critical',
    lens: 'Technical SME',
    evaluatorComment: {
      name: 'Col. (Ret.) Sandra Okafor — Cybersecurity Architecture SME',
      role: 'Cybersecurity Architecture SME',
      quote: 'EDR on a PLC. I need a moment. These controllers run on 256MB RAM executing real-time deterministic firmware. You cannot install a CrowdStrike agent on a Siemens S7-300 and call it endpoint detection. Either this team has never touched an actual OT environment, or they copy-pasted an IT security architecture and changed the headers. Neither is acceptable. I have no idea what they think they are deploying here, but whatever it is, it is not what they wrote. Marked Deficiency. Do not advance this section.',
    },
  },
  {
    id: 'RT-003',
    type: 'compliance',
    title: 'RMF / DODI 8510.01 Not Addressed for OT System',
    description: 'Authorization boundary for fire system C2 not defined. ATO pathway absent. Evaluator will treat as compliance gap.',
    impact: 'critical',
    lens: 'Both',
    evaluatorComment: {
      name: 'Patricia Nguyen — Contracting Officer, ISSM Liaison',
      role: 'Contracting Officer, ISSM Liaison',
      quote: 'The RMF authorization boundary is not defined anywhere in this document. Anywhere. I read it twice. Who is the AO? What is the boundary? Is this going to require an ATO, an IATT, or does the offeror think it is somehow exempt? They never say. DoD 8510.01 has been in effect since 2014. This is not new. If your cybersecurity team does not know they need an authorization boundary statement for a networked fire system C2 platform, I do not trust them to secure one. Automatic compliance gap finding. I am escalating to the PCO.',
    },
  },
  {
    id: 'RT-004',
    type: 'weakness',
    title: 'Passive Monitoring: Product Drop Without Architecture',
    description: 'OT network monitoring tools named (Dragos, Armis) without sensor placement topology or protocol coverage for BACnet/Modbus',
    impact: 'high',
    lens: 'Technical SME',
    evaluatorComment: {
      name: 'Dr. Marcus Webb — OT Systems Evaluator, GS-15',
      role: 'OT Systems Evaluator, GS-15',
      quote: 'Congratulations. You listed two product names. Dragos. Armis. That is it. Where are the sensors going? How many span ports? What switch TAPs? What protocol decoders handle BACnet/IP versus BACnet MS/TP versus Modbus RTU? Do you know those are different things? Because this proposal treats them identically. You have done a vendor logo drop and called it an architecture. I have seen more technical depth on a product brochure. Weakness. Borderline Significant Weakness.',
    },
  },
  {
    id: 'RT-005',
    type: 'weakness',
    title: 'SOW: "Assist With" / "Coordinate With" Language',
    description: 'Three deliverables use unenforceable effort verbs. No measurable acceptance criteria. CPARS exploitation risk.',
    impact: 'high',
    lens: 'Contracting Officer',
    evaluatorComment: {
      name: 'Patricia Nguyen — Contracting Officer, ISSM Liaison',
      role: 'Contracting Officer, ISSM Liaison',
      quote: 'Assist with implementation. Coordinate with the Government on configuration. Support remediation activities. Do you know what those phrases mean from a contract enforcement standpoint? Nothing. Absolutely nothing. I cannot write a CPARS narrative against assist with. I cannot issue a cure notice against coordinate with. A contractor could show up, send two emails, and technically satisfy these deliverables. This is not a SOW — it is a liability transfer document in a proposal costume. Fix every effort verb or the entire PWS response gets flagged Unacceptable.',
    },
  },
  {
    id: 'RT-006',
    type: 'evidence',
    title: 'Security Posture Improvement Metric: No Baseline',
    description: '"40% reduction in attack surface" — baseline undefined, methodology absent, measurement framework missing',
    impact: 'high',
    lens: 'Technical SME',
    evaluatorComment: {
      name: 'Col. (Ret.) Sandra Okafor — Cybersecurity Architecture SME',
      role: 'Cybersecurity Architecture SME',
      quote: 'Forty percent reduction. Forty. Percent. From what? Measured how? By whom? Over what time horizon? Against which MITRE ATT&CK for ICS techniques? You invented a number and put it in a federal proposal. This is not a discriminator — it is a fabrication. I want a baseline assessment methodology, an ICS threat mapping, and a measurable reduction framework, or this number gets deleted entirely. Made-up metrics do not impress evaluators. They infuriate us. Because we have to explain to the SSA why we credited a claim with zero evidentiary basis. We do not. We mark it unsupported and move on.',
    },
  },
  {
    id: 'RT-007',
    type: 'compliance',
    title: 'CMMC Level Claimed — CUI Scope Not Established',
    description: 'Fire system C2 data classification not confirmed as CUI. CMMC claim may be inapplicable or misleading.',
    impact: 'medium',
    lens: 'Contracting Officer',
    evaluatorComment: {
      name: 'Patricia Nguyen — Contracting Officer, ISSM Liaison',
      role: 'Contracting Officer, ISSM Liaison',
      quote: 'CMMC Level 2 compliance claimed. Does anyone on this team know what CUI actually is? Fire system activation commands and suppression schedules are not automatically CUI. That determination requires a data flow analysis and a CUI registry review. You skipped that entire step and stamped CMMC Level 2 on it like a participation trophy. If the data is NOT CUI, you just proposed a compliance framework that does not apply and will waste Government money on unnecessary controls. If it IS CUI, you have not proven it. Either way, this is wrong.',
    },
  },
];

export const complianceItems: ComplianceItem[] = [
  { name: 'IEC 62443', status: 'fail' },
  { name: 'NIST SP 800-82', status: 'warn' },
  { name: 'DODI 8510.01 / RMF', status: 'fail' },
  { name: 'NFPA 72 / 2001', status: 'warn' },
  { name: 'MITRE ATT&CK ICS', status: 'warn' },
  { name: 'NIST CSF', status: 'pass' },
  { name: 'EO 13636 / CISA', status: 'fail' },
];

export const scoreFactors: ScoreFactor[] = [
  { name: 'Technical Approach', current: 52, max: 100, tag: 'ACCEPTABLE', tagColor: 'amber' },
  { name: 'Management / Staffing', current: 71, max: 100, tag: 'GOOD', tagColor: 'cyan' },
  { name: 'Risk Mitigation', current: 38, max: 100, tag: 'MARGINAL', tagColor: 'red' },
  { name: 'Past Performance', current: 55, max: 100, tag: 'ACCEPTABLE', tagColor: 'amber' },
  { name: 'Affordability / Price', current: 66, max: 100, tag: 'GOOD', tagColor: 'green' },
  { name: 'OT Compliance Proof', current: 31, max: 100, tag: 'MARGINAL', tagColor: 'red' },
];

export const miniScores = {
  technical: { value: 52, color: 'amber' as const },
  management: { value: 71, color: 'cyan' as const },
  risk: { value: 38, color: 'red' as const },
  affordability: { value: 66, color: 'green' as const },
};

export const scoringRing = {
  value: 58,
  label: 'CEILING',
  sublabel: 'Acceptable Risk',
};
