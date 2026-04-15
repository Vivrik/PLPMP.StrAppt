import {
  RoadmapItem,
  SectionId,
  SectionScore,
  SubmissionPayload
} from "@/lib/types";

const playbook: Record<
  SectionId,
  {
    title: string;
    fragile: string;
    developing: string;
    stable: string;
    impact: RoadmapItem["impact"];
    effort: RoadmapItem["effort"];
  }
> = {
  strategy: {
    title: "Clarify strategic priorities",
    fragile:
      "Define your primary customer, value proposition, and 90-day strategic goals so decisions stop competing with each other.",
    developing:
      "Turn your current goals into a tighter strategy memo with measurable outcomes and clear tradeoff rules.",
    stable:
      "Pressure-test your plan against expansion bets, margin goals, and leadership alignment.",
    impact: "high",
    effort: "medium"
  },
  marketing: {
    title: "Build a reliable demand engine",
    fragile:
      "Choose one or two acquisition channels, tighten messaging, and establish a weekly campaign review rhythm.",
    developing:
      "Instrument channel performance and standardize your content or campaign operating cadence.",
    stable:
      "Optimize conversion from strongest channels and expand proof-based messaging.",
    impact: "high",
    effort: "medium"
  },
  sales: {
    title: "Standardize conversion and pricing",
    fragile:
      "Document your pipeline stages, qualification criteria, and follow-up sequence to reduce ad hoc selling.",
    developing:
      "Improve pipeline hygiene, proposal quality, and pricing confidence with a consistent review loop.",
    stable:
      "Increase win rate through better segmentation, pricing tests, and conversion analytics.",
    impact: "high",
    effort: "medium"
  },
  operations: {
    title: "Reduce delivery friction",
    fragile:
      "Create SOPs for core delivery, identify recurring bottlenecks, and assign ownership for quality control.",
    developing:
      "Track throughput, resourcing, and failure points so growth does not create delivery surprises.",
    stable:
      "Use workflow automation and clearer handoffs to increase margin and responsiveness.",
    impact: "high",
    effort: "high"
  },
  finance: {
    title: "Upgrade financial visibility",
    fragile:
      "Establish weekly cash visibility, monthly reporting, and a simple forecast tied to growth targets.",
    developing:
      "Tie margins, customer economics, and scenario planning into the leadership operating rhythm.",
    stable:
      "Use forward-looking forecasting and unit economics to guide investment decisions.",
    impact: "high",
    effort: "low"
  },
  people: {
    title: "Strengthen role clarity and management",
    fragile:
      "Clarify who owns what, reduce decision ambiguity, and create a basic operating cadence for accountability.",
    developing:
      "Add role scorecards, manager expectations, and onboarding consistency to support growth.",
    stable:
      "Invest in leadership development, succession depth, and hiring throughput.",
    impact: "medium",
    effort: "medium"
  },
  technology: {
    title: "Improve systems and data leverage",
    fragile:
      "Consolidate core tools, eliminate manual reporting, and define the few dashboards leaders need weekly.",
    developing:
      "Connect key systems so sales, delivery, and finance data are visible in one operating view.",
    stable:
      "Automate repetitive workflows and expand decision support reporting.",
    impact: "medium",
    effort: "medium"
  }
};

export function buildRoadmap(
  payload: SubmissionPayload,
  sectionScores: SectionScore[]
): RoadmapItem[] {
  const prioritized = [...sectionScores].sort((left, right) => left.score - right.score);
  const timeframes = [
    "1 day",
    "1 week",
    "2 weeks",
    "30 days",
    "60 days",
    "90 days"
  ] as const;

  const roadmap = prioritized.slice(0, 4).map((section, index) => {
    const template = playbook[section.section];
    const rationale =
      section.label === "fragile"
        ? template.fragile
        : section.label === "developing"
          ? template.developing
          : template.stable;

    return {
      id: `${section.section}-${index + 1}`,
      section: section.section,
      title: template.title,
      rationale: `${rationale} This matters especially for a ${payload.profile.stage}-stage ${payload.profile.businessType} business.`,
      impact: template.impact,
      effort: template.effort,
      timeframe: timeframes[index] as RoadmapItem["timeframe"],
      order: index + 1
    };
  });

  return roadmap;
}
