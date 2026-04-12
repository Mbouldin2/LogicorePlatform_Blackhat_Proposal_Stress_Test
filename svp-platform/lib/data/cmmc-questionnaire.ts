import { AssessmentQuestion } from "@/lib/types/cmmc";

/**
 * Initial System Discovery Questions
 * These help determine the scope and basic characteristics of the system
 */
export const SYSTEM_DISCOVERY_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "system_type",
    category: "System Characteristics",
    question: "What type of system environment do you have?",
    questionType: "multiple_choice",
    options: [
      "On-premise only (local servers, workstations)",
      "Cloud only (AWS, Azure, GCP, etc.)",
      "Hybrid (mix of on-premise and cloud)",
      "Contractor/Third-party managed"
    ],
    helpText: "This helps determine which controls are applicable based on system architecture",
    applicableControls: ["AC.L2-3.1.3", "SC.L2-3.13.5", "SA.L2-3.15.6"],
    weight: 1.0
  },
  {
    id: "handles_cui",
    category: "Data Classification",
    question: "Does your system process, store, or transmit Controlled Unclassified Information (CUI)?",
    questionType: "boolean",
    helpText: "CUI includes defense information, export-controlled data, privacy data, and other categories defined by NARA",
    applicableControls: [
      "AC.L1-3.1.1", "AC.L1-3.1.2", "AC.L1-3.1.20", "SC.L1-3.13.11"
    ],
    weight: 1.0
  },
  {
    id: "cui_categories",
    category: "Data Classification",
    question: "What categories of CUI do you handle? (Select all that apply)",
    questionType: "multi_select",
    options: [
      "Defense Information (CDI/CTI)",
      "Export Controlled (ITAR/EAR)",
      "Critical Infrastructure",
      "Financial/Banking",
      "Healthcare/Privacy (HIPAA)",
      "Law Enforcement",
      "Immigration",
      "Proprietary Business Information",
      "General CUI (no specific category)"
    ],
    helpText: "Different CUI categories may have additional specific requirements",
    applicableControls: ["MP.L1-3.8.3", "SC.L2-3.13.5"],
    weight: 0.8
  },
  {
    id: "system_owner",
    category: "Roles and Responsibilities",
    question: "Who is the designated System Owner or Authorizing Official?",
    questionType: "text",
    helpText: "The person responsible for the overall operation and security of the system",
    applicableControls: ["PS.L2-3.9.2", "RA.L2-3.11.1"],
    weight: 0.6
  },
  {
    id: "security_officer",
    category: "Roles and Responsibilities",
    question: "Do you have a designated Information System Security Officer (ISSO) or Security Officer?",
    questionType: "boolean",
    helpText: "Required for managing the security program and coordinating with assessors",
    applicableControls: ["PS.L2-3.9.2", "AT.L2-3.2.2"],
    weight: 0.8
  },
  {
    id: "user_count",
    category: "System Scale",
    question: "Approximately how many users access systems that handle CUI?",
    questionType: "multiple_choice",
    options: [
      "1-10 users",
      "11-50 users",
      "51-250 users",
      "251-1000 users",
      "More than 1000 users"
    ],
    helpText: "Scale affects the complexity of access control and training requirements",
    applicableControls: ["AT.L1-3.2.1", "AT.L2-3.2.2", "AC.L2-3.1.5"],
    weight: 0.5
  },
  {
    id: "network_diagram",
    category: "Documentation",
    question: "Do you have current network diagrams that show all systems processing CUI?",
    questionType: "boolean",
    helpText: "Network diagrams are essential for understanding data flows and boundary protection",
    applicableControls: ["SC.L2-3.13.5", "CA.L2-3.12.1", "RA.L2-3.11.1"],
    weight: 0.9
  }
];

/**
 * Access Control Questions
 */
