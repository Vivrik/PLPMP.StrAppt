import { questionBank } from "@/lib/questions";
import {
  DiagnosticSummary,
  SectionId,
  SectionScore,
  SubmissionPayload
} from "@/lib/types";
import { buildRoadmap } from "@/lib/reporting/recommendations";

const sectionCopy: Record<SectionId, string[]> = {
  strategy: [
    "Strategic focus is drifting, which makes prioritization harder.",
    "Strategy exists but still needs sharper decision criteria.",
    "Strategy is solid enough to guide tradeoffs and near-term bets.",
    "Strategy is acting like a competitive advantage."
  ],
  marketing: [
    "Demand creation is inconsistent and likely too founder-dependent.",
    "Marketing has traction, but repeatability is still forming.",
    "Marketing can support growth with clearer optimization loops.",
    "Marketing appears differentiated and measurable."
  ],
  sales: [
    "Revenue conversion relies on improvisation more than process.",
    "Sales motion works in places but needs tighter consistency.",
    "Sales is reliable and should scale with focused improvements.",
    "Sales is converting with strong structure and confidence."
  ],
  operations: [
    "Delivery and execution are exposing avoidable friction.",
    "Operations are functional, but bottlenecks will emerge under growth.",
    "Operations are stable and increasingly manageable.",
    "Operations are a source of speed and customer trust."
  ],
  finance: [
    "Financial visibility is too weak for confident decision-making.",
    "Finance is serviceable, but blind spots remain.",
    "Finance gives useful guidance for planning and tradeoffs.",
    "Finance is actively strengthening strategic decisions."
  ],
  people: [
    "Team structure is likely creating avoidable confusion or drag.",
    "People systems are emerging but not yet dependable.",
    "Team clarity supports healthy execution.",
    "People and management systems are an organizational asset."
  ],
  technology: [
    "Tooling and data are slowing the business down.",
    "Technology supports core work but leaves efficiency on the table.",
    "Systems are reliable enough to enable better execution.",
    "Technology is improving speed, visibility, and leverage."
  ]
};

function labelForScore(score: number): SectionScore["label"] {
  if (score < 45) return "fragile";
  if (score < 65) return "developing";
  if (score < 82) return "stable";
  return "advantaged";
}

function normalizedWeight(questionId: string, payload: SubmissionPayload): number {
  const question = questionBank.find((item) => item.id === questionId);

  if (!question) return 1;

  const stageMultiplier = question.stageRelevance?.[payload.profile.stage] ?? 1;
  const typeMultiplier = question.recommendedFor?.includes(payload.profile.businessType)
    ? 1.1
    : 1;

  return question.weight * stageMultiplier * typeMultiplier;
}

function summarizeSection(section: SectionId, score: number): SectionScore["summary"] {
  const variants = sectionCopy[section];

  if (score < 45) return variants[0];
  if (score < 65) return variants[1];
  if (score < 82) return variants[2];
  return variants[3];
}

export function scoreDiagnostic(payload: SubmissionPayload): DiagnosticSummary {
  const totals = new Map<SectionId, { weightedScore: number; weightedMax: number }>();

  for (const question of questionBank) {
    const answer = payload.responses[question.id] ?? 0;
    const weight = normalizedWeight(question.id, payload);
    const current = totals.get(question.section) ?? { weightedScore: 0, weightedMax: 0 };

    current.weightedScore += answer * weight;
    current.weightedMax += 5 * weight;
    totals.set(question.section, current);
  }

  const sectionScores = Array.from(totals.entries()).map(([section, current]) => {
    const score = Math.round((current.weightedScore / current.weightedMax) * 100);

    return {
      section,
      score,
      label: labelForScore(score),
      summary: summarizeSection(section, score)
    };
  });

  const overallScore = Math.round(
    sectionScores.reduce((sum, section) => sum + section.score, 0) / sectionScores.length
  );

  const sortedSections = [...sectionScores].sort((left, right) => right.score - left.score);
  const topStrengths = sortedSections.slice(0, 3).map((section) => {
    return `${capitalize(section.section)}: ${section.summary}`;
  });
  const topRisks = sortedSections
    .slice(-3)
    .reverse()
    .map((section) => `${capitalize(section.section)}: ${section.summary}`);

  return {
    overallScore,
    overallLabel: labelForScore(overallScore),
    sectionScores,
    topStrengths,
    topRisks,
    roadmap: buildRoadmap(payload, sectionScores)
  };
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
