import type { SkillImprovementPlanDto } from "./types";

const key = (candidateId: number) => `local-skill-plans:${candidateId}`;

function read(candidateId: number): SkillImprovementPlanDto[] {
  try {
    const raw = localStorage.getItem(key(candidateId));
    return raw ? (JSON.parse(raw) as SkillImprovementPlanDto[]) : [];
  } catch {
    return [];
  }
}

function write(candidateId: number, plans: SkillImprovementPlanDto[]) {
  localStorage.setItem(key(candidateId), JSON.stringify(plans));
}

export function getLocalSkillPlans(candidateId: number) {
  return read(candidateId);
}

export function getLocalSkillPlan(candidateId: number, planId: number) {
  return read(candidateId).find((plan) => plan.planId === planId) ?? null;
}

export function saveLocalSkillPlan(candidateId: number, plan: SkillImprovementPlanDto) {
  const existing = read(candidateId).filter(
    (item) => !(item.skillId === plan.skillId && (item.jobId ?? null) === (plan.jobId ?? null)),
  );
  write(candidateId, [plan, ...existing]);
  return plan;
}

export function updateLocalSkillPlan(candidateId: number, plan: SkillImprovementPlanDto) {
  write(
    candidateId,
    read(candidateId).map((item) => (item.planId === plan.planId ? plan : item)),
  );
  return plan;
}

export function removeLocalSkillPlan(candidateId: number, skillId: number) {
  write(
    candidateId,
    read(candidateId).filter((plan) => plan.skillId !== skillId),
  );
}

export function buildLocalSkillPlan(params: {
  skillId: number;
  skillName: string;
  jobId?: number;
  jobTitle?: string | null;
  suggestion?: string | null;
}): SkillImprovementPlanDto {
  const { skillId, skillName, jobId, jobTitle, suggestion } = params;
  const planId = -Date.now();
  const createdAt = new Date().toISOString();

  return {
    planId,
    skillId,
    skillName,
    jobId: jobId ?? null,
    jobTitle: jobTitle ?? null,
    priority: "High",
    targetLevel: "JobReady",
    estimatedDays: 14,
    overview: `Build job-ready confidence in ${skillName} through focused practice, a small portfolio task, and evidence you can show during applications or interviews.`,
    gapReason: suggestion || `${skillName} was identified as a skill gap for a role you are interested in.`,
    projectTitle: `${skillName} Mini Project`,
    projectTask: `Create a small practical project that uses ${skillName} in a realistic ${jobTitle ?? "work"} scenario. Keep the code, notes, or screenshots ready as evidence.`,
    projectExpectedOutput: `A working example, short README, and proof that demonstrates how you applied ${skillName}.`,
    status: "NotStarted",
    generatedBy: "Fallback",
    createdAt,
    progressPercent: 0,
    steps: [
      {
        stepId: planId - 1,
        stepOrder: 1,
        title: `Review ${skillName} fundamentals`,
        description: `Refresh the key concepts, terms, and common use cases for ${skillName}.`,
        activity: "Study documentation, tutorials, or course notes for 45-60 minutes.",
        output: "A short note list of the most important concepts.",
        isCompleted: false,
        completedAt: null,
      },
      {
        stepId: planId - 2,
        stepOrder: 2,
        title: "Practice with small exercises",
        description: `Complete hands-on exercises that apply ${skillName} to real tasks.`,
        activity: "Build 3-5 focused examples and test each one.",
        output: "Exercise files or screenshots showing completed practice.",
        isCompleted: false,
        completedAt: null,
      },
      {
        stepId: planId - 3,
        stepOrder: 3,
        title: "Build a portfolio-ready mini project",
        description: `Use ${skillName} in a realistic feature related to ${jobTitle ?? "your target role"}.`,
        activity: "Create the project, document setup steps, and add a short explanation of decisions.",
        output: "A GitHub repository, demo link, or documented project folder.",
        isCompleted: false,
        completedAt: null,
      },
      {
        stepId: planId - 4,
        stepOrder: 4,
        title: "Prepare interview proof",
        description: `Turn your work into clear evidence that explains your ${skillName} ability.`,
        activity: "Write 4-5 bullet points about what you built, problems solved, and tradeoffs.",
        output: "Resume bullets or interview notes ready to reuse.",
        isCompleted: false,
        completedAt: null,
      },
    ],
    evidence: [],
  };
}