export const ACCESS_CONTROL_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "logical_access",
    category: "Access Control",
    question: "Do you have documented logical access control policies and procedures?",
    questionType: "boolean",
    helpText: "Policies should define who can access what, and under what circumstances",
    applicableControls: ["AC.L1-3.1.1", "AC.L1-3.1.2", "AC.L2-3.1.5"],
    weight: 1.0
  },
  {
    id: "user_accounts",
    category: "Access Control",
    question: "How do you manage user accounts and access requests?",
    questionType: "multiple_choice",
    options: [
      "Manual process (email/paper forms)",
      "Ticket-based system (ServiceNow, Jira, etc.)",
      "Automated workflow with approvals",
      "Identity Management System (Active Directory, Okta, etc.)",
      "No formal process"
    ],
    helpText: "Formal access management is required for all CMMC levels",
    applicableControls: ["AC.L1-3.1.1", "AC.L2-3.1.5", "IA.L1-3.5.1"],
    weight: 1.0
  },
  {
    id: "least_privilege",
    category: "Access Control",
    question: "Do you implement least privilege (users only have access necessary for their job)?",
    questionType: "boolean",
    helpText: "Least privilege is a core security principle for protecting CUI",
    applicableControls: ["AC.L2-3.1.5", "AC.L2-3.1.6", "AC.L2-3.1.7"],
    weight: 1.0
  },
  {
    id: "privileged_accounts",
    category: "Access Control",
    question: "How are privileged/administrator accounts managed?",
    questionType: "multi_select",
    options: [
      "Separate privileged accounts from regular user accounts",
      "Multi-factor authentication required",
      "Just-in-time (JIT) elevation used",
      "Privileged Access Management (PAM) solution deployed",
      "Regular review of privileged access",
      "No special management (same as regular users)"
    ],
    helpText: "Privileged accounts require additional security controls",
    applicableControls: ["AC.L2-3.1.5", "AC.L2-3.1.6", "AC.L2-3.1.7", "IA.L2-3.5.11"],
    weight: 1.0
  },
  {
    id: "session_lock",
    category: "Access Control",
    question: "Do systems automatically lock after a period of inactivity?",
    questionType: "multiple_choice",
    options: [
      "Yes, within 15 minutes",
      "Yes, within 30 minutes",
      "Yes, but longer than 30 minutes",
      "No, users must manually lock",
      "No policy in place"
    ],
    helpText: "Session locks prevent unauthorized access to unattended workstations",
    applicableControls: ["AC.L2-3.1.10", "AC.L2-3.1.11"],
    weight: 0.9
  },
  {
    id: "remote_access",
    category: "Access Control",
    question: "Do users access CUI systems remotely (from outside the office)?",
    questionType: "boolean",
    helpText: "Remote access requires additional security controls like VPN and MFA",
    applicableControls: ["AC.L2-3.1.12", "AC.L2-3.1.13", "SC.L2-3.13.6", "IA.L2-3.5.3"],
    weight: 0.9
  },
  {
    id: "remote_access_controls",
    category: "Access Control",
    question: "If yes, what remote access controls are in place? (Select all that apply)",
    questionType: "multi_select",
    options: [
      "VPN required for all remote access",
      "Multi-factor authentication (MFA) for remote access",
      "Privileged session monitoring/recording",
      "Remote access limited to specific IP ranges",
      "Separate remote access approval process",
      "Remote desktop gateway or jump server",
      "No additional controls"
    ],
    helpText: "Remote access must be strictly controlled and monitored",
    applicableControls: ["AC.L2-3.1.12", "AC.L2-3.1.13", "SC.L2-3.13.6"],
    weight: 0.9
  },
  {
    id: "wireless_access",
    category: "Access Control",
    question: "Do you have wireless networks that can access CUI systems?",
    questionType: "boolean",
    helpText: "Wireless networks require encryption and access controls",
    applicableControls: ["AC.L2-3.1.14", "AC.L2-3.1.15", "SC.L2-3.13.11"],
    weight: 0.8
  },
  {
    id: "mobile_devices",
    category: "Access Control",
    question: "Do employees use mobile devices (laptops, tablets, smartphones) to access CUI?",
    questionType: "boolean",
    helpText: "Mobile devices require encryption and mobile device management",
    applicableControls: ["AC.L1-3.1.20", "AC.L2-3.1.16", "AC.L2-3.1.19", "MP.L1-3.8.6"],
    weight: 0.9
  },
  {
    id: "mobile_device_management",
    category: "Access Control",
    question: "If yes, what mobile device controls are in place? (Select all that apply)",
    questionType: "multi_select",
    options: [
      "Full disk encryption on all devices",
      "Mobile Device Management (MDM) solution",
      "Remote wipe capability",
      "Device registration required",
      "Security configuration enforcement",
      "Containerization for CUI data",
      "No specific controls"
    ],
    helpText: "Mobile devices storing or accessing CUI must be properly secured",
    applicableControls: ["AC.L1-3.1.20", "AC.L2-3.1.16", "AC.L2-3.1.19", "SC.L1-3.13.11"],
    weight: 0.9
  }
];

