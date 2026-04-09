import { QuestionDefinition } from "@/lib/types";

const scaleOptions = [
  {
    value: 1,
    label: "Not in place",
    description: "This area is mostly reactive or undocumented."
  },
  {
    value: 2,
    label: "Inconsistent",
    description: "Some effort exists, but it depends on heroics."
  },
  {
    value: 3,
    label: "Functional",
    description: "The basics are present and usable."
  },
  {
    value: 4,
    label: "Strong",
    description: "This area is dependable and supports growth."
  },
  {
    value: 5,
    label: "Best-in-class",
    description: "This capability is a strategic advantage."
  }
] as const;

export const questionBank: QuestionDefinition[] = [
  {
    id: "strategy-positioning",
    section: "strategy",
    prompt: "How clearly is your market positioning defined?",
    helpText: "Consider your target customer, niche, and what makes you distinct.",
    weight: 1.2,
    stageRelevance: { idea: 1.3, launch: 1.2 },
    options: scaleOptions
  },
  {
    id: "strategy-goals",
    section: "strategy",
    prompt: "How aligned is your team around measurable business goals?",
    helpText: "Think about quarterly priorities, KPIs, and decision clarity.",
    weight: 1.1,
    stageRelevance: { growth: 1.2, scale: 1.3 },
    options: scaleOptions
  },
  {
    id: "marketing-demand",
    section: "marketing",
    prompt: "How predictable is your lead or demand generation?",
    helpText: "Evaluate channel consistency, messaging fit, and campaign visibility.",
    weight: 1.2,
    stageRelevance: { launch: 1.2, growth: 1.25 },
    options: scaleOptions
  },
  {
    id: "marketing-brand",
    section: "marketing",
    prompt: "How well does your brand story build trust with buyers?",
    helpText: "Review website clarity, credibility, and proof points.",
    weight: 1,
    options: scaleOptions
  },
  {
    id: "sales-process",
    section: "sales",
    prompt: "How repeatable is your sales process from lead to close?",
    helpText: "Look at qualification, pipeline stages, and follow-up discipline.",
    weight: 1.15,
    stageRelevance: { growth: 1.25, scale: 1.2 },
    options: scaleOptions
  },
  {
    id: "sales-pricing",
    section: "sales",
    prompt: "How confident are you in your pricing and offer structure?",
    helpText: "Consider margins, objection handling, and conversion confidence.",
    weight: 1.05,
    recommendedFor: ["services", "agency", "saas"],
    options: scaleOptions
  },
  {
    id: "operations-delivery",
    section: "operations",
    prompt: "How standardized is the way you deliver products or services?",
    helpText: "Assess SOPs, quality control, and handoff consistency.",
    weight: 1.2,
    stageRelevance: { growth: 1.2, scale: 1.3 },
    options: scaleOptions
  },
  {
    id: "operations-bottlenecks",
    section: "operations",
    prompt: "How visible are operational bottlenecks and capacity risks?",
    helpText: "Think about workload planning, cycle time, and resource constraints.",
    weight: 1.1,
    options: scaleOptions
  },
  {
    id: "finance-visibility",
    section: "finance",
    prompt: "How current and actionable is your financial visibility?",
    helpText: "Review cash flow, profitability reporting, and forecast cadence.",
    weight: 1.25,
    stageRelevance: { launch: 1.15, growth: 1.2, scale: 1.2 },
    options: scaleOptions
  },
  {
    id: "finance-unit-economics",
    section: "finance",
    prompt: "How well do you understand the economics of acquiring and serving customers?",
    helpText: "Consider CAC, gross margin, fulfillment cost, and payback.",
    weight: 1.1,
    recommendedFor: ["ecommerce", "saas", "services"],
    options: scaleOptions
  },
  {
    id: "people-role-clarity",
    section: "people",
    prompt: "How clear are roles, ownership, and accountability across the team?",
    helpText: "Evaluate decision rights, role clarity, and management cadence.",
    weight: 1.15,
    stageRelevance: { growth: 1.2, scale: 1.25 },
    options: scaleOptions
  },
  {
    id: "people-hiring",
    section: "people",
    prompt: "How prepared are you to hire, onboard, and retain strong talent?",
    helpText: "Look at job scorecards, onboarding, and culture signals.",
    weight: 1,
    stageRelevance: { growth: 1.2, scale: 1.2 },
    options: scaleOptions
  },
  {
    id: "technology-tooling",
    section: "technology",
    prompt: "How well do your systems and tools support efficient execution?",
    helpText: "Review CRM, project management, automation, and data visibility.",
    weight: 1.15,
    stageRelevance: { scale: 1.2 },
    options: scaleOptions
  },
  {
    id: "technology-data",
    section: "technology",
    prompt: "How easy is it to get reliable business data when you need it?",
    helpText: "Think about dashboards, integrations, and reporting accuracy.",
    weight: 1.1,
    options: scaleOptions
  }
];
