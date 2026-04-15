import crypto from "node:crypto";
import { supabase } from "@/lib/supabase";
import { ContactInfo, SubmissionPayload, SubmissionRecord } from "@/lib/types";
import { z } from "zod";

const BusinessProfileSchema = z.object({
  stage: z.enum(["idea", "launch", "growth", "scale"]),
  businessType: z.enum(["services", "ecommerce", "saas", "local", "agency", "other"]),
  teamSize: z.enum(["solo", "2-10", "11-25", "26-50", "51+"]),
  revenueBand: z.enum(["pre-revenue", "0-100k", "100k-500k", "500k-2m", "2m+"])
});

const ResponsesSchema = z.record(z.number());

function parseProfile(input: unknown): SubmissionRecord["profile"] {
  return BusinessProfileSchema.parse(input) as SubmissionRecord["profile"];
}

function parseResponses(input: unknown): SubmissionRecord["responses"] {
  return ResponsesSchema.parse(input) as SubmissionRecord["responses"];
}

const SectionScoreSchema = z.object({
  section: z.enum(["strategy", "marketing", "sales", "operations", "finance", "people", "technology"]),
  score: z.number(),
  label: z.enum(["fragile", "developing", "stable", "advantaged"]),
  summary: z.string()
});

const SectionScoresSchema = z.array(SectionScoreSchema);

const RoadmapItemSchema = z.object({
  id: z.string(),
  section: z.enum(["strategy", "marketing", "sales", "operations", "finance", "people", "technology"]),
  title: z.string(),
  rationale: z.string(),
  impact: z.enum(["low", "medium", "high"]),
  effort: z.enum(["low", "medium", "high"]),
  timeframe: z.enum(["1 day", "1 week", "2 weeks", "30 days", "60 days", "90 days"]),
  order: z.number()
});

const RoadmapSchema = z.array(RoadmapItemSchema);

function parseSectionScores(input: unknown): SubmissionRecord["summary"]["sectionScores"] {
  return SectionScoresSchema.parse(input) as SubmissionRecord["summary"]["sectionScores"];
}

function parseRoadmap(input: unknown): SubmissionRecord["summary"]["roadmap"] {
  return RoadmapSchema.parse(input) as SubmissionRecord["summary"]["roadmap"];
}

const OverallLabelSchema = z.enum(["fragile", "developing", "stable", "advantaged"]);
function parseOverallLabel(input: unknown): SubmissionRecord["summary"]["overallLabel"] {
  return OverallLabelSchema.parse(input) as SubmissionRecord["summary"]["overallLabel"];
}

const EmailStatusDBSchema = z.enum(["NOT_REQUESTED", "QUEUED", "SENT", "FAILED"]);
function parseEmailStatusFromDB(input: unknown): SubmissionRecord["emailStatus"] {
  const val = EmailStatusDBSchema.parse((input ?? "") as unknown);
  return val.toLowerCase() as SubmissionRecord["emailStatus"];
}

interface SubmissionRow {
  id: string;
  created_at: string;
  profile: unknown;
  responses: unknown;
  overall_score: number;
  overall_label: string;
  top_strengths: string[];
  top_risks: string[];
  section_scores: unknown;
  roadmap: unknown;
  contact_name: string | null;
  contact_email: string | null;
  contact_company: string | null;
  report_html: string | null;
  report_text: string | null;
  pdf_url: string | null;
  email_status: string;
}

function rowToRecord(row: SubmissionRow): SubmissionRecord {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    profile: parseProfile(row.profile),
    responses: parseResponses(row.responses),
    summary: {
      overallScore: row.overall_score,
      overallLabel: parseOverallLabel(row.overall_label),
      topStrengths: row.top_strengths,
      topRisks: row.top_risks,
      sectionScores: parseSectionScores(row.section_scores),
      roadmap: parseRoadmap(row.roadmap)
    },
    reportHtml: row.report_html ?? undefined,
    reportText: row.report_text ?? undefined,
    pdfUrl: row.pdf_url ?? undefined,
    emailStatus: parseEmailStatusFromDB(row.email_status),
    contact: row.contact_email
      ? {
          name: row.contact_name ?? "",
          email: row.contact_email,
          company: row.contact_company ?? undefined
        }
      : undefined
  };
}

const memoryStore = new Map<string, SubmissionRecord>();

function useMemoryStore(): boolean {
  return process.env.USE_IN_MEMORY_STORE === "true" || !process.env.SUPABASE_URL;
}

export async function createSubmission(
  payload: SubmissionPayload,
  summary: SubmissionRecord["summary"]
): Promise<SubmissionRecord> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  if (useMemoryStore()) {
    const record: SubmissionRecord = {
      id,
      createdAt,
      profile: payload.profile,
      responses: payload.responses,
      summary,
      emailStatus: "not_requested"
    };
    memoryStore.set(id, record);
    return record;
  }

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      id,
      profile: payload.profile,
      responses: payload.responses,
      overall_score: summary.overallScore,
      overall_label: parseOverallLabel(summary.overallLabel),
      top_strengths: summary.topStrengths,
      top_risks: summary.topRisks,
      section_scores: parseSectionScores(summary.sectionScores),
      roadmap: parseRoadmap(summary.roadmap),
      email_status: "NOT_REQUESTED"
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create submission: ${error.message}`);

  return rowToRecord(data as SubmissionRow);
}

export async function updateSubmissionContact(
  id: string,
  contact: ContactInfo,
  report: Pick<SubmissionRecord, "reportHtml" | "reportText" | "pdfUrl" | "emailStatus">
): Promise<SubmissionRecord | null> {
  if (useMemoryStore()) {
    const current = memoryStore.get(id);
    if (!current) return null;
    const updated: SubmissionRecord = { ...current, contact, ...report };
    memoryStore.set(id, updated);
    return updated;
  }

  const { data, error } = await supabase
    .from("submissions")
    .update({
      contact_name: contact.name,
      contact_email: contact.email,
      contact_company: contact.company,
      report_html: report.reportHtml,
      report_text: report.reportText,
      pdf_url: report.pdfUrl,
      email_status: report.emailStatus.toUpperCase()
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to update submission: ${error.message}`);
  }

  return rowToRecord(data as SubmissionRow);
}

export async function getSubmission(id: string): Promise<SubmissionRecord | null> {
  if (useMemoryStore()) {
    return memoryStore.get(id) ?? null;
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to get submission: ${error.message}`);
  }

  return rowToRecord(data as SubmissionRow);
}

export async function listSubmissions(): Promise<SubmissionRecord[]> {
  if (useMemoryStore()) {
    return Array.from(memoryStore.values()).sort((left, right) =>
      left.createdAt < right.createdAt ? 1 : -1
    );
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list submissions: ${error.message}`);

  return (data ?? []).map((row) => rowToRecord(row as SubmissionRow));
}