/**
 * Authentication Questions
 */
export const AUTHENTICATION_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "mfa_enabled",
    category: "Authentication",
    question: "Is Multi-Factor Authentication (MFA) required for all users accessing CUI?",
    questionType: "multiple_choice",
    options: [
      "Yes, for all users and all access methods",
      "Yes, for remote access only",
      "Yes, for privileged accounts only",
      "No, passwords only",
      "Partially implemented"
    ],
    helpText: "MFA is required for remote access and local access to CUI at CMMC Level 2+",
    applicableControls: ["IA.L1-3.5.1", "IA.L2-3.5.2", "IA.L2-3.5.3", "IA.L2-3.5.11"],
    weight: 1.0
  },
  {
    id: "password_policy",
    category: "Authentication",
    question: "What password requirements are enforced? (Select all that apply)",
    questionType: "multi_select",
    options: [
      "Minimum length (8+ characters)",
      "Complexity requirements (upper, lower, number, special)",
      "Password history prevents reuse",
      "Maximum age/password expiration",
      "Account lockout after failed attempts",
      "None of the above"
    ],
    helpText: "Strong password policies are required for all accounts",
    applicableControls: ["IA.L2-3.5.7", "IA.L2-3.5.8", "AC.L2-3.1.8"],
    weight: 0.9
  },
  {
    id: "account_lockout",
    category: "Authentication",
    question: "Are accounts locked after failed login attempts?",
    questionType: "multiple_choice",
    options: [
      "Yes, 3-5 failed attempts",
      "Yes, 6-10 failed attempts",
      "Yes, more than 10 attempts",
      "No lockout policy",
      "Not sure"
    ],
    helpText: "Account lockout protects against brute force password attacks",
    applicableControls: ["IA.L2-3.5.7", "AC.L2-3.1.8"],
    weight: 0.8
  }
];

/**
 * Audit and Logging Questions
 */
