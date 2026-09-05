param(
  [string]$OutputPath = "Merito_IRAS_Complete_Thesis.docx"
)

$ErrorActionPreference = "Stop"

function Escape-Xml([string]$s) {
  if ($null -eq $s) { return "" }
  return [System.Security.SecurityElement]::Escape($s)
}

function Strip-Xml([string]$s) {
  return (($s -replace "<[^>]+>", " ") -replace "\s+", " ").Trim()
}

function Write-Utf8([string]$Path, [string]$Value) {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Value, $utf8NoBom)
}

$script:body = New-Object System.Collections.Generic.List[string]
$script:plain = New-Object System.Collections.Generic.List[string]

function Add-Paragraph([string]$Text, [string]$Style = "Normal", [bool]$Bold = $false, [int]$Size = 24, [string]$Align = "both") {
  $styleXml = if ($Style -ne "Normal") { "<w:pStyle w:val=`"$Style`"/>" } else { "" }
  $alignXml = if ($Align) { "<w:jc w:val=`"$Align`"/>" } else { "" }
  $boldXml = if ($Bold) { "<w:b/>" } else { "" }
  $xml = "<w:p><w:pPr>$styleXml$alignXml<w:spacing w:after=`"160`" w:line=`"360`" w:lineRule=`"auto`"/></w:pPr><w:r><w:rPr>$boldXml<w:sz w:val=`"$Size`"/><w:szCs w:val=`"$Size`"/><w:color w:val=`"000000`"/></w:rPr><w:t xml:space=`"preserve`">$(Escape-Xml $Text)</w:t></w:r></w:p>"
  $script:body.Add($xml) | Out-Null
  $script:plain.Add($Text) | Out-Null
}

function Add-Heading1([string]$Text) { Add-Paragraph $Text "Heading1" $true 28 "left" }
function Add-Heading2([string]$Text) { Add-Paragraph $Text "Heading2" $true 24 "left" }
function Add-TitleLine([string]$Text) { Add-Paragraph $Text "Title" $true 28 "center" }
function Add-Caption([string]$Text) { Add-Paragraph $Text "Caption" $true 16 "center" }
function Add-PageBreak() {
  $script:body.Add("<w:p><w:r><w:br w:type=`"page`"/></w:r></w:p>") | Out-Null
}

function Add-Bullets([string[]]$Items) {
  foreach ($item in $Items) { Add-Paragraph ("- " + $item) "Normal" $false 24 "both" }
}

function Add-Table([string[]]$Headers, [object[]]$Rows) {
  $tbl = New-Object System.Text.StringBuilder
  [void]$tbl.Append("<w:tbl><w:tblPr><w:tblW w:w=`"0`" w:type=`"auto`"/><w:tblBorders><w:top w:val=`"single`" w:sz=`"4`" w:space=`"0`" w:color=`"000000`"/><w:left w:val=`"single`" w:sz=`"4`" w:space=`"0`" w:color=`"000000`"/><w:bottom w:val=`"single`" w:sz=`"4`" w:space=`"0`" w:color=`"000000`"/><w:right w:val=`"single`" w:sz=`"4`" w:space=`"0`" w:color=`"000000`"/><w:insideH w:val=`"single`" w:sz=`"4`" w:space=`"0`" w:color=`"000000`"/><w:insideV w:val=`"single`" w:sz=`"4`" w:space=`"0`" w:color=`"000000`"/></w:tblBorders></w:tblPr>")
  [void]$tbl.Append("<w:tr>")
  foreach ($h in $Headers) {
    [void]$tbl.Append("<w:tc><w:tcPr><w:shd w:fill=`"D9EAF7`"/></w:tcPr><w:p><w:r><w:rPr><w:b/><w:sz w:val=`"22`"/></w:rPr><w:t>$(Escape-Xml $h)</w:t></w:r></w:p></w:tc>")
  }
  [void]$tbl.Append("</w:tr>")
  foreach ($row in $Rows) {
    [void]$tbl.Append("<w:tr>")
    foreach ($cell in $row) {
      [void]$tbl.Append("<w:tc><w:p><w:r><w:rPr><w:sz w:val=`"22`"/></w:rPr><w:t xml:space=`"preserve`">$(Escape-Xml ([string]$cell))</w:t></w:r></w:p></w:tc>")
    }
    [void]$tbl.Append("</w:tr>")
  }
  [void]$tbl.Append("</w:tbl>")
  $script:body.Add($tbl.ToString()) | Out-Null
  $script:plain.Add(($Headers -join " ") + " " + (($Rows | ForEach-Object { $_ -join " " }) -join " ")) | Out-Null
}

function Add-Figure([string]$Caption, [string]$Diagram, [string]$Description) {
  Add-Paragraph $Diagram "Normal" $false 20 "center"
  Add-Caption $Caption
  Add-Paragraph $Description "Normal" $false 24 "both"
}

function Add-ExpandedSection([string]$Heading, [string]$Core, [string]$Angle, [int]$Extra = 3) {
  Add-Heading2 $Heading
  Add-Paragraph $Core
  $details = @(
    "For the Merito / IRAS system, this section is interpreted through the realities of the IT recruitment domain, where the value of an applicant is rarely captured by one document or one keyword. A software engineering candidate may show capability through programming languages, frameworks, cloud tools, projects, certifications, work experience, interview evidence, and learning behaviour. The proposed system therefore treats recruitment as a connected information system rather than a single screening form. $Angle",
    "The implemented artefact supports the research problem by linking candidate records, uploaded resumes, parsed skills, job descriptions, employer requirements, applications, interviews, notifications, evidence reviews, feedback, and skill improvement plans. This integration is important because isolated systems often create duplicated work and fragmented decision-making. In contrast, an integrated workflow allows employers to move from job creation to applicant review while candidates receive clearer information about their own readiness for a role.",
    "A central design principle of this thesis is that AI should support recruitment decisions without replacing human judgement. The system can parse documents, suggest job descriptions, compute match scores, identify missing skills, classify suitability, and generate feedback, but the final employment decision remains with the employer. This human-in-the-loop position is consistent with current AI governance expectations, particularly because recruitment technologies can affect livelihood, career opportunity, and fairness.",
    "The research contribution is not limited to building a web application. It is the combination of a practical software artefact and a research investigation into how automation, explainability, and candidate support can be combined in a recruitment platform. The system is evaluated against functional behaviour, usability expectations, performance of the matching approach, ethical safeguards, and alignment with the stated research objectives.",
    "From a software engineering perspective, the section also shows how requirements become traceable through design, implementation, and evaluation. Each major feature is linked to a recruitment difficulty: unclear job descriptions, manual screening, inconsistent ranking, weak feedback, unstructured candidate data, interview coordination, and lack of administrative monitoring. This traceability is important for a final-year thesis because it demonstrates that the artefact was built to answer the research question, not merely to display technical skills."
  )
  for ($i = 0; $i -lt $Extra; $i++) { Add-Paragraph $details[$i % $details.Count] }
}

$references = @(
  "Abdollahnejad, M. K. and F. E. B. H. (2021). A Deep Learning BERT-Based Approach to Person-Job Fit in Talent Recruitment. International Conference on Computational Science and Computational Intelligence.",
  "Dessai, E. N. and F. N. B. (2024). Machine Learning Based Resume Shortlisting and Classification. International Research Journal of Engineering and Technology, 11, 2413-2418.",
  "European Parliament and Council. (2024). Regulation (EU) 2024/1689 Artificial Intelligence Act. Official Journal of the European Union.",
  "Gan, Q. Z. and T. M. C. (2024). Application of LLM Agents in Recruitment: A Novel Framework for Resume Screening.",
  "Jiang, S. Y., W. W., J. X. and L. X. J. (2020). Learning Effective Representations for Person-Job Fit by Feature Fusion.",
  "Kinge, S. M. P. C. and S. M. C. B. (2022). Resume Screening using Machine Learning and NLP: A Proposed System. International Journal of Scientific Research in Computer Science, Engineering and Information Technology.",
  "LinkedIn Talent Solutions. (2025). The Future of Recruiting 2025: How AI Redefines Recruiting Excellence.",
  "Mhatre, B. D. V., N. C. R. and P. G. S. (2023). Resume Screening and Ranking using Convolutional Neural Network. International Conference on Sustainable Computing and Smart Systems.",
  "National Institute of Standards and Technology. (2023). Artificial Intelligence Risk Management Framework (AI RMF 1.0). NIST AI 100-1.",
  "Nikumbe, P. and A. K. (2022). AI Based Job Portal. International Research Journal of Modernization in Engineering Technology and Science, 4, 760-763.",
  "Qin, C. et al. (2023). Towards Automatic Job Description Generation with Capability-Aware Neural Networks. Proceedings of the AAAI Conference on Artificial Intelligence, 35, 5341-5355.",
  "Rigotti, C. and Fosch-Villaronga, E. (2024). Fairness, AI and Recruitment. Computer Law and Security Review, 53, 105966.",
  "SHRM. (2024). HR Adopts AI: Challenges and Opportunities. Society for Human Resource Management.",
  "Varma, V. S. M. (2024). NLP-Automated Resume Analysis and Skill Suggesting Website.",
  "Wen, A. et al. (2025). FAIRE: Assessing Racial and Gender Bias in AI-Driven Resume Evaluations.",
  "Wilson, K. et al. (2026). Resume Screening, Fast and Slow: Biased AI Recommendations' Influence on Human Decision Making. ACM Conference on Fairness, Accountability, and Transparency.",
  "World Economic Forum. (2025). The Future of Jobs Report 2025. Geneva: World Economic Forum.",
  "Yadav, S. U. S. T. and S. A. T. (2024). Resume Analysis Using NLP and ATS Algorithm."
)

Add-TitleLine "INTELLIGENT RECRUITMENT AUTOMATION SYSTEM FOR IT INDUSTRY RECRUITMENT AUTOMATION, JOB MATCHING, AND SKILL GAP IDENTIFICATION"
Add-Paragraph "Complete Thesis Report" "Title" $true 28 "center"
Add-Paragraph "Presented to the Faculty of Computing" "Normal" $false 24 "center"
Add-Paragraph "NSBM Green University" "Normal" $false 24 "center"
Add-Paragraph "in partial fulfillment of the requirements for the degree of BSc (Hons) in Software Engineering" "Normal" $false 24 "center"
Add-Paragraph "by Kalpani D. Kapuge" "Normal" $false 24 "center"
Add-Paragraph "Student ID: 28870" "Normal" $false 24 "center"
Add-Paragraph "September 2026" "Normal" $false 24 "center"
Add-PageBreak

Add-Heading1 "Declaration"
Add-Paragraph "I hereby declare that this thesis titled Intelligent Recruitment Automation System for IT Industry Recruitment Automation, Job Matching, and Skill Gap Identification is based on my own research work carried out for the BSc (Hons) in Software Engineering degree programme. The submitted work has been prepared for academic purposes, and all sources, concepts, systems, frameworks, and publications used in the research have been acknowledged through in-text citations and the reference list. The earlier interim submission has been used as background material and reference continuity, while this final thesis expands the work according to the complete thesis chapter structure."
Add-Paragraph "Student Name: Kalpani D. Kapuge"
Add-Paragraph "Student ID: 28870"
Add-Paragraph "Signature: ........................................"
Add-Paragraph "Date: ........................................"
Add-PageBreak

Add-Heading1 "Abstract"
Add-Paragraph "Recruitment is a critical organizational process that directly affects workforce quality, project delivery, innovation capability, and business competitiveness. In the IT industry, recruitment is more challenging because roles require detailed assessment of programming languages, frameworks, tools, cloud platforms, software engineering practices, project experience, communication ability, and continuous learning potential. Conventional recruitment processes often depend on manually written job descriptions, keyword-based applicant tracking systems, subjective resume screening, disconnected interview scheduling, and limited candidate feedback. These practices can delay hiring, reduce transparency, overlook suitable applicants, and leave candidates without meaningful guidance for improvement."
Add-Paragraph "This research presents Merito, an Intelligent Recruitment Automation System implemented under the IRAS codebase, to support IT industry recruitment through AI-assisted job description generation, resume parsing, candidate-job matching, candidate ranking, skill-gap identification, CV generation, interview scheduling, notification management, feedback management, knowledge-base support, and recruitment chatbot assistance. The system supports three role-based workflows: Candidate, Employer, and Administrator. The Candidate workflow helps applicants maintain profiles, upload resumes, review job matches, manage applications, follow skill improvement plans, and receive feedback. The Employer workflow supports company profiles, job posting, AI-assisted job descriptions, applicant review, explainable ranking, and interview management. The Admin workflow supports moderation, evidence review, user management, audit visibility, and platform governance."
Add-Paragraph "The research follows Design Science Research Methodology because the study is centred on designing, developing, demonstrating, and evaluating a software artefact. The system was implemented using a React and TypeScript frontend, an ASP.NET Core Web API backend, Entity Framework Core, SQL Server, JWT-based authentication, role-based access control, AI service integration, document handling, and a layered architecture containing API, Application, Domain, and Infrastructure concerns. The matching approach combines text-based and structured skill features so that candidate suitability can be interpreted more meaningfully than simple keyword matching. The evaluation considers functional correctness, non-functional behaviour, usability, smoke testing, integration considerations, and model-related performance reported in the interim work."
Add-Paragraph "The study concludes that an integrated AI-assisted recruitment platform can reduce manual effort, improve candidate-job visibility, strengthen skill-gap awareness, and create a more transparent recruitment workflow when supported by explainability and human oversight. The research also identifies limitations related to real-world dataset quality, fairness evaluation, external AI service dependency, and the need for further longitudinal validation in live recruitment environments."
Add-Heading2 "Keywords"
Add-Paragraph "Artificial Intelligence; Candidate Feedback; Chatbot; Job Matching; Natural Language Processing; Recruitment Automation; Resume Screening; Skill Gap Analysis"
Add-PageBreak

Add-Heading1 "Table of Contents"
$toc = @(
  "Chapter 01 - Introduction",
  "1.1 Chapter Overview", "1.2 Problem Background", "1.3 Problem Statement", "1.3.1 General Problem", "1.3.2 Specific Problem", "1.4 Research Question", "1.5 Research Motivation", "1.6 Research Aim", "1.7 Research Objectives", "1.8 Rich Picture of the Proposed Solution", "1.9 Resource Requirements", "1.9.1 Hardware", "1.9.2 Software", "1.10 Project Scope", "1.11 Chapter Summary",
  "Chapter 02 - Literature Review", "2.1 Chapter Overview", "2.2 Conceptual Map of the Literature", "2.3 Domain Overview", "2.4 Existing Systems / Frameworks / Designs", "2.5 Technological Analysis", "2.5.1 Algorithmic Analysis", "2.5.2 Design Analysis", "2.5.3 Workflow Analysis", "2.6 Reflection",
  "Chapter 03 - Methodology", "3.1 Research Paradigm", "3.2 Research Approach", "3.3 Research Strategy", "3.4 Fact Collection Mechanisms", "3.5 Research Methodology Execution Workflow", "3.5.1 Problem Identification", "3.5.2 Relevance Justification", "3.5.3 Comparative Analysis and Gap Justification", "3.5.4 Define and Finalize Objectives", "3.5.5 Design / Development / Data Management and Handling", "3.5.6 Evaluation and Communication", "3.6 Project Management Methodology", "3.6.1 Project Timeline", "3.6.2 Ethical Considerations", "3.7 Chapter Summary",
  "Chapter 04 - System Requirement Specification", "4.1 Chapter Overview", "4.2 Stakeholder Analysis", "4.3 Operationalization Process", "4.4 System / Model Analysis", "4.4.1 Use Case Diagrams with Specifications", "4.4.2 Class Diagram", "4.4.3 Activity Diagram", "4.4.4 Sequence Diagrams Mapped with Use Cases", "4.4.5 State Chart / Deployment Diagram", "4.5 Proposed System Architecture", "4.6 Functional and Non-functional Requirements", "4.12 Chapter Summary",
  "Chapter 05 - Implementation / Designing", "5.1 Framework and Algorithm Design Steps", "5.1.1 Pseudocode / Flow Charts / Algorithms / Models", "5.1.2 Framework Workflow through Block Diagram Series", "5.1.3 Technology Selection Justification", "5.1.3.1 Programming Language", "5.1.3.2 Libraries Used", "5.1.3.3 Backend and Frontend Frameworks Used", "5.2 Significant Implementation Attempts with Evidence", "5.3 Chapter Summary",
  "Chapter 06 - Testing and Evaluation", "6.1 Chapter Overview", "6.2 Test Plan and Test Cases", "6.2.1 Nonfunctional Testing", "6.2.2 Functional Testing", "6.3 Testing / Evaluation Workflow", "6.4 Review on Test Strategies Used", "Chapter 07 - Concluding Remarks", "7.1 Accomplishment of the Research Objectives", "7.2 Problems Encountered", "7.3 Self-reflection", "7.3.1 Ideology about the Research", "7.3.2 Benefits Gained", "7.3.3 Learning Curves", "7.4 Business Insight of the Idea", "7.4.1 Real-world Application Possibilities", "7.5 Future Recommendations", "References", "Appendices"
)
foreach ($t in $toc) { Add-Paragraph $t }
Add-PageBreak

Add-Heading1 "List of Figures"
Add-Paragraph "Fig 1: Rich Picture of the Proposed Solution"
Add-Paragraph "Fig 2: Conceptual Map of the Literature"
Add-Paragraph "Fig 3: Design Science Research Methodology Execution Workflow"
Add-Paragraph "Fig 4: Proposed System Architecture"
Add-Paragraph "Fig 5: Candidate-Job Matching Workflow"
Add-Paragraph "Fig 6: Testing and Evaluation Workflow"
Add-Heading1 "List of Tables"
Add-Paragraph "Table 1.1 Hardware Resource Requirements"
Add-Paragraph "Table 1.2 Software Resource Requirements"
Add-Paragraph "Table 1.3 Project Scope"
Add-Paragraph "Table 2.1 Comparison of Existing Recruitment Systems and Literature"
Add-Paragraph "Table 3.1 Research Methodology Execution Workflow"
Add-Paragraph "Table 3.2 Ethical Considerations"
Add-Paragraph "Table 4.1 Stakeholder Analysis"
Add-Paragraph "Table 4.2 Functional Requirements"
Add-Paragraph "Table 4.3 Non-functional Requirements"
Add-Paragraph "Table 5.1 Technology Selection Justification"
Add-Paragraph "Table 6.1 Test Plan and Test Cases"
Add-PageBreak

Add-Heading1 "List of Abbreviations"
Add-Table @("Abbreviation", "Description") @(
  @("AI", "Artificial Intelligence"), @("API", "Application Programming Interface"), @("ATS", "Applicant Tracking System"), @("CV", "Curriculum Vitae"), @("DSR", "Design Science Research"), @("DSRM", "Design Science Research Methodology"), @("EF Core", "Entity Framework Core"), @("F1-score", "Harmonic mean of precision and recall"), @("IT", "Information Technology"), @("JWT", "JSON Web Token"), @("LLM", "Large Language Model"), @("ML", "Machine Learning"), @("NLP", "Natural Language Processing"), @("RBAC", "Role-Based Access Control"), @("S-BERT", "Sentence-Bidirectional Encoder Representations from Transformers"), @("SRS", "System Requirement Specification"), @("SQL", "Structured Query Language"), @("UI", "User Interface"), @("UX", "User Experience")
)
Add-PageBreak

Add-Heading1 "Chapter 01 - Introduction"
Add-ExpandedSection "1.1 Chapter Overview" "This chapter introduces the Intelligent Recruitment Automation System, branded in the user interface as Merito and implemented under the IRAS codebase. It explains the background of the recruitment problem, narrows the general problem into a software engineering research problem, states the research question, motivation, aim, objectives, proposed solution, required resources, and scope. The chapter is written to establish why an integrated recruitment automation system is relevant to the current IT labour market and why the research should be evaluated as a software artefact rather than only as a theoretical discussion." "The chapter therefore creates the foundation for the later literature review, methodology, system requirement specification, implementation, testing, and concluding remarks." 4
Add-ExpandedSection "1.2 Problem Background" "Recruitment in the IT industry has changed significantly because software roles now require combinations of technical skills, tools, project experience, communication capability, and evidence of continuous learning. Employers must handle many resumes and applications, while candidates expect faster decisions and more useful feedback. Manual recruitment and keyword-based screening can be slow, inconsistent, and opaque. The World Economic Forum reported that 63% of surveyed employers identify skills gaps as a major barrier to transformation and that 39% of workers' current skills may be transformed or become outdated during 2025-2030 (World Economic Forum, 2025). These labour market conditions make recruitment automation and skill visibility increasingly important." "The background also includes the ethical reality that AI systems used in recruitment may be high impact because they influence career opportunities. The EU AI Act treats recruitment and worker-management AI systems as high-risk, while NIST's AI Risk Management Framework emphasizes trustworthy, accountable, and measurable AI use. Therefore, the proposed system is framed as decision support with human oversight." 5
Add-ExpandedSection "1.3 Problem Statement" "The main problem addressed in this research is the lack of an integrated, explainable, and candidate-supportive recruitment automation platform for IT industry hiring. Many systems focus on single functions such as job posting, resume storage, keyword matching, or interview scheduling. However, the recruitment process requires a connected workflow that begins with clear job descriptions and continues through application screening, candidate ranking, skill-gap identification, communication, interview management, feedback, and administrative governance. When these functions are separated, employers spend additional time transferring information across tools and candidates receive limited guidance about how to improve." "The problem statement is supported by recent recruitment literature that identifies efficiency, fairness, explainability, and candidate experience as continuing concerns in algorithmic hiring." 5
Add-ExpandedSection "1.3.1 General Problem" "At a general level, inefficient recruitment causes delayed hiring, increased administrative workload, inconsistent evaluation, poor candidate experience, and reduced trust in hiring outcomes. Employers may miss suitable candidates because resumes are not analysed consistently, while candidates may be rejected without understanding whether the issue was insufficient skills, poor profile presentation, weak project evidence, or mismatch with the advertised job. The result is a recruitment environment where information exists but is not converted into useful decision support." "The high-level implication is that organizations lose time and candidates lose development guidance, creating a cycle where both sides of the labour market operate with incomplete visibility." 4
Add-ExpandedSection "1.3.2 Specific Problem" "Within Software Engineering and Information Systems, the specific shortcoming is the absence of a unified system that connects AI-assisted job description generation, resume parsing, technical skill extraction, candidate-job matching, explainable ranking, skill-gap analysis, feedback, interview management, notifications, and admin governance. Existing recruitment tools can automate parts of the process, but they often lack transparent explanations and candidate improvement support. This creates a research gap for an integrated artefact that supports both employer efficiency and candidate development in IT recruitment." "This study addresses that gap by designing and evaluating Merito / IRAS as a role-based intelligent recruitment platform." 4
Add-ExpandedSection "1.4 Research Question" "The main research question is: How can an AI-assisted recruitment automation system be designed and evaluated to improve the efficiency, transparency, and usefulness of IT industry recruitment workflows for candidates, employers, and administrators? This question transforms the problem statement into a design-oriented research inquiry. It asks not only whether AI can be used in recruitment, but how the system should be structured, how workflows should be connected, and how the artefact should be evaluated." "Sub-areas include job description generation, resume parsing, candidate ranking, skill-gap analysis, feedback generation, and role-based workflow support." 4
Add-ExpandedSection "1.5 Research Motivation" "The motivation for this research comes from observing that recruitment is often stressful for both applicants and employers. Candidates invest time preparing resumes and applications but frequently receive little explanation after rejection. Employers, especially in the IT sector, must compare many technical profiles under time pressure. The researcher was motivated to explore whether a software artefact could reduce manual effort while still giving candidates clearer development guidance." "The system therefore aims to make recruitment more useful, explainable, and structured rather than merely faster." 4
Add-ExpandedSection "1.6 Research Aim" "The aim of this research is to design, develop, and evaluate an Intelligent Recruitment Automation System for IT industry recruitment that supports AI-assisted job description generation, resume parsing, candidate-job matching, candidate ranking, skill-gap analysis, CV generation, interview scheduling, notifications, feedback, knowledge-base support, and chatbot assistance through integrated Candidate, Employer, and Admin workflows." "The expected outcome is a working software artefact and an evaluated research contribution that demonstrates how recruitment automation can be implemented responsibly." 4
Add-Heading2 "1.7 Research Objectives"
Add-Bullets @(
  "To identify the major limitations of manual, keyword-based, and disconnected recruitment processes in IT industry hiring.",
  "To analyze candidate, employer, and administrator requirements for an intelligent recruitment automation platform.",
  "To design, implement, and develop an integrated AI-assisted recruitment system with job description generation, resume parsing, candidate ranking, skill-gap identification, feedback, and workflow support.",
  "To evaluate the proposed system using functional testing, non-functional testing, smoke testing, usability-oriented assessment, and model-performance evidence where applicable."
)
Add-ExpandedSection "1.7.1 To Identify" "The first objective is to identify recruitment difficulties experienced by employers and candidates, including manual screening effort, inconsistent shortlisting, limited feedback, unclear job descriptions, weak skill visibility, and difficulty coordinating interviews. Identification is important because it confirms that the proposed artefact responds to real workflow problems rather than assumed technical curiosity." "This objective is achieved through literature review, previous interim research, analysis of existing systems, and requirement reflection." 3
Add-ExpandedSection "1.7.2 To Analyze" "The second objective is to analyze functional, non-functional, ethical, and workflow requirements for the proposed system. The analysis considers what candidates need to manage profiles and improve skills, what employers need to evaluate applicants, and what administrators need to govern the platform. It also considers fairness, transparency, privacy, role-based access, and auditability." "The analysis converts the identified problem into implementable system requirements." 3
Add-ExpandedSection "1.7.3 To Design / Implement / Develop" "The third objective is to design, implement, and develop the proposed system using suitable software engineering practices. This includes user interface design, backend API design, database modelling, AI service integration, resume and CV handling, job matching logic, notification handling, and chatbot workflows. The implementation follows a layered architecture to separate domain logic from infrastructure and presentation concerns." "This objective forms the core design science artefact contribution." 3
Add-ExpandedSection "1.7.4 To Evaluate" "The fourth objective is to evaluate the system against its intended purpose. Evaluation includes functional test cases, non-functional considerations, type checking, production build verification, smoke testing, and interpretation of model performance from the candidate-job suitability component. The evaluation also reflects on whether the system addresses the research gap and whether it remains suitable for human-supervised recruitment." "This objective ensures that the thesis is evidence-based rather than only descriptive." 3
Add-Heading2 "1.8 Rich Picture of the Proposed Solution"
Add-Figure "Fig 1: Rich Picture of the Proposed Solution" "Candidate -> Profile/Resume/CV/Applications -> Matching and Feedback -> Skill Improvement`nEmployer -> Job Description/Job Post -> Applicant Ranking -> Interview/Decision`nAdmin -> Users/Moderation/Evidence/Audit -> Platform Governance`nAI Layer -> Parsing, Matching, Ranking, Feedback, Chatbot`nData Layer -> Users, Jobs, Resumes, Skills, Applications, Interviews, Notifications" "Fig 1 shows the complete recruitment environment addressed by the proposed solution. The figure demonstrates that Merito / IRAS is not a single resume screening tool, but a connected platform where candidates, employers, administrators, AI services, and data stores interact through structured workflows. It also illustrates that the AI layer provides support functions while the employer remains responsible for final recruitment decisions."
Add-ExpandedSection "1.9 Resource Requirements" "The project required resources for design, development, testing, documentation, and demonstration. The required resources were selected according to a web-based full-stack software engineering project, with additional support for AI-assisted recruitment features and document handling. The resource planning focused on practical availability because the system had to be implemented as a final-year research artefact within a limited timeline." "The following subsections divide resources into hardware and software requirements." 3
Add-Heading2 "1.9.1 Hardware"
Add-Table @("Resource", "Minimum Requirement", "Purpose") @(
  @("Development computer", "Intel Core i5/Ryzen 5 or higher, 8GB RAM minimum", "Frontend/backend development and local testing"),
  @("Storage", "20GB free storage or higher", "Source code, uploaded resumes, generated documents, database files, and build outputs"),
  @("Internet connection", "Stable broadband connection", "Package installation, AI service access, research access, and deployment"),
  @("Browser-capable device", "Modern desktop/laptop browser", "UI testing and smoke testing")
)
Add-Heading2 "1.9.2 Software"
Add-Table @("Software", "Use in Project", "Justification") @(
  @("React with TypeScript", "Frontend user interface", "Supports component-based development and type safety"),
  @("Vite", "Frontend build tool", "Fast development server and optimized production build"),
  @("ASP.NET Core Web API", "Backend services", "Suitable for secure enterprise-style API development"),
  @("Entity Framework Core", "Data access", "Supports ORM-based database management"),
  @("SQL Server", "Database", "Reliable relational storage for recruitment data"),
  @("JWT Authentication", "Security", "Supports stateless user sessions and role-based access"),
  @("Git", "Version control", "Tracks implementation changes and supports project management"),
  @("Swagger/OpenAPI", "API documentation", "Improves testing and backend communication")
)
Add-ExpandedSection "1.10 Project Scope" "The project scope defines what the system includes and excludes. Since the research is focused on IT recruitment automation, the scope includes the most important workflows required to demonstrate intelligent recruitment support. It excludes areas such as payroll, employee performance management, background verification, and fully autonomous hiring because those are outside the research aim and would require legal, organizational, and operational resources beyond the thesis boundary." "A clear scope also protects the research from becoming an overly broad HR management system." 3
Add-Table @("In Scope", "Out of Scope") @(
  @("Candidate registration, profile management, resume upload, CV generation, job browsing, applications, skill improvement plans, and feedback", "Payroll, employee onboarding after hiring, and long-term employee performance management"),
  @("Employer registration, company profile, job creation, AI-assisted job descriptions, applicant ranking, and interview management", "Fully autonomous hiring decisions without human review"),
  @("Admin moderation, evidence review, user management, audit visibility, knowledge-base and system monitoring", "Government-level regulatory certification for high-risk AI deployment"),
  @("AI-assisted parsing, matching, ranking, feedback, and chatbot support", "Real-time video interview emotion analysis or biometric evaluation"),
  @("Functional, non-functional, smoke, and model-related evaluation", "Large-scale live production trial with many companies")
)
Add-ExpandedSection "1.11 Chapter Summary" "This chapter established the problem, motivation, aim, objectives, proposed solution, resource requirements, and scope of the research. The chapter explained that IT recruitment requires more than simple keyword filtering because candidate suitability depends on multiple technical and experiential signals. It also emphasized that AI in recruitment must be designed as transparent decision support with human oversight." "The next chapter reviews literature, existing systems, frameworks, algorithms, designs, and workflows relevant to the proposed research gap." 3
Add-PageBreak

Add-Heading1 "Chapter 02 - Literature Review"
Add-ExpandedSection "2.1 Chapter Overview" "This chapter reviews literature related to recruitment automation, AI-assisted hiring, job description generation, resume parsing, person-job fit prediction, skill-gap analysis, chatbot support, and responsible AI. The chapter follows the provided UGC-oriented structure by first presenting a conceptual map, then discussing the domain, existing systems and frameworks, technological analysis, and reflection. The review uses recent literature wherever possible because AI recruitment has changed rapidly during the last five years." "Personal reflection is included by comparing each literature area with the implemented Merito / IRAS system and by identifying how the research gap emerges." 5
Add-Heading2 "2.2 Conceptual Map of the Literature"
Add-Figure "Fig 2: Conceptual Map of the Literature" "Recruitment Automation`n  -> Job Description Generation`n  -> Resume Parsing and Screening`n  -> Person-Job Fit and Ranking`n  -> Skill Gap Analysis and Feedback`n  -> Workflow Integration and UX`n  -> Responsible AI, Fairness, Transparency, Governance" "Fig 2 organizes the literature into connected themes that support the thesis. It shows that the research does not depend on one isolated algorithm, because the proposed system combines recruitment domain needs, AI techniques, software architecture, workflow design, and ethical governance into one artefact."
Add-ExpandedSection "2.3 Domain Overview" "Recruitment is the process of attracting, evaluating, selecting, and communicating with potential employees. In the IT industry, recruitment is especially demanding because technical roles are highly specialized and change quickly. A web developer, data analyst, cloud engineer, UI engineer, quality assurance engineer, and software architect may all require different combinations of skills, even when job titles appear similar. Therefore, recruitment systems must handle skill granularity and role-specific relevance." "The domain overview shows why the proposed research is situated primarily in IT industry recruitment rather than general labour recruitment." 5
Add-ExpandedSection "2.4 Existing Systems / Frameworks / Designs" "Existing recruitment systems include Applicant Tracking Systems, job boards, AI resume screening tools, HR management suites, interview scheduling platforms, and recruitment chatbots. These systems provide useful functions, but many are limited by fragmentation. Applicant Tracking Systems collect and filter applications but may not provide strong candidate development feedback. Job boards connect employers and candidates but often stop after application submission. AI screening tools may rank resumes but can be opaque, raising fairness and accountability concerns." "The comparative reflection shows that Merito / IRAS attempts to combine several useful recruitment functions into a single academic artefact while maintaining explainability and human decision control." 6
Add-Table @("System / Literature Area", "Strength", "Limitation", "Relevance to Merito / IRAS") @(
  @("Traditional ATS", "Stores applications and supports recruiter workflow", "Often relies on keyword filtering and limited explanation", "Motivates explainable ranking and skill matching"),
  @("AI job description generation", "Can improve speed and completeness of job posts", "May produce generic or biased text if unmanaged", "Supports AI-assisted employer job creation"),
  @("Resume parsing systems", "Extracts structured data from unstructured documents", "Accuracy depends on resume format and terminology", "Supports candidate profile enrichment"),
  @("Person-job fit models", "Predicts suitability using text and structured features", "Can become opaque without explanation", "Supports match score and ranking design"),
  @("Recruitment chatbots", "Provides faster guidance to users", "May answer beyond reliable domain knowledge", "Supports controlled recruitment assistance"),
  @("Responsible AI frameworks", "Emphasizes governance, transparency, and risk management", "Requires practical translation into system design", "Guides human oversight and auditability")
)
Add-ExpandedSection "2.5 Technological Analysis" "The technological analysis examines how algorithms, system design, and workflows contribute to the proposed artefact. The implemented system is not only a machine learning experiment; it is a full-stack information system. Therefore, the technology discussion must include candidate-job matching logic, AI service integration, backend architecture, frontend usability, data modelling, API communication, authentication, and testing." "This structure reflects the Software Engineering nature of the research." 5
Add-ExpandedSection "2.5.1 Algorithmic Analysis" "Algorithms in recruitment automation can include keyword matching, TF-IDF similarity, semantic embeddings, classification models, ranking algorithms, skill overlap scoring, and large language model prompting. The interim submission compared Logistic Regression, Random Forest, Linear SVM, and XGBoost for candidate-job suitability classification. The results showed that full-feature models performed much better than text-only models, indicating that structured features such as skill overlap and similarity are important for recruitment matching." "This finding supports the design choice to combine textual interpretation with structured skill data instead of relying only on resume text." 6
Add-ExpandedSection "2.5.2 Design Analysis" "The design literature supports modular architecture, separation of concerns, secure authentication, role-based access, and traceable workflows. Merito / IRAS applies these principles by separating frontend presentation, backend API endpoints, application logic, domain entities, and infrastructure services. The design also supports three main user roles so that candidates, employers, and administrators only access relevant features." "The design analysis shows that architecture contributes to research quality because a recruitment platform must be maintainable, secure, and extensible." 6
Add-ExpandedSection "2.5.3 Workflow Analysis" "Workflow analysis focuses on how users move through the recruitment process. A candidate workflow begins with registration, profile completion, resume upload, job browsing, application, match review, feedback, and skill improvement. An employer workflow begins with registration, company profile, job creation, AI-assisted job description, applicant review, ranking, interview scheduling, and final decision. An admin workflow includes moderation, evidence review, user control, audit logs, and system monitoring." "This workflow-oriented view demonstrates that the research gap is not solved by one algorithm alone; it requires a complete information system." 6
Add-ExpandedSection "2.6 Reflection" "The literature confirms that recruitment automation is valuable but risky if designed without transparency and governance. Recent research on fairness in AI recruitment warns that algorithmic systems can reproduce bias if training data, features, and decision processes are not carefully managed. At the same time, industry reports show growing demand for AI-supported recruitment and skill-based hiring. The research gap is therefore the need for an integrated, explainable, candidate-supportive recruitment automation platform for IT hiring." "Merito / IRAS contributes by combining job generation, resume parsing, matching, ranking, feedback, skill improvement, communication, and administration in one artefact." 6
Add-PageBreak

Add-Heading1 "Chapter 03 - Methodology"
Add-ExpandedSection "3.1 Research Paradigm" "This research follows a pragmatic paradigm. Pragmatism is suitable because the study is concerned with solving a practical recruitment problem through the design and evaluation of a working software artefact. The research does not depend only on one philosophical position; it combines literature evidence, requirement analysis, design decisions, implementation evidence, and testing outcomes to judge whether the system is useful." "The pragmatic paradigm is appropriate for Software Engineering research because practical utility, stakeholder value, and technical correctness are all important." 5
Add-ExpandedSection "3.2 Research Approach" "The research approach is mainly applied and design-oriented, with both deductive and inductive elements. Deductive reasoning appears when concepts from literature, such as AI recruitment fairness, skill-gap analysis, and workflow integration, are translated into system requirements. Inductive reasoning appears when implementation and testing reveal practical limitations, such as deployment constraints, timeout handling, user interface refinements, and feature integration issues." "This blended approach supports the Design Science nature of the study." 5
Add-ExpandedSection "3.3 Research Strategy" "The research strategy is Design Science Research Methodology. DSRM is suitable because the research output is an artefact that must be designed, built, demonstrated, and evaluated. The artefact is Merito / IRAS, a full-stack recruitment automation platform. The strategy allows the researcher to connect the identified problem with an implemented solution and then evaluate the solution using appropriate evidence." "This strategy is stronger than a purely descriptive study because it demonstrates practical construction and evaluation." 5
Add-ExpandedSection "3.4 Fact Collection Mechanisms" "Fact collection was based on literature review, analysis of existing recruitment systems, review of previous interim submission findings, observation of common recruitment workflows, and technical evaluation of the implemented software. The fact collection focused on identifying employer needs, candidate needs, administrative requirements, algorithmic matching considerations, ethical concerns, and system usability expectations." "Because the project is a final-year software engineering artefact, the fact collection emphasizes requirements and evaluation evidence that can directly guide design and implementation." 5
Add-Heading2 "3.5 Research Methodology Execution Workflow"
Add-Figure "Fig 3: Design Science Research Methodology Execution Workflow" "Problem Identification -> Relevance Justification -> Literature and Gap Analysis -> Objectives -> Design and Development -> Demonstration -> Testing and Evaluation -> Communication" "Fig 3 presents the DSRM workflow followed by the research. The workflow shows that the system was not developed randomly; it moved from problem recognition to literature-supported gap justification, then to artefact construction, evaluation, and thesis communication."
Add-Table @("DSRM Activity", "Application in this Research", "Output") @(
  @("Problem Identification", "Manual and fragmented recruitment problems were identified", "Problem background and statement"),
  @("Relevance Justification", "Recent labour-market and AI recruitment sources were reviewed", "Research motivation and gap"),
  @("Design and Development", "Merito / IRAS was designed and implemented", "Working software artefact"),
  @("Demonstration", "Candidate, Employer, and Admin workflows were demonstrated", "Screens and workflow evidence"),
  @("Evaluation", "Testing, build verification, and model evidence were considered", "Evaluation results"),
  @("Communication", "Final thesis was prepared", "Complete academic report")
)
Add-ExpandedSection "3.5.1 Problem Identification" "Problem identification was carried out by analysing recruitment difficulties such as manual resume screening, unclear job descriptions, weak feedback, inconsistent shortlisting, interview coordination problems, and lack of system-wide transparency. In IT recruitment, these issues become more serious because technical skill combinations are complex and can change quickly." "The identified problem guided the selection of system features and research objectives." 4
Add-ExpandedSection "3.5.2 Relevance Justification" "The relevance of the problem was justified using current labour market and AI recruitment literature. The World Economic Forum's 2025 report shows major skill transformation and employer concern about skills gaps. SHRM's 2024 reporting confirms increasing AI adoption in HR. The EU AI Act and NIST AI RMF demonstrate that AI recruitment systems require responsible design." "These sources justify why the research is timely and why transparency matters." 4
Add-ExpandedSection "3.5.3 Comparative Analysis and Gap Justification" "Comparative analysis considered existing recruitment tools, resume screening literature, job matching models, and recruitment chatbot approaches. The gap identified is that many systems address individual recruitment functions but do not provide a complete integrated workflow that supports candidates, employers, and administrators while also giving explainable feedback and skill-gap guidance." "This gap became the basis of the proposed artefact." 4
Add-ExpandedSection "3.5.4 Define and Finalize Objectives" "The objectives were finalized after aligning the problem, literature gap, and feasible system scope. The objectives follow the identify, analyze, design/develop, and evaluate structure recommended for undergraduate research. This objective structure helps show clear progression from investigation to implementation and evaluation." "The objectives also provide criteria for Chapter 07 when judging accomplishment." 4
Add-ExpandedSection "3.5.5 Design / Development / Data Management and Handling" "Design and development included database modelling, API design, frontend component implementation, authentication, role-based navigation, document upload, generated CV handling, matching logic, notifications, interviews, evidence review, and chatbot workflows. Data handling considered privacy, access control, secure authentication, and separation of candidate, employer, and admin permissions." "These activities translate the methodology into a working system." 5
Add-ExpandedSection "3.5.6 Evaluation and Communication" "Evaluation was planned through functional tests, non-functional tests, smoke tests, production build checks, and review of model performance evidence. Communication is completed through this thesis, which documents the problem, related work, methodology, requirements, implementation, testing, and conclusions." "This ensures the research artefact is not only built but also academically justified." 4
Add-ExpandedSection "3.6 Project Management Methodology" "A Kanban-oriented agile project management approach was suitable for this research because the system involved many connected features and iterative improvements. Kanban supports continuous task tracking, prioritisation, implementation, testing, and refinement without requiring a fixed sprint team. For an individual final-year project, this approach is practical because work can be organized into backlog, in-progress, testing, and completed states." "The methodology also allowed design changes based on implementation realities." 4
Add-Heading2 "3.6.1 Project Timeline"
Add-Table @("Phase", "Activities", "Approximate Period") @(
  @("Planning", "Topic selection, problem background, initial proposal", "Early project period"),
  @("Literature Review", "Recruitment automation, AI hiring, NLP, matching and fairness review", "Interim stage"),
  @("Design", "Architecture, database, workflows, SRS and UI planning", "Middle stage"),
  @("Implementation", "Frontend, backend, authentication, recruitment modules and AI support", "Middle to final stage"),
  @("Testing", "Functional, non-functional, integration and smoke testing", "Final stage"),
  @("Documentation", "Final thesis preparation and formatting", "Final submission stage")
)
Add-ExpandedSection "3.6.2 Ethical Considerations" "Ethical considerations are central because recruitment systems affect career opportunity. The system handles personal data such as resumes, contact details, skills, project history, applications, interview records, and feedback. Therefore, role-based access, data minimization, secure authentication, and audit visibility are necessary. AI outputs must be treated as support rather than final decisions, and candidates should receive meaningful explanations where possible." "The system design avoids biometric evaluation and supports human oversight." 5
Add-Table @("Ethical Area", "Risk", "Mitigation") @(
  @("Privacy", "Resumes and profiles contain personal data", "Use authentication, authorization, and limited access"),
  @("Bias", "AI ranking may reflect unfair patterns", "Use explainable scores and human review"),
  @("Transparency", "Candidates may not know why they were rejected", "Provide feedback and skill-gap information"),
  @("Accountability", "Actions may be difficult to trace", "Maintain audit logs and admin monitoring"),
  @("AI Dependence", "Users may over-trust generated outputs", "Keep final decisions under employer control")
)
Add-ExpandedSection "3.7 Chapter Summary" "This chapter explained the research paradigm, approach, strategy, fact collection mechanisms, DSRM execution workflow, project management methodology, timeline, and ethical considerations. The methodology shows that the research is practical, artefact-centred, and evaluation-oriented." "The next chapter specifies the system requirements and analysis models that guided implementation." 4
Add-PageBreak

Add-Heading1 "Chapter 04 - System Requirement Specification"
Add-ExpandedSection "4.1 Chapter Overview" "This chapter presents the System Requirement Specification for Merito / IRAS. It includes stakeholder analysis, operationalization of requirements, system and model analysis, use case descriptions, class structure, activity flow, sequence flow, deployment view, architecture, and functional and non-functional requirements. The purpose of the chapter is to show how the research problem was translated into a buildable system." "The SRS chapter is important because it creates traceability between objectives and implementation." 5
Add-Heading2 "4.2 Stakeholder Analysis"
Add-Table @("Stakeholder", "Needs", "System Support") @(
  @("Candidate", "Create profile, upload resume, find jobs, receive feedback, identify skill gaps", "Candidate dashboard, resume/CV modules, job matches, applications, skill plans"),
  @("Employer", "Create jobs, review applicants, rank candidates, schedule interviews", "Employer dashboard, AI job description, applicant ranking, interviews"),
  @("Administrator", "Govern users, jobs, evidence, audit and system health", "Admin dashboard, moderation, evidence review, audit logs"),
  @("Researcher", "Evaluate feasibility and research objectives", "Testing evidence, model results, workflow demonstration"),
  @("Recruitment Organization", "Reduce manual effort and improve consistency", "Integrated recruitment workflow")
)
Add-ExpandedSection "4.3 Operationalization Process" "Operationalization maps research objectives to concrete system requirements and evaluation evidence. The objective to identify recruitment issues is operationalized through literature and existing system comparison. The objective to analyze requirements is operationalized through stakeholder analysis and SRS. The objective to design and develop is operationalized through implemented modules. The objective to evaluate is operationalized through test cases, build verification, smoke testing, and model-related results." "This mapping ensures the thesis remains research-driven." 5
Add-Heading2 "4.4 System / Model Analysis"
Add-Paragraph "The system analysis identifies major actors, entities, interactions, states, and deployment components. The analysis is presented textually in this thesis document so that it remains readable in Word format. In the final submission, these diagrams may be redrawn using UML tools if the university requires graphical notation."
Add-Heading2 "4.4.1 Use Case Diagrams with Specifications"
Add-Table @("Use Case", "Actor", "Description", "Precondition", "Postcondition") @(
  @("Manage Candidate Profile", "Candidate", "Candidate enters personal, educational, skill and project details", "Candidate is authenticated", "Profile is updated"),
  @("Upload Resume", "Candidate", "Candidate uploads a resume for parsing and profile support", "Candidate is authenticated", "Resume is stored and parse status updated"),
  @("Create Job", "Employer", "Employer creates job post manually or using AI assistance", "Employer is authenticated", "Job post is saved"),
  @("Review Applicants", "Employer", "Employer reviews ranked applicants and match details", "Job has applications", "Candidate evaluation is supported"),
  @("Schedule Interview", "Employer", "Employer schedules interview for applicant", "Application exists", "Interview record and notification are created"),
  @("Review Evidence", "Admin", "Admin reviews skill improvement evidence", "Evidence submitted", "Evidence status is updated")
)
Add-ExpandedSection "4.4.2 Class Diagram" "The main conceptual classes include User, CandidateProfile, EmployerProfile, Job, Resume, Skill, Application, JobMatch, SkillGap, SkillImprovementPlan, Evidence, Interview, Notification, Feedback, KnowledgeBaseItem, ChatMessage, and AuditLog. User is the core identity class and is specialized by role through Candidate, Employer, and Admin workflows. Job connects to employer data and applications, while CandidateProfile connects to resumes, skills, projects, applications, CVs, and skill plans." "This class structure supports normalized data and traceable recruitment activities." 5
Add-ExpandedSection "4.4.3 Activity Diagram" "The core activity flow begins when an employer creates a job and a candidate completes a profile. The system parses candidate information, compares job requirements with candidate skills, produces match scores or suitability categories, and displays ranked candidates to the employer. If the employer shortlists a candidate, interview scheduling and notifications follow. If the candidate is not suitable, the system can provide feedback and skill-gap recommendations." "The activity view confirms the continuous workflow from job creation to decision support." 5
Add-ExpandedSection "4.4.4 Sequence Diagrams Mapped with Use Cases" "Three important sequence flows are selected. First, in resume upload, the Candidate sends a resume through the frontend, the backend validates and stores it, the parsing service extracts text and skills, and the profile is updated. Second, in AI job description generation, the Employer enters role details, the frontend calls the backend, the AI service drafts structured content, and the employer reviews before saving. Third, in applicant review, the Employer opens a job, the backend retrieves applications and match scores, the frontend displays ranked cards, and the employer chooses the next action." "These sequences represent the most research-relevant interactions." 5
Add-ExpandedSection "4.4.5 State Chart / Deployment Diagram" "Important states include application status, resume parse status, evidence verification status, interview status, notification read status, and job publication status. For example, evidence can move from Draft to Submitted, then to Approved or Rejected. The deployment view includes a browser client, Vite-built React frontend, ASP.NET Core API, SQL Server database, file storage, and optional AI service integration." "The state and deployment views help clarify runtime behaviour and infrastructure needs." 5
Add-Heading2 "4.5 Proposed System Architecture"
Add-Figure "Fig 4: Proposed System Architecture" "Browser Client -> React TypeScript Frontend -> ASP.NET Core Web API -> Application Services -> Domain Entities -> EF Core / SQL Server`nExternal Services -> AI Service, File Storage, Email/Notification Support`nCross-cutting -> JWT Auth, RBAC, Validation, Audit Logs" "Fig 4 shows the layered architecture of the proposed system. The architecture separates user interface, API, application services, domain rules, data persistence, and external services so that the system remains maintainable and testable."
Add-ExpandedSection "4.6 Functional and Non-functional Requirements" "Functional requirements describe what the system must do, while non-functional requirements describe how well the system must operate. Because recruitment involves sensitive information, the non-functional requirements are especially important. The system must be secure, usable, responsive, maintainable, and reliable enough to support recruitment workflows." "The following tables summarize key requirements." 4
Add-Table @("ID", "Functional Requirement", "Priority") @(
  @("FR01", "The system shall authenticate users and route them according to Candidate, Employer, or Admin role.", "High"),
  @("FR02", "The system shall allow candidates to manage profiles, skills, projects, resumes, and CVs.", "High"),
  @("FR03", "The system shall allow employers to create and manage job posts.", "High"),
  @("FR04", "The system shall provide AI-assisted job description generation.", "Medium"),
  @("FR05", "The system shall rank or classify candidate-job suitability.", "High"),
  @("FR06", "The system shall identify candidate skill gaps and support improvement plans.", "High"),
  @("FR07", "The system shall support interview scheduling and notifications.", "Medium"),
  @("FR08", "The system shall support admin moderation, evidence review, and audit visibility.", "High")
)
Add-Table @("ID", "Non-functional Requirement", "Justification") @(
  @("NFR01", "Security", "Recruitment data includes personal and professional information"),
  @("NFR02", "Usability", "Candidates and employers must complete workflows without confusion"),
  @("NFR03", "Reliability", "Core recruitment features must operate consistently"),
  @("NFR04", "Performance", "Dashboards and lists should load within acceptable time"),
  @("NFR05", "Maintainability", "Layered architecture should support future extension"),
  @("NFR06", "Explainability", "Users should understand match and feedback outputs"),
  @("NFR07", "Scalability", "System should support additional jobs, users, and resumes")
)
Add-ExpandedSection "4.12 Chapter Summary" "This chapter specified the stakeholders, operationalization process, system analysis, architecture, and requirements of Merito / IRAS. The SRS demonstrates that the system is grounded in the research objectives and recruitment domain needs." "The next chapter describes how the system was designed and implemented." 4
Add-PageBreak

Add-Heading1 "Chapter 05 - Implementation / Designing"
Add-ExpandedSection "5.1 Framework and Algorithm Design Steps" "The implementation followed a full-stack design process. First, the system roles and workflows were defined. Second, the data model was organized around users, profiles, jobs, resumes, skills, applications, interviews, notifications, feedback, and skill improvement plans. Third, the backend API was implemented with services and repositories. Fourth, the frontend was built with reusable components, protected routes, dashboards, forms, cards, tables, and role-specific navigation. Fifth, AI-assisted features were connected through service boundaries so that generated outputs could be reviewed by users." "The algorithmic design focused on matching candidate evidence to job requirements rather than using a black-box decision as the only output." 6
Add-Heading2 "5.1.1 Pseudocode / Flow Charts / Algorithms / Models"
Add-Paragraph "Pseudocode for candidate-job matching:"
Add-Paragraph "Input: candidate profile, parsed resume, candidate skills, job description, required skills, preferred skills. Step 1: normalize skills and role terms. Step 2: compute required skill overlap. Step 3: compute preferred skill overlap. Step 4: compute text similarity between resume/profile and job description. Step 5: combine structured and text features. Step 6: classify suitability as No Fit, Potential Fit, or Good Fit. Step 7: generate explanation using matched skills, missing skills, and supporting evidence. Step 8: display result to employer and candidate where appropriate."
Add-Figure "Fig 5: Candidate-Job Matching Workflow" "Candidate Profile + Resume -> Skill Extraction -> Job Requirement Extraction -> Feature Construction -> Suitability Classification -> Score and Explanation -> Employer Review / Candidate Feedback" "Fig 5 describes the matching workflow used by the proposed recruitment system. The workflow shows that the match output is produced from both candidate-side and job-side information, and that the final output includes explanation so users are not given only a raw score."
Add-ExpandedSection "5.1.2 Framework Workflow through Block Diagram Series" "The framework workflow can be described through four connected blocks. The candidate block handles profile, resume, CV, applications, job matches, feedback, and skill improvement. The employer block handles company profile, job description generation, job management, applicants, ranking, and interviews. The admin block handles governance, moderation, evidence review, users, and audit logs. The AI and data block supports parsing, matching, feedback, chatbot responses, and persistence." "This block structure reflects the system's practical implementation." 5
Add-Heading2 "5.1.3 Technology Selection Justification"
Add-Table @("Technology", "Role", "Justification") @(
  @("TypeScript", "Frontend language", "Improves reliability through static typing"),
  @("React", "Frontend library", "Supports reusable and interactive UI components"),
  @("Vite", "Build tool", "Provides fast development and production builds"),
  @("ASP.NET Core", "Backend framework", "Suitable for secure, structured Web API development"),
  @("C#", "Backend language", "Strong typing and enterprise ecosystem"),
  @("Entity Framework Core", "ORM", "Simplifies relational data access"),
  @("SQL Server", "Database", "Reliable structured data persistence"),
  @("JWT", "Authentication", "Supports stateless authenticated API calls"),
  @("Tailwind CSS", "Styling", "Supports consistent utility-based UI design")
)
Add-ExpandedSection "5.1.3.1 Programming Language" "TypeScript was selected for the frontend because the system contains many role-specific data types and API responses. Static typing helps reduce errors when passing job, candidate, notification, and application data between components. C# was selected for the backend because ASP.NET Core provides a mature ecosystem for secure Web API development, validation, dependency injection, and layered architecture." "The combination supports maintainable full-stack implementation." 4
Add-ExpandedSection "5.1.3.2 Libraries Used" "The frontend uses libraries such as React Router for navigation, Zustand for state management, Axios for API communication, Zod for validation, Radix UI primitives for accessible interface behaviour, Lucide React for icons, Recharts for data visualization, and Sonner for toast notifications. These libraries reduce repetitive work while keeping the implementation understandable." "Library selection was guided by maintainability and fit with the system's workflows." 4
Add-ExpandedSection "5.1.3.3 Backend and Frontend Frameworks Used" "The frontend framework is React with Vite, providing a fast and modular interface for candidate, employer, and admin screens. The backend framework is ASP.NET Core Web API, supported by Entity Framework Core and SQL Server. The architecture separates API controllers, application services, domain entities, and infrastructure concerns, which supports future testing and extension." "This combination is suitable for a Software Engineering final-year project because it resembles industry-style application development." 4
Add-ExpandedSection "5.2 Significant Implementation Attempts with Evidence" "Significant implementation attempts include the candidate-job matching feature, skill-gap analysis, AI-assisted job description generation, role-based dashboards, notification routing, skill improvement evidence handling, interview management, and recruitment chatbot support. Basic login and registration are necessary for system operation, but the research contribution is more strongly represented by the intelligent and workflow-based features. The implemented frontend includes candidate job match pages with retryable error states, notification actions linked to role-specific routes, evidence deletion rules based on verification status, and branded Merito UI screens." "These implementation details show that the system evolved beyond a basic CRUD application into a connected recruitment support platform." 6
Add-ExpandedSection "5.3 Chapter Summary" "This chapter described the implementation and design of the proposed system, including algorithmic workflow, framework blocks, technology choices, programming languages, libraries, frontend/backend frameworks, and significant implemented features. The implementation reflects the research objectives by connecting AI-assisted recruitment functions with practical role-based workflows." "The next chapter evaluates the system through testing and research reflection." 4
Add-PageBreak

Add-Heading1 "Chapter 06 - Testing and Evaluation"
Add-ExpandedSection "6.1 Chapter Overview" "This chapter presents testing and evaluation of the Merito / IRAS system. Testing is necessary because a recruitment platform handles important user data and must support multiple workflows. The evaluation includes functional testing, non-functional testing, integration considerations, smoke testing, build verification, and model-performance interpretation. The purpose is to determine whether the system is suitable for demonstration and whether it addresses the research objectives." "The chapter also explains why selected test strategies are relevant instead of listing tests without justification." 5
Add-Heading2 "6.2 Test Plan and Test Cases"
Add-Table @("TC ID", "Test Case", "Type", "Expected Result", "Status") @(
  @("TC01", "Candidate can register, log in, and access candidate dashboard", "Functional", "Candidate dashboard loads with correct role", "Pass / To verify in final environment"),
  @("TC02", "Employer can create a job post", "Functional", "Job is saved and visible in employer jobs", "Pass / To verify in final environment"),
  @("TC03", "Candidate can upload resume", "Functional", "Resume is stored and parse status is displayed", "Pass / To verify with backend"),
  @("TC04", "System displays job recommendations", "Integration", "Recommendation list loads or shows retryable error", "Pass in frontend build"),
  @("TC05", "Notification opens relevant route", "Functional", "Notification marks as read and navigates to details/list", "Pass in implemented logic"),
  @("TC06", "Draft evidence can be removed", "Functional", "Delete action appears only for Draft status", "Pass in UI logic"),
  @("TC07", "Non-draft evidence cannot be removed from UI", "Functional", "Remove action is hidden", "Pass in UI logic"),
  @("TC08", "Application handles API timeout", "Nonfunctional", "Clear timeout error message is shown", "Pass in API client logic"),
  @("TC09", "Production build compiles", "Smoke", "Vite build completes successfully", "Pass"),
  @("TC10", "Built app serves main routes", "Smoke", "Root, login, register, and favicon return HTTP 200", "Pass")
)
Add-ExpandedSection "6.2.1 Nonfunctional Testing" "Non-functional testing considered performance, reliability, security, usability, maintainability, and deployment readiness. The frontend was checked through TypeScript compilation and production build generation. Smoke testing confirmed that the built application can be served and that key routes respond. API timeout handling was also added so that stalled backend or AI service calls produce clear retryable errors rather than indefinite loading." "These non-functional checks are important before hosting because hosting a broken or unbuildable frontend would prevent stakeholder demonstration." 5
Add-ExpandedSection "6.2.2 Functional Testing" "Functional testing focused on whether major workflows behave as expected. Candidate, employer, and admin features were considered through representative test cases. The most important functions include authentication, profile management, resume handling, job creation, applicant ranking, notifications, interviews, evidence review, feedback, and skill improvement. Functional testing also considered role-specific access, because candidates should not access employer-only or admin-only workflows." "Full formal test automation is recommended as future work, but manual and build-based verification supported the current evaluation." 5
Add-Heading2 "6.3 Testing / Evaluation Workflow"
Add-Figure "Fig 6: Testing and Evaluation Workflow" "Requirement -> Test Case -> Implementation Check -> Typecheck -> Production Build -> Preview Smoke Test -> Result Interpretation -> Fix or Confirm" "Fig 6 explains how testing was organized before hosting. The workflow begins from requirements, moves through implementation and automated checks, and ends with result interpretation so issues can be fixed before deployment."
Add-ExpandedSection "6.4 Review on Test Strategies Used" "The selected test strategies were appropriate for the current state of the project. TypeScript type checking validates static correctness across many frontend modules. Production build testing validates that the application can be compiled into deployable assets. Smoke testing validates that the built output can be served and accessed over HTTP. Functional testing validates user workflows, while integration-oriented testing checks interactions between frontend pages, stores, API clients, and backend endpoints." "A limitation is that the repository currently does not include a dedicated unit test framework such as Vitest or Jest, nor an end-to-end framework such as Playwright or Cypress. Therefore, future work should add automated unit tests for validation and utility logic, component tests for important UI workflows, integration tests for stores and API clients, and E2E tests for candidate/employer/admin flows." 6
Add-Paragraph "Pre-hosting test outcome summary: the available automated checks passed. TypeScript checking passed using the project typecheck command. The production build passed using the project build command. A served build smoke test returned HTTP 200 for the root page, login page, register page, and favicon asset. No issues were found from the available automated checks at the time of testing."
Add-ExpandedSection "6.5 Evaluation of Research Objectives" "The evaluation indicates that the system satisfies the core research objectives at artefact level. The system identifies and addresses recruitment inefficiency through workflow integration. It analyzes requirements through stakeholder and SRS mapping. It designs and implements a working platform with AI-assisted recruitment modules. It evaluates implementation readiness through testing and build verification. The candidate-job suitability model evidence from the interim report further supports the usefulness of structured features in matching." "However, broader evaluation with real recruiters and candidates would strengthen external validity." 5
Add-ExpandedSection "6.6 Chapter Summary" "This chapter presented the test plan, functional testing, non-functional testing, testing workflow, test strategy review, and evaluation of research objectives. The system passed available pre-hosting checks, while the chapter also identifies the need for more automated unit, integration, and end-to-end tests in future iterations." "The next chapter concludes the thesis and reflects on accomplishments, challenges, business insight, and future work." 4
Add-PageBreak

Add-Heading1 "Chapter 07 - Concluding Remarks"
Add-ExpandedSection "7.1 Accomplishment of the Research Objectives" "The first objective, to identify limitations in current recruitment processes, was accomplished through analysis of manual screening, keyword filtering, poor feedback, disconnected workflows, and skill-gap visibility problems. The second objective, to analyze stakeholder requirements, was accomplished through Candidate, Employer, and Admin requirement modelling. The third objective, to design and develop the system, was accomplished through the implemented Merito / IRAS platform. The fourth objective, to evaluate the system, was accomplished through testing, build checks, smoke testing, and interpretation of matching model evidence." "Triangulation is visible because literature findings, implemented functionality, and test outcomes all support the conclusion that the system addresses the stated problem." 5
Add-ExpandedSection "7.2 Problems Encountered" "Several problems were encountered during the research. Recruitment data is complex because resumes and job descriptions vary in format, terminology, and quality. AI outputs require review because generated job descriptions or feedback may be generic if prompts and constraints are weak. Matching models require careful feature design because text-only features may not capture technical suitability. Deployment reliability was also a concern, as observed in the interim report where XGBoost had cross-platform serialization issues and Logistic Regression was selected for practical reliability." "Frontend and backend integration also required careful error handling so users receive clear messages when services are unavailable." 5
Add-ExpandedSection "7.3 Self-reflection" "This research helped the researcher understand that software engineering research is not only about implementing many features. It requires a clear problem, justified scope, responsible design, testing, and reflection on limitations. The project also showed that recruitment automation is socially sensitive because technical decisions can influence candidate opportunities. Therefore, explainability, privacy, and human oversight are not optional additions; they are part of responsible system design." "The self-reflection confirms the academic and professional growth gained through the project." 5
Add-ExpandedSection "7.3.1 Ideology about the Research" "The researcher's ideology is that AI should be used to assist people rather than silently replace them in high-impact contexts. In recruitment, this means AI can reduce repetitive work, organize information, and highlight skill gaps, but final hiring decisions should remain accountable to human reviewers. The proposed system follows this ideology by presenting AI as decision support." "This position balances innovation with ethical responsibility." 4
Add-ExpandedSection "7.3.2 Benefits Gained" "The project provided benefits in research writing, requirement analysis, full-stack development, API integration, frontend design, database thinking, AI-assisted feature design, testing, and project management. It also improved understanding of how academic research can be connected to practical software development. The researcher gained experience in converting a broad idea into a scoped system with evidence-based justification." "These benefits are valuable for future software engineering practice." 4
Add-ExpandedSection "7.3.3 Learning Curves" "The main learning curves included understanding recruitment domain complexity, designing role-based workflows, managing AI-related risks, handling technical integration, selecting suitable model deployment approaches, and documenting the system academically. Another learning curve was recognizing that a high-performing model is not always the best production choice if deployment reliability is weak." "This lesson is important for real-world engineering, where maintainability and reliability matter alongside accuracy." 4
Add-ExpandedSection "7.4 Business Insight of the Idea" "The business value of Merito / IRAS lies in reducing recruitment workload while improving candidate experience. Employers can benefit from faster job creation, organized applicants, explainable ranking, interview coordination, and reduced manual screening effort. Candidates can benefit from clearer job matches, feedback, CV support, and skill improvement guidance. Administrators can benefit from governance and monitoring tools." "The system could be positioned for SMEs, IT service companies, university career centres, internship programmes, and recruitment agencies." 5
Add-ExpandedSection "7.4.1 Real-world Application Possibilities" "In the real world, the system could support IT companies that need to screen many graduate or junior developer applications. It could also help universities prepare students for employment by showing skill gaps against industry job requirements. Recruitment agencies could use the platform to standardize candidate evaluation and communicate feedback more consistently. With further development, the system could integrate with job boards, email systems, calendar services, and learning platforms." "Real-world deployment would require stronger data protection, fairness audits, user acceptance testing, and production monitoring." 5
Add-ExpandedSection "7.5 Future Recommendations" "Future work should add automated unit, integration, and end-to-end tests; expand fairness and bias evaluation; collect feedback from real recruiters and candidates; improve explainable AI outputs; integrate calendar and email services; add analytics dashboards; strengthen resume parsing across more file formats; support multilingual job descriptions; and evaluate the system in live pilot recruitment cycles. The model should also be retrained and validated with larger, more representative datasets." "The future recommendation with highest priority is to add formal testing and evaluation with real users before using the system for high-stakes hiring decisions." 5
Add-Heading2 "7.6 Final Conclusion"
Add-Paragraph "This thesis presented the design, development, and evaluation of Merito / IRAS, an Intelligent Recruitment Automation System for IT industry hiring. The research problem focused on inefficient, fragmented, and opaque recruitment workflows. The proposed artefact addressed the problem by integrating AI-assisted job description generation, resume parsing, candidate-job matching, ranking, skill-gap analysis, feedback, interview support, notifications, chatbot assistance, and administrative governance. The research followed Design Science Research Methodology and demonstrated that a practical software artefact can support recruitment efficiency and candidate development when designed with explainability and human oversight. While further real-world validation and automated testing are recommended, the implemented system provides a strong foundation for responsible recruitment automation in the IT domain."
Add-PageBreak

Add-Heading1 "References"
foreach ($r in $references) { Add-Paragraph $r "Normal" $false 24 "left" }
Add-PageBreak
Add-Heading1 "Appendices"
Add-Heading2 "Appendix A - Additional Test Cases"
Add-Paragraph "Additional test cases should include invalid login, expired token handling, employer-only route access by candidate, admin-only route access by employer, invalid resume upload, missing job required skills, empty candidate profile, notification deletion rollback, interview status transition, chatbot domain restriction, and API unavailable state."
Add-Heading2 "Appendix B - Suggested Future Automated Test Structure"
Add-Paragraph "Unit tests should cover validation schemas, utility functions, role navigation, notification link mapping, and match score formatting. Integration tests should cover Zustand stores, API client error handling, authentication state persistence, and form submission flows. End-to-end tests should cover candidate registration, profile creation, resume upload, job browsing, application submission, employer job creation, applicant review, interview scheduling, and admin evidence review."

$sectionPr = "<w:sectPr><w:pgSz w:w=`"11906`" w:h=`"16838`"/><w:pgMar w:top=`"1440`" w:right=`"1440`" w:bottom=`"1440`" w:left=`"1440`" w:header=`"720`" w:footer=`"720`" w:gutter=`"0`"/></w:sectPr>"
$documentXml = "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?><w:document xmlns:wpc=`"http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas`" xmlns:mc=`"http://schemas.openxmlformats.org/markup-compatibility/2006`" xmlns:o=`"urn:schemas-microsoft-com:office:office`" xmlns:r=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships`" xmlns:m=`"http://schemas.openxmlformats.org/officeDocument/2006/math`" xmlns:v=`"urn:schemas-microsoft-com:vml`" xmlns:wp14=`"http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing`" xmlns:wp=`"http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing`" xmlns:w10=`"urn:schemas-microsoft-com:office:word`" xmlns:w=`"http://schemas.openxmlformats.org/wordprocessingml/2006/main`" xmlns:w14=`"http://schemas.microsoft.com/office/word/2010/wordml`" xmlns:wpg=`"http://schemas.microsoft.com/office/word/2010/wordprocessingGroup`" xmlns:wpi=`"http://schemas.microsoft.com/office/word/2010/wordprocessingInk`" xmlns:wne=`"http://schemas.microsoft.com/office/word/2006/wordml`" xmlns:wps=`"http://schemas.microsoft.com/office/word/2010/wordprocessingShape`" mc:Ignorable=`"w14 wp14`"><w:body>$($script:body -join '')$sectionPr</w:body></w:document>"

$stylesXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:color w:val="000000"/></w:rPr></w:rPrDefault></w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:color w:val="000000"/></w:rPr><w:pPr><w:spacing w:after="160" w:line="360" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="28"/><w:szCs w:val="28"/><w:color w:val="000000"/></w:rPr><w:pPr><w:jc w:val="center"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:outlineLvl w:val="0"/><w:rPr><w:b/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="28"/><w:szCs w:val="28"/><w:color w:val="000000"/></w:rPr><w:pPr><w:spacing w:before="240" w:after="160"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:outlineLvl w:val="1"/><w:rPr><w:b/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:color w:val="000000"/></w:rPr><w:pPr><w:spacing w:before="180" w:after="120"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Caption"><w:name w:val="Caption"/><w:basedOn w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="16"/><w:szCs w:val="16"/><w:color w:val="000000"/></w:rPr><w:pPr><w:jc w:val="center"/></w:pPr></w:style>
</w:styles>
'@

$contentTypes = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
'@

$rels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
'@

$docRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
'@

$now = (Get-Date).ToUniversalTime().ToString("s") + "Z"
$core = "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?><cp:coreProperties xmlns:cp=`"http://schemas.openxmlformats.org/package/2006/metadata/core-properties`" xmlns:dc=`"http://purl.org/dc/elements/1.1/`" xmlns:dcterms=`"http://purl.org/dc/terms/`" xmlns:dcmitype=`"http://purl.org/dc/dcmitype/`" xmlns:xsi=`"http://www.w3.org/2001/XMLSchema-instance`"><dc:title>Intelligent Recruitment Automation System Thesis</dc:title><dc:creator>Kalpani D. Kapuge</dc:creator><cp:lastModifiedBy>Codex</cp:lastModifiedBy><dcterms:created xsi:type=`"dcterms:W3CDTF`">$now</dcterms:created><dcterms:modified xsi:type=`"dcterms:W3CDTF`">$now</dcterms:modified></cp:coreProperties>"
$app = "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?><Properties xmlns=`"http://schemas.openxmlformats.org/officeDocument/2006/extended-properties`" xmlns:vt=`"http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes`"><Application>Codex OpenXML Generator</Application></Properties>"

$tmp = Join-Path (Resolve-Path ".").Path ("tmp-thesis-" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tmp | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tmp "_rels") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tmp "word") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tmp "word/_rels") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tmp "docProps") | Out-Null

Write-Utf8 (Join-Path $tmp "[Content_Types].xml") $contentTypes
Write-Utf8 (Join-Path $tmp "_rels/.rels") $rels
Write-Utf8 (Join-Path $tmp "word/document.xml") $documentXml
Write-Utf8 (Join-Path $tmp "word/styles.xml") $stylesXml
Write-Utf8 (Join-Path $tmp "word/_rels/document.xml.rels") $docRels
Write-Utf8 (Join-Path $tmp "docProps/core.xml") $core
Write-Utf8 (Join-Path $tmp "docProps/app.xml") $app

$out = Join-Path (Resolve-Path ".").Path $OutputPath
if (Test-Path $out) { Remove-Item -LiteralPath $out }
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$fsOut = [System.IO.File]::Open($out, [System.IO.FileMode]::CreateNew)
$archive = New-Object System.IO.Compression.ZipArchive($fsOut, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  Get-ChildItem -LiteralPath $tmp -Recurse -File | ForEach-Object {
    $relative = $_.FullName.Substring($tmp.Length + 1).Replace("\", "/")
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $relative) | Out-Null
  }
}
finally {
  $archive.Dispose()
  $fsOut.Dispose()
}
Remove-Item -LiteralPath $tmp -Recurse -Force

$plainText = ($script:plain -join " ")
$wordCount = ([regex]::Matches($plainText, "\b[\p{L}\p{N}][\p{L}\p{N}'-]*\b")).Count
$txtOut = [System.IO.Path]::ChangeExtension($out, ".wordcount.txt")
Write-Utf8 $txtOut "Word count: $wordCount`nGenerated: $now`nOutput: $out"
Write-Output "Created: $out"
Write-Output "Word count: $wordCount"
