import { NextResponse } from "next/server";
import { z } from "zod";
import { generatePolishedReport } from "@/lib/ai/report-generator";
import { deliverReportEmail } from "@/lib/email/mailer";
import { getSubmission, updateSubmissionContact } from "@/lib/repository";

const schema = z.object({
  submissionId: z.string().uuid(),
  contact: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    company: z.string().optional()
  })
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Report delivery payload is invalid.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const submission = await getSubmission(parsed.data.submissionId);

  if (!submission) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  const report = await generatePolishedReport(submission.summary, {
    ...submission,
    contact: parsed.data.contact
  });
  const pdfUrl = `/reports/${submission.id}.pdf`;

  const emailAttempt = await deliverReportEmail({
    ...submission,
    contact: parsed.data.contact,
    reportHtml: report.html,
    reportText: report.text,
    pdfUrl
  });

  const updated = await updateSubmissionContact(parsed.data.submissionId, parsed.data.contact, {
    reportHtml: report.html,
    reportText: report.text,
    pdfUrl,
    emailStatus: emailAttempt.status
  });

  return NextResponse.json({
    submission: updated,
    delivery: emailAttempt
  });
}