export const AUDIT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "audit_logging",
    category: "Audit",
    question: "Do you have audit logging enabled on systems processing CUI?",
    questionType: "boolean",
    helpText: "Audit logs are required for monitoring and investigating security events",
    applicableControls: ["AU.L2-3.3.1", "AU.L2-3.3.2", "AU.L2-3.3.6"],
    weight: 1.0
  },
  {
    id: "logged_events",
    category: "Audit",
    question: "What events are logged? (Select all that apply)",
    questionType: "multi_select",
    options: [
      "Successful and failed logins",
      "File and object access",
      "Privilege escalation/administrative actions",
      "Security configuration changes",
      "CUI access and modifications",
      "Audit log access",
      "Not sure / No specific configuration"
    ],
    helpText: "Comprehensive event logging is required for security monitoring",
    applicableControls: ["AU.L2-3.3.1", "AU.L2-3.3.2", "AU.L2-3.3.6"],
    weight: 0.9
  },
  {
    id: "log_review",
    category: "Audit",
    question: "How are audit logs reviewed?",
    questionType: "multiple_choice",
    options: [
      "Automated SIEM with real-time alerting",
      "Daily manual review",
      "Weekly manual review",
      "Monthly or less frequent review",
      "Logs are collected but not regularly reviewed",
      "No log review process"
    ],
    helpText: "Regular log review is required to detect security incidents",
    applicableControls: ["AU.L2-3.3.3", "AU.L2-3.3.5", "IR.L2-3.6.1"],
    weight: 0.9
  },
  {
    id: "log_protection",
    category: "Audit",
    question: "How are audit logs protected from tampering and deletion?",
    questionType: "multi_select",
    options: [
      "Logs stored on separate, hardened system",
      "Write-once media or immutable storage",
      "Encrypted log storage",
      "Access controls restrict log modification",
      "Digital signatures or hashing",
      "Cloud-based tamper-resistant storage",
      "No specific protections"
    ],
    helpText: "Audit logs must be protected to ensure integrity for investigations",
    applicableControls: ["AU.L2-3.3.6", "AU.L2-3.3.9"],
    weight: 0.9
  },
  {
    id: "log_retention",
    category: "Audit",
    question: "How long are audit logs retained?",
    questionType: "multiple_choice",
    options: [
      "1 year or more",
      "6-12 months",
      "3-6 months",
      "Less than 3 months",
      "No defined retention period"
    ],
    helpText: "CMMC requires audit log retention to support investigations and compliance",
    applicableControls: ["AU.L2-3.3.1", "AU.L2-3.3.8"],
    weight: 0.8
  }
];

/**
 * Configuration Management Questions
 */
export const CONFIGURATION_MANAGEMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "baseline_configurations",
    category: "Configuration Management",
    question: "Do you have established security configuration baselines for systems?",
    questionType: "boolean",
    helpText: "Security baselines (e.g., CIS benchmarks, DISA STIGs) define hardened configurations",
    applicableControls: ["CM.L2-3.4.1", "CM.L2-3.4.2"],
    weight: 1.0
  },
  {
    id: "config_baseline_source",
    category: "Configuration Management",
    question: "If yes, what standards do your baselines follow? (Select all that apply)",
    questionType: "multi_select",
    options: [
      "CIS Benchmarks",
      "DISA STIGs",
      "NIST SP 800-53",
      "Vendor hardening guides",
      "Internally developed standards",
      "No specific standards"
    ],
    helpText: "Industry-standard baselines provide proven security configurations",
    applicableControls: ["CM.L2-3.4.1", "CM.L2-3.4.2"],
    weight: 0.8
  },
  {
    id: "change_management",
    category: "Configuration Management",
    question: "Do you have a formal change management process?",
    questionType: "boolean",
    helpText: "Changes to systems must be planned, tested, approved, and documented",
    applicableControls: ["CM.L2-3.4.5", "CM.L2-3.4.6", "CM.L3-3.4.8"],
    weight: 1.0
  },
  {
    id: "change_approval",
    category: "Configuration Management",
    question: "If yes, how are changes approved?",
    questionType: "multiple_choice",
    options: [
      "Change Advisory Board (CAB)",
      "Security review required",
      "Management approval",
      "Peer review only",
      "No formal approval process"
    ],
    helpText: "Security-relevant changes should require security review and approval",
    applicableControls: ["CM.L2-3.4.5", "CM.L2-3.4.6"],
    weight: 0.8
  },
  {
    id: "inventory",
    category: "Configuration Management",
    question: "Do you maintain an inventory of all systems and components that process CUI?",
    questionType: "boolean",
    helpText: "Complete system inventory is required for security management",
    applicableControls: ["CM.L2-3.4.1", "CM.L2-3.4.4"],
    weight: 0.9
  }
];

/**
 * Incident Response Questions
 */
