import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
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

const memoryStore = new Map<string, SubmissionRecord>();

function useMemoryStore(): boolean {
  return process.env.USE_IN_MEMORY_STORE === "true" || !process.env.DATABASE_URL;
}

function serializeRecord(record: SubmissionRecord): SubmissionRecord {
  return {
    ...record,
    createdAt: new Date(record.createdAt).toISOString()
  };
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

  const created = await prisma.submission.create({
    data: {
      id,
      profile: payload.profile as never,
      responses: payload.responses as never,
      overallScore: summary.overallScore,
      overallLabel: parseOverallLabel(summary.overallLabel) as never,
      topStrengths: summary.topStrengths,
      topRisks: summary.topRisks,
      sectionScores: parseSectionScores(summary.sectionScores) as never,
      roadmap: parseRoadmap(summary.roadmap) as never,
      emailStatus: "NOT_REQUESTED"
    }
  });

  const profile = parseProfile(created.profile);
  const responses = parseResponses(created.responses);

  return serializeRecord({
    id: created.id,
    createdAt: created.createdAt.toISOString(),
    profile,
    responses,
    summary,
    emailStatus: "not_requested"
  });
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

  const updated = await prisma.submission.update({
    where: { id },
    data: {
      contactName: contact.name,
      contactEmail: contact.email,
      contactCompany: contact.company,
      reportHtml: report.reportHtml,
      reportText: report.reportText,
      pdfUrl: report.pdfUrl,
      emailStatus: report.emailStatus.toUpperCase() as never
    }
  });

  const profile = parseProfile(updated.profile);
  const responses = parseResponses(updated.responses);

  return serializeRecord({
    id: updated.id,
    createdAt: updated.createdAt.toISOString(),
    profile,
    responses,
    summary: {
      overallScore: updated.overallScore,
      overallLabel: parseOverallLabel(updated.overallLabel),
      topStrengths: updated.topStrengths,
      topRisks: updated.topRisks,
      sectionScores: parseSectionScores(updated.sectionScores),
      roadmap: parseRoadmap(updated.roadmap)
    },
    reportHtml: updated.reportHtml ?? undefined,
    reportText: updated.reportText ?? undefined,
    pdfUrl: updated.pdfUrl ?? undefined,
    emailStatus: parseEmailStatusFromDB(updated.emailStatus),
    contact
  });
}

export async function getSubmission(id: string): Promise<SubmissionRecord | null> {
  if (useMemoryStore()) {
    return memoryStore.get(id) ?? null;
  }

  const found = await prisma.submission.findUnique({ where: { id } });

  if (!found) return null;

  const profile = parseProfile(found.profile);
  const responses = parseResponses(found.responses);

  return serializeRecord({
    id: found.id,
    createdAt: found.createdAt.toISOString(),
    profile,
    responses,
    summary: {
      overallScore: found.overallScore,
      overallLabel: parseOverallLabel(found.overallLabel),
      topStrengths: found.topStrengths,
      topRisks: found.topRisks,
      sectionScores: parseSectionScores(found.sectionScores),
      roadmap: parseRoadmap(found.roadmap)
    },
    reportHtml: found.reportHtml ?? undefined,
    reportText: found.reportText ?? undefined,
    pdfUrl: found.pdfUrl ?? undefined,
    emailStatus: parseEmailStatusFromDB(found.emailStatus),
    contact: found.contactEmail
      ? {
          name: found.contactName ?? "",
          email: found.contactEmail,
          company: found.contactCompany ?? undefined
        }
      : undefined
  });
}

export async function listSubmissions(): Promise<SubmissionRecord[]> {
  if (useMemoryStore()) {
    return Array.from(memoryStore.values()).sort((left, right) =>
      left.createdAt < right.createdAt ? 1 : -1
    );
  }

  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" }
  });

  return submissions.map((item) =>
    serializeRecord({
      id: item.id,
      createdAt: item.createdAt.toISOString(),
      profile: parseProfile(item.profile),
      responses: parseResponses(item.responses),
      summary: {
        overallScore: item.overallScore,
        overallLabel: parseOverallLabel(item.overallLabel),
        topStrengths: item.topStrengths,
        topRisks: item.topRisks,
        sectionScores: parseSectionScores(item.sectionScores),
        roadmap: parseRoadmap(item.roadmap)
      },
      reportHtml: item.reportHtml ?? undefined,
      reportText: item.reportText ?? undefined,
      pdfUrl: item.pdfUrl ?? undefined,
      emailStatus: parseEmailStatusFromDB(item.emailStatus),
      contact: item.contactEmail
        ? {
            name: item.contactName ?? "",
            email: item.contactEmail,
            company: item.contactCompany ?? undefined
          }
        : undefined
    })
  );
}
