export type BusinessStage = "idea" | "launch" | "growth" | "scale";

export type BusinessType =
  | "services"
  | "ecommerce"
  | "saas"
  | "local"
  | "agency"
  | "other";

export type TeamSize =
  | "solo"
  | "2-10"
  | "11-25"
  | "26-50"
  | "51+";

export type RevenueBand =
  | "pre-revenue"
  | "0-100k"
  | "100k-500k"
  | "500k-2m"
  | "2m+";

export type SectionId =
  | "strategy"
  | "marketing"
  | "sales"
  | "operations"
  | "finance"
  | "people"
  | "technology";

export type ImpactLevel = "low" | "medium" | "high";
export type EffortLevel = "low" | "medium" | "high";
export type Timeframe = "1 day" | "1 week" | "2 weeks" | "30 days" | "60 days" | "90 days";

export interface BusinessProfile {
  stage: BusinessStage;
  businessType: BusinessType;
  teamSize: TeamSize;
  revenueBand: RevenueBand;
}

export interface ContactInfo {
  name: string;
  email: string;
  company?: string;
}

export interface QuestionOption {
  value: number;
  label: string;
  description: string;
}

export interface QuestionDefinition {
  id: string;
  section: SectionId;
  prompt: string;
  helpText: string;
  weight: number;
  stageRelevance?: Partial<Record<BusinessStage, number>>;
  recommendedFor?: BusinessType[];
  options: readonly QuestionOption[];
}

export interface SectionScore {
  section: SectionId;
  score: number;
  label: "fragile" | "developing" | "stable" | "advantaged";
  summary: string;
}

export interface RoadmapItem {
  id: string;
  section: SectionId;
  title: string;
  rationale: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  timeframe: Timeframe;
  order: number;
}

export interface DiagnosticSummary {
  overallScore: number;
  overallLabel: "fragile" | "developing" | "stable" | "advantaged";
  sectionScores: SectionScore[];
  topStrengths: string[];
  topRisks: string[];
  roadmap: RoadmapItem[];
}

export interface SubmissionPayload {
  profile: BusinessProfile;
  responses: Record<string, number>;
}

export interface SubmissionRecord {
  id: string;
  createdAt: string;
  profile: BusinessProfile;
  responses: Record<string, number>;
  summary: DiagnosticSummary;
  reportHtml?: string;
  reportText?: string;
  pdfUrl?: string;
  emailStatus: "not_requested" | "queued" | "sent" | "failed";
  contact?: ContactInfo;
}