export const INCIDENT_RESPONSE_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "incident_response_plan",
    category: "Incident Response",
    question: "Do you have a documented Incident Response Plan?",
    questionType: "boolean",
    helpText: "An IR plan defines procedures for detecting, reporting, and responding to security incidents",
    applicableControls: ["IR.L2-3.6.1", "IR.L2-3.6.2"],
    weight: 1.0
  },
  {
    id: "incident_reporting",
    category: "Incident Response",
    question: "Do you have procedures for reporting incidents to external entities (DIB Net, DoD, etc.)?",
    questionType: "boolean",
    helpText: "CUI incidents may require reporting to DoD or other government entities",
    applicableControls: ["IR.L2-3.6.2", "IR.L3-3.6.3"],
    weight: 0.9
  },
  {
    id: "incident_testing",
    category: "Incident Response",
    question: "How often do you test your incident response procedures?",
    questionType: "multiple_choice",
    options: [
      "Quarterly",
      "Annually",
      "Every 2 years",
      "Infrequently or never",
      "No IR testing"
    ],
    helpText: "Regular testing ensures the IR plan is effective and up-to-date",
    applicableControls: ["IR.L2-3.6.2", "IR.L2-3.6.4"],
    weight: 0.8
  },
  {
    id: "incident_tools",
    category: "Incident Response",
    question: "What incident response capabilities do you have? (Select all that apply)",
    questionType: "multi_select",
    options: [
      "SIEM for threat detection",
      "Endpoint Detection and Response (EDR)",
      "Network monitoring tools",
      "Malware analysis sandbox",
      "Forensic investigation tools",
      "Incident ticketing system",
      "Communication/notification system",
      "None of the above"
    ],
    helpText: "Tools support efficient detection, analysis, and response to incidents",
    applicableControls: ["IR.L2-3.6.1", "IR.L2-3.6.5", "SI.L2-3.14.1"],
    weight: 0.8
  }
];

/**
 * Media Protection Questions
 */
export const MEDIA_PROTECTION_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "media_encryption",
    category: "Media Protection",
    question: "Is removable media (USB drives, external drives) encrypted when used for CUI?",
    questionType: "multiple_choice",
    options: [
      "All removable media must be encrypted",
      "Only approved encrypted media allowed",
      "Encryption recommended but not enforced",
      "No encryption requirements",
      "Removable media is prohibited"
    ],
    helpText: "Removable media containing CUI must be encrypted or prohibited",
    applicableControls: ["MP.L1-3.8.6", "MP.L2-3.8.7", "AC.L2-3.1.17"],
    weight: 0.9
  },
  {
    id: "media_disposal",
    category: "Media Protection",
    question: "How is CUI media sanitized before disposal?",
    questionType: "multiple_choice",
    options: [
      "Cryptographic erasure/degaussing",
      "Physical destruction (shredding, disintegration)",
      "NIST 800-88 Clear/Purge methods",
      "Format/Delete only",
      "No specific disposal procedures"
    ],
    helpText: "Proper sanitization ensures CUI cannot be recovered from disposed media",
    applicableControls: ["MP.L1-3.8.6", "MP.L2-3.8.5", "MP.L2-3.8.8"],
    weight: 0.9
  },
  {
    id: "media_marking",
    category: "Media Protection",
    question: "Are media containing CUI clearly marked/labeled?",
    questionType: "boolean",
    helpText: "Marking helps ensure CUI media is properly handled and protected",
    applicableControls: ["MP.L1-3.8.3", "MP.L2-3.8.4"],
    weight: 0.8
  }
];

/**
 * Physical Protection Questions
 */
