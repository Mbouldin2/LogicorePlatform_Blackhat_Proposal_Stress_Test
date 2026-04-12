import { NISTControl } from "@/lib/types/cmmc";

/**
 * NIST SP 800-171 Revision 3 Controls
 * Protecting Controlled Unclassified Information in Nonfederal Systems and Organizations
 * 
 * Organized by Control Families:
 * - AC: Access Control
 * - AT: Awareness and Training
 * - AU: Audit and Accountability
 * - CM: Configuration Management
 * - IA: Identification and Authentication
 * - IR: Incident Response
 * - MA: Maintenance
 * - MP: Media Protection
 * - PE: Physical Protection
 * - PS: Personnel Security
 * - RA: Risk Assessment
 * - CA: Security Assessment
 * - SC: System and Communications Protection
 * - SI: System and Information Integrity
 * - SA: System and Services Acquisition
 * - SR: Supply Chain Risk Management
 */

export const NIST_CONTROLS: NISTControl[] = [
  // ============================================
  // ACCESS CONTROL (AC)
  // ============================================
  {
    id: "AC.L1-3.1.1",
    family: "AC",
    level: 1,
    number: "3.1.1",
    title: "Limit System Access to Authorized Users",
    description: "Limit system access to authorized users, processes acting on behalf of authorized users, and devices (including other systems).",
    discussion: "This requirement addresses the need to limit access to systems that process, store, or transmit CUI. Access can be limited by physically securing the system in a controlled access area or by logical access controls. The intent is to ensure that only authorized users have access to organizational systems.",
    relatedControls: ["AC.L1-3.1.2", "IA.L1-3.5.1", "IA.L1-3.5.2"],
    assessmentObjective: "Determine if access to the system is limited to authorized users, processes acting on behalf of authorized users, and devices.",
    potentialAssessors: ["System Administrator", "Security Officer", "IT Manager"],
    cmmcLevel: 1,
    commonArtifacts: [
      "Access Control Policy",
      "User Access List/Roster",
      "System Configuration Baselines",
      "Network Diagram showing access points",
      "Logical access control configurations"
    ],
    interviewQuestions: [
      "Who has access to systems processing CUI?",
      "How is system access requested and approved?",
      "What processes prevent unauthorized access?",
      "How are terminated employees' access removed?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "AC.L1-3.1.2",
    family: "AC",
    level: 1,
    number: "3.1.2",
    title: "Limit System Access to Types of Transactions and Functions",
    description: "Limit system access to the types of transactions and functions that authorized users are permitted to execute.",
    discussion: "This requirement restricts user access to only those transactions and functions necessary to accomplish assigned tasks. Organizations can implement this by using role-based access control (RBAC), attribute-based access control (ABAC), or access control lists (ACLs).",
    relatedControls: ["AC.L1-3.1.1", "AC.L2-3.1.4", "AC.L2-3.1.5"],
    assessmentObjective: "Determine if system access is limited to the types of transactions and functions that authorized users are permitted to execute.",
    potentialAssessors: ["System Administrator", "Application Owner", "Security Officer"],
    cmmcLevel: 1,
    commonArtifacts: [
      "Role-Based Access Control (RBAC) Matrix",
      "User Access Rights Documentation",
      "Application Security Settings",
      "Privilege Escalation Procedures",
      "User Permission Audits"
    ],
    interviewQuestions: [
      "How do you ensure users only have access to functions they need?",
      "What roles are defined in the system?",
      "How are privileged accounts managed?",
      "How often are user permissions reviewed?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AC.L1-3.1.20",
    family: "AC",
    level: 1,
    number: "3.1.20",
    title: "Encrypt CUI on Mobile Devices",
    description: "Encrypt CUI on mobile devices and mobile computing platforms.",
    discussion: "Mobile devices include laptops, tablets, and smartphones. Mobile computing platforms include systems that provide software-based emulation of mobile systems. Encryption protects CUI in the event mobile devices are lost or stolen.",
    relatedControls: ["SC.L1-3.13.11", "MP.L1-3.8.6"],
    assessmentObjective: "Determine if CUI on mobile devices and mobile computing platforms is encrypted.",
    potentialAssessors: ["IT Administrator", "Security Officer", "Endpoint Manager"],
    cmmcLevel: 1,
    commonArtifacts: [
      "Mobile Device Encryption Policy",
      "BitLocker/FileVault Configuration Reports",
      "MDM (Mobile Device Management) Console Screenshots",
      "Device Encryption Status Reports",
      "Data Loss Prevention (DLP) Configurations"
    ],
    interviewQuestions: [
      "Are all mobile devices encrypted?",
      "What encryption standard is used (AES-256)?",
      "How do you verify encryption is enabled on all devices?",
      "What happens if an unencrypted device is discovered?"
    ],
    testMethods: ["examine", "test"]
  },
  {
    id: "AC.L2-3.1.3",
    family: "AC",
    level: 2,
    number: "3.1.3",
    title: "Control CUI Flow Across Boundaries",
    description: "Control the flow of CUI across boundaries.",
    discussion: "Boundaries include system boundaries and network boundaries. Organizations can use data loss prevention (DLP) tools, firewalls, and other boundary protection mechanisms to control the flow of CUI. This includes controlling data exfiltration and unauthorized data movement.",
    relatedControls: ["SC.L1-3.13.1", "SC.L2-3.13.5", "SC.L2-3.13.6"],
    assessmentObjective: "Determine if the flow of CUI across system and network boundaries is controlled.",
    potentialAssessors: ["Network Administrator", "Security Engineer", "System Architect"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Network Boundary Diagrams",
      "Data Flow Diagrams",
      "Firewall Rules Documentation",
      "DLP Configuration and Logs",
      "Network Segmentation Documentation",
      "Cross-Domain Solutions (if applicable)"
    ],
    interviewQuestions: [
      "How is CUI prevented from leaving authorized boundaries?",
      "What network segmentation is in place?",
      "How are data flows between systems authorized?",
      "What tools monitor CUI movement?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AC.L2-3.1.4",
    family: "AC",
    level: 2,
    number: "3.1.4",
    title: "Separate Processing Domains",
    description: "Separate the processing of different data types on separate system components or services.",
    discussion: "This requirement ensures that CUI is not commingled with non-CUI or other categories of CUI in a way that could lead to unauthorized access or disclosure. Organizations can use system partitioning, virtual machines, or containers to separate processing domains.",
    relatedControls: ["SC.L1-3.13.1", "SC.L2-3.13.5"],
    assessmentObjective: "Determine if different data types are processed on separate system components or services.",
    potentialAssessors: ["System Architect", "IT Administrator", "Security Engineer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "System Architecture Diagrams",
      "Data Segregation Policy",
      "Virtual Machine/Container Configuration",
      "Network Segmentation Documentation",
      "Database Schema with Access Controls"
    ],
    interviewQuestions: [
      "How is CUI processing separated from non-CUI processing?",
      "What virtualization or containerization is used?",
      "How do you prevent data leakage between domains?",
      "Are there shared resources between domains?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AC.L2-3.1.5",
    family: "AC",
    level: 2,
    number: "3.1.5",
    title: "Employ Least Privilege",
    description: "Employ the principle of least privilege, allowing only authorized accesses for users (or processes acting on behalf of users) that are necessary to accomplish assigned organizational tasks.",
    discussion: "The principle of least privilege restricts user access to the minimum necessary to perform assigned duties. This includes both read and write privileges. Organizations should regularly review and adjust privileges based on changes in duties.",
    relatedControls: ["AC.L1-3.1.1", "AC.L1-3.1.2", "AC.L2-3.1.6"],
    assessmentObjective: "Determine if the principle of least privilege is employed for user and process access.",
    potentialAssessors: ["System Administrator", "Security Officer", "IT Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Least Privilege Policy",
      "User Access Matrix/Roles",
      "Privileged Access Management (PAM) Configuration",
      "Regular Access Reviews Documentation",
      "Just-In-Time (JIT) Access Logs (if applicable)"
    ],
    interviewQuestions: [
      "How is least privilege implemented?",
      "How often are user privileges reviewed?",
      "Are there users with excessive privileges?",
      "How are temporary elevated privileges managed?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AC.L2-3.1.6",
    family: "AC",
    level: 2,
    number: "3.1.6",
    title: "Use Non-Privileged Accounts for Non-Security Functions",
    description: "Use non-privileged accounts or non-administrative accounts when accessing non-security functions.",
    discussion: "This requirement ensures that privileged accounts are only used for administrative or security functions, not for routine tasks such as email, web browsing, or document processing. This reduces the risk of privilege escalation attacks.",
    relatedControls: ["AC.L2-3.1.5", "IA.L2-3.5.11"],
    assessmentObjective: "Determine if non-privileged accounts are used for non-security functions.",
    potentialAssessors: ["IT Administrator", "Security Officer", "HR"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Privileged Account Management Policy",
      "Administrator Account Usage Logs",
      "User Account Configuration",
      "Separation of Duties Matrix",
      "Privilege Escalation Procedures"
    ],
    interviewQuestions: [
      "Do administrators use separate accounts for routine work?",
      "How is privileged account usage monitored?",
      "Are privileged accounts used for email/browsing?",
      "How are admin credentials protected?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "AC.L2-3.1.7",
    family: "AC",
    level: 2,
    number: "3.1.7",
    title: "Prevent Privileged Functions without Privileged Accounts",
    description: "Prevent non-privileged users from executing privileged functions and prevent privileged users from executing non-security functions while using privileged accounts.",
    discussion: "This control works with AC.L2-3.1.6 to ensure proper separation of duties. Privileged functions include system administration, security configuration changes, and access to audit logs.",
    relatedControls: ["AC.L2-3.1.5", "AC.L2-3.1.6", "AU.L2-3.3.1"],
    assessmentObjective: "Determine if non-privileged users are prevented from executing privileged functions and privileged users are prevented from executing non-security functions with privileged accounts.",
    potentialAssessors: ["System Administrator", "Security Engineer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Group Policy Settings",
      "Role-Based Access Configuration",
      "User Rights Assignment Documentation",
      "Privilege Enforcement Mechanisms",
      "Audit Logs of Privilege Usage"
    ],
    interviewQuestions: [
      "How are privileged functions restricted?",
      "Can regular users perform administrative tasks?",
      "How is the separation enforced technically?",
      "What happens if someone tries to bypass controls?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AC.L2-3.1.8",
    family: "AC",
    level: 2,
    number: "3.1.8",
    title: "Limit Unsuccessful Logon Attempts",
    description: "Limit the number of unsuccessful logon attempts.",
    discussion: "Organizations should define the maximum number of unsuccessful logon attempts before locking accounts. This protects against brute force password attacks. The threshold should balance security with usability.",
    relatedControls: ["IA.L1-3.5.1", "IA.L2-3.5.7", "SC.L2-3.14.6"],
    assessmentObjective: "Determine if the number of unsuccessful logon attempts is limited.",
    potentialAssessors: ["System Administrator", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Account Lockout Policy Configuration",
      "Group Policy Settings (Windows)",
      "PAM Configuration (Linux)",
      "Authentication Server Settings",
      "Failed Logon Attempt Logs"
    ],
    interviewQuestions: [
      "What is the account lockout threshold?",
      "How long are accounts locked?",
      "How are lockout events logged?",
      "Is there an alert system for multiple failures?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AC.L2-3.1.9",
    family: "AC",
    level: 2,
    number: "3.1.9",
    title: "Provide Privacy and Security Notices",
    description: "Provide privacy and security notices consistent with applicable CUI rules.",
    discussion: "Notices inform users about monitoring, acceptable use, and privacy policies. These notices should be displayed at logon and on websites or applications processing CUI.",
    relatedControls: ["AC.L2-3.1.10", "PL.L1-3.4.1"],
    assessmentObjective: "Determine if privacy and security notices are provided consistent with applicable CUI rules.",
    potentialAssessors: ["Privacy Officer", "Security Officer", "Legal/Compliance"],
    cmmcLevel: 2,
    commonArtifacts: [
      "System Use Notification/Banner",
      "Privacy Policy",
      "Acceptable Use Policy",
      "Login Banner Configuration",
      "Website Privacy Notices"
    ],
    interviewQuestions: [
      "What notice is displayed at system logon?",
      "Does the notice reference CUI handling?",
      "Are users required to acknowledge the notice?",
      "How is the notice kept current?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "AC.L2-3.1.10",
    family: "AC",
    level: 2,
    number: "3.1.10",
    title: "Use Session Lock with Pattern-Hiding Displays",
    description: "Use session lock with pattern-hiding displays to prevent access and viewing of data after a period of inactivity.",
    discussion: "Session locks prevent unauthorized access when users leave workstations unattended. Pattern-hiding displays prevent shoulder surfing by showing a blank screen or moving display rather than the actual content.",
    relatedControls: ["AC.L2-3.1.9", "SC.L2-3.14.7"],
    assessmentObjective: "Determine if session lock with pattern-hiding displays is used after a period of inactivity.",
    potentialAssessors: ["IT Administrator", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Screen Lock Policy",
      "Group Policy/Configuration Settings",
      "Screen Saver/Timeout Settings",
      "MDM Configuration for Mobile Devices",
      "Workstation Security Checklists"
    ],
    interviewQuestions: [
      "What is the session lock timeout?",
      "Do screens show content when locked?",
      "Can users disable screen locks?",
      "How is compliance monitored?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AC.L2-3.1.11",
    family: "AC",
    level: 2,
    number: "3.1.11",
    title: "Terminate Sessions Automatically",
    description: "Terminate (automatically) user sessions after a defined condition.",
    discussion: "Defined conditions may include time limits, inactivity periods, or concurrent session limits. This prevents unauthorized access from abandoned sessions and reduces resource consumption.",
    relatedControls: ["AC.L2-3.1.10", "IA.L2-3.5.7"],
    assessmentObjective: "Determine if user sessions are terminated automatically after a defined condition.",
    potentialAssessors: ["System Administrator", "Application Owner"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Session Timeout Configuration",
      "Application Session Settings",
      "VPN Timeout Settings",
      "Remote Access Session Limits",
      "Session Management Logs"
    ],
    interviewQuestions: [
      "When are sessions automatically terminated?",
      "What triggers session termination?",
      "How long can sessions remain idle?",
      "Are there different timeouts for different systems?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AC.L2-3.1.12",
    family: "AC",
    level: 2,
    number: "3.1.12",
    title: "Monitor and Control Remote Access Sessions",
    description: "Monitor and control remote access sessions.",
    discussion: "Remote access includes VPN, remote desktop, and cloud-based access. Organizations should monitor these sessions for suspicious activity and have the ability to terminate them if necessary.",
    relatedControls: ["AC.L2-3.1.13", "AU.L2-3.3.1", "SC.L2-3.13.6"],
    assessmentObjective: "Determine if remote access sessions are monitored and controlled.",
    potentialAssessors: ["Network Administrator", "Security Operations"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Remote Access Policy",
      "VPN Logs and Monitoring",
      "Remote Desktop Gateway Logs",
      "Session Recording (if used)",
      "Remote Access Authorization Records",
      "Privileged Session Monitoring"
    ],
    interviewQuestions: [
      "How are remote sessions monitored?",
      "Can remote sessions be terminated by administrators?",
      "What remote access methods are permitted?",
      "How is remote access authorized and logged?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AC.L2-3.1.13",
    family: "AC",
    level: 2,
    number: "3.1.13",
    title: "Control Remote Access",
    description: "Control remote access to the system.",
    discussion: "Remote access controls include requiring MFA, using VPNs, restricting access to specific IP ranges, and limiting which systems can be accessed remotely. All remote access should be documented and authorized.",
    relatedControls: ["AC.L2-3.1.12", "IA.L2-3.5.3", "SC.L2-3.13.6"],
    assessmentObjective: "Determine if remote access to the system is controlled.",
    potentialAssessors: ["Network Administrator", "Security Engineer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Remote Access Policy",
      "VPN Configuration",
      "Firewall Rules for Remote Access",
      "Remote Access Request and Approval Forms",
      "Multi-Factor Authentication Configuration"
    ],
    interviewQuestions: [
      "Who is authorized for remote access?",
      "What security controls protect remote access?",
      "Is MFA required for all remote access?",
      "How is remote access reviewed and revoked?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AC.L2-3.1.14",
    family: "AC",
    level: 2,
    number: "3.1.14",
    title: "Control Wireless Access",
    description: "Control wireless access to the system.",
    discussion: "Wireless access includes Wi-Fi, Bluetooth, and other wireless technologies. Controls include encryption (WPA2/WPA3), authentication, network segmentation, and monitoring for unauthorized access points.",
    relatedControls: ["SC.L2-3.13.5", "SC.L2-3.13.11"],
    assessmentObjective: "Determine if wireless access to the system is controlled.",
    potentialAssessors: ["Network Administrator", "Wireless Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Wireless Security Policy",
      "Wireless Network Configuration",
      "Access Point Inventory and Configuration",
      "Wireless Scanning/Monitoring Reports",
      "Wi-Fi Security Certificates"
    ],
    interviewQuestions: [
      "What wireless networks exist?",
      "How is wireless access secured?",
      "Are guest and corporate networks separated?",
      "How is rogue access point detection performed?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AC.L2-3.1.15",
    family: "AC",
    level: 2,
    number: "3.1.15",
    title: "Limit Wireless Connection Time",
    description: "Limit wireless access to the time necessary.",
    discussion: "This control is particularly important for guest access and temporary connections. It can be implemented through session timeouts, scheduled access windows, or temporary credentials.",
    relatedControls: ["AC.L2-3.1.14", "AC.L2-3.1.11"],
    assessmentObjective: "Determine if wireless access is limited to the time necessary.",
    potentialAssessors: ["Network Administrator", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Wireless Access Time Limits Configuration",
      "Guest Wireless Policy",
      "Session Timeout Settings",
      "Temporary Access Documentation"
    ],
    interviewQuestions: [
      "Are there time limits for wireless sessions?",
      "How long can users stay connected?",
      "Do temporary connections have shorter limits?",
      "Are there scheduled maintenance windows?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "AC.L2-3.1.16",
    family: "AC",
    level: 2,
    number: "3.1.16",
    title: "Control Connection of Mobile Devices",
    description: "Control connection of portable and mobile devices to organizational systems.",
    discussion: "Mobile devices may introduce malware or enable data exfiltration. Controls include requiring device registration, security scanning, MDM enrollment, and restrictions on data transfer.",
    relatedControls: ["AC.L1-3.1.20", "SC.L2-3.13.5", "SI.L2-3.14.1"],
    assessmentObjective: "Determine if the connection of portable and mobile devices to organizational systems is controlled.",
    potentialAssessors: ["IT Administrator", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Mobile Device Policy",
      "MDM Configuration",
      "Device Registration Records",
      "NAC (Network Access Control) Configuration",
      "Device Compliance Reports"
    ],
    interviewQuestions: [
      "Can personal devices connect to the network?",
      "What checks are performed before device connection?",
      "Are mobile devices required to use MDM?",
      "How is non-compliant device access prevented?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AC.L2-3.1.17",
    family: "AC",
    level: 2,
    number: "3.1.17",
    title: "Control Use of Portable Storage Devices",
    description: "Control the use of portable storage devices on organizational systems.",
    discussion: "Portable storage includes USB drives, external hard drives, and memory cards. Controls include device restrictions, encryption requirements, malware scanning, and data loss prevention.",
    relatedControls: ["MP.L2-3.8.7", "SI.L2-3.14.1", "SC.L2-3.13.5"],
    assessmentObjective: "Determine if the use of portable storage devices on organizational systems is controlled.",
    potentialAssessors: ["IT Administrator", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Removable Media Policy",
      "USB Device Control Configuration",
      "DLP Rules for Removable Media",
      "Device Control Software Settings",
      "Approved Device Lists"
    ],
    interviewQuestions: [
      "Are USB drives permitted?",
      "What controls exist for removable media?",
      "How is data transfer via USB monitored?",
      "Are external storage devices encrypted?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AC.L2-3.1.18",
    family: "AC",
    level: 2,
    number: "3.1.18",
    title: "Limit CUI Access in Public Areas",
    description: "Limit CUI access in publicly accessible areas.",
    discussion: "Public areas include lobbies, conference rooms, and shared workspaces. Controls include physical barriers, privacy screens, access restrictions, and clear desk policies.",
    relatedControls: ["PE.L1-3.10.1", "PE.L2-3.10.4", "PE.L2-3.10.5"],
    assessmentObjective: "Determine if CUI access in publicly accessible areas is limited.",
    potentialAssessors: ["Facility Security Officer", "IT Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Clean Desk Policy",
      "Privacy Screen Requirements",
      "Public Area Access Controls",
      "Visitor Escort Procedures",
      "Workstation Security in Shared Spaces"
    ],
    interviewQuestions: [
      "How is CUI protected in shared spaces?",
      "Are privacy screens required?",
      "What is the clean desk policy?",
      "Are conference rooms secured for CUI discussions?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "AC.L2-3.1.19",
    family: "AC",
    level: 2,
    number: "3.1.19",
    title: "Encrypt CUI on User-Accessible Devices",
    description: "Encrypt CUI stored on or transmitted through user-accessible devices.",
    discussion: "User-accessible devices include workstations, laptops, mobile devices, and any system component users can access. Encryption protects CUI at rest and in transit on these devices.",
    relatedControls: ["AC.L1-3.1.20", "SC.L1-3.13.11", "SC.L2-3.13.12"],
    assessmentObjective: "Determine if CUI stored on or transmitted through user-accessible devices is encrypted.",
    potentialAssessors: ["IT Administrator", "Security Engineer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Device Encryption Policy",
      "Full Disk Encryption Configuration",
      "Encryption Status Reports",
      "Key Management Documentation",
      "BitLocker/FileVault Settings"
    ],
    interviewQuestions: [
      "What devices store or transmit CUI?",
      "What encryption is used on these devices?",
      "How is encryption verified and monitored?",
      "What happens if encryption is disabled?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AC.L2-3.1.21",
    family: "AC",
    level: 2,
    number: "3.1.21",
    title: "Limit CUI Access to Authorized Users",
    description: "Limit access to CUI on shared system resources to authorized users.",
    discussion: "Shared system resources include file servers, databases, and cloud storage. Access controls should ensure only authorized users can access CUI, even when resources are shared among multiple users or applications.",
    relatedControls: ["AC.L1-3.1.1", "AC.L1-3.1.2", "AC.L2-3.1.5"],
    assessmentObjective: "Determine if access to CUI on shared system resources is limited to authorized users.",
    potentialAssessors: ["System Administrator", "Data Owner"],
    cmmcLevel: 2,
    commonArtifacts: [
      "File Server Permissions",
      "Database Access Controls",
      "SharePoint/Cloud Storage Permissions",
      "Access Control Lists (ACLs)",
      "Regular Access Review Records"
    ],
    interviewQuestions: [
      "Who can access shared CUI repositories?",
      "How are permissions on shared resources managed?",
      "How is CUI separated from non-CUI on shared drives?",
      "How often are shared resource permissions reviewed?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AC.L3-3.1.22",
    family: "AC",
    level: 3,
    number: "3.1.22",
    title: "Control Information Sharing",
    description: "Control information sharing of CUI on connected systems.",
    discussion: "Connected systems include interconnected networks, cloud services, and cross-organizational connections. Information sharing controls prevent unauthorized CUI disclosure across system boundaries.",
    relatedControls: ["AC.L2-3.1.3", "SC.L2-3.13.5", "SC.L3-3.13.13"],
    assessmentObjective: "Determine if information sharing of CUI on connected systems is controlled.",
    potentialAssessors: ["System Architect", "Security Engineer"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Information Sharing Agreements",
      "Cross-Domain Solutions",
      "Data Loss Prevention Configuration",
      "Interconnection Security Agreements (ISAs)",
      "Boundary Protection Documentation"
    ],
    interviewQuestions: [
      "What systems are connected to the CUI environment?",
      "How is CUI sharing controlled between systems?",
      "Are there data flow restrictions?",
      "How is information sharing authorized?"
    ],
    testMethods: ["examine", "interview", "test"]
  },

  // ============================================
  // AWARENESS AND TRAINING (AT)
  // ============================================
  {
    id: "AT.L1-3.2.1",
    family: "AT",
    level: 1,
    number: "3.2.1",
    title: "Conduct Security Awareness Training",
    description: "Provide security awareness training to system users (including managers, senior executives, and contractors) as part of initial training and at least annually thereafter.",
    discussion: "Security awareness training ensures users understand their security responsibilities, recognize security threats, and know how to report incidents. Training should be tailored to different roles and updated regularly.",
    relatedControls: ["AT.L2-3.2.2", "AT.L2-3.2.3", "PS.L2-3.9.2"],
    assessmentObjective: "Determine if security awareness training is provided to system users as part of initial training and at least annually thereafter.",
    potentialAssessors: ["Training Officer", "Security Officer", "HR"],
    cmmcLevel: 1,
    commonArtifacts: [
      "Security Awareness Training Policy",
      "Training Curriculum/Materials",
      "Training Completion Records",
      "Training Schedule",
      "Acknowledgment Forms"
    ],
    interviewQuestions: [
      "What security awareness training is provided?",
      "How often is training conducted?",
      "Who receives the training?",
      "How is training completion tracked?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "AT.L2-3.2.2",
    family: "AT",
    level: 2,
    number: "3.2.2",
    title: "Provide Role-Based Security Training",
    description: "Provide role-based security training to personnel with assigned security roles and responsibilities before authorizing access to the system or performing assigned duties, and annually thereafter.",
    discussion: "Role-based training addresses specific security responsibilities for different positions. This includes system administrators, security officers, incident responders, and others with privileged access or security duties.",
    relatedControls: ["AT.L1-3.2.1", "AT.L2-3.2.3"],
    assessmentObjective: "Determine if role-based security training is provided to personnel with assigned security roles before access authorization and annually thereafter.",
    potentialAssessors: ["Training Officer", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Role-Based Training Curriculum",
      "Training Records by Role",
      "Training Gap Analysis",
      "Technical Training Materials",
      "Certification Records"
    ],
    interviewQuestions: [
      "What role-specific training exists?",
      "Who receives privileged user training?",
      "How does training differ by role?",
      "What technical training is provided for administrators?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "AT.L2-3.2.3",
    family: "AT",
    level: 2,
    number: "3.2.3",
    title: "Provide Practical Exercises",
    description: "Provide practical exercises in security awareness training that simulate actual cyber attacks.",
    discussion: "Practical exercises help users recognize and respond to real-world threats. These can include phishing simulations, social engineering tests, and tabletop exercises that reinforce training concepts.",
    relatedControls: ["AT.L1-3.2.1", "AT.L2-3.2.2", "IR.L2-3.6.2"],
    assessmentObjective: "Determine if practical exercises that simulate actual cyber attacks are included in security awareness training.",
    potentialAssessors: ["Training Officer", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Phishing Simulation Reports",
      "Tabletop Exercise Documentation",
      "Social Engineering Test Results",
      "Exercise Scenarios and Scripts",
      "User Performance Metrics"
    ],
    interviewQuestions: [
      "What practical exercises are conducted?",
      "Are phishing simulations performed?",
      "How often are exercises conducted?",
      "How are exercise results used to improve training?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "AT.L2-3.2.4",
    family: "AT",
    level: 2,
    number: "3.2.4",
    title: "Provide Insider Threat Awareness",
    description: "Provide training to personnel on how to identify and report potential insider threats.",
    discussion: "Insider threats include both malicious insiders and unintentional insider actions that could compromise CUI. Training should cover behavioral indicators, reporting procedures, and prevention measures.",
    relatedControls: ["AT.L1-3.2.1", "IR.L2-3.6.2", "PS.L2-3.9.2"],
    assessmentObjective: "Determine if training is provided on how to identify and report potential insider threats.",
    potentialAssessors: ["Security Officer", "HR", "Training Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Insider Threat Training Materials",
      "Insider Threat Awareness Program",
      "Reporting Procedures Documentation",
      "Behavioral Indicator Guides",
      "Training Attendance Records"
    ],
    interviewQuestions: [
      "What insider threat training is provided?",
      "How do employees report suspicious behavior?",
      "What indicators are covered in training?",
      "Is there an anonymous reporting mechanism?"
    ],
    testMethods: ["examine", "interview"]
  },

  // ============================================
  // AUDIT AND ACCOUNTABILITY (AU)
  // ============================================
  {
    id: "AU.L2-3.3.1",
    family: "AU",
    level: 2,
    number: "3.3.1",
    title: "Create and Retain Audit Logs",
    description: "Create and retain system audit logs and records to the extent needed to enable the monitoring, analysis, investigation, and reporting of unlawful or unauthorized system activity.",
    discussion: "Audit logs provide evidence of system activity for security monitoring and investigations. Logs should capture relevant events including authentication attempts, access to CUI, privilege changes, and security configuration changes.",
    relatedControls: ["AU.L2-3.3.2", "AU.L2-3.3.3", "AU.L2-3.3.4"],
    assessmentObjective: "Determine if system audit logs and records are created and retained to enable monitoring, analysis, investigation, and reporting of unlawful or unauthorized system activity.",
    potentialAssessors: ["Security Operations", "System Administrator", "Auditor"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Audit Logging Policy",
      "Audit Log Configuration",
      "Log Retention Schedule",
      "SIEM Configuration",
      "Sample Audit Logs",
      "Log Storage Architecture"
    ],
    interviewQuestions: [
      "What events are logged?",
      "How long are logs retained?",
      "Who has access to audit logs?",
      "How are logs protected from tampering?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "AU.L2-3.3.2",
    family: "AU",
    level: 2,
    number: "3.3.2",
    title: "Ensure Audit Logging of Events",
    description: "Ensure that the events specified in AU.L2-3.3.1 are logged, including the event types, event date/time, user/process ID, and success/failure indicators.",
    discussion: "Specific events to log include logon/logoff, file access, privilege escalation, security configuration changes, and administrative actions. The required data elements ensure logs are useful for investigations.",
    relatedControls: ["AU.L2-3.3.1", "AU.L2-3.3.3"],
    assessmentObjective: "Determine if the specified events are logged with event types, date/time, user/process ID, and success/failure indicators.",
    potentialAssessors: ["System Administrator", "Security Engineer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Audit Configuration Settings",
      "Event Log Schema Documentation",
      "Group Policy Audit Settings",
      "Syslog Configuration",
      "Sample Log Entries"
    ],
    interviewQuestions: [
      "What specific events are logged?",
      "What information is captured for each event?",
      "Are both success and failure events logged?",
      "How are event types categorized?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AU.L2-3.3.3",
    family: "AU",
    level: 2,
    number: "3.3.3",
    title: "Review Audit Logs",
    description: "Review audit logs.",
    discussion: "Regular audit log reviews help identify security incidents, policy violations, and system anomalies. Reviews should be conducted by personnel independent of the activity being reviewed.",
    relatedControls: ["AU.L2-3.3.1", "AU.L2-3.3.4", "IR.L2-3.6.1"],
    assessmentObjective: "Determine if audit logs are reviewed.",
    potentialAssessors: ["Security Operations", "Auditor", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Audit Review Procedures",
      "Log Review Schedule",
      "Review Documentation/Checklists",
      "SIEM Alert Configuration",
      "Review Reports and Findings"
    ],
    interviewQuestions: [
      "How often are audit logs reviewed?",
      "Who performs the log reviews?",
      "What tools assist with log review?",
      "What happens when suspicious activity is found?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "AU.L2-3.3.4",
    family: "AU",
    level: 2,
    number: "3.3.4",
    title: "Alert for Audit Logging failures",
    description: "Alert in the event of an audit logging failure.",
    discussion: "Audit logging failures may indicate system compromise or technical issues that could result in loss of security monitoring capability. Alerts ensure timely response to restore logging.",
    relatedControls: ["AU.L2-3.3.1", "IR.L2-3.6.1"],
    assessmentObjective: "Determine if alerts are generated in the event of an audit logging failure.",
    potentialAssessors: ["System Administrator", "Security Operations"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Audit Failure Alert Configuration",
      "Alerting Procedures",
      "Escalation Matrix",
      "Monitoring Dashboard Settings",
      "Sample Alert Messages"
    ],
    interviewQuestions: [
      "What triggers an audit logging failure alert?",
      "Who receives the alerts?",
      "What is the response procedure?",
      "How quickly must failures be addressed?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AU.L2-3.3.5",
    family: "AU",
    level: 2,
    number: "3.3.5",
    title: "Correlate Audit Logs",
    description: "Correlate audit logs.",
    discussion: "Correlation of logs from multiple sources helps identify complex attacks that span multiple systems. This can be done through SIEM tools or manual analysis of centralized logs.",
    relatedControls: ["AU.L2-3.3.1", "AU.L2-3.3.6", "IR.L2-3.6.1"],
    assessmentObjective: "Determine if audit logs are correlated.",
    potentialAssessors: ["Security Operations", "Security Engineer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "SIEM Correlation Rules",
      "Log Correlation Procedures",
      "Centralized Logging Architecture",
      "Correlation Use Cases",
      "Event Correlation Reports"
    ],
    interviewQuestions: [
      "How are logs from different sources correlated?",
      "What correlation rules are in place?",
      "What SIEM or correlation tools are used?",
      "What patterns are detected through correlation?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "AU.L2-3.3.6",
    family: "AU",
    level: 2,
    number: "3.3.6",
    title: "Protect Audit Information",
    description: "Protect audit information and audit tools.",
    discussion: "Audit information must be protected from unauthorized access, modification, and deletion to ensure its integrity and availability for investigations. This includes both the logs themselves and the tools used to manage them.",
    relatedControls: ["AU.L2-3.3.1", "MP.L2-3.8.2", "SC.L1-3.13.11"],
    assessmentObjective: "Determine if audit information and audit tools are protected from unauthorized access, modification, and deletion.",
    potentialAssessors: ["System Administrator", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Audit Log Protection Controls",
      "Access Controls on Log Repositories",
      "Log Integrity Verification",
      "Encryption of Log Data",
      "Audit Tool Access Restrictions"
    ],
    interviewQuestions: [
      "Who can access audit logs?",
      "How are logs protected from modification?",
      "Are audit tools restricted to authorized users?",
      "How is log integrity verified?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AU.L2-3.3.7",
    family: "AU",
    level: 2,
    number: "3.3.7",
    title: "Provide Audit Reduction Report",
    description: "Provide a system capability that supports audit reduction and reporting.",
    discussion: "Audit reduction capabilities help analyze large volumes of log data to identify security-relevant events. Reporting capabilities enable generation of compliance reports and security summaries.",
    relatedControls: ["AU.L2-3.3.1", "AU.L2-3.3.3", "AU.L2-3.3.5"],
    assessmentObjective: "Determine if system capabilities support audit reduction and reporting.",
    potentialAssessors: ["Security Operations", "Security Engineer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "SIEM Reporting Capabilities",
      "Audit Reduction Tools",
      "Report Templates",
      "Compliance Dashboards",
      "Automated Report Generation"
    ],
    interviewQuestions: [
      "What audit reduction capabilities exist?",
      "What reports can be generated?",
      "How are compliance reports produced?",
      "What automation exists for reporting?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AU.L2-3.3.8",
    family: "AU",
    level: 2,
    number: "3.3.8",
    title: "Manage Audit Log Storage Capacity",
    description: "Manage audit log storage capacity.",
    discussion: "Audit logs can consume significant storage. Organizations must ensure sufficient capacity while maintaining retention requirements. This includes log rotation, compression, and archival strategies.",
    relatedControls: ["AU.L2-3.3.1", "AU.L2-3.3.6"],
    assessmentObjective: "Determine if audit log storage capacity is managed.",
    potentialAssessors: ["System Administrator", "IT Operations"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Log Storage Capacity Plan",
      "Log Rotation Configuration",
      "Storage Monitoring Reports",
      "Log Archival Procedures",
      "Capacity Planning Documentation"
    ],
    interviewQuestions: [
      "How is log storage capacity managed?",
      "What happens when storage is full?",
      "How are old logs archived?",
      "What is the log retention policy?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "AU.L2-3.3.9",
    family: "AU",
    level: 2,
    number: "3.3.9",
    title: "Protect Audit Data from Modification",
    description: "Protect information obtained from audit log monitoring from unauthorized modification and deletion.",
    discussion: "This control specifically addresses protection of audit monitoring results and analysis, not just the raw logs. This ensures the integrity of security analysis and investigation results.",
    relatedControls: ["AU.L2-3.3.6", "MP.L2-3.8.2"],
    assessmentObjective: "Determine if audit monitoring information is protected from unauthorized modification and deletion.",
    potentialAssessors: ["Security Operations", "System Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Access Controls on Analysis Results",
      "SIEM Data Protection",
      "Change Control for Reports",
      "Backup of Analysis Data",
      "Integrity Verification"
    ],
    interviewQuestions: [
      "How are audit analysis results protected?",
      "Who can modify security reports?",
      "Are investigation results protected?",
      "How is data integrity maintained?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "AU.L2-3.3.10",
    family: "AU",
    level: 2,
    number: "3.3.10",
    title: "Synchronize System Clocks",
    description: "Synchronize system clocks to authoritative time source.",
    discussion: "Accurate time stamps are essential for log correlation and investigation. All systems should synchronize to the same authoritative time source to ensure consistent timestamps across logs.",
    relatedControls: ["AU.L2-3.3.1", "AU.L2-3.3.2"],
    assessmentObjective: "Determine if system clocks are synchronized to an authoritative time source.",
    potentialAssessors: ["System Administrator", "Network Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "NTP Configuration",
      "Time Synchronization Policy",
      "Time Server Documentation",
      "Clock Drift Monitoring",
      "Time Zone Configuration"
    ],
    interviewQuestions: [
      "What time source is used?",
      "How are system clocks synchronized?",
      "What is the synchronization frequency?",
      "How is time accuracy verified?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  // ============================================
  // CONFIGURATION MANAGEMENT (CM)
  // ============================================
  {
    id: "CM.L2-3.4.1",
    family: "CM",
    level: 2,
    number: "3.4.1",
    title: "Establish Configuration Baselines",
    description: "Establish and maintain baseline configurations and inventories of organizational systems.",
    discussion: "Baseline configurations provide a documented, standardized starting point for system deployment. This includes hardware, software, firmware, and configuration settings. Inventories help track all system components.",
    relatedControls: ["CM.L2-3.4.2", "CM.L2-3.4.6", "SA.L2-3.13.1"],
    assessmentObjective: "Determine if baseline configurations and inventories of organizational systems are established and maintained.",
    potentialAssessors: ["System Administrator", "Configuration Manager", "IT Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Configuration Baseline Documentation",
      "Hardware/Software Inventory",
      "Standard Build Documentation",
      "Baseline Configuration Templates",
      "Configuration Management Plan"
    ],
    interviewQuestions: [
      "What baseline configurations are defined?",
      "How is the system inventory maintained?",
      "Who approves changes to baselines?",
      "How are new systems brought into compliance?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "CM.L2-3.4.2",
    family: "CM",
    level: 2,
    number: "3.4.2",
    title: "Enforce Security Configuration",
    description: "Establish and enforce security configuration settings for information technology products employed in organizational systems.",
    discussion: "Security configuration settings include password policies, account lockout settings, audit configurations, and security feature enablement. These should be based on vendor recommendations and security benchmarks like CIS or DISA STIGs.",
    relatedControls: ["CM.L2-3.4.1", "CM.L2-3.4.5", "CM.L2-3.4.6"],
    assessmentObjective: "Determine if security configuration settings are established and enforced for IT products.",
    potentialAssessors: ["System Administrator", "Security Engineer", "Compliance Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Security Configuration Standards",
      "CIS Benchmarks or DISA STIGs",
      "Group Policy Objects (GPOs)",
      "Configuration Compliance Scans",
      "Hardening Scripts/Tools"
    ],
    interviewQuestions: [
      "What security configuration standards are used?",
      "How are configurations enforced?",
      "What tools check configuration compliance?",
      "How are deviations handled?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "CM.L2-3.4.3",
    family: "CM",
    level: 2,
    number: "3.4.3",
    title: "Track, Review, and Approve Configuration Changes",
    description: "Track, review, and approve changes to system configurations.",
    discussion: "Configuration change control ensures all changes are documented, reviewed for security impact, and approved before implementation. This prevents unauthorized changes and provides an audit trail.",
    relatedControls: ["CM.L2-3.4.1", "CM.L2-3.4.5", "AU.L2-3.3.1"],
    assessmentObjective: "Determine if changes to system configurations are tracked, reviewed, and approved.",
    potentialAssessors: ["Change Manager", "System Administrator", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Change Control Process Documentation",
      "Change Request Forms",
      "Change Log/Database",
      "Change Approval Records",
      "Configuration Change Records"
    ],
    interviewQuestions: [
      "How are configuration changes requested?",
      "Who reviews and approves changes?",
      "How are emergency changes handled?",
      "What happens to unauthorized changes?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "CM.L2-3.4.4",
    family: "CM",
    level: 2,
    number: "3.4.4",
    title: "Analyze Security Impact of Changes",
    description: "Analyze the security impact of changes prior to implementation.",
    discussion: "Security impact analysis evaluates how proposed changes could affect the security posture, including introduction of vulnerabilities, changes to attack surface, or modifications to security controls.",
    relatedControls: ["CM.L2-3.4.3", "CM.L2-3.4.5", "RA.L2-3.11.1"],
    assessmentObjective: "Determine if the security impact of changes is analyzed prior to implementation.",
    potentialAssessors: ["Security Engineer", "Change Manager", "Risk Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Security Impact Analysis Procedure",
      "Risk Assessment for Changes",
      "Security Review Checklist",
      "Change Security Review Records",
      "Vulnerability Scan Results for Changes"
    ],
    interviewQuestions: [
      "How is security impact assessed?",
      "Who performs security reviews?",
      "What security criteria are evaluated?",
      "Are security tests required before deployment?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "CM.L2-3.4.5",
    family: "CM",
    level: 2,
    number: "3.4.5",
    title: "Limit System Configuration Changes",
    description: "Define, document, approve, and enforce physical and logical access restrictions associated with changes to organizational systems.",
    discussion: "Access restrictions prevent unauthorized configuration changes. This includes physical access to systems and logical access to configuration tools and interfaces. Only authorized personnel should be able to modify system configurations.",
    relatedControls: ["CM.L2-3.4.3", "AC.L2-3.1.5", "IA.L2-3.5.11"],
    assessmentObjective: "Determine if physical and logical access restrictions for system configuration changes are defined, documented, approved, and enforced.",
    potentialAssessors: ["System Administrator", "Security Officer", "IT Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Configuration Access Control Policy",
      "Privileged Access Documentation",
      "Access Control Lists for Configuration",
      "Configuration Tool Access Logs",
      "Role-Based Configuration Access Matrix"
    ],
    interviewQuestions: [
      "Who can make configuration changes?",
      "How are configuration tools protected?",
      "Are there separate admin accounts?",
      "How is configuration access audited?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "CM.L2-3.4.6",
    family: "CM",
    level: 2,
    number: "3.4.6",
    title: "Least Functionality",
    description: "Employ the principle of least functionality by configuring organizational systems to provide only essential capabilities.",
    discussion: "Least functionality reduces the attack surface by disabling unnecessary services, ports, protocols, and functions. Systems should be configured to provide only the specific capabilities required for their intended purpose.",
    relatedControls: ["CM.L2-3.4.1", "CM.L2-3.4.2", "SC.L2-3.13.5"],
    assessmentObjective: "Determine if systems are configured to provide only essential capabilities (principle of least functionality).",
    potentialAssessors: ["System Administrator", "Security Engineer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Least Functionality Policy",
      "Disabled Services/Ports Lists",
      "System Hardening Guides",
      "Port Scan Results",
      "Service Inventory with Justification"
    ],
    interviewQuestions: [
      "What services are disabled by default?",
      "How are unnecessary ports closed?",
      "Is there justification for enabled services?",
      "How is least functionality verified?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "CM.L2-3.4.7",
    family: "CM",
    level: 2,
    number: "3.4.7",
    title: "Control Software Installation",
    description: "Restrict and control the installation of software on organizational systems.",
    discussion: "Software installation controls prevent unauthorized or malicious software. This includes application whitelisting, requiring administrative privileges for installation, and maintaining an approved software list.",
    relatedControls: ["CM.L2-3.4.6", "SI.L2-3.14.1", "SC.L2-3.13.5"],
    assessmentObjective: "Determine if software installation is restricted and controlled on organizational systems.",
    potentialAssessors: ["IT Administrator", "Security Officer", "Endpoint Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Software Installation Policy",
      "Approved Software List",
      "Application Whitelisting Configuration",
      "Software Inventory Database",
      "Installation Permissions Documentation"
    ],
    interviewQuestions: [
      "Who can install software?",
      "Is there an approved software list?",
      "Are users blocked from installing software?",
      "How is unauthorized software detected?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "CM.L2-3.4.8",
    family: "CM",
    level: 2,
    number: "3.4.8",
    title: "Unauthorized Software Detection",
    description: "Identify unauthorized software on organizational systems.",
    discussion: "Regular scans for unauthorized software help detect policy violations, shadow IT, and potential malware. Automated tools like asset management systems and vulnerability scanners can identify unauthorized installations.",
    relatedControls: ["CM.L2-3.4.7", "SI.L2-3.14.1", "AU.L2-3.3.1"],
    assessmentObjective: "Determine if unauthorized software is identified on organizational systems.",
    potentialAssessors: ["IT Administrator", "Security Operations"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Software Audit Procedures",
      "Asset Management Tool Reports",
      "Unauthorized Software Scan Results",
      "Software Blacklist",
      "Audit Logs for Software Discovery"
    ],
    interviewQuestions: [
      "How is unauthorized software detected?",
      "How often are systems scanned?",
      "What happens when unauthorized software is found?",
      "Are there exceptions for specific software?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "CM.L2-3.4.9",
    family: "CM",
    level: 2,
    number: "3.4.9",
    title: "Configuration Change Control for Emergency Changes",
    description: "Establish and follow configuration change control procedures for emergency changes.",
    discussion: "Emergency changes require expedited approval while still maintaining accountability and security. Post-emergency reviews should ensure proper documentation and retrospective security assessment.",
    relatedControls: ["CM.L2-3.4.3", "IR.L2-3.6.1"],
    assessmentObjective: "Determine if configuration change control procedures are established and followed for emergency changes.",
    potentialAssessors: ["Change Manager", "IT Manager", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Emergency Change Procedure",
      "Emergency Change Log",
      "Post-Change Review Documentation",
      "Emergency Change Approval Records",
      "Retrospective Security Assessments"
    ],
    interviewQuestions: [
      "What qualifies as an emergency change?",
      "How are emergency changes approved?",
      "What documentation is required after the fact?",
      "Are emergency changes reviewed afterward?"
    ],
    testMethods: ["examine", "interview"]
  },

  // ============================================
  // IDENTIFICATION AND AUTHENTICATION (IA)
  // ============================================
  {
    id: "IA.L1-3.5.1",
    family: "IA",
    level: 1,
    number: "3.5.1",
    title: "Identify System Users",
    description: "Identify system users, processes acting on behalf of users, and devices.",
    discussion: "Unique identification is required for accountability. This includes user accounts, service accounts, and device identifiers. Shared accounts should be avoided or strictly controlled.",
    relatedControls: ["IA.L1-3.5.2", "AC.L1-3.1.1", "AU.L2-3.3.1"],
    assessmentObjective: "Determine if system users, processes acting on behalf of users, and devices are uniquely identified.",
    potentialAssessors: ["System Administrator", "Security Officer"],
    cmmcLevel: 1,
    commonArtifacts: [
      "User Identification Policy",
      "Account Naming Convention",
      "User Account List",
      "Service Account Inventory",
      "Device Identification Scheme"
    ],
    interviewQuestions: [
      "How are users uniquely identified?",
      "Are shared accounts allowed?",
      "How are service accounts identified?",
      "How are devices identified on the network?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "IA.L1-3.5.2",
    family: "IA",
    level: 1,
    number: "3.5.2",
    title: "Authenticate System Users",
    description: "Authenticate (or verify) the identities of users, processes, or devices, as a prerequisite to allowing access to organizational systems.",
    discussion: "Authentication verifies claimed identity through passwords, biometrics, tokens, or certificates. Strong authentication methods should be used based on risk and CMMC level requirements.",
    relatedControls: ["IA.L1-3.5.1", "IA.L2-3.5.3", "IA.L2-3.5.11"],
    assessmentObjective: "Determine if the identities of users, processes, or devices are authenticated before system access.",
    potentialAssessors: ["System Administrator", "Security Engineer"],
    cmmcLevel: 1,
    commonArtifacts: [
      "Authentication Policy",
      "Password Policy Configuration",
      "Authentication System Logs",
      "MFA Configuration (if applicable)",
      "Biometric/PKI Settings (if used)"
    ],
    interviewQuestions: [
      "What authentication methods are used?",
      "Are passwords complex and rotated?",
      "Is MFA required anywhere?",
      "How are failed authentications handled?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "IA.L2-3.5.3",
    family: "IA",
    level: 2,
    number: "3.5.3",
    title: "Use Multi-Factor Authentication",
    description: "Use multi-factor authentication for local and network access to privileged accounts and for network access to non-privileged accounts.",
    discussion: "Multi-factor authentication (MFA) requires two or more authentication factors (something you know, have, or are). This significantly reduces the risk of credential compromise.",
    relatedControls: ["IA.L1-3.5.2", "IA.L2-3.5.11", "AC.L2-3.1.12"],
    assessmentObjective: "Determine if multi-factor authentication is used for local and network access to privileged accounts and network access to non-privileged accounts.",
    potentialAssessors: ["Security Engineer", "System Administrator", "Network Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "MFA Policy and Requirements",
      "MFA Configuration Settings",
      "MFA Enrollment Records",
      "Authentication Server Configuration",
      "Remote Access MFA Settings"
    ],
    interviewQuestions: [
      "Where is MFA required?",
      "What MFA methods are supported?",
      "Are there any exceptions?",
      "How is MFA enforced for remote access?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "IA.L2-3.5.4",
    family: "IA",
    level: 2,
    number: "3.5.4",
    title: "Replay-Resistant Authentication",
    description: "Employ replay-resistant authentication mechanisms for network access to privileged accounts.",
    discussion: "Replay-resistant mechanisms prevent attackers from capturing and reusing authentication tokens. This includes one-time passwords, cryptographic challenge-response protocols, and secure session tokens.",
    relatedControls: ["IA.L2-3.5.3", "SC.L2-3.13.5"],
    assessmentObjective: "Determine if replay-resistant authentication mechanisms are employed for network access to privileged accounts.",
    potentialAssessors: ["Security Engineer", "Network Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Authentication Protocol Documentation",
      "Token/Certificate Configuration",
      "Secure Session Management",
      "Kerberos/Active Directory Settings",
      "VPN Authentication Configuration"
    ],
    interviewQuestions: [
      "What prevents replay attacks?",
      "How are tokens protected?",
      "What authentication protocols are used?",
      "How are session tokens generated?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "IA.L2-3.5.5",
    family: "IA",
    level: 2,
    number: "3.5.5",
    title: "Prevent Identifier Reuse",
    description: "Prevent reuse of identifiers for a defined period.",
    discussion: "Preventing identifier reuse ensures that old user accounts cannot be reassigned to new users, which could allow access to previous user's data or maintain inappropriate permissions.",
    relatedControls: ["IA.L1-3.5.1", "PS.L2-3.9.1"],
    assessmentObjective: "Determine if reuse of identifiers is prevented for a defined period.",
    potentialAssessors: ["System Administrator", "HR", "IT Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Account Naming Policy",
      "Prohibited Username List",
      "Account Lifecycle Management",
      "Historical Account Database",
      "Naming Convention Enforcement"
    ],
    interviewQuestions: [
      "How long are usernames prevented from reuse?",
      "Is there a history of used identifiers?",
      "Can old accounts be reactivated?",
      "How are new users distinguished from old?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "IA.L2-3.5.6",
    family: "IA",
    level: 2,
    number: "3.5.6",
    title: "Disable Inactive Accounts",
    description: "Disable identifiers after a defined period of inactivity.",
    discussion: "Inactive account disablement reduces the attack surface from abandoned accounts. This applies to both user accounts and service accounts that are no longer needed.",
    relatedControls: ["IA.L1-3.5.1", "AC.L2-3.1.11"],
    assessmentObjective: "Determine if identifiers are disabled after a defined period of inactivity.",
    potentialAssessors: ["System Administrator", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Account Inactivity Policy",
      "Automated Disablement Configuration",
      "Inactive Account Reports",
      "Account Review Records",
      "Service Account Monitoring"
    ],
    interviewQuestions: [
      "How long before accounts are disabled?",
      "Is disablement automatic or manual?",
      "How are inactive accounts identified?",
      "What happens to disabled accounts?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "IA.L2-3.5.7",
    family: "IA",
    level: 2,
    number: "3.5.7",
    title: "Password Complexity and Management",
    description: "Enforce a minimum password complexity and change of characters when new passwords are created.",
    discussion: "Password policies should require sufficient complexity (length, character types) to resist guessing and brute force attacks. Password history prevents immediate reuse of old passwords.",
    relatedControls: ["IA.L1-3.5.2", "IA.L2-3.5.8", "AC.L2-3.1.8"],
    assessmentObjective: "Determine if minimum password complexity and character change requirements are enforced.",
    potentialAssessors: ["System Administrator", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Password Policy Configuration",
      "Group Policy Password Settings",
      "Password Complexity Requirements",
      "Password History Settings",
      "Password Expiration Configuration"
    ],
    interviewQuestions: [
      "What is the minimum password length?",
      "What character types are required?",
      "How often must passwords change?",
      "How many previous passwords are remembered?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "IA.L2-3.5.8",
    family: "IA",
    level: 2,
    number: "3.5.8",
    title: "Prohibit Password Reuse",
    description: "Prohibit password reuse for a specified number of generations.",
    discussion: "Password history prevents users from cycling through a small set of passwords. A sufficient history (typically 12-24 passwords) ensures passwords remain unique over time.",
    relatedControls: ["IA.L2-3.5.7", "IA.L1-3.5.2"],
    assessmentObjective: "Determine if password reuse is prohibited for a specified number of generations.",
    potentialAssessors: ["System Administrator", "Security Engineer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Password History Configuration",
      "Password Policy Settings",
      "Group Policy/AD Settings",
      "Password Database Settings"
    ],
    interviewQuestions: [
      "How many previous passwords are prohibited?",
      "Is password history enforced across systems?",
      "Can users reset history by changing multiple times?",
      "How is history stored securely?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "IA.L2-3.5.9",
    family: "IA",
    level: 2,
    number: "3.5.9",
    title: "Allow Temporary Password Change",
    description: "Allow temporary password use for system logons with an immediate change to a permanent password.",
    discussion: "Temporary passwords for new accounts or password resets should require immediate change on first use. This ensures only the account owner knows the password.",
    relatedControls: ["IA.L2-3.5.7", "IA.L2-3.5.10"],
    assessmentObjective: "Determine if temporary passwords require immediate change to a permanent password upon first use.",
    potentialAssessors: ["System Administrator", "IT Support"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Temporary Password Policy",
      "Force Password Change Configuration",
      "Password Reset Procedures",
      "User Account Creation Process",
      "First Login Configuration"
    ],
    interviewQuestions: [
      "Are users forced to change temporary passwords?",
      "How are temporary passwords delivered?",
      "Can temporary passwords be used multiple times?",
      "What is the temporary password expiration?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "IA.L2-3.5.10",
    family: "IA",
    level: 2,
    number: "3.5.10",
    title: "Store and Transmit Passwords Encrypted",
    description: "Store and transmit only encrypted representations of passwords.",
    discussion: "Passwords should never be stored or transmitted in plaintext. Storage should use strong one-way hashing (e.g., bcrypt, PBKDF2, Argon2). Transmission should be over encrypted channels (TLS/SSL).",
    relatedControls: ["IA.L2-3.5.7", "SC.L1-3.13.11", "SC.L2-3.13.12"],
    assessmentObjective: "Determine if only encrypted representations of passwords are stored and transmitted.",
    potentialAssessors: ["Security Engineer", "System Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Password Hashing Configuration",
      "Authentication Protocol Documentation",
      "TLS/SSL Configuration for Authentication",
      "Password Database Encryption",
      "Hash Algorithm Documentation"
    ],
    interviewQuestions: [
      "What hashing algorithm is used?",
      "Are passwords ever stored in plaintext?",
      "Is authentication encrypted?",
      "How are password hashes protected?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "IA.L2-3.5.11",
    family: "IA",
    level: 2,
    number: "3.5.11",
    title: "Obscure Feedback of Authentication Information",
    description: "Obscure feedback of authentication information during the authentication process to protect it from unauthorized use.",
    discussion: "Feedback masking prevents shoulder surfing and information disclosure. Passwords should not display characters, and error messages should not reveal whether a username or password was incorrect.",
    relatedControls: ["IA.L1-3.5.2", "AC.L2-3.1.5"],
    assessmentObjective: "Determine if authentication feedback is obscured to prevent unauthorized use.",
    potentialAssessors: ["System Administrator", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Authentication Interface Configuration",
      "Password Masking Settings",
      "Error Message Configuration",
      "Login Screen Documentation",
      "Authentication Application Settings"
    ],
    interviewQuestions: [
      "Are password characters masked?",
      "Do error messages reveal valid usernames?",
      "Is there any feedback during password entry?",
      "Are authentication screens protected from view?"
    ],
    testMethods: ["examine", "interview", "test"]
  },

  // ============================================
  // INCIDENT RESPONSE (IR)
  // ============================================
  {
    id: "IR.L2-3.6.1",
    family: "IR",
    level: 2,
    number: "3.6.1",
    title: "Establish Incident Response Capability",
    description: "Establish an operational incident-handling capability for organizational systems that includes preparation, detection, analysis, containment, recovery, and user response activities.",
    discussion: "Incident response capability ensures the organization can effectively respond to security incidents. This includes documented procedures, trained personnel, and necessary tools and resources.",
    relatedControls: ["IR.L2-3.6.2", "IR.L2-3.6.3", "AU.L2-3.3.1"],
    assessmentObjective: "Determine if an operational incident-handling capability is established including all required activities.",
    potentialAssessors: ["Incident Response Manager", "Security Officer", "IT Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Incident Response Plan",
      "Incident Response Procedures",
      "Incident Response Team Roster",
      "Contact Lists and Escalation Matrix",
      "Incident Response Tools Inventory"
    ],
    interviewQuestions: [
      "Who is on the incident response team?",
      "What are the response procedures?",
      "How are incidents detected?",
      "What tools support incident response?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "IR.L2-3.6.2",
    family: "IR",
    level: 2,
    number: "3.6.2",
    title: "Track, Document, and Report Incidents",
    description: "Track, document, and report incidents to designated officials and/or authorities both internal and external to the organization.",
    discussion: "Incident tracking and documentation provides evidence for investigations, lessons learned, and regulatory reporting. Reporting ensures appropriate stakeholders are informed and can take action.",
    relatedControls: ["IR.L2-3.6.1", "IR.L2-3.6.3", "PS.L2-3.9.2"],
    assessmentObjective: "Determine if incidents are tracked, documented, and reported to designated officials.",
    potentialAssessors: ["Incident Response Manager", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Incident Log/Ticketing System",
      "Incident Reports",
      "Report Templates",
      "Reporting Procedures",
      "External Reporting Records"
    ],
    interviewQuestions: [
      "How are incidents tracked?",
      "What incident information is documented?",
      "Who receives incident reports?",
      "Are incidents reported to external authorities?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "IR.L2-3.6.3",
    family: "IR",
    level: 2,
    number: "3.6.3",
    title: "Test Incident Response",
    description: "Test the organizational incident response capability.",
    discussion: "Testing validates that incident response procedures work and that the team is prepared. Testing can include tabletop exercises, simulations, and full-scale drills with lessons learned incorporated.",
    relatedControls: ["IR.L2-3.6.1", "CA.L2-3.12.1"],
    assessmentObjective: "Determine if the incident response capability is tested.",
    potentialAssessors: ["Incident Response Manager", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Test Plans and Scenarios",
      "Exercise Documentation",
      "After-Action Reports",
      "Lessons Learned Documentation",
      "Test Schedule and Records"
    ],
    interviewQuestions: [
      "How often is incident response tested?",
      "What types of tests are conducted?",
      "What scenarios are exercised?",
      "How are lessons learned incorporated?"
    ],
    testMethods: ["examine", "interview"]
  },

  // ============================================
  // MAINTENANCE (MA)
  // ============================================
  {
    id: "MA.L2-3.7.1",
    family: "MA",
    level: 2,
    number: "3.7.1",
    title: "Perform Maintenance",
    description: "Perform maintenance on organizational systems.",
    discussion: "Maintenance includes preventive maintenance to avoid failures, corrective maintenance to fix issues, and perfective maintenance to improve performance. Maintenance should be scheduled and documented.",
    relatedControls: ["MA.L2-3.7.2", "MA.L2-3.7.4", "CM.L2-3.4.1"],
    assessmentObjective: "Determine if maintenance is performed on organizational systems.",
    potentialAssessors: ["IT Manager", "System Administrator", "Maintenance Technician"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Maintenance Schedule",
      "Maintenance Records",
      "Preventive Maintenance Plan",
      "Service Tickets/Work Orders",
      "Maintenance Log"
    ],
    interviewQuestions: [
      "What maintenance is performed?",
      "How is maintenance scheduled?",
      "Who performs maintenance?",
      "How is maintenance documented?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "MA.L2-3.7.2",
    family: "MA",
    level: 2,
    number: "3.7.2",
    title: "Control Maintenance Tools",
    description: "Provide controls on the tools, techniques, mechanisms, and personnel used to conduct maintenance on organizational systems.",
    discussion: "Maintenance tools can introduce malware or be used to bypass security controls. Tools should be inspected, authorized personnel only should perform maintenance, and diagnostic equipment should be sanitized.",
    relatedControls: ["MA.L2-3.7.1", "MA.L2-3.7.5", "SI.L2-3.14.1"],
    assessmentObjective: "Determine if controls are provided on tools, techniques, mechanisms, and personnel used for system maintenance.",
    potentialAssessors: ["IT Manager", "Security Officer", "Maintenance Supervisor"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Maintenance Tool Inventory",
      "Authorized Maintenance Personnel List",
      "Tool Inspection Procedures",
      "Maintenance Access Controls",
      "Tool Sanitization Procedures"
    ],
    interviewQuestions: [
      "Who is authorized to perform maintenance?",
      "Are maintenance tools inspected?",
      "How are maintenance personnel vetted?",
      "Are diagnostic tools sanitized?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "MA.L2-3.7.3",
    family: "MA",
    level: 2,
    number: "3.7.3",
    title: "Sanitize Media Before Maintenance",
    description: "Ensure equipment removed for off-site maintenance is sanitized of any CUI.",
    discussion: "Equipment sent for external maintenance may contain CUI on storage media. Media should be sanitized or removed before equipment leaves the facility. Maintenance personnel should not have access to CUI.",
    relatedControls: ["MA.L2-3.7.2", "MP.L2-3.8.3", "MP.L2-3.8.6"],
    assessmentObjective: "Determine if equipment removed for off-site maintenance is sanitized of any CUI.",
    potentialAssessors: ["IT Manager", "Security Officer", "Maintenance Coordinator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Media Sanitization Procedures",
      "Maintenance Checklist",
      "Off-Site Maintenance Policy",
      "Sanitization Verification Records",
      "Media Removal Procedures"
    ],
    interviewQuestions: [
      "What happens to data before off-site maintenance?",
      "How is media sanitized?",
      "Are drives removed or wiped?",
      "Who verifies sanitization?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "MA.L2-3.7.4",
    family: "MA",
    level: 2,
    number: "3.7.4",
    title: "Supervise Maintenance Personnel",
    description: "Supervise maintenance activities involving access to organizational systems.",
    discussion: "Maintenance personnel may have privileged access to systems. Supervision ensures authorized activities only and prevents unauthorized access or modifications. Escorts may be required for external maintenance personnel.",
    relatedControls: ["MA.L2-3.7.1", "MA.L2-3.7.2", "AC.L2-3.1.12"],
    assessmentObjective: "Determine if maintenance activities involving access to systems are supervised.",
    potentialAssessors: ["IT Manager", "Security Officer", "System Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Maintenance Supervision Procedures",
      "Visitor/Contractor Escort Policy",
      "Maintenance Activity Logs",
      "Supervision Checklists",
      "Maintenance Authorization Records"
    ],
    interviewQuestions: [
      "Who supervises maintenance personnel?",
      "Are external maintenance personnel escorted?",
      "What access do maintenance personnel have?",
      "How is maintenance activity monitored?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "MA.L2-3.7.5",
    family: "MA",
    level: 2,
    number: "3.7.5",
    title: "Verify Non-Local Maintenance",
    description: "Verify that personnel performing maintenance are authorized and monitored.",
    discussion: "Remote maintenance poses additional risks as personnel are not physically present. Strong authentication, session monitoring, and activity logging should be implemented for non-local maintenance activities.",
    relatedControls: ["MA.L2-3.7.4", "IA.L2-3.5.3", "AU.L2-3.3.1"],
    assessmentObjective: "Determine if personnel performing non-local maintenance are verified as authorized and monitored.",
    potentialAssessors: ["IT Manager", "Security Officer", "Network Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Remote Maintenance Procedures",
      "Authorized Remote Personnel List",
      "Remote Session Monitoring Logs",
      "Remote Access Authentication Records",
      "Remote Maintenance Activity Reports"
    ],
    interviewQuestions: [
      "Who is authorized for remote maintenance?",
      "How are remote maintenance sessions authenticated?",
      "Are remote sessions recorded or monitored?",
      "What remote maintenance tools are used?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "MA.L2-3.7.6",
    family: "MA",
    level: 2,
    number: "3.7.6",
    title: "Maintenance-Related Security Items",
    description: "Secure maintenance equipment and maintenance personnel performing maintenance remotely.",
    discussion: "Maintenance-related security includes secure disposal of replaced components (which may contain CUI), sanitization of diagnostic equipment, and secure handling of maintenance documentation.",
    relatedControls: ["MA.L2-3.7.2", "MP.L2-3.8.6", "PE.L2-3.10.4"],
    assessmentObjective: "Determine if maintenance equipment is secured and maintenance personnel performing remote maintenance are secured.",
    potentialAssessors: ["IT Manager", "Security Officer", "Maintenance Supervisor"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Maintenance Equipment Security Procedures",
      "Component Disposal Procedures",
      "Replaced Component Tracking",
      "Secure Maintenance Documentation",
      "Maintenance Tool Storage Policy"
    ],
    interviewQuestions: [
      "How are replaced components handled?",
      "Are old hard drives/drives secured?",
      "Where is maintenance equipment stored?",
      "How is maintenance documentation protected?"
    ],
    testMethods: ["examine", "interview"]
  },

  // ============================================
  // MEDIA PROTECTION (MP)
  // ============================================
  {
    id: "MP.L1-3.8.3",
    family: "MP",
    level: 1,
    number: "3.8.3",
    title: "Sanitize Media",
    description: "Sanitize or destroy information system media containing CUI before disposal or release for reuse.",
    discussion: "Media sanitization ensures CUI cannot be recovered from discarded media. Methods include degaussing, overwriting, encryption destruction, and physical destruction. The method should match the media type and sensitivity level.",
    relatedControls: ["MP.L2-3.8.6", "MP.L2-3.8.7", "MA.L2-3.7.3"],
    assessmentObjective: "Determine if media containing CUI is sanitized or destroyed before disposal or reuse.",
    potentialAssessors: ["IT Manager", "Security Officer", "Compliance Officer"],
    cmmcLevel: 1,
    commonArtifacts: [
      "Media Sanitization Policy",
      "Sanitization Procedures by Media Type",
      "Sanitization Verification Records",
      "Certificate of Destruction",
      "Approved Sanitization Tools List"
    ],
    interviewQuestions: [
      "What sanitization methods are used?",
      "How is sanitization verified?",
      "Who performs media sanitization?",
      "Are destruction certificates maintained?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "MP.L1-3.8.6",
    family: "MP",
    level: 1,
    number: "3.8.6",
    title: "Control Access to Media",
    description: "Limit access to CUI on information system media to authorized users.",
    discussion: "Media access controls protect CUI stored on removable media, backup tapes, and other storage devices. Physical and logical access controls should restrict access to authorized personnel only.",
    relatedControls: ["MP.L1-3.8.3", "AC.L1-3.1.1", "PE.L1-3.10.1"],
    assessmentObjective: "Determine if access to CUI on media is limited to authorized users.",
    potentialAssessors: ["Security Officer", "IT Manager", "System Administrator"],
    cmmcLevel: 1,
    commonArtifacts: [
      "Media Access Policy",
      "Media Inventory",
      "Access Control Logs",
      "Media Storage Security",
      "Media Handling Procedures"
    ],
    interviewQuestions: [
      "Who can access media containing CUI?",
      "How is media access controlled?",
      "Is media stored securely?",
      "How is media tracked and inventoried?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "MP.L2-3.8.1",
    family: "MP",
    level: 2,
    number: "3.8.1",
    title: "Protect CUI During Transport",
    description: "Protect (i.e., physically control and securely store) system media containing CUI during transport outside of controlled areas.",
    discussion: "Media transported outside secure areas should be protected from loss, theft, and unauthorized access. This includes encryption, tamper-evident packaging, tracking, and limiting transport to authorized couriers.",
    relatedControls: ["MP.L1-3.8.3", "SC.L1-3.13.11", "PE.L2-3.10.4"],
    assessmentObjective: "Determine if system media containing CUI is protected during transport outside controlled areas.",
    potentialAssessors: ["Security Officer", "IT Manager", "Logistics Coordinator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Media Transport Policy",
      "Encryption for Media Transport",
      "Transport Tracking Records",
      "Tamper-Evident Packaging Procedures",
      "Authorized Courier List"
    ],
    interviewQuestions: [
      "How is media protected during transport?",
      "Is media encrypted for transport?",
      "How is media tracked?",
      "Who can transport media containing CUI?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "MP.L2-3.8.2",
    family: "MP",
    level: 2,
    number: "3.8.2",
    title: "Limit Media Storage Capacity",
    description: "Limit system media to no more than one classification level or sensitivity level.",
    discussion: "Mixed sensitivity levels on the same media complicate access control and sanitization. Media should contain only one classification/sensitivity level to simplify handling and disposal decisions.",
    relatedControls: ["MP.L1-3.8.3", "AC.L2-3.1.4", "MP.L2-3.8.5"],
    assessmentObjective: "Determine if system media are limited to no more than one classification or sensitivity level.",
    potentialAssessors: ["Data Owner", "IT Manager", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Media Classification Policy",
      "Data Sensitivity Guidelines",
      "Media Labeling Standards",
      "Mixed Media Handling Exceptions",
      "Data Segregation Procedures"
    ],
    interviewQuestions: [
      "Are media restricted to one sensitivity level?",
      "How is mixed sensitivity handled?",
      "How are media labeled?",
      "Are there exceptions to this policy?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "MP.L2-3.8.4",
    family: "MP",
    level: 2,
    number: "3.8.4",
    title: "Mark Media with Distribution Limitations",
    description: "Mark system media indicating the distribution limitations, handling caveats, and applicable security markings.",
    discussion: "Media marking ensures handlers understand protection requirements. Markings should include distribution limitations, CUI category, and any special handling instructions. Labels should be durable and visible.",
    relatedControls: ["MP.L1-3.8.6", "AC.L2-3.1.3", "MP.L2-3.8.5"],
    assessmentObjective: "Determine if media is marked to indicate distribution limitations, handling caveats, and security markings.",
    potentialAssessors: ["Data Owner", "Security Officer", "IT Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Media Marking Procedures",
      "Label Templates and Standards",
      "CUI Category Markings",
      "Distribution Limitation Labels",
      "Marked Media Examples"
    ],
    interviewQuestions: [
      "How is media marked?",
      "What markings are required?",
      "Are labels durable?",
      "Who applies media markings?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "MP.L2-3.8.5",
    family: "MP",
    level: 2,
    number: "3.8.5",
    title: "Control Media with Legal Holds",
    description: "Control system media using organization-defined process for media holding, transport, and sanitization actions.",
    discussion: "Legal holds may require retention of data beyond normal schedules. Media subject to legal holds must be identified, tracked, and protected from premature sanitization or destruction.",
    relatedControls: ["MP.L1-3.8.3", "MP.L2-3.8.4", "AU.L2-3.3.1"],
    assessmentObjective: "Determine if media is controlled for holding, transport, and sanitization per organizational procedures.",
    potentialAssessors: ["Legal Counsel", "IT Manager", "Compliance Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Legal Hold Procedures",
      "Media Retention Policy",
      "Legal Hold Tracking System",
      "Hold Release Procedures",
      "Audit Records for Held Media"
    ],
    interviewQuestions: [
      "How are legal holds identified?",
      "What happens to media under legal hold?",
      "How is legal hold status tracked?",
      "Who can release legal holds?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "MP.L2-3.8.7",
    family: "MP",
    level: 2,
    number: "3.8.7",
    title: "Control Use of Portable Storage",
    description: "Prohibit the use of portable storage devices in organizational systems when such devices have no identifiable owner.",
    discussion: "Unowned portable storage devices pose significant security risks as they may contain malware or be used for data exfiltration. Only organization-owned and managed portable storage should be permitted.",
    relatedControls: ["MP.L1-3.8.6", "AC.L2-3.1.17", "SI.L2-3.14.1"],
    assessmentObjective: "Determine if unowned portable storage devices are prohibited from use in organizational systems.",
    potentialAssessors: ["IT Manager", "Security Officer", "Endpoint Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Portable Storage Policy",
      "Device Ownership Verification",
      "USB Device Control Configuration",
      "Authorized Device Inventory",
      "Unowned Device Blocking Records"
    ],
    interviewQuestions: [
      "Are personal USB devices allowed?",
      "How is device ownership verified?",
      "Are unowned devices automatically blocked?",
      "What exceptions exist for portable storage?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "MP.L2-3.8.8",
    family: "MP",
    level: 2,
    number: "3.8.8",
    title: "Prohibit Use of Unidentified Portable Storage",
    description: "Prohibit the use of portable storage devices when such devices have no identifiable owner.",
    discussion: "This control extends the portable storage controls to explicitly prohibit devices that cannot be attributed to an identified owner. Ownership identification enables accountability and traceability for data stored on portable media.",
    relatedControls: ["MP.L2-3.8.7", "MP.L1-3.8.6", "AC.L2-3.1.17"],
    assessmentObjective: "Determine if portable storage devices without identifiable owners are prohibited.",
    potentialAssessors: ["IT Manager", "Security Officer", "Endpoint Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Portable Storage Ownership Policy",
      "Device Registration Procedures",
      "USB Blocking Configuration",
      "Device Ownership Records",
      "Endpoint Security Tool Configuration"
    ],
    interviewQuestions: [
      "How is ownership of portable storage verified?",
      "Are found or unregistered devices blocked?",
      "What is the process for registering portable storage?",
      "How are violations handled?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "MP.L2-3.8.9",
    family: "MP",
    level: 2,
    number: "3.8.9",
    title: "Protect Backups of CUI",
    description: "Protect the confidentiality of backup CUI at storage locations.",
    discussion: "Backup copies of CUI must receive the same protection as the original data. This includes encryption of backup media, secure storage locations, access controls, and protection during transport to offsite locations.",
    relatedControls: ["MP.L1-3.8.3", "MP.L2-3.8.1", "SC.L1-3.13.11"],
    assessmentObjective: "Determine if the confidentiality of backup CUI at storage locations is protected.",
    potentialAssessors: ["Backup Administrator", "Security Engineer", "IT Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Backup Encryption Policy",
      "Offsite Backup Security Procedures",
      "Backup Media Access Controls",
      "Backup Storage Facility Security",
      "Backup Encryption Verification Records"
    ],
    interviewQuestions: [
      "How are backup copies of CUI protected?",
      "Are backups encrypted at rest?",
      "How are offsite backups secured?",
      "Who has access to backup media?"
    ],
    testMethods: ["examine", "interview"]
  },

  // ============================================
  // PHYSICAL PROTECTION (PE)
  // ============================================
  {
    id: "PE.L1-3.10.1",
    family: "PE",
    level: 1,
    number: "3.10.1",
    title: "Limit Physical Access",
    description: "Limit physical access to organizational systems, equipment, and the respective operating environments to authorized individuals.",
    discussion: "Physical access controls protect systems from unauthorized tampering, theft, and observation. This includes locks, access cards, guards, and visitor controls. CUI processing areas require appropriate physical security.",
    relatedControls: ["PE.L1-3.10.3", "PE.L2-3.10.4", "AC.L1-3.1.1"],
    assessmentObjective: "Determine if physical access to systems, equipment, and operating environments is limited to authorized individuals.",
    potentialAssessors: ["Facility Security Officer", "Physical Security Manager"],
    cmmcLevel: 1,
    commonArtifacts: [
      "Physical Security Policy",
      "Access Control Lists",
      "Badge/Key Records",
      "Visitor Log",
      "Physical Security Inspection Records"
    ],
    interviewQuestions: [
      "Who has physical access to systems?",
      "How is physical access controlled?",
      "Are visitors escorted?",
      "How are access rights reviewed?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "PE.L1-3.10.3",
    family: "PE",
    level: 1,
    number: "3.10.3",
    title: "Escort Visitors",
    description: "Escort visitors and monitor visitor activity.",
    discussion: "Visitor escorts prevent unauthorized access and ensure visitors only enter approved areas. Monitoring may include sign-in/out procedures, badge requirements, and surveillance in sensitive areas.",
    relatedControls: ["PE.L1-3.10.1", "PE.L2-3.10.4", "PS.L2-3.9.1"],
    assessmentObjective: "Determine if visitors are escorted and their activity monitored.",
    potentialAssessors: ["Facility Security Officer", "Reception/Security Staff"],
    cmmcLevel: 1,
    commonArtifacts: [
      "Visitor Policy",
      "Visitor Sign-In Log",
      "Visitor Badge Records",
      "Escort Procedures",
      "Visitor Monitoring Records"
    ],
    interviewQuestions: [
      "Are visitors escorted?",
      "How are visitors identified?",
      "What areas can visitors access?",
      "How is visitor activity monitored?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "PE.L2-3.10.2",
    family: "PE",
    level: 2,
    number: "3.10.2",
    title: "Monitor Physical Access",
    description: "Monitor and control physical access to the facility and to organizational systems.",
    discussion: "Physical access monitoring includes intrusion detection systems, surveillance cameras, access control logs, and guard patrols. Monitoring should cover entry/exit points and sensitive areas containing CUI.",
    relatedControls: ["PE.L1-3.10.1", "PE.L2-3.10.4", "AU.L2-3.3.1"],
    assessmentObjective: "Determine if physical access to the facility and systems is monitored and controlled.",
    potentialAssessors: ["Physical Security Manager", "Facility Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Surveillance System Records",
      "Access Control System Logs",
      "Intrusion Detection System Logs",
      "Guard Patrol Records",
      "Physical Access Monitoring Policy"
    ],
    interviewQuestions: [
      "How is physical access monitored?",
      "Are surveillance cameras used?",
      "How long are access logs retained?",
      "Who reviews physical access logs?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "PE.L2-3.10.4",
    family: "PE",
    level: 2,
    number: "3.10.4",
    title: "Maintain Audit Logs of Physical Access",
    description: "Maintain audit logs of physical access.",
    discussion: "Physical access audit logs provide evidence of who entered sensitive areas and when. Logs should be retained for investigation purposes and protected from tampering. Reviews should identify anomalies.",
    relatedControls: ["PE.L2-3.10.2", "PE.L2-3.10.5", "AU.L2-3.3.1"],
    assessmentObjective: "Determine if audit logs of physical access are maintained.",
    potentialAssessors: ["Physical Security Manager", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Physical Access Logs",
      "Access Control System Reports",
      "Log Review Procedures",
      "Log Retention Policy",
      "Physical Access Audit Records"
    ],
    interviewQuestions: [
      "What physical access is logged?",
      "How long are logs retained?",
      "Are logs reviewed regularly?",
      "How are physical access logs protected?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "PE.L2-3.10.5",
    family: "PE",
    level: 2,
    number: "3.10.5",
    title: "Manage Physical Access Devices",
    description: "Control and manage physical access devices.",
    discussion: "Physical access devices include keys, access cards, biometric readers, and PIN pads. These should be inventoried, assigned to individuals, and recovered upon termination or loss. Lost devices should be immediately deactivated.",
    relatedControls: ["PE.L1-3.10.1", "PE.L2-3.10.4", "PS.L2-3.9.1"],
    assessmentObjective: "Determine if physical access devices are controlled and managed.",
    potentialAssessors: ["Physical Security Manager", "Facility Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Access Device Inventory",
      "Key/Card Assignment Records",
      "Device Deactivation Records",
      "Lost Device Reports",
      "Device Return Procedures"
    ],
    interviewQuestions: [
      "How are access devices inventoried?",
      "What happens when devices are lost?",
      "Are devices recovered upon termination?",
      "How are lost devices deactivated?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "PE.L2-3.10.6",
    family: "PE",
    level: 2,
    number: "3.10.6",
    title: "Enforce Physical Access Authorizations",
    description: "Enforce physical access authorizations to CUI and the information system.",
    discussion: "Physical access authorizations should be role-based and reviewed periodically. Separation of duties should prevent any single individual from having unrestricted physical access. High-risk areas may require two-person access.",
    relatedControls: ["PE.L1-3.10.1", "AC.L2-3.1.5", "AC.L2-3.1.7"],
    assessmentObjective: "Determine if physical access authorizations to CUI and systems are enforced.",
    potentialAssessors: ["Facility Security Officer", "Security Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Physical Access Authorization Matrix",
      "Access Approval Records",
      "Periodic Access Review Documentation",
      "Two-Person Access Records",
      "Access Revocation Records"
    ],
    interviewQuestions: [
      "How are physical access rights determined?",
      "Are physical access rights reviewed?",
      "Is there separation of duties for physical access?",
      "How are physical access rights revoked?"
    ],
    testMethods: ["examine", "interview"]
  },

  // ============================================
  // PERSONNEL SECURITY (PS)
  // ============================================
  {
    id: "PS.L2-3.9.1",
    family: "PS",
    level: 2,
    number: "3.9.1",
    title: "Screen Personnel",
    description: "Screen personnel prior to authorizing access to organizational systems containing CUI.",
    discussion: "Personnel screening helps ensure individuals with access to CUI are trustworthy. Screening may include background checks, reference verification, and verification of qualifications based on position risk level and CUI sensitivity.",
    relatedControls: ["PS.L2-3.9.2", "PE.L1-3.10.1", "IA.L1-3.5.1"],
    assessmentObjective: "Determine if personnel are screened prior to being authorized access to systems containing CUI.",
    potentialAssessors: ["HR Manager", "Security Officer", "Hiring Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Personnel Screening Policy",
      "Background Check Procedures",
      "Screening Records",
      "Position Risk Designations",
      "Screening Criteria by Position"
    ],
    interviewQuestions: [
      "What screening is required for CUI access?",
      "How are background checks conducted?",
      "Are contractors screened?",
      "How is screening documented?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "PS.L2-3.9.2",
    family: "PS",
    level: 2,
    number: "3.9.2",
    title: "Ensure Personnel Actions",
    description: "Ensure that organizational personnel are adequately trained to carry out their assigned information security-related duties and responsibilities.",
    discussion: "Personnel must understand their security responsibilities before being granted access to CUI systems. Training should be role-specific and provided before access authorization and periodically thereafter.",
    relatedControls: ["PS.L2-3.9.1", "AT.L1-3.2.1", "AT.L2-3.2.2"],
    assessmentObjective: "Determine if personnel are adequately trained for their assigned security-related duties and responsibilities.",
    potentialAssessors: ["Training Officer", "HR Manager", "Security Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Role-Based Training Matrix",
      "Training Completion Records",
      "Security Responsibility Documentation",
      "Training Curriculum by Role",
      "Pre-Access Training Verification"
    ],
    interviewQuestions: [
      "What training is required before CUI access?",
      "How is training completion verified?",
      "Is training role-specific?",
      "How often is refresher training provided?"
    ],
    testMethods: ["examine", "interview"]
  },

  // ============================================
  // RISK ASSESSMENT (RA)
  // ============================================
  {
    id: "RA.L2-3.11.1",
    family: "RA",
    level: 2,
    number: "3.11.1",
    title: "Identify Risks",
    description: "Identify organizational assets and the risks to those assets.",
    discussion: "Risk identification includes inventorying assets (hardware, software, data, facilities, personnel) and identifying threats and vulnerabilities that could affect those assets. This forms the basis for risk assessment and management decisions.",
    relatedControls: ["RA.L2-3.11.2", "RA.L2-3.11.3", "CM.L2-3.4.1"],
    assessmentObjective: "Determine if organizational assets are identified and risks to those assets are identified.",
    potentialAssessors: ["Risk Manager", "Security Officer", "IT Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Asset Inventory",
      "Risk Register",
      "Threat Assessment",
      "Vulnerability Assessment",
      "Risk Identification Procedures"
    ],
    interviewQuestions: [
      "What assets are identified?",
      "What threats are considered?",
      "How are risks identified?",
      "How often is risk identification performed?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "RA.L2-3.11.2",
    family: "RA",
    level: 2,
    number: "3.11.2",
    title: "Scan for Vulnerabilities",
    description: "Scan for vulnerabilities in organizational systems and applications periodically and when new vulnerabilities affecting those systems and applications are identified.",
    discussion: "Vulnerability scanning identifies security weaknesses that could be exploited. Scanning should cover networks, systems, and applications using automated tools and should be performed regularly and when new vulnerabilities are announced.",
    relatedControls: ["RA.L2-3.11.1", "SI.L2-3.14.1", "CM.L2-3.4.2"],
    assessmentObjective: "Determine if vulnerability scanning is performed periodically and when new vulnerabilities are identified.",
    potentialAssessors: ["Security Engineer", "Vulnerability Manager", "IT Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Vulnerability Scan Reports",
      "Scan Schedule and Records",
      "Vulnerability Database/Feed",
      "Scan Tool Configuration",
      "Remediation Tracking"
    ],
    interviewQuestions: [
      "How often are vulnerability scans performed?",
      "What systems are scanned?",
      "What happens when new vulnerabilities are announced?",
      "How are scan results used?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "RA.L2-3.11.3",
    family: "RA",
    level: 2,
    number: "3.11.3",
    title: "Remediate Vulnerabilities",
    description: "Remediate vulnerabilities in accordance with assessments of risk.",
    discussion: "Vulnerability remediation prioritizes fixes based on risk severity. High-risk vulnerabilities should be addressed quickly, while lower-risk issues may be accepted with compensating controls or scheduled for later remediation.",
    relatedControls: ["RA.L2-3.11.2", "CM.L2-3.4.3", "IR.L2-3.6.1"],
    assessmentObjective: "Determine if vulnerabilities are remediated in accordance with risk assessments.",
    potentialAssessors: ["IT Manager", "Security Officer", "System Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Vulnerability Remediation Records",
      "Risk-Based Prioritization Matrix",
      "Remediation Schedule",
      "Exception/Acceptance Documentation",
      "Patch Management Records"
    ],
    interviewQuestions: [
      "How are remediation priorities determined?",
      "What is the timeline for critical fixes?",
      "Are low-risk vulnerabilities ever accepted?",
      "How is remediation tracked?"
    ],
    testMethods: ["examine", "interview"]
  },

  // ============================================
  // SECURITY ASSESSMENT (CA)
  // ============================================
  {
    id: "CA.L2-3.12.1",
    family: "CA",
    level: 2,
    number: "3.12.1",
    title: "Periodically Assess Security Controls",
    description: "Periodically assess the security controls in organizational systems to determine if the controls are effective in their application.",
    discussion: "Security control assessments verify that implemented controls are working as intended. Assessments should evaluate both technical implementation and operational effectiveness, identifying deficiencies and areas for improvement.",
    relatedControls: ["CA.L2-3.12.2", "CA.L2-3.12.3", "RA.L2-3.11.1"],
    assessmentObjective: "Determine if security controls are periodically assessed for effectiveness.",
    potentialAssessors: ["Assessor", "Security Officer", "Compliance Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Security Assessment Plan",
      "Assessment Reports",
      "Control Testing Results",
      "Assessment Schedule",
      "Assessor Qualifications"
    ],
    interviewQuestions: [
      "How often are security controls assessed?",
      "Who performs the assessments?",
      "What controls are assessed?",
      "How are assessment results used?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "CA.L2-3.12.2",
    family: "CA",
    level: 2,
    number: "3.12.2",
    title: "Develop Security Assessment Plans",
    description: "Develop and implement plans for security control assessments.",
    discussion: "Assessment plans define the scope, objectives, methods, and schedule for security control assessments. Plans should be based on risk and should cover all security controls implemented to protect CUI.",
    relatedControls: ["CA.L2-3.12.1", "CA.L2-3.12.3", "RA.L2-3.11.1"],
    assessmentObjective: "Determine if plans for security control assessments are developed and implemented.",
    potentialAssessors: ["Assessor", "Security Officer", "Compliance Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Security Assessment Plan",
      "Assessment Procedures",
      "Scope and Objectives Documentation",
      "Assessment Methodology",
      "Assessment Schedule"
    ],
    interviewQuestions: [
      "What is the assessment plan?",
      "How is assessment scope determined?",
      "What methods are used?",
      "How are assessors selected?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "CA.L2-3.12.3",
    family: "CA",
    level: 2,
    number: "3.12.3",
    title: "Monitor Security Controls",
    description: "Monitor security controls on an ongoing basis to ensure the continued effectiveness of the controls.",
    discussion: "Continuous monitoring ensures security controls remain effective over time as systems and threats evolve. Monitoring includes automated checks, metrics collection, periodic reviews, and event-driven assessments.",
    relatedControls: ["CA.L2-3.12.1", "AU.L2-3.3.1", "RA.L2-3.11.2"],
    assessmentObjective: "Determine if security controls are monitored on an ongoing basis.",
    potentialAssessors: ["Security Officer", "Compliance Manager", "System Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Continuous Monitoring Plan",
      "Monitoring Metrics",
      "Automated Monitoring Tool Configuration",
      "Monitoring Reports",
      "Control Performance Dashboards"
    ],
    interviewQuestions: [
      "How are controls monitored?",
      "What metrics are tracked?",
      "Are there automated monitoring tools?",
      "How are monitoring results reviewed?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "CA.L2-3.12.4",
    family: "CA",
    level: 2,
    number: "3.12.4",
    title: "Develop System Security Plans",
    description: "Develop, document, and periodically update system security plans that describe system boundaries, system environments of operation, how security requirements are implemented, and the relationships with or connections to other systems.",
    discussion: "System Security Plans (SSPs) are the primary documentation artifact for CMMC compliance. They describe the system boundary, the CUI environment, implemented security controls, and how the organization meets each requirement. SSPs must be kept current as systems and environments change.",
    relatedControls: ["CA.L2-3.12.1", "CA.L2-3.12.2", "CA.L2-3.12.3"],
    assessmentObjective: "Determine if system security plans are developed, documented, and periodically updated.",
    potentialAssessors: ["Security Officer", "Compliance Manager", "System Owner"],
    cmmcLevel: 2,
    commonArtifacts: [
      "System Security Plan (SSP)",
      "System Boundary Documentation",
      "CUI Environment Description",
      "Control Implementation Statements",
      "System Interconnection Agreements",
      "SSP Review and Update Records"
    ],
    interviewQuestions: [
      "Is there a documented System Security Plan?",
      "How often is the SSP reviewed and updated?",
      "Does the SSP describe the system boundary?",
      "Are all security controls documented in the SSP?"
    ],
    testMethods: ["examine", "interview"]
  },

  // ============================================
  // SYSTEM AND COMMUNICATIONS PROTECTION (SC)
  // ============================================
  {
    id: "SC.L1-3.13.1",
    family: "SC",
    level: 1,
    number: "3.13.1",
    title: "Monitor and Control Communications",
    description: "Monitor and control communications at the external boundary of the system and at key internal boundaries within the system.",
    discussion: "Boundary protection controls the flow of information between trusted and untrusted networks. This includes firewalls, proxies, gateways, and network segmentation to protect CUI from unauthorized access.",
    relatedControls: ["SC.L1-3.13.5", "SC.L2-3.13.6", "AC.L2-3.1.3"],
    assessmentObjective: "Determine if communications are monitored and controlled at external and key internal boundaries.",
    potentialAssessors: ["Network Administrator", "Security Engineer", "System Architect"],
    cmmcLevel: 1,
    commonArtifacts: [
      "Network Boundary Diagrams",
      "Firewall Configuration",
      "DMZ Architecture Documentation",
      "Network Segmentation Plan",
      "Boundary Protection Policy"
    ],
    interviewQuestions: [
      "What network boundaries exist?",
      "How are external boundaries protected?",
      "What internal boundaries are protected?",
      "What tools monitor network traffic?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "SC.L1-3.13.5",
    family: "SC",
    level: 1,
    number: "3.13.5",
    title: "Implement Subnetworks",
    description: "Implement subnetworks for publicly accessible system components that are physically or logically separated from internal networks.",
    discussion: "Subnetworks (DMZs) isolate public-facing components from internal systems. This limits exposure if public components are compromised and prevents direct access to CUI environments from untrusted networks.",
    relatedControls: ["SC.L1-3.13.1", "SC.L2-3.13.6", "AC.L2-3.1.4"],
    assessmentObjective: "Determine if subnetworks separate publicly accessible components from internal networks.",
    potentialAssessors: ["Network Administrator", "Security Engineer"],
    cmmcLevel: 1,
    commonArtifacts: [
      "DMZ Architecture Documentation",
      "Network Segmentation Diagrams",
      "Firewall Rules for DMZ",
      "Subnet Configuration",
      "Network Topology Maps"
    ],
    interviewQuestions: [
      "Is there a DMZ for public-facing systems?",
      "How is the DMZ separated from internal networks?",
      "What systems are in the DMZ?",
      "How is traffic controlled between DMZ and internal?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SC.L1-3.13.11",
    family: "SC",
    level: 1,
    number: "3.13.11",
    title: "Encrypt CUI at Rest",
    description: "Employ cryptographic mechanisms to protect the confidentiality of CUI at rest.",
    discussion: "Encryption at rest protects CUI stored on systems, databases, and storage media. This includes full disk encryption, database encryption, and file/folder encryption using approved cryptographic algorithms.",
    relatedControls: ["SC.L2-3.13.12", "AC.L1-3.1.20", "MP.L1-3.8.6"],
    assessmentObjective: "Determine if cryptographic mechanisms are used to protect CUI at rest.",
    potentialAssessors: ["Security Engineer", "System Administrator", "Database Administrator"],
    cmmcLevel: 1,
    commonArtifacts: [
      "Encryption Policy",
      "Full Disk Encryption Configuration",
      "Database Encryption Settings",
      "Key Management Documentation",
      "Encryption Algorithm Standards"
    ],
    interviewQuestions: [
      "Where is CUI encrypted at rest?",
      "What encryption algorithms are used?",
      "How are encryption keys managed?",
      "How is encryption compliance verified?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "SC.L2-3.13.2",
    family: "SC",
    level: 2,
    number: "3.13.2",
    title: "Deny Network Traffic by Default",
    description: "Employ architectural designs, software development techniques, and systems engineering principles that promote effective information security.",
    discussion: "Default-deny posture ensures only explicitly allowed traffic can flow through network boundaries. This reduces attack surface by blocking unnecessary protocols, ports, and services by default.",
    relatedControls: ["SC.L1-3.13.1", "SC.L2-3.13.5", "CM.L2-3.4.6"],
    assessmentObjective: "Determine if default-deny rules are implemented for network traffic.",
    potentialAssessors: ["Network Administrator", "Security Engineer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Default-Deny Firewall Rules",
      "Allow List/Whitelist Documentation",
      "Rule Review Records",
      "Port/Protocol Justification",
      "Network Traffic Flow Analysis"
    ],
    interviewQuestions: [
      "Is default-deny implemented?",
      "How are allowed rules justified?",
      "Are there any default-allow rules?",
      "How often are rules reviewed?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "SC.L2-3.13.3",
    family: "SC",
    level: 2,
    number: "3.13.3",
    title: "Prevent Unauthorized Network Access",
    description: "Separate user functionality from system management functionality.",
    discussion: "Separating user and management functions prevents users from directly accessing critical security functions. Administrative interfaces should be isolated and protected with additional security controls.",
    relatedControls: ["SC.L1-3.13.1", "AC.L2-3.1.5", "AC.L2-3.1.7"],
    assessmentObjective: "Determine if user functionality is separated from system management functionality.",
    potentialAssessors: ["System Administrator", "Security Engineer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Separation of Duties Matrix",
      "Admin Interface Isolation",
      "Role-Based Access Configuration",
      "Management Network Documentation",
      "Jump Server/Bastion Host Configuration"
    ],
    interviewQuestions: [
      "How are admin and user functions separated?",
      "Are management interfaces on separate networks?",
      "Who can access management functions?",
      "How is administrative access controlled?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SC.L2-3.13.4",
    family: "SC",
    level: 2,
    number: "3.13.4",
    title: "Prevent Split Tunneling",
    description: "Prevent unauthorized remote devices from establishing non-remote connections with organizational systems.",
    discussion: "Split tunneling can bypass security controls by allowing remote devices to simultaneously connect to the organizational network and untrusted networks. This control prevents such dual-homed configurations.",
    relatedControls: ["SC.L1-3.13.1", "AC.L2-3.1.13", "SC.L2-3.13.6"],
    assessmentObjective: "Determine if unauthorized remote devices are prevented from establishing non-remote connections.",
    potentialAssessors: ["Network Administrator", "Security Engineer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Split Tunneling Prevention Configuration",
      "VPN Client Settings",
      "Network Access Control Rules",
      "Remote Access Policy",
      "Split Tunneling Assessment Reports"
    ],
    interviewQuestions: [
      "Is split tunneling allowed?",
      "How is split tunneling prevented?",
      "Are remote devices restricted to VPN only?",
      "How is this configuration enforced?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SC.L2-3.13.6",
    family: "SC",
    level: 2,
    number: "3.13.6",
    title: "Limit External System Connections",
    description: "Implement cryptographic or alternate physical protection for information at rest.",
    discussion: "Limiting external connections reduces attack exposure by controlling what external systems can connect to the organizational network. This includes restricting inbound/outbound connections and requiring justification for exceptions.",
    relatedControls: ["SC.L1-3.13.1", "SC.L2-3.13.2", "AC.L2-3.1.13"],
    assessmentObjective: "Determine if external system connections are limited and controlled.",
    potentialAssessors: ["Network Administrator", "Security Engineer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "External Connection Inventory",
      "Connection Approval Records",
      "Firewall Rules for External Connections",
      "Business Justification Documents",
      "External Connection Monitoring"
    ],
    interviewQuestions: [
      "What external connections are allowed?",
      "How are external connections approved?",
      "Are external connections monitored?",
      "How are unauthorized connections blocked?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SC.L2-3.13.7",
    family: "SC",
    level: 2,
    number: "3.13.7",
    title: "Prevent Unauthorized Exfiltration",
    description: "Prevent unauthorized information transfer across boundaries.",
    discussion: "Data loss prevention (DLP) controls prevent unauthorized exfiltration of CUI. This includes network-based DLP, endpoint DLP, email filtering, and monitoring for unusual data transfer patterns.",
    relatedControls: ["SC.L1-3.13.1", "AC.L2-3.1.3", "MP.L1-3.8.3"],
    assessmentObjective: "Determine if unauthorized information transfer across boundaries is prevented.",
    potentialAssessors: ["Security Engineer", "Network Administrator", "DLP Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "DLP Policy and Configuration",
      "Data Classification Rules",
      "DLP Monitoring Reports",
      "Email Filtering Configuration",
      "Exfiltration Prevention Controls"
    ],
    interviewQuestions: [
      "How is data exfiltration prevented?",
      "What DLP tools are used?",
      "How are data transfers monitored?",
      "What happens when exfiltration is detected?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "SC.L2-3.13.8",
    family: "SC",
    level: 2,
    number: "3.13.8",
    title: "Implement Cryptographic Protection",
    description: "Implement cryptographic mechanisms to prevent unauthorized disclosure of CUI during transmission.",
    discussion: "Encryption in transit protects CUI from interception during transmission over networks. This includes TLS/SSL for web traffic, VPNs for remote access, and encrypted email for sensitive communications.",
    relatedControls: ["SC.L1-3.13.11", "SC.L2-3.13.12", "AC.L2-3.1.13"],
    assessmentObjective: "Determine if cryptographic mechanisms are implemented to protect CUI during transmission.",
    potentialAssessors: ["Security Engineer", "Network Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "TLS/SSL Configuration",
      "VPN Configuration",
      "Certificate Management",
      "Encryption Protocol Documentation",
      "In-Transit Encryption Policy"
    ],
    interviewQuestions: [
      "What encryption is used for data in transit?",
      "Are weak protocols disabled (SSLv3, TLS 1.0)?",
      "How are certificates managed?",
      "How is encryption compliance verified?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "SC.L2-3.13.9",
    family: "SC",
    level: 2,
    number: "3.13.9",
    title: "Protect CUI in Backup Storage",
    description: "Protect the confidentiality of backup information at storage locations.",
    discussion: "Backup data must be protected with the same security controls as primary CUI storage. This includes encryption of backups, secure storage locations, and access controls on backup systems.",
    relatedControls: ["SC.L1-3.13.11", "SC.L2-3.13.12", "MP.L1-3.8.6"],
    assessmentObjective: "Determine if the confidentiality of backup information is protected at storage locations.",
    potentialAssessors: ["Backup Administrator", "Security Engineer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Backup Encryption Configuration",
      "Backup Storage Security",
      "Offsite Backup Protection",
      "Backup Access Controls",
      "Backup Security Procedures"
    ],
    interviewQuestions: [
      "Are backups encrypted?",
      "How are offsite backups protected?",
      "Who has access to backups?",
      "How are backup locations secured?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SC.L2-3.13.10",
    family: "SC",
    level: 2,
    number: "3.13.10",
    title: "Establish Trusted Communications",
    description: "Establish and manage trusted communication channels for use by the organization.",
    discussion: "Trusted communications channels ensure that sensitive communications are protected from interception and tampering. This includes approved VPNs, encrypted messaging, and secure email gateways.",
    relatedControls: ["SC.L2-3.13.8", "SC.L1-3.13.1", "AC.L2-3.1.12"],
    assessmentObjective: "Determine if trusted communication channels are established and managed.",
    potentialAssessors: ["Network Administrator", "Security Engineer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Trusted Channel Documentation",
      "Approved VPN Configuration",
      "Secure Communication Standards",
      "Channel Monitoring Records",
      "Certificate Management for Channels"
    ],
    interviewQuestions: [
      "What are the trusted communication channels?",
      "How are channels verified as trusted?",
      "Are untrusted channels blocked?",
      "How are channel compromises detected?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SC.L2-3.13.12",
    family: "SC",
    level: 2,
    number: "3.13.12",
    title: "Implement FIPS-Validated Cryptography",
    description: "Implement FIPS-validated cryptography to protect CUI.",
    discussion: "FIPS-validated cryptographic modules meet NIST standards for cryptographic security. Using validated cryptography ensures that encryption implementations have been tested and approved for protecting sensitive information.",
    relatedControls: ["SC.L1-3.13.11", "SC.L2-3.13.8", "SC.L2-3.13.9"],
    assessmentObjective: "Determine if FIPS-validated cryptography is implemented to protect CUI.",
    potentialAssessors: ["Security Engineer", "Compliance Officer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "FIPS Validation Certificates",
      "Cryptographic Module Documentation",
      "Algorithm Implementation Records",
      "Vendor FIPS Compliance Statements",
      "Cryptographic Inventory"
    ],
    interviewQuestions: [
      "Is FIPS-validated cryptography used?",
      "What modules have FIPS validation?",
      "How is FIPS mode enforced?",
      "Are non-FIPS algorithms disabled?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SC.L2-3.13.13",
    family: "SC",
    level: 2,
    number: "3.13.13",
    title: "Control CUI in Shared Systems",
    description: "Control CUI in shared systems or system components in accordance with security requirements.",
    discussion: "Shared systems or components must implement controls to prevent unauthorized access to CUI by other users of the shared resource. This includes multi-tenant cloud environments and shared hosting.",
    relatedControls: ["SC.L1-3.13.1", "AC.L2-3.1.4", "AC.L2-3.1.21"],
    assessmentObjective: "Determine if CUI is controlled in shared systems according to security requirements.",
    potentialAssessors: ["System Administrator", "Cloud Security Architect"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Shared System Security Configuration",
      "Tenant Isolation Documentation",
      "Access Control Lists",
      "Resource Segregation Policies",
      "Shared System Risk Assessment"
    ],
    interviewQuestions: [
      "How is CUI isolated in shared systems?",
      "What separation exists between tenants?",
      "Are shared systems approved for CUI?",
      "How is co-tenancy risk managed?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SC.L2-3.13.14",
    family: "SC",
    level: 2,
    number: "3.13.14",
    title: "Protect Data in Transit Through External Systems",
    description: "Protect CUI passing through traffic exchange points.",
    discussion: "Data passing through external exchange points, such as internet exchange points or cloud service provider networks, requires additional protection to prevent exposure to unauthorized parties.",
    relatedControls: ["SC.L2-3.13.8", "SC.L1-3.13.1", "AC.L2-3.1.3"],
    assessmentObjective: "Determine if CUI passing through traffic exchange points is protected.",
    potentialAssessors: ["Network Administrator", "Security Engineer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Traffic Exchange Security",
      "End-to-End Encryption Documentation",
      "Exchange Point Risk Assessment",
      "Data Flow Mapping",
      "Encryption at Exchange Points"
    ],
    interviewQuestions: [
      "What traffic exchange points are used?",
      "How is data protected at exchange points?",
      "Is end-to-end encryption used?",
      "How are exchange points monitored?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SC.L2-3.13.15",
    family: "SC",
    level: 2,
    number: "3.13.15",
    title: "Protect Data at Rest on Mobile Devices",
    description: "Protect CUI on mobile devices and mobile computing platforms.",
    discussion: "Mobile devices require additional protection for CUI at rest due to their portable nature and higher risk of loss or theft. This includes full device encryption and remote wipe capabilities.",
    relatedControls: ["SC.L1-3.13.11", "AC.L1-3.1.20", "AC.L2-3.1.19"],
    assessmentObjective: "Determine if CUI on mobile devices is protected at rest.",
    potentialAssessors: ["Security Engineer", "Mobile Device Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Mobile Device Encryption",
      "MDM Configuration for Encryption",
      "Remote Wipe Configuration",
      "Mobile Security Policy",
      "Device Compliance Reports"
    ],
    interviewQuestions: [
      "Are mobile devices encrypted?",
      "What MDM policies enforce encryption?",
      "Is remote wipe enabled?",
      "How is mobile device compliance verified?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SC.L2-3.13.16",
    family: "SC",
    level: 2,
    number: "3.13.16",
    title: "Protect Data at Rest on Portable Storage",
    description: "Protect CUI at rest on removable media.",
    discussion: "Removable media containing CUI must be encrypted to protect against unauthorized access if lost or stolen. This includes USB drives, external hard drives, backup tapes, and other portable storage.",
    relatedControls: ["SC.L1-3.13.11", "MP.L1-3.8.6", "AC.L2-3.1.17"],
    assessmentObjective: "Determine if CUI at rest on removable media is protected.",
    potentialAssessors: ["Security Engineer", "Storage Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Removable Media Encryption Policy",
      "USB Encryption Configuration",
      "External Drive Encryption",
      "Media Handling Procedures",
      "Encrypted Backup Media"
    ],
    interviewQuestions: [
      "Is removable media encrypted?",
      "How is USB drive encryption enforced?",
      "What about backup tapes?",
      "How is media encryption verified?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SC.L3-3.13.17",
    family: "SC",
    level: 3,
    number: "3.13.17",
    title: "Implement Advanced Persistent Threat Protection",
    description: "Implement advanced persistent threat (APT) protection capabilities.",
    discussion: "APT protection includes advanced threat detection, behavioral analysis, sandboxing, and threat intelligence integration. These capabilities help detect and respond to sophisticated, targeted attacks.",
    relatedControls: ["SC.L2-3.13.7", "SI.L2-3.14.1", "IR.L2-3.6.1"],
    assessmentObjective: "Determine if APT protection capabilities are implemented.",
    potentialAssessors: ["Security Operations", "Threat Hunter", "SOC Manager"],
    cmmcLevel: 3,
    commonArtifacts: [
      "APT Protection Tools Configuration",
      "Threat Intelligence Integration",
      "Behavioral Analysis Rules",
      "Sandbox Configuration",
      "Threat Detection Reports"
    ],
    interviewQuestions: [
      "What APT protection tools are used?",
      "How is threat intelligence integrated?",
      "What behavioral analysis is performed?",
      "How are advanced threats detected?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SC.L3-3.13.18",
    family: "SC",
    level: 3,
    number: "3.13.18",
    title: "Implement DNS Security",
    description: "Implement Domain Name System (DNS) security controls.",
    discussion: "DNS security controls include DNSSEC for authentication, DNS filtering for malicious domains, and monitoring for DNS tunneling or other abuse. DNS is a critical infrastructure component requiring protection.",
    relatedControls: ["SC.L2-3.13.1", "SI.L2-3.14.1", "SC.L2-3.13.7"],
    assessmentObjective: "Determine if DNS security controls are implemented.",
    potentialAssessors: ["Network Administrator", "Security Engineer"],
    cmmcLevel: 3,
    commonArtifacts: [
      "DNS Security Configuration",
      "DNSSEC Implementation",
      "DNS Filtering Policy",
      "DNS Monitoring Logs",
      "Secure DNS Resolver Configuration"
    ],
    interviewQuestions: [
      "Is DNSSEC implemented?",
      "How is malicious DNS traffic blocked?",
      "Are DNS queries monitored?",
      "What DNS security services are used?"
    ],
    testMethods: ["examine", "interview"]
  },

  // ============================================
  // SYSTEM AND INFORMATION INTEGRITY (SI)
  // ============================================
  {
    id: "SI.L2-3.14.1",
    family: "SI",
    level: 2,
    number: "3.14.1",
    title: "Identify Malicious Content",
    description: "Identify, report, and correct information and information system flaws in a timely manner.",
    discussion: "Malicious content identification includes antivirus, anti-malware, and endpoint protection solutions. These tools detect and prevent malware infections that could compromise CUI or system integrity.",
    relatedControls: ["SI.L2-3.14.2", "SI.L2-3.14.3", "CM.L2-3.4.7"],
    assessmentObjective: "Determine if malicious content is identified and addressed.",
    potentialAssessors: ["Security Engineer", "Endpoint Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Antivirus/Anti-Malware Configuration",
      "Endpoint Protection Policy",
      "Malware Detection Logs",
      "Threat Intelligence Feeds",
      "Malware Analysis Reports"
    ],
    interviewQuestions: [
      "What tools detect malicious content?",
      "How are malware infections handled?",
      "Are zero-day threats addressed?",
      "How is malware reporting performed?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SI.L2-3.14.2",
    family: "SI",
    level: 2,
    number: "3.14.2",
    title: "Provide Malicious Code Protection",
    description: "Provide protection from malicious code at appropriate locations within organizational systems.",
    discussion: "Malicious code protection should be deployed at multiple layers including endpoints, email gateways, web proxies, and network perimeters. Layered defense provides better protection against various malware vectors.",
    relatedControls: ["SI.L2-3.14.1", "SI.L2-3.14.3", "SC.L1-3.13.1"],
    assessmentObjective: "Determine if malicious code protection is provided at appropriate locations.",
    potentialAssessors: ["Security Engineer", "Network Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Malware Protection Architecture",
      "Email Security Configuration",
      "Web Gateway Security",
      "Network-Based Malware Detection",
      "Layered Defense Documentation"
    ],
    interviewQuestions: [
      "Where is malware protection deployed?",
      "How is email malware filtered?",
      "Are web downloads scanned?",
      "Is there network-based malware detection?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SI.L2-3.14.3",
    family: "SI",
    level: 2,
    number: "3.14.3",
    title: "Monitor System Alerts",
    description: "Monitor system alerts and advisories and take action in response.",
    discussion: "Security alerts from operating systems, applications, and security tools must be monitored and acted upon. This includes vendor security advisories, threat intelligence, and internal security alerts.",
    relatedControls: ["SI.L2-3.14.1", "AU.L2-3.3.1", "IR.L2-3.6.1"],
    assessmentObjective: "Determine if system alerts and advisories are monitored and acted upon.",
    potentialAssessors: ["Security Operations", "SOC Analyst"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Alert Monitoring Procedures",
      "Security Advisory Tracking",
      "Alert Response Records",
      "Vendor Advisory Subscriptions",
      "Alert Escalation Procedures"
    ],
    interviewQuestions: [
      "How are security alerts monitored?",
      "What happens when alerts are triggered?",
      "Are vendor advisories tracked?",
      "How is alert response documented?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SI.L2-3.14.4",
    family: "SI",
    level: 2,
    number: "3.14.4",
    title: "Update Malicious Code Protection",
    description: "Update malicious code protection mechanisms when new releases are available.",
    discussion: "Malicious code protection requires regular updates to detect new threats. This includes signature updates, heuristic updates, and software patches for the protection mechanisms themselves.",
    relatedControls: ["SI.L2-3.14.1", "SI.L2-3.14.2", "CM.L2-3.4.2"],
    assessmentObjective: "Determine if malicious code protection mechanisms are updated when new releases are available.",
    potentialAssessors: ["Security Engineer", "Endpoint Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Update Schedule",
      "Signature Update Logs",
      "Version Tracking Records",
      "Automatic Update Configuration",
      "Update Testing Procedures"
    ],
    interviewQuestions: [
      "How often are malware definitions updated?",
      "Are updates automatic or manual?",
      "How are update failures handled?",
      "Are protection software versions current?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SI.L2-3.14.5",
    family: "SI",
    level: 2,
    number: "3.14.5",
    title: "Detect Unauthorized Software",
    description: "Detect and correct unauthorized use of software in organizational systems.",
    discussion: "Unauthorized software detection identifies installations that violate policy. This includes software inventory tools, application control solutions, and periodic scans for unauthorized applications.",
    relatedControls: ["CM.L2-3.4.7", "CM.L2-3.4.8", "AU.L2-3.3.1"],
    assessmentObjective: "Determine if unauthorized software use is detected and corrected.",
    potentialAssessors: ["IT Administrator", "Security Operations"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Software Inventory Reports",
      "Unauthorized Software Detection Logs",
      "Application Control Configuration",
      "Software Policy Violation Records",
      "Remediation Actions Documentation"
    ],
    interviewQuestions: [
      "How is unauthorized software detected?",
      "What happens when unauthorized software is found?",
      "How are exceptions handled?",
      "Is software use monitored continuously?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SI.L2-3.14.6",
    family: "SI",
    level: 2,
    number: "3.14.6",
    title: "Monitor Communications",
    description: "Monitor organizational systems for attacks and indicators of potential attacks.",
    discussion: "Continuous monitoring for attacks includes intrusion detection systems, log analysis, and threat hunting. Early detection enables faster response and reduces potential damage from successful attacks.",
    relatedControls: ["SI.L2-3.14.1", "AU.L2-3.3.1", "IR.L2-3.6.1"],
    assessmentObjective: "Determine if systems are monitored for attacks and attack indicators.",
    potentialAssessors: ["Security Operations", "SOC Analyst"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Intrusion Detection Configuration",
      "Attack Monitoring Rules",
      "Threat Detection Reports",
      "Log Analysis Records",
      "Security Event Correlation"
    ],
    interviewQuestions: [
      "What systems monitor for attacks?",
      "How are attack indicators detected?",
      "Are IDS/IPS tools used?",
      "How is monitoring information used?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SI.L2-3.14.7",
    family: "SI",
    level: 2,
    number: "3.14.7",
    title: "Identify Unauthorized Use",
    description: "Identify unauthorized use of organizational systems.",
    discussion: "Unauthorized use detection monitors for insider threats, account compromise, and policy violations. This includes behavioral analysis, anomaly detection, and user activity monitoring.",
    relatedControls: ["SI.L2-3.14.6", "AU.L2-3.3.1", "AT.L2-3.2.4"],
    assessmentObjective: "Determine if unauthorized use of organizational systems is identified.",
    potentialAssessors: ["Security Operations", "HR", "System Administrator"],
    cmmcLevel: 2,
    commonArtifacts: [
      "User Activity Monitoring",
      "Anomaly Detection Configuration",
      "Unauthorized Access Reports",
      "Behavioral Analysis Rules",
      "Insider Threat Detection"
    ],
    interviewQuestions: [
      "How is unauthorized use detected?",
      "What constitutes unauthorized use?",
      "How are anomalies identified?",
      "What happens when unauthorized use is detected?"
    ],
    testMethods: ["examine", "interview"]
  },

  // ============================================
  // SYSTEM AND SERVICES ACQUISITION (SA)
  // ============================================
  {
    id: "SA.L2-3.14.1",
    family: "SA",
    level: 2,
    number: "3.14.1",
    title: "Require Security in Contracts",
    description: "Require the developer of systems containing CUI to identify the security controls being employed.",
    discussion: "Security requirements in contracts ensure vendors understand and implement appropriate security controls. This includes requiring security documentation, compliance attestations, and evidence of implemented controls.",
    relatedControls: ["SA.L2-3.14.2", "SR.L2-3.15.1", "SR.L2-3.15.2"],
    assessmentObjective: "Determine if developers of systems containing CUI are required to identify security controls.",
    potentialAssessors: ["Procurement Officer", "Security Officer", "Contract Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Contract Security Clauses",
      "Security Requirements Documentation",
      "Vendor Security Attestations",
      "Contract Review Procedures",
      "Security Control Specifications"
    ],
    interviewQuestions: [
      "Are security requirements in contracts?",
      "How are vendor security controls verified?",
      "What security clauses are included?",
      "How are security requirements enforced?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SA.L2-3.14.2",
    family: "SA",
    level: 2,
    number: "3.14.2",
    title: "Accept Security Controls",
    description: "Accept the system only if the required security controls are implemented and functioning correctly.",
    discussion: "System acceptance includes verifying that required security controls are implemented and operating as intended before putting systems into production. This prevents deploying non-compliant systems.",
    relatedControls: ["SA.L2-3.14.1", "CA.L2-3.12.1", "CM.L2-3.4.2"],
    assessmentObjective: "Determine if systems are accepted only when required security controls are implemented and functioning.",
    potentialAssessors: ["Security Officer", "System Owner", "Assessor"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Security Acceptance Criteria",
      "Acceptance Test Results",
      "Security Control Verification",
      "Approval to Operate (ATO)",
      "Acceptance Documentation"
    ],
    interviewQuestions: [
      "How is security acceptance determined?",
      "What testing is performed?",
      "Who approves system acceptance?",
      "What happens if controls are incomplete?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SA.L2-3.14.3",
    family: "SA",
    level: 2,
    number: "3.14.3",
    title: "Establish Development Environment",
    description: "Establish a security requirements traceability matrix for systems containing CUI.",
    discussion: "Development environments must be secured to prevent introduction of vulnerabilities during the development process. This includes separation of environments, access controls, and secure coding practices.",
    relatedControls: ["SA.L2-3.14.4", "CM.L2-3.4.1", "SC.L1-3.13.1"],
    assessmentObjective: "Determine if security requirements traceability is established for systems containing CUI.",
    potentialAssessors: ["Development Manager", "Security Engineer"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Development Environment Security",
      "Environment Separation Documentation",
      "Dev/Stage/Prod Isolation",
      "Development Access Controls",
      "Secure Development Procedures"
    ],
    interviewQuestions: [
      "How are development environments secured?",
      "Are dev/test/prod separated?",
      "Who has access to development systems?",
      "How is code promoted between environments?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SA.L2-3.14.4",
    family: "SA",
    level: 2,
    number: "3.14.4",
    title: "Implement Secure Development",
    description: "Implement a criticality analysis for systems containing CUI at the organization-defined time period.",
    discussion: "Secure development practices include code reviews, security testing, vulnerability assessments during development, and developer security training. This ensures systems are built with security from the start.",
    relatedControls: ["SA.L2-3.14.3", "RA.L2-3.11.1", "SI.L2-3.14.1"],
    assessmentObjective: "Determine if criticality analysis is performed for systems containing CUI.",
    potentialAssessors: ["Development Manager", "Security Engineer", "QA Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Secure Coding Standards",
      "Code Review Procedures",
      "Security Testing in SDLC",
      "Developer Training Records",
      "Vulnerability Assessment Reports"
    ],
    interviewQuestions: [
      "Are secure coding practices followed?",
      "How is code reviewed for security?",
      "What security testing is performed?",
      "Are developers trained on security?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SA.L2-3.14.5",
    family: "SA",
    level: 2,
    number: "3.14.5",
    title: "Maintain Documentation",
    description: "Distribute, implement, and maintain design and implementation information for organizational systems.",
    discussion: "System documentation must be maintained and protected. This includes architecture diagrams, configuration documentation, and implementation details that support security maintenance and incident response.",
    relatedControls: ["SA.L2-3.14.1", "CM.L2-3.4.1", "AU.L2-3.3.6"],
    assessmentObjective: "Determine if design and implementation information is distributed, implemented, and maintained.",
    potentialAssessors: ["System Administrator", "Documentation Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "System Documentation",
      "Architecture Diagrams",
      "Configuration Documentation",
      "Documentation Update Records",
      "Documentation Access Controls"
    ],
    interviewQuestions: [
      "What system documentation is maintained?",
      "How is documentation kept current?",
      "Who has access to documentation?",
      "How is documentation protected?"
    ],
    testMethods: ["examine", "interview"]
  },

  // ============================================
  // SUPPLY CHAIN RISK MANAGEMENT (SR)
  // ============================================
  {
    id: "SR.L2-3.15.1",
    family: "SR",
    level: 2,
    number: "3.15.1",
    title: "Assess Supply Chain Risk",
    description: "Assess supply chain risk for organizational systems and components.",
    discussion: "Supply chain risk assessment evaluates security risks from vendors, suppliers, and third-party components. This includes understanding where components are sourced, who has access, and potential tampering or counterfeiting risks.",
    relatedControls: ["SR.L2-3.15.2", "SR.L2-3.15.3", "RA.L2-3.11.1"],
    assessmentObjective: "Determine if supply chain risk is assessed for systems and components.",
    potentialAssessors: ["Supply Chain Manager", "Security Officer", "Procurement"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Supply Chain Risk Assessment",
      "Vendor Security Evaluations",
      "Component Provenance Records",
      "Risk Assessment Methodology",
      "Supply Chain Security Policy"
    ],
    interviewQuestions: [
      "How is supply chain risk assessed?",
      "What vendors are evaluated?",
      "How are component sources verified?",
      "What supply chain risks are considered?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SR.L2-3.15.2",
    family: "SR",
    level: 2,
    number: "3.15.2",
    title: "Limit Supply Chain Access",
    description: "Limit supply chain access to systems and components.",
    discussion: "Vendor and supplier access to organizational systems should be limited and controlled. This includes monitoring third-party connections, requiring security agreements, and implementing technical controls for vendor access.",
    relatedControls: ["SR.L2-3.15.1", "SR.L2-3.15.3", "AC.L2-3.1.13"],
    assessmentObjective: "Determine if supply chain access to systems and components is limited.",
    potentialAssessors: ["IT Manager", "Security Officer", "Vendor Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Vendor Access Policy",
      "Third-Party Access Controls",
      "Vendor Connection Monitoring",
      "Remote Access Restrictions",
      "Vendor Access Logs"
    ],
    interviewQuestions: [
      "How is vendor access controlled?",
      "What can suppliers access?",
      "Are vendor connections monitored?",
      "How is vendor access terminated?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SR.L2-3.15.3",
    family: "SR",
    level: 2,
    number: "3.15.3",
    title: "Verify Supplier Security",
    description: "Verify that suppliers apply security measures.",
    discussion: "Supplier security verification ensures vendors implement appropriate security controls. This includes security questionnaires, third-party audits, compliance certifications, and contractual security requirements.",
    relatedControls: ["SR.L2-3.15.1", "SR.L2-3.15.2", "SA.L2-3.14.1"],
    assessmentObjective: "Determine if supplier security measures are verified.",
    potentialAssessors: ["Procurement", "Security Officer", "Compliance Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Supplier Security Questionnaires",
      "Third-Party Audit Reports",
      "Compliance Certifications",
      "Security Review Records",
      "Supplier Risk Ratings"
    ],
    interviewQuestions: [
      "How are supplier security practices verified?",
      "Are security questionnaires used?",
      "What compliance certifications are required?",
      "How often are suppliers re-evaluated?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SR.L2-3.15.4",
    family: "SR",
    level: 2,
    number: "3.15.4",
    title: "Manage Supply Chain Incidents",
    description: "Assess and manage supply chain incidents.",
    discussion: "Supply chain incident management addresses security issues affecting vendors or components. This includes monitoring for supply chain attacks, coordinating with suppliers during incidents, and managing component vulnerabilities.",
    relatedControls: ["SR.L2-3.15.1", "IR.L2-3.6.1", "RA.L2-3.11.2"],
    assessmentObjective: "Determine if supply chain incidents are assessed and managed.",
    potentialAssessors: ["Supply Chain Manager", "Incident Response Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Supply Chain Incident Response Plan",
      "Vendor Incident Notification Procedures",
      "Component Vulnerability Tracking",
      "Supply Chain Incident Log",
      "Vendor Communication Records"
    ],
    interviewQuestions: [
      "How are supply chain incidents handled?",
      "How are vendors notified of incidents?",
      "How are component vulnerabilities tracked?",
      "What happens when a supplier is compromised?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SR.L2-3.15.5",
    family: "SR",
    level: 2,
    number: "3.15.5",
    title: "Develop Supply Chain Protection Plan",
    description: "Develop and implement a plan for managing supply chain risks associated with the development, acquisition, maintenance, and disposal of systems, system components, and system services.",
    discussion: "A supply chain protection plan formalizes the organization's approach to managing risks from third-party hardware, software, and services. The plan should address vendor selection, component verification, and ongoing monitoring.",
    relatedControls: ["SR.L2-3.15.1", "SR.L2-3.15.2", "SR.L2-3.15.3"],
    assessmentObjective: "Determine if a supply chain risk management plan is developed and implemented.",
    potentialAssessors: ["Supply Chain Manager", "Security Officer", "Procurement"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Supply Chain Risk Management Plan",
      "Vendor Selection Criteria",
      "Component Verification Procedures",
      "Supply Chain Security Policy",
      "Plan Review and Update Records"
    ],
    interviewQuestions: [
      "Is there a documented supply chain risk management plan?",
      "How are supply chain risks identified and tracked?",
      "How is the plan reviewed and updated?",
      "Who is responsible for supply chain risk management?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SR.L2-3.15.6",
    family: "SR",
    level: 2,
    number: "3.15.6",
    title: "Employ Counterfeit Component Detection",
    description: "Employ detection methods for counterfeit components prior to installation.",
    discussion: "Counterfeit hardware and software components can introduce backdoors, malware, or reduced reliability. Detection methods include visual inspection, testing, provenance verification, and use of trusted suppliers.",
    relatedControls: ["SR.L2-3.15.1", "SR.L2-3.15.3", "CM.L2-3.4.1"],
    assessmentObjective: "Determine if counterfeit component detection methods are employed prior to installation.",
    potentialAssessors: ["Supply Chain Manager", "IT Manager", "Procurement"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Counterfeit Detection Procedures",
      "Trusted Supplier List",
      "Component Inspection Records",
      "Provenance Verification Documentation",
      "Anti-Counterfeit Policy"
    ],
    interviewQuestions: [
      "How are counterfeit components detected?",
      "Are components inspected before installation?",
      "How is component provenance verified?",
      "What happens when a counterfeit component is found?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SR.L2-3.15.7",
    family: "SR",
    level: 2,
    number: "3.15.7",
    title: "Limit Harm from Potentially Malicious Components",
    description: "Limit harm from potential adversary-controlled components by employing safeguards to detect and prevent malicious functionality.",
    discussion: "Components from untrusted sources may contain malicious functionality. Safeguards include network isolation, behavioral monitoring, code signing verification, and sandboxing of suspect components.",
    relatedControls: ["SR.L2-3.15.6", "SI.L2-3.14.1", "SC.L1-3.13.1"],
    assessmentObjective: "Determine if safeguards are employed to limit harm from potentially malicious components.",
    potentialAssessors: ["Security Engineer", "Supply Chain Manager", "IT Manager"],
    cmmcLevel: 2,
    commonArtifacts: [
      "Malicious Component Detection Procedures",
      "Network Isolation Configuration",
      "Behavioral Monitoring Rules",
      "Code Signing Verification",
      "Component Sandboxing Documentation"
    ],
    interviewQuestions: [
      "How is malicious functionality in components detected?",
      "Are untrusted components isolated?",
      "How is code signing verified?",
      "What monitoring exists for component behavior?"
    ],
    testMethods: ["examine", "interview", "test"]
  },

  // ============================================
  // LEVEL 3 ENHANCED CONTROLS (NIST 800-172 / CMMC Level 3)
  // ============================================

  // AC Level 3
  {
    id: "AC.L3-3.1.2e",
    family: "AC",
    level: 3,
    number: "3.1.2e",
    title: "Employ Dynamic Access Control",
    description: "Employ dynamic access control approaches that can be updated to respond to rapidly changing security and mission requirements.",
    discussion: "Dynamic access control enables organizations to respond quickly to changing threat conditions by adjusting access policies in real time. This includes attribute-based access control (ABAC) and policy-based access control that can be updated without system reconfiguration.",
    relatedControls: ["AC.L1-3.1.1", "AC.L1-3.1.2", "AC.L2-3.1.3"],
    assessmentObjective: "Determine if dynamic access control approaches are employed to respond to changing security requirements.",
    potentialAssessors: ["Security Architect", "System Administrator", "Security Engineer"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Dynamic Access Control Policy",
      "ABAC Configuration",
      "Access Policy Update Procedures",
      "Real-Time Access Control Logs",
      "Policy Change Management Records"
    ],
    interviewQuestions: [
      "How quickly can access policies be updated?",
      "Is attribute-based access control implemented?",
      "How are access decisions made dynamically?",
      "How are policy changes tested before deployment?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "AC.L3-3.1.3e",
    family: "AC",
    level: 3,
    number: "3.1.3e",
    title: "Employ Secure Information Sharing Techniques",
    description: "Use secure information sharing techniques to enable authorized sharing while preventing unauthorized disclosure.",
    discussion: "Secure information sharing techniques include data tagging, automated access enforcement based on tags, and cross-domain solutions that enforce information flow policies. These techniques enable sharing with mission partners while maintaining CUI protection.",
    relatedControls: ["AC.L3-3.1.22", "AC.L2-3.1.3", "SC.L2-3.13.7"],
    assessmentObjective: "Determine if secure information sharing techniques are employed.",
    potentialAssessors: ["Security Architect", "Data Owner", "Security Engineer"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Data Tagging Implementation",
      "Cross-Domain Solution Configuration",
      "Information Sharing Agreements",
      "Automated Access Enforcement Documentation",
      "Sharing Policy Documentation"
    ],
    interviewQuestions: [
      "How is CUI tagged for automated access control?",
      "Are cross-domain solutions used?",
      "How is sharing with mission partners controlled?",
      "How are sharing violations detected?"
    ],
    testMethods: ["examine", "interview", "test"]
  },

  // AT Level 3
  {
    id: "AT.L3-3.2.1e",
    family: "AT",
    level: 3,
    number: "3.2.1e",
    title: "Provide Advanced Cyber Threat Awareness Training",
    description: "Provide awareness training focused on recognizing and responding to threats from adversaries with advanced persistent threat (APT) capabilities.",
    discussion: "APT-focused training prepares personnel to recognize sophisticated, targeted attacks that may use spear phishing, watering hole attacks, and other advanced techniques. Training should include current threat intelligence and real-world examples.",
    relatedControls: ["AT.L1-3.2.1", "AT.L2-3.2.2", "AT.L2-3.2.3"],
    assessmentObjective: "Determine if awareness training addresses advanced persistent threat techniques.",
    potentialAssessors: ["Training Officer", "Security Officer", "Threat Intelligence Analyst"],
    cmmcLevel: 3,
    commonArtifacts: [
      "APT Awareness Training Materials",
      "Threat Intelligence Briefings",
      "Advanced Phishing Simulation Results",
      "Training Completion Records",
      "Threat Scenario Documentation"
    ],
    interviewQuestions: [
      "Does training cover APT techniques?",
      "Is threat intelligence incorporated into training?",
      "How are advanced attack scenarios exercised?",
      "How is training effectiveness measured?"
    ],
    testMethods: ["examine", "interview"]
  },

  // AU Level 3
  {
    id: "AU.L3-3.3.1e",
    family: "AU",
    level: 3,
    number: "3.3.1e",
    title: "Conduct Audit Log Reviews for APT Indicators",
    description: "Review and analyze audit records for indicators of advanced persistent threat activity.",
    discussion: "APT actors often operate slowly and stealthily, making detection through standard log review difficult. Specialized analysis techniques, threat hunting, and behavioral analytics are needed to detect APT indicators in audit logs.",
    relatedControls: ["AU.L2-3.3.1", "AU.L2-3.3.3", "AU.L2-3.3.5"],
    assessmentObjective: "Determine if audit records are reviewed for indicators of advanced persistent threat activity.",
    potentialAssessors: ["Threat Hunter", "Security Operations", "Forensic Analyst"],
    cmmcLevel: 3,
    commonArtifacts: [
      "APT Indicator Detection Rules",
      "Threat Hunting Procedures",
      "Behavioral Analytics Configuration",
      "APT Detection Reports",
      "Threat Intelligence Integration"
    ],
    interviewQuestions: [
      "How are APT indicators identified in logs?",
      "Is threat hunting performed?",
      "What behavioral analytics are used?",
      "How is threat intelligence used in log analysis?"
    ],
    testMethods: ["examine", "interview"]
  },

  // CM Level 3
  {
    id: "CM.L3-3.4.1e",
    family: "CM",
    level: 3,
    number: "3.4.1e",
    title: "Establish Authoritative Source for Configuration Baselines",
    description: "Establish and maintain an authoritative source and golden images for configuration baselines.",
    discussion: "Authoritative sources for configuration (golden images) ensure that systems can be rapidly restored to a known-good state. These images should be protected from tampering, regularly updated, and used for both initial deployment and recovery.",
    relatedControls: ["CM.L2-3.4.1", "CM.L2-3.4.2", "IR.L2-3.6.1"],
    assessmentObjective: "Determine if authoritative sources and golden images are established and maintained for configuration baselines.",
    potentialAssessors: ["System Administrator", "Configuration Manager", "Security Engineer"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Golden Image Repository",
      "Image Integrity Verification",
      "Image Update Procedures",
      "Authoritative Source Documentation",
      "Image Access Controls"
    ],
    interviewQuestions: [
      "Are golden images maintained for systems?",
      "How are images protected from tampering?",
      "How often are images updated?",
      "How are images used for recovery?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "CM.L3-3.4.2e",
    family: "CM",
    level: 3,
    number: "3.4.2e",
    title: "Implement Automated Configuration Management",
    description: "Employ automated mechanisms to detect misconfigured or unauthorized system components and remediate identified issues.",
    discussion: "Automated configuration management tools continuously monitor system configurations against baselines and automatically remediate deviations. This reduces the window of exposure from misconfigurations and ensures consistent security posture.",
    relatedControls: ["CM.L2-3.4.1", "CM.L2-3.4.2", "CM.L2-3.4.8"],
    assessmentObjective: "Determine if automated mechanisms detect and remediate misconfigured or unauthorized system components.",
    potentialAssessors: ["System Administrator", "Security Engineer", "Configuration Manager"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Automated Configuration Tool Configuration",
      "Configuration Drift Detection Reports",
      "Auto-Remediation Logs",
      "Compliance Dashboard",
      "Configuration Monitoring Procedures"
    ],
    interviewQuestions: [
      "What automated tools monitor configurations?",
      "How quickly are deviations detected?",
      "Is auto-remediation implemented?",
      "How are configuration alerts handled?"
    ],
    testMethods: ["examine", "interview", "test"]
  },

  // IA Level 3
  {
    id: "IA.L3-3.5.3e",
    family: "IA",
    level: 3,
    number: "3.5.3e",
    title: "Employ Hardware-Based Multi-Factor Authentication",
    description: "Employ hardware-based multi-factor authentication mechanisms for privileged accounts.",
    discussion: "Hardware-based MFA (e.g., PIV cards, FIDO2 hardware tokens, smart cards) provides stronger authentication than software-based solutions. Hardware tokens are resistant to phishing, credential theft, and remote attacks.",
    relatedControls: ["IA.L2-3.5.3", "IA.L2-3.5.4", "AC.L2-3.1.5"],
    assessmentObjective: "Determine if hardware-based multi-factor authentication is employed for privileged accounts.",
    potentialAssessors: ["Security Engineer", "System Administrator", "Identity Manager"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Hardware Token Inventory",
      "PIV/CAC Implementation Documentation",
      "FIDO2 Configuration",
      "Hardware MFA Enrollment Records",
      "Privileged Account MFA Verification"
    ],
    interviewQuestions: [
      "What hardware MFA tokens are used?",
      "Are PIV/CAC cards implemented?",
      "How are hardware tokens managed and replaced?",
      "Are all privileged accounts using hardware MFA?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "IA.L3-3.5.4e",
    family: "IA",
    level: 3,
    number: "3.5.4e",
    title: "Employ Passwordless Authentication",
    description: "Employ passwordless authentication mechanisms to reduce risks associated with password-based authentication.",
    discussion: "Passwordless authentication eliminates the risks of password theft, reuse, and brute force attacks. Methods include biometrics, hardware tokens, and certificate-based authentication that do not rely on shared secrets.",
    relatedControls: ["IA.L2-3.5.3", "IA.L3-3.5.3e", "IA.L2-3.5.7"],
    assessmentObjective: "Determine if passwordless authentication mechanisms are employed.",
    potentialAssessors: ["Security Engineer", "Identity Manager", "System Administrator"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Passwordless Authentication Configuration",
      "Biometric System Documentation",
      "Certificate-Based Auth Configuration",
      "Authentication Method Inventory",
      "Passwordless Rollout Plan"
    ],
    interviewQuestions: [
      "Is passwordless authentication implemented?",
      "What passwordless methods are used?",
      "Which accounts use passwordless auth?",
      "How are passwordless credentials managed?"
    ],
    testMethods: ["examine", "interview", "test"]
  },

  // IR Level 3
  {
    id: "IR.L3-3.6.1e",
    family: "IR",
    level: 3,
    number: "3.6.1e",
    title: "Establish Cyber Incident Response Teams",
    description: "Establish and maintain a cyber incident response team with the capability to respond to advanced persistent threat incidents.",
    discussion: "A dedicated cyber incident response team (CIRT) with APT-specific capabilities provides faster and more effective response to sophisticated attacks. The team should have specialized skills in forensics, threat hunting, and malware analysis.",
    relatedControls: ["IR.L2-3.6.1", "IR.L2-3.6.2", "IR.L2-3.6.3"],
    assessmentObjective: "Determine if a cyber incident response team with APT response capability is established and maintained.",
    potentialAssessors: ["CISO", "Incident Response Manager", "Security Operations Manager"],
    cmmcLevel: 3,
    commonArtifacts: [
      "CIRT Charter and Composition",
      "APT Response Procedures",
      "Team Skills and Certifications",
      "CIRT Contact Information",
      "APT Exercise Records"
    ],
    interviewQuestions: [
      "Is there a dedicated incident response team?",
      "Does the team have APT response capabilities?",
      "What forensic tools does the team use?",
      "How is the team activated for APT incidents?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "IR.L3-3.6.2e",
    family: "IR",
    level: 3,
    number: "3.6.2e",
    title: "Establish Cyber Threat Hunting Capability",
    description: "Establish and maintain a cyber threat hunting capability to search for indicators of compromise.",
    discussion: "Threat hunting proactively searches for threats that have evaded automated detection. Hunters use threat intelligence, behavioral analytics, and manual investigation techniques to find hidden adversaries before they cause significant damage.",
    relatedControls: ["IR.L2-3.6.1", "AU.L2-3.3.1", "SI.L2-3.14.6"],
    assessmentObjective: "Determine if a cyber threat hunting capability is established and maintained.",
    potentialAssessors: ["Threat Hunter", "SOC Manager", "Security Operations"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Threat Hunting Procedures",
      "Hunt Team Charter",
      "Threat Intelligence Sources",
      "Hunt Campaign Records",
      "Indicators of Compromise (IOC) Database"
    ],
    interviewQuestions: [
      "Is proactive threat hunting performed?",
      "What threat intelligence sources are used?",
      "How often are hunt campaigns conducted?",
      "How are hunt findings documented and acted upon?"
    ],
    testMethods: ["examine", "interview"]
  },

  // MA Level 3
  {
    id: "MA.L3-3.7.1e",
    family: "MA",
    level: 3,
    number: "3.7.1e",
    title: "Inspect Maintenance Tools for Malicious Content",
    description: "Inspect maintenance tools carried into a facility by maintenance personnel for malicious software.",
    discussion: "Maintenance tools brought into facilities by external personnel can introduce malware. Inspection includes scanning tools with up-to-date antivirus, verifying tool integrity, and using organization-provided tools where possible.",
    relatedControls: ["MA.L2-3.7.2", "MA.L2-3.7.4", "SI.L2-3.14.1"],
    assessmentObjective: "Determine if maintenance tools are inspected for malicious software before use.",
    potentialAssessors: ["IT Manager", "Security Officer", "Maintenance Supervisor"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Maintenance Tool Inspection Procedures",
      "Malware Scan Records for Tools",
      "Tool Integrity Verification",
      "Approved Tool List",
      "Tool Inspection Logs"
    ],
    interviewQuestions: [
      "Are maintenance tools scanned for malware?",
      "Who performs tool inspections?",
      "What happens if malware is found in a tool?",
      "Are organization-provided tools preferred?"
    ],
    testMethods: ["examine", "interview"]
  },

  // RA Level 3
  {
    id: "RA.L3-3.11.1e",
    family: "RA",
    level: 3,
    number: "3.11.1e",
    title: "Employ Threat Intelligence in Risk Assessments",
    description: "Employ threat intelligence, including information about adversary tactics, techniques, and procedures (TTPs), in risk assessments.",
    discussion: "Incorporating threat intelligence into risk assessments provides a more accurate picture of the threat landscape. This includes using MITRE ATT&CK framework, ISAC threat feeds, and government threat advisories to inform risk decisions.",
    relatedControls: ["RA.L2-3.11.1", "RA.L2-3.11.2", "SI.L2-3.14.6"],
    assessmentObjective: "Determine if threat intelligence including adversary TTPs is employed in risk assessments.",
    potentialAssessors: ["Risk Manager", "Threat Intelligence Analyst", "Security Officer"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Threat Intelligence Sources",
      "TTP-Based Risk Assessment",
      "MITRE ATT&CK Mapping",
      "Threat Intelligence Integration Procedures",
      "Risk Assessment with Threat Context"
    ],
    interviewQuestions: [
      "What threat intelligence sources are used?",
      "How is threat intelligence incorporated into risk assessments?",
      "Is MITRE ATT&CK used?",
      "How are adversary TTPs mapped to controls?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "RA.L3-3.11.2e",
    family: "RA",
    level: 3,
    number: "3.11.2e",
    title: "Conduct Penetration Testing",
    description: "Conduct penetration testing periodically and after significant changes to the system.",
    discussion: "Penetration testing simulates real-world attacks to identify exploitable vulnerabilities. Testing should be conducted by qualified personnel or third parties and should cover network, application, and physical attack vectors.",
    relatedControls: ["RA.L2-3.11.2", "CA.L2-3.12.1", "IR.L2-3.6.1"],
    assessmentObjective: "Determine if penetration testing is conducted periodically and after significant changes.",
    potentialAssessors: ["Penetration Tester", "Security Officer", "Assessor"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Penetration Test Plans",
      "Penetration Test Reports",
      "Remediation Tracking",
      "Rules of Engagement Documentation",
      "Retest Verification Records"
    ],
    interviewQuestions: [
      "How often is penetration testing conducted?",
      "Who performs penetration testing?",
      "What scope is covered?",
      "How are findings remediated and verified?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "RA.L3-3.11.3e",
    family: "RA",
    level: 3,
    number: "3.11.3e",
    title: "Employ Advanced Vulnerability Analysis",
    description: "Employ advanced vulnerability analysis techniques including adversarial analysis to identify vulnerabilities.",
    discussion: "Advanced vulnerability analysis goes beyond automated scanning to include manual analysis, adversarial thinking, and red team exercises. This identifies vulnerabilities that automated tools miss, including logic flaws and complex attack chains.",
    relatedControls: ["RA.L2-3.11.2", "RA.L3-3.11.2e", "CA.L2-3.12.1"],
    assessmentObjective: "Determine if advanced vulnerability analysis techniques including adversarial analysis are employed.",
    potentialAssessors: ["Security Researcher", "Red Team Lead", "Security Engineer"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Red Team Exercise Reports",
      "Adversarial Analysis Documentation",
      "Manual Vulnerability Analysis Records",
      "Attack Chain Analysis",
      "Advanced Vulnerability Findings"
    ],
    interviewQuestions: [
      "Are red team exercises conducted?",
      "What manual analysis techniques are used?",
      "How are complex attack chains identified?",
      "How are advanced findings tracked and remediated?"
    ],
    testMethods: ["examine", "interview"]
  },

  // CA Level 3
  {
    id: "CA.L3-3.12.1e",
    family: "CA",
    level: 3,
    number: "3.12.1e",
    title: "Conduct Independent Security Assessments",
    description: "Employ independent assessors or assessment teams to conduct security assessments.",
    discussion: "Independent assessments provide an objective evaluation of security controls without the bias of internal teams. Assessors should have no direct responsibility for the systems being assessed and should have appropriate qualifications.",
    relatedControls: ["CA.L2-3.12.1", "CA.L2-3.12.2", "RA.L2-3.11.1"],
    assessmentObjective: "Determine if independent assessors or assessment teams are employed for security assessments.",
    potentialAssessors: ["CISO", "Compliance Manager", "Audit Committee"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Independent Assessor Qualifications",
      "Assessment Independence Documentation",
      "Third-Party Assessment Reports",
      "Assessor Conflict of Interest Declarations",
      "Assessment Scope and Methodology"
    ],
    interviewQuestions: [
      "Are assessors independent of the systems assessed?",
      "What qualifications do assessors have?",
      "How is assessor independence verified?",
      "Are third-party assessors used?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "CA.L3-3.12.2e",
    family: "CA",
    level: 3,
    number: "3.12.2e",
    title: "Create and Maintain Plans of Action and Milestones",
    description: "Develop and implement plans of action designed to correct deficiencies and reduce or eliminate vulnerabilities in organizational systems.",
    discussion: "Plans of Action and Milestones (POA&Ms) document identified deficiencies, planned corrective actions, resources required, and target completion dates. POA&Ms provide accountability for security improvement and are required for CMMC certification.",
    relatedControls: ["CA.L2-3.12.1", "CA.L2-3.12.3", "RA.L2-3.11.3"],
    assessmentObjective: "Determine if plans of action are developed and implemented to correct deficiencies.",
    potentialAssessors: ["Security Officer", "Compliance Manager", "System Owner"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Plan of Action and Milestones (POA&M)",
      "Deficiency Tracking System",
      "Corrective Action Records",
      "POA&M Review Records",
      "Milestone Completion Evidence"
    ],
    interviewQuestions: [
      "Is a POA&M maintained?",
      "How are deficiencies tracked to closure?",
      "Who reviews and approves POA&M entries?",
      "How are overdue items escalated?"
    ],
    testMethods: ["examine", "interview"]
  },

  // SC Level 3 (additional)
  {
    id: "SC.L3-3.13.19",
    family: "SC",
    level: 3,
    number: "3.13.19",
    title: "Isolate Security Functions",
    description: "Isolate security functions from non-security functions.",
    discussion: "Security functions (authentication, audit, access control) should be isolated from general user functions to prevent tampering or bypass. This includes running security components in separate processes, VMs, or hardware.",
    relatedControls: ["SC.L2-3.13.3", "AC.L2-3.1.7", "CM.L2-3.4.6"],
    assessmentObjective: "Determine if security functions are isolated from non-security functions.",
    potentialAssessors: ["Security Architect", "System Administrator", "Security Engineer"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Security Function Isolation Architecture",
      "Separate Security Process Configuration",
      "Security VM/Container Documentation",
      "Isolation Verification Records",
      "Security Function Inventory"
    ],
    interviewQuestions: [
      "How are security functions isolated?",
      "Are security components in separate processes?",
      "Can users access security functions directly?",
      "How is isolation verified?"
    ],
    testMethods: ["examine", "interview", "test"]
  },
  {
    id: "SC.L3-3.13.20",
    family: "SC",
    level: 3,
    number: "3.13.20",
    title: "Implement Deception Technologies",
    description: "Employ deception technologies and techniques to identify and understand adversary tactics, techniques, and procedures.",
    discussion: "Deception technologies (honeypots, honeynets, decoy credentials) lure attackers into interacting with fake assets, revealing their TTPs and providing early warning of intrusion. These techniques help detect sophisticated attackers who evade traditional controls.",
    relatedControls: ["SC.L3-3.13.17", "IR.L3-3.6.2e", "SI.L2-3.14.6"],
    assessmentObjective: "Determine if deception technologies are employed to identify adversary TTPs.",
    potentialAssessors: ["Security Operations", "Threat Hunter", "Security Engineer"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Deception Technology Configuration",
      "Honeypot/Honeynet Documentation",
      "Decoy Credential Deployment",
      "Deception Alert Logs",
      "TTP Intelligence from Deception"
    ],
    interviewQuestions: [
      "Are honeypots or deception technologies deployed?",
      "How are deception alerts monitored?",
      "What intelligence is gathered from deception?",
      "How are deception assets maintained?"
    ],
    testMethods: ["examine", "interview"]
  },

  // SI Level 3
  {
    id: "SI.L3-3.14.1e",
    family: "SI",
    level: 3,
    number: "3.14.1e",
    title: "Implement Threat Intelligence Program",
    description: "Implement a threat intelligence program that includes a cross-organization information-sharing capability.",
    discussion: "A formal threat intelligence program collects, analyzes, and disseminates threat information to improve defensive posture. Cross-organization sharing (via ISACs, government partnerships) provides broader visibility into the threat landscape.",
    relatedControls: ["SI.L2-3.14.6", "IR.L3-3.6.2e", "RA.L3-3.11.1e"],
    assessmentObjective: "Determine if a threat intelligence program with cross-organization sharing is implemented.",
    potentialAssessors: ["Threat Intelligence Analyst", "Security Operations Manager", "CISO"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Threat Intelligence Program Charter",
      "ISAC Membership Records",
      "Threat Intelligence Sharing Agreements",
      "Intelligence Dissemination Procedures",
      "Threat Intelligence Reports"
    ],
    interviewQuestions: [
      "Is there a formal threat intelligence program?",
      "What ISACs or sharing communities are participated in?",
      "How is intelligence shared internally?",
      "How is threat intelligence acted upon?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SI.L3-3.14.2e",
    family: "SI",
    level: 3,
    number: "3.14.2e",
    title: "Employ Advanced Endpoint Detection and Response",
    description: "Employ advanced endpoint detection and response (EDR) capabilities to detect and respond to threats on endpoints.",
    discussion: "EDR solutions provide continuous monitoring, behavioral analysis, and response capabilities on endpoints. Advanced EDR goes beyond traditional antivirus to detect fileless malware, living-off-the-land attacks, and other sophisticated threats.",
    relatedControls: ["SI.L2-3.14.1", "SI.L2-3.14.2", "IR.L3-3.6.1e"],
    assessmentObjective: "Determine if advanced endpoint detection and response capabilities are employed.",
    potentialAssessors: ["Security Engineer", "Endpoint Administrator", "SOC Analyst"],
    cmmcLevel: 3,
    commonArtifacts: [
      "EDR Tool Configuration",
      "EDR Coverage Reports",
      "Behavioral Detection Rules",
      "EDR Alert Response Procedures",
      "Endpoint Telemetry Documentation"
    ],
    interviewQuestions: [
      "What EDR solution is deployed?",
      "What percentage of endpoints have EDR coverage?",
      "How are EDR alerts investigated?",
      "Does EDR detect fileless and behavioral threats?"
    ],
    testMethods: ["examine", "interview", "test"]
  },

  // SR Level 3
  {
    id: "SR.L3-3.15.1e",
    family: "SR",
    level: 3,
    number: "3.15.1e",
    title: "Establish Supply Chain Traceability",
    description: "Establish and maintain traceability of components throughout the supply chain.",
    discussion: "Component traceability enables organizations to track the provenance and chain of custody of hardware and software components. This supports detection of counterfeit components, unauthorized modifications, and supply chain attacks.",
    relatedControls: ["SR.L2-3.15.1", "SR.L2-3.15.6", "CM.L2-3.4.1"],
    assessmentObjective: "Determine if traceability of components throughout the supply chain is established and maintained.",
    potentialAssessors: ["Supply Chain Manager", "Security Officer", "Procurement"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Component Traceability Records",
      "Bill of Materials (BOM)",
      "Chain of Custody Documentation",
      "Component Provenance Database",
      "Traceability Verification Procedures"
    ],
    interviewQuestions: [
      "How are components traced through the supply chain?",
      "Is a bill of materials maintained?",
      "How is chain of custody documented?",
      "How are traceability records protected?"
    ],
    testMethods: ["examine", "interview"]
  },
  {
    id: "SR.L3-3.15.2e",
    family: "SR",
    level: 3,
    number: "3.15.2e",
    title: "Conduct Supply Chain Risk Assessments",
    description: "Conduct supply chain risk assessments for critical systems and components using threat intelligence.",
    discussion: "Supply chain risk assessments informed by threat intelligence identify specific risks from adversaries targeting the supply chain. These assessments should consider nation-state threats, targeted attacks on specific vendors, and systemic supply chain vulnerabilities.",
    relatedControls: ["SR.L2-3.15.1", "SR.L2-3.15.5", "RA.L3-3.11.1e"],
    assessmentObjective: "Determine if threat-intelligence-informed supply chain risk assessments are conducted for critical systems.",
    potentialAssessors: ["Supply Chain Manager", "Threat Intelligence Analyst", "Risk Manager"],
    cmmcLevel: 3,
    commonArtifacts: [
      "Threat-Informed Supply Chain Risk Assessment",
      "Critical Component Identification",
      "Adversary Targeting Analysis",
      "Supply Chain Risk Register",
      "Assessment Methodology Documentation"
    ],
    interviewQuestions: [
      "Are supply chain risk assessments informed by threat intelligence?",
      "Which components are considered critical?",
      "Are nation-state supply chain threats considered?",
      "How are supply chain risks prioritized?"
    ],
    testMethods: ["examine", "interview"]
  },

];

// Export families for categorization
export const CONTROL_FAMILIES = {
  AC: "Access Control",
  AT: "Awareness and Training",
  AU: "Audit and Accountability",
  CM: "Configuration Management",
  IA: "Identification and Authentication",
  IR: "Incident Response",
  MA: "Maintenance",
  MP: "Media Protection",
  PE: "Physical Protection",
  PS: "Personnel Security",
  RA: "Risk Assessment",
  CA: "Security Assessment",
  SC: "System and Communications Protection",
  SI: "System and Information Integrity",
  SA: "System and Services Acquisition",
  SR: "Supply Chain Risk Management",
} as const;

// CMMC Level 1 Controls (Basic Safeguarding)
export const CMMC_LEVEL_1_CONTROLS = NIST_CONTROLS.filter(c => c.cmmcLevel === 1);

// CMMC Level 2 Controls (DFARS 252.204-7012 Alignment)
export const CMMC_LEVEL_2_CONTROLS = NIST_CONTROLS.filter(c => c.cmmcLevel <= 2);

// CMMC Level 3 Controls (Enhanced Security)
export const CMMC_LEVEL_3_CONTROLS = NIST_CONTROLS;

// Helper function to get control by ID
export function getControlById(id: string): NISTControl | undefined {
  return NIST_CONTROLS.find(c => c.id === id);
}

// Helper function to get controls by family
export function getControlsByFamily(family: string): NISTControl[] {
  return NIST_CONTROLS.filter(c => c.family === family);
}

// Helper function to get controls by level
export function getControlsByLevel(level: 1 | 2 | 3): NISTControl[] {
  return NIST_CONTROLS.filter(c => c.cmmcLevel <= level);
}
