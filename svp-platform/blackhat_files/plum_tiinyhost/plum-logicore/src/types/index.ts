export interface Vulnerability {
  id: string;
  type: 'deficiency' | 'weakness' | 'compliance' | 'evidence';
  title: string;
  description: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  lens: string;
  evaluatorComment?: EvaluatorComment;
}

export interface EvaluatorComment {
  name: string;
  role: string;
  quote: string;
}

export interface KillShot {
  id: string;
  num: string;
  title: string;
  description: string;
  impact: string;
}

export interface ComplianceItem {
  name: string;
  status: 'fail' | 'warn' | 'pass' | 'na';
}

export interface ScoreFactor {
  name: string;
  current: number;
  max: number;
  tag: string;
  tagColor: 'red' | 'amber' | 'cyan' | 'green' | 'purple';
}

export interface NavItem {
  id: string;
  label: string;
  badge: string;
  badgeColor: 'red' | 'amber' | 'cyan' | 'green';
  critical?: boolean;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}