export const PHYSICAL_PROTECTION_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "physical_access_controls",
    category: "Physical Protection",
    question: "What physical access controls protect areas where CUI is processed? (Select all that apply)",
    questionType: "multi_select",
    options: [
      "Badge/keycard access",
      "Biometric access",
      "Physical locks on doors",
      "Security guards/reception",
      "Surveillance cameras",
      "Alarm systems",
      "Visitor escort requirements",
      "No special physical controls"
    ],
    helpText: "Physical controls prevent unauthorized physical access to CUI",
    applicableControls: ["PE.L1-3.10.1", "PE.L2-3.10.2", "PE.L2-3.10.4"],
    weight: 0.9
  },
  {
    id: "visitor_controls",
    category: "Physical Protection",
    question: "How are visitors to CUI areas controlled?",
    questionType: "multiple_choice",
    options: [
      "Sign-in/sign-out with escort required",
      "Visitor badges issued",
      "Pre-approval required",
      "Background checks for extended access",
      "No visitor restrictions"
    ],
    helpText: "Visitor controls prevent unauthorized access by temporary personnel",
    applicableControls: ["PE.L1-3.10.1", "PE.L2-3.10.4", "PS.L2-3.9.1"],
    weight: 0.8
  },
  {
    id: "workstation_security",
    category: "Physical Protection",
    question: "Are workstations in public or shared areas secured to prevent unauthorized viewing?",
    questionType: "boolean",
    helpText: "Privacy screens and positioning prevent shoulder surfing in shared spaces",
    applicableControls: ["PE.L2-3.10.5", "AC.L2-3.1.18"],
    weight: 0.8
  }
];

/**
 * Risk Assessment Questions
 */
export const RISK_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "risk_assessment_conducted",
    category: "Risk Assessment",
    question: "Have you conducted a risk assessment for systems processing CUI?",
    questionType: "boolean",
    helpText: "Risk assessments identify threats, vulnerabilities, and mitigation strategies",
    applicableControls: ["RA.L2-3.11.1", "RA.L2-3.11.2"],
    weight: 1.0
  },
  {
    id: "risk_assessment_frequency",
    category: "Risk Assessment",
    question: "If yes, how often are risk assessments updated?",
    questionType: "multiple_choice",
    options: [
      "Annually or more frequently",
      "Every 2 years",
      "Every 3 years",
      "Only when major changes occur",
      "Never updated after initial assessment"
    ],
    helpText: "Risk assessments should be reviewed and updated regularly",
    applicableControls: ["RA.L2-3.11.1", "RA.L2-3.11.3"],
    weight: 0.8
  },
  {
    id: "vulnerability_scanning",
    category: "Risk Assessment",
    question: "Do you perform vulnerability scanning of systems processing CUI?",
    questionType: "multiple_choice",
    options: [
      "Monthly or more frequently",
      "Quarterly",
      "Semi-annually",
      "Annually",
      "Infrequently or never"
    ],
    helpText: "Regular vulnerability scanning identifies security weaknesses",
    applicableControls: ["RA.L2-3.11.2", "SI.L2-3.14.4", "SI.L2-3.14.5"],
    weight: 0.9
  }
];

/**
 * Security Assessment Questions
 */
export const SECURITY_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "security_assessment_plan",
    category: "Security Assessment",
    question: "Do you have a plan for assessing security controls?",
    questionType: "boolean",
    helpText: "Security assessment plans define scope, methods, and schedule for control testing",
    applicableControls: ["CA.L2-3.12.1", "CA.L2-3.12.2"],
    weight: 0.9
  },
  {
    id: "control_testing",
    category: "Security Assessment",
    question: "Are security controls tested/evaluated on a defined schedule?",
    questionType: "multiple_choice",
    options: [
      "Annually by internal team",
      "Annually by external assessor",
      "Every 2-3 years",
      "Ad-hoc/as needed",
      "No formal testing"
    ],
    helpText: "Regular control testing verifies security measures are working effectively",
    applicableControls: ["CA.L2-3.12.1", "CA.L2-3.12.2", "CA.L2-3.12.3"],
    weight: 0.9
  },
  {
    id: "penetration_testing",
    category: "Security Assessment",
    question: "Do you conduct penetration testing?",
    questionType: "multiple_choice",
    options: [
      "Annually by external firm",
      "Annually internal only",
      "Every 2-3 years",
      "Never conducted",
      "What's penetration testing?"
    ],
    helpText: "Penetration testing simulates real attacks to identify security gaps",
    applicableControls: ["CA.L3-3.12.4"],
    weight: 0.7
  }
];

