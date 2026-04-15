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
      overallLabel: summary.overallLabel,
      topStrengths: summary.topStrengths,
      topRisks: summary.topRisks,
      sectionScores: summary.sectionScores as never,
      roadmap: summary.roadmap as never,
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
      overallLabel: updated.overallLabel as SubmissionRecord["summary"]["overallLabel"],
      topStrengths: updated.topStrengths,
      topRisks: updated.topRisks,
      sectionScores: updated.sectionScores as SubmissionRecord["summary"]["sectionScores"],
      roadmap: updated.roadmap as SubmissionRecord["summary"]["roadmap"]
    },
    reportHtml: updated.reportHtml ?? undefined,
    reportText: updated.reportText ?? undefined,
    pdfUrl: updated.pdfUrl ?? undefined,
    emailStatus: updated.emailStatus.toLowerCase() as SubmissionRecord["emailStatus"],
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
      overallLabel: found.overallLabel as SubmissionRecord["summary"]["overallLabel"],
      topStrengths: found.topStrengths,
      topRisks: found.topRisks,
      sectionScores: found.sectionScores as SubmissionRecord["summary"]["sectionScores"],
      roadmap: found.roadmap as SubmissionRecord["summary"]["roadmap"]
    },
    reportHtml: found.reportHtml ?? undefined,
    reportText: found.reportText ?? undefined,
    pdfUrl: found.pdfUrl ?? undefined,
    emailStatus: found.emailStatus.toLowerCase() as SubmissionRecord["emailStatus"],
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
        overallLabel: item.overallLabel as SubmissionRecord["summary"]["overallLabel"],
        topStrengths: item.topStrengths,
        topRisks: item.topRisks,
        sectionScores: item.sectionScores as SubmissionRecord["summary"]["sectionScores"],
        roadmap: item.roadmap as SubmissionRecord["summary"]["roadmap"]
      },
      reportHtml: item.reportHtml ?? undefined,
      reportText: item.reportText ?? undefined,
      pdfUrl: item.pdfUrl ?? undefined,
      emailStatus: item.emailStatus.toLowerCase() as SubmissionRecord["emailStatus"],
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