/**
 * Personnel Security Questions
 */
export const PERSONNEL_SECURITY_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "personnel_screening",
    category: "Personnel Security",
    question: "Are personnel with access to CUI screened before assignment?",
    questionType: "multiple_choice",
    options: [
      "Background checks required for all CUI access",
      "Background checks for privileged positions only",
      "Reference checks only",
      "No screening performed"
    ],
    helpText: "Personnel screening helps ensure trustworthy individuals access CUI",
    applicableControls: ["PS.L2-3.9.1", "PS.L2-3.9.2"],
    weight: 0.9
  },
  {
    id: "security_training",
    category: "Personnel Security",
    question: "What security training is provided? (Select all that apply)",
    questionType: "multi_select",
    options: [
      "Initial security awareness training",
      "Annual refresher training",
      "Role-specific security training",
      "CUI handling training",
      "Phishing simulation exercises",
      "Insider threat awareness",
      "No formal training"
    ],
    helpText: "Training ensures personnel understand their security responsibilities",
    applicableControls: ["AT.L1-3.2.1", "AT.L2-3.2.2", "AT.L2-3.2.3", "AT.L2-3.2.4"],
    weight: 1.0
  },
  {
    id: "termination_procedures",
    category: "Personnel Security",
    question: "Do you have documented procedures for terminating system access when personnel leave?",
    questionType: "boolean",
    helpText: "Timely access termination prevents former employees from accessing CUI",
    applicableControls: ["PS.L2-3.9.2", "IA.L1-3.5.2"],
    weight: 0.9
  }
];

/**
 * System Protection Questions
 */
export const SYSTEM_PROTECTION_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "firewall_protection",
    category: "System Protection",
    question: "Are firewalls deployed at network boundaries?",
    questionType: "boolean",
    helpText: "Firewalls control traffic between trusted and untrusted networks",
    applicableControls: ["SC.L1-3.13.1", "SC.L2-3.13.5"],
    weight: 1.0
  },
  {
    id: "network_segmentation",
    category: "System Protection",
    question: "Is the CUI environment segmented from the general network?",
    questionType: "multiple_choice",
    options: [
      "CUI on completely separate network",
      "VLAN segmentation with access controls",
      "Subnet separation",
      "No specific segmentation",
      "Not sure"
    ],
    helpText: "Network segmentation limits the spread of attacks and restricts CUI access",
    applicableControls: ["SC.L2-3.13.5", "AC.L2-3.1.3", "SC.L3-3.13.13"],
    weight: 0.9
  },
  {
    id: "data_encryption_transit",
    category: "System Protection",
    question: "Is CUI encrypted when transmitted over networks?",
    questionType: "boolean",
    helpText: "Encryption in transit (TLS, VPN) protects CUI from interception",
    applicableControls: ["SC.L1-3.13.11", "SC.L2-3.13.12"],
    weight: 1.0
  },
  {
    id: "data_encryption_rest",
    category: "System Protection",
    question: "Is CUI encrypted at rest on servers and storage systems?",
    questionType: "boolean",
    helpText: "Encryption at rest protects CUI if storage media is compromised",
    applicableControls: ["SC.L1-3.13.11", "AC.L2-3.1.19"],
    weight: 1.0
  },
  {
    id: "malware_protection",
    category: "System Protection",
    question: "What malware protection is deployed? (Select all that apply)",
    questionType: "multi_select",
    options: [
      "Anti-virus/anti-malware on all endpoints",
      "Email filtering/gateway protection",
      "Web filtering/proxy",
      "Application whitelisting",
      "EDR/XDR advanced threat protection",
      "Sandbox analysis",
      "No malware protection"
    ],
    helpText: "Malware protection prevents malicious software from compromising CUI",
    applicableControls: ["SI.L2-3.14.1", "SI.L2-3.14.2", "SC.L2-3.13.6"],
    weight: 1.0
  },
  {
    id: "patch_management",
    category: "System Protection",
    question: "How are security patches managed?",
    questionType: "multiple_choice",
    options: [
      "Automated patching within 30 days",
      "Manual patching within 30 days",
      "Patching within 90 days",
      "Ad-hoc patching",
      "No formal patch management"
    ],
    helpText: "Timely patching addresses known vulnerabilities",
    applicableControls: ["SI.L2-3.14.4", "RA.L2-3.11.2"],
    weight: 0.9
  }
];

/**
 * Complete Questionnaire
 */
export const COMPLETE_QUESTIONNAIRE: AssessmentQuestion[] = [
  ...SYSTEM_DISCOVERY_QUESTIONS,
  ...ACCESS_CONTROL_QUESTIONS,
  ...AUTHENTICATION_QUESTIONS,
  ...AUDIT_QUESTIONS,
  ...CONFIGURATION_MANAGEMENT_QUESTIONS,
  ...INCIDENT_RESPONSE_QUESTIONS,
  ...MEDIA_PROTECTION_QUESTIONS,
  ...PHYSICAL_PROTECTION_QUESTIONS,
  ...RISK_ASSESSMENT_QUESTIONS,
  ...SECURITY_ASSESSMENT_QUESTIONS,
  ...PERSONNEL_SECURITY_QUESTIONS,
  ...SYSTEM_PROTECTION_QUESTIONS
];

/**
 * Get questions by category
 */
export function getQuestionsByCategory(category: string): AssessmentQuestion[] {
  return COMPLETE_QUESTIONNAIRE.filter(q => q.category === category);
}

/**
 * Get applicable controls based on questionnaire answers
 */
export function determineApplicableControls(
  responses: Record<string, string | string[] | boolean>
): string[] {
  const applicableControls = new Set<string>();
  
  // All CMMC Level 1 controls are baseline applicable
  // Level 2 and 3 depend on answers
  
  for (const [questionId, answer] of Object.entries(responses)) {
    const question = COMPLETE_QUESTIONNAIRE.find(q => q.id === questionId);
    if (question) {
      // Add controls mapped to this question
      question.applicableControls.forEach(control => applicableControls.add(control));
      
      // Additional logic based on specific answers
      if (questionId === 'system_type') {
        if (answer === 'Cloud only (AWS, Azure, GCP, etc.)' || 
            answer === 'Hybrid (mix of on-premise and cloud)') {
          // Add cloud-specific controls
          applicableControls.add('SA.L2-3.15.6');
          applicableControls.add('SC.L2-3.13.5');
        }
      }
      
      if (questionId === 'remote_access' && answer === true) {
        // Ensure remote access controls are marked
        applicableControls.add('AC.L2-3.1.12');
        applicableControls.add('AC.L2-3.1.13');
        applicableControls.add('SC.L2-3.13.6');
      }
    }
  }
  
  return Array.from(applicableControls);
}

/**
 * Calculate CMMC level based on responses
 */
export function calculateRecommendedLevel(
  responses: Record<string, string | string[] | boolean>
): 1 | 2 | 3 {
  let score = 0;
  
  // Count positive security indicators
  if (responses['handles_cui'] === true) score += 1;
  if (responses['mfa_enabled'] === 'Yes, for all users and all access methods') score += 2;
  if (responses['encryption_at_rest'] === true) score += 1;
  if (responses['encryption_transit'] === true) score += 1;
  if (responses['audit_logging'] === true) score += 1;
  if (responses['incident_response_plan'] === true) score += 1;
  if (responses['risk_assessment_conducted'] === true) score += 1;
  
  if (score >= 6) return 3;
  if (score >= 3) return 2;
  return 1;
}
